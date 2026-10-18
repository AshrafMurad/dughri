# 07 — Implementation Plan and Agent Handoffs

> **Document ID:** PLAN-07 · **Status:** Execution-ready plan, blocked at Phase 0 until evidence  
> **Last reviewed:** 2026-10-17 · **Owners:** Product owner and implementing AI agents  
> **Companion:** root [`AGENTS.md`](../AGENTS.md)

## 1. Execution contract

**Do not start with full UI implementation.** The single highest-risk unknown is lawful, reliable call-number acquisition plus background overlay behavior. Execute **Phase 0 → product-owner GO review → Phase 1 → Phase 2 → ...**. No multi-phase speculative code dumps.

Each phase must close with: changeset/commit, affected requirement IDs, local build/test commands, actual results, screenshots or redacted logs when relevant, known limitations, and owner-facing summary. If a permission/role or OS behavior fails, **STOP and report** rather than inventing access or changing the product.

### Global Definition of Done (DoD)

- Requirement IDs traced; edge cases handled; locale keys in both languages.
- TypeScript strict checks, lint/tests, Android build checks relevant to changed code pass (or explicit BLOCKED reason).
- No full phone number in logs, fixtures, screenshots, or issue summaries.
- No unapproved dependencies, backend, billing, or call-log permissions.
- Actual hardware behavior verified for any native/overlay claim.
- No `TODO` or mock value falsely presented as working production functionality.
- Updates aligned with [03 feasibility](03-ANDROID-FEASIBILITY.md), [06 rules](06-BUSINESS-RULES.md), and [08 testing](08-TESTING-AND-RELEASE.md).

## 2. Phase 0 — Android proof of concept (MANDATORY)

**Goal:** Decide whether the product's automatic floating shortcut is realistically deliverable on intended Android phones under ordinary end-user installation and consent.

**Tasks:**

1. Set up a minimal Android Kotlin test harness or minimal Expo development-build wrapper; keep scope to native probes.
2. Probe incoming/outgoing call-state lifecycle (`P0-A`) and document API/permission/version behavior.
3. Separately prove correct call-specific number attribution (`P0-B`); investigate official permissions/roles only.
4. Validate post-call overlay in foreground/background, after screen lock/unlock, and on overlay revocation (`P0-C/D`).
5. Validate user-initiated WhatsApp link with synthetic number (`P0-E`).
6. Combine into end-to-end flow without elevated developer rights or privileged install assumptions (`P0-F`).
7. Produce `docs/phase-0-evidence.md` + `ADR-001`, report GO / PIVOT PROPOSED / NO-GO.

**Deliverables:** minimal APK + source; device/API test matrix; exact manifest/role permission inventory; redacted event traces; bug list; known supported scope.

**Exit:** gates `G-1`..`G-5` pass on [03](03-ANDROID-FEASIBILITY.md)'s target devices. **Owner must approve GO**. Otherwise stop automatic work and request a decision. A working overlay with a hardcoded number is **not** Phase-0 completion.

## 3. Phase 1 — App skeleton and tooling

**Entry:** Phase-0 GO and `ADR-001` exist.

**Tasks:**

- Scaffold Expo React Native/TypeScript app; confirm installed SDK/React Native compatibility; use one lockfile.
- Create a **local Kotlin Expo module** using documented toolchain.
- Configure reproducible native project generation and manifest handling for chosen permission/role strategy.
- Implement Expo Router routes and base localization infrastructure; copy documented starter strings into modular locale files.
- Add lint/format/type-check scripts; test runner; error boundary and development-only logging guard.
- Add README with exact setup commands for Windows + Android Studio/SDK, physical device debug build, and limitations.

**Exit:** fresh checkout installs dependencies and produces a development APK on tested Windows/Android environment; JS ↔ Kotlin sample method works; both locale directions render. No mocked production call behavior exposed as ready.

## 4. Phase 2 — Native call engine and permissions

**Entry:** Phase-0 source strategy verified and documented.

**Tasks:**

- Implement capability/permission/role checking with unambiguous `available/needs-permission/restricted/unsupported` results.
- Implement actual call source, call-session correlation, direction, end-event validation, and suppression reasons.
- Add deduplication, expiration, safe transitions, new-call invalidation, and enable/disable persistence.
- Avoid application-killing exceptions; run service/receiver only if Phase-0 proves it is valid.
- Integrate native event diagnostics exposed to JS (without making JS a background-event dependency).
- Write Kotlin unit/instrumentation tests for state and permission gates.

**Exit:** both directions have verified end-to-end *number acquisition* on supported real devices, with redacted event logs and matching tests; negative cases produce suppression. Any wrong-number launch is release-blocking.

## 5. Phase 3 — Floating shortcut and WhatsApp integration

**Tasks:**

- Implement temporary Kotlin overlay with clear tap/dismiss behavior, expiry, revocation cleanup, no lockscreen display.
- Ensure no floating action during an active call, after disable, or on unsupported conditions.
- Implement safe number parser/normalizer and WhatsApp click-to-chat URL builder.
- Wire user-initiated handoff, intent exceptions, and unavailable-app states.
- Test repeated sequential calls and competing overlay events.

**Exit:** supported-device automatic behavior matches scenarios A–H in [02](02-REQUIREMENTS.md) and BR invariants in [06](06-BUSINESS-RULES.md); overlay never uses static test numbers in production.

## 6. Phase 4 — Product UI and bilingual UX

**Tasks:**

- Implement onboarding, permission/capability setup, home, settings, unsupported/help UI per [05](05-UI-UX-GUIDELINES.md).
- Implement locale switching, RTL/language direction, error states, accessibility labels, phone LTR display.
- Connect controls to real native capability contract; show unsupported honestly.
- Make app opt-in/off by default, persist setting, sync native engine, verify on app restart.
- Keep proposed brand neutral unless assets are signed off.

**Exit:** Arabic/English UI complete, all permission states testable, actual native state shown accurately, no placeholder screens required for P0.

## 7. Phase 5 — Quality and device hardening

**Tasks:**

- Execute complete functional/negative/permissions/battery/device matrix in [08](08-TESTING-AND-RELEASE.md).
- Test at least two actual devices with different OEM/OS versions; add a third for release confidence.
- Resolve crash/ANR, lifecycle, overlay, wrong-number, RTL, and accessibility defects.
- Remove test-only privileges/flags and simulated values from release artifact.
- Update explicit compatibility list and permissions disclosure text.

**Exit:** all P0 tests PASS on intended devices; no release-blocking safety defects. Any BLOCKED required device/workflow becomes owner decision, not a green check.

## 8. Phase 6 — Signed APK and handoff

**Tasks:**

- Choose final package ID/name/icon with owner approval; lock semantic version/versionCode.
- Configure release keystore storage outside git; ensure repeatable signing, preserved upgrade key.
- Produce signed **APK**, not only AAB; install/upgrade on actual phone.
- Verify app's real permissions after ordinary APK installation (including restricted permission outcome).
- Validate release build (not just debug build); publish SHA-256 and version in release notes.
- Provide simple bilingual installation guide and caution about OEM restrictions.

**Exit:** final APK + SHA-256 + release notes + tested-device list + install/upgrade verification + documented limitations and privacy disclosure.

## 9. Phase dependency map

```text
Phase 0 [Feasibility] --owner GO--> Phase 1 [Skeleton]
                                      |
                                      v
                              Phase 2 [Native Engine]
                                      |
                                      v
                            Phase 3 [Overlay + WhatsApp]
                                      |
                                      v
                              Phase 4 [Bilingual UI]
                                      |
                                      v
                             Phase 5 [Real-Device QA]
                                      |
                                      v
                            Phase 6 [Signed APK Handoff]
```

P1 manual mode, WhatsApp Business, country selection, or notification fallback may be added **only after an explicit scope approval**; do not sneak them into one of the phases.

## 10. Agent kickoff prompt — Phase 0 (copy and use)

```text
You are the Android feasibility agent for WhatsApp After-Call Redirector.
Read AGENTS.md and docs/01 through docs/08 before changing code.
Focus ONLY on Phase 0 in docs/07-IMPLEMENTATION-PLAN.md.
The locked product scope is a floating shortcut after BOTH incoming and outgoing
cellular calls, Arabic + English, subscriptions later.

Prove separately: (A) call end, (B) correct number for that call,
(C) post-call floating UI with normal user grants, (D) WhatsApp handoff.
Use official Android APIs and a normal APK installation; do not assume
READ_CALL_LOG is grantable, do not scrape Accessibility or other apps, do not
request privileged/hidden permissions, and do not use mocked phone numbers
as evidence of automatic number acquisition.

Generate docs/phase-0-evidence.md with device/API/installer matrix, exact
observations and redacted log excerpts. Give GO / PIVOT PROPOSED / NO-GO.
STOP after Phase 0. Do not proceed with app UI/full build without owner GO.
If no physical device/testing access is available, explicitly report BLOCKED.
```

## 11. Agent handoff template (required each phase)

```md
# Phase N Handoff
- Commit / diff summary:
- Requirement IDs affected:
- Files changed:
- Dependencies added and justification:
- Commands actually run (exact output summary):
- Unit/integration results: PASS/FAIL/BLOCKED
- Devices and OS builds actually tested:
- Permissions/roles actually granted and installer used:
- Behaviors directly observed (redacted):
- Unverified assumptions and known limitations:
- Security/privacy review:
- Product decisions needed (if any):
- Recommended next phase, only after entry gate met:
```

## 12. Change requests and escalation

Create a short ADR for architectural changes. For any **LOCKED** product decision (both directions, floating, bilingual, subscriptions later, Android-only), an agent must state:

1. Which requirement/OS condition conflicts with implementation;
2. Reproducible evidence and device/permission context;
3. Safe alternatives with functional differences and costs;
4. Explicit product-owner approval needed.

Until resolved, keep the affected feature **BLOCKED** and do not claim completion. Time estimates and coverage percentages without measurements are not acceptance evidence.
