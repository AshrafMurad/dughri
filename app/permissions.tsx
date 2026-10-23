import { useEffect, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import Engine from '../modules/dughri-call-engine';
import { useApp } from '../src/components/AppProvider';
import { AppScreen, PermissionRow, PrimaryButton, SecondaryButton, Txt } from '../src/components/ui';
import { IconBell, IconOverlay, IconPhone } from '../src/components/icons';
import { Notice } from '../src/components/Screen';
import { ShieldIllustration } from '../src/components/illustrations';
import { useDeviceSnapshot } from '../src/lib/useDeviceSnapshot';
import { accessStatus, type AccessStatus } from '../src/lib/status';
import { routes } from '../src/navigation';
import { type } from '../src/theme';

type RowState = { text: string; tone: 'muted' | 'primary' };

export default function Permissions() {
  const { copy } = useApp();
  const { snapshot, failed, checking, refresh } = useDeviceSnapshot();
  const [busy, setBusy] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<AccessStatus>('unknown');
  const acting = useRef(false);
  const c = copy.permissions;
  useEffect(() => {
    void PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
      .then(granted => setNotificationPermission(granted ? 'granted' : 'missing'))
      .catch(() => setNotificationPermission('unknown'));
  }, []);
  const state = (value?: string): RowState => {
    if (checking || failed || !value) return { text: c.statuses.checking, tone: 'muted' };
    const mapped = accessStatus(value);
    const label = mapped === 'granted' ? c.statuses.granted : mapped === 'missing' ? c.statuses.missing
      : mapped === 'restricted' ? c.statuses.restricted : mapped === 'unsupported' ? c.statuses.unsupported : c.statuses.unknown;
    return { text: label, tone: mapped === 'granted' ? 'primary' : 'muted' };
  };
  const staticState = (mapped: AccessStatus): RowState => ({
    text: mapped === 'granted' ? c.statuses.granted : mapped === 'missing' ? c.statuses.missing
      : mapped === 'unsupported' ? c.statuses.unsupported : mapped === 'restricted' ? c.statuses.restricted : c.statuses.unknown,
    tone: mapped === 'granted' ? 'primary' : 'muted',
  });
  const act = async (request: () => Promise<unknown>) => {
    if (acting.current) return;
    acting.current = true; setBusy(true); setRequestFailed(false);
    try {
      const result = await request();
      if (typeof result === 'string' && result.endsWith('-error')) setRequestFailed(true);
      await refresh();
      void PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        .then(granted => setNotificationPermission(granted ? 'granted' : 'missing'))
        .catch(() => setNotificationPermission('unknown'));
    } catch { setRequestFailed(true); }
    finally { acting.current = false; setBusy(false); }
  };
  const phone = state(snapshot?.phonePermission);
  const role = state(snapshot?.role);
  const overlay = state(snapshot?.overlayPermission);
  const notifications = staticState(notificationPermission);
  const grantFirstMissing = () => {
    const phoneAccess = accessStatus(snapshot?.phonePermission);
    if (phoneAccess !== 'granted') return act(async () => {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) await Linking.openSettings();
      return result;
    });
    if (accessStatus(snapshot?.overlayPermission) !== 'granted') return act(() => Engine.openOverlaySettings());
    return act(async () => {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) await Linking.openSettings();
      return result;
    });
  };
  return <AppScreen title={c.title} onBack={() => (router.canGoBack() ? router.back() : router.replace(routes.home))}>
    <View style={styles.hero}>
      <ShieldIllustration />
      <Txt style={[type.headline, { fontWeight: '700' }]}>{c.heading}</Txt>
      <Txt tone="muted" style={type.caption}>{c.subtitle}</Txt>
    </View>
    <View style={styles.group}>
      <PermissionRow icon={<IconPhone />} label={c.callTitle} caption={c.callCaption}
        status={phone.text} statusTone={phone.tone}
        actionLabel={copy.diagnostics.requestPhone} disabled={busy || checking || snapshot?.phonePermission === 'granted'}
        onAction={() => void act(async () => {
          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE);
          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) await Linking.openSettings();
          return result;
        })}>
        <View style={styles.roleBlock}>
          <Txt tone="muted" style={type.small}>{c.callRoleCaption}</Txt>
          <SecondaryButton label={c.callRoleAction} disabled={busy || checking || snapshot?.role === 'granted'}
            onPress={() => void act(() => Engine.requestScreeningRole())} />
          <Txt tone="muted" style={type.small}>{role.text}</Txt>
        </View>
      </PermissionRow>
      <PermissionRow icon={<IconOverlay />} label={c.overlayTitle} caption={c.overlayCaption}
        status={overlay.text} statusTone={overlay.tone}
        actionLabel={copy.diagnostics.requestOverlay} disabled={busy || checking}
        onAction={() => void act(() => Engine.openOverlaySettings())} />
      <PermissionRow icon={<IconBell />} label={c.notificationsTitle} caption={c.notificationsCaption}
        status={notifications.text} statusTone={notifications.tone}
        actionLabel={copy.diagnostics.requestPhone} disabled={busy || notificationPermission === 'granted'}
        onAction={() => void act(async () => {
          const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) await Linking.openSettings();
          return result;
        })} />
    </View>
    {(failed || requestFailed) && <Notice error>{c.error}</Notice>}
    <PrimaryButton label={c.grant} disabled={busy || checking} onPress={() => void grantFirstMissing()} />
    <SecondaryButton label={c.later} disabled={busy} onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.home))} />
  </AppScreen>;
}

const styles = StyleSheet.create({
  hero: { gap: 12, alignItems: 'center', paddingVertical: 8 },
  group: { borderRadius: 20, overflow: 'hidden' },
  roleBlock: { gap: 6, alignItems: 'flex-start', paddingTop: 4 },
});
