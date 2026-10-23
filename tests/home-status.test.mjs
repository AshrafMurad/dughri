import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Transpile the actual pure TS mapping; no React/native test doubles.
const source = readFileSync(new URL('../src/lib/status.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { homeStatus, accessStatus } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

// Mirrors the real native snapshot: numberSource reports 'runtime-correlation'
// (a mechanism label, never a blanket 'available' grant).
const realCapabilities = { callDetection: 'available', phoneState: 'available', numberSource: 'runtime-correlation', overlay: 'available', backgroundOperation: 'unknown' };

test('Home status is checking or error until a capability snapshot exists', () => {
  assert.equal(homeStatus(undefined, false), 'checking');
  assert.equal(homeStatus({}, false), 'checking');
  assert.equal(homeStatus(undefined, true), 'error');
});

test('Armed engine with real capabilities reports active, not off', () => {
  assert.equal(homeStatus({ capabilities: realCapabilities, engine: 'active' }), 'active');
  assert.equal(homeStatus({ capabilities: realCapabilities, engine: 'inactive' }), 'off');
});

test('Unfamiliar capability values never report as active', () => {
  assert.equal(homeStatus({ capabilities: realCapabilities, engine: 'some-unknown-mode' }), 'off');
});

test('Permission gaps and unsupported values report before active', () => {
  assert.equal(homeStatus({ capabilities: { ...realCapabilities, callDetection: 'needs-permission' }, engine: 'active' }), 'needs-permission');
  assert.equal(homeStatus({ capabilities: { ...realCapabilities, overlay: 'needs-permission' }, engine: 'active' }), 'needs-permission');
  assert.equal(homeStatus({ capabilities: { ...realCapabilities, numberSource: 'unsupported' }, engine: 'active' }), 'unsupported');
});

test('Unknown, restricted and missing phone access are never represented as established support', () => {
  const available = { callDetection: 'available', phoneState: 'available', numberSource: 'available', overlay: 'available', backgroundOperation: 'available' };
  for (const key of ['numberSource', 'callDetection', 'phoneState', 'overlay']) {
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'unknown' }, engine: 'active' }), 'checking');
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'unexpected-code' }, engine: 'active' }), 'checking');
    assert.equal(homeStatus({ capabilities: { ...available, [key]: 'restricted' }, engine: 'active' }), 'unsupported');
  }
  assert.equal(homeStatus({ capabilities: { ...available, phoneState: 'needs-permission' }, engine: 'active' }), 'needs-permission');
});

test('Permission labels fail closed for absent, unverified and unfamiliar native codes', () => {
  for (const code of [undefined, 'unknown', 'requested', 'candidate-only', 'unexpected-code']) assert.equal(accessStatus(code), 'unknown');
  for (const code of ['granted', 'available']) assert.equal(accessStatus(code), 'granted');
  for (const code of ['needs-permission', 'not-granted', 'denied', 'never_ask_again']) assert.equal(accessStatus(code), 'missing');
  assert.equal(accessStatus('restricted'), 'restricted');
  assert.equal(accessStatus('unsupported'), 'unsupported');
});
