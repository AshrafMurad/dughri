import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Synthetic React/native test doubles: verifies async guards, not Android integration.
const source = readFileSync(new URL('../src/lib/useDeviceSnapshot.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
function mount() {
  const states = [];
  const requests = [];
  let cleanup;
  let nativeEvent;
  let removed = 0;
  const engine = {
    getSnapshot: () => new Promise((resolve, reject) => requests.push({ resolve, reject })),
    addListener: (_, listener) => { nativeEvent = listener; return { remove: () => removed++ }; },
  };
  const context = {
    exports: {},
    require: name => {
      if (name === 'react') return {
        useState: initial => {
          const state = { value: initial }; states.push(state);
          return [initial, next => { state.value = next; }];
        },
        useRef: current => ({ current }), useCallback: callback => callback,
      };
      if (name === 'expo-router') return { useFocusEffect: callback => { cleanup = callback(); } };
      if (name === 'react-native') return { AppState: { addEventListener: () => ({ remove: () => removed++ }) } };
      return { __esModule: true, default: engine };
    },
  };
  vm.runInNewContext(outputText, context);
  const hook = context.exports.useDeviceSnapshot();
  return { hook, states, requests, emit: snapshot => nativeEvent(snapshot), cleanup: () => cleanup(), removed: () => removed };
}

test('Synthetic snapshot refresh returns explicit success/failure and ends checking', async () => {
  const h = mount();
  h.requests[0].resolve({ engine: 'inactive' });
  await new Promise(setImmediate);
  assert.equal(h.states[0].value.engine, 'inactive');
  const success = h.hook.refresh();
  h.requests[1].resolve({ engine: 'suppressed' });
  assert.equal(await success, true);
  assert.equal(h.states[0].value.engine, 'suppressed');
  const failure = h.hook.refresh();
  h.requests[2].reject(new Error('synthetic failure'));
  assert.equal(await failure, false);
  assert.equal(h.states[1].value, true);
  assert.equal(h.states[2].value, false);
  h.cleanup();
});

test('Synthetic native event invalidates older in-flight snapshot responses', async () => {
  const h = mount();
  h.emit({ engine: 'new-event' });
  h.requests[0].resolve({ engine: 'stale-request' });
  await new Promise(setImmediate);
  assert.equal(h.states[0].value.engine, 'new-event');
  assert.equal(h.states[2].value, false);
  h.cleanup();
});

test('Synthetic focus cleanup discards late responses and removes subscriptions', async () => {
  const h = mount();
  h.cleanup();
  h.requests[0].resolve({ engine: 'late' });
  await new Promise(setImmediate);
  assert.equal(h.states[0].value, undefined);
  assert.equal(h.removed(), 2);
});
