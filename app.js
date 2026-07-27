import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const canvas = document.querySelector("#scene");
const shell = document.querySelector(".scene-shell");
const loading = document.querySelector("#loading");
const loadingProgress = document.querySelector("#loading-progress");
const loadingValue = document.querySelector("#loading-value");
const flipDisplay = document.querySelector("#flip-display");
const flipStage = document.querySelector("#flip-stage");

const flipWords = ["CONNECTING", "DESIGN", "ENGINEERING"];
const flipCardCount = Math.max(...flipWords.map((word) => word.length));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const forceMotion = new URLSearchParams(window.location.search).get("motion") === "1";

function getWordSlots(word) {
  const slots = Array(flipCardCount).fill(" ");
  const start = Math.floor((flipCardCount - word.length) / 2);
  [...word].forEach((character, index) => {
    slots[start + index] = character;
  });
  return slots;
}

function createGlyph(className) {
  const face = document.createElement("span");
  face.className = className;
  const glyph = document.createElement("span");
  glyph.className = "flip-glyph";
  face.append(glyph);
  return { face, glyph };
}

const flipCards = Array.from({ length: flipCardCount }, () => {
  const card = document.createElement("span");
  card.className = "flip-card";

  const top = createGlyph("flip-half flip-half--top");
  const bottom = createGlyph("flip-half flip-half--bottom");
  const flap = document.createElement("span");
  flap.className = "flip-flap";
  const flapFront = createGlyph("flip-flap-face flip-flap-face--front");
  const flapBack = createGlyph("flip-flap-face flip-flap-face--back");

  flap.append(flapFront.face, flapBack.face);
  card.append(top.face, bottom.face, flap);
  flipStage.append(card);

  return {
    card,
    flap,
    top: top.glyph,
    bottom: bottom.glyph,
    front: flapFront.glyph,
    back: flapBack.glyph,
    character: " ",
  };
});

function setCardCharacter(card, character) {
  card.character = character;
  card.top.textContent = character;
  card.bottom.textContent = character;
  card.front.textContent = character;
  card.back.textContent = character;
}

function prepareCardFlip(card, character) {
  card.top.textContent = character;
  card.front.textContent = card.character;
  card.back.textContent = character;
}

function finishCardFlip(card, character) {
  card.character = character;
  card.top.textContent = character;
  card.bottom.textContent = character;
  card.front.textContent = character;
  card.back.textContent = character;
  window.gsap.set(card.flap, { rotationX: 0 });
}

function resetFlipDisplay(showInitialWord = true) {
  const characters = showInitialWord
    ? getWordSlots(flipWords[0])
    : Array(flipCardCount).fill(" ");
  flipCards.forEach((card, index) => setCardCharacter(card, characters[index]));
  if (window.gsap) window.gsap.set(flipCards.map((card) => card.flap), { rotationX: 0 });
  flipDisplay.setAttribute("aria-label", showInitialWord ? flipWords[0] : "");
}

const flipAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const flipStepDuration = 0.13;
const flipStepCount = 5;
const flipStagger = 0.08;

function getScrambleCharacter(cardIndex, stepIndex, transitionIndex) {
  const alphabetIndex = (cardIndex * 7 + stepIndex * 11 + transitionIndex * 5) % flipAlphabet.length;
  return flipAlphabet[alphabetIndex];
}

function scheduleBoardTransition(
  timeline,
  fromCharacters,
  toCharacters,
  startTime,
  transitionIndex,
) {
  let transitionEnd = startTime;

  flipCards.forEach((card, cardIndex) => {
    if (fromCharacters[cardIndex] === toCharacters[cardIndex]) return;

    const cardStart = startTime + cardIndex * flipStagger;
    for (let stepIndex = 0; stepIndex < flipStepCount; stepIndex += 1) {
      const character =
        stepIndex === flipStepCount - 1
          ? toCharacters[cardIndex]
          : getScrambleCharacter(cardIndex, stepIndex, transitionIndex);
      const stepStart = cardStart + stepIndex * flipStepDuration;

      timeline.call(() => prepareCardFlip(card, character), [], stepStart);
      timeline.to(
        card.flap,
        {
          rotationX: -180,
          duration: flipStepDuration,
          ease: "power1.inOut",
        },
        stepStart,
      );
      timeline.call(
        () => finishCardFlip(card, character),
        [],
        stepStart + flipStepDuration,
      );
    }

    transitionEnd = Math.max(
      transitionEnd,
      cardStart + flipStepCount * flipStepDuration,
    );
  });

  return transitionEnd;
}

function createFlipTimeline() {
  if (!window.gsap || (prefersReducedMotion.matches && !forceMotion)) return null;

  const timeline = window.gsap.timeline({ paused: true });
  const blankCharacters = Array(flipCardCount).fill(" ");
  const initialCharacters = getWordSlots(flipWords[0]);
  let cursor = 0.18;

  cursor = scheduleBoardTransition(
    timeline,
    blankCharacters,
    initialCharacters,
    cursor,
    0,
  );
  timeline.call(
    () => flipDisplay.setAttribute("aria-label", flipWords[0]),
    [],
    cursor,
  );
  cursor += 0.8;
  timeline.addLabel("wordLoop", cursor);

  flipWords.forEach((word, index) => {
    const incomingIndex = (index + 1) % flipWords.length;
    const outgoingCharacters = getWordSlots(word);
    const incomingCharacters = getWordSlots(flipWords[incomingIndex]);

    const transitionEnd = scheduleBoardTransition(
      timeline,
      outgoingCharacters,
      incomingCharacters,
      cursor,
      index + 1,
    );
    timeline.call(
      () => flipDisplay.setAttribute("aria-label", flipWords[incomingIndex]),
      [],
      transitionEnd,
    );
    cursor = transitionEnd + 0.8;
  });

  timeline.eventCallback("onComplete", () => timeline.play("wordLoop"));

  return timeline;
}

const flipTimeline = createFlipTimeline();
resetFlipDisplay(!flipTimeline);
let flipFocusActive = false;

function setFlipFocus(active) {
  if (active === flipFocusActive) return;
  flipFocusActive = active;
  flipDisplay.setAttribute("aria-hidden", active ? "false" : "true");

  if (!flipTimeline) {
    resetFlipDisplay(true);
    return;
  }

  if (active) {
    resetFlipDisplay(false);
    flipTimeline.restart(true);
  } else {
    flipTimeline.pause(0);
    resetFlipDisplay(false);
  }
}

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x070909, 0.055);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(4.8, 2.2, 6.2);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x070909, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.enableZoom = false;
controls.minDistance = 3.7;
controls.maxDistance = 10;
controls.minPolarAngle = Math.PI / 2 - THREE.MathUtils.degToRad(45);
controls.maxPolarAngle = Math.PI / 2 - THREE.MathUtils.degToRad(1);
controls.autoRotate = false;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight(0xd9f4ee, 0x111514, 1.25));

const keyLight = new THREE.DirectionalLight(0xffffff, 4.2);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x7da8ff, 1.15);
fillLight.position.set(-5, 2, 3);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0x00d3b6, 34, 14, 1.4);
rimLight.position.set(-3.8, 2.4, -3);
scene.add(rimLight);

const modelRoot = new THREE.Group();
scene.add(modelRoot);

const modelMaterial = new THREE.MeshStandardMaterial({
  color: 0xc8cfcc,
  roughness: 0.34,
  metalness: 0.72,
  side: THREE.DoubleSide,
  transparent: true,
});

const knotMaterial = new THREE.MeshStandardMaterial({
  color: 0x8fffdf,
  emissive: 0x063c33,
  emissiveIntensity: 0.85,
  roughness: 0.24,
  metalness: 0.22,
  side: THREE.DoubleSide,
  depthTest: true,
});

const knotRoot = new THREE.Group();
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.92, 0.27, 220, 32, 2, 3),
  knotMaterial,
);
knot.rotation.x = -0.24;
knotRoot.add(knot);
knotRoot.scale.setScalar(0.23);
knotRoot.position.set(0, -0.08, 0.1);
scene.add(knotRoot);

function centerAndFit(object, targetSize = 4.4) {
  const initialBox = new THREE.Box3().setFromObject(object);
  const size = initialBox.getSize(new THREE.Vector3());
  const center = initialBox.getCenter(new THREE.Vector3());
  const largestSide = Math.max(size.x, size.y, size.z) || 1;

  object.position.sub(center);
  object.scale.setScalar(targetSize / largestSide);

  const fittedBox = new THREE.Box3().setFromObject(object);
  const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
  object.position.sub(fittedCenter);
}

function updateLoading(percent) {
  const rounded = Math.round(percent);
  loadingProgress.style.width = `${rounded}%`;
  loadingValue.textContent = `${rounded}%`;
}

const loader = new OBJLoader();
loader.load(
  "./assets/condeen-model.obj",
  (object) => {
    object.traverse((child) => {
      if (!child.isMesh) return;
      child.material = modelMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
      child.geometry.computeVertexNormals();
    });

    centerAndFit(object);
    modelRoot.add(object);
    updateLoading(100);
    window.setTimeout(() => loading.classList.add("is-complete"), 260);
    window.ScrollTrigger?.refresh();
  },
  (event) => {
    if (event.total) updateLoading((event.loaded / event.total) * 100);
  },
  (error) => {
    loading.querySelector(".loading-label").textContent = "MODEL LOAD ERROR";
    console.error("Unable to load the OBJ model", error);
  },
);

function resize() {
  const width = shell.clientWidth;
  const height = shell.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

new ResizeObserver(resize).observe(shell);
resize();

let userIsInteracting = false;
controls.addEventListener("start", () => {
  userIsInteracting = true;
});

const cameraTarget = new THREE.Vector3(0, -0.08, 0.1);
// The pavilion has its unobstructed opening on the -X face.
const frontCamera = new THREE.Vector3(-7.15, 0.62, 0.1);
const interiorCamera = new THREE.Vector3(-2.55, 0.16, 0.1);
const transitionCamera = new THREE.Vector3();
const transitionOffset = new THREE.Vector3();
const transitionSpherical = new THREE.Spherical();
const frontSpherical = new THREE.Spherical().setFromVector3(
  frontCamera.clone().sub(cameraTarget),
);
const INTERACTION_END = 0.12;
const INTERACTION_RESET = 0.11;
let capturedRadius = camera.position.distanceTo(cameraTarget);
let capturedPhi = 0;
let capturedTheta = 0;
let capturedThetaDelta = 0;
let transitionCaptured = false;
let targetScrollProgress = 0;
let scrollProgress = 0;

controls.target.copy(cameraTarget);

function captureTransitionCamera() {
  transitionOffset.copy(camera.position).sub(cameraTarget);
  transitionSpherical.setFromVector3(transitionOffset);
  capturedRadius = transitionSpherical.radius;
  capturedPhi = transitionSpherical.phi;
  capturedTheta = transitionSpherical.theta;
  capturedThetaDelta = Math.atan2(
    Math.sin(frontSpherical.theta - capturedTheta),
    Math.cos(frontSpherical.theta - capturedTheta),
  );
  transitionCaptured = true;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(from, to, value) {
  const normalized = clamp01((value - from) / (to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function updateScrollProgress(progress) {
  const nextProgress = clamp01(progress);

  if (nextProgress >= INTERACTION_END && !transitionCaptured) {
    captureTransitionCamera();
  }

  targetScrollProgress = nextProgress;
}

if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.ScrollTrigger.create({
    trigger: ".experience",
    start: "top top",
    end: "bottom bottom",
    onUpdate: (self) => updateScrollProgress(self.progress),
  });
} else {
  const updateFromWindow = () => {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    updateScrollProgress(maximum > 0 ? window.scrollY / maximum : 0);
  };
  window.addEventListener("scroll", updateFromWindow, { passive: true });
  updateFromWindow();
}

let knotDragging = false;
let knotPointerX = 0;
let knotPointerY = 0;
let knotRotationX = 0;
let knotRotationY = 0;

canvas.addEventListener("pointerdown", (event) => {
  if (scrollProgress < 0.82) return;
  knotDragging = true;
  knotPointerX = event.clientX;
  knotPointerY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!knotDragging) return;
  knotRotationY += (event.clientX - knotPointerX) * 0.008;
  knotRotationX += (event.clientY - knotPointerY) * 0.008;
  knotRotationX = THREE.MathUtils.clamp(knotRotationX, -1.15, 1.15);
  knotPointerX = event.clientX;
  knotPointerY = event.clientY;
});

function endKnotDrag(event) {
  if (!knotDragging) return;
  knotDragging = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

canvas.addEventListener("pointerup", endKnotDrag);
canvas.addEventListener("pointercancel", endKnotDrag);

window.Condeen3D = {
  camera,
  modelRoot,
  knotRoot,
  getScrollProgress: () => scrollProgress,
  getMode: () =>
    scrollProgress > 0.8
      ? "knot"
      : scrollProgress > INTERACTION_END
        ? "transition"
        : "building",
};
controls.addEventListener("end", () => {
  userIsInteracting = false;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  scrollProgress += (targetScrollProgress - scrollProgress) * 0.085;

  if (
    transitionCaptured &&
    targetScrollProgress <= INTERACTION_RESET &&
    scrollProgress <= INTERACTION_RESET
  ) {
    transitionCaptured = false;
  }

  const cameraPathProgress = smoothstep(INTERACTION_END, 0.88, scrollProgress);
  const frontProgress = smoothstep(0, 0.48, cameraPathProgress);
  const enterProgress = smoothstep(0.5, 1, cameraPathProgress);
  const knotFocus = smoothstep(0.72, 0.96, scrollProgress);
  const buildingOrbitMode = scrollProgress < INTERACTION_END && !transitionCaptured;

  controls.enabled = buildingOrbitMode;

  if (buildingOrbitMode) {
    controls.update();
  } else {
    if (!transitionCaptured) captureTransitionCamera();

    transitionSpherical.radius = THREE.MathUtils.lerp(
      capturedRadius,
      frontSpherical.radius,
      frontProgress,
    );
    transitionSpherical.phi = THREE.MathUtils.lerp(
      capturedPhi,
      frontSpherical.phi,
      frontProgress,
    );
    transitionSpherical.theta = capturedTheta + capturedThetaDelta * frontProgress;
    transitionCamera
      .setFromSpherical(transitionSpherical)
      .add(cameraTarget)
      .lerp(interiorCamera, enterProgress);
    camera.position.copy(transitionCamera);
    camera.lookAt(cameraTarget);
  }

  modelRoot.position.y = Math.sin(elapsed * 0.62) * 0.045 * (1 - cameraPathProgress);
  modelMaterial.opacity = THREE.MathUtils.lerp(1, 0.34, knotFocus);

  knotRoot.position.y = -0.08 + Math.sin(elapsed * 0.85) * 0.025;
  knotRoot.rotation.x = knotRotationX;
  knotRoot.rotation.y = knotRotationY + (knotDragging ? 0 : elapsed * 0.14);
  knotRoot.rotation.z = Math.sin(elapsed * 0.34) * 0.08;

  const knotFocusActive = scrollProgress > 0.8;
  document.body.classList.toggle("is-knot-focus", knotFocusActive);
  setFlipFocus(knotFocusActive);
  renderer.render(scene, camera);
}

animate();
