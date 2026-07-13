(() => {
  const FRAME_COUNT = 150;
  const forceMotion = new URLSearchParams(window.location.search).has("motion");
  if (forceMotion) document.documentElement.classList.add("force-motion");
  const canvas = document.querySelector("#sequence");
  const context = canvas.getContext("2d", { alpha: false });
  const loading = document.querySelector(".load-ui");
  const loadFill = document.querySelector(".load-fill");
  const loadValue = document.querySelector(".load-value");
  const counter = document.querySelector(".frame-counter");
  const images = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);
  const playhead = { frame: 0 };
  const menuButton = document.querySelector(".menu-toggle");
  const menuPanel = document.querySelector(".menu-panel");
  const menuLinks = Array.from(document.querySelectorAll(".menu-link"));
  let menuOpen = false;
  let menuTimeline;
  let loadedCount = 0;
  let lastFrame = -1;

  function framePath(index) {
    return `./frames/frame-${String(index).padStart(3, "0")}.webp`;
  }

  function sizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    renderFrame(Math.round(playhead.frame), true);
  }

  function drawCover(image) {
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let width;
    let height;
    let x;
    let y;

    if (imageRatio > canvasRatio) {
      height = canvas.height;
      width = height * imageRatio;
      x = (canvas.width - width) / 2;
      y = 0;
    } else {
      width = canvas.width;
      height = width / imageRatio;
      x = 0;
      y = (canvas.height - height) / 2;
    }

    context.drawImage(image, x, y, width, height);
  }

  function nearestLoaded(index) {
    if (loaded[index]) return index;
    for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
      const before = index - distance;
      const after = index + distance;
      if (before >= 0 && loaded[before]) return before;
      if (after < FRAME_COUNT && loaded[after]) return after;
    }
    return -1;
  }

  function renderFrame(index, force = false) {
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index));
    const drawable = nearestLoaded(clamped);
    if (drawable < 0 || (!force && drawable === lastFrame)) return;
    lastFrame = drawable;
    drawCover(images[drawable]);
    counter.textContent = `${String(clamped).padStart(3, "0")} / 149`;
  }

  function updateLoading() {
    const progress = Math.round((loadedCount / FRAME_COUNT) * 100);
    loadFill.style.width = `${progress}%`;
    loadValue.textContent = `${progress}%`;
    if (loadedCount === FRAME_COUNT) {
      loading.setAttribute("data-ready", "true");
      window.setTimeout(() => {
        loading.style.opacity = "0";
        loading.style.pointerEvents = "none";
      }, 500);
    }
  }

  function loadFrame(index) {
    return new Promise((resolve) => {
      const image = new Image();
      images[index] = image;
      image.decoding = "async";
      image.onload = () => {
        loaded[index] = true;
        loadedCount += 1;
        updateLoading();
        if (index === 0 || lastFrame < 0) renderFrame(Math.round(playhead.frame), true);
        resolve();
      };
      image.onerror = resolve;
      image.src = framePath(index);
    });
  }

  async function preload() {
    await Promise.all(Array.from({ length: 10 }, (_, index) => loadFrame(index)));
    const remainder = Array.from({ length: FRAME_COUNT - 10 }, (_, index) => index + 10);
    await Promise.all(remainder.map(loadFrame));
  }

  function initMotion() {
    if (!window.gsap || !window.ScrollTrigger) {
      document.body.classList.add("motion-unavailable");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    menuTimeline = gsap.timeline({ paused: true })
      .set(menuPanel, { visibility: "visible" })
      .to(menuPanel, { opacity: 1, duration: 0.32, ease: "power2.out" }, 0)
      .to([".intro-copy", ".reveal-copy"], { opacity: 0, yPercent: -8, duration: 0.22, ease: "power2.out" }, 0)
      .to([".scroll-hint", ".frame-counter", ".load-ui"], { opacity: 0, duration: 0.18, ease: "power2.out" }, 0)
      .to(".menu-icon-line-a", { rotate: 45, top: 7, duration: 0.34, ease: "power3.inOut" }, 0)
      .to(".menu-icon-line-b", { rotate: -45, top: 7, duration: 0.34, ease: "power3.inOut" }, 0)
      .to(".menu-label-open", { yPercent: -120, duration: 0.28, ease: "power3.inOut" }, 0)
      .to(".menu-label-close", { yPercent: -120, duration: 0.28, ease: "power3.inOut" }, 0)
      .fromTo(menuLinks[0], { xPercent: -70, yPercent: -170, scale: 0.34, opacity: 0, filter: "blur(8px)" }, { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.72, ease: "power4.out" }, 0.12)
      .fromTo(menuLinks[1], { xPercent: 68, yPercent: -10, scale: 0.34, opacity: 0, filter: "blur(8px)" }, { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.72, ease: "power4.out" }, 0.2)
      .fromTo(menuLinks[2], { xPercent: -55, yPercent: 170, scale: 0.34, opacity: 0, filter: "blur(8px)" }, { xPercent: 0, yPercent: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.72, ease: "power4.out" }, 0.28)
      .to(".menu-meta", { opacity: 0.62, duration: 0.4, ease: "power2.out" }, 0.5);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceMotion;
    if (reduced) {
      playhead.frame = FRAME_COUNT - 1;
      renderFrame(playhead.frame, true);
      return;
    }

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.35,
        invalidateOnRefresh: true,
      },
    });

    timeline
      .to(playhead, {
        frame: FRAME_COUNT - 1,
        duration: 0.78,
        snap: "frame",
        onUpdate: () => renderFrame(Math.round(playhead.frame)),
      }, 0)
      .to(".intro-copy", { yPercent: -30, opacity: 0, duration: 0.2 }, 0.2)
      .to(".scroll-hint", { opacity: 0, duration: 0.08 }, 0.1)
      .to(".media-wash", { opacity: 0.12, duration: 0.4 }, 0.34)
      .to(".media-frame", {
        scaleX: 0.74,
        scaleY: 0.68,
        yPercent: 3.5,
        borderRadius: "20px",
        duration: 0.28,
      }, 0.62)
      .to(".media-vignette", { opacity: 0.35, duration: 0.2 }, 0.65)
      .to(".reveal-copy", { yPercent: -20, opacity: 1, duration: 0.22 }, 0.75);
  }

  function setMenu(open) {
    menuOpen = open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    menuPanel.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);

    if (menuTimeline) {
      if (open) menuTimeline.timeScale(1).play();
      else menuTimeline.timeScale(1.25).reverse();
      return;
    }

    menuPanel.style.visibility = open ? "visible" : "hidden";
    menuPanel.style.opacity = open ? "1" : "0";
  }

  menuButton.addEventListener("click", () => setMenu(!menuOpen));
  menuLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuOpen) setMenu(false);
  });

  window.addEventListener("resize", sizeCanvas, { passive: true });
  sizeCanvas();
  initMotion();
  preload();
})();
