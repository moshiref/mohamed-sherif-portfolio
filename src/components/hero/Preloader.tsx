import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Preloader.module.css'

interface Props {
  /** 0 → 1, real readiness of fonts, portrait and the 3D scene. */
  progress: number
  reduced: boolean
  onComplete: () => void
}

/**
 * A quiet count-up that reflects real readiness instead of a fake timer. It
 * never blocks longer than needed, and exits by drawing its line across the
 * screen, which hands over to the dark opening frame of the 3D sequence.
 */
export function Preloader({ progress, reduced, onComplete }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const shown = useRef({ v: 0 })
  const finished = useRef(false)
  const complete = useRef(onComplete)

  useLayoutEffect(() => {
    complete.current = onComplete
  })

  useEffect(() => {
    const state = shown.current
    const render = () => {
      if (count.current) count.current.textContent = String(Math.round(state.v * 100)).padStart(3, '0')
      if (bar.current) bar.current.style.transform = `scaleX(${state.v})`
    }

    const tween = gsap.to(state, {
      v: progress,
      duration: reduced ? 0.2 : progress >= 1 ? 0.45 : 0.8,
      ease: 'power2.out',
      onUpdate: render,
      onComplete: () => {
        if (progress < 1 || finished.current || !root.current) return
        finished.current = true
        if (reduced) {
          gsap.to(root.current, { autoAlpha: 0, duration: 0.3, onComplete: () => complete.current() })
          return
        }
        const q = gsap.utils.selector(root.current)
        const tl = gsap.timeline({ onComplete: () => complete.current() })
        tl.to(q(`.${styles.meta}`), { yPercent: -120, duration: 0.6, ease: 'power3.in', stagger: 0.05 })
          .to(q(`.${styles.track}`), { scaleX: 6, duration: 0.8, ease: 'expo.inOut' }, 0.2)
          .to(root.current, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' }, 0.75)
      },
    })
    return () => {
      tween.kill()
    }
  }, [progress, reduced])

  return (
    <div ref={root} className={styles.preloader} role="status" aria-label="Loading">
      <div className={styles.row}>
        <span className={styles.mask}>
          <span className={styles.meta}>MOHAMED SHERIF</span>
        </span>
        <span className={styles.mask}>
          <span className={styles.meta}>
            <span ref={count}>000</span>
          </span>
        </span>
      </div>
      <span className={styles.track}>
        <span ref={bar} className={styles.bar} />
      </span>
    </div>
  )
}
