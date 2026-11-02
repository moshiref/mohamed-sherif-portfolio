import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '@/animation/sceneState'
import { buildStoryTimeline, STORY_ANCHOR, STORY_HANDOFF as HANDOFF } from '@/animation/storyTimeline'
import { REDUCED_MOTION } from '@/hooks/useMediaQuery'
import { About } from '@/components/about/About'
import { Hero } from '@/components/hero/Hero'
import styles from './Story.module.css'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  onNavReady: () => void
}

/**
 * Hero and About share one stage. With motion enabled the stage is pinned and
 * a single scrubbed timeline carries the visitor from the first scene into the
 * second; the 3D scene, lighting and DOM layers all move on the same clock.
 *
 * `#about` is a zero-size anchor placed at the scroll offset where the About
 * reveal has completed, so navigation lands on the finished composition.
 */
export function Story({ onNavReady }: Props) {
  const track = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const anchor = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const trackEl = track.current
    const stageEl = stage.current
    const anchorEl = anchor.current
    if (!trackEl || !stageEl || !anchorEl) return

    const placeAnchor = (scrollY: number) => {
      const trackTop = trackEl.getBoundingClientRect().top + window.scrollY
      anchorEl.style.top = `${Math.round(scrollY - trackTop)}px`
    }

    const mm = gsap.matchMedia()
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        reduced: REDUCED_MOTION,
        lite: '(max-width: 767px), (pointer: coarse)',
        compact: '(max-width: 767px)',
      },
      (ctx) => {
        const { motion, lite, compact } = ctx.conditions as Record<string, boolean>

        if (!motion) {
          // About sits in the normal flow; the anchor marks its top.
          const about = stageEl.querySelector<HTMLElement>('[data-about-root]')
          const sync = () => placeAnchor((about?.getBoundingClientRect().top ?? 0) + window.scrollY)
          sync()
          const st = ScrollTrigger.create({ trigger: stageEl, onRefresh: sync })
          return () => st.kill()
        }

        // Long enough to feel like a shot, short enough never to feel like a chore.
        const length = compact ? 1.8 : 2.2
        const tl = buildStoryTimeline(stageEl, { lite })
        // Hand-off: the finished About scene stays pinned for one more viewport so
        // the next chapter (Work) can rise over it. Padding keeps the reveal timing intact.
        tl.to({}, { duration: (tl.duration() * HANDOFF) / length })
        const revealDone = (STORY_ANCHOR * length) / (length + HANDOFF)

        ScrollTrigger.create({
          trigger: stageEl,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * (length + HANDOFF))}`,
          pin: true,
          scrub: compact ? 0.6 : 1,
          anticipatePin: 1,
          animation: tl,
          onRefresh: (self) => placeAnchor(self.start + (self.end - self.start) * revealDone),
        })

        return () => {
          sceneState.exit = 0
        }
      },
    )

    return () => mm.revert()
  }, [])

  return (
    <div ref={track} className={styles.track}>
      <div ref={stage} className={styles.stage} data-story-stage>
        <Hero onNavReady={onNavReady} />
        <About />
      </div>
      <span ref={anchor} id="about" className={styles.anchor} aria-hidden />
    </div>
  )
}
