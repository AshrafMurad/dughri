import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useApp } from '../src/components/AppProvider';
import { AppScreen, RadioRow, Txt } from '../src/components/ui';
import { type } from '../src/theme';
import type { LanguagePreference } from '../src/locales';

export default function Language() {
  const { copy, preferences, busy, failed, setLanguage } = useApp();
  const options: { value: LanguagePreference; label: string }[] = [
    { value: 'ar', label: copy.language.arabic },
    { value: 'en', label: copy.language.english },
  ];
  return <AppScreen title={copy.language.title} onBack={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}>
    <Txt tone="muted" style={type.caption}>{copy.language.hint}</Txt>
    <View style={styles.group}>
      {options.map(option => <RadioRow key={option.value} label={option.label}
        selected={preferences?.language === option.value}
        onSelect={() => void setLanguage(option.value)} />)}
    </View>
    {busy && <Txt tone="muted" style={type.small}>{copy.common.saving}</Txt>}
    {failed && <Txt tone="danger" style={type.small}>{copy.errors.preferences}</Txt>}
  </AppScreen>;
}

const styles = StyleSheet.create({
  group: { borderRadius: 20, overflow: 'hidden' },
});
