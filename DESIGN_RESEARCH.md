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
