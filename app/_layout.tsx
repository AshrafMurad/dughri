import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { AppProvider, useApp } from '../src/components/AppProvider';
import { RootFailure, ScreenBoundary } from '../src/components/ScreenBoundary';
import { Action, Body, Screen } from '../src/components/Screen';
import { useTheme } from '../src/theme';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) { return <RootFailure retry={retry} />; }
function Routes() {
  const { preferences, failed, copy, reload } = useApp();
  const { colors } = useTheme();
  if (!preferences) return <Screen title={copy.common.appName} back={false}>
    <Body>{failed ? copy.errors.preferences : copy.common.loading}</Body>
    {failed && <Action label={copy.errors.retry} onPress={reload} />}
  </Screen>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'none' }} />;
}
export default function Layout() {
  return <AppProvider><ScreenBoundary><Routes /></ScreenBoundary></AppProvider>;
}
