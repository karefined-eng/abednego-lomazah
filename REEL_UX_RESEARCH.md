# Reel UX research

## Professional patterns to apply

Professional horizontal media experiences treat the reel as a **visual preview strip**, not a set of editorial cards. The row should remain discoverable through visible overflow, use consistent card sizing, and allow direct manual interaction. Awwwards notes that horizontal scrolling is less natural than vertical scrolling, so it should be used as a deliberate feature rather than as the only navigation method. [1]

For autoplay, the reliable cross-browser pattern is **muted, inline, looping video with a poster fallback**. MDN documents that autoplay is generally permitted for muted or inaudible video and that `playsinline` is needed for inline playback on Safari/iOS. It also recommends the native `autoplay` attribute where possible, with JavaScript used to detect or handle failures. [2] [3]

The production implementation should therefore use both declarative and scripted behavior: `autoplay muted loop playsinline` on each preview, a poster image for the loading state, a `play()` fallback when a card enters view, and a visible control state when autoplay is blocked. Auto-scroll should be a separate, low-speed motion layer that pauses on pointer/touch/wheel interaction, focus, hidden tabs, and reduced-motion preferences. The row must still work as a normal horizontal scroll area when motion is disabled or blocked.

## Sources

[1]: https://www.awwwards.com/awwwards_collections/collections/horizontal-layout-websites/ — Awwwards, “Horizontal Layout Websites.”
[2]: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay — MDN, “Autoplay guide for media and Web Audio APIs.”
[3]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video — MDN, “`<video>` HTML video embed element.”
