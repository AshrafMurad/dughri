# 05 — UI/UX and Localization Guidelines

> **Document ID:** UX-05 · **Status:** Planned UX contract; final visual identity OPEN  
> **Last reviewed:** 2026-10-17 · **Design target:** Simple, trustworthy, bilingual Android utility  
> **References:** [Requirements](02-REQUIREMENTS.md), [Business rules](06-BUSINESS-RULES.md)

## 1. Experience principles

- **Utility over dashboard:** one clear action/condition per screen. Do not design a SaaS dashboard, social feed, or redundant navigation.
- **Low interruption:** floating action is temporary, small, movable only if verified practical, and easy to dismiss.
- **Honest capability status:** do not say “running” unless the native layer confirms the necessary APIs/permissions and actual capability; unsupported is a valid state.
- **Privacy-first display:** avoid exposing the number on a locked device or in visible system notifications by default.
- **Accessible, bilingual, and RTL-correct** from day one.
- **Native expectations:** Android back behavior, system permission screens, large touch targets, no aggressive modal loops.

## 2. Information architecture

Use the smallest workable navigation stack:

```text
First launch → Welcome/Onboarding → Permission & capability setup → Home
                                                     ↘ Unsupported/Help
Home → Settings → Language / Privacy & feature controls
Home → Help / Troubleshooting (simple informational section, not necessarily route)
```

Do not add authentication, onboarding questionnaires, tabs, payments, call-history feeds, or analytics charts.

## 3. Screen contracts

### S-01 — Welcome/onboarding (first use)

**Purpose:** explain in one glance what the app does and does not do.

**Required content:** app name placeholder; illustrative 3-step sequence (“Finish a call → Tap floating WhatsApp shortcut → Start a chat without saving”); note that functionality depends on Android support/permission; primary **Continue** action; secondary **Not now**. Display permission purposes before system prompts, not all prompts at launch without explanation. Never imply the app automatically messages people.

**States:** fresh, user skipped, returning after partially completed setup.

### S-02 — Permissions / capability setup

Show distinct checks (not a single generic “all permissions” status):

1. **Call detection** — state from native layer and required permission/role.
2. **Phone number access** — *verified*, *restricted*, or *unsupported*; avoid a misleading grant button if ungrantable.
3. **Display over other apps** — explanatory text + **Open Android settings**; recheck on resume.
4. **Device support** — supported/limited/unsupported with helpful explanation.

Each row has: icon, localized title, one-sentence explanation, truthful status, one useful action if available. The final action is **Enable automatic shortcut** only when capability permits it; otherwise **View limitations** / **Try approved manual mode** (manual mode P1, not guaranteed).

### S-03 — Home (main)

Top: short title + current feature status (`Off`, `Ready`, `Needs permission`, `Unsupported`, or `Checking`). Center: simple illustration of call → shortcut → WhatsApp (not a fabricated screenshot). Main control: explicit on/off switch. Beneath: one-line explanation of what will happen after an eligible call and link to **Permissions/diagnostics**. Bottom: **Settings** and non-intrusive privacy note (“No messages are sent automatically”).

Never render a green “Active” badge when actual background operation is not validated. On unsupported devices replace switch with explanation and safe option, not a fake enable button.

### S-04 — Settings

Minimum: enabled status/shortcut control, language selector (**System / English / العربية**), permission management link, Privacy & About, technical limitations. Avoid unnecessary settings. P1 region chooser/manual mode/WhatsApp Business only if approved.

### S-05 — Floating action

The floating UI is **native Android**, not a modal from Expo UI. Behavior and appearance subject to Phase-0 viability.

- Small compact action with recognizable chat icon, localized compact text where space allows, optional **masked** number only if explicitly useful and safe.
- Primary action: **Open WhatsApp**. Secondary: **Dismiss** (`×`) with accessible description.
- Must remain below critical system UI and avoid obstructing call controls, accessibility focus, keyboard, or other sensitive UI.
- May show **only after** an eligible completed call; must disappear after dismissal/expiration, when a new call starts, on disable/permission revocation, and while locked.
- Do **not** imitate an Android system permission prompt or an official WhatsApp window.
- Do not assume an overlay can be above every app or lock screen.

### S-06 — Limited / unsupported state

One clear statement of missing capability and a truthful next step, e.g., “This phone does not allow the app to access the last caller's number automatically.” No repeated grant prompts, no advice to root/disable security. If fallback not approved, offer informational explanation only.

## 4. UI state vocabulary

| UI state | Meaning | Primary action |
|---|---|---|
| `checking` | Actual native checks in progress | None; prevent duplicate taps |
| `off` | User disabled feature | Enable |
| `needs-permission` | Grantable required access not granted | Open correct system permission action |
| `restricted` | OS/installer role blocks capability | Explain limitation |
| `unsupported` | Device/OS feature not safely available | Explain limitation |
| `ready` | Native layer verifies eligible runtime capabilities | Disable or manage |
| `error` | Unexpected recoverable failure | Retry/check permissions |

**Never map `unknown` to `ready`.** App copy must distinguish “Permission granted” from “Automatic behavior verified.”

## 5. Bilingual UX

- Locales: **English (`en`)** and **Arabic (`ar`)**. Default to system language if supported; otherwise English.
- Use modular localization files: `locales/en/common.json`, `onboarding.json`, `permissions.json`, `home.json`, `settings.json`, `errors.json` and identical Arabic counterparts.
- Every key must exist in both languages. Use typed translation keys where possible; CI should fail for missing keys.
- For Arabic, set layout RTL in relevant React Native UI and handle reinitialization/restart only when required by framework. **Do not reverse phone digits, international prefixes, URLs, or code.** Render mixed-direction phone data in an LTR text container with explicit bidi handling.
- Use consistent nouns: “phone call” means ordinary cellular call; “WhatsApp chat” means opening a conversation, not sending a message.
- Respect system font sizes and accessibility settings; no truncation of critical permission descriptions.

### Sample string keys (translation baseline)

| Key | English | Arabic |
|---|---|---|
| `home.title` | After-call WhatsApp | واتساب بعد المكالمة |
| `home.enabled` | Automatic shortcut enabled | الاختصار التلقائي مفعّل |
| `home.disabled` | Automatic shortcut off | الاختصار التلقائي متوقف |
| `home.unsupported` | Automatic access isn't supported on this device | الوصول التلقائي غير مدعوم على هذا الجهاز |
| `permissions.overlay` | Display over other apps | الظهور فوق التطبيقات الأخرى |
| `permissions.numberRestricted` | Phone number access is restricted | الوصول إلى رقم الهاتف مقيّد |
| `shortcut.open` | Open WhatsApp | فتح واتساب |
| `shortcut.dismiss` | Dismiss | إغلاق |
| `privacy.noAutoMessage` | Messages are never sent automatically | لا يتم إرسال الرسائل تلقائيًا |

Copy in this table is provisional; final translation review should ensure natural Arabic and reliable screen-reader pronunciation.

## 6. Visual design direction (not yet a locked brand)

- System-inspired, clean Android utility; modest visual density and clear hierarchy.
- Neutral background surfaces with **one restrained identity accent**; ensure contrast in light/dark modes if implemented.
- Avoid glassmorphism, excessive gradients, neon, illustrations of message contents, animations that cover the screen.
- Iconography should be consistent (Lucide or equivalent for React UI), but WhatsApp trademark/logo usage must follow branding rules. A generic “chat” icon is acceptable until final assets are approved.
- Touch targets should be comfortable (approximately 48dp) and overlay should never block accessibility or telephony actions.
- Typography: modern sans-serif with Arabic glyph support. Choose fonts after validating file size, rendering, and Android font fallback. No arbitrary paid-font dependency.

## 7. Interaction details

- Disable: remove current overlay immediately and stop new triggers; do not show a “saved” screen.
- Return from settings permission screen: check the actual permission (not assume success).
- Permission denial: remain usable and show concise, non-judgmental rationale; do not nag repeatedly.
- External WhatsApp handoff: user tapped; no loading spinner that claims a message was delivered.
- Floating shortcut must never be full screen or use a fake WhatsApp mini-chat.
- Error messages name the failing capability, not “something went wrong” alone.

## 8. Accessibility and test checklist

- Native overlay actions have labels for TalkBack and touch-target sizing.
- Keyboard/focus remains logical and no overlay traps navigation.
- In Arabic, back navigation, margins, and icon directions are appropriate, while phone numbers remain LTR.
- Large text, display zoom, and contrast mode remain usable.
- No sensitive number shown on lock screen.
- Screen previews/mocks with fake data are explicitly labeled **prototype** until matched to real capability.

## 9. Design approval boundary

The complete visual brand (name, logo, colors, typography, app icon), exact bubble duration, screen mockups, and P1 manual/Business screens are **OPEN**. Agents may use a coherent neutral theme to implement screens but must not represent those creative choices as approved product decisions. Product-owner sign-off is required before release assets are finalized.
