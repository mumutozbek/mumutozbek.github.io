(() => {
  const chapter = document.querySelector(".campus-chapter");
  if (!chapter) return;

  const map = chapter.querySelector(".campus-map");
  const work = chapter.querySelector(".academic-index");
  const header = document.querySelector(".site-header");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  let frame = null;
  let previous = -1;

  function paint() {
    frame = null;
    if (!motion.matches) return;

    const distance = header.getBoundingClientRect().bottom - chapter.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, distance / Math.max(map.offsetHeight - 40, 1)));
    const eased = progress * progress * (3 - 2 * progress);
    const value = Number(eased.toFixed(3));
    if (value === previous) return;

    previous = value;
    chapter.style.setProperty("--chapter-progress", value);
    chapter.style.setProperty("--chapter-edge", Math.min(1, progress * 4).toFixed(3));
  }

  function schedulePaint() {
    if (motion.matches && frame === null) frame = requestAnimationFrame(paint);
  }

  function updateMotion() {
    chapter.classList.toggle("is-scroll-ready", motion.matches);
    if (!motion.matches) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      return;
    }
    previous = -1;
    schedulePaint();
  }

  map.addEventListener("focusin", ({ target }) => {
    if (!motion.matches || !target.matches(":focus-visible") ||
        getComputedStyle(map).position !== "sticky") return;
    const visibleFocus = target.querySelector(".campus-card") || target;
    // A keyboard user returning to the map must not land behind the incoming panel.
    if (visibleFocus.getBoundingClientRect().bottom >= work.getBoundingClientRect().top) {
      chapter.scrollIntoView({ block: "start", behavior: "instant" });
    }
  });

  window.addEventListener("scroll", schedulePaint, { passive: true });
  window.addEventListener("resize", schedulePaint, { passive: true });
  window.addEventListener("pageshow", schedulePaint);
  motion.addEventListener("change", updateMotion);
  updateMotion();
})();
