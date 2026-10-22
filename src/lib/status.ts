import type { Capabilities } from '../../modules/dughri-call-engine';

/** Honest home-screen status derived from the typed native capability snapshot.
 * A 'ready' state is intentionally unreachable: while the engine cannot
 * authorize actions (G-2 BLOCKED), the best reachable state is 'suppressed'.
 * Permission 'available' never maps to 'ready' (docs/05 §4). */
export type HomeStatus = 'checking' | 'error' | 'needs-permission' | 'unsupported' | 'suppressed';

export type AccessStatus = 'granted' | 'missing' | 'unsupported' | 'restricted' | 'unknown';

/** Only explicit grant states count as granted; unfamiliar native codes remain unknown. */
export function accessStatus(value?: string): AccessStatus {
  if (value === 'granted' || value === 'available') return 'granted';
  if (value === 'unsupported' || value === 'restricted') return value;
  if (['not-granted', 'needs-permission', 'denied', 'never_ask_again'].includes(value ?? '')) return 'missing';
  return 'unknown';
}

export function homeStatus(snapshot?: { capabilities?: Capabilities; engine?: string }, failed = false): HomeStatus {
  if (failed) return 'error';
  if (!snapshot?.capabilities) return 'checking';
  const caps = snapshot.capabilities;
  if ([caps.numberSource, caps.callDetection, caps.phoneState, caps.overlay].some(value => value === 'unsupported' || value === 'restricted')) return 'unsupported';
  if ([caps.callDetection, caps.phoneState, caps.overlay].some(value => value === 'needs-permission')) return 'needs-permission';
  if ([caps.numberSource, caps.callDetection, caps.phoneState, caps.overlay].some(value => value !== 'available')) return 'checking';
  return 'suppressed';
}
