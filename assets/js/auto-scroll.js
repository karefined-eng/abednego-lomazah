(() => {
  'use strict';

  const initMotionRails = () => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rails = document.querySelectorAll('.auto-video-rail, .campaign-motion-rail');

    rails.forEach((rail) => {
      if (rail.dataset.motionReady === 'true') return;
      rail.dataset.motionReady = 'true';

      const videos = [...rail.querySelectorAll('video.auto-play-video')];
      let animationId = 0;
      let resumeTimer = 0;
      let layoutRetryTimer = 0;
      let scrollPos = rail.scrollLeft;
      let lastFrameTime = 0;
      let pausedByUser = false;

      const prefersReducedMotion = () => motionPreference.matches;
      const hasOverflow = () => rail.scrollWidth - rail.clientWidth > 4;

      const stopTicker = () => {
        if (animationId) window.cancelAnimationFrame(animationId);
        animationId = 0;
        lastFrameTime = 0;
      };

      const tick = (time) => {
        if (pausedByUser || prefersReducedMotion() || document.hidden || !hasOverflow()) {
          stopTicker();
          return;
        }

        if (!lastFrameTime) lastFrameTime = time;
        const elapsed = Math.min(time - lastFrameTime, 64);
        lastFrameTime = time;
        const maxScroll = rail.scrollWidth - rail.clientWidth;
        scrollPos += elapsed * 0.035;

        if (scrollPos >= maxScroll) scrollPos = 0;
        rail.scrollLeft = scrollPos;
        animationId = window.requestAnimationFrame(tick);
      };

      const startTicker = () => {
        if (pausedByUser || prefersReducedMotion() || document.hidden || !hasOverflow()) return;
        scrollPos = rail.scrollLeft;
        if (!animationId) animationId = window.requestAnimationFrame(tick);
      };

      const pauseForInteraction = (duration = 5000) => {
        pausedByUser = true;
        stopTicker();
        scrollPos = rail.scrollLeft;
        window.clearTimeout(resumeTimer);
        resumeTimer = window.setTimeout(() => {
          pausedByUser = false;
          startTicker();
        }, duration);
      };

      const handleVisibility = () => {
        if (document.hidden) stopTicker();
        else startTicker();
      };

      rail.addEventListener('pointerdown', () => pauseForInteraction(), { passive: true });
      rail.addEventListener('wheel', () => pauseForInteraction(), { passive: true });
      rail.addEventListener('touchstart', () => pauseForInteraction(), { passive: true });
      rail.addEventListener('focusin', () => pauseForInteraction(8000));
      rail.addEventListener('focusout', () => {
        window.setTimeout(() => {
          if (!rail.contains(document.activeElement)) {
            pausedByUser = false;
            startTicker();
          }
        }, 150);
      });
      document.addEventListener('visibilitychange', handleVisibility);
      motionPreference.addEventListener?.('change', () => {
        if (prefersReducedMotion()) stopTicker();
        else startTicker();
      });

      videos.forEach((video) => {
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');

        video.addEventListener('canplay', () => {
          if (!prefersReducedMotion() && !document.hidden && video.getBoundingClientRect().right > 0) {
            video.play().catch(() => video.setAttribute('data-autoplay-blocked', 'true'));
          }
        }, { passive: true });
      });

      if ('IntersectionObserver' in window && videos.length) {
        const videoObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !prefersReducedMotion()) {
              video.muted = true;
              video.play().catch(() => video.setAttribute('data-autoplay-blocked', 'true'));
            } else if (!entry.isIntersecting) {
              video.pause();
            }
          });
        }, { threshold: [0, 0.25, 0.6] });
        videos.forEach((video) => videoObserver.observe(video));
      }

      const ensureTicker = () => {
        if (hasOverflow()) {
          startTicker();
          window.clearInterval(layoutRetryTimer);
        }
      };

      if ('ResizeObserver' in window) {
        new ResizeObserver(ensureTicker).observe(rail);
      } else {
        window.addEventListener('resize', ensureTicker, { passive: true });
      }

      layoutRetryTimer = window.setInterval(ensureTicker, 250);
      window.setTimeout(() => window.clearInterval(layoutRetryTimer), 8000);
      window.setTimeout(ensureTicker, 100);
      window.setTimeout(ensureTicker, 800);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMotionRails, { once: true });
  } else {
    initMotionRails();
  }
})();
