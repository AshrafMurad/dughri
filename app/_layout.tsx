import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'react-native';
import { AppProvider, useApp } from '../src/components/AppProvider';
import { RootFailure, ScreenBoundary } from '../src/components/ScreenBoundary';
import { Action, Body, Screen } from '../src/components/Screen';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) { return <RootFailure retry={retry} />; }
function Routes() {
  const { preferences, failed, copy, reload } = useApp();
  if (!preferences) return <Screen title={copy.common.appName} back={false}>
    <Body>{failed ? copy.errors.preferences : copy.common.loading}</Body>
    {failed && <Action label={copy.errors.retry} onPress={reload} />}
  </Screen>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' }, animation: 'none' }} />;
}
export default function Layout() {
  return <AppProvider><StatusBar barStyle="dark-content" /><ScreenBoundary><Routes /></ScreenBoundary></AppProvider>;
}
