(() => {
  const map = document.querySelector(".campus-map");
  if (!map) return;

  const world = map.querySelector(".campus-world");
  const links = [...map.querySelectorAll(".campus-landmark")];
  const artwork = map.querySelector(".campus-lines");
  const orbitToggle = map.querySelector(".campus-orbit-toggle");
  const ring = { x: 1084, y: 484, rx: 416, ry: 285 };
  const turn = Math.PI * 2;
  const lapDuration = 240_000;
  const lines = new Map([...artwork.querySelectorAll("[data-landmark]")]
    .map((line) => [line.dataset.landmark, line]));
  const cards = links.map((link) => {
    const points = lines.get(link.hash.slice(1)).querySelector("polyline").points;
    const start = points.getItem(0);
    const elbow = points.getItem(1);
    return {
      card: link.querySelector(".campus-card"),
      start, elbow, end: points.getItem(2),
      base: { x: start.x, y: start.y, elbowX: elbow.x, elbowY: elbow.y },
      angle: Math.atan2((start.y - ring.y) / ring.ry, (start.x - ring.x) / ring.rx),
    };
  });
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const stackedMap = matchMedia("(max-width: 970px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let active = links[0];
  let hovered;
  let focused;
  let manuallyPaused = false;
  let mapVisible = true;
  let traveling = false;
  let departure;
  let resetCamera;
  let frame;
  let lastTick;
  let phase = 0;
  let scaleX = 1;
  let scaleY = 1;

  function canOrbit() {
    return !reduceMotion.matches && !stackedMap.matches && finePointer.matches;
  }

  function paintOrbit(moving) {
    for (const item of cards) {
      const { base, start, elbow, end } = item;
      const angle = item.angle + phase;
      const x = moving ? ring.x + ring.rx * Math.cos(angle) : base.x;
      const y = moving ? ring.y + ring.ry * Math.sin(angle) : base.y;
      item.card.style.setProperty("--card-x", `${((x - base.x) / scaleX).toFixed(2)}px`);
      item.card.style.setProperty("--card-y", `${((y - base.y) / scaleY).toFixed(2)}px`);
      // Move the leader's card end and bend, without ever moving the building end.
      start.x = x;
      start.y = y;
      elbow.x = moving ? x + (end.x - x) * .58 : base.elbowX;
      elbow.y = moving ? y + (end.y - y) * .44 : base.elbowY;
    }
  }

  function updateOrbit() {
    const allowed = canOrbit();
    const inspecting = Boolean(hovered || focused);
    map.classList.toggle("is-inspecting", allowed && inspecting);
    if (allowed && !manuallyPaused && !inspecting && !traveling &&
        mapVisible && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(advanceOrbit);
    } else {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      lastTick = undefined;
    }
  }

  function advanceOrbit(now) {
    frame = null;
    if (lastTick !== undefined) {
      phase = (phase + (now - lastTick) * turn / lapDuration) % turn;
      paintOrbit(true);
    }
    lastTick = now;
    updateOrbit();
  }

  function updateArtworkGeometry() {
    const { width, height } = artwork.viewBox.baseVal;
    if (!artwork.clientWidth || !artwork.clientHeight) return;
    scaleX = width / artwork.clientWidth;
    scaleY = height / artwork.clientHeight;
    artwork.style.setProperty("--pin-correction", (scaleY / scaleX).toFixed(3));

    const allowed = canOrbit();
    if (!allowed) phase = 0;
    orbitToggle.hidden = !allowed;
    map.classList.toggle("has-orbit", allowed);
    paintOrbit(allowed && phase !== 0);
    updateOrbit();
  }

  function highlight(link) {
    if (!link || link === active) return;
    active.classList.remove("is-active");
    lines.get(active.hash.slice(1))?.classList.remove("is-active");
    link.classList.add("is-active");
    lines.get(link.hash.slice(1))?.classList.add("is-active");
    active = link;
  }

  function cancelTravel() {
    clearTimeout(departure);
    clearTimeout(resetCamera);
    world.classList.remove("is-zoomed");
    traveling = false;
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
      if (traveling) {
        resetCamera = setTimeout(() => {
          traveling = false;
          world.classList.remove("is-zoomed");
          updateOrbit();
        }, 580);
      }
    };

    if (reduceMotion.matches || stackedMap.matches) {
      arrive();
    } else {
      traveling = true;
      updateOrbit();
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
    updateOrbit();
  }

  for (const link of links) {
    link.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "mouse") return;
      hovered = link;
      highlight(link);
      updateOrbit();
    });
    link.addEventListener("pointerleave", () => {
      if (hovered === link) hovered = undefined;
      updateOrbit();
    });
    link.addEventListener("focus", () => {
      focused = link;
      highlight(link);
      updateOrbit();
    });
    link.addEventListener("blur", () => {
      if (focused === link) focused = undefined;
      updateOrbit();
    });
    link.addEventListener("click", visit);
  }
  orbitToggle.addEventListener("click", () => {
    manuallyPaused = !manuallyPaused;
    orbitToggle.classList.toggle("is-paused", manuallyPaused);
    const label = manuallyPaused ? "Resume card motion" : "Pause card motion";
    orbitToggle.title = label;
    orbitToggle.setAttribute("aria-label", label);
    updateOrbit();
  });
  document.addEventListener("visibilitychange", updateOrbit);
  new IntersectionObserver(([entry]) => {
    mapVisible = entry.isIntersecting;
    updateOrbit();
  }).observe(map);
  new ResizeObserver(updateArtworkGeometry).observe(artwork);
  for (const mode of [reduceMotion, stackedMap, finePointer]) {
    mode.addEventListener("change", updateArtworkGeometry);
  }
  window.addEventListener("hashchange", syncLocation);
  updateArtworkGeometry();
  syncLocation();
})();
