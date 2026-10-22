import { useRef, useState } from 'react';
import { Linking, PermissionsAndroid } from 'react-native';
import Engine from '../modules/dughri-call-engine';
import { useApp } from '../src/components/AppProvider';
import { Action, Body, DetailRow, Notice, Panel, RouteLink, Screen, Section } from '../src/components/Screen';
import { useDeviceSnapshot } from '../src/lib/useDeviceSnapshot';
import { accessStatus } from '../src/lib/status';

export default function Permissions() {
  const { copy } = useApp();
  const { snapshot, failed, checking, refresh } = useDeviceSnapshot();
  const [busy, setBusy] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const acting = useRef(false);
  const c = copy.permissions;
  const state = (value?: string) => {
    if (checking || failed || !value) return c.unknown;
    return c[accessStatus(value)];
  };
  const act = async (request: () => Promise<unknown>) => {
    if (acting.current) return;
    acting.current = true; setBusy(true); setRequestFailed(false);
    try {
      const result = await request();
      if (typeof result === 'string' && result.endsWith('-error')) setRequestFailed(true);
      await refresh();
    } catch { setRequestFailed(true); }
    finally { acting.current = false; setBusy(false); }
  };
  return <Screen title={c.title} footer={<Body size="caption" tone="muted">{copy.common.privacy}</Body>}>
    <Body tone="muted">{c.intro}</Body>
    <Panel tone="raised"><Body heading>{c.summary}</Body><Body>{c.summaryDetail}</Body></Panel>
    {(failed || requestFailed) && <Notice error>{c.error}</Notice>}
    <DetailRow label={c.role} value={state(snapshot?.role)}>
      <Body size="caption" tone="muted">{copy.diagnostics.roleWarning}</Body>
      <Action label={copy.diagnostics.requestRole} disabled={busy || checking || snapshot?.role === 'granted' || snapshot?.role === 'unsupported'}
        onPress={() => void act(() => Engine.requestScreeningRole())} />
    </DetailRow>
    <DetailRow label={c.phone} value={state(snapshot?.phonePermission)}>
      <Body size="caption" tone="muted">{copy.diagnostics.phoneReason}</Body>
      <Action label={copy.diagnostics.requestPhone} disabled={busy || checking || snapshot?.phonePermission === 'granted'}
        onPress={() => void act(async () => {
          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) await Linking.openSettings();
          return result;
        })} />
    </DetailRow>
    <DetailRow label={c.overlay} value={state(snapshot?.overlayPermission)}>
      <Body size="caption" tone="muted">{copy.diagnostics.overlayReason}</Body>
      <Action label={copy.diagnostics.requestOverlay} disabled={busy || checking} onPress={() => void act(() => Engine.openOverlaySettings())} />
    </DetailRow>
    <Action variant="text" label={checking ? c.checking : c.refresh} disabled={busy || checking} onPress={() => void refresh()} />
    <Section title={c.numbers}><Body tone="muted">{c.numbersDetail}</Body></Section>
    <Section title={c.technical}><RouteLink href="/diagnostics" label={copy.home.diagnostics} detail={c.technicalDetail} /></Section>
  </Screen>;
}
