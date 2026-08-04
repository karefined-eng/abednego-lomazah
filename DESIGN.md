# Design System: Abednego Lomazah

## 1. Visual Theme & Atmosphere

A polished executive editorial system rooted in warm stone and antique gold. The interface feels composed and authoritative with a softly asymmetrical structure — a leadership platform that is grounded, intentional, and decidedly premium.

- Density: Daily App Balanced.
- Variance: Offset Asymmetric.
- Motion: Fluid CSS with spring-based cadence.
- Tone: Warm, deliberate, confident.

## 2. Color Palette & Roles

- **Canvas Limestone** (#F5F0E8) — Primary page background and broad surface.
- **Pure Surface** (#FFFFFF) — Elevated cards, panels, and form containers.
- **Charcoal Ink** (#1A0A00) — Primary text, strong labels, and high-contrast content.
- **Muted Bronze** (#5C2E10) — Secondary text, section support, muted structural accents.
- **Whisper Border** (rgba(237, 230, 214, 0.55)) — Dividers, input borders, subtle separations.
- **Antique Gold** (#C8870A) — Single accent for CTAs, focus states, active markers, and interactive highlights.

## 3. Typography Rules

- **Display:** Geist — Track-tight, controlled headline scale. Use weight and color to establish hierarchy instead of oversize type.
- **Body:** Geist — Relaxed leading, `line-height: 1.65`, `max-width: 65ch` for long-form readability.
- **Mono:** Geist Mono — For numeric calls, metadata, and any high-density system text.
- **Banned:** Inter, generic serif fonts, pure black. Serif fonts are banned in dashboard-like interfaces and core navigation.

## 4. Component Stylings

- **Buttons:** Primary buttons are Antique Gold with deep charcoal text. Secondary actions use a clean ghost or outline style with warm cream boundaries. Active state is tactile with `transform: translateY(-1px)` and subtle depth. No neon glows.
- **Cards:** Use only when elevation adds hierarchy. Surface is Pure Surface with `2.5rem` rounded corners and a soft warm shadow. For denser sections, replace repetitive cards with border-top dividers or asymmetric spacing.
- **Inputs:** Label above field, helper text optional beneath, error text below input. Field border is Whisper Border with Antique Gold focus rings. No floating labels.
- **Loaders:** Skeleton screens sized to content frames, using warm gradient shimmer. No circular spinners.
- **Empty States:** Composed with contextual illustration or symbolic tone, plus a clear next-step prompt.
- **Error States:** Inline text below controls, accent border on invalid fields, and a calm supporting explanation.

## 5. Layout Principles

- Grid-first responsive architecture. Prefer CSS Grid over flexbox math and avoid `calc()` hacks.
- Contain page width to `max-width: 1400px` with centered horizontal margins.
- Full-height sections use `min-height: 100dvh`; do not use `h-screen`.
- Hero sections should be split-screen or left-aligned with asymmetric whitespace. Centered hero layouts are banned at higher variance.
- No overlapping elements. Every visual block occupies its own clear spatial zone.
- No generic three equal cards horizontally. Use asymmetric feature rows, zig-zag grids, or horizontal scroll.

## 6. Motion & Interaction

- Default spring physics: `stiffness: 100`, `damping: 20`.
- Animate only `transform` and `opacity`; not `top`, `left`, `width`, or `height`.
- Add subtle perpetual micro-interactions: soft pulse on active buttons, slow shimmer on highlight bars, and gentle float on hero assets.
- Reveal content with staggered cascade delays rather than instant mounts.

## 7. Responsive Rules

- Mobile-first collapse below `768px` to single-column layouts with no exceptions.
- Zero horizontal overflow on mobile.
- Headlines scale with `clamp()`; body text minimum `1rem` / `14px`.
- Interactive elements have a minimum `44px` tap target.
- Inline headline imagery stacks beneath the text on mobile; it never overlaps type.
- Desktop navigation collapses to a clean mobile menu with visible toggle state.
- Section spacing reduces proportionally on smaller screens while preserving breathing room.

## 8. Anti-Patterns (Banned)

- No emojis anywhere.
- No `Inter` font.
- No pure black (`#000000`). Use warm charcoal or off-black instead.
- No neon, outer glow shadows, or purple/blue neon styling.
- No oversaturated accents.
- No excessive gradient text on large headers.
- No custom mouse cursors.
- No overlapping elements or absolute-position stacking.
- No 3-column equal card layouts.
- No generic placeholder names such as “John Doe”, “Acme”, or “Nexus”.
- No fake round numbers or invented metrics.
- No fabricated data sections like “SYSTEM PERFORMANCE METRICS” or “KEY STATISTICS”.
- No `LABEL // YEAR` formatting.
- No AI copywriting clichés: “Elevate”, “Seamless”, “Unleash”, “Next-Gen”.
- No filler microcopy: “Scroll to explore”, “Swipe down”, or bouncing chevrons.
- No broken image links; use properly hosted assets.
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

- Use `Geist` for the core brand font and `Geist Mono` for numeric or system styling.
- Keep hero CTA count to one primary action. Avoid a secondary “Learn more” link.
- Use real photographic assets hosted under `assets/` rather than placeholder external images.
- Keep all text and visuals intentional and non-generic; every section should feel authored and purposeful.
