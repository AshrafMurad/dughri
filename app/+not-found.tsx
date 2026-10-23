import { router } from 'expo-router';
import { useApp } from '../src/components/AppProvider';
import { AppScreen, PrimaryButton } from '../src/components/ui';
import { routes } from '../src/navigation';

export default function NotFound() {
  const { copy } = useApp();
  return <AppScreen title={copy.errors.notFound}>
    <PrimaryButton label={copy.errors.returnHome} onPress={() => router.replace(routes.home)} />
  </AppScreen>;
}
