document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rails = document.querySelectorAll('.auto-video-rail, .campaign-motion-rail');

  rails.forEach((rail) => {
    const videos = [...rail.querySelectorAll('video.auto-play-video')];
    let scrollPos = rail.scrollLeft;
    let animationId = null;
    let resumeTimer = null;
    let pausedByUser = false;

    const hasOverflow = () => rail.scrollWidth > rail.clientWidth + 2;

    const stopScroll = () => {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    };

    const continueScroll = () => {
      if (pausedByUser || prefersReducedMotion || !hasOverflow()) return;
      scrollPos += 0.95;
      if (scrollPos >= rail.scrollWidth - rail.clientWidth - 1) scrollPos = 0;
      rail.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(continueScroll);
    };

    const pauseForInteraction = (duration = 7000) => {
      pausedByUser = true;
      stopScroll();
      scrollPos = rail.scrollLeft;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        pausedByUser = false;
        scrollPos = rail.scrollLeft;
        animationId = requestAnimationFrame(continueScroll);
      }, duration);
    };

    const pauseWhileFocused = () => {
      pausedByUser = true;
      stopScroll();
      scrollPos = rail.scrollLeft;
    };

    const resumeAfterFocus = () => {
      if (rail.contains(document.activeElement)) return;
      pausedByUser = false;
      scrollPos = rail.scrollLeft;
      if (!animationId) animationId = requestAnimationFrame(continueScroll);
    };

    rail.addEventListener('pointerdown', () => pauseForInteraction());
    rail.addEventListener('touchstart', () => pauseForInteraction(), { passive: true });
    rail.addEventListener('wheel', () => pauseForInteraction(), { passive: true });
    rail.addEventListener('focusin', pauseWhileFocused);
    rail.addEventListener('focusout', resumeAfterFocus);

    if ('IntersectionObserver' in window && videos.length && !prefersReducedMotion) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            video.muted = true;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { root: rail, threshold: [0, 0.55, 0.9] });
      videos.forEach((video) => videoObserver.observe(video));
    }

    if (!prefersReducedMotion && hasOverflow()) {
      window.setTimeout(() => {
        scrollPos = rail.scrollLeft;
        animationId = requestAnimationFrame(continueScroll);
      }, 800);
    }

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => {
      if (!hasOverflow()) stopScroll();
      else if (!prefersReducedMotion && !pausedByUser && !animationId) animationId = requestAnimationFrame(continueScroll);
    }) : null;
    resizeObserver?.observe(rail);
  });
});
