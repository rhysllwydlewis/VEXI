import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import * as postmark from 'postmark';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  captchaToken?: string;
  /** Honeypot – must be empty; bots typically fill hidden fields. */
  website?: string;
}

interface AltchaPayload {
  algorithm?: string;
  challenge?: string;
  number?: number;
  salt?: string;
  signature?: string;
}

// ---------------------------------------------------------------------------
// In-memory rate limiter — max 5 submissions per IP per 15-minute window.
// Note: resets on server restart and does not coordinate across multiple
// instances; for multi-instance deployments a distributed cache is preferable.
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEV_FALLBACK_PARTS = ['vexi', 'local', 'altcha'];
const ALTCHA_ALGORITHM = 'SHA-256';
const ALTCHA_MAX_NUMBER = 100000;
const HEX_SHA_256_REGEX = /^[a-f0-9]{64}$/i;

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

function getCaptchaKey(): string | null {
  if (process.env.ALTCHA_HMAC_KEY) {
    return process.env.ALTCHA_HMAC_KEY;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_PARTS.join('-');
  }

  return null;
}

function decodeCaptchaPayload(token: string): AltchaPayload | null {
  try {
    const normalised = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
    const decoded = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(decoded) as AltchaPayload;
  } catch {
    return null;
  }
}

function createAltchaHash(salt: string, number: number): string {
  return createHash('sha256')
    .update(`${salt}${number}`)
    .digest('hex');
}

function signChallenge(challenge: string, captchaKey: string): string {
  return createHmac('sha256', captchaKey)
    .update(challenge)
    .digest('hex');
}

function safeCompareHex(a: string, b: string): boolean {
  if (!HEX_SHA_256_REGEX.test(a) || !HEX_SHA_256_REGEX.test(b)) {
    return false;
  }

  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');

  return left.length === right.length && timingSafeEqual(left, right);
}

async function verifyAltcha(token?: string): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: 'Please complete the verification challenge.' };
  }

  const captchaKey = getCaptchaKey();
  if (!captchaKey) {
    return { success: false, error: 'CAPTCHA verification not configured.' };
  }

  const payload = decodeCaptchaPayload(token);
  if (!payload) {
    return { success: false, error: 'CAPTCHA verification failed.' };
  }

  const algorithm = payload.algorithm?.toUpperCase();
  const { challenge, number, salt, signature } = payload;

  if (
    algorithm !== ALTCHA_ALGORITHM ||
    !challenge ||
    !salt ||
    !signature ||
    !Number.isInteger(number) ||
    number < 0 ||
    number > ALTCHA_MAX_NUMBER
  ) {
    return { success: false, error: 'CAPTCHA verification failed.' };
  }

  const expectedChallenge = createAltchaHash(salt, number);
  const expectedSignature = signChallenge(challenge, captchaKey);

  if (!safeCompareHex(challenge, expectedChallenge)) {
    return { success: false, error: 'CAPTCHA verification failed.' };
  }

  if (!safeCompareHex(signature, expectedSignature)) {
    return { success: false, error: 'CAPTCHA verification failed.' };
  }

  return { success: true };
}

// ---------------------------------------------------------------------------
// Postmark email delivery
// ---------------------------------------------------------------------------

/** Escapes HTML special characters to prevent injection in email bodies. */
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendViaPostmark(data: ContactFormData): Promise<void> {
  const token = process.env.POSTMARK_API_TOKEN;
  const emailTo = process.env.CONTACT_EMAIL_TO;
  const emailFrom = process.env.CONTACT_EMAIL_FROM;

  if (!token || !emailTo || !emailFrom) return; // fall through to console log

  const client = new postmark.ServerClient(token);

  const htmlBody = `
    <h2>New contact form submission</h2>
    <table cellpadding="6" style="border-collapse:collapse;">
      <tr><td><strong>Name</strong></td><td>${escHtml(data.name)}</td></tr>
      <tr><td><strong>Email</strong></td><td>${escHtml(data.email)}</td></tr>
      <tr><td><strong>Subject</strong></td><td>${escHtml(data.subject)}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap;">${escHtml(data.message)}</p>
  `;

  const textBody =
    `New contact form submission\n\n` +
    `Name:    ${data.name}\n` +
    `Email:   ${data.email}\n` +
    `Subject: ${data.subject}\n\n` +
    `Message:\n${data.message}`;

  await client.sendEmail({
    From: emailFrom,
    To: emailTo,
    ReplyTo: data.email,
    Subject: `[VEXI Contact] ${data.subject} — ${data.name}`,
    HtmlBody: htmlBody,
    TextBody: textBody,
    MessageStream: 'outbound',
  });
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

    // --- ALTCHA verification --------------------------------------------------
    const captchaResult = await verifyAltcha(body.captchaToken);
    if (!captchaResult.success) {
      const status = captchaResult.error === 'CAPTCHA verification not configured.' ? 503 : 400;
      return NextResponse.json(
        { error: captchaResult.error ?? 'CAPTCHA verification failed.' },
        { status }
      );
    }

    // --- Email delivery via Postmark (when env vars are configured) -----------
    const postmarkConfigured =
      process.env.POSTMARK_API_TOKEN &&
      process.env.CONTACT_EMAIL_TO &&
      process.env.CONTACT_EMAIL_FROM;

    if (postmarkConfigured) {
      await sendViaPostmark(body);
    } else {
      // Fallback: log to stdout (safe for dev / staging without Postmark creds)
      console.log('📧 New contact form submission:', {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
        timestamp: new Date().toISOString(),
      });
    }

    // ── EventFlow External Contacts forwarding (fire-and-forget) ──────────────
    // If env vars are not set, this block is skipped and the public form still works.
    // If EventFlow is slow or down, the AbortController timeout prevents a hang.
    const efUrl    = process.env.EVENTFLOW_EXTERNAL_CONTACTS_URL;
    const efSecret = process.env.EVENTFLOW_EXTERNAL_CONTACTS_SECRET;

    if (efUrl && efSecret) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 s max
      try {
        await fetch(efUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-EventFlow-Integration-Secret': efSecret,
            'X-EventFlow-Source': 'vexi',
          },
          body: JSON.stringify({
            source: 'vexi',
            name:    body.name,
            email:   body.email,
            subject: body.subject,
            message: body.message,
            metadata: { site: 'VEXI', form: 'landing-contact' },
          }),
          signal: controller.signal,
        });
      } catch (efErr: unknown) {
        // Non-blocking: log a safe warning, never expose secret or error to client
        const msg = efErr instanceof Error ? efErr.message : 'unknown';
        console.warn('[VEXI] EventFlow forwarding failed (non-blocking):', msg);
      } finally {
        clearTimeout(timeout);
      }
    }
    // ────────────────────────────────────────────────────────────────────────────

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
