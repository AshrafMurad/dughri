import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState, PermissionsAndroid, StyleSheet, Switch, TextInput, View } from 'react-native';
import Engine from './modules/dughri-call-engine';
import { useApp } from './src/components/AppProvider';
import { Action, Body, DetailRow, Notice, Screen, Section } from './src/components/Screen';
import { useDeviceSnapshot } from './src/lib/useDeviceSnapshot';
import { useTheme } from './src/theme';

export default function Diagnostics() {
  const { arabic, copy: translations } = useApp();
  const { snapshot: latestSnapshot, failed, checking, refresh } = useDeviceSnapshot();
  const snapshot = failed || checking ? undefined : latestSnapshot;
  const { colors } = useTheme();
  const [result, setResult] = useState('unknown');
  const [busy, setBusy] = useState(false);
  const [number, setNumber] = useState('');
  const [business, setBusiness] = useState(false);
  const acting = useRef(false);
  useFocusEffect(useCallback(() => () => setNumber(''), []));
  useEffect(() => {
    const app = AppState.addEventListener('change', state => { if (state !== 'active') setNumber(''); });
    return () => app.remove();
  }, []);
  const copy = translations.diagnostics;
  const status = (code?: string) => copy.states[code as keyof typeof copy.states] ?? copy.states.unknown;
  const act = async (action: () => Promise<string | void>, refreshAfter = true) => {
    if (acting.current) return;
    acting.current = true; setBusy(true);
    try {
      const outcome = (await action()) ?? 'stopped';
      const refreshed = refreshAfter ? await refresh() : true;
      setResult(refreshed ? outcome : 'error');
    }
    catch { setResult('error'); } // Never surface OS exceptions containing phone data.
    finally { acting.current = false; setBusy(false); }
  };
  const row = (label: string, value?: string) => <DetailRow key={label} label={label} value={status(value)} />;
  const button = (label: string, action: () => Promise<string | void>, filled = false) =>
    <Action key={label} label={label} disabled={busy} variant={filled ? 'filled' : 'tonal'} onPress={() => void act(action)} />;

  return <Screen title={copy.title} footer={<Body size="caption" tone="muted">{copy.privacy}</Body>}>
    <Notice>{copy.intro}</Notice>
    {failed && <Notice error>{translations.permissions.error}</Notice>}
    <View accessibilityLiveRegion="polite"><DetailRow label={copy.result} value={busy || checking ? copy.busy : status(result)} /></View>
    <Section title={copy.capabilitiesTitle}>
      {row(copy.native, snapshot && !failed ? 'loaded' : 'unknown')}
      {row(copy.automatic, snapshot?.automatic)}
      {row(copy.background, snapshot?.background)}
      {row(copy.capCallDetection, snapshot?.capabilities?.callDetection)}
      {row(copy.capPhoneState, snapshot?.capabilities?.phoneState)}
      {row(copy.capNumberSource, snapshot?.capabilities?.numberSource)}
      {row(copy.capOverlay, snapshot?.capabilities?.overlay)}
      {row(copy.capBackground, snapshot?.capabilities?.backgroundOperation)}
      {row(copy.engineMode, snapshot?.engine)}
    </Section>
    <Section title={copy.accessTitle}>
      {row(copy.role, snapshot?.role)}
      <Body size="caption" tone="muted">{copy.roleWarning}</Body>
      {button(copy.requestRole, () => Engine.requestScreeningRole())}
      {row(copy.phone, snapshot?.phonePermission)}
      <Body size="caption" tone="muted">{copy.phoneReason}</Body>
      {button(copy.requestPhone, () => PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE))}
      {row(copy.overlayPermission, snapshot?.overlayPermission)}
      <Body size="caption" tone="muted">{copy.overlayReason}</Body>
      {button(copy.requestOverlay, () => Engine.openOverlaySettings())}
    </Section>
    <Section title={copy.observationTitle}>
      {button(copy.start, () => Engine.startObservation(), true)}
      {button(copy.stop, async () => { setNumber(''); await Engine.stopObservation(); })}
      {row(copy.observer, snapshot?.observer)}
      {row(copy.state, snapshot?.state)}
      {row(copy.direction, snapshot?.direction)}
      <DetailRow label={copy.number}><Body ltr>{snapshot?.maskedNumber === 'none' ? status('none') : snapshot?.maskedNumber ?? status('unknown')}</Body></DetailRow>
      {row(copy.completion, snapshot?.completion)}
      {row(copy.overlay, snapshot?.overlay)}
      <Action label={copy.refresh} disabled={busy || checking}
        onPress={() => void act(async () => await refresh() ? 'loaded' : 'error', false)} />
    </Section>
    <Section title={copy.tests}>
      <Body size="caption" tone="muted">{copy.testNote}</Body>
      <Body size="label">{copy.input}</Body>
      <TextInput style={[styles.input, { borderColor: colors.outline, backgroundColor: colors.surface, color: colors.text }]}
        value={number} onChangeText={setNumber} editable={!busy} accessibilityLabel={copy.input}
        placeholder={copy.input} placeholderTextColor={colors.muted} selectionColor={colors.primary}
        keyboardType="phone-pad" autoComplete="off" importantForAutofill="no" textContentType="none"
        secureTextEntry autoCorrect={false} maxLength={40} />
      {button(copy.personal, async () => { const target = number; setNumber(''); return Engine.launchWhatsAppTest(target, false); })}
      {button(copy.business, async () => { const target = number; setNumber(''); return Engine.launchWhatsAppTest(target, true); })}
      <View style={[styles.toggle, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
        <View style={styles.grow}><Body>{copy.variant}</Body></View>
        <Switch accessibilityLabel={copy.variant} value={business} onValueChange={setBusiness} disabled={busy}
          trackColor={{ false: colors.outline, true: colors.primary }} thumbColor={colors.background} style={styles.switch} />
      </View>
      {button(copy.showOverlay, async () => { const target = number; setNumber(''); return Engine.showOverlayProbe(target, business, arabic); })}
      {button(copy.dismiss, () => Engine.dismissOverlay())}
    </Section>
    <Section title={copy.trace}>
      {snapshot?.trace.length ? snapshot.trace.map((entry, index) => <View key={index} style={[styles.trace, { borderBottomColor: colors.outline }]}>
        <Body size="caption" ltr tone="muted">{entry.at}</Body><Body size="caption">{status(entry.code)}</Body>
      </View>) : <Body tone="muted">{copy.traceEmpty}</Body>}
    </Section>
  </Screen>;
}

const styles = StyleSheet.create({
  input: { minHeight: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, writingDirection: 'ltr', textAlign: 'left' },
  toggle: { alignItems: 'center', gap: 16, paddingVertical: 8 }, grow: { flex: 1 },
  switch: { minWidth: 48, minHeight: 48 },
  trace: { paddingVertical: 12, gap: 4, borderBottomWidth: StyleSheet.hairlineWidth },
});
