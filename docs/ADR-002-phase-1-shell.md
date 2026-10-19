# ADR-002 — Conditional Phase 1 shell

- Date: 2026-10-19
- Authority: owner-authorized conditional GO in `phase-0-evidence.md` and the Phase 1 assignment.
- Scope: PLAN-07 §3 only. G-2 remains BLOCKED; Phase-2 strategy review remains mandatory.

## Decisions

- Use the requested Expo Router stack with home, onboarding, permissions/diagnostics and settings. Reuse the neutral white/blue system-font presentation from the diagnostic wrapper. No brand redesign.
- Keep the diagnostic screen in `App.tsx`, reached through `/permissions`. Its probe actions and native suppression implementation remain intact. Input is additionally cleared when leaving the route.
- Use React context and typed, feature-specific JSON locales. Direction is local to each view/text rather than a global `I18nManager.forceRTL` restart. Trace timestamps and number inputs remain LTR. Device visual verification is still required.
- Reuse Android SharedPreferences through two additive Expo-module methods instead of downloading AsyncStorage for two low-risk shell preferences. The separate `app-shell` store contains only version, language and welcome-screen acknowledgement; it cannot accept arbitrary JSON/phone data from JS. Writes run on the Expo async queue and report commit failure. No permission or role change.
- Preserve the original `phase0` store and all probe methods. On first shell load, migrate an explicitly chosen legacy Arabic/English value; otherwise follow system language. Later language changes preserve welcome state. Unknown schemas fail closed without overwriting stored data.
- Automatic operation remains unavailable. No enable switch, call-engine implementation, number parser change or automatic trigger is introduced.
- Logging accepts only enumerated fixed reason codes, validates them at runtime, and emits only in development. Never pass exceptions or phone data to this guard. Framework/dev-tool logging is outside this helper's scope; no real-call crash/privacy acceptance is claimed.

## Dependency approval and limitation

Owner approved SDK-compatible Router npm dependencies after metadata disclosure. Expo 58's Router tree includes drawer dependencies and their animation/gesture peers even though this app exposes no drawer. A backend is not configured. One npm lockfile remains.

The first offline native build stops configuring Worklets because Gradle plugin `com.diffplug.spotless:8.1.0` is uncached. Online native resolution requires separate owner approval. No plugin or installed-toolchain scripts were modified to bypass this dependency.
