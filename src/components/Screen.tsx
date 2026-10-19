import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import type { AppRoute } from '../navigation';
import { useApp } from './AppProvider';

export function Body({ children, heading = false, ltr = false }: { children: ReactNode; heading?: boolean; ltr?: boolean }) {
  const { arabic } = useApp();
  return <Text accessibilityRole={heading ? 'header' : undefined} style={[styles.text, heading && styles.heading,
    { writingDirection: ltr ? 'ltr' : arabic ? 'rtl' : 'ltr', textAlign: ltr ? 'left' : arabic ? 'right' : 'left' }]}>{children}</Text>;
}
export function Action({ label, onPress, disabled = false, selected = false }: {
  label: string; onPress: () => void; disabled?: boolean; selected?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled, selected }} disabled={disabled}
    onPress={onPress} style={({ pressed }) => [styles.action, (pressed || selected) && styles.selected, disabled && styles.disabled]}>
    <Body>{label}</Body>
  </Pressable>;
}
export function RouteLink({ href, label }: { href: AppRoute; label: string }) {
  return <Link href={href} asChild><Pressable accessibilityRole="link" style={styles.action}><Body>{label}</Body></Pressable></Link>;
}
export function Screen({ title, children, back = true }: { title: string; children: ReactNode; back?: boolean }) {
  const { copy, arabic } = useApp();
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={[styles.page, { direction: arabic ? 'rtl' : 'ltr' }]} keyboardShouldPersistTaps="handled">
      {back && <Action label={copy.common.back} onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />}
      <Body heading>{title}</Body>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  page: { padding: 24, paddingBottom: 40, flexGrow: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  content: { gap: 20, marginTop: 24 },
  text: { fontSize: 17, lineHeight: 27, color: '#172c36', flexShrink: 1 },
  heading: { fontSize: 28, lineHeight: 38, fontWeight: '700', marginTop: 12 },
  action: { minHeight: 48, justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#245d76', borderRadius: 6 },
  selected: { backgroundColor: '#e1eef3' },
  disabled: { opacity: 0.5 },
});
