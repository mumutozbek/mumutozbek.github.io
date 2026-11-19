const story = document.querySelector('[data-research-story] .research-story');

if (story) {
  const opening = document.querySelector('.opening-story');
  const hero = opening?.querySelector('.hero');
  const media = opening?.querySelector('.opening-media');
  const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const stage = story.querySelector('.story-stage');
  const chapters = [...story.querySelectorAll('.story-chapter')];
  const stacked = window.matchMedia('(max-width: 640px)');
  let frameId = null;

  function updateScene() {
    frameId = null;
    if (motion.matches && hero && media) {
      const travel = Math.max(hero.offsetHeight * 0.72, 1);
      const scrolled = Math.min(window.scrollY, opening.offsetHeight - media.offsetHeight);
      const progress = Math.max(0, Math.min(1, scrolled / travel));
      opening.style.setProperty('--chapter-progress', progress.toFixed(3));
    }
    const stageTop = parseFloat(getComputedStyle(stage).top);
    // Center the reading line below the pinned image on stacked layouts.
    const readingStart = stageTop + (stacked.matches ? stage.offsetHeight : 0);
    const readingLine = readingStart + Math.max(0, window.innerHeight - readingStart) * 0.42;
    let active = chapters[0];
    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top > readingLine) break;
      active = chapter;
    }
    if (story.dataset.scene !== active.dataset.scene) story.dataset.scene = active.dataset.scene;
  }

  function scheduleUpdate() {
    if (frameId === null) frameId = window.requestAnimationFrame(updateScene);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  motion.addEventListener('change', scheduleUpdate);
  updateScene();
}
