import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

test('Every locale feature has identical, nonempty leaf keys in English and Arabic', () => {
  const flatten = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]);
  const files = readdirSync(new URL('../src/locales/en/', import.meta.url)).sort();
  assert.deepEqual(files, readdirSync(new URL('../src/locales/ar/', import.meta.url)).sort());
  for (const file of files) {
  const en = flatten(JSON.parse(readFileSync(new URL(`../src/locales/en/${file}`, import.meta.url))));
  const ar = flatten(JSON.parse(readFileSync(new URL(`../src/locales/ar/${file}`, import.meta.url))));
  assert.deepEqual(en.map(([key]) => key).sort(), ar.map(([key]) => key).sort());
  for (const [, value] of [...en, ...ar]) assert.ok(typeof value === 'string' && value.trim().length > 0);
  }
});
