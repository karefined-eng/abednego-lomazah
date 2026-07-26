---
version: "alpha"
name: "Everlasting Executive"
description: "A mature, visionary leadership design system for Abednego Lomazah rooted in warm executive browns, antique limestone cream, and metallic antique gold accents."
colors:
  primary: "#3D1F0D"
  secondary: "#5C2E10"
  tertiary: "#C8870A"
  tertiary-light: "#D4A843"
  neutral: "#F5F0E8"
  neutral-dark: "#EDE6D6"
  on-primary: "#FFFFFF"
  on-tertiary: "#1A0A00"
  ink: "#1A0A00"
typography:
  h1:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: "1.1"
    letterSpacing: "0.05em"
  h2:
    fontFamily: "'Bebas Neue', sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: "1.15"
    letterSpacing: "0.04em"
  body-md:
    fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.6"
  label-caps:
    fontFamily: "Inter, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  navbar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-caps}"
  navbar-link-hover:
    textColor: "{colors.tertiary}"
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.lg}"
    padding: "12px"
    typography: "{typography.label-caps}"
  button-primary-hover:
    backgroundColor: "{colors.tertiary-light}"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    typography: "{typography.body-md}"
  card-border:
    backgroundColor: "{colors.neutral-dark}"
  footer:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
---

## Overview

Architectural Warmth meets Executive Gravitas. The visual identity of Abednego Lomazah has evolved from conventional student politics branding into a mature, transformational leadership platform centered around the "Everlasting" era and a call to action: "A New Era Starts Now." 

The design evokes an executive editorial feel—combining deep, warm timber browns inspired by professional suiting, soft limestone cream backgrounds, and metallic antique gold highlights.

## Colors

The color palette is rooted in warm earth tones and high-contrast editorial pairing, purposefully avoiding cold digital whites or generic primary colors.

- **Primary (#3D1F0D):** Deep executive timber brown. Serves as the primary anchor for headers, navigation bars, and authoritative hero sections.
- **Secondary (#5C2E10):** Medium warm brown. Used for supporting structural elements, secondary sections, and footers.
- **Tertiary (#C8870A):** Antique metallic gold. The primary interactive accent, symbolizing excellence, aspiration, and high-impact focal points.
- **Tertiary Light (#D4A843):** Brushed gold. Applied to hover states and active interactive elements.
- **Neutral (#F5F0E8):** Warm limestone cream foundation. Provides a organic, premium reading experience across all main content pages.
- **Neutral Dark (#EDE6D6):** Darker limestone limestone shade for subtle card borders, dividers, and secondary card containers.
- **On Primary (#FFFFFF):** Crisp white text for clear legibility over dark timber brown backgrounds.
- **On Tertiary (#1A0A00):** Deep ink text placed over gold call-to-action buttons to ensure maximum WCAG AA/AAA contrast.
- **Ink (#1A0A00):** Near-black warm charcoal for primary body text, ensuring effortless readability against cream foundations.

## Typography

The typographic pairing balances monumental impact with modern accessibility.

- **Headlines ('Bebas Neue', sans-serif):** Bold, condensed uppercase typography used for H1 and H2 elements to project confidence, strength, and unwavering purpose.
- **Body & UI ('Inter', sans-serif):** Clean, geometric sans-serif typography providing optimal legibility for long-form updates, resource descriptions, and navigation labels.

## Layout & Spacing

Layouts prioritize clarity and breathing room, mirroring an editorial publication or executive portfolio.

- Content containers utilize responsive padding (`8px`, `16px`, `32px`) to ensure visual hierarchy without crowding.
- Sections are distinctly separated by alternating between warm limestone cream and deep timber brown backgrounds, creating a rhythmic, engaging scrolling experience.

## Elevation & Depth

Shadows and depth are subtle and warm, reinforcing the tangible, premium feel of the interface.

- Interactive cards and elevated containers use a soft, tinted warm shadow (`rgba(61, 31, 13, 0.10)`) rather than harsh gray or black drop-shadows.
- Hover states elevate elements slightly while transitioning background colors smoothly.

## Shapes

Geometry is approachable yet structured.

- Standard cards, interactive buttons, and media containers use a generous `12px` border radius (`lg`) for a modern, tactile feel.
- Smaller UI badges and tags utilize a tight `4px` radius (`sm`) to maintain crisp alignment.

## Components

The core components of the platform adhere strictly to these defined tokens across `index.html`, `resources.html`, and `updates.html`:

- **Navigation Bar:** Deep primary brown background with limestone cream uppercase navigation links that transition to antique gold on hover.
- **Hero Banner:** Immersive display featuring professional headshot photography and the "Everlasting" branding, supported by bold uppercase headlines.
- **Quote Cards & Flyers:** Visual showcases displaying inspirational leadership quotes ("Leadership is not being noticed, it is being useful") framed within limestone cards.
- **Call-to-Action Buttons:** High-visibility antique gold buttons with deep ink text and smooth brushed gold hover transitions.

## Do's and Don'ts

- **Do** always use warm limestone cream (`#F5F0E8`) for general page backgrounds instead of pure digital white (`#FFFFFF`).
- **Do** ensure all text on dark brown backgrounds uses `#FFFFFF` or `#F5F0E8` for optimal accessibility.
- **Don't** introduce cool blues, harsh reds, or neon greens that clash with the warm, executive brown and gold color system.
- **Don't** use generic placeholder graphics or stock icons when authentic brand assets, quote cards, and professional photography are available.
