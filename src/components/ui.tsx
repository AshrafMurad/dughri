import { useState, type ReactNode } from 'react';
import { Image, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from './AppProvider';
import { type, useTheme, cardShadow, radius } from '../theme';
import { COUNTRY_CODES } from '../lib/preferences';
import { IconCheck, IconChevron, IconClose, IconGear, IconWhatsApp } from './icons';

function Txt({ children, ltr = false, style, tone = 'text' }: {
  children: ReactNode; ltr?: boolean; style?: TextStyle | TextStyle[]; tone?: 'text' | 'muted' | 'primary' | 'danger' | 'onPrimary';
}) {
  const { arabic } = useApp();
  const { colors } = useTheme();
  return <Text style={[type.body, { color: colors[tone], flexShrink: 1 },
    { writingDirection: ltr || !arabic ? 'ltr' : 'rtl', textAlign: ltr ? 'left' : arabic ? 'right' : 'left' }, style]}>{children}</Text>;
}

export function PrimaryButton({ label, onPress, disabled = false, icon }: {
  label: string; onPress: () => void; disabled?: boolean; icon?: ReactNode;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    android_ripple={{ color: colors.primaryDark }} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary },
      pressed && styles.pressed, disabled && styles.disabled]}>
    {icon}
    <Text style={[type.label, { color: colors.onPrimary, writingDirection: arabic ? 'rtl' : 'ltr' }]}>{label}</Text>
  </Pressable>;
}

export function SecondaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const { colors } = useTheme();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    android_ripple={{ color: colors.outline }} style={({ pressed }) => [styles.textButton, pressed && styles.pressed, disabled && styles.disabled]}>
    <Txt tone="primary" style={type.label}>{label}</Txt>
  </Pressable>;
}

/** White card with subtle shadow — the showcase's primary surface. */
export function Card({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.card, cardShadow, { backgroundColor: colors.surface }]}>{children}</View>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <Txt style={[type.title, { fontWeight: '600' }]}>{children}</Txt>;
}

export function SettingRow({ icon, label, value, onPress }: {
  icon?: ReactNode; label: string; value?: string; onPress?: () => void;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <Pressable accessibilityRole={onPress ? 'button' : undefined} disabled={!onPress} onPress={onPress}
    android_ripple={onPress ? { color: colors.outline } : undefined}
    style={({ pressed }) => [styles.row, { borderBottomColor: colors.outline, backgroundColor: colors.surface },
      { flexDirection: arabic ? 'row-reverse' : 'row' }, onPress && pressed && styles.pressedRow]}>
    {icon}
    <View style={[styles.grow, { gap: 2, alignItems: arabic ? 'flex-end' : 'flex-start' }]}>
      <Txt style={type.label}>{label}</Txt>
      {value !== undefined && <Txt tone="muted" style={type.caption}>{value}</Txt>}
    </View>
    {onPress && <View style={{ transform: [{ rotate: arabic ? '180deg' : '0deg' }] }}><IconChevron /></View>}
  </Pressable>;
}

export function SettingSwitchRow({ icon, label, caption, value, onValueChange, disabled = false }: {
  icon?: ReactNode; label: string; caption?: string; value: boolean; onValueChange: (next: boolean) => void; disabled?: boolean;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <View style={[styles.row, { borderBottomColor: colors.outline, backgroundColor: colors.surface,
    flexDirection: arabic ? 'row-reverse' : 'row' }]}>
    {icon}
    <View style={[styles.grow, { gap: 2, alignItems: arabic ? 'flex-end' : 'flex-start' }]}>
      <Txt style={type.label}>{label}</Txt>
      {caption !== undefined && <Txt tone="muted" style={type.small}>{caption}</Txt>}
    </View>
    <Switch accessibilityState={{ disabled }} disabled={disabled} value={value} onValueChange={onValueChange}
      trackColor={{ false: colors.outline, true: colors.primary }} thumbColor={colors.surface}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} />
  </View>;
}

export function PermissionRow({ icon, label, caption, status, statusTone = 'muted', actionLabel, onAction, disabled = false, children }: {
  icon?: ReactNode; label: string; caption?: string; status?: string; statusTone?: 'muted' | 'primary' | 'danger';
  actionLabel?: string; onAction?: () => void; disabled?: boolean; children?: ReactNode;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <View style={[styles.row, { borderBottomColor: colors.outline, backgroundColor: colors.surface,
    flexDirection: arabic ? 'row-reverse' : 'row', alignItems: 'center' }]}>
    {icon}
    <View style={[styles.grow, { gap: 4, alignItems: arabic ? 'flex-end' : 'flex-start' }]}>
      <Txt style={type.label}>{label}</Txt>
      {caption !== undefined && <Txt tone="muted" style={type.small}>{caption}</Txt>}
      {children}
    </View>
    <View style={{ gap: 8, alignItems: 'flex-end' }}>
      {status !== undefined && <Txt tone={statusTone} style={[type.small, { fontWeight: '600' }]}>{status}</Txt>}
      {actionLabel !== undefined && onAction !== undefined && <SecondaryButton label={actionLabel} onPress={onAction} disabled={disabled} />}
    </View>
  </View>;
}

export function RadioRow({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onSelect}
    android_ripple={{ color: colors.outline }}
    style={({ pressed }) => [styles.row, { borderBottomColor: colors.outline, backgroundColor: colors.surface },
      { flexDirection: arabic ? 'row-reverse' : 'row' }, pressed && styles.pressedRow]}>
    <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.outline }]}>
      {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
    </View>
    <Txt style={[type.label, { flex: 1 }]}>{label}</Txt>
    {selected && <IconCheck />}
  </Pressable>;
}

export function CountryCodeSelector({ value, onChange, countryName }: { value: string; onChange: (code: string) => void; countryName: (iso: string) => string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return <View>
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} android_ripple={{ color: colors.outline }}
      style={styles.codeButton}>
      <Txt ltr style={type.label}>{value}</Txt>
      <IconChevron size={14} />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
        <Pressable style={[styles.modalSheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 2 }}>
            {COUNTRY_CODES.map(entry => <Pressable key={entry.code} accessibilityRole="button"
              onPress={() => { onChange(entry.code); setOpen(false); }} android_ripple={{ color: colors.outline }}
              style={({ pressed }) => [styles.codeOption, pressed && styles.pressedRow]}>
              <Txt ltr style={type.label}>{entry.code}</Txt>
              <Txt tone="muted" style={type.caption}>{countryName(entry.iso)}</Txt>
              {value === entry.code && <IconCheck />}
            </Pressable>)}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  </View>;
}

export function PhoneNumberInput({ value, onChange, placeholder }: {
  value: string; onChange: (next: string) => void; placeholder: string;
}) {
  const { colors } = useTheme();
  return <TextInput style={[styles.phoneInput, { borderColor: colors.outline, backgroundColor: colors.surface, color: colors.text }]}
    value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted}
    selectionColor={colors.primary} keyboardType="phone-pad" autoComplete="off" importantForAutofill="no"
    textContentType="none" autoCorrect={false} maxLength={20} inputMode="tel" />;
}

export function CallHistoryRow({ number, when, onOpen }: { number: string; when: string; onOpen: () => void }) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <View style={[styles.row, { borderBottomColor: colors.outline, backgroundColor: colors.surface,
    flexDirection: arabic ? 'row-reverse' : 'row' }]}>
    <View style={[styles.historyIcon, { backgroundColor: colors.raised }]}><IconWhatsApp size={22} /></View>
    <View style={[styles.grow, { gap: 2, alignItems: arabic ? 'flex-end' : 'flex-start' }]}>
      <Txt ltr style={[type.label, { fontSize: 16 }]}>{number}</Txt>
      <Txt tone="muted" style={type.small}>{when}</Txt>
    </View>
    <Pressable accessibilityRole="button" onPress={onOpen} android_ripple={{ color: colors.outline }}
      style={({ pressed }) => [styles.historyAction, pressed && styles.pressed]}>
      <IconWhatsApp size={26} />
    </Pressable>
  </View>;
}

/** Screen 5 — the signature post-call card. Rendered in-app for onboarding
 * preview; real overlays are drawn natively. */
export function PostCallFloatingCard({ appName, title, number, ctaLabel, onClose, onCta, preview = false }: {
  appName: string; title: string; number: string; ctaLabel: string; onClose: () => void; onCta: () => void; preview?: boolean;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <View style={[styles.card, cardShadow, { backgroundColor: colors.surface, padding: 20, gap: 16 },
    preview && { width: 300 }]}>
    <View style={{ flexDirection: arabic ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
      <Image source={require('../../assets/app-icon.png')} style={{ width: 28, height: 28, borderRadius: 8 }} resizeMode="contain" accessible={false} />
      <Txt style={[type.label, { flex: 1 }]}>{appName}</Txt>
      <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12} android_ripple={{ color: colors.outline }}
        style={styles.closeHit}><IconClose size={18} /></Pressable>
    </View>
    <View style={{ gap: 4, alignItems: arabic ? 'flex-end' : 'flex-start' }}>
      <Txt style={[type.title, { fontWeight: '700' }]}>{title}</Txt>
      <Txt ltr tone="muted" style={[type.body, { fontSize: 16 }]}>{number}</Txt>
    </View>
    <PrimaryButton label={ctaLabel} onPress={onCta} icon={<IconWhatsApp size={22} />} />
  </View>;
}

export function PaginationDots({ count, active }: { count: number; active: number }) {
  const { colors } = useTheme();
  return <View style={styles.dots}>{Array.from({ length: count }, (_, index) => (
    <View key={index} style={[styles.dot, index === active
      ? { backgroundColor: colors.primary, width: 20 } : { backgroundColor: colors.outline, width: 8 }]} />
  ))}</View>;
}

/** Shared screen shell: safe-area top, balanced header, scroll body. */
export function AppScreen({ title, onClose, onBack, trailing, children, footer }: {
  title: string; onClose?: () => void; onBack?: () => void; trailing?: ReactNode; children: ReactNode; footer?: ReactNode;
}) {
  const { colors, isDark } = useTheme();
  const { arabic } = useApp();
  const lead = onClose ?? onBack;
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {lead ? <Pressable accessibilityRole="button" onPress={lead} hitSlop={12} android_ripple={{ color: colors.outline }}
        style={styles.headerAction}>
        {onClose ? <IconClose /> : <View style={{ transform: [{ rotate: arabic ? '180deg' : '0deg' }] }}><IconChevron size={22} color={colors.text} /></View>}
      </Pressable> : <View style={styles.headerAction} />}
      <Txt style={[type.headline, { flexShrink: 1 }]}>{title}</Txt>
      {trailing ?? <View style={styles.headerAction} />}
    </View>
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={styles.content}>{children}</View>
      {footer}
    </ScrollView>
  </SafeAreaView>;
}

export { Txt };

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  headerAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  page: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 24, width: '100%', maxWidth: 600, alignSelf: 'center' },
  content: { gap: 16 },
  button: { minHeight: 54, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 10, flexDirection: 'row', overflow: 'hidden' },
  textButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  pressed: { opacity: 0.78 }, disabled: { opacity: 0.45 }, pressedRow: { opacity: 0.72 },
  card: { borderRadius: radius.card, padding: 16, gap: 12 },
  row: { minHeight: 64, alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth },
  grow: { flex: 1, justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  codeButton: { minHeight: 54, borderWidth: 1, borderRadius: radius.field, paddingHorizontal: 14, minWidth: 96,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  phoneInput: { flex: 1, minHeight: 54, borderWidth: 1, borderRadius: radius.field, paddingHorizontal: 16, fontSize: 18,
    writingDirection: 'ltr', textAlign: 'left' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(9,45,41,0.4)', alignItems: 'center', justifyContent: 'flex-end' },
  modalSheet: { width: '100%', maxHeight: 420, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: 32 },
  codeOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
  historyAction: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, overflow: 'hidden' },
  historyIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 8, borderRadius: 4 },
  closeHit: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
