import { useColorScheme } from 'react-native';

const light = {
  background: '#FFFFFF', surface: '#F3F6F4', raised: '#E8F1EB', primary: '#215B40',
  onPrimary: '#FFFFFF', text: '#18251E', muted: '#526158', outline: '#DCE4DE',
  warning: '#79521A', warningSurface: '#FBF2E2', error: '#A33331', errorSurface: '#FBECEB',
};
const dark: typeof light = {
  background: '#101813', surface: '#1B251E', raised: '#233C2C', primary: '#A1D5AE',
  onPrimary: '#103822', text: '#E4ECE5', muted: '#B1BFB4', outline: '#3B4A40',
  warning: '#EAC486', warningSurface: '#3B3020', error: '#FFB4AE', errorSurface: '#452724',
};
export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}

export const type = {
  display: { fontSize: 38, lineHeight: 54, fontWeight: '700' as const },
  headline: { fontSize: 28, lineHeight: 42, fontWeight: '600' as const },
  title: { fontSize: 20, lineHeight: 30, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 26 },
  label: { fontSize: 14, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 21 },
};
