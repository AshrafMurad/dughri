import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { useApp } from '../../src/components/AppProvider';
import { AppScreen, Card, PrimaryButton, SecondaryButton, SettingRow, Txt } from '../../src/components/ui';
import { IconClock, IconGear, IconGlobe, IconPhone, IconWhatsApp } from '../../src/components/icons';
import { homeStatus } from '../../src/lib/status';
import { useDeviceSnapshot } from '../../src/lib/useDeviceSnapshot';
import { useShortcutToggle } from '../../src/lib/useShortcutToggle';
import { COUNTRY_CODES } from '../../src/lib/preferences';
import { type, useTheme } from '../../src/theme';

export default function Home() {
  const { copy, arabic, preferences, busy } = useApp();
  const { colors } = useTheme();
  const { snapshot, failed, checking } = useDeviceSnapshot();
  const { toggling, toggle } = useShortcutToggle();
  if (!preferences?.welcomeSeen) return <Redirect href="/onboarding" />;
  const status = homeStatus(checking ? undefined : snapshot, failed);
  const countryName = (code: string) => {
    const iso = COUNTRY_CODES.find(entry => entry.code === code)?.iso;
    return iso ? copy.settings.countries[iso] : '';
  };
  return <AppScreen title={copy.common.appName} trailing={<Pressable accessibilityRole="button"
    accessibilityLabel={copy.common.settings} onPress={() => router.push('/settings')} hitSlop={12}
    android_ripple={{ color: colors.outline }} style={styles.headerAction}><IconGear color={colors.muted} /></Pressable>}>
    <Card>
      <View style={[styles.masterRow, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
        <View style={styles.masterText}>
          <Txt style={type.label}>{copy.home.shortcutTitle}</Txt>
          <Txt tone="muted" style={type.caption}>{copy.home.shortcutCaption}</Txt>
        </View>
        <Switch accessibilityState={{ disabled: busy || toggling }} disabled={busy || toggling}
          value={preferences.shortcutEnabled} onValueChange={next => void toggle(next)}
          trackColor={{ false: '#E8EBE9', true: '#0B8F69' }} thumbColor="#FFFFFF" />
      </View>
      <Txt tone="muted" style={type.small}>{copy.home.status[status]}</Txt>
      {(status === 'needs-permission' || status === 'error') &&
        <SecondaryButton label={copy.home.reviewPermissions} onPress={() => router.push('/permissions')} />}
    </Card>
    <View style={styles.rows}>
      <SettingRow icon={<IconPhone />} label={copy.home.callTypes} value={copy.home.callTypesValue} onPress={() => router.push('/settings')} />
      <SettingRow icon={<IconGlobe />} label={copy.home.countryCode}
        value={`${preferences.countryCode} (${countryName(preferences.countryCode)})`} onPress={() => router.push('/settings')} />
      <SettingRow icon={<IconClock />} label={copy.home.numberFormat} value={copy.home.numberFormatValue} onPress={() => router.push('/settings')} />
      <SettingRow icon={<IconWhatsApp />} label={copy.home.whatsappTarget}
        value={preferences.whatsappTarget === 'business' ? copy.settings.business : copy.settings.whatsapp}
        onPress={() => router.push('/settings')} />
    </View>
    <Card>
      <View style={styles.masterText}>
        <Txt style={type.label}>{copy.home.manual}</Txt>
        <Txt tone="muted" style={type.caption}>{copy.home.manualCaption}</Txt>
      </View>
      <PrimaryButton label={copy.manual.cta} onPress={() => router.push('/manual')} icon={<IconWhatsApp size={20} />} />
    </Card>
    <Txt tone="muted" style={[type.small, styles.limitations]}>{copy.home.limitations}</Txt>
  </AppScreen>;
}

const styles = StyleSheet.create({
  headerAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  masterRow: { alignItems: 'center', gap: 12 },
  masterText: { flex: 1, gap: 2 },
  rows: { borderRadius: 20, overflow: 'hidden' },
  limitations: { textAlign: 'center' },
});
