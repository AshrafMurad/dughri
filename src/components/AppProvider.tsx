import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import Engine from '../../modules/dughri-call-engine';
import { locales, type Copy, type LanguagePreference } from '../locales';
import { changeLanguage, parsePreferences, resolveLanguage, updatePreferences, type Preferences } from '../lib/preferences';
import { clearRecents } from '../lib/recents';
import { safeLog } from '../lib/safe-log.mjs';

interface AppContextValue {
  copy: Copy; arabic: boolean; preferences?: Preferences; busy: boolean; failed: boolean;
  setLanguage: (language: LanguagePreference) => Promise<boolean>;
  finishWelcome: () => Promise<boolean>;
  update: (changes: Partial<Omit<Preferences, 'schemaVersion'>>) => Promise<boolean>;
  reload: () => void;
}
const Context = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>();
  const [systemLocale, setSystemLocale] = useState(Intl.DateTimeFormat().resolvedOptions().locale);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const writing = useRef(false);
  const armed = useRef(false);
  const reload = useCallback(() => {
    setFailed(false);
    void Promise.all([Engine.getAppPreferences(), Engine.getArabic()]).then(([raw, legacy]) => {
      setPreferences(parsePreferences(raw, legacy));
    }).catch(() => { setFailed(true); safeLog(__DEV__, 'preferences-error'); });
  }, []);
  useEffect(() => {
    reload();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setSystemLocale(Intl.DateTimeFormat().resolvedOptions().locale);
      else clearRecents(); // Session-only recents: forget numbers when leaving the foreground.
    });
    return () => subscription.remove();
  }, [reload]);
  const language = resolveLanguage(preferences?.language ?? 'system', systemLocale);
  const save = async (next: Preferences) => {
    if (writing.current) return false;
    writing.current = true; setBusy(true); setFailed(false);
    try {
      await Engine.setAppPreferences(JSON.stringify(next));
      setPreferences(next);
      return true;
    } catch { setFailed(true); safeLog(__DEV__, 'preferences-error'); return false; }
    finally { writing.current = false; setBusy(false); }
  };
  // Arm or disarm call observation once preferences are known. Observation is a
  // native probe control; verified automatic behavior is reported separately.
  useEffect(() => {
    if (!preferences || armed.current) return;
    armed.current = true;
    if (preferences.shortcutEnabled) void Engine.startObservation().catch(() => safeLog(__DEV__, 'observation-error'));
  }, [preferences]);
  return <Context.Provider value={{ copy: locales[language], arabic: language === 'ar', preferences, busy, failed, reload,
    setLanguage: next => preferences ? save(changeLanguage(preferences, next)) : Promise.resolve(false),
    finishWelcome: () => preferences ? save({ ...preferences, welcomeSeen: true }) : Promise.resolve(false),
    update: changes => preferences ? save(updatePreferences(preferences, changes)) : Promise.resolve(false),
  }}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('app-provider-required');
  return value;
}
