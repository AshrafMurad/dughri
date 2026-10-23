# ADR-003 — minSdk 26 device support and call-state observer fallback

- Date: 2026-10-24
- Authority: owner approval in session ("Keep API 26+ support"); `docs/04-TECHNICAL-ARCHITECTURE.md` §205 requires an ADR for minSdk changes.
- Scope: build configuration and state-observation code paths only. No change to D-001–D-008, permissions, roles, or eligibility semantics. G-2 status unchanged.

## Decisions

- App minSdk lowered 31 → 26, configured reproducibly: `plugins/withPhaseZero.js` writes `android.minSdkVersion=26` to Gradle properties during prebuild, matching `modules/dughri-call-engine/android/build.gradle` (`minSdkVersion 26`). This replaces a session-local edit to generated `android/gradle.properties` that a clean prebuild would have reverted.
- Call-state observation uses `TelephonyCallback` on Android 12+ and the deprecated state-only `PhoneStateListener` on API 26–30. The fallback ignores the number argument (empty without `READ_CALL_LOG`, which remains unrequested).
- API-31+ classes are instantiated lazily. Eager construction of `TelephonyCallback` crashed app startup on API 26–30 (`NoClassDefFoundError` before the `SDK_INT` branch could run); lazy creation keeps the class unloaded on older devices.
- `ScreeningRole.status()` returns `unsupported` below API 29 (`RoleManager` is Q+). Honest capability consequence: on API 26–28 the call-screening role, its metadata number source, and therefore the automatic post-call shortcut are unavailable; observation runs for state/diagnostics only. API 29+ behavior is unchanged.

## Limitations and status

- On-device verification on an API 26–30 phone after the crash fix: **NOT RUN** at time of writing. Module Kotlin compilation and synthetic JVM tests pass; no real-call or startup observation is claimed.
- `PhoneStateListener` is deprecated and kept only as the pre-12 state fallback.
- No new permission requested or granted; number-source claims and Phase-2 gates are untouched.
