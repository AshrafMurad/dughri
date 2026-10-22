import { router } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { Action, Body, Journey, Notice, RouteLink, Screen, Section } from '../src/components/Screen';

export default function Onboarding() {
  const { copy, busy, failed, finishWelcome } = useApp();
  const finish = async (permissions: boolean) => {
    if (await finishWelcome()) router.replace(permissions ? '/permissions' : '/');
  };
  return <Screen title={copy.onboarding.title} back={false} footer={<Body size="caption" tone="muted">{copy.common.privacy}</Body>}>
    <Body size="headline" heading>{copy.onboarding.headline}</Body>
    <Body tone="muted">{copy.onboarding.purpose}</Body>
    <Section title={copy.home.howItWorks}><Journey /></Section>
    <Notice>{copy.onboarding.conditional}</Notice>
    {failed && <Notice error>{copy.errors.preferences}</Notice>}
    <Action variant="filled" label={busy ? copy.settings.saving : copy.onboarding.continue} disabled={busy} onPress={() => void finish(true)} />
    <Action variant="text" label={copy.onboarding.skip} disabled={busy} onPress={() => void finish(false)} />
    <RouteLink href="/settings" label={copy.settings.language} />
  </Screen>;
}
