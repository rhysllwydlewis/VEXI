import { createHash, createHmac, randomBytes, randomInt } from 'crypto';
import { NextResponse } from 'next/server';

const DEV_FALLBACK_PARTS = ['vexi', 'local', 'altcha'];
const ALTCHA_ALGORITHM = 'SHA-256';
const ALTCHA_MAX_NUMBER = 100000;

function getCaptchaKey(): string | null {
  if (process.env.ALTCHA_HMAC_KEY) {
    return process.env.ALTCHA_HMAC_KEY;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEV_FALLBACK_PARTS.join('-');
  }

  return null;
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

export async function GET() {
  try {
    const captchaKey = getCaptchaKey();

    if (!captchaKey) {
      return NextResponse.json(
        { error: 'ALTCHA not configured' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const salt = randomBytes(16).toString('hex');
    const number = randomInt(0, ALTCHA_MAX_NUMBER + 1);
    const challenge = createAltchaHash(salt, number);
    const signature = signChallenge(challenge, captchaKey);

    return NextResponse.json(
      {
        algorithm: ALTCHA_ALGORITHM,
        challenge,
        salt,
        signature,
        maxnumber: ALTCHA_MAX_NUMBER,
        maxNumber: ALTCHA_MAX_NUMBER,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('ALTCHA challenge error:', error);
    return NextResponse.json(
      { error: 'Failed to generate verification challenge' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
