import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile the actual pure TS implementation; no React/native test doubles.
const source = readFileSync(new URL('../src/lib/preferences.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { parsePreferences, resolveLanguage, changeLanguage } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Language switches preserve welcome state and survive serialization', () => {
  const before = { schemaVersion: 1, language: 'system', welcomeSeen: true };
  const arabic = changeLanguage(before, 'ar');
  assert.deepEqual(parsePreferences(JSON.stringify(arabic), false), { ...before, language: 'ar' });
  assert.deepEqual(changeLanguage(arabic, 'en'), { ...before, language: 'en' });
  assert.equal(before.language, 'system');
});
test('Unknown preference versions and malformed values fail closed', () => {
  for (const raw of ['bad-json', '{}', 'null', '{"schemaVersion":2,"language":"en","welcomeSeen":true}',
    '{"schemaVersion":1,"language":"xx","welcomeSeen":false}']) {
    assert.throws(() => parsePreferences(raw, false));
  }
});
test('System language resolves Arabic variants with an English fallback', () => {
  assert.equal(resolveLanguage('system', 'ar-YE'), 'ar');
  assert.equal(resolveLanguage('system', 'fr-FR'), 'en');
  assert.equal(resolveLanguage('en', 'ar-YE'), 'en');
  assert.equal(parsePreferences(null, true).language, 'ar');
});
