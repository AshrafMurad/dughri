import { Redirect } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { Body, RouteLink, Screen } from '../src/components/Screen';
export default function Home() {
  const { copy, preferences } = useApp();
  if (!preferences?.welcomeSeen) return <Redirect href="/onboarding" />;
  return <Screen title={copy.home.title} back={false}>
    <Body heading>{copy.home.off}</Body>
    <Body>{copy.home.limitations}</Body>
    <RouteLink href="/permissions" label={copy.home.diagnostics} />
    <Body>{copy.home.intro}</Body>
    <RouteLink href="/settings" label={copy.common.settings} />
    <RouteLink href="/onboarding" label={copy.common.onboarding} />
    <Body>{copy.common.privacy}</Body>
  </Screen>;
}
