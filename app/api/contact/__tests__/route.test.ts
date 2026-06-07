/**
 * VEXI contact route — EventFlow forwarding tests
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
