// Keyframe manifest for the scroll-controlled machine camera sequence.
//
// Each entry is one KEY VISUAL STATE of a single continuous camera move.
// The prototype crossfades between adjacent frames while interpolating a
// shared camera transform (scale / x / y) so the sequence reads as one
// camera gradually pulling backward as the machine changes viewing angle.
//
// TO USE REAL RENDERS: drop your images into `public/machine-frames/` and
// point each `src` at them (any raster format works — png/jpg/webp). Keep
// the array ORDERED from the first camera state to the last. Add or remove
// entries freely; everything downstream is driven by this array's length.
//
// Camera authoring (all relative, resolution-independent):
//   scale : zoom of the whole scene. Larger = camera closer. Decreasing
//           values across the sequence create the "pulling backward" read.
//   x, y  : translation in viewport-height units (vh). The scene is anchored
//           to a bottom-center origin, so the machine's ground baseline stays
//           put while these nudge the framing.

export type Keyframe = {
  src: string;
  alt: string;
  scale: number;
  x: number; // vh units
  y: number; // vh units
};

export const FRAMES: Keyframe[] = [
  { src: "/machine-frames/frame-01.svg", alt: "Machine keyframe 1", scale: 1.18, x: 0, y: 0 },
  { src: "/machine-frames/frame-02.svg", alt: "Machine keyframe 2", scale: 1.08, x: -1.5, y: -0.5 },
  { src: "/machine-frames/frame-03.svg", alt: "Machine keyframe 3", scale: 1.0, x: 1, y: 0 },
  { src: "/machine-frames/frame-04.svg", alt: "Machine keyframe 4", scale: 0.92, x: 2.5, y: -0.5 },
  { src: "/machine-frames/frame-05.svg", alt: "Machine keyframe 5", scale: 0.84, x: 4, y: -1 },
];
