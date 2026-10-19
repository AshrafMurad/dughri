import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Diagnostics from '../App';
import { useApp } from '../src/components/AppProvider';
import { RouteLink } from '../src/components/Screen';
export default function Permissions() {
  const { copy } = useApp();
  return <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
    <View style={{ paddingHorizontal: 24, gap: 8 }}>
      <RouteLink href="/" label={copy.common.home} />
      <RouteLink href="/settings" label={copy.common.settings} />
    </View>
    <Diagnostics />
  </SafeAreaView>;
}
