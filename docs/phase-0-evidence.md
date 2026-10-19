# Phase 0 Evidence — Dughri

## Repository hygiene and configuration recheck — 2026-10-19

This entry supersedes the earlier statements that no native compilation/dependency resolution had occurred. Sections below are historical session observations, not a current toolchain/install inventory.

### Observed artifacts (not commands executed in this recheck)

- The generated `android/build.gradle` contains the opt-in NDK **30.0.16248370** override. Source now includes an explicit installed-toolchain experiment (CMake **4.1.2**, plus a separate Gradle init script selecting JDK **25** with JVM **17** targets). This is not verified baseline compatibility.
- Local module build output includes compiled classes and Gradle XML reports timestamped **2026-10-19T00:05:25Z**: `PhoneNumbersTest` reports **3 tests**, `SessionCorrelatorTest` **6 tests**, each with zero failures/errors/skips. These are existing synthetic JVM test artifacts, not tests rerun in this recheck or proof of Android runtime behavior. The exact earlier Gradle invocation and complete build outcome are unavailable in this session.
- No APK was found under `android/app/build/outputs/apk/**/*.apk`. No current device, installation, grant, role, call, overlay, or WhatsApp behavior was checked. Earlier device queries remain historical.

### Changes and verification

- Ignore local module `android/build/`, `android/.gradle/`, and `android/.cxx/` output while retaining native source in Git.
- Remove the plugin-owned NDK experiment block before each generation; reinsert only when explicitly opted in. Disabling the experiment restores default NDK selection on the next incremental prebuild. CMake returns to **3.30.5**. Unexpected Expo template anchors now produce an explicit opt-in error.
- Add deterministic config-mod test doubles covering enable/repeat/disable, CRLF, unrelated custom settings, and changed-template failure. These do not execute Expo prebuild, Gradle, or Android.

| Exact command run from repository root | Result |
|---|---|
| `npm test` | PASS: 4 tests (locale parity + 3 config-plugin regression tests) |
| `npm run typecheck` | PASS: no TypeScript errors |
| `node --check plugins/withPhaseZero.js` | PASS |
| `git check-ignore -v modules/dughri-call-engine/android/build/test-results/testDebugUnitTest/TEST-expo.modules.dughricallengine.PhoneNumbersTest.xml modules/dughri-call-engine/android/.gradle/probe modules/dughri-call-engine/android/.cxx/probe` | PASS: all three paths match the new rules; cache probe paths are illustrative |
| `git status --short --untracked-files=all` | PASS: generated module output no longer listed; source/scripts remain visible |
| `git diff --check` | PASS: no whitespace errors; Git emitted LF-to-CRLF conversion notices |

### Phase 0 maintenance handoff

- **Diff/files:** `.gitignore`, `plugins/withPhaseZero.js`, `tests/phase-zero-plugin.test.mjs`, this evidence update; existing uncommitted helper scripts retained.
- **Requirement trace:** reproducible native configuration under ARCH-04 §4 / PLAN-07 DoD; supports FR-03/04/06 feasibility tooling only. NFR-03 / BR-42 evidence handling remains redacted; no product behavior or permission changes.
- **Dependencies:** none added.
- **Unit/static results:** PASS as above. Native build/lint and physical-device tests: NOT RUN in this recheck; no standalone lint script configured.
- **Devices/grants/installer:** none tested or changed in this recheck. No raw tester numbers collected.
- **Limitations/decision:** actual call-number attribution and background overlay gates remain BLOCKED/inconclusive. **NO-GO for advancement to Phase 1** remains in effect; owner GO still requires the prescribed physical-device evidence. No commit or push performed.

## Toolchain recheck — 2026-10-19

After the owner reported installing prerequisites, inspected the SDK directories again and ran `npm run android:check`.

| Component | Installed / observed | Project baseline | Result |
|---|---|---|---|
| Build Tools | 36.0.0 and 37.0.0 | 37.0.0 | PASS: required version present |
| NDK | 30.0.16248370 (source.properties confirms r30) | 27.1.12297006 | BLOCKED: baseline version absent; r30 compatibility not verified |
| CMake | 4.1.2 (`cmake --version` succeeds) | 3.30.5 | BLOCKED: pinned version absent; 4.1.2 compatibility not verified |
| Java | Studio JBR 25.0.3; JDownloader bundled javac 25.0.4.1 | JDK 17 compilation toolchain | BLOCKED: JDK 17 not located; DUGHRI_JDK17 unset |
| ADB | One authorized physical phone remains connected | Physical device | PASS: connection only |
| Gradle cache | User .gradle directory still absent | First build requires distribution/dependencies | Not downloaded |

`npm run android:check` exited 1 listing NDK 27.1.12297006, CMake 3.30.5 and JDK 17. Checked Program Files, AppData/Local, user .jdks/.gradle and common Java registry locations; no JDK 17 was found in those checks. This does not rule out a custom installation path supplied by the owner.

No build configuration was changed to substitute the newer NDK/CMake. No downloads, Gradle build, application installation, launch, or permission/role changes were performed. Earlier results below remain historical observations from the initial session; native/device verification is still BLOCKED.

## Decision and scope

- Date: **2026-10-18**.
- Agent: OpenCode Android/React Native feasibility implementation session.
- Recommendation: **NO-GO for advancement to Phase 1**.
- Feasibility gate: **BLOCKED / inconclusive**. No core real-call workflow was demonstrated; this is not a universal Android-impossibility finding.
- Owner steering during execution: slow internet; defer missing SDK/native-tool downloads and continue source implementation/checks.
- Git: no commit created (not requested); repository initially had only untracked `AGENTS.md` and `docs/`. Original documents preserved. Source handoff is the working tree.
- APK / SHA-256: **none produced**; no hash invented.
- Architecture decision: [ADR-001](ADR-001-android-call-strategy.md).
- Build/run details: [README](../README.md).

**Important:** native source and isolated probes exist, but the application has not been compiled as an Android APK, installed, launched, or granted roles/permissions. Native module discovery is verified; runtime native module loading is not.

The selected call-screening + state approach lacks proof of answered participation and cross-source call identity. Its automatic action gate remains closed. Independent manual-input overlay/handoff probes do not count toward automatic number acquisition and are not an approved fallback product.

## Environment observations (actual)

| Item | Observed result |
|---|---|
| Workspace | Existing Git directory containing AGENTS.md + eight baseline specs; no application source initially |
| Node / npm | v24.21.0 / 11.19.0 |
| Java | `java -version` initially failed because Java bin is not on PATH; explicit `$env:JAVA_HOME\bin\java.exe -version` returned OpenJDK 25.0.3 |
| JAVA_HOME | `C:\Program Files\Android\Android Studio\jbr` |
| SDK | `C:\Users\ashra\AppData\Local\Android\Sdk` |
| Installed platform | `platforms/android-37.0`, revision 2, API 37.0 |
| Installed Build Tools | 36.0.0 only |
| Missing | Build Tools 37.0.0, NDK 27.1.12297006, CMake 3.30.5, JDK 17 compilation toolchain |
| Gradle cache | `C:\Users\ashra\.gradle` absent when inspected; wrapper distribution not downloaded |
| ADB | One physical device reported `device` (serial intentionally omitted from report) |
| Phone | Samsung SM-A515U, Android 13, API 33 |
| Build | TP1A.220624.014.A515USQU8EWA8 |
| ABI | arm64-v8a |
| Existing screening role holder | `adb shell cmd role get-role-holders android.app.role.CALL_SCREENING` returned no package |
| WhatsApp package query | `com.whatsapp` returned; `com.whatsapp.w4b` did not return in this query |
| Prototype package | `adb shell pm path com.dughri.phasezero` returned no installed package |
| SIM/carrier, dual SIM, OEM battery policy | **UNVERIFIED**; no private subscription data collected |
| Installer / application grants | **NOT APPLICABLE** — prototype not installed |

Standard installation locations checked for Java included Program Files, user `.jdks`, and AppData/Local/Programs. Only Studio JBR was found in these searches. JDK 17 is required by installed RN plugin source, even though Gradle 9.4.1 can itself run on Java 25. A full AGP/JDK build compatibility result remains BLOCKED.

### Locked dependencies / build selections

- npm installed: Expo **58.0.14**, React Native **0.88.0**, React **19.3.0**, expo-dev-client **58.0.14**, expo-modules-core **58.0.22**, TypeScript **6.0.3**, @types/react **19.3.0**.
- One npm lockfile: `package-lock.json`.
- Generated wrapper: Gradle **9.4.1**.
- Installed RN catalogs: AGP **9.2.1**, Kotlin plugin **2.2.0**, compile SDK **37**, target SDK **36**, Build Tools **37.0.0**, NDK **27.1.12297006**.
- Probe min SDK **31**, arm64-v8a build, CMake **3.30.5** pinned by config plugin; no device support range claimed.
- Module Maven declarations: libphonenumber **9.0.41** (published version verified from official metadata); JUnit **4.13.2**. Maven artifacts not resolved by Gradle in this session.

## Commands actually executed and outcomes

Commands below ran from the repository root unless noted. Repeated unchanged checks are summarized together. These are observations, not instructions presented as completed tests.

| Exact command / operation | Result / actual output summary |
|---|---|
| `git status --short` | PASS: baseline AGENTS.md and docs/ untracked; new source subsequently untracked |
| `node --version`; `npm --version` | PASS: versions above |
| `java -version` | FAIL: executable not on PATH |
| `& "$env:JAVA_HOME\bin\java.exe" -version` | PASS: JBR 25.0.3 |
| `adb devices` | PASS: one authorized attached phone |
| `adb shell getprop ro.product.manufacturer`; `adb shell getprop ro.product.model`; `adb shell getprop ro.build.version.release`; `adb shell getprop ro.build.version.sdk`; `adb shell getprop ro.build.display.id`; `adb shell getprop ro.product.cpu.abi` | PASS: Samsung/device/build observations above |
| `adb shell cmd role get-role-holders android.app.role.CALL_SCREENING` | PASS query: no holder returned; no role assigned by tool |
| `adb shell pm list packages com.whatsapp` | PASS query: personal package only; no routing test |
| `adb shell pm path com.dughri.phasezero` | PASS query: no package returned |
| `npm view expo version engines --json`; `npm view expo-template-blank-typescript version --json`; `npm view expo-template-blank-typescript@58.0.23 dependencies devDependencies --json`; `npm view react-native@0.88.0 engines --json` | PASS: official registry compatibility metadata inspected before initialization |
| `npm install --no-audit --no-fund` | FAIL/incomplete: shell timeout after 200 seconds |
| `npm ls --depth=0` (after timeout) | FAIL: incomplete/extraneous packages; did not treat install as successful |
| `npm install --no-audit --no-fund --prefer-offline` | FAIL: ETARGET update-browserslist-db@1.3.4; EPERM cleanup warnings |
| `npm config get registry`; `npm view update-browserslist-db versions --json`; `npm view browserslist@latest dependencies --json`; `npm view expo-dev-client version --json`; `npm view expo-modules-core version --json` | PASS: investigated registry metadata; required transitive version listed |
| `npm install --no-audit --no-fund --prefer-online` | PASS: installed after refreshing registry metadata; no dependency overrides |
| `npx expo install expo-dev-client expo-modules-core` | PASS: compatible packages installed; npm reported 22 dependency audit findings; no force-fix performed |
| `npm ls --depth=0` (after installation) | PASS: clean direct dependency tree shown above |
| `npx expo install --check` | PASS: dependencies up to date |
| `npx expo prebuild --platform android --no-install` | PASS: generated Android project, including repeat clean regeneration; no Gradle invoked |
| `npx expo config --type public` | PASS: Android-only app configuration, permission exclusions, local config plugin |
| `npx expo-modules-autolinking resolve --platform android` | PASS: discovered `dughri-call-engine` and `expo.modules.dughricallengine.DughriCallEngineModule` |
| `npm run typecheck` | PASS: strict TypeScript, no errors |
| `npm test` | PASS: matching nonempty English/Arabic translation leaf keys |
| `powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/test-correlator.ps1"` | PASS: six synthetic Kotlin JVM correlation tests, using existing Studio compiler + JUnit jar |
| `powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/check-android-toolchain.ps1"` | BLOCKED (exit 1): missing Build Tools/NDK/CMake/JDK 17; no downloads |
| `npx expo export --platform android --output-dir dist` | PASS: Metro bundled 616 modules, Android Hermes bundle approximately 1.6 MB. This is **not an APK** |
| `git diff --check` | PASS for tracked diff; original/new source files are untracked, so this alone is not a full source-format audit |
| `node --check "plugins/withPhaseZero.js"` | PASS: config-plugin JavaScript syntax |
| `npm run test:kotlin` | PASS: same six synthetic JVM tests via npm script |
| `npm run android:guarded` | BLOCKED (exit 1): prerequisite guard stopped before Gradle; no downloads or native compilation |
| `git ls-files --others --exclude-standard` | PASS inspection: native module source included; generated android/, node_modules/, dist/ excluded |

Also compiled **only** `CallStateObserver.kt` and `ScreeningRole.kt` against the installed Android 37 `android.jar`, using the bundled Studio compiler. Exact command:

```powershell
& "C:\Program Files\Android\Android Studio\plugins\Kotlin\kotlinc\bin\kotlinc.bat" "modules/dughri-call-engine/android/src/main/java/expo/modules/dughricallengine/CallStateObserver.kt" "modules/dughri-call-engine/android/src/main/java/expo/modules/dughricallengine/ScreeningRole.kt" -classpath "$env:ANDROID_HOME\platforms\android-37.0\android.jar" -d "C:\Users\ashra\AppData\Local\Temp\opencode\dughri-android-adapters.jar"
```

Result: **PASS** (exit 0). This checks those two adapters only, not the full module, manifest merge, resources, Expo bridge, or APK.

### Checks not executed

- `npx expo run:android --device`: **BLOCKED / NOT RUN**, missing prerequisites and owner deferred downloads.
- Gradle APK compilation, Android lint, full-module Kotlin compilation, number-parser JVM tests: **BLOCKED / NOT RUN**.
- Install, launch, native loading, role/permission consent UI: **BLOCKED / NOT RUN**.
- Production signing, ordinary end-user APK install, APK hash, screenshots, call logcat: **NOT RUN / no artifacts**.
- No standalone ESLint dependency/config was introduced for the one-screen probe; TypeScript and JS syntax checks are the available static checks.

## Native probe behavior and privacy (implementation, not device proof)

- Incoming screening receives an immediate default allow response; no blocking/rejecting/silencing options are set.
- Metadata captures only tel-scheme details; direction and valid explicit international number form an ephemeral candidate. No region is guessed. Numbers are parsed with libphonenumber; no call-log or contacts access.
- State listener uses default subscription; only state codes go into the process-local bounded trace. No raw numbers, Call.Details, intents, or exception text are logged.
- Candidate expires after 120 seconds and is discarded on idle/stop; masking shows only final two digits and clears after TTL. Long calls may lose candidates by design. Overlap/repeated metadata fails closed.
- All call-derived automatic actions are suppressed; no guessed `completedByUser` or verified recipient flags exist.
- Independent overlay test requires explicit user action, permissions/role, running observation, idle and global managed-call guard. It is dismissible, duplicates replace the existing probe, expires after 15 seconds, and checks lock/permissions/in-call state. The short 200 ms cleanup guard exists only while that probe is displayed. System/OEM timing and cleanup still need hardware evidence.
- Personal and Business package-directed intents use documented `https://wa.me/<validated digits>`. App presence and intent dispatch do not prove recipient registration or correct chat display.
- No background service, boot receiver, FGS type, call-history database, analytics, upload, rooting, scraping, or permission bypass.
- Language alone persists locally. Observation starts off after process creation; stop/revocation blocks probe actions. Native module teardown stops probes; process death behavior remains UNVERIFIED.
- Template audio/storage/vibration permissions removed in config; final merged-manifest audit is still BLOCKED.

## Probe and release gate status

| Probe / gate | Status | Evidence / missing requirement |
|---|---|---|
| P0-A / G-1: incoming and outgoing completion | BLOCKED | Listener source and isolated adapter compilation only; no real call transitions |
| P0-B / G-2: attributable exact number, both directions | BLOCKED | No screening callback observations; correlation/participation evidence absent |
| P0-C / G-3: post-call background overlay | BLOCKED | Independent probe source only; automatic path closed |
| P0-D / G-4: cleanup, dedupe, privacy | UNVERIFIED | Synthetic correlation assertions pass; native overlay cleanup not observed |
| P0-E / G-5: correct WhatsApp target on tap | UNVERIFIED | Package present; no app/intent trial |
| P0-F: combined ordinary-install workflow | BLOCKED | No APK and no exact recipient/eligibility proof |

## Required device test matrix

All rows share actual precondition **B0**: prototype is not installed because native prerequisites were deferred. Therefore no call tests occurred. `UNVERIFIED` below means the scenario has not been exercised; it does not mean a passing result is expected. The evidence for the blocker is the prerequisite check and empty prototype package query above. No redacted call traces, photos, or tester observations exist yet.

For execution, record date/time, APK hash, model/OS/build/API, target SDK, installer, grants/role, SIM state, foreground/background, trial index and consenting tester's **private exact-match confirmation**, without recording their full number. Complete at least five trials per required scenario on **two distinct real phones**, including a modern Android 14/15+ phone, as required by AND-03.

| ID | Preconditions / exact procedure after B0 resolved | Expected result | Actual result / status | Evidence and limitation |
|---|---|---|---|---|
| T01 incoming unsaved | Ordinary install; consent role + phone; start observation, wait idle. Consenting second phone calls with unsaved visible number; answer, speak, end. Repeat foreground/background | Screening direction and eligible number candidate may arrive; state transitions recorded; no unproven action | **UNVERIFIED**, no cellular trial | B0; no incoming number evidence; screening initiation is not call-end proof |
| T02 outgoing unsaved | From system dialer call consenting unsaved number; other tester answers; finish. Also cancel an unanswered outgoing call | Direction/metadata/state accurately shown; both answered and canceled must remain suppressed absent participation evidence | **UNVERIFIED** | B0; OFFHOOK cannot distinguish dialing/answer |
| T03 completion | Run T01/T02 and note ringing/offhook/idle with elapsed timestamps; compare privately to observed end | Idle alone never creates a completed eligible action; no duplicate completion | **UNVERIFIED** | B0; idle is subscription state, not call record |
| T04 exact number | Compare actual consenting number privately to recipient seen in screening under controlled debugger inspection without logging/persisting raw value; repeat saved contact case | Exact match or unavailable; saved/private exclusions documented; no stale target | **UNVERIFIED** | B0; masked suffix is insufficient exact-match evidence; no contacts permission |
| T05 correlation | Two consenting distinct numbers; rapid sequential, waiting/overlapping, and dual-SIM attempts where available | Ambiguity suppresses action; no time-adjacent candidate promoted to verified | **UNVERIFIED** on device; synthetic tests PASS separately | B0; no cross-source stable subscription/session key |
| T06 automatic post-call shortcut | Complete T01/T02 with overlay consent | Product goal: one shortcut after verified eligible call. Current source: always suppresses automatic action | **BLOCKED** by missing identity/eligibility proof and B0 | No automatic trigger authorization; independent probe cannot pass this row |
| T07 background floating | Background app before completing controlled call. Separately show labeled manual probe and press Home immediately | Product goal: authorized post-call shortcut in background; isolated probe should persist only within 15 seconds where OS permits | **BLOCKED** automatic / **UNVERIFIED** independent probe | B0; no persistent service or process-survival promise |
| T08 WhatsApp target | Input consenting international number; tap personal test, then separate overlay probe tap | Correct chat, no saved contact or auto-message; no handler gives localized failure | **UNVERIFIED** | Personal package exists; no intent launch or chat observed |
| T09 Business | Install Business normally if tester chooses; input consenting number; tap Business test, then overlay Business selection | Correct chosen variant/target or truthful handler-unavailable result | **UNVERIFIED** | Business package not returned by query; package guarantees not assumed |
| T10 deny/revoke | Deny role/phone/overlay individually. Later grant through UI, show isolated probe, revoke/disable/replace role; return | Accurate distinct state, no actionable overlay after revocation, no crash; stopped observation as applicable | **UNVERIFIED** | B0; no automated privilege grants used |
| T11 missed/rejected | Consenting incoming tester calls; let ring out, then repeat rejecting; outgoing cancel before answer | No automatic shortcut; completion remains suppressed | **UNVERIFIED** | B0; reasons may be indistinguishable from public state alone |
| T12 private/unknown | Tester uses carrier-supported caller-ID suppression if lawful/available. Do not call emergency numbers | No screening recipient/shortcut or prior-number reuse | **UNVERIFIED** | B0; restricted presentations may omit service callback entirely |
| T13 repeats/duplicates | At least five sequential calls with distinct consenting targets; then isolated probe show/dismiss/expiry/new-call cleanup | No stale recipient or duplicate actionable shortcut; probe removed on new call, dismissal, expiry | **UNVERIFIED** on device | Synthetic overlap/stale/expiry tests PASS separately; no overlay evidence |
| T14 death/restart/lock | During isolated probe, lock device, force-stop, restart, and reboot when tester chooses; also try battery saver | No lockscreen sensitive bubble; no resurrected metadata; new process shows observation off; no survival claim | **UNVERIFIED** | B0; no force-stop/reboot was issued to the user's phone |

Additional required observation: English↔Arabic layout, LTR digits, TalkBack, large fonts, app absent-handler state, normal package-installer permissions, measured shortcut latency, OEM battery restrictions. All **UNVERIFIED**.

## Phase 0 handoff

- **Diff summary:** minimal Expo wrapper, one bilingual diagnostics screen, typed bridge, separated Kotlin probes, source tests, reproducible native generation, guarded build/check scripts, build instructions and ADR/evidence. No commits made.
- **Affected requirements:** FR-03/04 (probes only, blocked), FR-05–12 (safety/diagnostics probes, not accepted product completion), NFR-01–08/10–15, BR-01–30/34–44. Business and manual input are expressly isolated Phase-0 experiments requested by owner, not P1 shipping features.
- **Files:** root package/config/entry/UI/README; `plugins/withPhaseZero.js`; `modules/dughri-call-engine/` native/TS source, resources, tests; `src/locales/{en,ar}/diagnostics.json`; `tests/`; `scripts/`; this report and ADR-001.
- **Dependencies / justification:** Expo/RN/React and dev client for required native wrapper, Expo Modules API for bridge, TypeScript/types for strict UI; libphonenumber for mandated maintained number validation; JUnit for pure native tests. No navigation/state/backend library added.
- **Unit/integration:** locale/TypeScript/export/correlator/autolink PASS; parser tests, native lint/build and runtime integration BLOCKED.
- **Devices actually tested:** only ADB environment/package queries on one Samsung/API 33; no application test performed.
- **Grants/installer:** none; no application install and no role/permission change.
- **Direct behavior observed:** toolchain/dependency commands and synthetic JVM assertions only. No real call/number/overlay behavior claimed.
- **Privacy:** ephemeral candidate/trace, masked diagnostics, no raw-number logging/storage or uploads, ordinary system consent only; hardware verification outstanding.
- **Blockers:** deferred build prerequisites, no APK, strict answered/session attribution gap, saved-contact/private exclusions, unproven background lifecycle, no second phone acceptance run.
- **Owner decisions:** download prerequisites when ready; review supported identity/eligibility source before authorizing automation. Default-dialer, restricted-call-log, notification-only or manual-only changes each need explicit separate approval.
- **Next:** stay in Phase 0. Build the complete module after prerequisites, fix any compiler/manifest/runtime issues then, and run real-device probes. **Do not start Phase 1 without gate evidence and explicit owner GO.**
