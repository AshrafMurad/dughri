import type { Href } from 'expo-router';

// Also constrains app links before Expo has generated .expo/types on a fresh checkout.
export const routes = {
  home: '/index', history: '/history', onboarding: '/onboarding', permissions: '/permissions',
  settings: '/settings', manual: '/manual', language: '/language', diagnostics: '/diagnostics',
} as const satisfies Record<string, Href>;
export type AppRoute = typeof routes[keyof typeof routes];
