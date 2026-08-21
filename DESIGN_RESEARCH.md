# Campaign Website Design Research

## User Feedback Analysis
- **"why is there soo much white and plainness... too raw not desgin nothin no miving videos no casitous sels"**
  - The current design feels like a plain document archive.
  - Needs dynamic elements: moving videos (ambient background or auto-playing muted clips), carousels ("casitous sels").
  - Needs richer colors, breaking away from the plain white/cream backgrounds.
- **"how have peple done it in the past ahow to people interact with presponsive site s and the sots"**
  - Wants modern, responsive web design patterns typical of high-end political or student campaigns.
- **"Don't be using that arrow thing to link houses. Use better click work patterns."**
  - Remove repetitive `➔` links. Use entire cards as clickable areas or modern button styles.
- **"Campaign click, that tag, campaign click, this... This is a time-sensitive thing."**
  - The timeline/story needs to feel urgent and current.
- **"Then what if you go and play automatic play? How do you think you're playing automatic play?way."**
  - Avoid auto-playing videos with sound that disrupt the user. Use ambient, muted auto-play for visual flair (e.g., hero background), but require user interaction for speeches/clips with audio.
- **"The tutorial files are coming your way... leave this channel for more updates... recent speeches... flyers... letters should stay... clips should be seen."**
  - Content hierarchy needs to clearly separate:
    1. The Campaign Story (Videos, Speeches, Rallies)
    2. Advocacy & Letters (The record of service)
    3. Student Resources & Tutorials (Separate section, waiting for files)
- **"I want to brief you on how to make the page tell the story... indicate the campaign as really intensified... It should tell a story. It should be easy on the eyes, get the colors right."**

## Visual & Interaction Strategy
1. **Color Palette:** The current `.stitch/DESIGN.md` defines a "warm stone and antique gold" theme (`#F5F0E8`, `#3D1F0D`, `#C8870A`). We need to lean into the bolder colors (`#3D1F0D` Brown, `#C8870A` Gold) for major sections to remove the "plain white" feeling, creating high-contrast, impactful zones.
2. **Hero Section:** Instead of a static image, use a silent, looping video background (e.g., `VID-20260821-WA0002.mp4` showing the chanting crowd) to immediately show the "intensified" campaign energy.
3. **Video Integration:**
   - Use a sleek, horizontal scrolling carousel or a masonry grid for campaign clips, rather than a rigid list.
   - Use custom video player styling or clean poster images so it doesn't look like raw HTML `<video>` tags.
4. **Card Design:** Make entire cards clickable. Use subtle hover effects (scaling, shadow adjustments) instead of text links with arrows.
5. **Storytelling Flow:**
   - *Hook:* High-energy video hero.
   - *The Vision:* The core message and candidate profile.
   - *The Movement (Videos):* The rallies, engagements, and speeches.
   - *The Record (Advocacy/Petitions):* The letters and proof of service.
   - *Student Support (Tutorials):* Coming soon/Resources section.

## Next Steps
1. Inspect the provided flyers/images to see if there's a specific brand color we should adopt beyond the current brown/gold.
2. Draft the HTML/CSS changes to implement the video hero and carousel.


## External Visual Research Notes

### SiteBuilderReport — Politician website examples
Source: https://www.sitebuilderreport.com/inspiration/politician-websites

The roundup is useful as a visual benchmark because it presents campaign websites as public-facing identity systems rather than document repositories. The page itself uses a strong editorial headline, restrained supporting copy, and a sequence of visual examples. The practical implication for this campaign site is to make the homepage immediately communicative: one strong visual hook, a short message, and a clear next action before deeper content.

### New Media Campaigns — Political web design trends and examples
Source: https://www.newmediacampaigns.com/political-campaign-website-design/political-web-design-trends-examples

The page did not render usable text in the browser session, so no detailed claims are taken from it. It remains a reference lead only and should not be treated as evidence for implementation decisions.

### Design decision from research so far
The site needs a more intentional campaign identity: a visual opening, a clear narrative order, visually distinct sections, and interaction patterns that make the whole media card or story block actionable. The design should use motion carefully: muted looping video can create atmosphere in the hero, but speeches and campaign clips should require explicit play. The page should not be a wall of white cards or a repeated list of generic links.


## Accessibility and Motion Research

### Section508.gov — Avoid Auto-Playing Content
Source: https://www.section508.gov/blog/avoid-auto-playing-content/

The guidance explains that automatically playing audio, video, or animations can interfere with assistive technologies, distract users, and make navigation difficult. Its practical recommendations are to let users choose when media starts; if automatic playback is used, keep it muted and provide visible, keyboard-accessible pause/stop/hide controls. Moving content lasting more than five seconds should be controllable. For this site, the correct pattern is a **muted, short ambient hero preview with an obvious pause control**, while speeches and campaign clips use explicit play controls and never start with sound.

### W3C — Web Content Accessibility Guidelines 2.1
Source: https://www.w3.org/TR/WCAG21/

WCAG 2.1 identifies time-based media, captions, audio control, contrast, resize, reflow, keyboard access, and meaningful sequence as relevant accessibility areas. The campaign experience should therefore preserve a readable narrative order even when media is unavailable, keep controls keyboard accessible, avoid using color alone to communicate a status, and make the layout reflow cleanly on mobile.

## Revised Implementation Direction
The next visual pass should not be a plain white card wall. It should use a **campaign identity system**: a bold visual hero, dark/colored story bands used intentionally, real flyer imagery as editorial texture, a featured speech or clip with a large play surface, a horizontal media rail on mobile, and clear primary buttons such as “Watch the campaign story,” “Join the WhatsApp channel,” “Read the advocacy record,” and “Browse student resources.”


## Supplied Flyer Visual Analysis

The supplied flyers provide a much stronger campaign identity than the current site was using. The recurring visual language is a **dark espresso/brown field**, **warm ochre-gold typography**, **large white condensed display lettering**, and **high-contrast portrait photography**. The graphics use subtle circular or stamped emblems, University of Ghana and SRC marks, thin gold rules, curved white cutouts, and the recurring campaign phrase **“#THAT TIME HAS COME.”**

The “President Hopeful ’26” flyer is especially clear: the candidate portrait is large and close-cropped, the name is split between gold and white, the institutional marks sit above the name, and the bottom is intentionally white for supporting logos and the campaign phrase. The “BIG! ANNOUNCEMENT” flyer uses a warm brown photographic texture, oversized white display type, gold punctuation and rules, and an oversized initial “A” as a visual anchor.

### Design direction inferred from the actual campaign materials
The website should use the flyers as its source of truth rather than inventing a new palette. The best direction is a **campaign editorial system**: espresso, coffee brown, ochre gold, white, and portrait-led imagery; condensed display headlines; short high-impact copy; gold rule separators; and photo/video blocks that feel like campaign posters translated into a responsive interface. White should remain as a deliberate highlight and reading surface, not the entire page background.


## Visual Reference Search

Image references for political campaign websites consistently show a strong, immediately legible hero: candidate imagery or video, short headline, and a highly visible action button. They also use color blocks, full-bleed photography, asymmetric composition, and compact navigation rather than presenting all content as equally weighted white cards. These references support using the candidate’s own flyers as the primary art direction instead of copying a generic campaign template.

## Palette to Use in the Next Pass

| Role | Direction | Approximate value |
|---|---|---|
| Campaign field | Espresso / near-black brown | #24170F |
| Secondary field | Warm coffee brown | #5B3B28 |
| Accent | Ochre / antique gold | #C8870A |
| Type on dark | Warm white | #F5F0E8 |
| Reading surface | Soft ivory | #FBF8F2 |
| Structural line | Muted warm beige | #D8C8B3 |

The design should use dark brown for campaign-intensity sections, warm ivory for readable archive sections, and ochre gold for active states and primary buttons. The candidate’s portrait, flyer textures, circular emblem, large condensed typography, and curved white edge should be treated as recurring motifs.


## Live Validation Notes

The deployed homepage now visibly renders a campaign video hero with a dark espresso field, gold navigation accents, large display typography, and two clear primary actions. The motion is muted, inline, and has a visible pause control, which matches the accessibility research.

The deployed Updates page is now visibly separated into an advocacy/petition area, a recent WhatsApp campaign story, how-to guides, TikTok feature, and direct campaign video archive. The top of the page still begins with the older advocacy tracker skeleton/loading block and petition ledger, so the next polish pass should improve the order and reduce the initial “dashboard” feeling by leading with the campaign-story hero before the older ledger. The page also confirms that the repeated generic arrow-link issue has been reduced in the new campaign sections, while some legacy petition controls remain and should be retained only where they help visitors understand the document interaction.
