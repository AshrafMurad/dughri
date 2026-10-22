# Dughri UI redesign handoff — 2026-10-22

- Scope: owner-approved daily-use UI redesign; Arabic name دغري, English Dughri. Owner selected calm white/forest green, and approved both supplied icons and their roles. No native feasibility gate is closed by these changes.
- Requirements: FR-01/02/08/09/12; NFR-03/06/13/14; BR-09/10/23/35/37/42.
- Changes: redesigned onboarding/home/settings/device-access; separate `/diagnostics`; shared light/dark tokens and controls; explicit language layout direction; honest unknown/stale states; guarded snapshot refresh; localized launcher name mod; owner icon configuration and padded adaptive derivative.
- Files: `app/`, `App.tsx`, `src/components/`, `src/locales/`, `src/theme.ts`, `src/lib/status.ts`, `src/lib/useDeviceSnapshot.ts`, `src/navigation.ts`, `app.json`, `plugins/withDughriName.js`, `scripts/prepare-brand-assets.mjs`, `assets/`, related tests, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `docs/dughri-ui-direction.md`.
- Dependencies/permissions: none added. Existing installed Expo image utilities used locally. Package ID/signing identity unchanged.
- Pre-commit reconciliation: owner-side launcher edits added duplicate JSON keys. Removed duplicates while preserving the effective latest configuration: square icon for both launcher modes with adaptive background `#01141B`. The padded standalone derivative remains available as an alternate asset; the interface still uses the standalone mark.

## Commands and actual results

| Command | Result |
|---|---|
| `npm run typecheck` | PASS after regenerating stale Expo route declarations through the installed CLI's `setupTypedRoutes` API |
| `npm test` | PASS, 18 tests; initial new mock failures were fixed (module interop and cross-realm microtask settling) |
| `npm run check:js` | PASS |
| `npm run test:kotlin` | PASS, 20 synthetic standalone JVM tests; no Android integration evidence |
| `$env:EXPO_OFFLINE='1'; $env:EXPO_NO_TELEMETRY='1'; node node_modules/expo/bin/cli export --platform android --output-dir "C:\Users\ashra\AppData\Local\Temp\opencode\dughri-ui-export"` | PASS, Android Metro/Hermes export; first run recovered from an incompatible old Metro cache by crawling again |
| `node scripts/prepare-brand-assets.mjs` | PASS, padded adaptive foreground generated; source icons preserved |
| `git diff --check` | PASS; Git emitted line-ending normalization notices |

Additional source-token contrast calculation: 18 light/dark text-background role combinations PASS at >=4.5:1 (minimum measured 5.95:1). This is mathematical token inspection, not rendered screenshot acceptance.

## Review and evidence boundaries

- Independent code-only finish review: three findings (RTL root, false refresh success, stale diagnostics) fixed; bounded follow-up review marked all three resolved.
- No native screenshots available. `adb devices` attempt timed out/tool failed; no device observations obtained.
- Hardware UI, RTL, font scaling, TalkBack, native icon/name output: NOT RUN / hardware acceptance BLOCKED.
- Gradle build/lint, signed release APK, fresh install and same-key upgrade: NOT RUN in this UI session. Owner is restoring dependency caches separately.
- Local and international calls are explicitly explained. National-format numbers without originating-region context remain rejected; no country guessing, fake caller values, or bypass of eligibility gates.
- G-2 remains BLOCKED. Owner will test later; this deferral does not count as Phase-5 PASS or Phase-6 READY.
- No raw numbers persisted or logged. Test input clears on blur/background/submit. Hook tests use named synthetic React/native doubles only.
- Next: rebuild after owner downloads finish, inspect the UI on hardware, then resume the documented real-call matrix. No signed APK or production readiness claimed.
