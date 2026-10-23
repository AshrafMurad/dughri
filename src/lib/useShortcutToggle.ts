import { useState } from 'react';
import Engine from '../../modules/dughri-call-engine';
import { useApp } from '../components/AppProvider';

/** Persisted shortcut intent + native observation control in one action.
 * Observation is a probe control; verified automatic behavior is reported
 * separately by the honest home status. */
export function useShortcutToggle() {
  const { update } = useApp();
  const [toggling, setToggling] = useState(false);
  const toggle = async (next: boolean) => {
    setToggling(true);
    const saved = await update({ shortcutEnabled: next });
    if (saved) {
      try {
        if (next) await Engine.startObservation();
        else await Engine.stopObservation();
      } catch { /* native probe failures surface via diagnostics */ }
    }
    setToggling(false);
  };
  return { toggling, toggle };
}
