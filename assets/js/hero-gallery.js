(() => {
  const gallery = document.querySelector('[data-hero-gallery]');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('[data-hero-slide]')];
  const toggle = document.querySelector('[data-hero-toggle]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  let timer;
  let isPaused = reduceMotion.matches;

  if (!slides.length) return;
  if (activeIndex < 0) activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
  }

  function updateToggle() {
    if (!toggle) return;
    toggle.textContent = isPaused ? 'Play portrait rotation' : 'Pause portrait rotation';
    toggle.setAttribute('aria-pressed', String(isPaused));
  }

  function scheduleRotation() {
    window.clearInterval(timer);
    if (!isPaused && slides.length > 1) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
    }
  }

  toggle?.addEventListener('click', () => {
    isPaused = !isPaused;
    updateToggle();
    scheduleRotation();
  });

  reduceMotion.addEventListener?.('change', (event) => {
    isPaused = event.matches;
    updateToggle();
    scheduleRotation();
  });

  showSlide(activeIndex);
  updateToggle();
  scheduleRotation();
})();
