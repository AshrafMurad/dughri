import test from 'node:test';
import assert from 'node:assert/strict';
import { safeLog } from '../src/lib/safe-log.mjs';

test('Logging guard emits only fixed reason codes in development', () => {
  const output = [];
  const sink = value => output.push(value);
  safeLog(false, 'ui-error', sink);
  safeLog(true, 'ui-error', sink);
  safeLog(true, 'preferences-error', sink);
  for (const value of ['123456789', '+123456789', 'ui-error 123456789', '__proto__', 'constructor', {}, null]) {
    safeLog(true, value, sink);
  }
  assert.deepEqual(output, ['dughri: ui-error', 'dughri: preferences-error']);
});
