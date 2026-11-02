import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { playIntro, setIntroInitialState } from '@/animation/introTimeline'
import { sceneState } from '@/animation/sceneState'
import { site } from '@/config/site'
import { useReducedMotion } from '@/hooks/useMediaQuery'
import { getDeviceProfile, supportsWebGL } from '@/lib/device'
import { waitForFonts } from '@/lib/fonts'
import { useNavigation } from '@/providers/NavigationProvider'
import { useLenis } from '@/providers/SmoothScroll'
import { CtaButton } from '@/components/ui/CtaButton'
import { HeroFallback } from './HeroFallback'
import { HeroHud } from './HeroHud'
import { Portrait } from './Portrait'
import { Preloader } from './Preloader'
import { SplitChars } from './SplitChars'
import styles from './Hero.module.css'

gsap.registerPlugin(ScrollTrigger)

// The 3D stack ships in its own chunk; text and portrait never wait on it to parse.
const HeroCanvas = lazy(() => import('@/components/three/HeroCanvas'))

/** Hard ceiling on how long the preloader may wait for any one asset. */
const READY_TIMEOUT = 7000

interface Props {
  onNavReady: () => void
}

export function Hero({ onNavReady }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { navigate } = useNavigation()
  const profile = useMemo(getDeviceProfile, [])
  const [webgl, setWebgl] = useState(supportsWebGL)
  const [ready, setReady] = useState({ fonts: false, portrait: false, scene: false })
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const lenis = useLenis()
  const intro = useRef<gsap.core.Timeline | null>(null)

  const markPortrait = useCallback(() => setReady((r) => ({ ...r, portrait: true })), [])
  const markScene = useCallback(() => setReady((r) => ({ ...r, scene: true })), [])
  const dropWebgl = useCallback(() => {
    setWebgl(false)
    setReady((r) => ({ ...r, scene: true }))
  }, [])

  // Readiness: fonts, decoded portrait, first rendered 3D frames.
  useEffect(() => {
    waitForFonts().then(() => setReady((r) => ({ ...r, fonts: true })))
    if (!webgl) setReady((r) => ({ ...r, scene: true }))
    const failSafe = window.setTimeout(() => setReady({ fonts: true, portrait: true, scene: true }), READY_TIMEOUT)
    return () => window.clearTimeout(failSafe)
  }, [webgl])

  const progress = (Number(ready.fonts) + Number(ready.portrait) + Number(ready.scene)) / 3

  // Hidden "before" state. Layout effect so nothing flashes.
  // (The scroll-driven exit lives in the story timeline, see components/story/Story.tsx.)
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    document.body.classList.add('is-intro')
    const ctx = gsap.context(() => setIntroInitialState(el), el)
    return () => {
      ctx.revert()
      intro.current?.kill()
      document.body.classList.remove('is-intro')
    }
  }, [])

  // The opening sequence owns the first seconds: hold smooth scrolling until it lands.
  useEffect(() => {
    if (!lenis) return
    if (introDone) lenis.start()
    else lenis.stop()
  }, [lenis, introDone])

  const startIntro = useCallback(() => {
    setPreloaderDone(true)
    if (!root.current) return
    intro.current = playIntro(root.current, {
      reduced,
      onNav: onNavReady,
      onComplete: () => {
        document.body.classList.remove('is-intro')
        setIntroDone(true)
        // Layout is final now (fonts, portrait, canvas); re-measure pinned scroll ranges.
        ScrollTrigger.refresh()
      },
    })
  }, [reduced, onNavReady])

  // Mouse-responsive depth: every [data-depth] layer drifts by its own factor.
  useEffect(() => {
    const el = root.current
    if (!el || reduced || !profile.finePointer) return
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]')).map((node) => ({
      depth: Number(node.dataset.depth),
      x: gsap.quickTo(node, 'x', { duration: 1.4, ease: 'power3.out' }),
      y: gsap.quickTo(node, 'y', { duration: 1.4, ease: 'power3.out' }),
    }))
    const px = gsap.quickTo(sceneState.pointer, 'x', { duration: 1.6, ease: 'power3.out' })
    const py = gsap.quickTo(sceneState.pointer, 'y', { duration: 1.6, ease: 'power3.out' })

    const move = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      px(nx)
      py(-ny)
      for (const l of layers) {
        l.x(nx * l.depth * 14)
        l.y(ny * l.depth * 9)
      }
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      sceneState.pointer.x = 0
      sceneState.pointer.y = 0
    }
  }, [reduced, profile.finePointer])

  return (
    <section ref={root} id="home" className={styles.hero} aria-label="Introduction">
      <div className={styles.stage}>
        {webgl ? (
          <Suspense fallback={null}>
            <HeroCanvas profile={profile} onReady={markScene} onError={dropWebgl} />
          </Suspense>
        ) : (
          <HeroFallback />
        )}
      </div>

      <div className={styles.vignette} aria-hidden />

      <div className={styles.portraitLayer} data-depth="0.55">
        <div className={styles.portraitWrap} data-portrait-wrap>
          <Portrait onReady={markPortrait} />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.copyInner} data-depth="-0.4">
            <h1 className={styles.name} data-name>
              <span className={styles.nameLine} data-scroll="name-first">
                <SplitChars text={site.name.first} />
              </span>
              <span className={`${styles.nameLine} ${styles.nameLast}`} data-scroll="name-last">
                <SplitChars text={site.name.last} charClassName={styles.chrome} />
                {/* Identical glyph layout on top, carrying only a travelling band of light. */}
                <span className={styles.sheen} data-sheen aria-hidden>
                  <SplitChars text={site.name.last} charClassName={styles.sheenChar} />
                </span>
              </span>
            </h1>

            <p className={styles.role} data-role data-scroll="role">
              <span className={styles.roleLine} data-role-line aria-hidden />
              <SplitChars text={site.role} />
            </p>

            <p className={styles.tagline} data-scroll="tagline">
              {site.tagline.map((line) => (
                <span key={line} className={styles.lineMask}>
                  <span data-tagline-line>{line}</span>
                </span>
              ))}
            </p>

            <div className={styles.ctas} data-scroll="ctas">
              <div data-cta>
                <CtaButton label="EXPLORE MY WORK" onClick={() => navigate('work')} />
              </div>
              <div data-cta>
                <CtaButton label="LET'S TALK" variant="ghost" onClick={() => navigate('contact')} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroHud />
      <div className={styles.grain} aria-hidden />

      {!preloaderDone && <Preloader progress={progress} reduced={reduced} onComplete={startIntro} />}
    </section>
  )
}
