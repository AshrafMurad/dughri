import type { Capabilities } from '../../modules/dughri-call-engine';

/** Honest home-screen status derived from the typed native snapshot.
 * 'active' means the engine is armed AND runtime-gated: the card appears only
 * for sessions the native correlator completes as 'correlated' (single
 * pre-call E.164 candidate, no overlap, idle within expiry). Capability
 * 'runtime-correlation' is a mechanism label, never an 'available' grant. */
export type HomeStatus = 'checking' | 'error' | 'needs-permission' | 'unsupported' | 'active' | 'off';

export type AccessStatus = 'granted' | 'missing' | 'unsupported' | 'restricted' | 'unknown';

/** Only explicit grant states count as granted; unfamiliar native codes remain unknown. */
export function accessStatus(value?: string): AccessStatus {
  if (value === 'granted' || value === 'available') return 'granted';
  if (value === 'unsupported' || value === 'restricted') return value;
  if (['not-granted', 'needs-permission', 'denied', 'never_ask_again'].includes(value ?? '')) return 'missing';
  return 'unknown';
}

const acceptable = new Set(['available', 'runtime-correlation']);

export function homeStatus(snapshot?: { capabilities?: Capabilities; engine?: string }, failed = false): HomeStatus {
  if (failed) return 'error';
  if (!snapshot?.capabilities) return 'checking';
  const caps = snapshot.capabilities;
  const core = [caps.numberSource, caps.callDetection, caps.phoneState, caps.overlay];
  if (core.some(value => value === 'unsupported' || value === 'restricted')) return 'unsupported';
  if ([caps.callDetection, caps.phoneState, caps.overlay].some(value => value === 'needs-permission')) return 'needs-permission';
  if (core.some(value => !acceptable.has(value))) return 'checking';
  return snapshot.engine === 'active' ? 'active' : 'off';
}
