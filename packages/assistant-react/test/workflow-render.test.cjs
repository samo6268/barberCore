const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(filename, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const scope = { exports: {} };
  new Function('require', 'exports', 'module', code)(name => dependencies[name] || require(name), scope.exports, scope);
  return scope.exports;
}
const core = load(path.join(__dirname, '../../assistant-core/src/index.ts'), { './character-motion': {} });
let state;
const { MimoAssistant } = load(path.join(__dirname, '../src/mimo-assistant.tsx'), {
  '@adaptive-assistant/core': core, './provider': { useAssistant: () => state },
});
test('workflow card is grounded, accessible and does not reload the current form or render unsafe source links', () => {
  state = {
    open: true, reaction: 'idle', busy: false, style: {}, context: { route: '/salons/demo/book' },
    setOpen() {}, setListening() {}, resetConversation() {}, send() {},
    manifest: { name: 'میمو', characterName: 'میمو', direction: 'rtl', greeting: 'سلام', inputPlaceholder: 'بپرسید' },
    messages: [{ id: '1', role: 'assistant', content: 'روز را انتخاب کنید.',
      guide: { title: 'رزرو نوبت', source: 'page-state', steps: [{ id: 'date', title: 'انتخاب روز', current: true }] },
      citations: [{ title: 'فرم فعلی', url: '/salons/demo/book' }, { title: '<script>bad</script>', url: 'javascript:alert(1)' }],
    }],
    suggestions: [{ id: 'explain', label: 'توضیح این مرحله', prompt: 'توضیح بده' }],
  };
  const html = renderToStaticMarkup(React.createElement(MimoAssistant));
  assert.ok(html.includes('aria-current="step"'));
  assert.ok(html.includes('طبق وضعیت صفحه هنگام پاسخ'));
  assert.ok(html.includes('توضیح این مرحله'));
  assert.ok(!html.includes('href="/salons/demo/book"'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes('<script>'));
});
