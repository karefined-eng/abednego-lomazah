# Design System: Abednego Lomazah

## 1. Visual Theme & Atmosphere

A polished executive editorial system rooted in warm stone and antique gold. The interface is composed, intentional, and confident with softly asymmetric staging that supports leadership messaging without feeling generic.

- Density: Daily App Balanced.
- Variance: Offset Asymmetric.
- Motion: Fluid CSS with spring-based cadence.
- Tone: Warm, deliberate, premium.

## 2. Color Palette & Roles

- **Canvas Limestone** (#F5F0E8) — Primary page background and broad canvas.
- **Pure Surface** (#FFFFFF) — Elevated cards, panels, and form surfaces.
- **Charcoal Ink** (#1A0A00) — Primary text, strong labels, and high-contrast content.
- **Muted Bronze** (#5C2E10) — Secondary text, supportive structural accents, and section anchors.
- **Whisper Border** (rgba(237, 230, 214, 0.55)) — Dividers, input outlines, and low-contrast separators.
- **Antique Gold** (#C8870A) — Single accent for CTAs, focus states, active interaction markers, and subtle highlights.

## 3. Typography Rules

- **Display:** Geist — Track-tight, controlled headline scale. Use weight and color to create hierarchy rather than oversized type.
- **Body:** Geist — Relaxed leading, `line-height: 1.65`, `max-width: 65ch` for long-form readability.
- **Mono:** Geist Mono — For numeric text, metadata, and any high-density system-style labels.
- **Banned:** Inter, generic serif fonts, and pure black. Serif fonts are banned in core navigation and dashboard-like content.

## 4. Component Stylings

- **Buttons:** Primary button fill is Antique Gold with Charcoal Ink text. Secondary button uses a warm cream outline and ghost style. Active state is tactile with `transform: translateY(-1px)` and subtle depth.
- **Cards:** Use elevation only where hierarchy demands it. Card surfaces are Pure Surface with `2.5rem` rounding and softly warmed shadows. In dense content, replace cards with border-top dividers or thoughtful negative space.
- **Inputs:** Label above the input, helper text optional, error text below. Border uses Whisper Border; focus ring uses Antique Gold. No floating labels.
- **Loaders:** Skeleton frames sized to matched content blocks with warm shimmer. No circular spinner animations.
- **Empty States:** Composed with an editorial tone and a clear next-step prompt, not generic “No data” copy.
- **Error States:** Inline error text below controls, with a calm accent border on invalid fields.

## 5. Layout Principles

- Grid-first layout architecture. Use CSS Grid for structural content, not flexbox math or `calc()` percent hacks.
- Contain the page in `max-width: 1400px` with centered margins.
- Use `min-height: 100dvh` for full-height sections; avoid `h-screen`.
- Hero sections are split-screen or left-aligned with asymmetric whitespace. Centered hero layouts are banned at higher variance.
- No overlapping elements. Each visual block occupies its own spatial zone.
- No three equal horizontal cards. Prefer asymmetric feature rows, zig-zag grids, or controlled horizontal scroll.

## 6. Motion & Interaction

- Spring physics default: `stiffness: 100`, `damping: 20`.
- Animate only `transform` and `opacity`; never `top`, `left`, `width`, or `height`.
- Use subtle perpetual micro-interactions: hover soft pulse, highlight shimmer, and gentle float.
- Reveal lists with staggered cascade delays rather than instant mount.

## 7. Responsive Rules

- Collapse multi-column layouts to single column below `768px` without exception.
- Prevent horizontal overflow on mobile.
- Scale headlines with `clamp()`; body text minimum `1rem` / `14px`.
- Touch targets must be at least `44px` in both width and height.
- Inline headline imagery stacks below the text on mobile and never overlaps type.
- Desktop navigation collapses cleanly into a mobile menu with visible toggle state.
- Section gaps reduce proportionally on smaller screens while preserving breathing room.

## 8. Anti-Patterns (Banned)

- No emojis anywhere.
- No `Inter` font.
- No pure black (`#000000`). Use warm charcoal or off-black.
- No neon, outer glow shadows, or purple/blue neon styling.
- No oversaturated accents.
- No excessive gradient text on large headers.
- No custom mouse cursors.
- No overlapping elements or absolute-position stacking.
- No generic three-column equal card grids.
- No generic placeholder names like “John Doe”, “Acme”, or “Nexus”.
- No fake round numbers or invented metrics.
- No fabricated system metric sections such as “SYSTEM PERFORMANCE METRICS” or “KEY STATISTICS”.
- No `LABEL // YEAR` typography.
- No AI copywriting clichés such as “Elevate”, “Seamless”, “Unleash”, or “Next-Gen”.
- No filler text like “Scroll to explore”, “Swipe down”, or bouncing chevrons.
- No broken image links.
- No centered hero when variance exceeds 4.

## 9. System Tokens

- **Primary Brand:** #3D1F0D
- **Accent:** #C8870A
- **Surface:** #FFFFFF
- **Background:** #F5F0E8
- **Text:** #1A0A00
- **Secondary Text:** #5C2E10
- **Border:** rgba(237, 230, 214, 0.55)

## Implementation Notes

- Use `Geist` for brand typography and `Geist Mono` for numeric or system text.
- Keep hero CTAs to one primary action and avoid a secondary “Learn more” link.
- Use real photographic assets under `assets/` instead of placeholder imagery.
- Keep every section intentional and specific; avoid generic editorial copy.
