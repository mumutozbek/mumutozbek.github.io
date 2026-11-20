(() => {
  const map = document.querySelector(".campus-map");
  if (!map) return;

  const world = map.querySelector(".campus-world");
  const links = [...map.querySelectorAll(".campus-landmark")];
  const lines = new Map([...map.querySelectorAll("[data-landmark]")]
    .map((line) => [line.dataset.landmark, line]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const stackedMap = matchMedia("(max-width: 970px)");
  let active = links[0];
  let departure;
  let resetCamera;

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
    link.addEventListener("focus", () => highlight(link));
    link.addEventListener("click", visit);
  }
  window.addEventListener("hashchange", syncLocation);
  syncLocation();
})();
