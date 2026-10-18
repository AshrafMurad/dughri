# 01 — Product Overview

> **Product:** WhatsApp After-Call Redirector (working name)  
> **Document ID:** PROD-01 · **Status:** Approved baseline, with explicitly unresolved feasibility  
> **Last reviewed:** 2026-10-17 · **Owner:** Product owner  
> **Read next:** [Requirements](02-REQUIREMENTS.md) → [Android feasibility](03-ANDROID-FEASIBILITY.md)

## 1. Purpose

Help someone who has just completed a **regular cellular phone call** open a WhatsApp conversation with the other party **without first saving that phone number to their contacts**. The primary interaction is a small **floating action after a call**, not an automatic message.

Initial example audience: delivery workers, sales representatives, field-service workers, and anyone who frequently receives or places calls to unsaved numbers. This is a utility app, **not** a dialer, call recorder, bulk-messaging tool, contact manager, or WhatsApp client.

## 2. Locked product decisions

These decisions were explicitly confirmed by the product owner. An agent may not change them unilaterally.

| ID | Decision | Status |
|---|---|---|
| D-001 | Platform: **Android only** for the initial product | LOCKED |
| D-002 | Preferred post-call UI: **floating shortcut** | LOCKED intention; dependent on Android permission/OS feasibility |
| D-003 | Recognize **both incoming and outgoing** standard cellular calls | LOCKED intention; dependent on reliable signal/number acquisition |
| D-004 | Launch with **Arabic and English** | LOCKED |
| D-005 | **Subscriptions deferred** until after MVP validation | LOCKED |
| D-006 | Use **React Native + Expo** for UI and **Kotlin** for Android-specific behavior | Architecture baseline; change only with recorded justification |
| D-007 | Distribute initial builds as **APK outside Google Play** | Current delivery plan, not an exemption from Android restrictions |
| D-008 | No backend/account system in initial MVP | Approved planning baseline |

## 3. What is verified, conditional, or unapproved?

Use these labels consistently in every spec and agent report:

- **LOCKED:** Confirmed product requirement. Changes require product-owner approval.
- **PLANNED:** Proposed design/implementation choice; implement when not contradicted by a blocker.
- **CONDITIONAL:** Do not promise or ship until the specified experiment verifies it.
- **OPEN:** Requires a recorded decision before implementing the affected feature.
- **OUT OF SCOPE:** Do not build unless scope changes are approved.

**Core feasibility warning:** Detecting the end of a call does **not** imply access to its number. Reading call logs can require a hard-restricted permission; overlays and background work also face OS restrictions. The intended automatic experience is **CONDITIONAL** until [03](03-ANDROID-FEASIBILITY.md) is passed on real devices. Direct-install APKs do not bypass these limits.

## 4. Desired user journey

1. User installs APK and opens the app.
2. Onboarding explains the app's purpose, permissions, and limitations; user opts into supported functionality.
3. App records user preferences locally and exposes a visible on/off switch.
4. User receives **or** makes a normal cellular call.
5. **Only if a completed eligible call, a usable number, and required permissions are confirmed**, a small floating WhatsApp action becomes available.
6. User **taps** it; app opens WhatsApp click-to-chat for that number. The app **never sends a message automatically**.
7. User may dismiss the shortcut or turn the feature off at any time.

The shortcut must **not** obscure key system controls, appear over sensitive lock-screen content, or interrupt the active call.

## 5. MVP definition

### Must deliver if Phase 0 is feasible (P0)

- Android native call-state handling for incoming and outgoing **normal carrier calls**.
- Reliable pairing of the finished call with the correct phone number, or an explicit **unsupported** state.
- Dismissible, temporary, user-enabled **floating shortcut** following an eligible completed call.
- User-initiated WhatsApp click-to-chat; use canonical international number format.
- Permission education/onboarding, permission status, enable/disable control.
- Arabic/English UI, including usable RTL layout and localized error states.
- No silent data collection or remote number upload; graceful behavior without permissions.
- Actual-device verification and a **signed installable APK**.

### Proposed secondary functionality (P1; not implied by P0)

- Manual number input/clipboard paste as a **fallback** if automatic access is unavailable. This is not equivalent to the core value proposition; owner must approve any pivot to manual-only.
- WhatsApp Business targeting when installed and when device integration can be verified.
- Optional country/region selection for parsing national-format numbers.
- Optional notification fallback for unsupported overlay conditions, only after owner approval.

### Explicitly excluded from MVP

- Subscription/paywall/license verification or payments.
- User authentication, server API, admin panel, cloud sync, analytics SDK, ad SDK.
- SMS messaging, automatic message sending, bulk outreach, contact scraping, contact creation.
- VoIP/WhatsApp calls, call recording, call transcription, Accessibility-service scraping.
- Becoming the user's default phone/dialer app unless approved as a substantially different product.
- iOS implementation or public app-store compliance work.

## 6. Product principles

1. **Consent and predictability:** only present features the user explicitly enabled.
2. **No false success:** a call-ending event without a valid number must never trigger a generic or wrong-number WhatsApp link.
3. **User controls the handoff:** tapping an action opens WhatsApp; never send messages or add contacts on their behalf.
4. **Minimal private data:** keep numbers in memory only as needed; prefer no call history database.
5. **Respect Android:** no hidden capabilities, privileged-permission workarounds, or OS-version downgrades to circumvent rules.
6. **Small, dependable MVP:** no backend or billing infrastructure until users validate the core utility.
7. **Bilingual from day one:** never hardcode screen text in UI components.

## 7. MVP success criteria

- **Technical:** Phase-0 call/number/overlay/handoff gates pass according to [03](03-ANDROID-FEASIBILITY.md).
- **Functional:** P0 requirements in [02](02-REQUIREMENTS.md) pass the real-device acceptance matrix in [08](08-TESTING-AND-RELEASE.md).
- **Quality:** no duplicate shortcuts, wrong-number handoffs, crashes, unauthorized overlays, or lingering UI after disable.
- **User experience:** a new user understands why permissions are needed and can switch the feature off easily.
- **Distribution:** signed APK installs and upgrades normally on tested devices; install limitations documented.

Do not invent adoption/retention targets or claim broad Android compatibility before telemetry-free field validation. Release device-support statements only for devices actually tested.

## 8. Key risks and decision gates

| Risk | Consequence | Required action |
|---|---|---|
| Phone number inaccessible | Cannot deliver automatic WhatsApp action | Run number-access probes in Phase 0; stop on failed gate |
| Overlay cannot show at needed time | Intended experience unavailable | Test background/locked/battery states; owner reviews fallback |
| Wrong event/number matched | Wrong recipient privacy risk | Fail closed: suppress action and record reason (without number in logs) |
| OS/OEM service kills listener | Unreliable behavior | Real-device lifecycle tests; document unsupported combinations |
| WhatsApp not installed or number not registered | Chat may not open | Graceful handoff/error; no assertion the number is on WhatsApp |

## 9. Approval points still open

These items are **not** implied by the four confirmed product decisions. The implementation plan supplies temporary, testable defaults, but any scope-altering choice requires product owner approval:

- Exactly which Android versions and phone manufacturers to officially support.
- Whether a call that rang but was not answered is eligible (planning default: **not eligible**).
- Whether P1 manual entry should ship alongside a technically feasible automatic MVP.
- Whether users should select WhatsApp versus WhatsApp Business.
- Whether notification fallback is acceptable if floating display is blocked.
- Final branding, icon, and app/package name.

## 10. Sources of authority

1. Product-owner confirmations in this document (`D-001`…`D-008`).
2. Documented and reproducible actual-device results in [03](03-ANDROID-FEASIBILITY.md).
3. Other specifications in this directory; [07](07-IMPLEMENTATION-PLAN.md) governs process.
4. Official platform documentation linked by [03](03-ANDROID-FEASIBILITY.md), rechecked if APIs change.

Where requirements and observed Android capabilities conflict, **record the conflict and stop the affected work**; do not silently invent a workaround or redefine the product.
