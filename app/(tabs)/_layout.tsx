import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useApp } from '../../src/components/AppProvider';
import { useTheme } from '../../src/theme';
import { IconClock, IconGear, IconPhone } from '../../src/components/icons';

export default function TabLayout() {
  const { copy } = useApp();
  const { colors } = useTheme();
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: [styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }],
    tabBarLabelStyle: styles.label,
    tabBarItemStyle: styles.item,
    sceneStyle: { backgroundColor: colors.background },
  }}>
    <Tabs.Screen name="index" options={{ title: copy.common.home, tabBarIcon: ({ color }) => <IconPhone size={22} color={color as string} /> }} />
    <Tabs.Screen name="history" options={{ title: copy.common.history, tabBarIcon: ({ color }) => <IconClock size={22} color={color as string} /> }} />
    <Tabs.Screen name="settings" options={{ title: copy.common.settings, tabBarIcon: ({ color }) => <IconGear size={22} color={color as string} /> }} />
  </Tabs>;
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, minHeight: 64 },
  label: { fontSize: 11, fontWeight: '600' },
  item: { paddingVertical: 6, minHeight: 52 },
});
