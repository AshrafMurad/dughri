import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('English and Arabic diagnostic strings have matching, nonempty leaf keys', () => {
  const flatten = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]);
  const en = flatten(JSON.parse(readFileSync(new URL('../src/locales/en/diagnostics.json', import.meta.url))));
  const ar = flatten(JSON.parse(readFileSync(new URL('../src/locales/ar/diagnostics.json', import.meta.url))));
  assert.deepEqual(en.map(([key]) => key).sort(), ar.map(([key]) => key).sort());
  for (const [, value] of [...en, ...ar]) assert.ok(typeof value === 'string' && value.trim().length > 0);
});
