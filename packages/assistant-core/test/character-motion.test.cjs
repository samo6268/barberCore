const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/character-motion.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const scope = { exports: {} };
new Function('exports', 'module', compiled)(scope.exports, scope);
const { attachCharacterGaze } = scope.exports;

function fixture() {
  const events = () => ({
    listeners: new Map(),
    addEventListener(type, listener) { this.listeners.set(type, listener); },
    removeEventListener(type) { this.listeners.delete(type); },
  });
  const reduced = { ...events(), matches: false };
  const fine = { ...events(), matches: true };
  const view = { ...events(), matchMedia: (q) => q.includes('reduce') ? reduced : fine,
    requests: 0, requestAnimationFrame(fn) { this.requests++; this.paint = fn; return 1; },
    cancelAnimationFrame() { this.paint = null; },
  };
  const doc = { ...events(), defaultView: view, documentElement: events(), hidden: false };
  const values = new Map();
  const character = { getBoundingClientRect: () => ({ left: 100, top: 100, width: 60, height: 60 }),
    style: { setProperty: (k, v) => values.set(k, v), removeProperty: (k) => values.delete(k) } };
  const root = { ownerDocument: doc, querySelectorAll: () => [character] };
  const cleanup = attachCharacterGaze(root, '.character');
  const move = (x, y, pointerType = 'mouse') => doc.listeners.get('pointermove')({ clientX:x, clientY:y, pointerType });
  return { view, doc, reduced, fine, values, cleanup, move };
}

test('gaze follows physical pointer direction and stays within the eye bounds', () => {
  const f = fixture();
  f.move(10000, -10000); f.view.paint();
  const x = parseFloat(f.values.get('--mimo-gaze-x'));
  const y = parseFloat(f.values.get('--mimo-gaze-y'));
  assert.ok(x > 0 && x <= 3);
  assert.ok(y < 0 && y >= -2);
  f.move(-10000, 10000); f.view.paint();
  assert.ok(parseFloat(f.values.get('--mimo-gaze-x')) < 0);
  assert.ok(parseFloat(f.values.get('--mimo-gaze-y')) > 0);
  f.cleanup();
});

test('frequent pointer events coalesce into one frame; disconnect removes listeners', () => {
  const f = fixture();
  for (let n = 0; n < 40; n++) f.move(n, n);
  assert.equal(f.view.requests, 1);
  f.cleanup();
  assert.equal(f.doc.listeners.size, 0);
  assert.equal(f.view.listeners.size, 0);
  assert.equal(f.doc.documentElement.listeners.size, 0);
  assert.equal(f.values.size, 0);
});

test('touch and reduced-motion users do not receive gaze movement', () => {
  const f = fixture();
  f.move(200, 200, 'touch');
  f.reduced.matches = true; f.move(200, 200);
  assert.equal(f.view.requests, 0);
  f.cleanup();
});

test('leaving the window or enabling reduced motion returns the eyes to neutral', () => {
  const f = fixture();
  f.move(500, 200); f.view.paint();
  assert.ok(f.values.size);
  f.view.listeners.get('blur')();
  assert.equal(f.values.size, 0);
  f.move(500, 200); f.view.paint();
  f.reduced.matches = true; f.reduced.listeners.get('change')();
  assert.equal(f.values.size, 0);
  f.cleanup();
});
