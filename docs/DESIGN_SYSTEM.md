## 2. DESIGN IDEA
1960s pop art / comic print used as a disciplined web style. A saturated sun-yellow canvas, near-black ink, signal red, process blue, white panels and a warm newsprint band. Everything is drawn with 3px ink outlines and HARD zero-blur offset shadows (6px 6px 0). Never use soft shadows, blur, smooth gradients, or any purple. Ben-day halftone dot fields (CSS radial-gradient dots) texture the hero, strips, mock mastheads and CTA band like real print screens. Type: Archivo Black for display (poster-grade, no novelty comic fonts) and Inter for UI and body. Comic motifs are structural, not stickers: numbered panel corner chips, a rotated SVG starburst badge, speech-bubble testimonials with real tails, a red marker underline in a headline. Keep whitespace generous and copy short so the page reads loud but never cluttered.

Hard rules for the whole app:
- Every card, chip, button and input has a 3px solid ink border (small chips and pills may use 2px).
- Every raised element has a hard offset shadow with zero blur. No box-shadow with blur anywhere. No backdrop-filter. No linear-gradient or smooth radial color fades (radial-gradient is allowed ONLY for halftone dots).
- No purple. No green (green is allowed ONLY for the live server status light in the footer via --light-green). Only the palette in section 4.
- Interactive elements press into their shadow (section 6).
- Dark mode is NOT built (the style uses a fixed palette). Set color-scheme: light.

## 3. FONTS
- Display: "Archivo Black" from Google Fonts. Used for the wordmark, page titles, section titles, big numerals, panel titles, corner chips. Always ALL CAPS, letter-spacing -0.02em, line-height 0.95 to 1.05. Only one weight exists, so never fake bold.
  --font-display: "Archivo Black", Impact, "Arial Black", sans-serif;
- UI and body: "Inter" from Google Fonts, weights 400, 600, 800 only.
  --font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
- No mono font and no novelty comic fonts. For dates and counters use Inter 600 with font-variant-numeric: tabular-nums.
- Add preconnect links and one Google Fonts link (display=swap) in client/index.html.
- Sizes:
  Landing hero H1: clamp(44px, 8vw, 96px).
  App page titles: clamp(32px, 5vw, 56px).
  Section titles: clamp(30px, 5vw, 56px).
  Panel titles: 22px to 26px. Stat numerals: clamp(40px, 6vw, 64px).
  Body: 16px / 1.55, weight 400 (600 for emphasis). Meta text: 14px, weight 600. Tracked-caps labels: 12px, weight 800, letter-spacing .12em, uppercase.
  Hierarchy comes from size and weight, not from color tricks.

## 4. TOKENS (create client/src/styles/tokens.css exactly like this and import it first in main.jsx)

:root {
  --font-display: "Archivo Black", Impact, "Arial Black", sans-serif;
  --font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;

  --yellow: #ffc900;   /* page canvas */
  --ink: #0f0d0a;      /* text, borders, shadows */
  --red: #dc341e;      /* signal red */
  --blue: #1e40c9;     /* process blue */
  --white: #ffffff;    /* panels */
  --paper: #f6f1e6;    /* newsprint band */
  --light-green: #1fb855; /* allowed ONLY for server status light */
  --ink-70: rgba(15, 13, 10, .72);  /* muted text */
  --ink-30: rgba(15, 13, 10, .30);  /* dashed rules */

  --bw: 3px;            /* main border width */
  --bw-thin: 2px;       /* small chips */
  --border: 3px solid var(--ink);
  --border-thin: 2px solid var(--ink);

  --radius-panel: 12px; --radius-bubble: 16px; --radius-input: 8px; --radius-pill: 999px; --radius-square: 0;

  --sh-lg: 6px;  /* panels, big buttons */
  --sh-md: 4px;  /* bubbles, small buttons, toasts */
  --sh-sm: 3px;  /* chips, calendar card */

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px;

  --dot-red: radial-gradient(circle, var(--red) 2px, transparent 2.4px);
  --dot-ink: radial-gradient(circle, var(--ink) 1.5px, transparent 2px);
  --dot-white: radial-gradient(circle, #ffffff 2px, transparent 2.4px);

  --ease: 120ms ease-out;
  color-scheme: light;
}

## 5. GLOBAL CSS (global.css) AND CORE CLASSES
- Reset (box-sizing: border-box, margin 0, img/svg max-width 100%). html { scroll-padding-top: 80px }. body { font-family: var(--font); color: var(--ink); background: var(--yellow); line-height: 1.55; -webkit-font-smoothing: antialiased; overflow-x: hidden }. Headings use var(--font-display), uppercase, weight 400, text-wrap: balance.
- Focus: :focus-visible { outline: 3px solid var(--blue); outline-offset: 3px } (on blue or ink backgrounds use outline-color #ffffff).
- Container: .container { max-width: 1200px; margin-inline: auto; padding-inline: 16px } and from 768px padding-inline 24px. .container-narrow max-width 1080px.
- Halftone utility class .halftone with CSS variables: --dot (the gradient), --size (8px or 16px), --alpha (opacity). Example:
  .halftone { background-image: var(--dot); background-size: var(--size, 16px) var(--size, 16px); opacity: var(--alpha, 1); pointer-events: none; position: absolute }
  Provide a <Halftone color="red|ink|white" size={8|16} alpha={0.4} className style /> component that renders an absolutely positioned div using it.
- PRESS-DOWN pattern (one reusable class .press, used by every button, nav pill, link-card and chip that can be clicked):
  The element sets --sh (its shadow offset, e.g. 6px). Base: box-shadow: var(--sh) var(--sh) 0 var(--ink); transition: transform var(--ease), box-shadow var(--ease).
  @media (hover: hover) { .press:hover:not(:disabled) { transform: translate(2px, 2px); box-shadow: calc(var(--sh) - 2px) calc(var(--sh) - 2px) 0 var(--ink) } }
  .press:active:not(:disabled) { transform: translate(var(--sh), var(--sh)); box-shadow: 0 0 0 var(--ink) }
  Disabled: opacity .5, cursor not-allowed, no press movement.
- BUTTONS (.btn, height 44px, padding 0 20px, font Inter 800, 15px, display inline-flex, align-items center, justify-content center, gap 8px, border var(--border), text-decoration none, cursor pointer):
  .btn-red   (primary CTA): bg var(--red), color #fff, radius 0 (square), --sh 6px.
  .btn-white (secondary): bg #fff, color ink, radius 999px, --sh 6px.
  .btn-ink   (solid): bg ink, color #fff, radius 0 or 999px as noted per use, --sh 4px, shadow color white on the yellow navbar.
  .btn-yellow: bg yellow, color ink, radius 0, --sh 6px (used on blue/ink bands).
  .btn-blue: bg blue, color #fff, radius 0, --sh 4px.
  .btn-danger: bg red, color #fff (only for delete confirmation).
  .btn-ghost: no border, no shadow, bold ink text with a 3px red underline on hover.
  Sizes: .btn-sm (36px) and .btn-lg (52px, hero). Loading: small spinner (ink or white ring, CSS only) and the same width.
- FIELDS (.field): label above in Inter 800, 13px, ink. Input, select and textarea: height 44px (textarea min-height 112px), padding 0 12px (textarea 12px), bg #fff, border var(--border), radius 8px, font Inter 600 16px (16px avoids mobile zoom). Hover: bg var(--paper). Focus: box-shadow 4px 4px 0 var(--blue), outline none (the hard shadow is the focus style, keep the outline 3px blue offset 3px as well for keyboard focus). Error: border-color var(--red), box-shadow 4px 4px 0 var(--red); the message below is INK text (13px, 600) with a small red square alert icon (so contrast stays high); aria-live="polite". Placeholder: ink-70.
- PILLS (.pill, height 24px, padding 0 10px, border var(--border-thin), radius 999px, Inter 800, 12px, uppercase, tracking .06em, inline-flex, gap 6px, optional 8px square dot): variants
  .pill-yellow (bg yellow, ink text), .pill-red (bg red, white text), .pill-blue (bg blue, white text), .pill-ink (bg ink, white text), .pill-white (bg #fff, ink text), .pill-paper-dashed (bg paper, ink text, border-style dashed).
- SKELETON: no gradient shimmer. .skeleton { background: var(--paper); background-image: var(--dot-ink); background-size: 8px 8px; border: var(--border-thin); border-radius: 8px; animation: pulse 1.2s steps(2, end) infinite } with pulse toggling opacity between 1 and .55.
- Utilities: .row, .stack, .spread, .gap-2, .gap-4, .muted (ink-70), .sr-only, .truncate, .clamp-2.
- Reduced motion: @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } } and press movement stays as instant state change.

## 6. SIGNATURE COMPONENTS (exact specs)

### Starburst (components/Starburst.jsx)
Props: text, size, rotate, fill. Renders an SVG with viewBox 0 0 100 100 containing a 16-point star polygon. Generate the points in code: for i from 0 to 31, angle = (i * Math.PI / 16) - Math.PI / 2, radius = i % 2 === 0 ? 48 : 36, point = (50 + r*cos(angle), 50 + r*sin(angle)). SVG polygon: fill var(--red), stroke var(--ink), stroke-width 3, stroke-linejoin round. Wrapper rotated -8deg with a hard drop shadow using filter: drop-shadow(4px 4px 0 var(--ink)) (zero blur is allowed). Centered text in Archivo Black, white, rotated -5deg. Size about 112px on desktop and 64px on mobile (w-16).

### MarkerUnderline (components/MarkerUnderline.jsx)
Wraps a word: a relative inline-block span with an absolutely positioned SVG under the baseline (left 0, bottom -0.08em, width 100%, height 0.28em, z-index -1... put the text above it with position relative z-index 1), preserveAspectRatio="none", viewBox 0 0 100 24, one filled red path:
<path d="M2 12 C 25 3, 55 17, 98 6 L98 17 C 55 24, 25 11, 2 21 Z" fill="var(--red)" />
It must read as one confident marker stroke.

### CornerChip
A rotated chip hanging off the top-left corner of a panel: position absolute, top -18px, left -14px, rotate -6deg, bg red / blue / ink (by prop), white Archivo Black label (01 / 02 / 03 or a short word), border 3px ink, padding 6px 12px, hard shadow 3px.

### Comic panel (.panel)
White bg, border var(--border), radius 12px, box-shadow 6px 6px 0 ink, padding 20px to 28px, position relative. Variants: .panel-paper (bg paper), .panel-yellow, .panel-red (white text), .panel-blue (white text), .panel-ink (white text). Clickable panels also get .press.

### CalendarCard (components/CalendarCard.jsx), used for REVIEW dates
44px x 52px (48px x 56px on the detail page), border 3px ink, radius 8px, bg #fff, overflow hidden, text-center, hard shadow 3px. Top strip: month in uppercase, Inter 800, 9px, tracking .08em, padding 2px 0. Strip color by state: ok = ink strip with white text; soon (due within 14 days) = yellow strip with ink text; overdue = red strip with white text. Bottom: day number in Archivo Black 18px. Props: date, state.

### Avatar (components/Avatar.jsx)
Flat two-tone circle: 32px (24px small), border 3px ink (2px at small), fill is red, blue or ink picked by a hash of the name, white initial in Archivo Black. No gradients.

### SpeechBubble (components/SpeechBubble.jsx)
Relative white card, border 3px ink, radius 16px, hard shadow 4px, padding 24px. REAL triangular tail built from two stacked CSS border-triangles, with a prop tailX ("left" | "center" | "right"):
.bubble::before { content: ""; position: absolute; bottom: -22px; left: var(--tail-x, 30px); border: 14px solid transparent; border-top: 22px solid var(--ink); border-bottom: 0; }
.bubble::after { content: ""; position: absolute; bottom: -17px; left: calc(var(--tail-x, 30px) + 3px); border: 11px solid transparent; border-top: 17px solid #fff; border-bottom: 0; }
The white triangle must break the bubble's bottom border so the ink outline continues down both sides of the tail. Check it visually and adjust numbers if the seam shows. --tail-x: 30px (left), calc(50% - 14px) (center), calc(100% - 58px) (right).

### BrowserMock (components/BrowserMock.jsx)
Card with border 3px ink, radius 12px, hard shadow 6px, overflow hidden, bg #fff. Chrome bar: bg paper, border-bottom 3px ink, padding 10px 14px, three 12px circles (red fill, yellow fill, white fill, each 2px ink border) and a pill URL field (white, 2px ink border, radius 999px, 13px Inter 600 text). Content slot below.

### Page title band (components/PageHeader.jsx)
Used on every app page: yellow background, a red <Halftone size={16} alpha={0.4}/> in the top-right corner (width 40%, height 100%, rounded bottom-left corner 80px), then a tracked-caps eyebrow in a slightly rotated white chip (border 3px ink, rotate -2deg), the page title (display font), an optional one-line subtitle (Inter 600), and a slot for action buttons on the right (wraps below on mobile).

## 7. SHARED COMPONENTS
All in client/src/components/. Each has its CSS in components.css or a matching file.

- Navbar: sticky top, z-index 50, bg var(--yellow), border-bottom var(--border), height 64px. Left: wordmark "DecisionLog" in Archivo Black (22px, uppercase) with a tiny red 12px starburst at its top-right corner; it links to "/". Center (desktop): four pill links (Home /, Dashboard /dashboard, Decisions /decisions, Tasks /tasks): border 3px ink, radius 999px, height 38px, padding 0 16px, Inter 800 14px, --sh 3px, .press. The ACTIVE route is a solid-ink pill with white text, the others are white pills. Right: a plain bold "New Task" link (ghost) and a solid-ink "New Decision" .btn-ink button (radius 0, white hard shadow 3px so it shows on the yellow bar) linking to /decisions/new. Under 768px: hide the center links and right side; show a hamburger button (lucide Menu, 44px square, 3px ink border, .press) that opens a full-width sheet under the bar: bg yellow, border-bottom 3px ink, stacked large pill links, then "New Decision" (.btn-red) and "New Task" (.btn-white). Close on route change, Esc and outside click. aria-expanded and aria-controls required. First focusable element on the page: a "Skip to content" link (visible on focus: white chip with ink border).
- Footer (newsprint): bg paper, border-top 3px ink, padding 48px 0 24px. Four-column grid (stacks on mobile): column 1 wordmark + two-line tagline ("Keep the why behind every decision. Stop repeating old debates."); columns 2 to 4: tracked-caps titles Product (Dashboard, Decisions, Tasks), Create (New decision, New task), Project (API health /api/health, README). Links: bold ink, hover shows a 3px red underline. Under a 2px ink-30 rule: a muted legal line "© 2026 DecisionLog. Built as a full-stack project."
- StatusBadge: decision status: Accepted = pill-blue, Proposed = pill-yellow, Superseded = pill-white, Deprecated = pill-paper-dashed. Task status: Todo = pill-white, In Progress = pill-yellow, Done = pill-blue. Priority: High = pill-red, Medium = pill-yellow, Low = pill-white. Always text plus a square dot.
- ReviewBadge (input daysUntilReview and status): more than 14 days = pill-white "Review in N days"; 0 to 14 = pill-yellow "Due in N days" ("Due today" at 0); below 0 = pill-red with an alert icon "N days overdue". Superseded and Deprecated show pill-paper-dashed "No review needed".
- FlagPill: pill-red "NEEDS RECONSIDERATION" with a small blinking square dot (CSS animation, off under reduced motion) and a title attribute with flagReason.
- DecisionCard: a clickable .panel with .press (whole card is one link to /decisions/:id; --sh 6px). Horizontal layout: left = CalendarCard; middle = title (Archivo Black 22px, uppercase, 2-line clamp), row of StatusBadge + FlagPill, then "Chosen: <option>" with a lucide Check inside a 20px red square tile (3px... 2px ink border), tags as pill-white chips, "N linked tasks" with a Link icon; right = ReviewBadge and a lucide ArrowRight inside a 36px ink-bordered circle. Under 650px it stacks (CalendarCard + title on top, badges below, ReviewBadge full width).
- StatCard: a clickable panel with .press (links to the filtered list); a CornerChip with the card label code (red for Flagged and Overdue, blue for Accepted, ink for Total, yellow chip with ink text for Proposed); a big number in Archivo Black (clamp 40 to 64px); a tracked-caps label under it.
- OptionsEditor (form): a list of option panels (each with a CornerChip "OPTION 1", name input, description textarea, and two dynamic chip lists "PROS" (blue plus-square icon) and "CONS" (red minus-square icon): add with Enter or the + button, remove with an x on the chip, max 10 each). Buttons: "Add option" (.btn-white, max 10) and "Remove" (.btn-ghost, disabled when only 2 remain). Show errors per field.
- TaskPicker (modal): search input (debounced 300ms), list of tasks (title, status pill, priority pill) as selectable rows with a square checkbox (3px ink border, ink check when selected); already linked tasks are disabled with a "LINKED" pill; footer buttons "Cancel" (.btn-white) and "Link selected" (.btn-red); an inline "Create new task" link opens TaskFormFields in a second modal. Loads GET /api/tasks?search=...&limit=20.
- Modal base (portal): backdrop = ink at 55% opacity with a faint white 16px dot screen (NO blur); panel = .panel with --sh 8px, max-width 480px (TaskPicker 600px), enters with a quick "pop" animation (scale .94 to 1, 140ms). Esc and backdrop click close it; focus trap; focus returns to the opener; role="dialog" aria-modal="true" aria-labelledby.
- ConfirmModal: a title in Archivo Black, a message, Cancel (.btn-white) and Confirm (.btn-danger). For deletes the title is a short shout like "DELETE THIS DECISION?".
- Toasts (ToastProvider + useToast() with success, error, info): white pill-shaped panel (radius 999px, border 3px, hard shadow 4px), left 28px square icon tile (blue for success, red for error, yellow for info, ink icon or white icon as needed), bold message. 4s auto-dismiss, pause on hover, aria-live="polite". Top-right on desktop, bottom-center on mobile.
- Switch (role="switch", aria-checked): 56px x 32px track with 3px ink border, radius 999px; thumb 20px ink circle. Off = white track; on = blue track with white thumb (red track when used for Needs Reconsideration).
- Pagination: Prev and Next as .btn-white .btn-sm, page numbers as 40px squares with 3px ink border; the current page is solid ink with white text; ellipsis between; "Showing X-Y of Z" in Inter 600 beside it. Buttons use .press.
- EmptyState: a 96px circle filled with a red 8px halftone and a 3px ink border, with an ink lucide icon on a white 48px circle in the middle; Archivo Black title; one short sentence; a .btn-red CTA.
- ErrorMessage: .panel-white with a 6px red left stripe, an alert icon in a red square tile, the message, and a "Retry" .btn-ink.
- Skeleton lists and cards use .skeleton (never a gradient shimmer).