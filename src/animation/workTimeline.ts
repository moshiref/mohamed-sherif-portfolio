import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STORY_HANDOFF as HANDOFF } from './storyTimeline'

gsap.registerPlugin(ScrollTrigger)

interface Options {
  /** Small or touch screens: no filters, softer 3D. */
  lite: boolean
}

/**
 * About → Selected Work. The finished About scene is still pinned (Story's
 * hand-off hold) and Work overlaps that range via a negative top margin, so
 * it rises over the scene as a rounded portal that widens to full bleed.
 * Behind it, the About scene tilts back, shrinks and darkens, as if the camera
 * is leaving one set and entering the next.
 */
export function buildWorkEntrance(work: HTMLElement, stage: HTMLElement, { lite }: Options) {
  const scenes = Array.from(stage.children) as HTMLElement[]
  const opener = work.querySelector<HTMLElement>('[data-work-opener]')
  const titleChars = Array.from(work.querySelectorAll<HTMLElement>('[data-work-title] [data-char]'))
  const openerFade = Array.from(work.querySelectorAll<HTMLElement>('[data-work-fade]'))
  const seam = work.querySelector<HTMLElement>('[data-work-seam]')

  gsap.set(stage, { perspective: 1400 })
  gsap.set(scenes, { transformOrigin: '50% 60%' })
  gsap.set(titleChars, { yPercent: 115 })
  gsap.set(openerFade, { autoAlpha: 0, y: 24 })
  gsap.set(seam, { scaleX: 0.2, autoAlpha: 0 })

  const tl = gsap.timeline({ defaults: { ease: 'none' } })
  tl.to(
    scenes,
    {
      scale: 0.86,
      rotationX: lite ? 4 : 9,
      yPercent: -5,
      ...(lite ? { autoAlpha: 0.4 } : { filter: 'brightness(0.32)' }),
      duration: 1,
      ease: 'power2.in',
    },
    0,
  )
    // fromTo with explicit strings: browsers serialise inset() in a collapsed form
    // ("inset(0% 7%)"), which GSAP would otherwise interpolate against the wrong numbers.
    .fromTo(
      work,
      { clipPath: 'inset(0% 7% 0% 7% round 36px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.85, ease: 'power2.inOut' },
      0.15,
    )
    .to(seam, { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, 0)
    .to(seam, { autoAlpha: 0, duration: 0.3 }, 0.75)
    .to(titleChars, { yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'expo.out' }, 0.42)
    .to(openerFade, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }, 0.6)

  if (opener) tl.fromTo(opener, { yPercent: 10 }, { yPercent: 0, duration: 1, ease: 'power1.out' }, 0)

  // Overlap exactly the hand-off range (measured in px to match ScrollTrigger's viewport).
  const overlap = () => {
    work.style.marginTop = `-${window.innerHeight * HANDOFF}px`
  }
  overlap()
  ScrollTrigger.addEventListener('refreshInit', overlap)

  const st = ScrollTrigger.create({
    trigger: work,
    start: 'top bottom',
    end: 'top top',
    scrub: lite ? 0.5 : 0.8,
    animation: tl,
  })
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', overlap)
    work.style.marginTop = ''
    st.kill()
  }
}

/** Group dividers draw their rule and fade in their labels as they arrive. */
export function bindGroupDividers(work: HTMLElement) {
  work.querySelectorAll<HTMLElement>('[data-group]').forEach((group) => {
    const rule = group.querySelector('[data-group-rule]')
    const items = group.querySelectorAll('[data-group-item]')
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }).fromTo(
      items,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' },
      0.3,
    )
    ScrollTrigger.create({ trigger: group, start: 'top 82%', animation: tl, toggleActions: 'play none none reverse' })
  })
}

/**
 * Each project is a scene with three movements, all on one scrubbed timeline
 * spanning its full pass through the viewport (so enter and exit never fight):
 *   enter: the frame swings up out of a 3D tilt while its mask opens and the
 *          screenshot settles from a slow counter-zoom
 *   hold:  centre screen, flat and sharp
 *   exit:  the frame tips away and dims as the next project arrives
 * The phone frame drifts on its own, faster track for parallax depth. Copy is
 * revealed once on arrival (time-based) and reverses if the visitor scrolls back.
 */
export function bindProjectScenes(work: HTMLElement, { lite }: Options) {
  work.querySelectorAll<HTMLElement>('[data-project]').forEach((project) => {
    const side = project.dataset.side === 'right' ? -1 : 1
    const frame = project.querySelector<HTMLElement>('[data-frame]')
    const shot = project.querySelector<HTMLElement>('[data-shot]')
    const phone = project.querySelector<HTMLElement>('[data-phone]')
    const info = project.querySelector<HTMLElement>('[data-info]')
    const reveal = project.querySelectorAll<HTMLElement>('[data-reveal]')
    const fade = project.querySelectorAll<HTMLElement>('[data-fade]')

    const scene = gsap.timeline({ defaults: { ease: 'none' } })
    scene
      .fromTo(
        frame,
        {
          rotationX: lite ? 10 : 18,
          rotationY: lite ? 0 : 10 * side,
          scale: 0.84,
          y: 60,
          clipPath: 'inset(12% 10% 12% 10% round 28px)',
          autoAlpha: 0.25,
        },
        {
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0% round 18px)',
          autoAlpha: 1,
          duration: 0.42,
          ease: 'power2.out',
        },
        0,
      )
      .fromTo(shot, { scale: 1.32 }, { scale: 1, duration: 0.5, ease: 'power2.out' }, 0)
      .to(frame, { rotationX: lite ? -4 : -8, scale: 0.94, y: -40, autoAlpha: 0.35, duration: 0.36, ease: 'power1.in' }, 0.64)

    if (phone) scene.fromTo(phone, { y: 160, rotation: 6 * side }, { y: -120, rotation: -3 * side, duration: 1 }, 0)
    if (info && !lite) scene.fromTo(info, { y: 70 }, { y: -70, duration: 1 }, 0)

    ScrollTrigger.create({
      trigger: project,
      start: 'top bottom',
      end: 'bottom top',
      scrub: lite ? 0.4 : 0.9,
      animation: scene,
    })

    const copy = gsap.timeline({ paused: true })
    copy
      .fromTo(reveal, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out' })
      .fromTo(fade, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 0.25)
    ScrollTrigger.create({ trigger: project, start: 'top 62%', animation: copy, toggleActions: 'play none none reverse' })
  })
}
