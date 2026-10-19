import { useApp } from '../src/components/AppProvider';
import { Action, Body, RouteLink, Screen } from '../src/components/Screen';
export default function Settings() {
  const { copy, preferences, busy, failed, setLanguage } = useApp();
  return <Screen title={copy.settings.title}>
    <Body heading>{copy.settings.language}</Body>
    {(['system', 'en', 'ar'] as const).map(language => <Action key={language} label={copy.settings[language]}
      selected={preferences?.language === language} disabled={busy} onPress={() => void setLanguage(language)} />)}
    {busy && <Body>{copy.settings.saving}</Body>}
    {failed && <Body>{copy.errors.preferences}</Body>}
    <Body heading>{copy.home.off}</Body>
    <Body>{copy.home.limitations}</Body>
    <RouteLink href="/permissions" label={copy.common.permissions} />
    <Body heading>{copy.settings.about}</Body>
    <Body>{copy.settings.privacy}</Body>
    <Body>{copy.common.privacy}</Body>
  </Screen>;
}
