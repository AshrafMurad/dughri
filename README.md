# Dughri (دغري) — Phase 1 skeleton

**Owner-authorized CONDITIONAL GO for Phase 1 only.** Automatic number acquisition (G-2) remains **BLOCKED**. Second-phone trials and the automatic-vs-pivot decision remain pending for the Phase-2 entry review.

The shell provides Expo Router home, welcome, permissions/diagnostics and settings routes, typed bilingual locales, local language preferences and error handling. The existing Phase-0 diagnostic probes remain available under **Permissions & diagnostics**. Automatic shortcuts are deliberately suppressed by the unchanged probe implementation.

See [Phase 1 handoff](docs/phase-1-handoff.md), [current/historical Phase 0 evidence](docs/phase-0-evidence.md), [experimental native strategy](docs/ADR-001-android-call-strategy.md) and [shell decisions](docs/ADR-002-phase-1-shell.md).

## Current verification

- TypeScript, JS tests and JS syntax checks: **PASS — 12 JS tests**.
- Standalone Kotlin suite: **PASS — 20 synthetic JVM tests** (correlator, capabilities, suppression gate, engine settings) via Android Studio's existing compiler; no Gradle, no device evidence.
- Phase 2 source increment (owner-authorized, source-only): typed capability checks, suppression-only eligibility gate, default-off engine settings, additive snapshot diagnostics. See [Phase 2 handoff](docs/phase-2-handoff.md).
- Phase 4 source slice: home status connected to the typed native capability contract via a pure mapping that can never report `ready` while G-2 is blocked. See [Phase 4 handoff](docs/phase-4-handoff.md). Phases 5–6 (device QA, signed APK) are BLOCKED pending the owner's deferred end-of-phase device testing and build approval.
- Offline Android JS/Hermes export: **PASS**; this is not an APK.
- Native build: **DEFERRED at owner request**. Authorized online resolution passed the Spotless blocker; a subsequent offline attempt stopped on uncached `kotlinx-coroutines-android:1.9.0`. The next online attempt was interrupted. No new APK or full-build PASS is claimed.
- New APK, nine Kotlin JVM tests through the full build, installed shell/native-module smoke test and English/Arabic device rendering: **NOT RUN / blocked by the native build**.
- Earlier Phase-0 APK startup, native loading, nine JVM tests and owner-led Samsung probes are historical results, not verification of this shell.

## Tested Windows environment — reuse these tools

| Component | Installed / selected |
|---|---|
| OS | Windows 11 |
| Node / npm | 24.21.0 / 11.19.0 |
| Java runtime | Android Studio JBR 25.0.3; JVM 17 bytecode |
| SDK | `C:\Users\ashra\AppData\Local\Android\Sdk` |
| Android build | compile 37 / target 36 / minimum 31; arm64-v8a |
| Build Tools / NDK / CMake | 37.0.0 / 30.0.16248370 / 4.1.2 |
| Gradle / AGP / effective Kotlin | 9.4.1 / 9.2.1 / 2.2.10 |
| Expo / RN / React / TypeScript | 58.0.14 / 0.88.0 / 19.3.0 / 6.0.3 |

The installed-toolchain path is an explicit compatibility configuration, not stock JDK-25 support. `plugins/withPhaseZero.js` and `scripts/installed-toolchain.init.gradle` remain authoritative and unchanged. Generated `android/` is ignored. Reproducible native changes live in configuration and local module sources.

No SDK, JDK, NDK, CMake or Gradle distribution replacement is needed or authorized. **Ask before any download.** Use Expo development builds, not Expo Go.

## Source checks (actually run)

From `C:\Users\ashra\OneDrive\Desktop\dughri`:

```powershell
npm run typecheck
npm test
npm run check:js
```

The Node tests cover feature/locale parity, app-authored JSX text, preference validation/preservation, fixed-code logging and existing prebuild-plugin regression tests. `tests/types.ts` includes negative compile-time assertions for invalid keys/routes. No mocked calls are offered as hardware evidence.

Offline bundle command (actually run):

```powershell
$env:EXPO_OFFLINE='1'
$env:EXPO_NO_TELEMETRY='1'
node node_modules/expo/bin/cli export --platform android --output-dir dist
```

Expo generates `.expo/types/router.d.ts` and `expo-env.d.ts` during export/start. `src/navigation.ts` constrains app links even before generation on a fresh checkout. No ESLint dependency was added; `check:js` checks JS/MJS syntax, and TypeScript checks TS/TSX.

For a fresh checkout with a populated npm cache, `npm ci --offline --no-audit --no-fund` is the intended dependency restore command, **not verified in this session**. It must fail if required archives are absent; ask before retrying online. `package-lock.json` is the only lockfile. Router dependencies were downloaded with owner approval; React DOM is pinned to React's version to satisfy Router's transitive peers, not to add a web target.

## Native rebuild — current blocker recorded above

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME='C:\Users\ashra\AppData\Local\Android\Sdk'
npm run android:installed -- -Offline
```

The existing helper selects `DUGHRI_USE_INSTALLED_TOOLCHAIN=1`, CMake 4.1.2, performs prebuild with `--no-install`, and invokes APK assembly plus `:dughri-call-engine:testDebugUnitTest` with the Gradle init script and automatic JDK provisioning disabled. Authorized online resolution passed the initial Spotless blocker. The later offline retry found uncached `kotlinx-coroutines-android:1.9.0`; the next online attempt was interrupted. Additional uncached artifacts may remain. Full builds are now deferred by the owner; the exact attempts are recorded in the handoff.

After a successful build, expected artifact: `android/app/build/outputs/apk/debug/app-debug.apk` (development-signed, not a release). To build and install, the existing helper supports:

```powershell
npm run android:installed -- -Offline -Install
```

This installation command was **not run for Phase 1**. Full builds are now deferred at the owner's request; use lightweight checks until builds are requested again. It preserves application data with `adb install -r`; do not uninstall or clear app data to test upgrades.

## USB development server

These commands were verified historically for the Phase-0 app; Phase-1 device verification remains pending:

```powershell
node scripts/start-metro.mjs
& "$env:ANDROID_HOME\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
& "$env:ANDROID_HOME\platform-tools\adb.exe" shell am start -a android.intent.action.VIEW -d "exp+dughri-phase-zero://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081" com.dughri.phasezero
```

IPv4 avoids the previously observed localhost/ADB-reverse issue. The helper starts Metro offline. A rebuilt APK is required for the new native dependencies and shell-preference methods; the old APK is insufficient.

## Routes, language and privacy

- `/`: home, automatic-operation limitation, diagnostics and settings links.
- `/onboarding`: purpose, conditional functionality, Continue / Not now; neither grants permissions nor enables observation.
- `/permissions`: existing snapshot, start/stop, role consent, phone-state permission, overlay settings and independent test buttons.
- `/settings`: System / English / العربية, privacy and limitations.
- Unknown routes: localized return-home screen. Render failures: localized retry with no exception text.

Only versioned language and welcome acknowledgement are stored in a separate `app-shell` preferences file. Explicit legacy language choice is migrated without changing the `phase0` store; a new installation follows system language with English fallback. Saving a language preserves welcome state and never resets probe preferences. Unsupported/corrupt schemas show a recoverable error rather than silently overwrite settings.

Layout/text direction follows selected language without a forced app restart. Number input and trace timestamps stay LTR. On-device Arabic, large-font and TalkBack acceptance is pending. App-authored UI copy lives under `src/locales/en|ar/*.json`; native probe resources are retained. Android system dialogs and development tooling own their own strings.

The development logger accepts fixed reason codes only, rejects unknown runtime values and never forwards caller data or exception objects. Release calls emit nothing. This is a helper guarantee, not a claim that all framework/system crash output has passed a physical-device privacy audit.

## Existing Phase-0 probes

1. Open **Permissions & diagnostics**. Observation remains off on each new process.
2. Read the call-screening role disclosure before requesting it; it may replace another screening provider. Grant or decline through the normal Android UI only.
3. Request phone-state permission and overlay access; the native/app resume paths recheck state.
4. Tap **Start observation probe**, then wait for Idle. The default-subscription listener is process-local, not a persistent service.
5. Follow the redacted trial matrix in `docs/phase-0-evidence.md`. Privately confirm numbers with consenting testers. Masked suffix matching alone cannot prove identity.
6. Independent WhatsApp/overlay probes require explicit international test input and a user tap. They are test-only, not an approved manual product mode. Input clears on backgrounding, route departure or probe submission.
7. Stop clears candidates/removes the probe overlay. No force-stop/reboot survival is promised.

Do not collect unrestricted telephony logcat or share raw tester numbers. Do not place emergency test calls. Phase 2 requires the owner's strategy review and entry gate; Phase 1 conditional GO does not prove automatic feasibility.
