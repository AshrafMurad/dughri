import type { Capabilities } from '../../modules/dughri-call-engine';

/** Honest home-screen status derived from the typed native capability snapshot.
 * A 'ready' state is intentionally unreachable: while the engine cannot
 * authorize actions (G-2 BLOCKED), the best reachable state is 'suppressed'.
 * Permission 'available' never maps to 'ready' (docs/05 §4). */
export type HomeStatus = 'checking' | 'error' | 'needs-permission' | 'unsupported' | 'suppressed';

export function homeStatus(snapshot?: { capabilities?: Capabilities; engine?: string }, failed = false): HomeStatus {
  if (failed) return 'error';
  if (!snapshot?.capabilities) return 'checking';
  const caps = snapshot.capabilities;
  if (caps.numberSource === 'unsupported') return 'unsupported';
  if (caps.callDetection !== 'available' || caps.overlay !== 'available') return 'needs-permission';
  return 'suppressed';
}
