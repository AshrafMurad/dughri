import { router } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { Action, Body, RouteLink, Screen } from '../src/components/Screen';
export default function Onboarding() {
  const { copy, busy, failed, finishWelcome } = useApp();
  const finish = async (diagnostics: boolean) => {
    if (await finishWelcome()) router.replace(diagnostics ? '/permissions' : '/');
  };
  return <Screen title={copy.onboarding.title} back={false}>
    <Body>{copy.onboarding.purpose}</Body>
    <Body>{copy.onboarding.conditional}</Body>
    <Body>{copy.common.privacy}</Body>
    {failed && <Body>{copy.errors.preferences}</Body>}
    <Action label={copy.onboarding.continue} disabled={busy} onPress={() => void finish(true)} />
    <Action label={copy.onboarding.skip} disabled={busy} onPress={() => void finish(false)} />
    <RouteLink href="/settings" label={copy.settings.language} />
  </Screen>;
}
