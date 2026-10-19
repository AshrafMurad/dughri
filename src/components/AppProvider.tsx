import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import Engine from '../../modules/dughri-call-engine';
import { locales, type Copy, type LanguagePreference } from '../locales';
import { changeLanguage, parsePreferences, resolveLanguage, type Preferences } from '../lib/preferences';
import { safeLog } from '../lib/safe-log.mjs';

interface AppContextValue {
  copy: Copy; arabic: boolean; preferences?: Preferences; busy: boolean; failed: boolean;
  setLanguage: (language: LanguagePreference) => Promise<boolean>;
  finishWelcome: () => Promise<boolean>;
  reload: () => void;
}
const Context = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>();
  const [systemLocale, setSystemLocale] = useState(Intl.DateTimeFormat().resolvedOptions().locale);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const writing = useRef(false);
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
    });
    return () => subscription.remove();
  }, [reload]);
  const language = resolveLanguage(preferences?.language ?? 'system', systemLocale);
  const save = async (next: Preferences) => {
    if (writing.current) return false;
    writing.current = true; setBusy(true); setFailed(false);
    try {
      await Engine.setAppPreferences(next.language, next.welcomeSeen);
      setPreferences(next);
      return true;
    } catch { setFailed(true); safeLog(__DEV__, 'preferences-error'); return false; }
    finally { writing.current = false; setBusy(false); }
  };
  return <Context.Provider value={{ copy: locales[language], arabic: language === 'ar', preferences, busy, failed, reload,
    setLanguage: next => preferences ? save(changeLanguage(preferences, next)) : Promise.resolve(false),
    finishWelcome: () => preferences ? save({ ...preferences, welcomeSeen: true }) : Promise.resolve(false),
  }}>{children}</Context.Provider>;
}

export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error('app-provider-required');
  return value;
}
