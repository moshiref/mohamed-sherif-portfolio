/**
 * Mutable, render-free bridge between GSAP timelines (DOM world) and the
 * React Three Fiber frame loop (WebGL world). GSAP tweens these numbers and
 * `useFrame` reads them every frame. Nothing here triggers a React render.
 */
export const sceneState = {
  /** 0 → 1 : lights come up from total darkness. */
  reveal: 0,
  /** 0 → 1 : the sculpture travels from the far distance to its hero position. */
  approach: 0,
  /** 0 → 1 : camera dolly and lens change that accompany the approach. */
  dolly: 0,
  /** 0 → 1 : scroll-driven exit as the visitor leaves the hero. */
  exit: 0,
  /** Normalised pointer, −1 … 1, smoothed by the pointer tracker. */
  pointer: { x: 0, y: 0 },
  /** When true the scene holds still (prefers-reduced-motion). */
  still: false,
}

export interface Composition {
  /** Screen position of the sculpture's centre, as viewport fractions. */
  focusX: number
  focusY: number
  /** Sculpture diameter as a fraction of viewport height (clamped by width). */
  size: number
}

/**
 * Where the sculpture rests once it has retreated behind the About chapter:
 * far back, tucked behind the "ME" of the title.
 */
export function getAboutComposition(width: number, height: number): Pick<Composition, 'focusX' | 'focusY'> {
  if (width < 768) return { focusX: 0.76, focusY: 0.2 }
  if (width / height <= 1.25) return { focusX: 0.76, focusY: 0.24 }
  return { focusX: 0.8, focusY: 0.3 }
}

/** Mirrors the CSS breakpoints in Hero.module.css. */
export function getComposition(width: number, height: number): Composition {
  const aspect = width / height
  // Stacked: phones and portrait tablets.
  if (width < 768) return { focusX: 0.5, focusY: 0.44, size: 0.4 }
  if (aspect <= 1.25) return { focusX: 0.5, focusY: 0.42, size: 0.46 }
  // Compact desktop / landscape tablet.
  if (width <= 1180) return { focusX: 0.69, focusY: 0.4, size: 0.58 }
  return { focusX: 0.68, focusY: 0.4, size: 0.62 }
}
