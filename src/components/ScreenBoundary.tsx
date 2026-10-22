import { Component, type ReactNode } from 'react';
import { Text, Pressable, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { locales, type Copy } from '../locales';
import { safeLog } from '../lib/safe-log.mjs';
import { useApp } from './AppProvider';
import { type, useTheme } from '../theme';

export function Failure({ copy, retry, arabic }: { copy: Copy; retry: () => void; arabic: boolean }) {
  const { colors, isDark } = useTheme();
  const direction = { writingDirection: arabic ? 'rtl' as const : 'ltr' as const, textAlign: arabic ? 'right' as const : 'left' as const };
  return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    <ScrollView contentContainerStyle={styles.page}>
    <Text accessibilityRole="header" style={[type.headline, direction, { color: colors.text }]}>{copy.errors.title}</Text>
    <Text style={[type.body, direction, { color: colors.muted }]}>{copy.errors.body}</Text>
    <Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => [styles.retry, { backgroundColor: colors.primary, opacity: pressed ? 0.76 : 1 }]}>
      <Text style={[type.label, { color: colors.onPrimary, textAlign: 'center' }]}>{copy.errors.retry}</Text>
    </Pressable>
    </ScrollView>
  </SafeAreaView>;
}
class Boundary extends Component<{ children: ReactNode; copy: Copy; arabic: boolean }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { safeLog(__DEV__, 'ui-error'); }
  render() {
    return this.state.failed ? <Failure copy={this.props.copy} arabic={this.props.arabic}
      retry={() => this.setState({ failed: false })} /> : this.props.children;
  }
}
export function ScreenBoundary({ children }: { children: ReactNode }) {
  const { copy, arabic } = useApp();
  return <Boundary copy={copy} arabic={arabic}>{children}</Boundary>;
}
export function RootFailure({ retry }: { retry: () => void }) {
  const arabic = Intl.DateTimeFormat().resolvedOptions().locale.startsWith('ar');
  return <Failure copy={arabic ? locales.ar : locales.en} arabic={arabic} retry={retry} />;
}
const styles = StyleSheet.create({
  safe: { flex: 1 },
  page: { direction: 'ltr', flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24, maxWidth: 600, width: '100%', alignSelf: 'center' },
  retry: { minHeight: 52, padding: 16, borderRadius: 28, justifyContent: 'center' },
});
