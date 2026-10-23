import type { Language, LanguagePreference } from '../locales';

/** Supported calling codes; kept here so preference validation stays a
 * self-contained pure module (no runtime imports). */
export const COUNTRY_CODES = [
  { code: '+966', iso: 'SA' }, { code: '+971', iso: 'AE' }, { code: '+965', iso: 'KW' },
  { code: '+973', iso: 'BH' }, { code: '+968', iso: 'OM' }, { code: '+974', iso: 'QA' },
  { code: '+962', iso: 'JO' }, { code: '+963', iso: 'SY' }, { code: '+20', iso: 'EG' },
  { code: '+967', iso: 'YE' }, { code: '+218', iso: 'LY' }, { code: '+213', iso: 'DZ' },
  { code: '+212', iso: 'MA' }, { code: '+249', iso: 'SD' }, { code: '+90', iso: 'TR' }, { code: '+44', iso: 'GB' },
] as const;
export type CountryCode = typeof COUNTRY_CODES[number]['code'];

/** ISO region for a selected calling code ('SA' for '+966'); '' when unknown. */
export function countryIso(code: string): string {
  return COUNTRY_CODES.find(entry => entry.code === code)?.iso ?? '';
}

/** Schema v2 (showcase build, owner-approved 2026-10-23): adds shortcut,
 * direction, notification, country-code, and WhatsApp-target preferences on
 * top of the v1 shell preferences. v1 payloads migrate forward; v2 payloads
 * validate strictly and fail closed on unknown shape. */

export interface Preferences {
  schemaVersion: 2;
  language: LanguagePreference;
  welcomeSeen: boolean;
  shortcutEnabled: boolean;
  incoming: boolean;
  outgoing: boolean;
  notifications: boolean;
  countryCode: string;
  whatsappTarget: 'whatsapp' | 'business';
}

const countryCodes: readonly string[] = COUNTRY_CODES.map(entry => entry.code);

export function defaultPreferences(language: LanguagePreference = 'system'): Preferences {
  return {
    schemaVersion: 2, language, welcomeSeen: false,
    shortcutEnabled: false, incoming: true, outgoing: true, notifications: false,
    countryCode: '+966', whatsappTarget: 'whatsapp',
  };
}

function isLanguage(value: unknown): value is LanguagePreference {
  return value === 'system' || value === 'en' || value === 'ar';
}
function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function parsePreferences(raw: string | null, legacyArabic: boolean): Preferences {
  const base = defaultPreferences(legacyArabic ? 'ar' : 'en');
  if (raw === null) return base;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('schemaVersion' in value)) throw new Error('preferences-invalid');
  const record = value as Record<string, unknown>;
  if (record.schemaVersion === 1) {
    // v1 migration: keep language/welcomeSeen, adopt v2 defaults for the rest.
    if (!('language' in record) || !isLanguage(record.language) || !('welcomeSeen' in record) || !isBoolean(record.welcomeSeen)) throw new Error('preferences-invalid');
    return { ...base, language: record.language, welcomeSeen: record.welcomeSeen };
  }
  if (record.schemaVersion !== 2
    || !('language' in record) || !isLanguage(record.language)
    || !('welcomeSeen' in record) || !isBoolean(record.welcomeSeen)
    || !('shortcutEnabled' in record) || !isBoolean(record.shortcutEnabled)
    || !('incoming' in record) || !isBoolean(record.incoming)
    || !('outgoing' in record) || !isBoolean(record.outgoing)
    || !('notifications' in record) || !isBoolean(record.notifications)
    || !('countryCode' in record) || typeof record.countryCode !== 'string' || !countryCodes.includes(record.countryCode)
    || !('whatsappTarget' in record) || (record.whatsappTarget !== 'whatsapp' && record.whatsappTarget !== 'business')) throw new Error('preferences-invalid');
  return {
    schemaVersion: 2, language: record.language, welcomeSeen: record.welcomeSeen,
    shortcutEnabled: record.shortcutEnabled, incoming: record.incoming, outgoing: record.outgoing,
    notifications: record.notifications, countryCode: record.countryCode,
    whatsappTarget: record.whatsappTarget,
  };
}

export function resolveLanguage(preference: LanguagePreference, systemLocale: string): Language {
  return preference === 'system' ? (systemLocale.split(/[-_]/)[0] === 'ar' ? 'ar' : 'en') : preference;
}

export function changeLanguage(preferences: Preferences, language: LanguagePreference): Preferences {
  return { ...preferences, language };
}

export function updatePreferences(preferences: Preferences, changes: Partial<Omit<Preferences, 'schemaVersion'>>): Preferences {
  const next = { ...preferences, ...changes };
  return parsePreferences(JSON.stringify(next), false);
}

/** Manual-entry composition: country code + subscriber digits -> E.164-ish string.
 * Arabic-Indic digits are transliterated; leading zeros and decoration drop.
 * Returns null when nothing usable was entered. */
export function composeManualNumber(countryCode: string, entered: string): string | null {
  const code = countryCodes.includes(countryCode) ? countryCode : '+966';
  const western = entered.replace(/[٠-٩]/g, ch => String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch)));
  const digits = western.replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return null;
  return `${code}${digits}`;
}
