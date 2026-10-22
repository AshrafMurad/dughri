# Remaining Work Before QA (Phase 5) and Signed APK (Phase 6)

> **2026-10-22 UI update:** Owner-approved Dughri redesign and supplied icons implemented; see `ui-redesign-handoff.md` for actual checks and source-review verdict. Owner will perform device testing later. G-2 and hardware/release acceptance remain BLOCKED; the original build/cache notes below are historical until a new Gradle build confirms them.

> Prepared 2026-10-20 for a follow-up session. Read `AGENTS.md` and `docs/07-IMPLEMENTATION-PLAN.md` first.
> Status when this was written: Phases 1/2/4 source complete and pushed (`8af48b9`, `148c578`, `f523964`); Phase 3 source exists as Phase-0 probes (test-only). **G-2 remains BLOCKED.** Lightweight checks all PASS (typecheck, 12 JS tests, JS syntax, 20 standalone Kotlin JVM tests). No build has run since the Phase 1 changes; work tree clean at `main`.

## A. One-time build restore (needs owner download approval)

1. Gradle cache gap: online resolution required for uncached `org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0` (found blocking `:react-native-reanimated:compileDebugKotlin`). More uncached artifacts may surface after it; stop and report rather than silently downloading beyond approval.
2. Build + run module JVM tests (expected **23**: 3 PhoneNumbers + 20 correlator/capabilities/gate/settings):
   `npm run android:installed -- -Offline`
3. Module lint (offline, after cache exists):
   `.\android\gradlew.bat -p android :dughri-call-engine:lintDebug --offline -I "$PWD\scripts\installed-toolchain.init.gradle"` (set `JAVA_HOME` to Studio JBR first).
4. Install on the connected phone (preserves app data; do NOT uninstall/clear data):
   `npm run android:installed -- -Offline -Install`
5. Metro/launch (IPv4 to avoid the known ADB-reverse issue):
   `node scripts/start-metro.mjs`, then `adb reverse tcp:8081 tcp:8081`, then the `exp+dughri-phase-zero://…127.0.0.1:8081` launch URL in README.
6. On-device smoke (record PASS/FAIL per item): native module **Loaded**; all routes render in **en** and **ar**; new capability rows (call detection / phone state / number source / overlay / background / engine mode) show honest states; home status line matches capability snapshot; language switch keeps welcome-state and probes' persisted language; test-number input clears on background/route-leave/submit; trace timestamps stay LTR in Arabic.

## B. G-2 / strategy resolution (owner-led, physical hardware — the core blocker)

1. Second distinct phone (Android 14/15+ preferred, different OEM/carrier than the Samsung SM-A515U).
2. Grant call-screening role, phone-state permission, overlay access **through system UI only** — no ADB grants.
3. From Permissions & diagnostics: Start observation, wait for Idle, then ≥5 trials each of: answered incoming, completed outgoing, missed/rejected, rapid sequential calls; foreground and background; confirm exact numbers privately with the consenting tester; record redacted results in `docs/phase-0-evidence.md` (template in `docs/03-ANDROID-FEASIBILITY.md` §5). Never record full numbers.
4. Key question: does this carrier/device deliver the call number in `+` international format? (On the SM-A515U/Yemeni carrier, all arrived national-format and were correctly rejected — that is why G-2 is blocked.)
5. **Owner decision** (Phase-2 review): automatic stays / pivot / approve investigation of explicit originating-region selection + maintained-library parsing (would fix format only; does NOT prove call identity or answered eligibility by itself).

## C. Only if the owner authorizes the automatic path

1. Wire the trigger from `EligibilityGate`/`SessionCorrelator` through `OverlayController` — currently suppressed **by design**; do not bypass the gate or hardcode eligibility.
2. Re-run the full negative matrix (docs/06 §10 invariants) plus rapid-call dedupe/expiry on hardware.
3. Phase 4 device acceptance: RTL correctness, TalkBack labels, large fonts, no shortcut while locked/in-call/disabled.
4. Then Phase 5 QA matrix **T-001–T-028** (docs/08) on ≥2 physical phones; BLOCKED ≠ PASS.

## D. Phase 6 — signed APK (after Phase 5 P0 PASS)

1. Owner decisions: final display name, package ID (currently `com.dughri.phasezero`), icon/branding, versionName/versionCode.
2. Create release keystore, stored **outside git**; wire reproducible release signing through `plugins/withPhaseZero.js` (must survive prebuild).
3. Verify a **release** build (not just debug); produce signed `.apk` (not only AAB) + SHA-256.
4. Test fresh install **and** same-key upgrade on real phones; recheck actual permissions from an ordinary install.
5. Write bilingual installation guide, permission rationale, limitations, and release notes with the tested-device list.

## Standing rules for the next session

- Slow internet: ask before any download; prefer `-Offline`.
- No fabricated results; report PASS/FAIL/BLOCKED/NOT RUN with exact commands.
- Stop-and-escalate triggers: AGENTS.md §7. Do not change D-001–D-008 without the owner.
- Commit/push at each phase boundary only (owner instruction).
