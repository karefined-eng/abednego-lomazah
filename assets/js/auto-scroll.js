document.addEventListener('DOMContentLoaded', () => {
  const rails = document.querySelectorAll('.horizontal-scroll-rail, .campaign-motion-rail, .campaign-tiktok-block .campaign-media-feature');
  
  rails.forEach(rail => {
    // Only auto-scroll if it actually overflows
    if (rail.scrollWidth <= rail.clientWidth) return;
    
    let isPaused = false;
    let scrollSpeed = 0.5; // pixels per frame
    let animationId;
    let scrollPos = rail.scrollLeft;

    const startScroll = () => {
      if (isPaused) return;
      scrollPos += scrollSpeed;
      
      // If reached the end, snap back to start (or reverse)
      if (scrollPos >= rail.scrollWidth - rail.clientWidth - 1) {
        scrollPos = 0;
      }
      
      rail.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(startScroll);
    };

    // Pause on interaction
    const pause = () => {
      isPaused = true;
      cancelAnimationFrame(animationId);
      // Sync our logical position with manual scroll position
      scrollPos = rail.scrollLeft;
    };

    const resume = () => {
      isPaused = false;
      scrollPos = rail.scrollLeft;
      animationId = requestAnimationFrame(startScroll);
    };

    // Listeners for pausing
    rail.addEventListener('mouseenter', pause);
    rail.addEventListener('touchstart', pause, { passive: true });
    rail.addEventListener('focusin', pause);
    
    // Listeners for resuming
    rail.addEventListener('mouseleave', resume);
    rail.addEventListener('touchend', resume, { passive: true });
    rail.addEventListener('focusout', resume);

    // Also pause if any video inside is playing
    const videos = rail.querySelectorAll('video');
    videos.forEach(video => {
      video.addEventListener('play', pause);
      video.addEventListener('pause', resume);
      video.addEventListener('ended', resume);
    });

    // Start initial scroll if user prefers motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      // Small delay before starting so user can orient themselves
      setTimeout(() => {
        animationId = requestAnimationFrame(startScroll);
      }, 2000);
    }
  });
});
