import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Engine from '../modules/dughri-call-engine';
import { useApp } from '../src/components/AppProvider';
import { AppScreen, CountryCodeSelector, PhoneNumberInput, PrimaryButton, Txt } from '../src/components/ui';
import { IconWhatsApp } from '../src/components/icons';
import { Notice } from '../src/components/Screen';
import { composeManualNumber } from '../src/lib/preferences';
import { addRecent } from '../src/lib/recents';
import { routes } from '../src/navigation';
import { type } from '../src/theme';

type ManualResult = keyof typeof import('../src/locales/en/manual.json')['results'];

export default function Manual() {
  const { copy, preferences } = useApp();
  const [countryCode, setCountryCode] = useState(preferences?.countryCode ?? '+966');
  const [number, setNumber] = useState('');
  const [result, setResult] = useState<ManualResult>();
  const [busy, setBusy] = useState(false);
  const acting = useRef(false);
  const c = copy.manual;
  // Never leave an entered number on screen blur or app backgrounding.
  useFocusEffect(useCallback(() => () => setNumber(''), []));
  useEffect(() => {
    const app = AppState.addEventListener('change', state => { if (state !== 'active') setNumber(''); });
    return () => app.remove();
  }, []);
  const open = async () => {
    if (acting.current) return;
    const composed = composeManualNumber(countryCode, number);
    if (!composed) { setResult('number-invalid'); return; }
    acting.current = true; setBusy(true);
    try {
      const outcome = await Engine.launchWhatsAppTest(composed, preferences?.whatsappTarget === 'business');
      if (outcome === 'intent-dispatched') { addRecent(composed); setNumber(''); }
      setResult(outcome as ManualResult);
    } catch { setResult('launch-denied'); } // Never surface OS exceptions carrying phone data.
    finally { acting.current = false; setBusy(false); }
  };
  const countryName = (iso: string) => copy.settings.countries[iso as keyof typeof copy.settings.countries];
  return <AppScreen title={c.title} onClose={() => (router.canGoBack() ? router.back() : router.replace(routes.home))}>
    <View style={styles.head}>
      <Txt tone="muted" style={type.caption}>{c.subtitle}</Txt>
    </View>
    <View style={styles.inputRow}>
      <CountryCodeSelector value={countryCode} onChange={setCountryCode} countryName={countryName} />
      <PhoneNumberInput value={number} onChange={setNumber} placeholder={c.placeholder} />
    </View>
    <PrimaryButton label={c.cta} disabled={busy || number.replace(/\D/g, '').length < 6}
      onPress={() => void open()} icon={<IconWhatsApp size={20} />} />
    {result && <Notice error={result !== 'intent-dispatched'}>{c.results[result]}</Notice>}
    <Txt tone="muted" style={[type.small, styles.note]}>{c.note}</Txt>
  </AppScreen>;
}

const styles = StyleSheet.create({
  head: { alignItems: 'center' },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  note: { textAlign: 'center' },
});
