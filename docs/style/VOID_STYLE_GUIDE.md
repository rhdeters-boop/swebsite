# Void of Desire UI Style Guide

Purpose
- Keep styling consistent across the entire webapp.
- Define shared design tokens, component recipes, patterns, and accessibility rules.
- Serve as the single source of truth for future UI work. Update this guide as we evolve.

How to use and update
- Treat this document as living. When you introduce new UI patterns/components/utilities:
  1) Add/update the relevant section here.
  2) Reference associated Tailwind utilities or component classes (preferably defined in tailwind.config.js).
  3) Add a short rationale and example.
- Keep changes incremental and scoped. Open a PR labeled "Style Guide: Update" with a brief summary and before/after screenshots.

References
- tailwind.config.js: holds semantic tokens and component classes.
- .kilocode/rules/ui_rules.md: operational rules and conventions.
- This style guide ties both together for practical usage in the app.


==================================================
1) Design Tokens (Tailwind theme.extend)
==================================================

1.1 Color Tokens
- Semantic Text
  - text.primary: #ffffff (main on dark)
  - text.secondary: #e5e7eb
  - text.tertiary: #9ca3af
  - text.muted: #6b7280
  - text.disabled: #4b5563
  - text.accent: #ec4899
  - text.on-dark: #ffffff
  - text.on-light: #1f2937

- Semantic Background
  - background.primary: #000000
  - background.secondary: #1a1a2e
  - background.tertiary: #16213e
  - background.card: #2a1a3e
  - background.overlay: rgba(0,0,0,.8)
  - background.glass: rgba(26,26,46,.8)

- Semantic Border
  - border.primary: rgba(168, 85, 247, 0.3)
  - border.secondary: rgba(192, 132, 252, 0.2)
  - border.muted: rgba(107, 114, 128, 0.2)
  - border.error: rgba(239, 68, 68, 0.5)
  - border.success: rgba(34, 197, 94, 0.5)
  - border.warning: rgba(245, 158, 11, 0.5)

- Brand/Accents
  - void: 50…950 — purple brand scale
  - void-dark: 50…950 — dark backgrounds map
  - void-accent: { light, DEFAULT }
  - seductive: { light, DEFAULT, dark }
  - info/warning/error/success: full scales

Usage Rules
- Prefer semantic tokens (text.*, background.*, border.*) over raw hex codes.
- For accenting, prefer void-accent and seductive. Use “seductive” for CTAs; use “void-accent” for focus/brand emphasis.

1.2 Typography
- fontFamily
  - sans: Lato
  - serif: Cormorant Garamond
- fontSize scale (xs…9xl) — use responsive sizes when appropriate.

Usage Rules
- Page headers: font-serif, bold, 2xl–4xl based on layout.
- Section titles: font-sans, semibold, lg–xl.
- Body: font-sans, base or sm for secondary text.

1.3 Spacing, Layout, Effects
- Containers:
  - container-app: page max-w-7xl
  - container-content: max-w-4xl
  - container-narrow: max-w-2xl
  - container-wide: max-w-9xl
- Shadows:
  - shadow-card, shadow-card-hover, shadow-modal, glow-* for branded glow.
- Gradients:
  - backgroundImage: gradient-primary/secondary/accent, void-gradient/void-subtle.
- Animations:
  - fade-in, slide-up/down, scale-in, glow, float, shimmer (utility .loading-shimmer).
- Breakpoint:
  - Custom ‘nav’ at 850px for navbar layout switch.


==================================================
2) Component Classes (Tailwind plugin addComponents)
==================================================

2.1 Buttons
- Primary: .btn-primary / .btn-primary-sm
  - Use for main CTAs. Gradient primary background. Includes .focus-ring and subtle transform hover.
- Secondary: .btn-secondary / .btn-secondary-sm
  - Use for secondary CTAs. Subdued card background with border.
- Outline: .btn-outline / .btn-outline-sm
  - Transparent background, accent border; use for alternative actions.
- Ghost: .btn-ghost / .btn-ghost-sm
  - Minimal emphasis, for inline actions and quiet links.
- Danger/Success: .btn-danger / .btn-success
  - Status-colored actions (destructive or confirmational).
- Edit: .btn-edit
  - Ghost-outline pill used frequently near profile/actions.

Rules
- One primary button per context area.
- Keep label lengths short. Prefer verbs: “Save”, “Add”, “Delete”.
- Use aria-disabled and disabled states; .focus-ring.

2.2 Cards
- .card (default), .card-hover, .card-glass, .card-elevated
- Use .card for most panels; .card-hover for interactive panels; .card-glass for overlays; .card-elevated for hero sections.

2.3 Forms
- Inputs: .form-input, .form-input-error, .form-input-success
- Labels: .form-label, .form-label-required
- Textarea: .form-textarea
- Select: .form-select
- Help/Error: .form-help, .form-error, .form-success

Rules
- Each input must have a <label> with .form-label.
- Include helper/error text for validation.
- Use aria-invalid, aria-describedby appropriately.

2.4 Navigation
- .nav-link, .nav-link-active, .nav-mobile-link, .nav-link-underline

2.5 Alerts and Badges
- Alerts: .alert + .alert-{success|warning|error|info}
- Badges: .badge + .badge-{primary|secondary|success|warning|error|trending}

2.6 Tags
- .category-tag, .category-tag-selected, .category-tag-sm

2.7 Status
- .status-online/offline/away/busy

2.8 Utilities: see tailwind.config.js addUtilities
- .line-clamp-{1|2|3}, .glass, .glass-strong, .scrollbar-thin, .focus-ring, .focus-ring-inset, .loading-shimmer, .loading-pulse


==================================================
3) Motion, Interactions, and Accessibility
==================================================

3.1 Motion
- Durations: 150–300ms for UI transitions. Spruce to 500ms for fade-in on page-level surfaces.
- Easing: theme('transitionTimingFunction.bounce-subtle') for playful emphasis; otherwise ease-out/in-out.
- prefers-reduced-motion:
  - Respect where possible via CSS/conditional animations. Avoid essential content being hidden behind animations.

3.2 Focus and Keyboard
- All interactive elements must:
  - Be reachable via keyboard (tab index default).
  - Visible focus state via .focus-ring or .focus-ring-inset.
  - Have accessible names (aria-label/aria-labelledby) where text is not self-describing.

3.3 Semantics and ARIA
- Use role semantics: role="status" for async states, aria-live="polite" for content updates (e.g., notification counts).
- Avoid div soup; use native elements (button, input) where possible.
- Links vs buttons: navigation → <a/Link>; actions → <button>.

3.4 Contrast
- Maintain sufficient contrast especially for muted text on dark backgrounds.
- Avoid text on saturated gradients; add subtle shadows or overlays if needed (.text-shadow utilities exist).

3.5 Error Handling
- Use .alert-error or inline .form-error near the control.
- Keep messages concise and instructive. Provide next-step guidance when possible.

3.6 Empty States
- Pattern:
  - Icon (lucide) with text-muted color.
  - Title (short), supporting text (one sentence).
  - Primary CTA (if applicable), secondary CTA optional.
  - Container: .card with centered content; include subtle animation (.fade-in).
- Add clear affordance to resolve emptiness (e.g., "Add Payment Method").


==================================================
4) Page Templates and Patterns
==================================================

4.1 Page Header
- Container: .container-app
- Title: text-heading (font-serif, bold), typically 2xl–3xl
- Subtitle: text-subheading with text-secondary
- Optional: breadcrumb/status badges on right

4.2 Tabs
- Use semantic buttons/links with aria-controls/aria-selected for a11y.
- Active tab: accent text and underline/border highlight.
- Provide .focus-ring on keyboard focus.

4.3 Modals/Overlays
- Use .glass or .glass-strong for background overlays.
- Use .card-elevated or .card-glass for modal content.
- Ensure Escape to close and outside click when appropriate.
- Manage focus: trap focus inside modal; return focus on close.

4.4 Lists and Items
- Each item: .card or list-row with hover states.
- Use icons for quick recognition, especially in Notifications.
- Provide skeletons (.loading-shimmer) during data fetch.


==================================================
5) Notifications Pattern
==================================================

5.1 Item Structure
- Container: .card with compact padding (py-3 px-4 on small items).
- Icon by type:
  - new_post: FilePlus or Megaphone
  - new_comment: MessageSquare
  - new_follower: UserPlus
  - suggestion_creator: Sparkles (or Users)
  - suggestion_content: Lightbulb
  - message: Mail or MessageCircle
  - billing_success: CheckCircle
  - billing_failure: XCircle
  - billing_expiring: AlertTriangle or Clock
- Read state:
  - Unread: stronger text (text.primary), subtle accent border-left (border-void-accent).
  - Read: text.secondary, standard border.
- Actions:
  - Mark as read: .btn-ghost-sm with icon.
  - “Mark all as read” at the list header: .btn-secondary-sm

5.2 Accessibility
- Announce new notifications with aria-live="polite" or role="status" in the list container.
- Buttons labeled with descriptive aria-label including the notification content/summary.

5.3 Empty State
- Card with icon (Bell), title “You’re all caught up!”, and optional CTA to visit Explore.

5.4 Filters
- Chips or select element; ensure keyboard navigable and labeled (aria-label="Filter notifications").

5.5 Settings
- Toggles grouped by category with .form-label and help text.
- Provide Save/Update button; reflect saved state with .alert-success.


==================================================
6) Billing Pattern
==================================================

6.1 Tabs
- Subscriptions, History, Payment Methods
- Use .nav-link styles or a custom tab row with accent border under active tab.

6.2 Subscriptions
- Current subscription card:
  - Title, tier, renewal/cancel status, next billing date.
  - Cancel button: .btn-danger; confirm dialog/modal required.
- History:
  - List of previous subscriptions with status badges.

6.3 Billing History
- List each payment in a .card row with:
  - Amount (emphasized), type badge (tip/subscription), status icon.
  - Date, description.
  - Refund button where eligible: .btn-outline-sm → opens a confirm modal or inline prompt.
- Empty state: icon + CTA to Explore or Subscribe.

6.4 Payment Methods
- Add method flow:
  - “Add payment method” → Elements(PaymentElement) in a .card.
  - Save/Cancel buttons; loading state uses Loader2.
- List items:
  - Card brand + last4, expiry, default badge.
  - Remove button in danger color with tooltip/title for a11y.

6.5 Accessibility
- Informative aria-live for changes (adding/removing methods).
- Proper labeling of inputs and buttons (e.g., “Remove card ending in 4242”).

6.6 Errors/Success
- Use .alert components at top of sections for cross-cutting messages.
- Keep inline error messages close to control for Stripe inputs when available.


==================================================
7) Example Recipes
==================================================

7.1 Empty State (generic)
- Container: <div className="card text-center py-10 animate-fade-in">
  - Icon (className="h-10 w-10 text-text-muted mx-auto mb-3")
  - Title (text-text-secondary)
  - CTA button with icon .btn-primary-sm

7.2 Section Header with Actions
- <div className="flex items-center justify-between mb-4">
  - <h3 className="text-lg font-semibold text-text-primary">Title</h3>
  - Action: <button className="btn-secondary-sm">Action</button>

7.3 Inline Form Controls
- <label className="form-label">Label</label>
- <input className="form-input" aria-describedby="helper-1" />
- <p id="helper-1" className="form-help">Describe expected format.</p>

7.4 Mark as Read Button (Notification)
- <button aria-label="Mark notification as read" className="btn-ghost-sm">
  [icon] Mark Read
  </button>


==================================================
8) Localization and Internationalization (Future)
==================================================
- Keep labels concise and externalizable.
- Avoid composing strings by concatenation; use template slots where possible.
- Numeric/Date formatting: use locale-aware formatting utilities.


==================================================
9) Performance and Quality
==================================================
- Avoid layout shift: reserve space for images/media or use skeleton loaders.
- Limit heavy shadows and transitions on long lists; prefer lightweight effects when many items render.
- Use React keys consistently; prefer stable identifiers.
- Ensure icons use currentColor for theme compatibility.


==================================================
10) Notifications & Billing Implementation Notes
==================================================

10.1 Notifications Page
- Ensure list container has role="list" and items role="listitem".
- Add aria-live="polite" for “mark all” and new items where appropriate.
- Use .loading-shimmer on initial fetch; .fade-in when items render.

10.2 Billing Page
- Use tabs with aria-controls/aria-selected.
- Payment methods: after successful add/delete, announce via role="status" region: “Payment method added/removed”.
- Refund request: use a modal with Escape and overlay click to close; confirm button .btn-primary-sm; cancel .btn-ghost-sm.


==================================================
11) Contributing to the Style Guide
==================================================
- Additions:
  - Add a new section or subsection with clear title.
  - Provide usage rules and at least one code snippet.
  - If new utilities/components are required, add them in tailwind.config.js and document here.
- Changes:
  - Explain why the change improves consistency or accessibility.
  - Include screenshots if visual.
- Keep this document pragmatic and example-driven.

Changelog
- v0.1.0 — Initial version extracted from current Tailwind config and component patterns (Notifications, Billing).