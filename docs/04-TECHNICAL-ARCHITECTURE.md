# 04 — Technical Architecture

> **Document ID:** ARCH-04 · **Status:** Proposed architecture; native mechanism gated by AND-03  
> **Last reviewed:** 2026-10-17 · **Platform:** Android only  
> **Read first:** [03 Android feasibility](03-ANDROID-FEASIBILITY.md)

## 1. Architecture goals

Provide an understandable, testable React Native utility without overengineering. Native Android owns call/overlay OS interactions. TypeScript owns product state, settings UI, i18n, input validation, and user-requested WhatsApp handoff. **When the JS runtime is suspended/killed, no critical call event can depend on a JS screen or an unverified JS background task.** Native design and lifecycle must follow Phase-0 findings.

The design is **not** a promise that a background listener/service can run indefinitely. Do not introduce a foreground service unless its lifecycle, type, notification, and background-start legality have been demonstrated in [03](03-ANDROID-FEASIBILITY.md).

## 2. Proposed technology baseline

| Concern | Choice | Note |
|---|---|---|
| Mobile UI | React Native, TypeScript (strict) | Android target only |
| App framework | Expo with **development builds** | Never rely on Expo Go for Kotlin integration |
| Routing | Expo Router | Simple stack, no tabs needed at MVP |
| Native Android integration | Kotlin via **local Expo Module API** | Not a custom backend |
| State | React hooks/context for small UI; no mandatory Zustand | Introduce library only with evidence |
| Preferences | AsyncStorage for low-risk preferences | Do not store call history here |
| Number validation | Maintained libphonenumber-based implementation | Choose library after testing E.164 country rules |
| Localization | Locale files `locales/en/*.json`, `locales/ar/*.json` and typed keys | Avoid one giant translation file |
| Tests | TypeScript unit tests + Kotlin native tests + real-device cases | Detailed matrix in 08 |
| Backend/auth/payments | None | Deferred |

**Dependency pinning policy:** During Phase 1, verify current supported Expo SDK/React Native/Kotlin/Gradle compatibility and lock exact versions in `package-lock.json` (or one chosen lockfile). Do not fabricate versions in these docs. Use a single package manager; write exact installed versions into the implementation report.

## 3. Logical components

```text
┌─────────────────────────── React Native / TypeScript ───────────────────────────┐
│ Expo Router screens ─── UI state, i18n, setup wizard, settings, troubleshooting│
│                     │                                                        │
│          Capability facade / permission-state adapter                       │
│                     │                                                        │
│          WhatsAppLinkService / PhoneNumberNormalizer                        │
└─────────────────────┼──────────────────────────────────────────────────────────┘
                      │ Expo local native module (typed API)
┌─────────────────────▼────────────────── Kotlin / Android ───────────────────────┐
│ Capability/permission checker                                                  │
│  ├─ call source adapter (CHOSEN ONLY AFTER PHASE 0)                            │
│  ├─ event correlator / dedupe / eligibility engine                             │
│  ├─ ephemeral call context (minimal, expiring)                                 │
│  └─ overlay controller with explicit user-granted access                       │
│             │                                                                 │
│ Android Telephony / Telecom / WindowManager / lifecycle APIs                   │
└────────────────────────────────────────────────────────────────────────────────┘
                       User taps  →  sanitized wa.me handoff
```

**Boundary rule:** JavaScript should not query Android call logs directly; Kotlin is the sole point where OS permissions and call events are implemented. Conversely, Kotlin must not become a second UI business-layer containing non-OS product screens.

## 4. Repository proposal

```text
/
├── AGENTS.md                          # Agent operating rules
├── README.md                          # How to build/run, known limitations (implementation time)
├── app/                               # Expo Router screens
│   ├── _layout.tsx
│   ├── index.tsx                       # Home/dashboard
│   ├── onboarding.tsx
│   ├── permissions.tsx
│   └── settings.tsx
├── src/
│   ├── components/                     # Reusable presentation only
│   ├── features/
│   │   ├── permissions/                # JS capability adapter/hooks
│   │   ├── redirect/                   # WhatsApp URL handoff & view state
│   │   └── settings/                   # User preferences
│   ├── lib/phone/                      # Normalize/validate numbers
│   ├── locales/en/                     # common.json, onboarding.json, settings.json
│   ├── locales/ar/                     # same keys as English
│   ├── theme/                          # tokens; no brand invented without approval
│   └── types/                          # strongly typed data contracts
├── modules/after-call-android/         # Expo local module
│   ├── android/src/main/               # Kotlin, manifest contributions
│   └── src/index.ts                    # typed bridge
├── tests/                              # JS unit/integration
├── docs/                               # eight main specs + later evidence
├── app.config.ts                       # Expo config
└── package.json
```

Paths are **suggested**, not proof that Expo generates those exact files. Follow generator output and document deviations. Choose whether to commit generated `android/` based on actual need to maintain persistent Kotlin/service/manifest changes. Native configuration must be reproducible after prebuild; avoid untracked manual edits that `prebuild --clean` would erase.

## 5. Typed capability contract (suggested API)

```ts
type CapabilityState = 'available' | 'needs-permission' | 'restricted' | 'unsupported' | 'unknown';
type CallDirection = 'incoming' | 'outgoing';
type TriggerSuppressionReason =
  | 'disabled' | 'permission-missing' | 'number-unavailable'
  | 'number-ambiguous' | 'not-eligible' | 'overlay-unavailable'
  | 'device-locked' | 'duplicate' | 'platform-unsupported';

interface NativeCapabilities {
  phoneState: CapabilityState;
  numberSource: CapabilityState;
  overlay: CapabilityState;
  backgroundOperation: CapabilityState;
  supportedDirection: Record<CallDirection, boolean>;
  explanationCodes: string[]; // mapped to localized JS strings
}
interface EligibleCallAction {
  eventId: string;              // ephemeral UUID, not caller number
  direction: CallDirection;
  endedAtEpochMs: number;
  validUntilEpochMs: number;
  e164: string;                 // private; never log or persist long-term
  provenance: 'verified-source';// chosen native source documented after P0
}
```

Proposed native bridge surface:

```ts
interface AfterCallAndroidModule {
  getCapabilities(): Promise<NativeCapabilities>;
  openOverlayPermissionSettings(): Promise<void>;
  refreshPermissions(): Promise<NativeCapabilities>;
  setAutomaticModeEnabled(enabled: boolean): Promise<void>;
  dismissCurrentShortcut(): Promise<void>;
  // Foreground-only events for UI diagnostics. Native implementation must not
  // depend on JS listener availability to handle background call lifecycles.
  addListener(event: 'capabilitiesChanged', handler: (c: NativeCapabilities) => void): Subscription;
}
```

The interface is a **draft** and may change after Phase 0; never generate pretend native functions just to satisfy a TypeScript interface. A Kotlin call action may invoke a safe native `ACTION_VIEW` intent when the bubble is tapped. If the JS app provides the handoff, only do so while it is active and user-initiated.

## 6. Native call lifecycle

Model call handling as a state machine, **not** a `if (IDLE) showOverlay()` condition:

```text
INACTIVE ─(enabled + capability verified)─> LISTENING
LISTENING ─(possible call start)─────────> CANDIDATE
CANDIDATE ─(proven eligible session)─────> IN_CALL
CANDIDATE/IN_CALL ─(end signal)──────────> VALIDATING
VALIDATING ─(correct, valid, eligible)───> ACTION_READY ─> DISPLAYED
VALIDATING ─(unknown / ambiguous)────────> SUPPRESSED ─> LISTENING
DISPLAYED ─(tap / dismiss / expiry / new call)─> LISTENING
ANY ─(disabled / permission revoked)────> INACTIVE [remove overlay]
```

The exact `CANDIDATE` → `IN_CALL` evidence depends on the Android strategy. **Do not call `OFFHOOK` equivalent to answered without proof.** Every action must bind to a particular verified session; consecutive call callbacks may repeat; incoming/outgoing sources may differ; the screen must not use a previous call's number.

### Critical data rules

- Generate unique ephemeral call/session IDs, not IDs derived from phone numbers.
- Hold at most **one** eligible actionable session per device at a time; new call invalidates previous session.
- Deduplicate callbacks per call ID and state transition; no repeated bubble creation.
- Never persist raw phone numbers to a conventional history table by default.
- Expire ephemeral state and remove overlay on disable, revocation, dismissal, service shutdown, and lock-screen transition.
- Treat missing number attribution as suppression; no fallback to `getLastOutgoingCall()` as a universal heuristic.
- Keep Kotlin logs redacted (`eventId`, state, reason codes only).

## 7. WhatsApp handoff and number normalization

- Accept **verified** raw number + origin region from the native provider; never infer a country merely from device locale if ambiguous.
- Normalize using a maintained phone-number parser, validate against supported region/country rules, output E.164; format for WhatsApp as `e164.substring(1)` (digits only) after successful validation.
- Construct `https://wa.me/<internationalDigits>`; no inserted symbols; no unencoded user content.
- Action starts **only on the user's tap**. Android intent resolution may show a chooser or browser; opening a specific WhatsApp variant is not guaranteed without separate tested package handling.
- Handle no link handler, uninstalled WhatsApp, missing recipient registration, and canceled chooser without claiming a message was sent.
- Do not use unofficial WhatsApp APIs or message automation.

## 8. Local configuration model

```ts
interface LocalSettingsV1 {
  schemaVersion: 1;
  enabled: boolean;              // default false
  language: 'system' | 'en' | 'ar'; // default system, fallback en
  showAfterIncoming: true;       // both are locked product scope
  showAfterOutgoing: true;
  // Preferred WhatsApp variant, duration, region selection intentionally
  // omitted until approved; do not invent toggles from future ideas.
}
```

Settings migration must be explicit: reject unexpected schema versions or migrate deterministically. If saving preferences fails, do not represent auto-mode as enabled. Native runtime must be told of changes and should verify permission/capability before becoming active.

## 9. Permission and lifecycle architecture

- **Only** list Android permissions needed for the chosen, proven implementation.
- `READ_PHONE_STATE` may apply to telephony state listener; `SYSTEM_ALERT_WINDOW` is a special user-granted access; `READ_CALL_LOG` is **restricted** (see 03).
- If `CallScreeningService` is chosen, handle role status and service callback deadline, preserving normal phone function. A screening role may displace existing apps.
- If foreground service is warranted, document service type, start conditions, notification, API restrictions, and stop behavior. No arbitrary `dataSync`/`specialUse` declarations to sidestep rules.
- `POST_NOTIFICATIONS` is relevant only if notifications actually exist; do not request it speculatively.
- Do not rely on boot receivers, WorkManager, hidden APIs, or JS background tasks without a documented lifecycle reason and real-device proof.

## 10. Dependency and security rules

- No third-party packages added for a single trivial helper without review.
- No permissions for contacts/SMS/storage/microphone or Accessibility Service.
- No telephony values in HTTP requests, telemetry, logs, traces, or screenshot test fixtures with real numbers.
- No permission-grant automation or default-role coercion.
- No unnecessary API server, database, Redis, or cloud service for the MVP.

## 11. Architectural decision records (ADRs)

Maintain decisions as short entries in implementation reports. First mandatory `ADR-001` is the Phase-0 native approach: evidence, options rejected, role/permissions, supported devices, security and lifecycle implications. Future changes to app framework, minSdk, service strategy, or permission model each require a new ADR + owner approval for product-facing changes.

## 12. Reference implementations

- Expo local modules: https://docs.expo.dev/modules/get-started/
- Expo native development builds: https://docs.expo.dev/develop/development-builds/introduction/
- Android call-state and restricted permissions: links in [03](03-ANDROID-FEASIBILITY.md)
