import { about } from '@/config/site'
import { useNavigation } from '@/providers/NavigationProvider'
import { CtaButton } from '@/components/ui/CtaButton'
import styles from './About.module.css'

/**
 * Title glyphs without per-letter masks: the story timeline converges them
 * horizontally inside the title's own aperture, so they must be free to travel.
 */
function TitleChars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from(text).map((ch, i) => (
        <span key={i} className={styles.tchar} data-tchar>
          {ch}
        </span>
      ))}
    </span>
  )
}

/**
 * Chapter two. In motion-enabled browsers it is layered over the pinned hero
 * and revealed by the story timeline (see components/story). With reduced
 * motion it simply sits in the page flow below the hero.
 */
export function About() {
  const { navigate } = useNavigation()

  return (
    <section className={styles.about} aria-labelledby="about-title" data-about-root>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.mask}>
            <span data-about="eyebrow">
              <span className={styles.eyebrowLine} aria-hidden />
              {about.eyebrow}
            </span>
          </span>
        </p>

        <div className={styles.titleWrap}>
          <span className={styles.flare} data-about="flare" aria-hidden />
          <span className={styles.beam} data-about="beam" aria-hidden />
          <h2 id="about-title" className={styles.title} data-about="title">
            <span className="sr-only">
              {about.title.solid} {about.title.chrome}
            </span>
            <TitleChars text={about.title.solid} />
            <span className={styles.space} aria-hidden />
            <TitleChars text={about.title.chrome} className={styles.chrome} />
          </h2>
        </div>

        <div className={styles.regions}>
          <span className={styles.regionsLabel} data-about="fade">
            {about.regionsLabel}
          </span>
          <div className={styles.track}>
            <span className={styles.trackLine} data-about="track" aria-hidden />
            {about.regions.map((region) => (
              <span key={region} className={styles.node} data-about="node">
                <i aria-hidden />
                {region}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          <h3 className={styles.intro}>
            {about.intro.map((line) => (
              <span key={line} className={styles.mask}>
                <span data-about="intro">{line}</span>
              </span>
            ))}
          </h3>

          <div className={styles.copy}>
            <p className={styles.lead} data-about="para">
              {about.lead}
            </p>
            <p className={styles.detail} data-about="para">
              {about.detail}
            </p>
            <div className={styles.cta} data-about="cta">
              <CtaButton label={about.cta} onClick={() => navigate('contact')} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
