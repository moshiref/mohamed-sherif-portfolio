import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { bindContact } from '@/animation/contactTimeline'
import { contact, site } from '@/config/site'
import { useNavigation } from '@/providers/NavigationProvider'
import { SplitChars } from '@/components/hero/SplitChars'
import { ContactIcon } from './ContactIcon'
import styles from './Contact.module.css'

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden>
      <path d="M3 13 13 3M5.5 3H13v7.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

/**
 * Final chapter: Contact. Same visual grammar as the rest of the site: masked
 * display type with a chrome second line, a chrome halo echoing the 3D
 * sculpture, and hairline rows whose hover mirrors the CTA buttons.
 */
export function Contact() {
  const root = useRef<HTMLElement>(null)
  const { navigate } = useNavigation()

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', lite: '(max-width: 767px), (pointer: coarse)' }, (ctx) => {
      const { motion, lite } = ctx.conditions as Record<string, boolean>
      if (motion) bindContact(el, { lite })
    })
    return () => mm.revert()
  }, [])

  return (
    <section ref={root} id="contact" className={styles.contact} aria-labelledby="contact-title">
      <span className={styles.seam} data-contact-seam aria-hidden />

      <div className={styles.halo} data-contact-halo aria-hidden>
        <span className={styles.glow} />
        <span className={styles.ring} />
        <span className={styles.orbit} />
      </div>

      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow} data-contact-fade>
            <span className={styles.eyebrowLine} aria-hidden />
            {contact.eyebrow}
          </p>
          <h2 id="contact-title" className={styles.title} data-contact-title>
            <SplitChars text={contact.title.solid} className={styles.titleLine} />
            <SplitChars
              text={contact.title.chrome}
              className={`${styles.titleLine} ${styles.titleIndent}`}
              charClassName={styles.chrome}
            />
          </h2>
          <p className={styles.lede} data-contact-fade>
            {contact.lede}
          </p>
        </header>

        <ul className={styles.channels}>
          {contact.channels.map((channel) => (
            <li key={channel.id} className={styles.item} data-contact-row>
              <span className={styles.rule} data-contact-rule aria-hidden />
              <a
                className={styles.row}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${channel.label}: ${channel.value} (opens in a new tab)`}
              >
                <span className={styles.fill} aria-hidden />
                <span className={styles.icon} data-contact-in>
                  <ContactIcon id={channel.id} />
                </span>
                <span className={styles.label} data-text={channel.label} data-contact-in>
                  <span>{channel.label}</span>
                </span>
                <span className={styles.value} data-contact-in>
                  {channel.value}
                </span>
                <span className={styles.arrow} data-contact-in>
                  <Arrow />
                </span>
              </a>
            </li>
          ))}
          <li className={styles.item} aria-hidden>
            <span className={styles.rule} data-contact-rule />
          </li>
        </ul>

        <div className={styles.signoff} data-contact-fade>
          <span>
            {site.name.first} {site.name.last} — {site.role}
          </span>
          <span className={styles.dim}>©{site.year}</span>
          <button type="button" className={styles.top} onClick={() => navigate('home')}>
            BACK TO TOP
            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden>
              <path d="M6 10.5V1.5M2 5.5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
