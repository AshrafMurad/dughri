# Dughri / دغري

<!-- impeccable:product-schema 1 -->

## Platform

android

## Users

People who need to continue an ordinary cellular call in WhatsApp without saving a contact. The owner approved a daily-use utility interface with diagnostics separated from the home screen.

## Product Purpose

An explicitly enabled floating shortcut after eligible incoming and outgoing cellular calls, opening a validated WhatsApp target only on a tap.

## Operating Context

React Native / Expo with a local Kotlin module. Arabic and English from first use. Ordinary APK installation; no privileged permission workarounds. The owner will perform physical-phone acceptance later; hardware availability is currently blocked.

## Capabilities and Constraints

Call-end detection does not prove access to the number or an answered call. G-2 remains blocked in the recorded evidence. Automatic triggering stays suppressed until actual-device gates pass. Local and international telephone formats must be handled honestly: never infer an originating region from language. Region-based parsing is a separate approval and implementation decision. No accounts, backend, analytics, call history, automatic messaging, or notification/manual-only product pivot.

## Brand Commitments

The owner confirmed دغري as the primary Arabic name and Dughri as the English name. The owner supplied assets/app-icon.png (standalone mark) and assets/app-icon-2.png (square icon), then explicitly approved using the first in the UI/adaptive foreground and the second as the legacy icon. Subsequent owner-side configuration selected the square artwork for both launcher modes on a dark adaptive background; this effective configuration is preserved. The standalone mark remains in the UI, and its padded adaptive derivative remains available as an alternate.

## Evidence on Hand

docs/01 through docs/08 are the baseline. docs/phase-0-evidence.md records device experiments. docs/remaining-before-qa-and-release.md records outstanding checks. No new native capability or successful hardware test is established by this redesign.

## Product Principles

- Show the real capability and a useful next step.
- Keep everyday operation distinct from test probes.
- Fail closed for invalid, private, stale, or ambiguous numbers.
- Keep phone data ephemeral and messages user-initiated.

## Accessibility & Inclusion

Arabic RTL and English LTR; numbers and trace timestamps remain LTR. System font scaling, TalkBack labels, and at least 48dp touch targets. No private overlay on the lock screen.
