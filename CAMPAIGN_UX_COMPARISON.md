# Worldwide Campaign Website UX Comparison & Redesign Brief

## 1. Executive Summary
This report synthesizes UX/UI best practices from major political campaigns (Tier 1) and student union elections (Tier 2) worldwide. It compares these benchmarks against the current state of the Abednego Lomazah UGSRC campaign site and provides a prioritized redesign brief to bridge the gaps.

## 2. Global Campaign UX Benchmarks

### 2.1. Visual Identity & Trust Signaling
- **Tier 1 (National Politics):** Sites rely heavily on high-contrast palettes (often red/blue/white in the US, or specific party colors in Europe). Typography is bold, legible, and authoritative. High-quality, authentic photography (candidate in action, engaging with voters) is prioritized over stock imagery.
- **Tier 2 (Student/Youth Campaigns):** Visuals are more dynamic, trend-aware, and platform-native. They often incorporate school colors but add modern digital aesthetics (gradients, bold sans-serifs, edgy graphic novel or "street" styles).
- **The Core Rule:** The site must look well-funded and technically sophisticated to establish credibility within seconds.

### 2.2. First-Visit Flow & Hero Section
- **Tier 1:** The hero section is laser-focused. It features the candidate's face or an ambient background video of a rally, a strong value proposition, and a single, unmissable Call to Action (CTA) above the fold (usually "Donate" or "Join").
- **Tier 2:** Often uses video backgrounds or highly engaging visual hooks to capture short attention spans. The primary CTA is usually "Vote," "Read Manifesto," or "Join WhatsApp/Discord."
- **The Core Rule:** Do not split the user's attention. One clear action per view.

### 2.3. Storytelling & Narrative
- **Tier 1:** Narratives are built around the voter ("Your fight is my fight") rather than just a resume. Issues are presented clearly and concisely.
- **Tier 2:** Storytelling is highly visual and often immersive. Techniques like "The Guided Journey" (using a persona) or "The Love Letter" (focusing on the campus community) are highly effective.
- **The Core Rule:** Show, don't just tell. Use a mix of short text, video, and imagery to guide the user through the candidate's journey and platform.

### 2.4. Video & Media Integration
- **Tier 1 & 2:** Video is central. Ambient (auto-playing, muted) video is used for mood-setting in the hero section. Campaign speeches, TikToks, and rally clips are embedded natively.
- **Mobile Specifics:** Horizontal scrolling (carousels/rails) for media is a standard pattern on mobile to save vertical space, but it must be discoverable and controllable (pausing on interaction).
- **The Core Rule:** Media must feel native to the page, load quickly, and not disrupt the user experience with forced audio or aggressive auto-advancing.

### 2.5. Navigation & Information Architecture
- **Tier 1 & 2:** Navigation is kept extremely simple: Home, About/Story, Issues/Platform, News/Updates, and a highlighted Action button (Donate/Join).
- **The Core Rule:** Stick to standard placement. Do not reinvent the wheel for navigation.

## 3. Audit of the Abednego Lomazah Site

### What We Got Right (Strengths)
- **Visual Identity Update:** The recent shift from a generic white background to the flyer-derived palette (espresso brown, ochre gold, cream) aligns well with Tier 1/2 branding standards.
- **Hero Video:** Implementing the ambient background video in the hero section matches current best practices for establishing momentum.
- **Mobile Media Rails:** The recent implementation of horizontal scrolling for TikTok and campaign videos on mobile matches the UX patterns recommended by Nielsen Norman Group and Smashing Magazine for content discovery.
- **Content Focus:** Removing the "Advocacy Tracker" and focusing on the "Campaign Story" streamlines the narrative.

### What We Got Wrong (Gaps & Weaknesses)
- **Information Architecture (IA) Confusion:** The separation between "Home," "Updates" (Campaign Story), and "Resources" is slightly disjointed. The campaign story *is* the core product right now, but it's buried on a secondary page.
- **Homepage Storytelling:** The homepage has a strong hero but then drops into a generic "About" section with a text-heavy quote marquee. It lacks the immersive, visual storytelling seen in top-tier campaigns.
- **CTA Clarity:** The homepage has competing CTAs ("The Campaign Story" and "Student Resources"). It needs a single, dominant action (e.g., "Join the Movement" or "Follow the Story").
- **Resource Hub Integration:** The Resources page is functional but feels disconnected from the campaign narrative. It needs to feel like a *campaign promise delivered*, not just a file directory.

## 4. Prioritized Redesign Brief

To elevate the Abednego Lomazah site to global campaign standards, the following changes must be implemented:

### Priority 1: Restructure the Homepage Narrative
- **Action:** Merge the core elements of the "Campaign Story" (currently on the Updates page) directly into the Homepage.
- **Why:** The homepage should tell the story immediately. Users shouldn't have to click to a secondary page to see the campaign in motion.
- **Implementation:** Move the TikTok embed and the horizontal video rail from `updates.html` to `index.html`, placing them directly below the hero section.

### Priority 2: Clarify the Primary Call to Action (CTA)
- **Action:** Update the hero section CTAs. Make one dominant (e.g., "Join the WhatsApp Channel" or "Watch the Campaign Story") and remove competing secondary buttons above the fold.
- **Why:** Best practices dictate a single, focused action to maximize conversion.

### Priority 3: Elevate the "Resources" Narrative
- **Action:** Redesign the Resources page to clearly frame it as proof of Abednego's commitment to students ("Service Delivered"), rather than just a library.
- **Why:** In student elections, tangible help (like PASSCO and tutorials) is the strongest currency. It must be branded as a core campaign pillar.

### Priority 4: Refine the Visual Rhythm (Typography & Spacing)
- **Action:** Audit the typography scale and white space across all pages. Ensure short line lengths (45-75 characters) for readability and distinct visual breaks between sections.
- **Why:** To prevent the "wall of text" feeling and ensure the site feels as polished as a national campaign.

### Priority 5: Consolidate Pages
- **Action:** Consider deprecating the standalone `updates.html` page once its content is merged into the homepage, simplifying the navigation to just "Home" and "Resources."
- **Why:** Simpler navigation reduces friction and keeps voters focused on the main narrative.
