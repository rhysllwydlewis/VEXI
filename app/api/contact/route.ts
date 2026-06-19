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
  const { challenge, salt, signature } = payload;
  const solvedNumber = payload.number;

  if (
    algorithm !== ALTCHA_ALGORITHM ||
    !challenge ||
    !salt ||
    !signature ||
    typeof solvedNumber !== 'number' ||
    !Number.isInteger(solvedNumber) ||
    solvedNumber < 0 ||
    solvedNumber > ALTCHA_MAX_NUMBER
  ) {
    return { success: false, error: 'CAPTCHA verification failed.' };
  }

  const expectedChallenge = createAltchaHash(salt, solvedNumber);
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

function cleanSingleLine(str: string): string {
  return str.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatReceivedAt(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  }).format(date);
}

function createReplyHref(data: ContactFormData): string {
  const email = cleanSingleLine(data.email);
  const subject = `Re: ${cleanSingleLine(data.subject)}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

function renderDetailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid rgba(148,163,184,0.18);font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.12em;width:128px;vertical-align:top;">${label}</td>
      <td style="padding:14px 0;border-bottom:1px solid rgba(148,163,184,0.18);font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:22px;color:#f8fafc;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`;
}

function renderContactEmailHtml(data: ContactFormData, receivedAt: Date): string {
  const safeName = escHtml(data.name.trim());
  const safeEmail = escHtml(data.email.trim());
  const safeSubject = escHtml(data.subject.trim());
  const safeMessage = escHtml(data.message.trim());
  const safeReceivedAt = escHtml(formatReceivedAt(receivedAt));
  const replyHref = escHtml(createReplyHref(data));

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>New VEXI contact enquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#050816;color:#f8fafc;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      New VEXI contact enquiry from ${safeName} about ${safeSubject}.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#050816;background-image:radial-gradient(circle at 20% 0%,rgba(59,130,246,0.22),transparent 35%),radial-gradient(circle at 82% 18%,rgba(99,102,241,0.22),transparent 32%),linear-gradient(180deg,#050816 0%,#0f172a 100%);padding:32px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:680px;border-collapse:separate;border-spacing:0;">
            <tr>
              <td style="padding:0 0 18px 0;text-align:center;">
                <div style="display:inline-block;border:1px solid rgba(147,197,253,0.26);border-radius:999px;background:rgba(15,23,42,0.72);padding:9px 16px;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:11px;line-height:16px;font-weight:800;letter-spacing:0.26em;text-transform:uppercase;color:#bfdbfe;box-shadow:0 0 28px rgba(59,130,246,0.22);">
                  VEXI Technology Group
                </div>
              </td>
            </tr>

            <tr>
              <td style="overflow:hidden;border-radius:28px;border:1px solid rgba(148,163,184,0.24);background:#0b1020;box-shadow:0 24px 80px rgba(2,6,23,0.55);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:34px 30px 30px 30px;background:#0f172a;background-image:radial-gradient(circle at 12% 8%,rgba(96,165,250,0.30),transparent 34%),radial-gradient(circle at 88% 12%,rgba(129,140,248,0.28),transparent 36%),linear-gradient(135deg,#0f172a 0%,#111827 56%,#172554 100%);border-bottom:1px solid rgba(191,219,254,0.18);">
                      <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#93c5fd;margin-bottom:12px;">
                        New contact enquiry
                      </div>
                      <h1 style="margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:32px;line-height:38px;font-weight:900;letter-spacing:-0.04em;color:#ffffff;">
                        ${safeSubject}
                      </h1>
                      <p style="margin:12px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:15px;line-height:24px;color:#cbd5e1;">
                        A verified message has been submitted through the VEXI contact form.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:28px 30px 8px 30px;background:rgba(2,6,23,0.36);">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
                        ${renderDetailRow('Name', safeName)}
                        ${renderDetailRow('Email', `<a href="mailto:${safeEmail}" style="color:#93c5fd;text-decoration:none;">${safeEmail}</a>`)}
                        ${renderDetailRow('Subject', safeSubject)}
                        ${renderDetailRow('Received', safeReceivedAt)}
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:22px 30px 8px 30px;background:rgba(2,6,23,0.36);">
                      <div style="border:1px solid rgba(148,163,184,0.20);border-radius:22px;background:rgba(15,23,42,0.78);padding:24px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                        <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:18px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#67e8f9;margin-bottom:12px;">
                          Message
                        </div>
                        <div style="font-family:Inter,Segoe UI,Arial,sans-serif;font-size:16px;line-height:26px;color:#e2e8f0;white-space:pre-wrap;">${safeMessage}</div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:24px 30px 32px 30px;background:rgba(2,6,23,0.36);">
                      <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                        <tr>
                          <td style="border-radius:999px;background:#3b82f6;background-image:linear-gradient(135deg,#60a5fa 0%,#3b82f6 48%,#6366f1 100%);box-shadow:0 14px 34px rgba(59,130,246,0.38);">
                            <a href="${replyHref}" style="display:inline-block;padding:13px 22px;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;line-height:18px;font-weight:800;color:#ffffff;text-decoration:none;border-radius:999px;">
                              Reply to ${safeName}
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:18px 0 0 0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:12px;line-height:20px;color:#94a3b8;">
                        This enquiry passed the VEXI contact form checks and was delivered by Postmark. You can reply directly to this email or use the button above.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 8px 0 8px;text-align:center;">
                <p style="margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:11px;line-height:18px;color:#64748b;">
                  VEXI · Purpose-built digital platforms · vexi.co.uk
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderContactEmailText(data: ContactFormData, receivedAt: Date): string {
  return (
    `New VEXI contact enquiry\n\n` +
    `Name: ${data.name}\n` +
    `Email: ${data.email}\n` +
    `Subject: ${data.subject}\n` +
    `Received: ${formatReceivedAt(receivedAt)}\n\n` +
    `Message:\n${data.message}\n\n` +
    `Reply directly to this email to respond to the sender.`
  );
}

async function sendViaPostmark(data: ContactFormData): Promise<void> {
  const token = process.env.POSTMARK_API_TOKEN;
  const emailTo = process.env.CONTACT_EMAIL_TO;
  const emailFrom = process.env.CONTACT_EMAIL_FROM;

  if (!token || !emailTo || !emailFrom) return; // fall through to console log

  const client = new postmark.ServerClient(token);
  const receivedAt = new Date();
  const subject = cleanSingleLine(data.subject).slice(0, 140) || 'Contact enquiry';
  const senderName = cleanSingleLine(data.name).slice(0, 100) || 'Unknown sender';
  const replyTo = cleanSingleLine(data.email);

  await client.sendEmail({
    From: emailFrom,
    To: emailTo,
    ReplyTo: replyTo,
    Subject: `[VEXI Contact] ${subject} — ${senderName}`,
    HtmlBody: renderContactEmailHtml(data, receivedAt),
    TextBody: renderContactEmailText(data, receivedAt),
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
