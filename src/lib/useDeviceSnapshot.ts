import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Engine, { type Snapshot } from '../../modules/dughri-call-engine';

/** Refresh real access state on focus/resume; late requests cannot overwrite newer events. */
export function useDeviceSnapshot() {
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [failed, setFailed] = useState(false);
  const [checking, setChecking] = useState(true);
  const revision = useRef(0);
  const active = useRef(false);
  const refresh = useCallback(async () => {
    const request = ++revision.current;
    setChecking(true);
    try {
      const next = await Engine.getSnapshot();
      if (active.current && request === revision.current) { setSnapshot(next); setFailed(false); return true; }
      return false;
    } catch { if (active.current && request === revision.current) setFailed(true); return false; }
    finally { if (active.current && request === revision.current) setChecking(false); }
  }, []);
  useFocusEffect(useCallback(() => {
    active.current = true;
    void refresh();
    const native = Engine.addListener('diagnosticsChanged', next => {
      ++revision.current; setSnapshot(next); setFailed(false); setChecking(false);
    });
    const app = AppState.addEventListener('change', state => { if (state === 'active') void refresh(); });
    return () => { active.current = false; ++revision.current; native.remove(); app.remove(); };
  }, [refresh]));
  return { snapshot, failed, checking, refresh };
}
