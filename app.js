(() => {
  const forceMotion = new URLSearchParams(window.location.search).has("motion");
  if (forceMotion) document.documentElement.classList.add("force-motion");

  const progressValue = document.querySelector(".progress-value");

  if (!window.gsap || !window.ScrollTrigger) {
    document.body.classList.add("motion-unavailable");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const designWord = document.querySelector(".meaning-copy-left .meaning-word");
  const designDescription = document.querySelector(".meaning-copy-left .meaning-description");
  const engineeringWord = document.querySelector(".meaning-copy-right .meaning-word");
  const engineeringDescription = document.querySelector(".meaning-copy-right .meaning-description");

  const alignMeaningCopy = () => {
    if (designWord && designDescription) {
      designDescription.style.width = `${Math.min(designWord.offsetWidth, 280)}px`;
    }

    if (!engineeringWord || !engineeringDescription) return;
    const wordWidth = engineeringWord.offsetWidth;
    const columnWidth = Math.round(wordWidth * 0.94);
    engineeringDescription.style.width = `${columnWidth}px`;
    engineeringDescription.style.marginRight = `${wordWidth - columnWidth}px`;
  };

  alignMeaningCopy();
  window.addEventListener("resize", alignMeaningCopy);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceMotion;
  if (reduced) return;

  const timeline = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".motion",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.45,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progressValue.textContent = String(Math.round(self.progress * 100)).padStart(2, "0");
      },
    },
  });

  timeline
    .to(".progress-track i", { scaleX: 1, duration: 1 }, 0)
    .to(".intro-title", {
      scale: 0.97,
      yPercent: -2,
      duration: 0.08,
    }, 0.08)
    .to([".color-field-red", ".intro"], {
      clipPath: "inset(0% 49.1% 0% 49.1%)",
      duration: 0.26,
      ease: "power3.inOut",
    }, 0.08)
    .to(".nav", {
      color: "#321013",
      duration: 0.1,
    }, 0.14)
    .to(".nav-brand img", {
      filter: "brightness(0) saturate(100%)",
      duration: 0.1,
    }, 0.14)
    .to(".meaning-copy", {
      opacity: 1,
      duration: 0.14,
      ease: "power3.out",
    }, 0.18)
    .set(".connector", { opacity: 1 }, 0.3)
    .to([".color-field-red", ".intro"], { opacity: 0, duration: 0.025 }, 0.325)
    .to(".connector", {
      rotation: -3,
      duration: 0.12,
      ease: "power3.inOut",
    }, 0.36)
    .to(".connector-bar", {
      scaleY: 0.96,
      duration: 0.12,
      ease: "power3.inOut",
    }, 0.36)
    .to(".connector", {
      rotation: -24,
      duration: 0.14,
      ease: "power4.inOut",
    }, 0.46)
    .to(".connector-bar", {
      scaleY: 0.65,
      duration: 0.14,
      ease: "power4.inOut",
    }, 0.46)
    .to(".connector", {
      rotation: -68,
      duration: 0.15,
      ease: "power4.inOut",
    }, 0.56)
    .to(".connector-bar", {
      scaleY: 0.42,
      duration: 0.15,
      ease: "power4.inOut",
    }, 0.56)
    .to(".connector", {
      rotation: -90,
      y: -42,
      duration: 0.13,
      ease: "power4.inOut",
    }, 0.66)
    .to(".connector-bar", {
      scaleY: 0.38,
      backgroundColor: "#ee1b2f",
      duration: 0.13,
      ease: "power4.inOut",
    }, 0.66)
    .to(".meaning-copy-left", {
      scale: 0.74,
      x: () => window.innerWidth <= 760 ? "6.35vw" : "8.95vw",
      duration: 0.22,
      ease: "power3.inOut",
    }, 0.72)
    .to(".meaning-copy-right", {
      scale: 0.74,
      x: () => window.innerWidth <= 760 ? "-5.65vw" : "-8.05vw",
      duration: 0.22,
      ease: "power3.inOut",
    }, 0.72)
    .to(".connector-bar", {
      scaleY: 0.14,
      duration: 0.16,
      ease: "power3.inOut",
    }, 0.72)
    .to(".connector-bar", {
      scaleY: 0.012,
      duration: 0.1,
      ease: "power3.inOut",
    }, 0.86)
    .to(".connector", { opacity: 0, duration: 0.06 }, 0.93)
    .to(".meaning-copy-left", {
      scale: 0.82,
      x: () => window.innerWidth <= 760 ? "15vw" : "27.25vw",
      y: "2vh",
      duration: 0.16,
      ease: "power3.inOut",
    }, 0.99)
    .to(".meaning-copy-right", {
      scale: 0.82,
      x: () => window.innerWidth <= 760 ? "-9vw" : "-15.75vw",
      y: "-2vh",
      duration: 0.16,
      ease: "power3.inOut",
    }, 0.99)
    .to(".meaning-ampersand", {
      opacity: 1,
      scale: 1,
      duration: 0.1,
      ease: "power3.out",
    }, 1.03)
    .set(".split-reveal", { visibility: "visible" }, 1.17)
    .to(".split-image-left", {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.4,
      ease: "power3.inOut",
    }, 1.17)
    .to(".split-image-right", {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 0.4,
      ease: "power3.inOut",
    }, 1.17)
    .to([".meaning-copy", ".meaning-ampersand"], {
      opacity: 0,
      duration: 0.14,
      ease: "power2.inOut",
    }, 1.24)
    .to(".split-image img", {
      scale: 1,
      duration: 0.42,
      ease: "power2.out",
    }, 1.17)
    .to(".nav", {
      color: "#ffffff",
      mixBlendMode: "difference",
      duration: 0.12,
    }, 1.39)
    .to(".nav-brand img", {
      filter: "brightness(0) invert(1)",
      duration: 0.12,
    }, 1.39);
})();
