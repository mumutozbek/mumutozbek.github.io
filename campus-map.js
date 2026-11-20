(() => {
  const map = document.querySelector(".campus-map");
  if (!map) return;

  const world = map.querySelector(".campus-world");
  const links = [...map.querySelectorAll(".campus-landmark")];
  const artwork = map.querySelector(".campus-lines");
  const lines = new Map([...artwork.querySelectorAll("[data-landmark]")]
    .map((line) => [line.dataset.landmark, line]));
  const cards = links.map((link, index) => {
    const start = lines.get(link.hash.slice(1)).querySelector("polyline").points.getItem(0);
    return {
      link, index, start,
      card: link.querySelector(".campus-card"),
      baseX: start.x, baseY: start.y,
      x: 0, y: 0,
    };
  });
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const stackedMap = matchMedia("(max-width: 970px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const introTime = performance.now();
  let active = links[0];
  let departure;
  let resetCamera;
  let frame;
  let scaleX = 1;
  let scaleY = 1;
  let pointerX = 0;
  let pointerY = 0;
  let liftActive = false;

  function canFloat() {
    return !reduceMotion.matches && !stackedMap.matches && finePointer.matches;
  }

  function positionCard(item, x, y) {
    item.card.style.setProperty("--card-x", `${x.toFixed(2)}px`);
    item.card.style.setProperty("--card-y", `${y.toFixed(2)}px`);
    // The first leader point moves with the card; its building stays fixed.
    item.start.x = item.baseX + x * scaleX;
    item.start.y = item.baseY + y * scaleY;
  }

  function queueMotion() {
    if (canFloat() && !frame) frame = requestAnimationFrame(moveCards);
  }

  function moveCards(now) {
    frame = null;
    if (!canFloat()) return;
    const elapsed = now - introTime;
    const settling = Math.max(0, 1 - elapsed / 2800);
    let moving = settling > 0;

    for (const item of cards) {
      const phase = elapsed / 370 + item.index * 1.04;
      const x = pointerX * (3 + item.index % 3) + Math.sin(phase) * 3.6 * settling;
      const y = pointerY * (2.5 + item.index % 3) + Math.cos(phase) * 4 * settling -
        (liftActive && item.link === active ? 4 : 0);
      const dx = x - item.x;
      const dy = y - item.y;
      const unsettled = Math.abs(dx) > .08 || Math.abs(dy) > .08;
      if (!unsettled && dx === 0 && dy === 0) continue;
      item.x = unsettled ? item.x + dx * .19 : x;
      item.y = unsettled ? item.y + dy * .19 : y;
      positionCard(item, item.x, item.y);
      moving ||= unsettled;
    }
    if (moving) queueMotion();
  }

  function updateArtworkGeometry() {
    const { width, height } = artwork.viewBox.baseVal;
    if (!artwork.clientWidth || !artwork.clientHeight) return;
    scaleX = width / artwork.clientWidth;
    scaleY = height / artwork.clientHeight;
    artwork.style.setProperty("--pin-correction", (scaleY / scaleX).toFixed(3));

    if (!canFloat()) {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      pointerX = pointerY = 0;
      liftActive = false;
      for (const item of cards) {
        item.x = item.y = 0;
        positionCard(item, 0, 0);
      }
    } else {
      for (const item of cards) positionCard(item, item.x, item.y);
      queueMotion();
    }
  }

  function highlight(link) {
    if (!link || link === active) return;
    active.classList.remove("is-active");
    lines.get(active.hash.slice(1))?.classList.remove("is-active");
    link.classList.add("is-active");
    lines.get(link.hash.slice(1))?.classList.add("is-active");
    active = link;
    queueMotion();
  }

  function cancelTravel() {
    clearTimeout(departure);
    clearTimeout(resetCamera);
    world.classList.remove("is-zoomed");
  }

  function visit(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
        event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.currentTarget;
    const destination = document.getElementById(link.hash.slice(1));
    if (!destination) return;

    event.preventDefault();
    cancelTravel();
    highlight(link);

    const arrive = () => {
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      destination.focus({ preventScroll: true });
      destination.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "instant" : "smooth" });
      resetCamera = setTimeout(() => world.classList.remove("is-zoomed"), 580);
    };

    if (reduceMotion.matches || stackedMap.matches) {
      arrive();
    } else {
      // Keep the artwork, connector and photo card registered during the zoom.
      world.style.setProperty("--camera-x", link.style.getPropertyValue("--pin-x"));
      world.style.setProperty("--camera-y", link.style.getPropertyValue("--pin-y"));
      world.classList.add("is-zoomed");
      departure = setTimeout(arrive, 165);
    }
  }

  function syncLocation() {
    cancelTravel();
    highlight(links.find((link) => link.hash === location.hash) || links[0]);
  }

  for (const link of links) {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") highlight(link);
    });
    link.addEventListener("focus", () => {
      liftActive = true;
      highlight(link);
      queueMotion();
    });
    link.addEventListener("blur", () => {
      liftActive = false;
      queueMotion();
    });
    link.addEventListener("click", visit);
  }
  map.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !canFloat()) return;
    const bounds = map.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, 2 * (event.clientX - bounds.left) / bounds.width - 1));
    pointerY = Math.max(-1, Math.min(1, 2 * (event.clientY - bounds.top) / bounds.height - 1));
    liftActive = true;
    queueMotion();
  }, { passive: true });
  map.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
    liftActive = false;
    queueMotion();
  });
  new ResizeObserver(updateArtworkGeometry).observe(artwork);
  for (const mode of [reduceMotion, stackedMap, finePointer]) {
    mode.addEventListener("change", updateArtworkGeometry);
  }
  window.addEventListener("hashchange", syncLocation);
  syncLocation();
  updateArtworkGeometry();
})();
