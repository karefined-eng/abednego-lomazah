# #EVERLASTING Digital Memorial Research

## Concept validation
The proposed experience has clear precedents in online memorials and collaborative tribute boards. Keeper Memorials presents memorials as shareable life-story pages that support photos, videos, collaboration, QR-linked access, and tribute videos. Kudoboard describes a shared memorial board where contributors can add messages, photos, videos, links, and other personal touches; its documented product features include moderation, multiple administrators, embeddable boards, reactions, exports, and slideshow presentation. ForeverMissed similarly emphasizes personal stories, photos, music, and tributes from friends and family.

These precedents support the core logic of a public, participatory wall for Abednego: one durable URL, a growing collection of words and media, and a moderated contribution flow. The distinctive campaign treatment is the generative composition: each visit shuffles the published voices into a new visual arrangement, while the content remains stable and attributable.

## Product decisions for this site
The initial implementation uses a dark espresso-and-gold memorial atmosphere, flyer-derived typography, randomized note size/tone/rotation, scroll-reveal animation, a recompose control, and a prominent call to leave a word. It includes the supplied portrait of Samuel Espan Bissah and the two new tribute messages supplied in the conversation.

New contributions are submitted to a pending list rather than published automatically. This protects the wall from spam, accidental publication, impersonation, and unsupported allegations. Approved tributes can later be added to the public list and will appear in a new randomized composition on each visit.

The experience respects reduced-motion preferences by disabling non-essential reveal motion and rotation. The wall remains readable and keyboard-accessible, and submitted message content is escaped before rendering in the browser.

## References
1. [Keeper Memorials](https://www.mykeeper.com/) — online memorial pages, collaborative tributes, photo/video content, QR plaques, and tribute videos.
2. [ForeverMissed](https://www.forevermissed.com/) — online memorials with personal stories, photos, music, and tributes.
3. [Kudoboard Online Memorial](https://www.kudoboard.com/online-memorial/) — shared memorial boards with messages, photos, videos, moderation, reactions, exports, and slideshow presentation.

## Deployment validation note
The GitHub deployment for commit `1536a3e` completed successfully and produced a Vercel deployment URL. The previously used production alias returned a 404 for `/everlasting.html` during immediate validation, while the deployment-specific preview URL redirected to Vercel login, so the public alias/domain mapping needs to be checked before claiming the memorial is live. The repository implementation itself passed local JavaScript syntax and whitespace checks.

## Live validation
The public page `https://abednego-lomazah-site.vercel.app/everlasting.html` now returns the expected page title and content, including the #EVERLASTING hero, 12 seeded voices, supplied Samuel Espan Bissah portrait, wall recompose control, and moderated submission form. The live `/api/tributes` endpoint returns a safe JSON response with `success: true` and an empty approved list, so the frontend falls back to the seeded voices until approved submissions are added.

## Expanded content validation
The live deployment now successfully renders the expanded tribute rotation on desktop, including the manifesto quotes and archival campaign images (`assets/headshots/abednego-lomazah-headshot-fullbody-batik-1.jpg` and `assets/headshots/abednego-lomazah-headshot-studio-batik.jpg`). The image cards scale correctly within the generative grid layout without breaking the surrounding text notes.

## Drive image check
The exact `ABEDNEGO VIDEOS ` Drive folder contains seven campaign files: six MP4 videos and one JPEG, `IMG-20260821-WA0009.jpg`. The JPEG is an Electoral Commission calendar, not a portrait of Abednego raising his hands. The existing repository image inventory likewise contains no hands-raised still. The requested portrait therefore needs to be uploaded separately or extracted from a video if the user identifies the correct clip.
