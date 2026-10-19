// No payload, error, identifier or caller-supplied text is ever forwarded.
const messages = Object.freeze({
  'ui-error': 'dughri: ui-error',
  'preferences-error': 'dughri: preferences-error',
});

export function safeLog(development, code, sink = console.debug) {
  if (development !== true || typeof code !== 'string' || !Object.hasOwn(messages, code)) return;
  sink(messages[code]);
}
