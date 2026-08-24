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
