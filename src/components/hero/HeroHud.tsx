import { useEffect, useState } from 'react'
import { site } from '@/config/site'
import styles from './HeroHud.module.css'

/** Viewfinder details: corner brackets, the portfolio label and a scroll cue. */
export function HeroHud() {
  const [scrollable, setScrollable] = useState(false)

  // Only invite scrolling once there is something below the hero.
  useEffect(() => {
    const check = () => setScrollable(document.documentElement.scrollHeight > window.innerHeight + 40)
    const ro = new ResizeObserver(check)
    ro.observe(document.body)
    check()
    return () => ro.disconnect()
  }, [])

  return (
    <div className={styles.hud} aria-hidden data-scroll="hud">
      <div className={styles.frame} data-frame>
        <i className={styles.tl} />
        <i className={styles.tr} />
        <i className={styles.bl} />
        <i className={styles.br} />
      </div>

      <div className={`${styles.meta} ${styles.topLeft}`} data-hud>
        <span className={styles.dot} />
        <span>PORTFOLIO</span>
        <span className={styles.dim}>©{site.year}</span>
      </div>

      {/* Always mounted so the intro can choreograph it; hidden until there is somewhere to go. */}
      <div className={`${styles.meta} ${styles.scroll}`} data-hud hidden={!scrollable}>
        <span>SCROLL</span>
        <span className={styles.scrollLine} />
      </div>
    </div>
  )
}
