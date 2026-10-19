# Phase 2 Handoff — source-only increment, exit criteria NOT met

- Date: 2026-10-20.
- Authority: owner instruction to continue phases as source-only work (no builds/downloads; test at the end; commit/push per phase), recorded in `phase-2-entry-review.md`.
- Commit / diff summary: typed capability checking, a suppression-only eligibility gate, and default-off versioned engine settings; additive snapshot diagnostics; expanded standalone Kotlin suite 6 → 20 tests. No automatic trigger, service, receiver, permission, or enable path added.
- Requirement IDs affected: FR-05 (suppression reasons), FR-08 (honest typed capability states), NFR-06 (reject unproven sources), NFR-08 (disable semantics), BR-03/04/05/09/10/16 (safety invariants), ARCH-04 §5/§8 (capability/settings contracts). Not a completion claim for FR-03/04/06/07/11/12 — those stay gated on device evidence.

## Files changed

- `modules/dughri-call-engine/android/src/main/java/expo/modules/dughricallengine/EngineCapabilities.kt` (new): honest `available/needs-permission/unsupported/unknown` mapping; `NUMBER_SOURCE_VERIFIED=false` and `BACKGROUND_OPERATION_VERIFIED=false` constants gate the two evidence-dependent states.
- `.../EligibilityGate.kt` (new): pure suppression-only decision layer with ordered reasons (`disabled`, `device-locked`, `permission-missing`, `overlay-unavailable`, `number-source-unverified`, correlator reasons) and fail-closed handling of unknown completion values.
- `.../EngineSettings.kt` (new): versioned settings, default disabled, fail-closed decode, `effectiveMode` returning only `inactive`/`suppressed`.
- `.../ProbeRuntime.kt`: additive only — separate `engine` SharedPreferences read, snapshot gains `capabilities` map and `engine` mode. Probe behavior unchanged.
- `modules/dughri-call-engine/index.ts`: `Capabilities` interface; optional `capabilities`/`engine` snapshot fields.
- `App.tsx`: five capability rows + engine-mode row on the diagnostics screen, rendered through existing localized `states` map.
- `src/locales/{en,ar}/diagnostics.json`: 7 new label keys and 5 new state keys per language.
- `scripts/test-correlator.ps1`, `tests/RunCorrelator.kt`: standalone suite extended to 20 tests.
- `docs/phase-2-entry-review.md`: owner decision entry.

## Dependencies added and justification

None. No npm, Maven, or SDK artifacts were added or downloaded. No lockfile change.

## Commands actually run / results

| Exact command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS: 9 JS tests, zero failures/skips |
| `npm run check:js` | PASS |
| `npm run test:kotlin` | PASS: 20 synthetic JVM tests (SessionCorrelator 6, EngineCapabilities 5, EligibilityGate 6, EngineSettings 3) via Android Studio's existing kotlinc + cached JUnit; no Gradle, no downloads, no Android integration evidence |

Not run (deferred by owner / blocked): `npm run android:installed*` (all Gradle builds), the module's Gradle `testDebugUnitTest` (now 23 tests: 3 PhoneNumbers + 20 above — count not yet executed), `lintDebug`, APK creation/install, device diagnostics rendering, real-call trials.

## Devices / grants / behaviors directly observed

None. All results are pure source-level checks. `EligibilityGateTest`'s all-available map is a hypothetical input for precedence testing, explicitly documented as such in the test file.

## Security/privacy review

No phone numbers, call metadata, or identifiers flow through the new classes; they consume booleans/status strings only. New snapshot fields expose capability codes and a mode word, no user data. No logs added. Locale additions keep the "available ≠ verified behavior" wording so a permission grant cannot be misread as automatic mode working.

## Unverified assumptions and known limitations

- The typed capability contract has not run on any device; the `capabilities`/`engine` snapshot fields are unobserved on hardware.
- `EngineSettings` storage is read-only in this build by design; the persistence write path arrives only with an owner-approved enable flow after G-2 resolution.
- The gate's post-`number-source-unverified` branches are unreachable in production (constant) and covered only via the documented hypothetical map.

## Product decisions needed

Unchanged from `phase-2-entry-review.md`: second-phone evidence or an explicit strategy change (e.g., owner-approved explicit originating-region parsing investigation). Default-dialer, call-log, notification-only, and manual-only remain unapproved.

## Recommended next phase

Phase 3+ source work is gated: overlay/WhatsApp productization and enable UI would misrepresent suppressed behavior as ready. Recommended order: (1) owner's deferred end-of-phase device testing using the existing diagnostics; (2) Phase-2 exit review with that evidence; (3) then Phase 3. This handoff does not authorize Phase 3 implementation.
