import { locales } from '../src/locales';
import type { AppRoute } from '../src/navigation';

// Compile-time negative assertions: tsc fails if these contracts become untyped.
// @ts-expect-error Unknown locale keys are forbidden.
locales.en.home.missingKey;
// @ts-expect-error Unknown locale keys are forbidden in Arabic too.
locales.ar.home.missingKey;
// @ts-expect-error App links cannot silently point to nonexistent routes.
const badRoute: AppRoute = '/missing';
void badRoute;
