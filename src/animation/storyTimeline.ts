import { gsap } from 'gsap'
import { sceneState } from './sceneState'

/**
 * Hero → About, as one scrubbed shot. The timeline is 10 units long and the
 * pinned scroll distance maps onto it, so positions below read as "percent of
 * the scroll / 10":
 *
 *  0.0 – 4.5  PHASE 1  Hero exit. Layers separate at different speeds: HUD and
 *                      small copy lift away first, the name splits apart and
 *                      flies past the lens, the portrait recedes into depth.
 *  0.4 – 6.4  PHASE 2  Camera travel. The 3D camera trucks and pushes in while
 *                      the sculpture retreats; a scan line draws across frame.
 *  4.9 – 9.0  PHASE 3  About reveal. The line opens into the title's aperture,
 *                      the letters converge, then copy and details settle.
 *  9.0 – 10   Hold, so the final composition rests before the pin releases.
 *
 * Every hero target here is a different element (or property) from the ones the
 * intro timeline and pointer parallax animate, so the three never fight.
 */
export const STORY_ANCHOR = 0.92

/** Viewport heights the finished About scene stays pinned while the next chapter rises over it. */
export const STORY_HANDOFF = 1

interface Options {
  /** Drop per-frame blur filters on small or touch screens. */
  lite: boolean
}

export function buildStoryTimeline(stage: HTMLElement, { lite }: Options) {
  const q = (s: string) => Array.from(stage.querySelectorAll<HTMLElement>(s))

  const hero = {
    hud: q('[data-scroll="hud"]'),
    first: q('[data-scroll="name-first"]'),
    last: q('[data-scroll="name-last"]'),
    role: q('[data-scroll="role"]'),
    tagline: q('[data-scroll="tagline"]'),
    ctas: q('[data-scroll="ctas"]'),
    portrait: q('[data-portrait]'),
  }
  const ab = {
    eyebrow: q('[data-about="eyebrow"]'),
    beam: q('[data-about="beam"]'),
    flare: q('[data-about="flare"]'),
    title: q('[data-about="title"]'),
    chars: q('[data-about="title"] [data-tchar]'),
    fade: q('[data-about="fade"]'),
    track: q('[data-about="track"]'),
    nodes: q('[data-about="node"]'),
    intro: q('[data-about="intro"]'),
    paras: q('[data-about="para"]'),
    cta: q('[data-about="cta"]'),
  }

  // ---- "Before" state of the About chapter --------------------------------
  const mid = (ab.chars.length - 1) / 2
  gsap.set(ab.beam, { scaleX: 0, autoAlpha: 0 })
  gsap.set(ab.flare, { scaleY: 0.2, autoAlpha: 0 })
  // Letters start spread out from the centre and converge as the aperture opens.
  ab.chars.forEach((c, i) => gsap.set(c, { xPercent: (i - mid) * 42 }))
  gsap.set([...ab.eyebrow, ...ab.intro], { yPercent: 110 })
  gsap.set(ab.fade, { autoAlpha: 0 })
  gsap.set(ab.track, { scaleX: 0 })
  gsap.set(ab.nodes, { autoAlpha: 0, y: 12 })
  gsap.set(ab.paras, { y: 28 })
  gsap.set(ab.cta, { autoAlpha: 0, y: 24 })
  gsap.set(hero.portrait, { filter: lite ? 'brightness(1)' : 'brightness(1) blur(0px)' })

  const tl = gsap.timeline({ defaults: { ease: 'none' } })

  // ---- PHASE 1: hero exit ----------------------------------------------------
  tl.to(hero.hud, { autoAlpha: 0, duration: 1.2, ease: 'power1.in' }, 0)
    // Small copy sinks away, deeper layers moving further, clearing the name's path.
    .to(hero.role, { y: 36, autoAlpha: 0, duration: 1.3, ease: 'power2.in' }, 0.15)
    .to(hero.tagline, { y: 52, autoAlpha: 0, duration: 1.3, ease: 'power2.in' }, 0.28)
    // CTAs sit closest to the nav, so they leave quickest and travel least.
    .to(hero.ctas, { y: 40, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 0.3)
    // The name splits: each line drifts its own way and grows as it passes the lens.
    .to(hero.first, { xPercent: -16, yPercent: -18, scale: 1.14, autoAlpha: 0, duration: 3.2, ease: 'power2.in' }, 0.6)
    .to(hero.last, { xPercent: 18, yPercent: 12, scale: 1.14, autoAlpha: 0, duration: 3.2, ease: 'power2.in' }, 0.8)
    // The portrait falls back into the set: smaller, darker, out of focus.
    .to(
      hero.portrait,
      {
        scale: 0.74,
        yPercent: -3,
        filter: lite ? 'brightness(0.2)' : 'brightness(0.2) blur(10px)',
        duration: 4.4,
        ease: 'power2.inOut',
      },
      0.3,
    )
    .to(hero.portrait, { autoAlpha: 0, duration: 1.3, ease: 'power1.in' }, 3.4)

  // ---- PHASE 2: camera travel ------------------------------------------------
  tl.to(sceneState, { exit: 1, duration: 6, ease: 'power2.inOut' }, 0.4)
    .to(ab.beam, { autoAlpha: 1, scaleX: 1, duration: 1.4, ease: 'power3.inOut' }, 3.6)
    .to(ab.flare, { autoAlpha: 1, scaleY: 1, duration: 0.9, ease: 'power2.out' }, 4.8)
    .to(ab.flare, { autoAlpha: 0, scaleY: 1.8, duration: 1.4, ease: 'power1.in' }, 5.7)
    .to(ab.beam, { autoAlpha: 0, duration: 1.2, ease: 'power1.in' }, 5.6)

  // ---- PHASE 3: About reveal -------------------------------------------------
  // Clip-path reveals use fromTo with explicit strings: browsers serialise inset()
  // in a collapsed form that GSAP would interpolate against the wrong numbers.
  tl.fromTo(
    ab.title,
    { clipPath: 'inset(50% -10% 50% -10%)' },
    { clipPath: 'inset(0% -10% 0% -10%)', duration: 1.8, ease: 'expo.out' },
    5.0,
  )
    .to(ab.chars, { xPercent: 0, duration: 2.4, ease: 'power3.out' }, 4.9)
    .to(ab.eyebrow, { yPercent: 0, duration: 1, ease: 'power3.out' }, 6.0)
    .to(ab.fade, { autoAlpha: 1, duration: 1, ease: 'power1.out' }, 6.3)
    .to(ab.track, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 6.3)
    .to(ab.nodes, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.28, ease: 'power2.out' }, 6.7)
    .to(ab.intro, { yPercent: 0, duration: 1.2, stagger: 0.16, ease: 'expo.out' }, 6.4)
    .fromTo(
      ab.paras,
      { clipPath: 'inset(0% 0% 100% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.4, stagger: 0.35, ease: 'power2.out' },
      6.9,
    )
    .to(ab.cta, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 7.9)
    // Hold.
    .to({}, { duration: 1 }, 9)

  return tl
}
