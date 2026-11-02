import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { navItems, type SectionId } from '@/config/site'
import { useLenis } from './SmoothScroll'

interface NavigationValue {
  active: SectionId
  /** Section that was requested but is not built yet; drives the "coming soon" notice. */
  notice: SectionId | null
  navigate: (id: SectionId) => void
  isAvailable: (id: SectionId) => boolean
}

const NavigationContext = createContext<NavigationValue | null>(null)

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used inside <NavigationProvider>')
  return ctx
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const isAvailable =(id: SectionId) => id === 'home' || document.getElementById(id) !== null

export function NavigationProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis()
  const [active, setActive] = useState<SectionId>('home')
  const [notice, setNotice] = useState<SectionId | null>(null)
  const noticeTimer = useRef<number | undefined>(undefined)

  // The active section is the last one whose top has crossed the middle of the
  // viewport. Measured from scroll position rather than intersection, because
  // the hero/about stage is pinned and #about is a zero-size scroll anchor.
  useEffect(() => {
    let frame = 0
    const compute = () => {
      frame = 0
      const probe = window.scrollY + window.innerHeight * 0.5
      let current: SectionId = 'home'
      for (const item of navItems) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top + window.scrollY <= probe) current = item.id
      }
      setActive(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Pins add scroll length after first paint; re-measure whenever layout is recalculated.
    ScrollTrigger.addEventListener('refresh', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      ScrollTrigger.removeEventListener('refresh', schedule)
    }
  }, [])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const navigate = useCallback(
    (id: SectionId) => {
      if (!isAvailable(id)) {
        setNotice(id)
        window.clearTimeout(noticeTimer.current)
        noticeTimer.current = window.setTimeout(() => setNotice(null), 2200)
        return
      }
      const el = id === 'home' ? null : (document.getElementById(id) as HTMLElement)
      const top = el ? el.getBoundingClientRect().top + window.scrollY : 0
      if (lenis) {
        // Longer jumps play the scrubbed transitions as a fast, eased camera move.
        const distance = Math.abs(top - window.scrollY) / window.innerHeight
        const duration = Math.min(2.8, Math.max(1.2, 0.9 + distance * 0.7))
        lenis.scrollTo(top, { duration, easing: easeInOutCubic })
      } else {
        window.scrollTo({ top })
      }
    },
    [lenis],
  )

  const value = useMemo(() => ({ active, notice, navigate, isAvailable }), [active, notice, navigate])
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}
