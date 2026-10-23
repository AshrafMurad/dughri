import { useColorScheme } from 'react-native';

/** Showcase palette (2026-10): white/off-white surfaces, forest-green identity,
 * emerald accents, mint highlights. Light mode is the primary design. */
const light = {
  background: '#FAFAF9', surface: '#FFFFFF', raised: '#DDF3EB',
  primary: '#0B8F69', primaryDark: '#075C49', forestDark: '#092D29', mint: '#DDF3EB',
  onPrimary: '#FFFFFF', text: '#101816', muted: '#727A77',
  outline: '#E8EBE9', border: '#E8EBE9',
  warning: '#79521A', warningSurface: '#FBF2E2',
  error: '#E94D4D', danger: '#E94D4D', errorSurface: '#FDECEC',
};
const dark: typeof light = {
  background: '#0C1512', surface: '#14201B', raised: '#1B3A2E',
  primary: '#35C08D', primaryDark: '#2A9E72', forestDark: '#092D29', mint: '#1B3A2E',
  onPrimary: '#06231A', text: '#E6EDE9', muted: '#9BA8A2',
  outline: '#2A3A33', border: '#2A3A33',
  warning: '#EAC486', warningSurface: '#3B3020',
  error: '#FF7A7A', danger: '#FF7A7A', errorSurface: '#3A2321',
};
export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}

export type TypeRole = keyof typeof type;
export const type = {
  display: { fontSize: 28, lineHeight: 40, fontWeight: '700' as const },
  headline: { fontSize: 23, lineHeight: 32, fontWeight: '700' as const },
  title: { fontSize: 17, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 24 },
  label: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 20 },
  small: { fontSize: 12, lineHeight: 18 },
};

export const radius = { card: 20, button: 12, field: 12, badge: 999, pill: 8 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const cardShadow = {
  shadowColor: '#092D29', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
};
