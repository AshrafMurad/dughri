# 03 — Android Feasibility and Phase-0 Proof of Concept

> **Document ID:** AND-03 · **Status:** RELEASE BLOCKER — unverified until real-device experiments  
> **Research reviewed:** 2026-10-17 · **Priority:** Read this BEFORE implementing call automation  
> **Owners:** Android native engineer + product owner

## 1. Non-negotiable feasibility gate

The product depends on **three distinct capabilities**:

1. Detect that an **incoming or outgoing standard cellular call has completed**.
2. Correctly obtain **that call's phone number** without relying on stale, guessed, or unlawfully acquired data.
3. Show a **user-authorized temporary floating action after the call** despite background and OEM restrictions.

Then, separately, a user tap must open the WhatsApp chat for the validated number. **Proving #1 does not prove #2 or #3.** A mock phone number or a manually populated test number is useful to test rendering/handoff but must **not** count as proof of automatic number acquisition.

**Phase-0 outcome = GO, PIVOT PROPOSED, or NO-GO.** No agent may claim GO from emulator-only observations, source-code inspection, permission manifest declarations, or mocked events.

## 2. Platform facts and supported research paths

### A. Call state — partially feasible, not a caller-number API

`TelephonyCallback.CallStateListener` (API 31+) reports ringing/off-hook/idle for a registered subscription and requires `READ_PHONE_STATE`. Its callback contains **state only**, not the other party's number. State transitions alone may not identify answered versus dialed/missed calls and must not be treated as exact call records. Older versions have different callback/listener behavior that requires separate testing.

**Official reference:** https://developer.android.com/reference/android/telephony/TelephonyCallback.CallStateListener

### B. Call logs — sensitive, hard-restricted

`CallLog.Calls` contains call records, but reading it normally needs `READ_CALL_LOG`. Android identifies `READ_CALL_LOG` as a **hard-restricted permission**: the installer of record must allowlist it before the app can hold it. A sideloaded APK, request dialog, or manifest entry **does not automatically grant access**. An OS version or installer behavior may still disallow it. Do not use hidden privileged/ADB policy modifications as a production workaround.

**Official references:**  
- https://developer.android.com/reference/android/provider/CallLog.Calls  
- https://developer.android.com/reference/android/Manifest.permission#READ_CALL_LOG

### C. Call-screening role — possible investigation, not a drop-in solution

`CallScreeningService` can receive details of incoming and outgoing calls, but **only as the user-selected call-screening app** (or applicable dialer role). It operates at incoming/outgoing call initiation, not as a guarantee of accurate call-end callbacks. It requires user role assignment and may interact with the call experience: the service must handle incoming calls and respond within its deadline. Never block or delay calls as a side effect of this proof of concept. Test availability, number visibility, and lifecycle before considering it. A role that replaces another screening app may be unacceptable to users, requiring owner approval.

**Official reference:** https://developer.android.com/reference/android/telecom/CallScreeningService

### D. Floating overlay — special access, not guaranteed background UI

`WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY` requires `SYSTEM_ALERT_WINDOW` and explicit user authorization (`Settings.canDrawOverlays()`/special settings screen). The system can alter or hide overlay windows. Starting activities from the background and foreground services are restricted. **Android 15+** further restricts some background foreground-service starts even for apps with overlay permission: a currently visible overlay is required for that particular exemption. The proposed *post-call-only overlay* therefore cannot be assumed to grant the exemption needed to start a service after the call.

**Official references:**  
- https://developer.android.com/reference/android/view/WindowManager.LayoutParams#TYPE_APPLICATION_OVERLAY  
- https://developer.android.com/reference/android/provider/Settings#canDrawOverlays(android.content.Context)  
- https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start  
- https://developer.android.com/guide/components/activities/background-starts

Do **not** invent an arbitrary foreground-service type. Android 14+ requires declared service types and matching permissions, and Android 12+ restricts background starts.

### E. WhatsApp click-to-chat — independently testable

WhatsApp documents `https://wa.me/<number>` where `<number>` is international digits without a leading `+`, spaces, punctuation, or international dial prefix. The link cannot guarantee the recipient has WhatsApp or the installed application routes the link exactly as expected.

**Official reference:** https://faq.whatsapp.com/5913398998672934

### F. Expo versus native code

The React Native UI can use Expo but **Expo Go cannot contain this custom Kotlin module**. Use a development build and a local Expo module; native code changes require rebuilding the Android app.

**Official references:**  
- https://docs.expo.dev/modules/get-started/  
- https://docs.expo.dev/develop/development-builds/introduction/

## 3. Phase-0 experiments (order matters)

Run experiments as isolated, small Kotlin prototypes first. It is acceptable to wrap them in the minimal Expo development build; **do not** implement the product UI yet.

| Probe | Question | Method | Evidence required |
|---|---|---|---|
| P0-A | Can device report start/end states for both call directions? | Test `TelephonyCallback` or supported historical API with explicit permission | Timestamped transitions by call type, version, OEM, app state |
| P0-B | Can the correct other-party number be retrieved for both call directions? | First test officially supported, least-privileged APIs; separately investigate role-based screening and allowed call-log access | Exact match to known test numbers, provenance, permissions/role and installer |
| P0-C | Can a post-call overlay show when app is backgrounded? | Test `TYPE_APPLICATION_OVERLAY`, OS lifecycle, keyguard, force-stop/battery cases | Photos/video or tester observations; timestamps; permission states |
| P0-D | Can the overlay be removed reliably? | Disable, dismiss, lock, new call, revoke overlay | No leftover bubble/no number exposure |
| P0-E | Does tap open expected WhatsApp target? | Test `wa.me` with known synthetic or consenting number | Deep-link package outcome, no auto-message |
| P0-F | Can all of the above be combined without privileged workarounds? | End-to-end on actual phones after normal APK installation | Reproducible checklist + build hash + call scenarios |

**Separation rule:** for P0-C/E it is fine to use a synthetic number. For P0-B/F it is **not**.

## 4. Candidate strategies — evaluate, don't assume

**Strategy 1 — Telephony state + lawful number acquisition.** Simplest call-end source. Biggest risk: lack of correct number, particularly on incoming calls. Mark incompatible if that cannot be proven.

**Strategy 2 — User-consented call-screening role + lifecycle correlation.** Explore whether `CallScreeningService` supplies usable numbers for both directions and whether separate end-state signaling can be safely correlated. Risks: role availability, user-facing tradeoff, calls excluded by the service, callback deadline, races, privacy. Not approved for release solely because code compiles.

**Strategy 3 — Call-log query.** Experiment separately *only if* permission is actually grantable through the normal installation/distribution channel. Record installer and system state; don't assume `READ_CALL_LOG` is freely grantable or user grant alone suffices. Don't ask users to install via exploit/privileged tooling.

**Strategy 4 — notification/manual fallback.** Offers partial user value without automatic number acquisition. This is **a product pivot**, not a hidden implementation substitute; owner must approve a change from automatic floating shortcut to fallback-only behavior.

**Rejected techniques:** Accessibility scraping to extract dialer content; phone-notification scraping; secret contact access; rooting, APK installer tricks/ADB allowlisting as a consumer requirement; silently becoming default dialer; using outdated `targetSdk` to evade privacy limits; infinite polling/undocumented OEM hooks.

## 5. Probe method and minimum evidence set

Use **two distinct real Android phones**, including at least one modern Android release (Android 14/15 or later) and preferably different manufacturers; a third OEM phone is recommended. Final supported Android range is **OPEN**, so record exact OS, build, and target SDK rather than assuming a universal min SDK.

On each phone, run **at least five test trials** for each of these supported scenarios: answered incoming, completed outgoing, incoming missed, unknown/private incoming (if testable safely), and rapid sequential calls. Include **foreground** and **background** app states. For the core end-to-end success gate, answered incoming/outgoing **must be observed on both phones without special developer privileges**. Test overlay permission denied/granted/revoked, locked device, WhatsApp absent, and battery restrictions where practical.

Save results to `docs/phase-0-evidence.md` during execution (generated at implementation time; not a ninth prewritten product spec). Template:

```md
# Phase 0 Evidence
- Date / agent / git commit / APK sha256:
- Device model / manufacturer / OS build / API level / target SDK:
- Installer source / permission grant result / selected call-screening role:
- Test SIM/carrier / dual-SIM state:
- Probe ID / incoming-or-outgoing / app foreground-or-background:
- Expected result / observed result / PASS|FAIL|BLOCKED:
- Number available? yes/no (DO NOT record full phone numbers)
- Number provenance: telephony|role|call-log|manual-test-only|unknown
- Overlay displayed? yes/no / delay / lifecycle:
- Timestamped redacted log excerpt / reproduction steps:
- OS or OEM limitation and official reference:
- Open issue / owner decision requested:
```

Use test numbers belonging to consenting testers. Mask numbers in evidence/logs (e.g. `***1234`) and do not upload call logs or contact lists.

## 6. Pass/fail and escalation rules

| Gate | Required evidence | If not met |
|---|---|---|
| G-1 | Incoming **and** outgoing eligible call recognition | STOP; describe which direction failed |
| G-2 | Correct attributable number for both, **without restricted privilege hacks** | STOP; owner must review pivot |
| G-3 | Post-call floating action works after normal installation in background on tested devices | STOP; owner reviews alternate UX |
| G-4 | No wrong recipient / duplicate / lockscreen leak in repeat tests | STOP; fix before proceeding |
| G-5 | WhatsApp opens via user tap; no auto-message | Fix integration and retest |

**GO:** all mandatory gates pass reproducibly on declared supported test devices, and any unavoidable OS/OEM restrictions are explicitly accepted by the owner. **PIVOT PROPOSED:** lawful implementation of an alternate flow is demonstrated but locked automatic requirements can't be met. **NO-GO:** core use case cannot be delivered consistently or safely.

If evidence is inconclusive, state **BLOCKED/UNKNOWN**, not GO. Approval to pivot or to narrow device support is a **product decision**.

## 7. Mandatory Phase-0 report

Before Phase 1, produce:

1. `docs/phase-0-evidence.md` with test matrix and redacted observations.
2. A short architecture decision (`ADR-001`) in that report: chosen signal, number source, overlay lifecycle strategy, permission/role requirements, known device matrix.
3. A concise owner decision request with **GO / PIVOT PROPOSED / NO-GO**, exact unsupported cases, and reproduction steps.
4. A minimal working APK and source commit.

**Never claim “supports all Android phones” or “works when the app is force-stopped” without evidence.**
