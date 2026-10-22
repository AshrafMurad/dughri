import { type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import type { AppRoute } from '../navigation';
import { type, useTheme } from '../theme';
import { useApp } from './AppProvider';

export function Body({ children, heading = false, ltr = false, size, tone = 'text' }: {
  children: ReactNode; heading?: boolean; ltr?: boolean; size?: keyof typeof type;
  tone?: 'text' | 'muted' | 'primary' | 'error' | 'warning';
}) {
  const { arabic } = useApp();
  const { colors } = useTheme();
  return <Text accessibilityRole={heading ? 'header' : undefined} style={[
    type[size ?? (heading ? 'title' : 'body')], styles.text,
    { color: colors[tone], writingDirection: ltr ? 'ltr' : arabic ? 'rtl' : 'ltr',
      textAlign: ltr ? 'left' : arabic ? 'right' : 'left' },
  ]}>{children}</Text>;
}

export function Action({ label, onPress, disabled = false, selected = false, variant = 'tonal' }: {
  label: string; onPress: () => void; disabled?: boolean; selected?: boolean;
  variant?: 'filled' | 'tonal' | 'text';
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  const filled = variant === 'filled' || selected;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={onPress} android_ripple={{ color: colors.outline }}
    style={({ pressed }) => [styles.action, { backgroundColor: filled ? colors.primary : variant === 'text' ? 'transparent' : colors.raised },
      pressed && styles.pressed, disabled && styles.disabled]}>
    <Text style={[type.label, { textAlign: 'center', writingDirection: arabic ? 'rtl' : 'ltr',
      color: filled ? colors.onPrimary : colors.primary }]}>{label}</Text>
  </Pressable>;
}

export function RouteLink({ href, label, detail, primary = false, compact = false }: {
  href: AppRoute; label: string; detail?: string; primary?: boolean; compact?: boolean;
}) {
  const { colors } = useTheme();
  const { arabic } = useApp();
  return <Link href={href} asChild><Pressable accessibilityRole="link"
    android_ripple={{ color: colors.outline }} style={({ pressed }) => [
      styles.link, compact && styles.compact, primary && { backgroundColor: colors.primary, borderRadius: 28 },
      { flexDirection: arabic ? 'row-reverse' : 'row' }, pressed && styles.pressed,
    ]}>
    <View style={styles.grow}>
      {primary ? <Text style={[type.label, { color: colors.onPrimary, textAlign: 'center', writingDirection: arabic ? 'rtl' : 'ltr' }]}>{label}</Text>
        : <Body size="label" tone="primary">{label}</Body>}
      {detail && <Body size="caption" tone="muted">{detail}</Body>}
    </View>
    {!primary && <View importantForAccessibility="no" style={[styles.chevron, { borderColor: colors.primary,
      transform: [{ rotate: arabic ? '135deg' : '-45deg' }] }]} />}
  </Pressable></Link>;
}

export function Panel({ children, tone = 'surface' }: { children: ReactNode; tone?: 'surface' | 'raised' | 'warningSurface' | 'errorSurface' }) {
  const { colors } = useTheme();
  return <View style={[styles.panel, { backgroundColor: colors[tone] }]}>{children}</View>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.section}><Body heading>{title}</Body><View style={styles.group}>{children}</View></View>;
}

export function DetailRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.detail, { borderBottomColor: colors.outline }]}>
    <Body size="label">{label}</Body>
    {value !== undefined && <Body tone="muted">{value}</Body>}{children}
  </View>;
}

export function Notice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <View accessibilityLiveRegion="polite"><Panel tone={error ? 'errorSurface' : 'warningSurface'}>
    <Body size="caption" tone={error ? 'error' : 'warning'}>{children}</Body>
  </Panel></View>;
}

export function Journey() {
  const { copy, arabic } = useApp();
  const { colors } = useTheme();
  return <View style={styles.group}>{copy.home.steps.map((step, index) => <View key={step.title}
    style={[styles.step, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
    <View style={[styles.stepNumber, { backgroundColor: colors.raised }]}>
      <Text style={[type.label, { color: colors.primary }]}>{new Intl.NumberFormat(arabic ? 'ar' : 'en').format(index + 1)}</Text>
    </View>
    <View style={styles.grow}><Body size="label">{step.title}</Body><Body size="caption" tone="muted">{step.detail}</Body></View>
  </View>)}</View>;
}

export function Screen({ title, children, back = true, brand = false, footer }: {
  title: string; children: ReactNode; back?: boolean; brand?: boolean; footer?: ReactNode;
}) {
  const { copy, arabic } = useApp();
  const { colors, isDark } = useTheme();
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={[styles.top, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
        {back ? <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          android_ripple={{ color: colors.outline }} style={styles.back}><Body size="label" tone="primary">{copy.common.back}</Body></Pressable>
          : <View style={[styles.brand, { flexDirection: arabic ? 'row-reverse' : 'row' }]}>
            <Image source={require('../../assets/app-icon.png')} style={styles.logo} resizeMode="contain" accessible={false} />
            <Body size="title" heading>{copy.common.appName}</Body>
          </View>}
        {brand && <RouteLink href="/settings" compact label={copy.common.settings} />}
      </View>
      <Body heading size="headline">{title}</Body>
      <View style={styles.content}>{children}</View>
      {footer && <View style={[styles.footer, { borderTopColor: colors.outline }]}>{footer}</View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: { direction: 'ltr', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, flexGrow: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
  top: { minHeight: 64, alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  back: { minHeight: 48, minWidth: 64, justifyContent: 'center', paddingVertical: 12 },
  brand: { alignItems: 'center', gap: 12, flexShrink: 1 }, logo: { width: 40, height: 40 },
  content: { gap: 24, marginTop: 24 },
  text: { flexShrink: 1 } satisfies TextStyle,
  action: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, overflow: 'hidden' },
  pressed: { opacity: 0.76 }, disabled: { opacity: 0.45 },
  link: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center', gap: 16 },
  compact: { paddingHorizontal: 12, minHeight: 48 }, grow: { flex: 1 },
  chevron: { width: 8, height: 8, borderBottomWidth: 2, borderRightWidth: 2, marginHorizontal: 4 },
  panel: { borderRadius: 16, padding: 24, gap: 16 },
  section: { gap: 12, marginTop: 8 }, group: { gap: 12 },
  detail: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  step: { alignItems: 'flex-start', gap: 16, paddingVertical: 8 },
  stepNumber: { width: 36, minHeight: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: 32, paddingTop: 20, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
});
