---
name: "دغري / Dughri"
description: "An elegant, calm Android utility in pure white and forest green."
colors:
  primary: "#215B40"
  on-primary: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#F3F6F4"
  raised: "#E8F1EB"
  text: "#18251E"
  muted: "#526158"
  outline: "#DCE4DE"
  warning: "#79521A"
  warning-surface: "#FBF2E2"
  error: "#A33331"
  error-surface: "#FBECEB"
  dark-primary: "#A1D5AE"
  dark-on-primary: "#103822"
  dark-background: "#101813"
  dark-surface: "#1B251E"
  dark-raised: "#233C2C"
  dark-text: "#E4ECE5"
  dark-muted: "#B1BFB4"
  dark-outline: "#3B4A40"
  dark-warning: "#EAC486"
  dark-warning-surface: "#3B3020"
  dark-error: "#FFB4AE"
  dark-error-surface: "#452724"
typography:
  display:
    fontSize: "38sp"
    lineHeight: "54sp"
    fontWeight: 700
  headline:
    fontSize: "28sp"
    lineHeight: "42sp"
    fontWeight: 600
  title:
    fontSize: "20sp"
    lineHeight: "30sp"
    fontWeight: 600
  body:
    fontSize: "16sp"
    lineHeight: "26sp"
  label:
    fontSize: "14sp"
    lineHeight: "22sp"
    fontWeight: 600
  caption:
    fontSize: "13sp"
    lineHeight: "21sp"
rounded:
  field: "12dp"
  panel: "16dp"
  step: "18dp"
  action: "28dp"
spacing:
  micro: "4dp"
  small: "8dp"
  group: "12dp"
  control-block: "14dp"
  related: "16dp"
  footer-inset: "20dp"
  section: "24dp"
  page-end: "32dp"
components:
  action-filled:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14dp 24dp"
  action-tonal:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14dp 24dp"
  action-text:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14dp 24dp"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24dp"
  panel-raised:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.panel}"
    padding: "24dp"
  route-link:
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    padding: "14dp 4dp"
  route-link-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "14dp 4dp"
  diagnostic-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.field}"
    padding: "14dp 16dp"
  journey-number:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.step}"
    width: "36dp"
---

# Design System: دغري / Dughri

## Overview

**Creative North Star: "Elegant and calm"**

A quiet daily-use Android utility: pure white, forest-green emphasis, generous whitespace, and readable system type. The owner confirmed this direction after rejecting the initial petrol-blue panel. دغري is the primary Arabic name; Dughri is the English name. The interface shows the owner-supplied standalone mark at 40dp beside the name. Subsequent owner-side configuration selects the supplied square icon for both launcher modes on a dark adaptive background. `scripts/prepare-brand-assets.mjs` produces a padded standalone derivative retained as an alternate; originals are preserved. See `assets/README.md` for provenance.

Material-native Android expectations guide hierarchy, tonal controls, touch interaction, and navigation. The implementation uses React Native primitives and custom shared components, not a verified Material component-library installation. Brand is expressed through color roles and restrained rounded forms. Everyday status and a useful next action lead; experimental probes remain on the diagnostics route.

**Evidence boundary — source-only documentation, 2026-10-22.** This captures the implemented source in the working tree, not rendered verification or a release signoff. No native screenshots were available. Actual-device visual, RTL, font-scale, TalkBack, gesture, and interaction QA is **BLOCKED**. The source-only review found RTL-root and false/stale refresh-feedback bugs; the parent fixed these. Current source shows explicit LTR layout roots with localized child direction, revision-guarded snapshots, stale-state masking, and refresh-dependent diagnostic outcomes. Those are source observations, not proof of behavior on Android hardware. G-2 remains **BLOCKED**; documenting the built source does not establish Phase-0 GO or advance a release gate.

Sources: `PRODUCT.md`, `docs/dughri-ui-direction.md`, `src/theme.ts`, `src/components/Screen.tsx`, `src/components/ScreenBoundary.tsx`, `App.tsx`, `src/lib/useDeviceSnapshot.ts`, and the routes under `app/`. The confirmed owner direction supersedes the older OPEN branding language in docs/01 and docs/05 for the name and visual direction only. Device acceptance, including launcher-mask appearance, remains unresolved. Documentation traceability: FR-01/02/08/09/12; NFR-03/06/13/14; BR-09/10/23/35/37/42. No application behavior changes are made by these documents.

**Key Characteristics:**
- Pure-white light canvas with forest-green emphasis.
- Paired light/dark role palettes, selected by the system color scheme.
- Android system typography with Arabic shaping and localized direction.
- Tonal controls, restrained rounded surfaces, and unboxed divided rows.
- Truthful capability states, separate diagnostics, and no invented brand assets.

## Colors

The palette pairs a deep forest accent with green-tinted neutrals; warning and error tones carry explicit feedback rather than decoration. Frontmatter values are normative extracts from `src/theme.ts`; hyphenated names map to camelCase source roles, and `dark-` identifies the corresponding dark-theme value. No secondary or tertiary brand accent is implemented.

### Primary
- **Forest Green** (`primary`): filled and selected actions, route labels, chevrons, journey numerals, field selection, and enabled diagnostic switch tracks.
- **On Forest** (`on-primary`): text on filled actions and primary route links.
- **Soft Forest** (`dark-primary`): the same emphasis roles in dark mode, paired with `dark-on-primary`.

### Neutral
- **Pure White** (`background`): light screen canvas and diagnostic switch thumb.
- **Quiet Surface** (`surface`): regular panels and diagnostic input background.
- **Forest Tint** (`raised`): home status area, tonal buttons, journey number badges; the name describes a tonal layer, not physical elevation.
- **Ink / Supporting Ink** (`text`, `muted`): main copy versus explanatory copy and captions.
- **Soft Divider** (`outline`): hairlines, diagnostic field stroke, and Android ripple color.
- Dark neutral roles (`dark-background`, `dark-surface`, `dark-raised`, `dark-text`, `dark-muted`, `dark-outline`) preserve these assignments rather than invert the light colors.

### Semantic feedback
- **Warm Caution** (`warning`, `warning-surface`): conditional and limitation notices.
- **Restrained Error** (`error`, `error-surface`): failed checks, preference failures, and recoverable errors.
- Their `dark-` counterparts serve identical roles. Unknown capability never becomes successful merely because a component uses green.

**The Role Pairing Rule.** Resolve the complete palette through `useTheme`; keep filled text paired with on-primary and feedback text paired with its semantic surface.

The app uses fixed paired palettes. Wallpaper-derived Dynamic Color, contrast variants, and generated tonal ramps are not implemented and are not added as tokens here.

## Typography

**Display and body font:** Android system sans-serif; no `fontFamily` is set in the inspected source. Pinned Android guidance identifies Roboto as the system face; Arabic uses platform shaping and available script fallback. Do not install or declare a bundled Roboto/Arabic font to mimic this policy. Actual OEM fallback and glyph appearance require native QA. There is no distinct mono face.

The six frontmatter roles copy the `type` object exactly. They are a project scale mapped to Material role names, not a claim to implement every Material 3 large/medium/small preset. `display` is defined, but the inspected home uses `headline` for the screen title; do not promote every title to display size.

### Hierarchy
- **Display:** strongest available emphasis; defined in the theme, not required for every screen.
- **Headline:** screen titles, onboarding task headline, failure title.
- **Title:** section headings, status heading, and wordmark.
- **Body:** explanatory copy, capability values, and main reading text.
- **Label:** actions, route links, row labels, journey titles and numerals.
- **Caption:** privacy notes, limitations, journey details, and diagnostic trace text.

Body and caption have no explicit weight override; retain the platform default. No letter-spacing token, uppercase transformation, custom font asset, or proportional scale ratio is declared. The diagnostics field is a deliberate local exception (font size 18), not another global text role.

**Native units:** source style numbers are React Native logical values. Frontmatter uses `dp` for layout and `sp` for Android-scaled text intent; these are documentation units, not drop-in CSS. `allowFontScaling` is not disabled in the inspected components. Scaling, line wrapping, Arabic baselines, and clipping have not been device-verified.

**The Direction Rule.** Arabic prose aligns right and writes RTL; English aligns left and writes LTR. Phone data and trace timestamps explicitly remain LTR. Preserve localized strings rather than hardcoding interface copy.

## Layout

The shared screen is a safe-area-aware, vertically scrolling single column. It fills available width and centers at a maximum width (600dp), with side padding (24dp), top padding (8dp), and bottom padding (32dp). This is a continuous width constraint, not an implemented phone/tablet breakpoint system. No rail, bottom tabs, multi-column grid, or tablet-specific composition is present.

The top row has a minimum height (64dp), wraps when needed, and separates wordmark/back and settings with a gap (16dp). Content begins after a margin (24dp), with the same gap between primary blocks. Sections and grouped children use the smaller group rhythm. The footer is separated by a hairline, top margin (32dp), and top inset (20dp); it follows content rather than being pinned over it.

`Screen` and the failure screen explicitly set their layout root to LTR. Individual top rows, route rows, journey rows, and diagnostic switch rows choose row/row-reverse from the selected language. `Body` sets text direction and alignment independently. This documents the parent's root-direction fix; do not reintroduce a global reversal that double-mirrors these children.

Normal actions have a minimum height (52dp), route links (56dp), compact links (48dp), and back controls (48dp high, 64dp wide). Diagnostic switch bounds are at least (48dp × 48dp). Journey badges are noninteractive; their smaller size is not an action target. Android's minimum touch-target guidance is (48dp × 48dp); actual hit regions and large-text usability remain unverified.

The failure screen reuses the centered width and page inset, centers content vertically inside a scrollable region, and spaces title, explanation, and retry action consistently. Scroll configuration in the shared screen retains taps with the keyboard open and dismisses the keyboard on drag; full IME/inset behavior requires native testing.

## Elevation & Depth

Depth is tonal and flat: white canvas, quiet surface, then forest-tinted emphasis. The inspected components declare no custom shadow or Android elevation values. Hairline row/footer dividers provide structure without boxing every item. `raised` is a palette role, not a shadow token.

**The Tonal Depth Rule.** Use surface tone and whitespace for grouping; do not infer a drop shadow from the word raised.

The stack explicitly disables route animation (`animation: 'none'`). Buttons use Android ripple plus pressed opacity (0.76); disabled actions use opacity (0.45). No authored duration, easing, spring, hover animation, or reduced-motion choreography exists to extract.

## Shapes

Panels use the panel radius; actions and primary route links use the larger action radius for pill-like controls. Diagnostic fields use the smaller field radius, a stroke (1dp), and a minimum height (56dp). The journey number badge uses the step radius, width (36dp), and minimum height (36dp); it can grow vertically rather than clip enlarged numerals.

Ordinary route links and detail rows are unboxed. Detail and trace separators use `StyleSheet.hairlineWidth`, a device-dependent native value rather than an invented fixed pixel token. The small route chevron is built from two borders (2dp) on an (8dp × 8dp) shape and reverses rotation with language; it is decorative and hidden from accessibility. This is not the final brand icon.

## Components

### Actions

Quiet, confident tonal controls. `Action` exposes filled, tonal (default), and text variants. Selected language options resolve to filled regardless of the default variant. All share label typography, centered localized text, action radius, and native ripple. Pressed and disabled opacity are applied after the background assignment; disabled actions do not invoke their handler. The source exposes button role and disabled/selected accessibility state. It does not define browser hover or custom keyboard-focus styling.

### Panels and notices

Panels use an inset (24dp) and child gap (16dp), with surface, raised, warning-surface, or error-surface tones. The home status area uses raised tone and contains a status heading, explanation, and filled route action. Notices pair semantic caption text with the matching semantic panel; their wrapper is a polite live region. There is no dismiss affordance or toast behavior in `Notice`.

### Navigation and detail rows

`RouteLink` is a real Expo Router link rendered through a pressable. Standard links combine primary label, optional muted caption, and a direction-aware chevron; primary links center on-primary labels on a filled surface and omit the chevron. Compact settings links use the smaller target treatment. Back calls router back when possible, otherwise replaces with home. Predictive Back and system-gesture behavior are not verified by reading this handler.

`DetailRow` groups label, muted value, optional explanation/action, and a bottom hairline. Permissions use these clean divided rows rather than turning every check into a card.

### Journey

An unboxed localized three-step list, reused in home and onboarding. Each row pairs a tonal numbered badge with label/caption text, with localized numerals and mirrored row order. It explains intended call → shortcut → WhatsApp behavior; it is not a screenshot or evidence of functioning automation.

### Diagnostic field and switch

These controls belong to diagnostics, not an approved manual-only home experience. The native `TextInput` is phone-pad, secure-entry, non-autofill, LTR, and left-aligned, with muted placeholder and primary selection color. It has no extracted custom focus/error stroke state. Entered numbers are cleared on route blur, app backgrounding, and test invocation. The native Android `Switch` uses outline/primary tracks and a background-colored thumb; it selects the probe's Business variant, not automatic mode.

### Failure and refresh feedback

The error boundary shows localized headline, supporting explanation, and filled retry action on the same page system. Root failure chooses Arabic from the platform locale; the normal boundary uses the app language. Retry resets the boundary state; it does not prove the underlying fault is repaired.

During checks, stale snapshots are masked in diagnostics and permission labels resolve to unknown; home receives no snapshot while checking. `useDeviceSnapshot` revision guards prevent an older refresh overwriting newer events. Diagnostic actions publish their outcome only if the subsequent refresh succeeds; explicit refresh reports an error on failure. Busy/checking copy and polite live feedback are source-visible controls against false success, not device-tested results.

### Documentation previews

`.impeccable/design.json` contains static HTML/CSS analogues of implemented patterns for documentation only. CSS px values stand in for native logical values at an illustrative 1:1 scale. The browser's system font, focus outline, and active treatment are documentation accommodations; they do not reproduce Android ripple, native shaping, TalkBack, navigation, or native input behavior. Previews have no runtime connection and are not native screenshots. No shipping raster asset is added.

## Do's and Don'ts

### Do:
- **Do** preserve the confirmed pure-white/forest-green direction and paired dark roles.
- **Do** use the shared type hierarchy, Android system font, and localized text direction.
- **Do** keep phone data and trace timestamps LTR inside Arabic screens.
- **Do** use tonal grouping, generous whitespace, and divided permission rows.
- **Do** distinguish checking, unknown, restricted, failed, and genuinely available states.
- **Do** label HTML component analogues as documentation previews and keep device QA BLOCKED until performed.

### Don't:
- **Don't** revive the rejected petrol panel or invent a final logo or icon.
- **Don't** present green surfaces, granted access, or refresh completion as proof of automatic readiness.
- **Don't** reintroduce root RTL reversal on top of individually mirrored rows.
- **Don't** add decorative shadows, invented tonal ramps, motion tokens, or font assets to this extracted system.
- **Don't** promote diagnostic input, Business probes, or switch controls into approved everyday automation.
- **Don't** claim rendered verification, native screenshot evidence, hardware acceptance, or release readiness from source review.
