---
name: "دغري / Dughri"
description: "A minimal Arabic-first Android utility: white surfaces, forest-green identity, emerald accents."
colors:
  primary: "#0B8F69"
  primary-dark: "#075C49"
  forest-dark: "#092D29"
  mint: "#DDF3EB"
  background: "#FAFAF9"
  surface: "#FFFFFF"
  primary-text: "#101816"
  secondary-text: "#727A77"
  border: "#E8EBE9"
  danger: "#E94D4D"
  warning: "#79521A"
  warning-surface: "#FBF2E2"
  dark-primary: "#35C08D"
  dark-background: "#0C1512"
  dark-surface: "#14201B"
  dark-raised: "#1B3A2E"
  dark-text: "#E6EDE9"
  dark-muted: "#9BA8A2"
  dark-border: "#2A3A33"
typography:
  display: "28sp / 40 · 700"
  headline: "23sp / 32 · 700"
  title: "17sp / 26 · 600"
  body: "15sp / 24"
  label: "15sp / 22 · 600"
  caption: "13sp / 20"
  small: "12sp / 18"
rounded:
  card: "20dp"
  button: "12dp"
  field: "12dp"
spacing:
  screen: "20dp horizontal"
  section: "16–24dp"
  card: "16dp"
---

# Design System: دغري / Dughri

## Overview

**Creative North Star: "Premium, lightweight Android utility."**

Owner-approved showcase redesign (2026-10-23, Phase-0 gate waived by explicit owner decision): white and off-white surfaces, forest-green/emerald identity, rounded cards with subtle shadows, Arabic-first RTL layouts, simple View-built line icons, no glassmorphism or decorative gradients. Light mode is primary; a derived deep-forest dark palette remains for system dark scheme.

Structure: three-tab bottom navigation (الرئيسية / السجل / الإعدادات) with white surface and hairline top border; stack screens for onboarding, permissions, manual entry, language, and the diagnostics console. The signature element is the post-call floating card: a compact white rounded (20dp) card with app row, bold heading, international number, and a green "Open WhatsApp" CTA — implemented natively (`OverlayController.showProbe`) and previewed in-app via `PostCallFloatingCard` (onboarding slide 3).

**Evidence boundary — source-only documentation, 2026-10-23.** This documents the implemented source in the working tree, not rendered verification or a release signoff. No native screenshots were taken. Actual-device visual, RTL, font-scale, TalkBack, gesture, overlay, and interaction QA is **BLOCKED**. The Android toolchain on this workstation lacks NDK/cmake/JDK17 configuration; `:app:compileDebugKotlin` and `:dughri-call-engine:compileDebugKotlin` pass with the bundled JBR, and pure-logic JVM tests pass, but no APK was assembled and no phone was used. G-2 (verified automatic number acquisition) remains unproven; the owner explicitly accepted this risk when waiving the Phase-0 gate. Honest home-status states (`checking`, `error`, `needs-permission`, `unsupported`, `suppressed`) are preserved; a `ready` state is intentionally unreachable until real-call evidence exists.

Sources: `src/theme.ts`, `src/components/ui.tsx`, `src/components/icons.tsx`, `src/components/illustrations.tsx`, `src/lib/preferences.ts`, `src/lib/recents.ts`, routes under `app/`, and `modules/dughri-call-engine/.../OverlayController.kt`. Traceability: FR-01/02/08/09/12; NFR-03/06/13/14; BR-09/10/23/35/37/42.

## Colors

Solid showcase palette; the emerald CTA gradient allowed by the reference is omitted (solid `primary`, no gradient dependency). `primary` fills CTAs, switches (on), active tab tint, and selection rings; `primaryDark` pressed states; `forestDark` shadow color and dark accents; `mint`/`raised` highlights, badges, and illustration stages; `danger` errors. Warning/error notices pair semantic text with matching surfaces. Unknown capability states never render as green.

## Layout

- Screen: 20dp horizontal padding, 24dp section rhythm, 600dp max centered column.
- Header: 56dp row, centered title, 44dp action corners; hairline bottom border.
- Cards: `surface` on `background`, radius 20, 16dp padding, soft elevation shadow (elevation 4).
- Rows: white surfaces with hairline separators (not boxed cards); 64dp minimum; 48dp+ touch targets.
- Bottom tabs: white surface, hairline top border, emerald active label/icon, gray inactive; mirrored automatically under RTL.
- Master home card: title + caption + emerald `Switch` on the opposite side; honest status caption below; contextual permission link when access is missing.

## Components

`PrimaryButton` (filled, radius 12, 54dp, optional leading icon), `SecondaryButton` (text-style), `Card`, `SettingRow` (icon/label/value/chevron), `SettingSwitchRow`, `PermissionRow` (status + inline action), `RadioRow` (circular indicator + check), `CountryCodeSelector` (compact trigger + bottom-sheet modal from the fixed 16-entry list), `PhoneNumberInput` (LTR phone-pad), `CallHistoryRow`, `PostCallFloatingCard`, `PaginationDots`, `AppScreen` shell. Icons are View-built 2dp strokes (`icons.tsx`) — no icon font or image assets. Illustrations are View-composed mint stages (`illustrations.tsx`).

## Preferences (schema v2)

`language` (system/en/ar), `welcomeSeen`, `shortcutEnabled` (default **off**), `incoming`/`outgoing` (default on), `notifications` (default off, requests `POST_NOTIFICATIONS`), `countryCode` (fixed list, default +966), `whatsappTarget` (whatsapp/business). v1 payloads migrate forward with safe defaults; strict validation fails closed. Persisted natively via `setAppPreferences(payload)`; the master switch also arms/disarms the native observation probe (`startObservation`/`stopObservation`) — observation is a probe control, not proof of automation.

## Security posture

No raw number persistence: manual-entry numbers live only in an in-memory session recents list (`recents.ts`) shown on the History tab, cleared on backgrounding; entered text clears on route blur and backgrounding. History never reads the system call log. Logs remain fixed-code (`safe-log`).

## Do's and Don'ts

### Do
- Keep the white/emerald showcase palette and paired dark roles.
- Keep the signature floating-card design consistent between the native overlay and the in-app preview.
- Keep honest status copy under the master switch until real-call evidence exists.
- Keep locale files en/ar key-parity and RTL/LTR mirroring per component.

### Don't
- Don't add gradient/shadow decoration beyond the defined card shadow.
- Don't persist raw numbers or read the system call log.
- Don't present the master switch as proof of automatic readiness.
- Don't claim release readiness from source-only review; device QA remains **BLOCKED**.
