const story = document.querySelector('[data-research-story] .research-story');

if (story) {
  const stage = story.querySelector('.story-stage');
  const chapters = [...story.querySelectorAll('.story-chapter')];
  const stacked = window.matchMedia('(max-width: 640px)');
  let frameId = null;

  function updateScene() {
    frameId = null;
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
  updateScene();
}
