import { useApp } from '../src/components/AppProvider';
import { Action, Body, Notice, Panel, RouteLink, Screen, Section } from '../src/components/Screen';

export default function Settings() {
  const { copy, preferences, busy, failed, setLanguage } = useApp();
  return <Screen title={copy.settings.title} footer={<Body size="caption" tone="muted">{copy.common.privacy}</Body>}>
    <Section title={copy.settings.language}>
      <Body tone="muted">{copy.settings.languageHint}</Body>
      {(['system', 'en', 'ar'] as const).map(language => <Action key={language} label={copy.settings[language]}
        selected={preferences?.language === language} disabled={busy} onPress={() => void setLanguage(language)} />)}
      {busy && <Body size="caption">{copy.settings.saving}</Body>}
      {failed && <Notice error>{copy.errors.preferences}</Notice>}
    </Section>
    <Section title={copy.settings.shortcut}>
      <Panel><Body size="label">{copy.home.off}</Body><Body tone="muted">{copy.home.limitations}</Body></Panel>
      <RouteLink href="/permissions" label={copy.common.permissions} />
    </Section>
    <Section title={copy.settings.about}><Body tone="muted">{copy.settings.privacy}</Body><Body size="caption" tone="muted">{copy.settings.brand}</Body></Section>
    <Section title={copy.settings.testing}>
      <Body tone="muted">{copy.settings.testingHint}</Body>
      <RouteLink href="/diagnostics" label={copy.home.diagnostics} />
      <RouteLink href="/onboarding" label={copy.common.onboarding} />
    </Section>
  </Screen>;
}
