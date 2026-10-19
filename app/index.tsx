import { useCallback, useState } from 'react';
import { Redirect, useFocusEffect } from 'expo-router';
import Engine, { type Snapshot } from '../modules/dughri-call-engine';
import { useApp } from '../src/components/AppProvider';
import { homeStatus } from '../src/lib/status';
import { Body, RouteLink, Screen } from '../src/components/Screen';

export default function Home() {
  const { copy, preferences } = useApp();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [failed, setFailed] = useState(false);
  useFocusEffect(useCallback(() => {
    setFailed(false);
    Engine.getSnapshot().then(setSnapshot).catch(() => setFailed(true));
  }, []));
  if (!preferences?.welcomeSeen) return <Redirect href="/onboarding" />;
  return <Screen title={copy.home.title} back={false}>
    <Body heading>{copy.home.off}</Body>
    <Body>{copy.home.status[homeStatus(snapshot, failed)]}</Body>
    <Body>{copy.home.limitations}</Body>
    <RouteLink href="/permissions" label={copy.home.diagnostics} />
    <Body>{copy.home.intro}</Body>
    <RouteLink href="/settings" label={copy.common.settings} />
    <RouteLink href="/onboarding" label={copy.common.onboarding} />
    <Body>{copy.common.privacy}</Body>
  </Screen>;
}
