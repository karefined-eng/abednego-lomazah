(() => {
  const gallery = document.querySelector('[data-hero-gallery]');
  if (!gallery) return;

  const slides = [...gallery.querySelectorAll('[data-hero-slide]')];
  const dots = [...gallery.querySelectorAll('[data-hero-dot]')];
  const previous = gallery.querySelector('[data-hero-previous]');
  const next = gallery.querySelector('[data-hero-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  let timer;

  if (!slides.length) return;
  if (activeIndex < 0) activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === activeIndex;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function scheduleRotation() {
    window.clearInterval(timer);
    if (!reduceMotion.matches && slides.length > 1) {
      timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
    }
  }

  previous?.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    scheduleRotation();
  });
  next?.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    scheduleRotation();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot));
      scheduleRotation();
    });
  });
  reduceMotion.addEventListener?.('change', scheduleRotation);

  showSlide(activeIndex);
  scheduleRotation();
})();
