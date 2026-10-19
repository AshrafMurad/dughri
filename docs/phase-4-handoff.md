# Phase 4 Handoff — UI/capability connection slice, source-only

- Date: 2026-10-20.
- Authority: owner instruction for source-only phase work with deferred end-of-phase testing (see `phase-2-entry-review.md`, Owner decision — 2026-10-20).
- Commit / diff summary: Home screen now derives its status line from the real typed native capability snapshot through a pure, unit-tested mapping that can never report `ready` while the engine cannot authorize actions. Onboarding/settings/unsupported routes and bilingual RTL behavior were delivered in the Phase 1 shell; this slice completes the "connect controls to the real native capability contract" task honestly.
- Requirement IDs affected: FR-08 (permission/capability state display), FR-09 (localized status), NFR-14 (bilingual status text, device verification pending), docs/05 §4 (never map unknown/permission-granted to ready).

## Files changed

- `src/lib/status.ts` (new): `homeStatus(snapshot, failed)` pure mapping — `checking`/`error`/`needs-permission`/`unsupported`/`suppressed`; no `ready` state exists.
- `app/index.tsx`: focus-time `getSnapshot()`; status line rendered from `copy.home.status`.
- `src/locales/{en,ar}/home.json`: nested `status` block (5 keys per language).
- `tests/home-status.test.mjs` (new): 3 tests incl. real-constants mirror and a documented hypothetical all-available input proving `ready` is unreachable.

## Commands actually run / results

| Exact command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS: 12 JS tests |
| `npm run check:js` | PASS |
| `npm run test:kotlin` | PASS: 20 synthetic JVM tests (unchanged this slice) |

Not run: any Gradle build, APK install, on-device rendering of the new status line, TalkBack/large-font checks (deferred to owner's end-of-phase testing per instruction).

## Phase status summary after this slice

- Phase 3 source (overlay lifecycle guards, parser/normalizer, wa.me handoff, unavailable-app states) already exists from the Phase 0 probes and is hardware-verified only as **test-only probes**; productizing the automatic trigger remains gated on G-2 and is deliberately not wired.
- Phase 4 UI source is complete at skeleton depth; final acceptance (T-019/T-020-style device checks) is deferred.
- Phase 5 (QA matrix) and Phase 6 (signing/APK) require physical devices and builds — BLOCKED under the no-build instruction; nothing codeable remains.

## Product decisions needed

Unchanged: second-phone/region evidence for G-2 or an explicit strategy change; final branding/package ID (Phase 6); whether P1 region-selection parsing investigation is authorized.
