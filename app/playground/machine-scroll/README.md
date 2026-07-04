# machine-scroll (motion prototype)

Isolated scroll-controlled camera prototype. Not part of the homepage. No
branding, typography, navigation, or decorative UI — just the motion system.

Route: `/playground/machine-scroll`

## What it does

Treats the keyframes as key visual states of **one continuous camera move**.
As you scroll, the scene is pinned and scroll progress is mapped across the
frames. Adjacent frames crossfade while a shared camera transform (scale, x, y)
is interpolated, so the sequence reads as the camera gradually pulling backward
while the machine changes viewing angle. The machine's ground baseline stays
fixed (bottom-center transform origin + bottom-aligned, baseline-consistent
frames). No SVG morphing and no synthetic in-between frames are generated.

Behaviour:

- All frames are preloaded/decoded before anything shows, to avoid flicker.
- Fully responsive; re-initialises on resize via `gsap.matchMedia`.
- Respects `prefers-reduced-motion: reduce` — no pin, no scroll-jacking; a
  single static frame is shown instead.

## Swapping in the real renders

1. Put your images in `public/machine-frames/` (any raster format).
2. Edit `frames.ts` — point each `src` at your files, keep them ordered from
   the first camera state to the last, and tune `scale` / `x` / `y` per frame.

The placeholder SVGs currently in `public/machine-frames/` are scaffolding —
replace them. For a stable baseline, author every render so the machine's
contact-with-ground line sits at the same vertical fraction of the image
(the placeholders use 88% from the top).

Frame count is driven entirely by the `FRAMES` array length — add or remove
entries and the pinning, mapping, and crossfade all adjust automatically.
