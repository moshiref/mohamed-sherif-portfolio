import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Work → Contact. As the chapter arrives, a light seam draws across its edge,
 * the chrome halo swings up out of depth and the title rises letter by letter
 * (all scrubbed, so it plays both ways). The channel rows then draw their
 * hairlines and slide in once, reversing if the visitor scrolls back up.
 */
export function bindContact(section: HTMLElement, { lite }: { lite: boolean }) {
  const q = (s: string) => Array.from(section.querySelectorAll<HTMLElement>(s))
  const seam = q('[data-contact-seam]')
  const halo = q('[data-contact-halo]')
  const chars = q('[data-contact-title] [data-char]')
  const fades = q('[data-contact-fade]')
  const rules = q('[data-contact-rule]')
  const rowsIn = q('[data-contact-in]')

  const arrive = gsap.timeline({ defaults: { ease: 'none' } })
  arrive
    .fromTo(seam, { scaleX: 0.15, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0)
    .to(seam, { autoAlpha: 0, duration: 0.3 }, 0.6)
    .fromTo(
      halo,
      { scale: 0.55, rotationX: lite ? 30 : 55, rotationZ: -24, autoAlpha: 0 },
      { scale: 1, rotationX: 0, rotationZ: 0, autoAlpha: 1, duration: 1, ease: 'power2.out' },
      0,
    )
    .fromTo(chars, { yPercent: 115 }, { yPercent: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' }, 0.3)

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'top 15%',
    scrub: lite ? 0.5 : 0.9,
    animation: arrive,
  })

  const details = gsap.timeline({ paused: true })
  details
    .fromTo(fades, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0)
    .fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 1.3, stagger: 0.12, ease: 'expo.inOut' }, 0.1)
    .fromTo(rowsIn, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.05, ease: 'power3.out' }, 0.4)

  ScrollTrigger.create({ trigger: section, start: 'top 45%', animation: details, toggleActions: 'play none none reverse' })
}
