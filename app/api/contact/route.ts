import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  /** Honeypot – must be empty; bots typically fill hidden fields. */
  website?: string;
}

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 5 submissions per IP per 15-minute window.
// Note: resets on server restart and does not coordinate across multiple
// instances; for multi-instance deployments a distributed cache is preferable.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const ipMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Purge entries whose window has fully expired to prevent unbounded growth.
  for (const [key, record] of ipMap) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
      ipMap.delete(key);
    }
  }

  const record = ipMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting --------------------------------------------------------
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body: ContactFormData = await request.json();

    // --- Honeypot check -------------------------------------------------------
    // Bots often fill every field including hidden ones; real users leave this blank.
    if (body.website) {
      // Return a fake success so bots don't know they were blocked.
      return NextResponse.json(
        { success: true, message: 'Message received successfully' },
        { status: 200 }
      );
    }

    // --- Server-side field validation -----------------------------------------
    const missingFields: string[] = [];
    if (!body.name?.trim()) missingFields.push('name');
    if (!body.email?.trim()) missingFields.push('email');
    if (!body.subject?.trim()) missingFields.push('subject');
    if (!body.message?.trim()) missingFields.push('message');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    if (body.name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or fewer' },
        { status: 400 }
      );
    }

    if (body.message.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Message must be 5,000 characters or fewer' },
        { status: 400 }
      );
    }

    // --- Email delivery (optional) -------------------------------------------
    // Set CONTACT_EMAIL_TO and configure a delivery provider in environment
    // variables to enable real email sending.  When the variables are absent
    // the submission is logged to stdout as a safe fallback.
    const emailTo = process.env.CONTACT_EMAIL_TO;
    if (emailTo) {
      // TODO: integrate a transactional email provider (e.g. Resend, SendGrid)
      // using process.env.EMAIL_API_KEY and send to emailTo.
    }

    console.log('📧 New contact form submission:', {
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { success: true, message: 'Message received successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
