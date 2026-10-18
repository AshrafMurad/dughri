# AGENTS.md — WhatsApp After-Call Redirector

> **Purpose:** operating rules for AI coding agents. Read before planning, editing, or testing.  
> **Last updated:** 2026-10-17 · **Project:** Android utility app (React Native/Expo + Kotlin)

## 1. Mandatory reading order

Read these documents **before** touching code:

1. `docs/01-PRODUCT-OVERVIEW.md` — locked decisions and scope.
2. `docs/02-REQUIREMENTS.md` — traceable functional/nonfunctional requirements.
3. `docs/03-ANDROID-FEASIBILITY.md` — **release blocker and Phase-0 gates**.
4. `docs/04-TECHNICAL-ARCHITECTURE.md` — native/TS boundaries.
5. `docs/05-UI-UX-GUIDELINES.md` — bilingual UX and correct capability display.
6. `docs/06-BUSINESS-RULES.md` — invariants, safety, default values.
7. `docs/07-IMPLEMENTATION-PLAN.md` — phase order/exit criteria.
8. `docs/08-TESTING-AND-RELEASE.md` — hardware acceptance and APK signoff.

If these files conflict, the product owner's locked decisions and the actual verified Android feasibility evidence take precedence. Surface the conflict; **do not silently improvise**.

## 2. Project boundaries

- Android only; both incoming and outgoing **ordinary cellular calls**.
- Preferred experience is a **floating shortcut after the call** if possible under Android restrictions.
- Arabic + English (`en`, `ar`) from the start.
- React Native/Expo UI + Kotlin native integration via local Expo module; requires a native dev build, **not Expo Go**.
- Subscriptions, backend, auth, ads, analytics, automatic messaging, SMS, call recording, and cloud call history are **out of MVP scope**.
- APK distribution does **not** override restricted Android permissions.
- Manual mode, notification fallback, and WhatsApp Business are P1 options, not automatic substitutes for the approved core.

## 3. Non-hallucination contract

**Never:**

- Assert access to the caller's number because `TelephonyCallback` reported `IDLE`.
- Assert `READ_CALL_LOG` is grantable just because it is in the manifest or a device is sideloaded.
- Claim a call is answered just from `OFFHOOK` without supporting signal/evidence.
- Use fake caller numbers, mock call events, or emulators as proof of real-call integration.
- Claim a native service survives force-stop/reboot/background restrictions without real-device testing.
- Generate fictional test results, logcat traces, build success, screenshots, or a working APK.
- Introduce privileged grants, Accessibility scraping, notification scraping, rooting, undocumented APIs, or OEM hooks to bypass privacy protections.
- Invent permission states, app-store rights, official Android API semantics, or WhatsApp package-routing guarantees.
- Quietly replace floating automatic feature with a notification or manual-only UX.

**Instead:** label uncertainty `OPEN`, `CONDITIONAL`, `BLOCKED`, or `UNSUPPORTED`; cite specific official docs and device observations; request owner choice where product intent would change. A partial verified result is better than fabricated completion.

## 4. Phase gating

- Start **Phase 0 only**. No full design/feature build before actual-device feasibility and owner GO.
- Execute one phase at a time, using `docs/07-IMPLEMENTATION-PLAN.md`.
- A phase is complete only when exit criteria pass and exact commands/results, tested devices, and known limitations are recorded.
- Never mark native behavior verified if tests were not performed on physical Android hardware.
- New phase begins only after preceding gate met; product owner makes GO/PIVOT decision.

## 5. Code rules

```drawio width=800
<mxfile>
  <diagram id="default" name="Page-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```


- TypeScript strict; clear types and small cohesive functions; avoid `any` unless justified.
- Kotlin for telephony/overlay/lifecycle; TypeScript for screens, localization, preferences, and validated handoff orchestration.
- Never rely on suspended React/JS screens to receive mandatory background call events.
- Maintain `src/locales` (or chosen equivalent) with matching keys for both languages; modular JSON per feature, no hardcoded UI strings.
- No excessive architecture or unnecessary dependencies, server, database, or state library.
- Do not pin random dependency versions: verify current compatibility and commit one lockfile.
- Reproducible Android native configuration; do not make changes that disappear after Expo prebuild.
- Native capability statuses must be honest (`unknown` must never be mapped to `available`).
- When JavaScript tests mock call events, name the mocks and report their limitations.
- Use secure local handling; no raw number persistence/history; no raw phone numbers in logs/errors/traces.
- Any added permission/role needs an ADR, clear purpose, and test evidence on ordinary installs.

## 6. Test and documentation rules

For each change:

1. State affected `FR`, `NFR`, and/or `BR` IDs.
2. Add or update deterministic tests for pure logic.
3. Run available typecheck/lint/unit/native build tests; report **exactly which commands actually ran**.
4. For call/overlay features, test on real supported devices and record OS/OEM/permission/installer state.
5. Record results as `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN`; never substitute a plan for execution.
6. Update `docs/phase-0-evidence.md` for feasibility probes; redact tester numbers.
7. Supply a short handoff using the template in `docs/07-IMPLEMENTATION-PLAN.md`.

## 7. Stop-and-escalate triggers

STOP the affected phase and report options when:

- Accurate number acquisition cannot be proven for **either** incoming or outgoing calls.
- Needed permission is restricted/ungrantable via ordinary installation.
- Background overlay needs an illegitimate workaround, unsupported service type, or invasive access.
- Device returns ambiguous session/number pairing or a wrong-number result.
- Call-screening role impacts normal phone behavior or displaces an existing call-screening app unexpectedly.
- Product scope would shift to manual-only or notification-only.
- Real-device testing is unavailable for a native completion claim.

The owner must explicitly approve any product change. Do not change D-001 through D-008 on your own.

## 8. First assignment

**Implement only the feasibility proof of concept described in `docs/03-ANDROID-FEASIBILITY.md` and Phase 0 of `docs/07-IMPLEMENTATION-PLAN.md`.** Deliver a redacted evidence report with `GO | PIVOT PROPOSED | NO-GO`, plus working source/minimal APK only where actually verified. **Stop before Phase 1.**
