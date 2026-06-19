/**
 * VEXI contact route — EventFlow forwarding and ALTCHA checks
 * Uses require() because the Jest config has no TypeScript transformer.
 * The test files are excluded from next build via tsconfig.json exclude.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const routeSrc = fs.readFileSync(
  path.join(__dirname, '../route.ts'),
  'utf8'
);

describe('VEXI contact route — ALTCHA verification', () => {
  test('requires captchaToken in the contact payload', () => {
    expect(routeSrc).toContain('captchaToken?: string');
    expect(routeSrc).toContain('Please complete the verification challenge.');
  });

  test('uses the same ALTCHA_HMAC_KEY variable as EventFlow', () => {
    expect(routeSrc).toContain('ALTCHA_HMAC_KEY');
    expect(routeSrc).toContain('verifySolution');
  });

  test('blocks submissions before email delivery when CAPTCHA fails', () => {
    const captchaIdx = routeSrc.indexOf('verifyAltcha(body.captchaToken)');
    const postmarkIdx = routeSrc.indexOf('const postmarkConfigured');
    const eventFlowIdx = routeSrc.indexOf('EVENTFLOW_EXTERNAL_CONTACTS_URL');

    expect(captchaIdx).toBeGreaterThan(-1);
    expect(postmarkIdx).toBeGreaterThan(captchaIdx);
    expect(eventFlowIdx).toBeGreaterThan(captchaIdx);
  });

  test('production submissions are blocked if CAPTCHA is not configured', () => {
    expect(routeSrc).toContain('CAPTCHA verification not configured.');
    expect(routeSrc).toContain("process.env.NODE_ENV !== 'production'");
  });

  test('honeypot still returns fake success before CAPTCHA checks', () => {
    const honeypotIdx = routeSrc.indexOf('if (body.website)');
    const captchaIdx = routeSrc.indexOf('verifyAltcha(body.captchaToken)');

    expect(honeypotIdx).toBeGreaterThan(-1);
    expect(captchaIdx).toBeGreaterThan(honeypotIdx);
    expect(routeSrc).toContain('Message received successfully');
  });

  test('rate limiting still runs before request handling', () => {
    const limiterIdx = routeSrc.indexOf('isRateLimited(ip)');
    const bodyIdx = routeSrc.indexOf('await request.json()');

    expect(limiterIdx).toBeGreaterThan(-1);
    expect(bodyIdx).toBeGreaterThan(limiterIdx);
  });
});

describe('VEXI contact route — EventFlow forwarding', () => {
  test('forwards with source "vexi"', () => {
    expect(routeSrc).toContain("source: 'vexi'");
    expect(routeSrc).toContain("'X-EventFlow-Source': 'vexi'");
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
  });

  test('skips forwarding when env vars are missing', () => {
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_URL');
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
    expect(routeSrc).toContain('if (efUrl && efSecret)');
  });

  test('EventFlow forwarding failure is non-blocking', () => {
    expect(routeSrc).toContain('catch (efErr');
    expect(routeSrc).toContain('console.warn');
    expect(routeSrc).not.toContain('throw efErr');
  });

  test('AbortController timeout is applied', () => {
    expect(routeSrc).toContain('AbortController');
    expect(routeSrc).toContain('controller.abort');
    expect(routeSrc).toContain('signal: controller.signal');
  });

  test('secret is never returned to the browser', () => {
    const returnIdx = routeSrc.lastIndexOf('return NextResponse.json');
    const returnBlock = routeSrc.slice(returnIdx, returnIdx + 200);
    expect(returnBlock).not.toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
    expect(returnBlock).not.toContain('efSecret');
  });

  test('source metadata is "vexi" not "chlo"', () => {
    expect(routeSrc).toContain("site: 'VEXI'");
    expect(routeSrc).not.toContain("site: 'Chlo'");
    expect(routeSrc).not.toContain("source: 'chlo'");
  });
});
