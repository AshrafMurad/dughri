# ADR-001 — Android call strategy for Phase 0

> Historical decision below. The 2026-10-19 owner decision in `phase-0-evidence.md` supersedes the advancement restriction with **CONDITIONAL GO for Phase 1 only**. Latest device/toolchain evidence supersedes older UNVERIFIED/build-prerequisite statements. G-2 remains BLOCKED; the experimental automatic strategy is not proven. See ADR-002 for the shell, not a new call strategy.

- Date: 2026-10-18
- Status: **CONDITIONAL experimental strategy; NO-GO for advancement**
- Scope: Phase 0 only; D-001–D-008 unchanged.
- Traceability: FR-03–12, NFR-01–08/10–12/14–15; BR-01–12, 13–18, 20–30, 34–44.

## Decision

Use a minimal Expo 58 / React Native 0.88 development wrapper and local Kotlin module `dughri-call-engine`.
Use separate official probes for screening metadata, default-subscription state, and overlay/handoff behavior.
Do **not** authorize an automatic recipient from temporal correlation alone.

| Responsibility | Implementation | Evidence status |
|---|---|---|
| Role | RoleManager `ROLE_CALL_SCREENING` request from an activity, recheck on resume | Source prepared; device consent UNVERIFIED |
| Metadata | `CallScreeningService.onScreenCall`, `getHandle`, `getCallDirection` | Source prepared; callbacks/numbers UNVERIFIED |
| Call handling | Default allow response immediately for incoming calls, before initialization/parsing | Source inspection only; no latency measurements |
| State | `TelephonyCallback.CallStateListener`, `READ_PHONE_STATE` | Adapter compiles against installed android.jar; registration UNVERIFIED |
| Correlation | Ephemeral UUID candidate, conservative ambiguity and expiry, no automatic action authorization | Six synthetic JVM tests PASS; no hardware proof |
| Overlay | WindowManager `TYPE_APPLICATION_OVERLAY`, explicit settings access, native expiry/lock/in-call/permission guards | Independent test-only probe; device behavior UNVERIFIED |
| Handoff | libphonenumber 9.0.41 validates explicit international input; documented wa.me URL, package-scoped ACTION_VIEW | Source prepared; exact personal/Business routing UNVERIFIED |
| Native ↔ JS | Expo Modules API snapshot and diagnostic events containing only masked metadata | Autolinking PASS; runtime bridge UNVERIFIED |

Kotlin owns native event handling in the current process even if JS is suspended. It does not start a foreground service or promise survival after process death. Module teardown stops probes. Language is the only persisted setting; numbers/call traces are not persisted. Default observation is off on each new process.

## Conflict with the intended automatic experience

The documented Android screening contract supplies a limited set of initiation details. It does **not** supply a verified per-subscription call-end identity or ongoing answered/completed updates. `OFFHOOK` includes dialing; an outgoing `OFFHOOK → IDLE` cannot prove participation. Even apparent incoming ring/answer sequences do not establish all eligibility exclusions or cross-source identity. Therefore `completedByUser` and `numberAttribution` cannot safely be hardcoded as verified.

`SessionCorrelator` is intentionally diagnostic: completion is suppressed as ambiguous, unavailable, expired, invalid, or eligibility-unproven. No call-state path invokes the overlay or WhatsApp. The only overlay entry point is the expressly labeled independent P0-C/E test. This is an incomplete feasibility result, **not** a manual-only product pivot or a claim to satisfy FR-03/04/06.

Without contacts permission, saved contacts are generally excluded from screening. Restricted/unknown/unavailable/payphone presentations are not supplied. Screening metadata omits the stable per-subscription identity needed here; a default-subscription listener cannot establish dual-SIM correlation. No `READ_CONTACTS` was added to expand coverage. User-visible role replacement is disclosed before the official consent flow.

## Permission and service inventory

| Item | Reason / consent | Ordinary-install evidence |
|---|---|---|
| READ_PHONE_STATE | Runtime request for state listener and Telecom in-call guard | UNVERIFIED, no privileged grants attempted |
| SYSTEM_ALERT_WINDOW | Special settings flow for independent floating probe | UNVERIFIED |
| BIND_SCREENING_SERVICE | Permission **protecting** exported service; OS binds; not requested from user | Manifest source only |
| CALL_SCREENING role | Explicit Android role-consent screen; may displace screening provider | Role query returned no holder on attached phone; request UNVERIFIED |
| INTERNET | Expo development server / dev client; no call-data upload code | Source config only; merged manifest not built |

No call-log, contacts, SMS, microphone, Accessibility, notification, foreground-service or boot permissions were added. Template audio/storage/vibration permissions are removed through Expo configuration. Final merged manifest must still be audited after a native build.

## Alternatives investigated

1. **Telephony state alone:** no number and no definitive answered-call record. Rejected as complete solution.
2. **Call logs:** `READ_CALL_LOG` is hard-restricted and needs installer allowlisting. No permission or query added; ordinary-distribution access is unproven. Any experiment needs separate approval.
3. **Default dialer / InCallService:** a substantially different role and product, potentially exposing richer lifecycle data. Not implemented; requires owner approval before investigation as a changed strategy.
4. **Notification/manual-only:** product pivots requiring owner approval; neither accepted nor shipped. Manual test input here is solely for isolated Phase-0 handoff/overlay measurements requested by the owner.
5. **Foreground service:** no justified type/lifecycle demonstrated. No arbitrary type or background-start exemption assumed. Android 15's visible-overlay exemption cannot bootstrap a post-call-only overlay.
6. Accessibility/notification scraping, hidden APIs, root, privileged ADB grants: rejected per baseline.

## Toolchain choice

Expo's current SDK 58 supports installed Node 24 and compile SDK 37. Its generated wrapper uses Gradle 9.4.1; RN 0.88's catalog selects AGP 9.2.1, Kotlin 2.2.0, Build Tools 37.0.0, NDK 27.1.12297006. CMake 3.30.5 follows RN's source default and is explicitly pinned by the config plugin.

Gradle's Java-25 runtime compatibility is distinct from RN's `jvmToolchain(17)` requirement. JDK 17 was not found in checked installation locations. Owner deferred all missing native-tool downloads. No native build was attempted through Gradle; prerequisite checks stop first. Do not present JBR 25 alone as a verified complete build environment.

## Consequences / recommendation

**NO-GO for Phase 1**, with Phase-0 native verification **BLOCKED/inconclusive**, not proof that every lawful Android strategy is impossible. Download prerequisites later, compile the complete module, and test ordinary-install consent/callback behavior. The present strategy cannot satisfy strict automatic eligibility as implemented; owner must review a new supported evidence source or explicitly revised eligibility semantics before automatic actions can be authorized. Even revised eligibility does not resolve unproven session identity by itself.

One phone is connected but zero application device trials were performed. Two distinct physical phones and five-trial foreground/background runs remain required by AND-03. An APK, successful native compilation, role grant, number acquisition, or automatic overlay has **not** been verified.

## Official references reviewed

- [Expo SDK compatibility](https://docs.expo.dev/versions/latest/) — SDK 58/RN 0.88/Node and SDK baseline.
- [Expo local modules](https://docs.expo.dev/modules/get-started/).
- [SDK 58 wrapper source](https://github.com/expo/expo/blob/sdk-58/templates/expo-template-bare-minimum/android/gradle/wrapper/gradle-wrapper.properties).
- [RN 0.88 version catalog](https://github.com/facebook/react-native/blob/v0.88.0/packages/react-native/gradle/libs.versions.toml).
- [RN JDK configurator](https://github.com/facebook/react-native/blob/v0.88.0/packages/gradle-plugin/react-native-gradle-plugin/src/main/kotlin/com/facebook/react/utils/JdkConfiguratorUtils.kt) — installed source inspected for exact toolchain requirement.
- [Gradle Java compatibility](https://docs.gradle.org/current/userguide/compatibility.html).
- [CallScreeningService](https://developer.android.com/reference/android/telecom/CallScreeningService) — developer.android.com fetch failed in this session; public contract reviewed in [official AOSP source/Javadoc](https://github.com/aosp-mirror/platform_frameworks_base/blob/main/telecomm/java/android/telecom/CallScreeningService.java).
- [TelephonyCallback.CallStateListener](https://developer.android.com/reference/android/telephony/TelephonyCallback.CallStateListener).
- [RoleManager](https://developer.android.com/reference/android/app/role/RoleManager).
- [READ_CALL_LOG restriction](https://developer.android.com/reference/android/Manifest.permission#READ_CALL_LOG).
- [Overlay window](https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_APPLICATION_OVERLAY).
- [Foreground-service restrictions](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start).
- [WhatsApp click-to-chat](https://faq.whatsapp.com/5913398998672934).
- [Published libphonenumber artifacts](https://repo.maven.apache.org/maven2/com/googlecode/libphonenumber/libphonenumber/maven-metadata.xml) — 9.0.41 listed as current release when checked.

Links inherited from approved baseline are reference material, not claims of successful device testing or of live fetching every page.
