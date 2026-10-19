import commonEn from './en/common.json';
import commonAr from './ar/common.json';
import homeEn from './en/home.json';
import homeAr from './ar/home.json';
import onboardingEn from './en/onboarding.json';
import onboardingAr from './ar/onboarding.json';
import settingsEn from './en/settings.json';
import settingsAr from './ar/settings.json';
import errorsEn from './en/errors.json';
import errorsAr from './ar/errors.json';
import diagnosticsEn from './en/diagnostics.json';
import diagnosticsAr from './ar/diagnostics.json';

const en = { common: commonEn, home: homeEn, onboarding: onboardingEn, settings: settingsEn, errors: errorsEn, diagnostics: diagnosticsEn };
// Both directions checked: surplus and missing keys also fail the locale tests.
const ar: typeof en = { common: commonAr, home: homeAr, onboarding: onboardingAr, settings: settingsAr, errors: errorsAr, diagnostics: diagnosticsAr };
export const locales = { en, ar };
export type Language = keyof typeof locales;
export type LanguagePreference = Language | 'system';
export type Copy = typeof en;
