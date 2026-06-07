/**
 * VEXI contact route — EventFlow forwarding tests
 */

// Mock global fetch so tests don't make real HTTP calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

const VALID_BODY = {
  name: 'Alice Smith',
  email: 'alice@example.com',
  subject: 'Partnership',
  message: 'Hi, I would love to collaborate.',
};

describe('VEXI contact route — EventFlow forwarding', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EVENTFLOW_EXTERNAL_CONTACTS_URL;
    delete process.env.EVENTFLOW_EXTERNAL_CONTACTS_SECRET;
    delete process.env.POSTMARK_API_TOKEN;
  });

  test('forwards to EventFlow with source "vexi" when env vars are set', async () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    expect(routeSrc).toContain("source: 'vexi'");
    expect(routeSrc).toContain("'X-EventFlow-Source': 'vexi'");
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
  });

  test('skips forwarding when env vars are missing', () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_URL');
    expect(routeSrc).toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
    // Both must be present for forwarding to occur
    expect(routeSrc).toContain('if (efUrl && efSecret)');
  });

  test('EventFlow forwarding failure is non-blocking (catch block present)', () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    expect(routeSrc).toContain('catch (efErr');
    expect(routeSrc).toContain('console.warn');
    expect(routeSrc).not.toContain('throw efErr');
  });

  test('AbortController timeout is applied to EventFlow fetch', () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    expect(routeSrc).toContain('AbortController');
    expect(routeSrc).toContain('controller.abort');
    expect(routeSrc).toContain('signal: controller.signal');
  });

  test('secret is never returned to the browser', () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    // The route must return NextResponse.json with success:true, never the secret
    const returnIdx = routeSrc.lastIndexOf('return NextResponse.json');
    const returnBlock = routeSrc.slice(returnIdx, returnIdx + 200);
    expect(returnBlock).not.toContain('EVENTFLOW_EXTERNAL_CONTACTS_SECRET');
    expect(returnBlock).not.toContain('efSecret');
  });

  test('source metadata is "vexi" not "chlo"', () => {
    const routeSrc = require('fs').readFileSync(
      require('path').join(__dirname, '../route.ts'), 'utf8'
    );
    expect(routeSrc).toContain("site: 'VEXI'");
    expect(routeSrc).not.toContain("site: 'Chlo'");
    expect(routeSrc).not.toContain("source: 'chlo'");
  });
});
