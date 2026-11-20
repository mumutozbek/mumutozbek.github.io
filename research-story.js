(() => {
  const chapter = document.querySelector(".campus-chapter");
  if (!chapter) return;

  const map = chapter.querySelector(".campus-map");
  const work = chapter.querySelector(".academic-index");
  const research = chapter.querySelector(".campus-research");
  const engagement = chapter.querySelector(".engagement-chapter");
  const sections = [map, work, research, engagement];
  const header = document.querySelector(".site-header");
  const motion = matchMedia("(prefers-reduced-motion: no-preference)");
  const desktop = matchMedia("(min-width: 971px) and (min-height: 560px)");
  let frame = null;

  const clamp = (value) => Math.max(0, Math.min(1, value));
  const ease = (value) => value * value * (3 - 2 * value);

  function setValue(section, property, value) {
    if (section.style.getPropertyValue(property) !== value) section.style.setProperty(property, value);
  }

  function paint() {
    frame = null;
    if (!motion.matches) return;

    const headerBottom = header.getBoundingClientRect().bottom;
    const chapterTop = chapter.getBoundingClientRect().top;
    const heights = sections.map(section => section.offsetHeight);
    const room = Math.max(innerHeight - headerBottom, 1);
    const progress = clamp((headerBottom - chapterTop) / Math.max(heights[0] - 40, 1));
    setValue(chapter, "--chapter-progress", ease(progress).toFixed(3));
    setValue(chapter, "--chapter-edge", clamp(progress * 4).toFixed(3));

    // Use normal-flow heights so pinned positions never feed back into scroll progress.
    let incomingTop = chapterTop + heights[0];
    for (let i = 1; i < sections.length - 1; i++) {
      const [outgoing, incoming] = [sections[i], sections[i + 1]];
      const height = heights[i];
      incomingTop += height;
      const depth = Math.max(1, Math.min(360, room * .46, height - 24));
      const overlap = headerBottom + depth - incomingTop;
      const cover = desktop.matches ? clamp(overlap / depth) : 0;
      const arrival = clamp((innerHeight - incomingTop) / Math.min(room * .68, 400));
      const edge = desktop.matches ? overlap : innerHeight - incomingTop;
      setValue(outgoing, "--handoff-hold", `${(headerBottom + depth - height).toFixed(2)}px`);
      setValue(outgoing, "--handoff-out", ease(cover).toFixed(3));
      setValue(incoming, "--handoff-in", ease(arrival).toFixed(3));
      setValue(incoming, "--handoff-edge", clamp(edge / 92).toFixed(3));
    }
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
    schedulePaint();
  }

  chapter.addEventListener("focusin", ({ target }) => {
    if (!motion.matches || !target.matches(":focus-visible")) return;
    const index = sections.findIndex(section => section.contains(target));
    const outgoing = sections[index];
    const incoming = sections[index + 1];
    if (!outgoing || !incoming || target === outgoing ||
        getComputedStyle(outgoing).position !== "sticky") return;

    const visibleFocus = target.querySelector(".campus-card") || target;
    const focusRect = visibleFocus.getBoundingClientRect();
    const headerBottom = header.getBoundingClientRect().bottom;
    if (focusRect.top >= headerBottom && focusRect.bottom < incoming.getBoundingClientRect().top) return;

    // Restore a visible focus position when tabbing into a covered chapter.
    const before = sections.slice(0, index).reduce((sum, section) => sum + section.offsetHeight, 0);
    const naturalTop = chapter.getBoundingClientRect().top + scrollY + before;
    const localBottom = focusRect.bottom - outgoing.getBoundingClientRect().top;
    const targetY = Math.max(naturalTop - headerBottom, naturalTop + localBottom - innerHeight + 12);
    window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
  });

  window.addEventListener("scroll", schedulePaint, { passive: true });
  window.addEventListener("resize", schedulePaint, { passive: true });
  window.addEventListener("pageshow", schedulePaint);
  motion.addEventListener("change", updateMotion);
  updateMotion();
})();
