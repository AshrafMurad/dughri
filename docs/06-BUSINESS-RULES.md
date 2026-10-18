# 06 — Business Rules and State Policy

> **Document ID:** RULES-06 · **Status:** Approved principles + explicitly provisional working defaults  
> **Last reviewed:** 2026-10-17  
> **Dependencies:** [Requirements](02-REQUIREMENTS.md), [Android feasibility](03-ANDROID-FEASIBILITY.md)

## 1. Rule authority

Rules tagged **LOCKED** follow explicit product decisions; **SAFETY** rules are non-negotiable engineering invariants; **DEFAULT** values are proposed to unblock development but may be tuned with approval; **CONDITIONAL** depends on actual Android capability. No code should treat a provisional default as evidence that an Android signal exists.

## 2. Trigger and eligibility rules

| ID | Type | Rule |
|---|---|---|
| BR-01 | LOCKED | Product considers **incoming and outgoing** standard cellular calls |
| BR-02 | LOCKED/CONDITIONAL | Preferred after-call entry point is a **floating shortcut**, subject to permission/lifecycle support |
| BR-03 | SAFETY | Shortcut never appears while the call remains active |
| BR-04 | SAFETY | Shortcut requires a **verified correct number tied to that specific call** |
| BR-05 | SAFETY | Private/unknown/ambiguous/invalid number → **do not display action** |
| BR-06 | DEFAULT | Missed/declined/unanswered/blocked/emergency/VoIP calls → not eligible; review if API cannot distinguish |
| BR-07 | SAFETY | One call produces at most one actionable shortcut |
| BR-08 | SAFETY | New phone call invalidates/dismisses previous shortcut before displaying a newer one |
| BR-09 | SAFETY | User explicitly enables automatic functionality; install/onboarding does not enable it by default |
| BR-10 | SAFETY | Disabled/revoked/unsupported state blocks triggers immediately |
| BR-11 | SAFETY | Never use a previous call number when the current call number is missing |
| BR-12 | CONDITIONAL | Background call detection and overlay behavior are available only if Phase 0 proves them |

### Example eligibility function (conceptual)

```ts
function eligible(call: CallEvidence, caps: Capabilities, settings: Settings): boolean {
  return settings.enabled && caps.verified && call.ended &&
    call.direction !== 'unknown' && call.completedByUser === true &&
    call.numberAttribution === 'verified' && call.validE164 === true &&
    call.isAllowedCategory === true && caps.overlay === 'available';
}
```

**Important:** `call.completedByUser` is a desired **evidence field**, not something `TelephonyCallback` automatically returns. If no legitimate API can establish a condition, do **not** hardcode `true`; suppress it and record the gap.

## 3. Overlay rules

| ID | Type | Rule |
|---|---|---|
| BR-13 | DEFAULT | Shortcut auto-expires **15 seconds** after display (tunable; final UX approval pending) |
| BR-14 | SAFETY | On user dismiss, remove immediately and never redisplay that same call |
| BR-15 | SAFETY | On user tap, close shortcut before/when starting WhatsApp intent; no duplicate opens |
| BR-16 | SAFETY | Lock screen / device not interactively unlocked → suppress visible bubble; do not show caller number |
| BR-17 | SAFETY | Overlay must be unobtrusive, non-deceptive, and avoid system controls |
| BR-18 | SAFETY | Revoke overlay permission → remove existing overlay and mark capabilities unavailable |
| BR-19 | CONDITIONAL | If OS/OEM prevents overlay, show accurate unsupported state; alternative notification needs owner consent |
| BR-20 | SAFETY | App cannot claim success after an overlay `WindowManager` exception |

**Timer rule:** expires based on monotonic elapsed time where possible, not just a JS timer. Resume/rotation/process death must not resurrect expired context. If OS cannot guarantee expiry under death, remove overlay through defensively designed native lifecycle and document observed behavior.

## 4. Phone number rules

| ID | Type | Rule |
|---|---|---|
| BR-21 | SAFETY | A phone number must come from the proven call-specific source or explicit **manual user input** (P1) |
| BR-22 | SAFETY | Validate by a maintained international telephone-number library; do not use regex as sole validation |
| BR-23 | SAFETY | No guessing region code; for national digits require known originating region or explicit user input |
| BR-24 | SAFETY | Strip formatting only after parsing; canonical output is E.164 and wa.me digits without `+` |
| BR-25 | SAFETY | Never send an invalid/private/emergency/ambiguous number to WhatsApp |
| BR-26 | SAFETY | No calling/contact-saving/pasting message content without user action |
| BR-27 | SAFETY | A number that appears valid is **not proof** it has an active WhatsApp account |

Examples for synthetic test data (do not use as actual call-log evidence):

| Input | Region context | Expected |
|---|---|---|
| `+966501234567` | None required | E.164 `+966501234567` → `wa.me/966501234567` |
| `0501234567` | SA explicit | Parse/validate using phone library; do not blindly prepend digits |
| `0501234567` | Unknown | **Reject as ambiguous** |
| `Unknown` | Any | Reject |
| `+001-(555)...` | Any | Reject or parse only if truly valid; no string-concatenation shortcut |

## 5. WhatsApp rules

| ID | Type | Rule |
|---|---|---|
| BR-28 | LOCKED | User can initiate WhatsApp chat without first saving the number |
| BR-29 | SAFETY | No message auto-send; only open target via user tap |
| BR-30 | SAFETY | Use documented `wa.me` click-to-chat mechanism, with encoded/validated values |
| BR-31 | CONDITIONAL/P1 | Explicit WhatsApp Business targeting only after package/intent behavior verified |
| BR-32 | SAFETY | Failed handoff must not mutate phone number or display “message sent” |
| BR-33 | DEFAULT | No default outgoing message text in MVP |

A `wa.me` link may resolve via WhatsApp, browser, or Android app chooser. Do not silently assume it always opens personal WhatsApp or guarantees delivery. If a variant choice is added, display a choice only if available and tested; do not invent undocumented deep links.

## 6. Permissions, consent, and disablement

| ID | Type | Rule |
|---|---|---|
| BR-34 | SAFETY | Ask for the minimum permission set the chosen implementation needs |
| BR-35 | SAFETY | Clearly distinguish normal runtime permission, special overlay access, role request, and hard-restricted permissions |
| BR-36 | SAFETY | User may decline; app must not block basic navigation or repeatedly pressure user |
| BR-37 | SAFETY | Always re-evaluate permission/role status when app resumes and when OS indicates a change |
| BR-38 | SAFETY | User disable persists across process restart; system service respects it |
| BR-39 | SAFETY | Device/installer restrictions must not be “fixed” with hidden or privileged workarounds |

## 7. Privacy and data lifecycle

- **BR-40 / SAFETY:** No contact book read, call-history list, messages, account information, or remote uploads in MVP.
- **BR-41 / SAFETY:** Do not persist raw phone numbers longer than necessary for the pending shortcut; prefer volatile memory and enforce expiration.
- **BR-42 / SAFETY:** Logs include reason codes and ephemeral event IDs only; redacted test evidence may include last 2–4 digits with consent.
- **BR-43 / SAFETY:** All displayed numbers are tied to active user action, and none appear on lock screen.
- **BR-44 / SAFETY:** A support/debug screen must not dump phone metadata or full call logs.
- **BR-45 / DEFAULT:** No usage analytics or external crash-reporting SDK in MVP; if added later, conduct privacy review and explicitly omit number data.

## 8. Future subscriptions — deliberately not in V1

Subscription concept: a nominal fee may be explored **after MVP validation**. This document sets no price, country, billing provider, free-trial limit, paywall, feature lock, account requirement, or licensing algorithm. **Do not** build a `subscriptions/` module, Stripe integrations, revenue SDKs, or server merely because later monetization is contemplated.

## 9. Decision conflicts and exceptions

If BR-01/02 cannot be met due to platform restrictions, only the product owner may approve a narrower supported-device set or an alternate product experience. If a call-source strategy would require replacing the user's call-screening provider, disclose that clearly and request approval. **Correctness and user privacy take priority over automation.**

## 10. Implementation invariants for tests

1. `enabled === false` → no automatic trigger.
2. `caps.numberSource !== 'available'` → no auto number action.
3. `deviceLocked === true` → no visible bubble.
4. Invalid, private, or ambiguous number → no `wa.me` navigation.
5. One `eventId` → at most one visible bubble and one user-triggered launch.
6. Expired/dismissed event → cannot reappear from queued/replayed callbacks.
7. Every change of chosen Android mechanism updates [03](03-ANDROID-FEASIBILITY.md) evidence and relevant test cases.
