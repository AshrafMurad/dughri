import { useRef, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useApp } from '../../src/components/AppProvider';
import { AppScreen, Card, CountryCodeSelector, RadioRow, SectionHeading, SettingRow, SettingSwitchRow, Txt } from '../../src/components/ui';
import { IconBell, IconCheck, IconGlobe, IconOverlay, IconPhone, IconWhatsApp } from '../../src/components/icons';
import { Notice } from '../../src/components/Screen';
import { useShortcutToggle } from '../../src/lib/useShortcutToggle';
import { type } from '../../src/theme';

export default function Settings() {
  const { copy, arabic, preferences, busy, failed, update } = useApp();
  const { toggling, toggle } = useShortcutToggle();
  const [notice, setNotice] = useState(false);
  const acting = useRef(false);
  if (!preferences) return null;
  const toggleNotifications = async (next: boolean) => {
    if (acting.current) return;
    acting.current = true; setNotice(false);
    try {
      if (next) {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (result !== PermissionsAndroid.RESULTS.GRANTED) { setNotice(true); return; }
      }
      await update({ notifications: next });
    } finally { acting.current = false; }
  };
  const countryName = (iso: string) => copy.settings.countries[iso as keyof typeof copy.settings.countries];
  return <AppScreen title={copy.settings.title}>
    <SectionHeading>{copy.settings.shortcutSection}</SectionHeading>
    <View style={styles.group}>
      <SettingSwitchRow icon={<IconOverlay />} label={copy.settings.master} caption={copy.settings.masterCaption}
        value={preferences.shortcutEnabled} disabled={busy || toggling} onValueChange={next => void toggle(next)} />
      <SettingSwitchRow icon={<IconPhone />} label={copy.settings.incoming} value={preferences.incoming}
        disabled={busy || !preferences.shortcutEnabled} onValueChange={next => void update({ incoming: next })} />
      <SettingSwitchRow icon={<IconCheck />} label={copy.settings.outgoing} value={preferences.outgoing}
        disabled={busy || !preferences.shortcutEnabled} onValueChange={next => void update({ outgoing: next })} />
      <SettingSwitchRow icon={<IconBell />} label={copy.settings.notifications} value={preferences.notifications}
        disabled={busy} onValueChange={next => void toggleNotifications(next)} />
    </View>
    {notice && <Notice>{copy.settings.notificationsDenied}</Notice>}
    {failed && <Notice error>{copy.errors.preferences}</Notice>}

    <SectionHeading>{copy.settings.preferencesSection}</SectionHeading>
    <View style={styles.group}>
      <View style={[styles.inlineRow, { borderBottomColor: 'transparent', flexDirection: arabic ? 'row-reverse' : 'row' }]}>
        <IconGlobe />
        <Txt style={[type.label, styles.inlineLabel]}>{copy.settings.countryCode}</Txt>
        <CountryCodeSelector value={preferences.countryCode}
          onChange={code => void update({ countryCode: code })} countryName={countryName} />
      </View>
      <RadioRow label={copy.settings.whatsapp} selected={preferences.whatsappTarget === 'whatsapp'}
        onSelect={() => void update({ whatsappTarget: 'whatsapp' })} />
      <RadioRow label={copy.settings.business} selected={preferences.whatsappTarget === 'business'}
        onSelect={() => void update({ whatsappTarget: 'business' })} />
      <SettingRow icon={<IconCheck />} label={copy.settings.numberFormat} value={copy.settings.autoFormat} />
    </View>

    <SectionHeading>{copy.settings.appSection}</SectionHeading>
    <View style={styles.group}>
      <SettingRow icon={<IconGlobe />} label={copy.settings.language}
        value={arabic ? copy.language.arabic : copy.language.english} onPress={() => router.push('/language')} />
      <SettingRow icon={<IconOverlay />} label={copy.settings.permissions} onPress={() => router.push('/permissions')} />
      <SettingRow icon={<IconWhatsApp />} label={copy.settings.diagnostics} onPress={() => router.push('/diagnostics')} />
      <SettingRow icon={<IconPhone />} label={copy.settings.onboarding} onPress={() => router.push('/onboarding')} />
    </View>

    <SectionHeading>{copy.settings.aboutSection}</SectionHeading>
    <Card>
      <Txt tone="muted" style={type.caption}>{copy.settings.privacy}</Txt>
      <Txt tone="muted" style={type.small}>{copy.settings.brand}</Txt>
      <Txt tone="muted" style={type.small}>{copy.common.privacy}</Txt>
    </Card>
  </AppScreen>;
}

const styles = StyleSheet.create({
  group: { borderRadius: 20, overflow: 'hidden' },
  inlineRow: { minHeight: 64, alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16 },
  inlineLabel: { flex: 1 },
});
