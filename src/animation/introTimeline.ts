import { gsap } from 'gsap'
import { sceneState } from './sceneState'

/** Selectors (scoped to the hero root) for every element the intro choreographs. */
const sel = {
  nameChars: '[data-name] [data-char]',
  sheenChars: '[data-sheen] [data-char]',
  roleLine: '[data-role-line]',
  roleChars: '[data-role] [data-char]',
  tagline: '[data-tagline-line]',
  ctas: '[data-cta]',
  hud: '[data-hud]',
  frame: '[data-frame]',
  portrait: '[data-portrait-wrap]',
  photo: '[data-portrait-photo]',
  rim: '[data-portrait-rim]',
  fallback: '[data-fallback]',
}

type Key = keyof typeof sel
type Targets = Record<Key, HTMLElement[]>

function collect(root: HTMLElement): Targets {
  const all = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s))
  const sheen = all(sel.sheenChars)
  const out = Object.fromEntries(Object.entries(sel).map(([k, s]) => [k, all(s)])) as Targets
  // The sheen glyphs share the name's markup but must stay put; only their light moves.
  out.nameChars = out.nameChars.filter((el) => !sheen.includes(el))
  return out
}

/** Runs `fn` only when the target list is non-empty (some elements are conditional, e.g. the fallback). */
function each(targets: HTMLElement[], fn: (t: HTMLElement[]) => void) {
  if (targets.length) fn(targets)
}

/** Hidden "before" state, applied synchronously on mount so nothing flashes. */
export function setIntroInitialState(root: HTMLElement) {
  const t = collect(root)
  each(t.nameChars, (x) => gsap.set(x, { yPercent: 118 }))
  each(t.roleChars, (x) => gsap.set(x, { yPercent: 118 }))
  each(t.roleLine, (x) => gsap.set(x, { scaleX: 0 }))
  each(t.tagline, (x) => gsap.set(x, { yPercent: 110 }))
  each(t.ctas, (x) => gsap.set(x, { autoAlpha: 0, y: 24 }))
  each(t.hud, (x) => gsap.set(x, { autoAlpha: 0 }))
  each(t.frame, (x) => gsap.set(x, { autoAlpha: 0, scale: 1.04 }))
  each(t.portrait, (x) => gsap.set(x, { autoAlpha: 0, y: 30 }))
  each(t.photo, (x) => gsap.set(x, { filter: 'brightness(0) contrast(1.4)' }))
  each(t.rim, (x) => gsap.set(x, { autoAlpha: 0 }))
  each(t.fallback, (x) => gsap.set(x, { autoAlpha: 0 }))
  Object.assign(sceneState, { reveal: 0, approach: 0, dolly: 0 })
}

interface IntroOptions {
  reduced: boolean
  onNav: () => void
  onComplete: () => void
}

/**
 * The opening sequence. Timings are absolute (seconds from the start of the shot)
 * so the overlaps between light, travel, portrait and type are explicit:
 *
 *  0.0  darkness: lights begin to rise on the distant sculpture
 *  0.2  the sculpture starts its journey out of the haze; the camera dollies in
 *  1.5  the portrait emerges as a silhouette against the lit sculpture
 *  1.9  the name rises, letter by letter
 *  2.5  the key light lands on the portrait
 *  2.7  role, tagline, CTAs
 *  3.4  navigation assembles
 *  ~5.6 the sculpture settles into its continuous idle motion
 */
export function playIntro(root: HTMLElement, { reduced, onNav, onComplete }: IntroOptions) {
  const t = collect(root)

  if (reduced) {
    sceneState.still = true
    Object.assign(sceneState, { reveal: 1, approach: 1, dolly: 1 })
    gsap.set([...t.nameChars, ...t.roleChars, ...t.tagline], { yPercent: 0 })
    gsap.set(t.roleLine, { scaleX: 1 })
    gsap.set([...t.ctas, ...t.portrait], { y: 0 })
    gsap.set(t.frame, { scale: 1 })
    gsap.set(t.photo, { filter: 'brightness(1) contrast(1)' })
    const tl = gsap.timeline({ onComplete })
    tl.to([...t.portrait, ...t.rim, ...t.ctas, ...t.hud, ...t.frame, ...t.fallback], {
      autoAlpha: 1,
      duration: 0.6,
      ease: 'power1.out',
    }).call(onNav, [], 0)
    return tl
  }

  sceneState.still = false
  const tl = gsap.timeline({ onComplete, defaults: { ease: 'expo.out' } })

  // Act I: light and travel.
  tl.to(sceneState, { reveal: 1, duration: 2.8, ease: 'power2.inOut' }, 0)
    .to(sceneState, { approach: 1, duration: 5.4, ease: 'power3.out' }, 0.2)
    .to(sceneState, { dolly: 1, duration: 5.8, ease: 'power2.inOut' }, 0)
  each(t.fallback, (x) => tl.to(x, { autoAlpha: 1, duration: 2.4, ease: 'power1.inOut' }, 0.2))

  // Act II: the portrait steps out of the dark, first as a silhouette, then lit.
  tl.to(t.portrait, { autoAlpha: 1, y: 0, duration: 2.2, ease: 'power2.out' }, 1.5)
    .to(t.photo, { filter: 'brightness(1) contrast(1)', duration: 2.2, ease: 'power2.inOut' }, 2.5)
    .to(t.rim, { autoAlpha: 1, duration: 1.6, ease: 'power1.inOut' }, 3.1)

  // Act III: typography.
  tl.to(t.nameChars, { yPercent: 0, duration: 1.6, stagger: 0.045 }, 1.9)
    .fromTo(
      t.sheenChars,
      { backgroundPosition: '100% 0%' },
      { backgroundPosition: '0% 0%', duration: 0.9, stagger: 0.07, ease: 'power1.inOut' },
      3.3,
    )
    .to(t.roleLine, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 2.6)
    .to(t.roleChars, { yPercent: 0, duration: 1.1, stagger: 0.022 }, 2.75)
    .to(t.tagline, { yPercent: 0, duration: 1.3, stagger: 0.12 }, 2.95)
    .to(t.ctas, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.1 }, 3.25)
    .to(t.frame, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power3.out' }, 3.0)
    .to(t.hud, { autoAlpha: 1, duration: 1, stagger: 0.08, ease: 'power1.out' }, 3.3)
    .call(onNav, [], 3.4)

  return tl
}
