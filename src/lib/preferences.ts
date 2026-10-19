import type { Language, LanguagePreference } from '../locales';

export interface Preferences {
  schemaVersion: 1;
  language: LanguagePreference;
  welcomeSeen: boolean;
}

export function parsePreferences(raw: string | null, legacyArabic: boolean): Preferences {
  if (raw === null) return { schemaVersion: 1, language: legacyArabic ? 'ar' : 'en', welcomeSeen: false };
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 1 ||
      !('language' in value) || typeof value.language !== 'string' || !['system', 'en', 'ar'].includes(value.language) ||
      !('welcomeSeen' in value) || typeof value.welcomeSeen !== 'boolean') throw new Error('preferences-invalid');
  return { schemaVersion: 1, language: value.language as LanguagePreference, welcomeSeen: value.welcomeSeen };
}

export function resolveLanguage(preference: LanguagePreference, systemLocale: string): Language {
  return preference === 'system' ? (systemLocale.split(/[-_]/)[0] === 'ar' ? 'ar' : 'en') : preference;
}

export function changeLanguage(preferences: Preferences, language: LanguagePreference): Preferences {
  return { ...preferences, language };
}
