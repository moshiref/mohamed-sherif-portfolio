import styles from './HeroFallback.module.css'

/**
 * Shown when WebGL is unavailable: a CSS-only chrome halo built from conic
 * gradients, sitting where the 3D sculpture would settle.
 */
export function HeroFallback() {
  return (
    <div className={styles.fallback} aria-hidden data-fallback>
      <div className={styles.glow} />
      <div className={styles.ring} />
      <div className={styles.orbit} />
    </div>
  )
}
