import { forwardRef, useEffect, useRef } from 'react'
import { site } from '@/config/site'
import styles from './Portrait.module.css'

interface Props {
  onReady: () => void
}

const { portrait } = site

/**
 * The real photograph, composited in layers:
 *   shadow → photo → cool rim light (masked to the photo's own alpha) → floor fade.
 * The rim layer re-uses the cutout as a mask, so light only lands on the subject.
 */
export const Portrait = forwardRef<HTMLDivElement, Props>(function Portrait({ onReady }, ref) {
  const img = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = img.current
    if (!el) return
    let cancelled = false
    const done = () => !cancelled && onReady()
    // decode() resolves once pixels are ready to paint, so the reveal never pops.
    if (el.complete && el.naturalWidth > 0) el.decode().then(done, done)
    else el.addEventListener('load', () => el.decode().then(done, done), { once: true })
    el.addEventListener('error', done, { once: true })
    return () => {
      cancelled = true
    }
  }, [onReady])

  return (
    <div ref={ref} className={styles.portrait} data-portrait>
      <div className={styles.shadow} aria-hidden />
      <picture>
        <source media="(max-width: 767px)" srcSet={portrait.sources.mobile} type="image/webp" />
        <img
          ref={img}
          className={styles.photo}
          src={portrait.sources.desktop}
          width={portrait.width}
          height={portrait.height}
          alt={portrait.alt}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          data-portrait-photo
        />
      </picture>
      <div className={styles.rim} aria-hidden data-portrait-rim />
      <div className={styles.key} aria-hidden data-portrait-rim />
    </div>
  )
})
