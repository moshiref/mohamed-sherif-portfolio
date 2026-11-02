import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, type Transition } from 'motion/react'
import { gsap } from 'gsap'
import { navItems, site, type SectionId } from '@/config/site'
import { useMediaQuery, useReducedMotion } from '@/hooks/useMediaQuery'
import { useNavigation } from '@/providers/NavigationProvider'
import { useLenis } from '@/providers/SmoothScroll'
import styles from './FloatingNav.module.css'

const spring: Transition = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 }
const ease = [0.16, 1, 0.3, 1] as const

interface Props {
  visible: boolean
}

export function FloatingNav({ visible }: Props) {
  const compact = useMediaQuery('(max-width: 767px)')
  return compact ? <MobileNav visible={visible} /> : <DockNav visible={visible} />
}

function Mark({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.mark} onClick={onClick} aria-label="Mohamed Sherif, back to top">
      <span>MS</span>
    </button>
  )
}

function Notice({ id }: { id: SectionId | null }) {
  const item = navItems.find((n) => n.id === id)
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.id}
          className={styles.notice}
          role="status"
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 6, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease }}
        >
          <span className={styles.noticeDot} />
          {item.label} · Coming soon
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Desktop: floating glass dock                                         */
/* ------------------------------------------------------------------ */

function DockNav({ visible }: Props) {
  const { active, notice, navigate } = useNavigation()
  const reduced = useReducedMotion()
  const dock = useRef<HTMLElement>(null)
  const [hover, setHover] = useState<SectionId | null>(null)

  useLayoutEffect(() => {
    if (dock.current) gsap.set(dock.current, { autoAlpha: 0 })
  }, [])

  // Entrance: a single glass bead drops in, then unfolds into the full dock.
  useEffect(() => {
    const el = dock.current
    if (!visible || !el) return
    const items = el.querySelectorAll('[data-nav-item]')
    if (reduced) {
      gsap.to(el, { autoAlpha: 1, duration: 0.4 })
      return
    }
    const inset = el.offsetWidth / 2 - el.offsetHeight / 2
    const tl = gsap.timeline()
    tl.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' })
      .fromTo(
        el,
        { clipPath: `inset(0px ${inset}px 0px ${inset}px round 999px)` },
        { clipPath: 'inset(0px 0px 0px 0px round 999px)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' },
        0.25,
      )
      .fromTo(items, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, 0.75)
    return () => {
      tl.kill()
    }
  }, [visible, reduced])

  const onItem = (e: MouseEvent, id: SectionId) => {
    e.preventDefault()
    navigate(id)
  }

  return (
    <nav ref={dock} className={styles.dock} aria-label="Primary">
      <Notice id={notice} />
      <div data-nav-item>
        <Mark onClick={() => navigate('home')} />
      </div>
      <span className={styles.divider} data-nav-item aria-hidden />
      <ul className={styles.list} onMouseLeave={() => setHover(null)}>
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <li key={item.id} data-nav-item>
              <a
                href={`#${item.id}`}
                className={styles.link}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => onItem(e, item.id)}
                onMouseEnter={() => setHover(item.id)}
                onFocus={() => setHover(item.id)}
                onBlur={() => setHover(null)}
              >
                {isActive && <motion.span layoutId="dock-active" className={styles.active} transition={spring} />}
                <AnimatePresence>
                  {hover === item.id && !isActive && (
                    <motion.span
                      layoutId="dock-hover"
                      className={styles.hover}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={spring}
                    />
                  )}
                </AnimatePresence>
                <span className={styles.roll} data-text={item.label}>
                  <span>{item.label}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile: capsule + full-screen glass sheet                            */
/* ------------------------------------------------------------------ */

function MobileNav({ visible }: Props) {
  const { active, notice, navigate, isAvailable } = useNavigation()
  const reduced = useReducedMotion()
  const lenis = useLenis()
  const bar = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const current = navItems.find((n) => n.id === active) ?? navItems[0]

  useLayoutEffect(() => {
    if (bar.current) gsap.set(bar.current, { autoAlpha: 0, y: 40 })
  }, [])

  useEffect(() => {
    if (!visible || !bar.current) return
    const tween = gsap.to(bar.current, { autoAlpha: 1, y: 0, duration: reduced ? 0.3 : 1.1, ease: 'expo.out' })
    return () => {
      tween.kill()
    }
  }, [visible, reduced])

  // Lock scroll and listen for Escape while the sheet is open.
  useEffect(() => {
    if (!open) return
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  const go = (id: SectionId) => {
    navigate(id)
    if (isAvailable(id)) setOpen(false)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0% round 28px)' }}
            animate={{ opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
            exit={{ opacity: 0, clipPath: 'inset(100% 0% 0% 0% round 28px)' }}
            transition={{ duration: reduced ? 0 : 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <p className={styles.sheetEyebrow}>Navigation</p>
            <ul className={styles.sheetList}>
              {navItems.map((item, i) => {
                const available = isAvailable(item.id)
                return (
                  <li key={item.id} className={styles.sheetItem}>
                    <motion.a
                      href={`#${item.id}`}
                      className={styles.sheetLink}
                      aria-current={active === item.id ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        go(item.id)
                      }}
                      initial={{ y: '110%' }}
                      animate={{ y: '0%' }}
                      exit={{ y: '-110%' }}
                      transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.18 + i * 0.06, ease }}
                    >
                      <span className={styles.sheetLabel}>{item.label}</span>
                      {!available && <span className={styles.soon}>Soon</span>}
                    </motion.a>
                  </li>
                )
              })}
            </ul>
            <motion.p
              className={styles.sheetFoot}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              {site.name.first} {site.name.last} — {site.role}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bar} className={styles.capsule}>
        <Notice id={notice} />
        <Mark
          onClick={() => {
            setOpen(false)
            navigate('home')
          }}
        />
        <span className={styles.current} aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current.id}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              {current.label}
            </motion.span>
          </AnimatePresence>
        </span>
        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className={styles.menuLabel}>{open ? 'Close' : 'Menu'}</span>
          <span className={`${styles.burger} ${open ? styles.burgerOpen : ''}`} aria-hidden>
            <i />
            <i />
          </span>
        </button>
      </div>
    </>
  )
}
