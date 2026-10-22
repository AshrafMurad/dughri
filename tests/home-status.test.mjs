import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile the actual pure TS mapping; no React/native test doubles.
const source = readFileSync(new URL('../src/lib/status.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { homeStatus, accessStatus } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Home status is checking or error until a capability snapshot exists', () => {
  assert.equal(homeStatus(undefined, false), 'checking');
  assert.equal(homeStatus({}, false), 'checking');
  assert.equal(homeStatus(undefined, true), 'error');
});

test('Unverified number source reports unsupported even with all permissions granted', () => {
  // Mirrors the real native constants: numberSource is 'unsupported' in this build.
  const realSnapshot = { capabilities: { callDetection: 'available', phoneState: 'available', numberSource: 'unsupported', overlay: 'available', backgroundOperation: 'unknown' }, engine: 'inactive' };
  assert.equal(homeStatus(realSnapshot), 'unsupported');
  assert.equal(homeStatus({ capabilities: { ...realSnapshot.capabilities, callDetection: 'needs-permission' } }), 'unsupported');
});

test('Hypothetical full capability still never reaches ready', () => {
  // Synthetic all-available input for precedence only; not a capability claim.
  const available = { callDetection: 'available', phoneState: 'available', numberSource: 'available', overlay: 'available', backgroundOperation: 'available' };
  assert.equal(homeStatus({ capabilities: available }), 'suppressed');
  assert.equal(homeStatus({ capabilities: { ...available, overlay: 'needs-permission' } }), 'needs-permission');
});

test('Unknown, restricted and missing phone access are never represented as established support', () => {
  const available = { callDetection: 'available', phoneState: 'available', numberSource: 'available', overlay: 'available', backgroundOperation: 'available' };
  for (const key of ['numberSource', 'callDetection', 'phoneState', 'overlay']) {
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'unknown' } }), 'checking');
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'unexpected-code' } }), 'checking');
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'restricted' } }), 'unsupported');
  }
  assert.equal(homeStatus({ capabilities: { ...available, phoneState: 'needs-permission' } }), 'needs-permission');
});

test('Permission labels fail closed for absent, unverified and unfamiliar native codes', () => {
  for (const code of [undefined, 'unknown', 'requested', 'candidate-only', 'unexpected-code']) assert.equal(accessStatus(code), 'unknown');
  for (const code of ['granted', 'available']) assert.equal(accessStatus(code), 'granted');
  for (const code of ['needs-permission', 'not-granted', 'denied', 'never_ask_again']) assert.equal(accessStatus(code), 'missing');
  assert.equal(accessStatus('restricted'), 'restricted');
  assert.equal(accessStatus('unsupported'), 'unsupported');
});
