import { useApp } from '../src/components/AppProvider';
import { RouteLink, Screen } from '../src/components/Screen';
export default function NotFound() {
  const { copy } = useApp();
  return <Screen title={copy.errors.notFound}><RouteLink href="/" label={copy.errors.returnHome} /></Screen>;
}
