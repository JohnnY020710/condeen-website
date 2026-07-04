"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAMES } from "./frames";
import styles from "./MachineScroll.module.css";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// Smoothstep — softens the crossfade so adjacent frames don't sit at a flat
// 50/50 blend through the middle of each segment.
const smooth = (t: number) => t * t * (3 - 2 * t);

export default function MachineScroll() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const frameRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [ready, setReady] = useState(false);

  // Preload + decode every frame before anything is shown, to avoid flicker.
  useEffect(() => {
    let alive = true;
    Promise.all(
      FRAMES.map(
        (f) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = f.src;
          }),
      ),
    ).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera) return;

    gsap.registerPlugin(ScrollTrigger);

    const frames = frameRefs.current;
    const segments = FRAMES.length - 1;

    // Map a 0..1 progress onto the keyframes: crossfade the active pair and
    // interpolate the shared camera transform (scale/x/y). transform-origin is
    // bottom-center (CSS), so scaling keeps the machine's ground baseline fixed.
    const render = (progress: number) => {
      const p = clamp01(progress);

      if (segments <= 0) {
        frames.forEach((el, i) => {
          if (el) el.style.opacity = i === 0 ? "1" : "0";
        });
        return;
      }

      const scaled = p * segments;
      let i = Math.floor(scaled);
      if (i >= segments) i = segments - 1;
      const t = scaled - i;
      const te = smooth(t);

      for (let k = 0; k < frames.length; k++) {
        const el = frames[k];
        if (!el) continue;
        el.style.opacity = k === i ? String(1 - te) : k === i + 1 ? String(te) : "0";
      }

      const a = FRAMES[i];
      const b = FRAMES[i + 1];
      const s = lerp(a.scale, b.scale, te);
      const x = lerp(a.x, b.x, te);
      const y = lerp(a.y, b.y, te);
      camera.style.transform = `translate3d(${x}vh, ${y}vh, 0) scale(${s})`;
    };

    const setStatic = () => {
      // Reduced-motion fallback: one settled frame, no camera transform.
      const last = FRAMES.length - 1;
      frames.forEach((el, i) => {
        if (el) el.style.opacity = i === last ? "1" : "0";
      });
      camera.style.transform = "none";
    };

    // matchMedia handles both the reduced-motion branch and responsive
    // re-initialisation (it re-runs its callbacks and refreshes ScrollTrigger
    // on resize / orientation change), and reverts everything on cleanup.
    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduce } = ctx.conditions as { motion: boolean; reduce: boolean };

        if (reduce) {
          setStatic();
          return;
        }

        render(0);
        const st = ScrollTrigger.create({
          trigger: scene,
          start: "top top",
          end: () => "+=" + FRAMES.length * window.innerHeight,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => render(self.progress),
        });

        return () => st.kill();
      },
    );

    return () => mm.revert();
  }, [ready]);

  return (
    <div className={styles.root}>
      <div
        ref={sceneRef}
        className={`${styles.scene} ${ready ? "" : styles.loading}`}
      >
        <div ref={cameraRef} className={styles.camera}>
          {FRAMES.map((f, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={f.src}
              ref={(el) => {
                frameRefs.current[i] = el;
              }}
              className={styles.frame}
              src={f.src}
              alt={f.alt}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
