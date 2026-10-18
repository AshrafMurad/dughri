# 02 — Requirements and Acceptance Criteria

> **Document ID:** REQ-02 · **Status:** Baseline; Android-dependent P0s CONDITIONAL  
> **Last reviewed:** 2026-10-17  
> **Depends on:** [Product overview](01-PRODUCT-OVERVIEW.md) · [Android feasibility](03-ANDROID-FEASIBILITY.md)

## 1. Requirement convention

- `FR-xx`: Functional requirement; `NFR-xx`: Nonfunctional requirement.
- **P0**: release blocking if feasible; **P1**: owner-reviewed enhancement; **P2**: later.
- A requirement's status is **not** evidence of API feasibility. Implement gated P0s only after [03](03-ANDROID-FEASIBILITY.md) returns **GO**.
- Acceptance cases below are executable behavior specifications, not a claim that Android guarantees those behaviors.

## 2. Functional requirements

| ID | Priority | Requirement | Definition of done |
|---|---|---|---|
| FR-01 | P0 | First-run onboarding | Purpose and permission rationale presented; skip/deny handled safely |
| FR-02 | P0 | Explicit feature enablement | Disabled initially; enabling checks capability/permissions; off persists |
| FR-03 | P0/CONDITIONAL | Incoming cellular call completed | Supported device yields eligible end event with correct number or suppresses action |
| FR-04 | P0/CONDITIONAL | Outgoing cellular call completed | Same, with correct direction and number |
| FR-05 | P0 | Safe eligibility filtering | No trigger for absent/ambiguous/invalid/private/unsupported number |
| FR-06 | P0/CONDITIONAL | Temporary floating shortcut | Displays only if authorized, after call ends; dismissible; no persistent intrusive bubble |
| FR-07 | P0 | WhatsApp handoff | Tap opens `https://wa.me/<international-digits>` using validated target; never auto-sends |
| FR-08 | P0 | Permissions state | Show granted/denied/restricted/unavailable; guidance to system settings when required |
| FR-09 | P0 | Localization | Every user-visible string supported in `en` and `ar`; appropriate RTL |
| FR-10 | P0 | No WhatsApp available | No crash; explain unable to open; offer safe option to copy number if owner approves UX |
| FR-11 | P0 | No duplicate post-call action | One eligible call yields at most one shortcut; duplicate events deduplicated |
| FR-12 | P0 | App restart and permission changes | Persist preferences; recheck permissions; never presume revoked access persists |
| FR-13 | P1 | Manual number entry | Validate/normalize number and open WhatsApp with explicit user tap; no automatic inference |
| FR-14 | P1 | WhatsApp Business choice | Conditional feature-detect; user chooses app if both supported |
| FR-15 | P1 | Notification alternative | Only if Android limitation confirmed AND product owner explicitly accepts fallback |
| FR-16 | P2 | Subscription readiness | Future design note only; NO billing code, gate, or backend in MVP |

## 3. Core behaviors as scenarios

### Scenario A — completed incoming call

**Given** automatic mode is enabled, necessary permissions are active, a supported cellular call is verified as completed, and the correct number is available and parseable; **when** the call ends; **then** show one temporary floating WhatsApp action with clear dismiss affordance; **when** user taps it, open the matching target with no contact-save step and no message sent.

### Scenario B — completed outgoing call

Same as Scenario A for outgoing calls. **Never assume `OFFHOOK` proves the outgoing call was answered**; if answered-versus-dialing cannot be distinguished, record that limitation and obtain an owner decision on eligibility semantics.

### Scenario C — unavailable caller ID

Given an incoming private, restricted, unknown, or missing number; when the call ends; then show **no WhatsApp shortcut**. No placeholder recipient, guessed contact, or fallback to a previously stored number.

### Scenario D — permission denied

Given telephony/overlay permission is unavailable, revoked, or blocked by OS/device; then the app displays a precise permission/capability state, does not silently attempt blocked actions, and keeps the user in control. A regular permissions dialog must not be presented as if it can grant a hard-restricted permission.

### Scenario E — service lifecycle

Given the app is backgrounded or its process has been killed; then behavior must follow documented Android lifecycle rules. If automation cannot function, **report unsupported**, never claim continuous monitoring or run prohibited foreground services.

### Scenario F — fast repeated calls

Given call #1 ends and call #2 starts quickly; then a stale shortcut for call #1 disappears or is invalidated before call #2's actionable result appears. Handoff always uses the verified currently displayed number.

### Scenario G — WhatsApp not installed

Given a valid number but no supported WhatsApp handler; when user taps; then explain failure without crashing. No automatic installation or redirected marketing page is required.

### Scenario H — language

Given selected language Arabic; on any screen, error, or setup state; all app-authored labels are Arabic and RTL. Phone-number digits and URL remain LTR. Switching to English reverses app layout/text appropriately without clearing settings.

## 4. Call eligibility definition

**Planning default (OPEN for confirmation):** trigger only for **completed, user-participated regular cellular calls**. Missed, declined, rejected, never-answered, blocked, spam, emergency, conference, and VoIP calls are not eligible unless the product owner documents a revised rule. The Android capability to distinguish all such categories must be confirmed; absence of evidence means **suppress**, not guess.

Events must carry (when available) a stable but **ephemeral session identifier**, direction, timestamps, evidence of completion, a verified normalized phone number, and source reliability. Missing critical evidence -> `UNSUPPORTED`/`SUPPRESSED` rather than accidental popups.

## 5. Permissions and onboarding acceptance

- The app starts with automatic operation **off**, and explains the benefits and privacy implications before any special access request.
- If `READ_PHONE_STATE` is required by the chosen API, request only for the implemented capability.
- If an overlay is used, guide users to Android's overlay permission settings, then **recheck** on return; do not fake a runtime-grant flow.
- If `READ_CALL_LOG` is part of an experiment, label it **high-risk / hard-restricted**, isolate it behind a feasibility flag, and avoid making it a presumed prerequisite until verified with a normal install on target devices.
- App must remain usable (for settings, troubleshooting, and approved manual mode) when permissions are unavailable.
- Changing a permission in system settings immediately or on next resume updates feature state.
- System-owned permission labels may differ from app language; app-authored explanations remain localized.

## 6. Data and privacy requirements

| ID | Requirement |
|---|---|
| NFR-01 | No remote storage/transmission of call numbers, phone logs, or contacts in MVP |
| NFR-02 | No unneeded contacts, SMS, microphone, recording, or Accessibility permissions |
| NFR-03 | Do not include raw numbers in analytics, crash reports, console output, or release logs |
| NFR-04 | Ephemeral call metadata expires automatically; no persistent call history by default |
| NFR-05 | App never sends WhatsApp messages without a user's direct action in WhatsApp |
| NFR-06 | Reject unknown/ambiguous number sources; prefer false negative over wrong contact |
| NFR-07 | Do not expose number on lock screen or display floating UI while device is locked |
| NFR-08 | App's opt-out and permission denial must disable the action immediately |

## 7. Quality and performance targets

These are **engineering targets**, not factual platform guarantees:

- **NFR-09:** eligible shortcut appears promptly after verified end; trial target **≤ 3 seconds** on supported test phones, measured in [08](08-TESTING-AND-RELEASE.md).
- **NFR-10:** zero wrong-recipient launches in tested scenarios (release-blocking if observed).
- **NFR-11:** no visible shortcut during an active call, while locked, or after disable.
- **NFR-12:** no ANRs, fatal crashes, or unexplained long-running foreground activity during acceptance runs.
- **NFR-13:** all interactive targets at least accessible to standard accessibility services; labels, screen-reader semantics, dynamic font scales.
- **NFR-14:** bilingual text and bidi phone-number handling verified on devices.
- **NFR-15:** avoid battery-draining polling as a substitute for legal Android event APIs.

## 8. Negative/edge-case matrix

| Case | Required result |
|---|---|
| Unknown/private caller | No shortcut |
| Incoming ring, no answer | No shortcut under default eligibility rule |
| Outgoing dial canceled/unanswered | No shortcut unless owner revises semantics and API can establish the condition |
| Invalid or incomplete phone number | No shortcut; no guess at country code |
| `+` prefix, spaces, parentheses | Normalize only with validated region rules |
| Dual SIM | No cross-SIM call/number mismatch; mark unsupported if pairing uncertain |
| Simultaneous/interleaved events | Suppress ambiguous result |
| Another incoming call while shortcut visible | Remove/disable previous shortcut |
| Overlay authorization revoked | Remove overlay; show explanatory state in app |
| WhatsApp absent | Graceful error; no crash |
| Locked screen | No private number overlay or post-call intrusion |
| Device reboot | Re-evaluate active mode and permissions; don't promise auto-restart |
| Battery restrictions/force-stop | App reports actual limitation; no claims that OS restrictions can be defeated |
| Multiple rapid state callbacks | At most one action for one verified eligible call |

## 9. Traceability

The acceptance cases in [08](08-TESTING-AND-RELEASE.md) map to these IDs. An implementation PR must cite the FR/NFR IDs it changes; a tester must record PASS, FAIL, or BLOCKED with device/API/version evidence. **BLOCKED is not PASS.**
