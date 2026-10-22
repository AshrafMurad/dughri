import { Redirect } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { homeStatus } from '../src/lib/status';
import { useDeviceSnapshot } from '../src/lib/useDeviceSnapshot';
import { Body, Journey, Panel, RouteLink, Screen, Section } from '../src/components/Screen';

export default function Home() {
  const { copy, preferences } = useApp();
  const { snapshot, failed, checking } = useDeviceSnapshot();
  const status = homeStatus(checking ? undefined : snapshot, failed);
  if (!preferences?.welcomeSeen) return <Redirect href="/onboarding" />;
  return <Screen title={copy.home.title} back={false} brand footer={<Body size="caption" tone="muted">{copy.common.privacy}</Body>}>
    <Body tone="muted">{copy.home.intro}</Body>
    <Panel tone="raised">
      <Body heading>{copy.home.off}</Body>
      <Body>{copy.home.status[status]}</Body>
      <RouteLink primary href="/permissions" label={copy.home.checkPermissions} />
    </Panel>
    <Section title={copy.home.howItWorks}><Journey /></Section>
    <Body size="caption" tone="muted">{copy.home.limitations}</Body>
  </Screen>;
}
