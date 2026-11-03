const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/index.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const scope = { exports: {} };
new Function('require', 'exports', 'module', code)(
  () => ({ attachCharacterGaze() {} }),
  scope.exports,
  scope,
);
const { HttpAssistantTransport, AssistantTransportError, safeAssistantUrl } = scope.exports;
const { publishAssistantWorkflow, getAssistantWorkflow, subscribeAssistantWorkflow, sanitizeWorkflowContext } = scope.exports;

test('workflow hints contain only identifiers and never raw form values', () => {
  const clean = sanitizeWorkflowContext({
    id: 'booking', stepId: 'date', completed: ['service'], issues: ['missing_date'],
    phone: '09121234567', otp: '123456', metadata: { password: 'secret' },
  });
  assert.deepEqual(clean, { id: 'booking', stepId: 'date', completed: ['service'], issues: ['missing_date'] });
  assert.throws(() => sanitizeWorkflowContext({ id: '<script>' }));
});

test('page context is route-scoped and an older publisher cannot erase a newer snapshot', () => {
  const original = global.window;
  global.window = new EventTarget();
  let events = 0;
  const unsubscribe = subscribeAssistantWorkflow(() => events++);
  try {
    const first = publishAssistantWorkflow('/salons/a/book', { id: 'booking', stepId: 'service' });
    assert.equal(getAssistantWorkflow('/salons/a/book').stepId, 'service');
    const second = publishAssistantWorkflow('/salons/a/book', { id: 'booking', stepId: 'date' });
    first();
    assert.equal(getAssistantWorkflow('/salons/a/book').stepId, 'date');
    assert.equal(getAssistantWorkflow('/salons/b/book'), undefined);
    second();
    assert.equal(getAssistantWorkflow('/salons/a/book'), undefined);
    assert.equal(events, 3);
    assert.throws(() => publishAssistantWorkflow('//other.example', { id: 'booking' }));
  } finally { unsubscribe(); global.window = original; }
});

test('citations allow only same-origin paths, never script or external URLs', () => {
  for (const url of [
    'javascript:alert(1)',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    '/bad\nurl',
  ])
    assert.equal(safeAssistantUrl(url), undefined);
  assert.equal(safeAssistantUrl('/salons/example/book'), '/salons/example/book');
});

test('guest session is preserved in memory and reset for a fresh conversation', async () => {
  const original = global.fetch,
    requests = [];
  try {
    global.fetch = async (url, options) => {
      requests.push({ url, body: JSON.parse(options.body), headers: options.headers });
      return new Response(
        JSON.stringify({
          data: {
            conversationId: 'qa',
            sessionToken: 'signed-guest',
            message: { content: 'test' },
          },
        }),
        { status: 200 },
      );
    };
    const transport = new HttpAssistantTransport('http://localhost/api/assistant/', () => null);
    const request = { assistantId: 'parnegarin', message: 'test', context: { route: '/' } };
    await transport.chat(request);
    await transport.chat({ ...request, conversationId: 'qa' });
    assert.equal(requests[0].url, 'http://localhost/api/assistant/chat');
    assert.equal(requests[1].body.sessionToken, 'signed-guest');
    transport.resetConversation();
    await transport.chat(request);
    assert.equal(requests[2].body.sessionToken, undefined);
  } finally {
    global.fetch = original;
  }
});

test('authentication failures become a safe actionable message instead of fake answers', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () =>
      new Response(JSON.stringify({ message: 'internal secret must not be echoed' }), {
        status: 401,
      });
    await assert.rejects(
      new HttpAssistantTransport('/api/assistant').chat({
        assistantId: 'parnegarin',
        message: 'test',
        context: { route: '/' },
      }),
      (error) =>
        error instanceof AssistantTransportError &&
        error.status === 401 &&
        !error.message.includes('internal secret'),
    );
  } finally {
    global.fetch = original;
  }
});
