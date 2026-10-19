import { Component, type ReactNode } from 'react';
import { SafeAreaView, Text, Button, StyleSheet } from 'react-native';
import { locales, type Copy } from '../locales';
import { safeLog } from '../lib/safe-log.mjs';
import { useApp } from './AppProvider';

export function Failure({ copy, retry, arabic }: { copy: Copy; retry: () => void; arabic: boolean }) {
  return <SafeAreaView style={styles.page}>
    <Text accessibilityRole="header" style={[styles.title, { textAlign: arabic ? 'right' : 'left' }]}>{copy.errors.title}</Text>
    <Text style={[styles.body, { writingDirection: arabic ? 'rtl' : 'ltr' }]}>{copy.errors.body}</Text>
    <Button title={copy.errors.retry} onPress={retry} color="#245d76" />
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
  page: { flex: 1, justifyContent: 'center', padding: 24, gap: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 24, color: '#172c36', fontWeight: '700' },
  body: { fontSize: 17, lineHeight: 27, color: '#172c36' },
});
