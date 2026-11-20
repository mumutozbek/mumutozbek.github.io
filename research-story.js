const opening = document.querySelector('.opening-story');

if (opening) {
  const hero = opening.querySelector('.hero');
  const media = opening.querySelector('.opening-media');
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let frameId = null;

  function updateOpening() {
    frameId = null;
    if (motion.matches && hero && media) {
      const pinDistance = opening.offsetHeight - media.offsetHeight;
      const travel = Math.max(Math.min(hero.offsetHeight * 0.72, pinDistance), 1);
      const scrolled = Math.min(window.scrollY, pinDistance);
      const progress = Math.max(0, Math.min(1, scrolled / travel));
      opening.style.setProperty('--chapter-progress', progress.toFixed(3));
    }
  }

  function scheduleUpdate() {
    if (frameId === null) frameId = window.requestAnimationFrame(updateOpening);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  motion.addEventListener('change', scheduleUpdate);
  updateOpening();
}
