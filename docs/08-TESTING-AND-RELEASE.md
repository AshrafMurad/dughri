# 08 — Testing, Device Matrix, and Release Checklist

> **Document ID:** QA-08 · **Status:** Test plan, pending actual-device evidence  
> **Last reviewed:** 2026-10-17  
> **Owners:** Native developer, QA agent, release owner

## 1. Test philosophy

A simulator or mocked call event can test the UI/state machine but **cannot demonstrate access to real caller numbers, real-world call lifecycle, installer-restricted permissions, or OEM background behavior**. Release acceptance requires **ordinary-install signed APK testing on physical Android phones**.

For every test, record: ID, requirement, expected result, actual observed result, `PASS | FAIL | BLOCKED | NOT RUN`, model, OEM, Android version/API/build, app target SDK, installer, permission/role states, app foreground/background, and commit/build hash. **BLOCKED/NOT RUN must never be counted as PASS**.

## 2. Test layers

| Layer | Scope | Who/where |
|---|---|---|
| Unit — TypeScript | Number normalization, URL creation, settings migrations, locale completeness | Local runner |
| Unit — Kotlin | Eligibility state machine, event deduplication, suppression reason, expiry | JVM tests where feasible |
| Integration | Kotlin Expo bridge, capability mapping, settings synchronization | Native dev build |
| Instrumented Android | Permission checks, native view lifecycles, intent handlers | Emulator plus real devices |
| Manual real-device | Cellular call direction, number source, overlay after call, OS limits | **Mandatory physical hardware** |
| Release smoke | Signed APK install, upgrade, reboot, revoke, WhatsApp handoff | Mandatory physical hardware |

## 3. Device coverage — decision pending

Initial engineering matrix (not a compatibility promise):

| Cohort | Minimum proposed coverage | Notes |
|---|---|---|
| A | Android 13 or lower on a real phone | Validate older API implementation if supported |
| B | Android 14 or 15 on a second real OEM | Validate recent background/service behavior |
| C | Newest available Android/OEM device | Recommended additional release-confidence test |
| D | Dual-SIM Android device | Critical for call-number correlation if app supports dual SIM |

Exact minimum/target SDK and officially supported devices remain **OPEN** until Phase-0 evidence; unsupported versions must be disclosed. Avoid claiming Android-version ranges just because build configuration permits installation. At least two distinct physical devices are necessary for Phase 0; broader device compatibility needs broader testing.

## 4. Functional case matrix

| ID | Req / rule | Procedure | Expected result |
|---|---|---|---|
| T-001 | FR-01/02 | Fresh install/open | Clear onboarding; automatic mode defaults off |
| T-002 | FR-08 | Deny ordinary call-state permission | Accurate state; no auto trigger |
| T-003 | FR-08 | Decline overlay special access | Accurate state; no overlay |
| T-004 | FR-08 | Enable overlay via system settings, return | App rechecks actual grant, no invented success |
| T-005 | FR-03/BR-01 | Answer and finish incoming cellular call | Exactly one shortcut with correct linked number, if feasible |
| T-006 | FR-04/BR-01 | Complete outgoing cellular call | Exactly one shortcut with correct linked number, if feasible |
| T-007 | FR-05 | Incoming private/unknown number | No shortcut, no old number reused |
| T-008 | FR-05/BR-06 | Incoming missed or rejected call | No shortcut under default rule |
| T-009 | FR-05/BR-06 | Outgoing call canceled/unanswered | No shortcut under default rule; if OS cannot distinguish mark BLOCKED |
| T-010 | FR-11/BR-07 | Duplicate call-state callbacks | One shortcut maximum |
| T-011 | BR-08 | Two sequential calls to different test numbers | No cross-call number mismatch; old shortcut removed |
| T-012 | BR-13/14 | Wait expiry, dismiss bubble | Bubble disappears and does not return from queued events |
| T-013 | BR-15/29 | Tap once on bubble | WhatsApp/chat opens on intent; never auto-sends |
| T-014 | FR-10 | WhatsApp absent/unavailable | Safe failure, no crash |
| T-015 | BR-16 | Lock screen during/after call | No sensitive overlay on lock screen |
| T-016 | FR-12 | Revoke overlay permission while enabled | Native overlay removed, feature state updates |
| T-017 | FR-12 | Turn feature off while bubble visible | Bubble closes immediately; no future trigger |
| T-018 | FR-12 | Kill app/reboot/restart normally | Actual documented supported lifecycle; no fictitious running state |
| T-019 | FR-09 | Switch `en` ↔ `ar` | All UI labels translated; RTL and phone digits correct |
| T-020 | NFR-13 | TalkBack, large font, display zoom | Primary actions accessible, no blocking overlay |
| T-021 | BR-21–25 | Parse canonical `+` E.164 number | Correct digits-only wa.me link |
| T-022 | BR-21–25 | Ambiguous national number without region | Reject; no guessed country |
| T-023 | NFR-02/03 | Audit manifest and logs | No unnecessary permissions or leaked full numbers |
| T-024 | QA install | Install signed APK without developer privilege | Actual required permissions/roles and behavior verified |
| T-025 | QA update | Install update over previous signed build | Settings preserved; no key mismatch/crash |
| T-026 | QA resilience | Battery saver/OEM background restrictions | Behavior accurately documented, not silent wrong handoff |
| T-027 | QA concurrency | Dual SIM/interleaved calls where supported | Correct per-call number or safe suppression |
| T-028 | FR-06 | App backgrounded when call finishes | Post-call bubble appears only where Phase 0 verifies support |

**Missing tested phone availability is a blocker, not a reason to replace T-005/T-006 with mocks.**

## 5. Phone-number test data and privacy

Use numbers from consenting tester devices, with outgoing/incoming calls arranged by those testers. Do not publish numbers or contact identities. For URL unit tests, use synthetic illustrative strings. Mask phone numbers in logcat excerpts and bug reports (`***1234`) and avoid attaching unredacted screen recordings to public repositories. The number recorded in the assertions must be confirmed by the tester **without storing it in automated logs**.

Cases include international prefixes, local national formats with explicit region, invalid/short input, unknown caller IDs, special/emergency numbers, and non-WhatsApp registrations. Do not place test calls to emergency numbers.

## 6. Lifecycle and permission stress tests

For each core call case, vary:

- App foreground vs background.
- App recently opened vs device after reboot vs battery saver; record differences.
- Screen unlocked vs locked; ensure no private data displayed while locked.
- Overlay authorized, denied, later revoked.
- Any call-screening role granted/rejected/replaced, if applicable.
- Device default dialer, dual SIM, OEM battery policies, OS updates.
- User taps bubble immediately, dismisses, waits for expiry, or starts a new call.

**Do not** test using ADB/privileged grants that a normal user cannot reproduce and then count success for consumer distribution. Debug tooling may observe state, not grant hidden production powers.

## 7. Nonfunctional pass thresholds

- **0 wrong-recipient WhatsApp targets** across mandatory acceptance tests.
- **0 unauthorized or lock-screen overlay disclosures**.
- **0 automatic WhatsApp messages**.
- **0 unexplained duplicate bubbles** per eligible call.
- **0 release-build fatal crashes/ANRs** in accepted test cases.
- **Target** ≤3 seconds call-end-to-bubble on tested eligible supported devices, with timestamps; misses require investigation and may be accepted only as explicitly documented limitation.
- All P0 user-authored copy translated to both locales; no placeholder strings.

These do **not** imply measured reliability percentage across all Android devices. If call recognition is inconsistent, mark FAIL and report exact frequency/conditions rather than claiming “mostly works.”

## 8. Automation guidance for AI agents

- Favor deterministic unit tests for `wa.me` URL format, state transitions, permission gating, deduplication, and expiry.
- Keep Android system integration behind interfaces so it can be mocked for unit tests, **but explicitly distinguish test doubles from production device validation**.
- Instrumentation tests should not read private call logs unless the production permission is properly granted for the tested installation path.
- No screenshot snapshot containing real contact names/numbers.
- Do not encode a forced success status into the CI pipeline when device tests were not run; CI should report `NOT RUN (hardware required)`.

## 9. Pre-release security/privacy audit

- [ ] All permissions listed in `AndroidManifest.xml` have actual use cases and user-facing explanations.
- [ ] No contacts/SMS/recording/Accessibility services added.
- [ ] If call-log or screening role is used, evidence/limits/consent are documented in Phase 0.
- [ ] No number/metadata transmitted to cloud services or analytics.
- [ ] No logging of raw phone numbers in release build.
- [ ] No sensitive overlay on lock screen, during calls, or after disabling feature.
- [ ] No unsafe fallbacks, unapproved third-party APIs, or background-start violations.
- [ ] Testing artifacts do not expose tester phone numbers.

## 10. APK signing and distribution

A release must be a **signed APK** (not just a development APK and not only AAB). Actual build commands depend on the locked Expo/native workflow in Phase 1; document commands run rather than assuming a build profile exists.

Release owner checklist:

- [ ] Product owner approves final app display name/package ID, icon, and tested device-support statement.
- [ ] Android/Expo dependencies are locked; clean checkout build reproducible.
- [ ] Store signing keystore securely, **outside** version control; back up to enable future updates.
- [ ] Create production signed `.apk`; ensure no test/development network/debug code enabled.
- [ ] Test fresh install and over-the-top upgrade using the same signing key.
- [ ] Test permission and role behavior from normal APK installation, not just IDE deployment.
- [ ] Verify both incoming and outgoing behavior with real calls on approved devices.
- [ ] Record versionName, versionCode, package ID, APK SHA-256, date, tested phones, OS versions.
- [ ] Provide bilingual installation guide, permission rationale, operating-system limitations, and safe uninstallation instructions.
- [ ] Verify app functions without internet except where WhatsApp itself needs it.
- [ ] Explain APK sideloading security clearly and distribute only through a trusted channel; do not instruct users to broadly disable security protections.

## 11. Release acceptance decision

The release report must state one of:

- **READY (limited to listed tested devices):** All release-blocking P0 cases passed and unsupported limitations disclosed.
- **BLOCKED:** mandatory behavior not verified, including incoming/outgoing number matching, overlay, or permissions.
- **PIVOT REVIEW REQUIRED:** Product owner must decide whether to accept another UX/scope; current specification must not be silently reinterpreted.

An unchecked checkbox, zero screenshots, or emulator-only tests cannot be called production-ready. Give the user the source, signed APK, SHA-256, and redacted QA report together.

## 12. Useful primary sources

- Android telephony and Telecom references: [03](03-ANDROID-FEASIBILITY.md)
- Expo build/documentation: https://docs.expo.dev/develop/development-builds/introduction/
- Android foreground-service rules: https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start
- WhatsApp click to chat: https://faq.whatsapp.com/5913398998672934
