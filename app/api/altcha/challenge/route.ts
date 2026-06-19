import { NextResponse } from 'next/server';
import { createChallenge } from 'altcha-lib';

const DEV_FALLBACK_PARTS = ['vexi', 'local', 'altcha'];

function getCaptchaKey(): string | null {
  if (process.env.ALTCHA_HMAC_KEY) {
    return process.env.ALTCHA_HMAC_KEY;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_PARTS.join('-');
  }

  return null;
}

export async function GET() {
  try {
    const captchaKey = getCaptchaKey();

    if (!captchaKey) {
      return NextResponse.json(
        { error: 'ALTCHA not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const challenge = await createChallenge({
      hmacKey: captchaKey,
      maxNumber: 100000,
    });

    return NextResponse.json(challenge, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('ALTCHA challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification challenge' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
