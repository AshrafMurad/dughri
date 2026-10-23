import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile the actual pure TS implementation; no React/native test doubles.
const source = readFileSync(new URL('../src/lib/preferences.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { parsePreferences, resolveLanguage, changeLanguage, updatePreferences, composeManualNumber } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Language switches preserve v2 fields and survive serialization', () => {
  const before = parsePreferences(null, false);
  assert.equal(before.language, 'en'); // absent payload resolves legacy English
  const arabic = changeLanguage(before, 'ar');
  assert.equal(arabic.language, 'ar');
  assert.deepEqual(parsePreferences(JSON.stringify(arabic), false), arabic);
  assert.equal(parsePreferences(JSON.stringify(changeLanguage(arabic, 'en')), false).language, 'en');
});

test('v1 payloads migrate forward with safe v2 defaults (shortcut stays off)', () => {
  const v1 = '{"schemaVersion":1,"language":"ar","welcomeSeen":true}';
  const migrated = parsePreferences(v1, false);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.language, 'ar');
  assert.equal(migrated.welcomeSeen, true);
  assert.equal(migrated.shortcutEnabled, false); // BR-09 default-off survives migration
  assert.equal(migrated.incoming, true);
  assert.equal(migrated.outgoing, true);
  assert.equal(migrated.countryCode, '+966');
  assert.equal(migrated.whatsappTarget, 'whatsapp');
});

test('Unknown versions, malformed values, and off-list codes fail closed', () => {
  for (const raw of ['bad-json', '{}', 'null',
    '{"schemaVersion":3,"language":"en","welcomeSeen":true,"shortcutEnabled":false,"incoming":true,"outgoing":true,"notifications":false,"countryCode":"+966","whatsappTarget":"whatsapp"}',
    '{"schemaVersion":2,"language":"xx","welcomeSeen":true,"shortcutEnabled":false,"incoming":true,"outgoing":true,"notifications":false,"countryCode":"+966","whatsappTarget":"whatsapp"}',
    '{"schemaVersion":2,"language":"en","welcomeSeen":"yes","shortcutEnabled":false,"incoming":true,"outgoing":true,"notifications":false,"countryCode":"+966","whatsappTarget":"whatsapp"}',
    '{"schemaVersion":2,"language":"en","welcomeSeen":true,"shortcutEnabled":false,"incoming":true,"outgoing":true,"notifications":false,"countryCode":"+999","whatsappTarget":"whatsapp"}',
    '{"schemaVersion":2,"language":"en","welcomeSeen":true,"shortcutEnabled":false,"incoming":true,"outgoing":true,"notifications":false,"countryCode":"+966","whatsappTarget":"telegram"}']) {
    assert.throws(() => parsePreferences(raw, false), raw);
  }
});

test('updatePreferences rejects off-list partial values', () => {
  const base = parsePreferences(null, true);
  assert.throws(() => updatePreferences(base, { countryCode: '+001' }));
  assert.equal(updatePreferences(base, { shortcutEnabled: true }).shortcutEnabled, true);
});

test('composeManualNumber joins code and digits and strips decoration', () => {
  assert.equal(composeManualNumber('+966', '50 123 4567'), '+966501234567');
  assert.equal(composeManualNumber('+966', '0501234567'), '+966501234567');
  assert.equal(composeManualNumber('+971', '٥٠١٢٣٤٥٦٧'), '+971501234567'); // Arabic-Indic digits normalize
  assert.equal(composeManualNumber('+44', ' 7911 123456 '), '+447911123456');
  assert.equal(composeManualNumber('+966', ''), null);
  assert.equal(composeManualNumber('+966', 'abc'), null);
  // Unknown code falls back to the default, never invents a prefix.
  assert.equal(composeManualNumber('966', '501234567'), '+966501234567');
});

test('System language resolves Arabic variants with an English fallback', () => {
  assert.equal(resolveLanguage('system', 'ar-YE'), 'ar');
  assert.equal(resolveLanguage('system', 'fr-FR'), 'en');
  assert.equal(resolveLanguage('en', 'ar-YE'), 'en');
  assert.equal(parsePreferences(null, true).language, 'ar');
});
