# Phase 1 Handoff — conditional GO, verification BLOCKED

## Source checkpoint authorization

The owner requested source-only work with lightweight tests, no further builds/downloads, and commits/pushes at phase boundaries. This changeset is a **Phase 1 source checkpoint**, not a claim that the native/device exit criteria passed. The owner-authored conditional-GO entry already present in `phase-0-evidence.md` is included unchanged because it records this work's authorization. Latest lightweight checks remain PASS (typecheck, 9 JS tests, JS syntax, 6 standalone synthetic Kotlin tests); only documentation changed afterward. Git commit/push results are reported in the session response.

## Latest continuation — builds deferred by owner

The owner authorized required downloads and requested advancement, then instructed: **“just test and continue”**, deferring long builds. No Java build process remained in the process query after interruption. No further full builds were started.

Actual continuation results:

- `npm run android:installed`: Spotless resolved and compilation progressed; shell timeout at 200 seconds. **NOT a successful build**. Prebuild regenerated the ignored Android project.
- Direct offline Gradle retry below: **FAIL**, `:react-native-reanimated:compileDebugKotlin` could not resolve uncached `org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0`. This supersedes the earlier Spotless blocker.
- Same direct command without `--offline`: **INTERRUPTED**; no success or complete download outcome claimed.
- After the owner's build deferral: `npm run typecheck` **PASS**; `npm test` **PASS (9)**; `npm run check:js` **PASS**; `npm run test:kotlin` **PASS (6 synthetic standalone JVM tests)**.
- Full nine-test Gradle suite, new APK, installed native bridge, route rendering/RTL and restart persistence on hardware remain **NOT RUN / DEFERRED**. Phase 1 exit is incomplete, not retroactively passed.

Exact direct Gradle retry:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:CMAKE_VERSION='4.1.2'
$env:DUGHRI_USE_INSTALLED_TOOLCHAIN='1'
$env:EXPO_OFFLINE='1'
$env:EXPO_NO_TELEMETRY='1'
.\android\gradlew.bat -p android :app:assembleDebug :dughri-call-engine:testDebugUnitTest --offline -I "$PWD\scripts\installed-toolchain.init.gradle" "-Porg.gradle.java.installations.auto-download=false" "-PreactNativeArchitectures=arm64-v8a" --console=plain
```

The interrupted online retry set JAVA_HOME, CMAKE_VERSION, DUGHRI_USE_INSTALLED_TOOLCHAIN and EXPO_NO_TELEMETRY as above, and used the identical Gradle arguments with `--offline` omitted.

The next-phase entry review is recorded in `phase-2-entry-review.md`. G-2 remains BLOCKED; deferring builds does not verify a number source or authorize different eligibility semantics. The remainder of this report preserves the preceding session's history.

- Date: 2026-10-19.
- Commit / diff summary: no commit or push. Expo Router shell, shared bilingual locale context, persisted shell preferences, error boundary, fixed-code development logging, JS checks/tests and updated Windows instructions. Phase 1 source is implemented; **Phase 1 exit is not met** because the native build and device acceptance are blocked.
- Requirement IDs affected: FR-01 (welcome skeleton), FR-08 (existing diagnostics route), FR-09 (localization), FR-12 (shell preferences only); NFR-03 (logging), NFR-13/14 (accessible controls/bidi implementation, device acceptance pending); BR-09 (no automatic enablement), BR-36 (skip/basic navigation), BR-40–42/44 (minimal preference data, fixed-code logging, existing masked diagnostics). This does not accept completion of the full product requirements.
- Authority: owner conditional GO in `phase-0-evidence.md`. G-2 remains **BLOCKED**. No change to D-001–D-008 or Phase-2 entry gate.

## Files changed

- `app/{_layout,index,onboarding,permissions,settings,+not-found}.tsx`: routes, first-use routing, localized recovery.
- `App.tsx`: retained diagnostic UI, shared locale context, LTR timestamp containers, clearing private test input on route departure. Existing start/stop/snapshot/role/permission/overlay/handoff buttons retained.
- `src/components/{AppProvider,Screen,ScreenBoundary}.tsx`, `src/navigation.ts`: preference context, neutral accessible shell, local RTL, typed app routes and render recovery.
- `src/locales/{en,ar}/{common,home,onboarding,settings,errors}.json`, `src/locales/index.ts`: modular typed copy. Existing diagnostic JSON unchanged.
- `src/lib/{preferences.ts,safe-log.mjs,safe-log.d.mts}`: strict preferences and fixed-code logger.
- `modules/dughri-call-engine/index.ts` and `DughriCallEngineModule.kt`: **additive shell-preference methods only**. Probe method implementations, `ProbeRuntime`, correlation, validation, overlay controller, resources and native tests unchanged.
- `index.ts`, `app.json`, `package.json`, `package-lock.json`, `tsconfig.json`, `.gitignore`: Router entry/config, pinned approved dependencies, scripts; Expo generated type inclusion/ignore settings.
- `scripts/check-js.mjs`; locale tests plus `tests/{locale-keys,preferences,safe-log}.test.mjs`, `tests/types.ts`.
- `README.md`, `docs/ADR-001-android-call-strategy.md` (historical-status clarification), `docs/ADR-002-phase-1-shell.md`, this handoff.
- `docs/phase-0-evidence.md` was already modified before this work (owner GO entry); preserved without edits. All existing build/prebuild/probe scripts and `plugins/withPhaseZero.js` unchanged.

## Dependencies added and justification

Owner-approved npm installation only. Exact direct versions: `expo-router@58.0.23`, `expo-linking@58.0.13`, `expo-constants@58.0.12`, `react-native-screens@4.30.0`, `react-native-safe-area-context@5.10.1`, `react-native-reanimated@4.7.1`, `react-native-worklets@0.13.0`, `react-native-gesture-handler@3.3.0`, `react-dom@19.3.0`.

Router requires its support/transitive tree; its drawer dependency requires animation/gesture peers even though no drawer is exposed. React DOM matches the existing React version to resolve the transitive Radix peer conflict. No backend, state library, lint package, AsyncStorage or new permissions added. Only `package-lock.json` is used. Published unpacked size of the main packages checked before approval was about 34 MiB, not a compressed transfer estimate. Actual downloaded byte total was not measured.

## Commands actually run / results

All commands from the repository root. Metadata-only registry lookups were separately approved before package installation. They inspected the listed Router/core/transitive versions with `npm view … --json`; HEAD requests returned no compressed Content-Length. No Gradle network resolution was authorized or attempted.

| Exact command | Result |
|---|---|
| `npm install --prefer-offline --no-audit --no-fund expo-router@58.0.23 expo-linking@58.0.13 expo-constants@58.0.12 react-native-screens@4.30.0 react-native-safe-area-context@5.10.1 react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-gesture-handler@3.3.0` | FAIL: stale registry metadata reported ETARGET for `@react-native/babel-preset@0.88.0` |
| `npm view @react-native/babel-preset@0.88.0 version --prefer-online` | PASS: version exists |
| `npm install --prefer-online --no-audit --no-fund expo-router@58.0.23 expo-linking@58.0.13 expo-constants@58.0.12 react-native-screens@4.30.0 react-native-safe-area-context@5.10.1 react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-gesture-handler@3.3.0` | PASS: added 59, removed 3 packages; npm peer warning |
| `npm install --package-lock-only --offline --save-exact --no-audit --no-fund expo-router@58.0.23 expo-linking@58.0.13 expo-constants@58.0.12 react-native-screens@4.30.0 react-native-safe-area-context@5.10.1 react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-gesture-handler@3.3.0` | FAIL: ERESOLVE, auto-selected React DOM 19.3.1 requires React 19.3.1 |
| `npm install --prefer-offline --save-exact --no-audit --no-fund react-dom@19.3.0 expo-router@58.0.23 expo-linking@58.0.13 expo-constants@58.0.12 react-native-screens@4.30.0 react-native-safe-area-context@5.10.1 react-native-reanimated@4.7.1 react-native-worklets@0.13.0 react-native-gesture-handler@3.3.0` | PASS: changed one package; peer conflict resolved without force/legacy-peer-deps |
| `npm ls --depth=0` | PASS after initial install; direct versions displayed |
| `npm ls react react-dom --depth=0` | PASS after peer fix: both 19.3.0 |
| `npm run typecheck` | PASS, including generated Router types and negative locale/route assertions on final run |
| `npm test` | PASS: 9 JS tests, zero failures/skips |
| `npm run check:js` | PASS: project JS/MJS syntax |
| `npm run test:kotlin` | PASS: **6 synthetic correlator JVM tests only**, using installed Studio compiler; not the full nine-test Gradle suite |
| `$env:EXPO_OFFLINE='1'; $env:EXPO_NO_TELEMETRY='1'; node node_modules/expo/bin/cli install --check` | PASS against local SDK metadata: dependencies up to date; CLI warns validation is unreliable offline |
| `$env:EXPO_OFFLINE='1'; $env:EXPO_NO_TELEMETRY='1'; node node_modules/expo/bin/cli export --platform android --output-dir dist` | PASS twice; final 1,158 modules, 2.5 MB Hermes bundle. Final run rebuilt an unreadable Metro cache automatically and succeeded. Not an APK |
| `npm run android:installed -- -Offline` | **BLOCKED**: prebuild succeeded; Gradle failed in 19s during Worklets configuration because plugin `com.diffplug.spotless:8.1.0` is uncached. APK assembly and nine JVM tests not reached |
| `git diff --check` | PASS; LF-to-CRLF notices only |
| `git status --short`, `git diff --stat`, `git diff -- .gitignore plugins scripts`, `git diff --numstat -- plugins scripts modules/dughri-call-engine/android/src/main/java/expo/modules/dughricallengine` | Inspection: existing scripts/plugin unchanged; native difference limited to additive preference methods |

## Device / integration acceptance

- Devices and OS builds actually tested in this Phase-1 session: **none**. Historical Samsung SM-A515U / Android 13 evidence stays in Phase 0.
- Permissions/roles granted and installer used this session: **none**; no install, grant, role change, app-data clear, force-stop or real-call trial performed.
- Direct observations: source checks, JS export, six pure JVM tests and offline native configuration failure only.
- New APK / SHA-256: **not produced**; no old artifact is represented as this build.
- JS ↔ native shell methods and diagnostic Loaded state on the rebuilt app: **NOT RUN / BLOCKED**.
- Both languages on all routes, system-locale changes, Android back, large font/TalkBack, preference preservation across process restart and existing probe-button smoke tests: **NOT RUN / BLOCKED**. Pure preference round-trip/language-preservation tests PASS but do not replace device validation.
- Native nine-test suite and module Android lint: **NOT RUN** after this change, blocked at global Gradle configuration. Historical nine-test/lint PASS is not repeated evidence.
- Fresh-checkout npm restore and APK reproduction: **NOT RUN**. Existing working tree dependencies used.

## Security/privacy review

App-owned strings use locale files. Boundary copy never includes exceptions. Logger runtime whitelist forwards fixed strings only; release flag disables output. Shell preferences contain no number, call history, automatic-mode flag or arbitrary supplied JSON. Separate storage preserves Phase-0 data. Test input clears on route departure/background/submission. Source/generated app manifest retains existing permission removals; **final merged APK manifest audit is blocked**. No production native privacy or framework crash-output verification is claimed.

## Blocker / owner decision needed

Approve downloading the missing Gradle Spotless plugin **8.1.0** and its required transitive artifacts, or defer native verification. Size is **unknown**; online resolution may reveal further uncached native dependencies. No workaround, plugin removal or online retry was attempted. Original installed-toolchain scripts remain unchanged.

After resolving the cache blocker: rerun `npm run android:installed -- -Offline`, inspect nine JVM results and merged manifest, install with `-Install`, then verify the routes in English/Arabic, preference retention and native diagnostic controls on the phone. Physical observation is required before marking Phase 1 complete.

**Recommended next phase:** finish Phase-1 verification first. Phase 2 may begin only after the owner reviews the still-BLOCKED G-2/source-strategy gate and pending second-phone evidence. No Phase 2+ behavior was implemented.
