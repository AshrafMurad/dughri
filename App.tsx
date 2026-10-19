import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, Button, PermissionsAndroid, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import Engine, { type Snapshot } from './modules/dughri-call-engine';
import { useApp } from './src/components/AppProvider';

export default function App() {
  const { arabic, copy: translations, setLanguage } = useApp();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [result, setResult] = useState('unknown');
  const [busy, setBusy] = useState(false);
  const [number, setNumber] = useState('');
  const [business, setBusiness] = useState(false);
  useFocusEffect(useCallback(() => () => setNumber(''), []));
  const copy = translations.diagnostics;
  const status = (code?: string) => copy.states[code as keyof typeof copy.states] ?? copy.states.unknown;
  const refresh = useCallback(async () => setSnapshot(await Engine.getSnapshot()), []);
  useEffect(() => {
    void refresh().catch(() => setResult('error'));
    const subscription = Engine.addListener('diagnosticsChanged', setSnapshot);
    const app = AppState.addEventListener('change', state => {
      if (state === 'active') void refresh().catch(() => setResult('error'));
      else setNumber('');
    });
    return () => { subscription.remove(); app.remove(); };
  }, [refresh]);
  const act = async (action: () => Promise<string | void>) => {
    setBusy(true);
    try { setResult((await action()) ?? 'stopped'); await refresh(); }
    catch { setResult('error'); } // Never surface OS exceptions with phone data.
    finally { setBusy(false); }
  };
  const labelStyle = [styles.text, { textAlign: arabic ? 'right' as const : 'left' as const, writingDirection: arabic ? 'rtl' as const : 'ltr' as const }];
  const row = (label: string, value?: string) => <View key={label} style={styles.row}>
    <Text style={[...labelStyle, styles.label]}>{label}</Text>
    <Text style={labelStyle}>{status(value)}</Text>
  </View>;
  const button = (title: string, action: () => Promise<string | void>) => <View style={styles.action} key={title}>
    <Button title={title} disabled={busy} color="#245d76" onPress={() => void act(action)} />
  </View>;

  return <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <StatusBar barStyle="dark-content" />
    <Text accessibilityRole="header" style={[...labelStyle, styles.title]}>{copy.title}</Text>
    <Text style={labelStyle}>{copy.intro}</Text>
    {button(copy.language, async () => await setLanguage(arabic ? 'en' : 'ar') ? 'loaded' : 'error')}
    {row(copy.native, snapshot ? 'loaded' : 'unknown')}
    {row(copy.automatic, snapshot?.automatic)}
    {row(copy.background, snapshot?.background)}
    {row(copy.capCallDetection, snapshot?.capabilities?.callDetection)}
    {row(copy.capPhoneState, snapshot?.capabilities?.phoneState)}
    {row(copy.capNumberSource, snapshot?.capabilities?.numberSource)}
    {row(copy.capOverlay, snapshot?.capabilities?.overlay)}
    {row(copy.capBackground, snapshot?.capabilities?.backgroundOperation)}
    {row(copy.engineMode, snapshot?.engine)}
    {row(copy.role, snapshot?.role)}
    <Text style={labelStyle}>{copy.roleWarning}</Text>
    {button(copy.requestRole, () => Engine.requestScreeningRole())}
    {row(copy.phone, snapshot?.phonePermission)}
    <Text style={labelStyle}>{copy.phoneReason}</Text>
    {button(copy.requestPhone, () => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE))}
    {row(copy.overlayPermission, snapshot?.overlayPermission)}
    <Text style={labelStyle}>{copy.overlayReason}</Text>
    {button(copy.requestOverlay, () => Engine.openOverlaySettings())}
    {button(copy.start, () => Engine.startObservation())}
    {button(copy.stop, async () => { setNumber(''); await Engine.stopObservation(); })}
    {row(copy.observer, snapshot?.observer)}
    {row(copy.state, snapshot?.state)}
    {row(copy.direction, snapshot?.direction)}
    <View style={styles.row}>
      <Text style={[...labelStyle, styles.label]}>{copy.number}</Text>
      <Text style={[styles.text, styles.ltr]}>{snapshot?.maskedNumber === 'none' ? status('none') : snapshot?.maskedNumber ?? status('unknown')}</Text>
    </View>
    {row(copy.completion, snapshot?.completion)}
    {row(copy.overlay, snapshot?.overlay)}
    {row(copy.result, busy ? 'unknown' : result)}
    {button(copy.refresh, async () => { await refresh(); return 'loaded'; })}
    <Text accessibilityRole="header" style={[...labelStyle, styles.heading]}>{copy.tests}</Text>
    <Text style={labelStyle}>{copy.testNote}</Text>
    <TextInput style={styles.input} value={number} onChangeText={setNumber}
      accessibilityLabel={copy.input} placeholder={copy.input} placeholderTextColor="#53616a"
      keyboardType="phone-pad" autoComplete="off" importantForAutofill="no"
      secureTextEntry autoCorrect={false} maxLength={40} />
    {button(copy.personal, async () => { const target = number; setNumber(''); return Engine.launchWhatsAppTest(target, false); })}
    {button(copy.business, async () => { const target = number; setNumber(''); return Engine.launchWhatsAppTest(target, true); })}
    <View style={[styles.toggle, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
      <Text style={[...labelStyle, styles.grow]}>{copy.variant}</Text>
      <Switch accessibilityLabel={copy.variant} value={business} onValueChange={setBusiness} />
    </View>
    {button(copy.showOverlay, async () => { const target = number; setNumber(''); return Engine.showOverlayProbe(target, business, arabic); })}
    {button(copy.dismiss, () => Engine.dismissOverlay())}
    <Text accessibilityRole="header" style={[...labelStyle, styles.heading]}>{copy.trace}</Text>
    {snapshot?.trace.length ? snapshot.trace.map((entry, index) => <View key={index}
      style={{ flexDirection: arabic ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 12 }}>
      <Text style={[styles.text, styles.ltr]}>{entry.at}</Text><Text style={labelStyle}>{status(entry.code)}</Text>
    </View>) : <Text style={labelStyle}>{copy.traceEmpty}</Text>}
    <Text style={[...labelStyle, styles.heading]}>{copy.privacy}</Text>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 40, backgroundColor: '#ffffff' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '600', marginTop: 28, marginBottom: 12 },
  text: { fontSize: 16, lineHeight: 25, color: '#172c36' },
  label: { fontWeight: '600' },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#bac4c9', paddingVertical: 12 },
  action: { minHeight: 48, justifyContent: 'center', marginVertical: 5 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#53616a', padding: 12, marginTop: 16, fontSize: 18, writingDirection: 'ltr', color: '#172c36' },
  ltr: { writingDirection: 'ltr', textAlign: 'left' },
  toggle: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  grow: { flex: 1 },
});
