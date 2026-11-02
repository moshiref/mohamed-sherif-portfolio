import { memo, useEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import type { Project } from '@/config/projects'
import { CtaButton } from '@/components/ui/CtaButton'
import styles from './ProjectShowcase.module.css'

interface Props {
  project: Project
  index: number
  total: number
  side: 'left' | 'right'
}

const pad = (n: number) => String(n).padStart(2, '0')
const longestWord = (s: string) => Math.max(...s.split(/\s+/).map((w) => w.length))

/**
 * One immersive project "scene": a large browser-framed live screenshot with a
 * floating phone frame, and the project's details. Scroll choreography is owned
 * by the Work section; this component only adds the pointer-driven tilt.
 */
export const ProjectShowcase = memo(function ProjectShowcase({ project, index, total, side }: Props) {
  const tilt = useRef<HTMLDivElement>(null)
  const { preview } = project

  // 3D tilt toward the cursor plus a moving glare. Writes styles directly, no renders.
  useEffect(() => {
    const el = tilt.current
    if (!el || !window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width
      const ny = (e.clientY - r.top) / r.height
      ry((nx - 0.5) * 7)
      rx((0.5 - ny) * 5)
      el.style.setProperty('--gx', `${nx * 100}%`)
      el.style.setProperty('--gy', `${ny * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <article className={styles.project} data-project data-side={side} aria-labelledby={`project-${project.slug}`}>
      <div className={styles.media}>
        <a
          className={styles.frameLink}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.name} live website (new tab)`}
          data-frame
        >
          <div ref={tilt} className={styles.frame}>
            <div className={styles.bar} aria-hidden>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span className={styles.address}>
                <svg viewBox="0 0 12 12" width="10" height="10">
                  <path d="M3.5 5V3.8a2.5 2.5 0 0 1 5 0V5M2.5 5h7v5h-7z" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>
                {project.domain}
              </span>
              <span className={styles.live}>
                <i />
                Live
              </span>
            </div>
            <div className={styles.screen}>
              {preview ? (
                <img
                  className={styles.shot}
                  data-shot
                  src={preview.desktop}
                  srcSet={`${preview.desktopSmall} 720w, ${preview.desktop} 1440w`}
                  sizes="(max-width: 767px) 92vw, 58vw"
                  width={1440}
                  height={900}
                  alt={`${project.name} homepage`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <div className={styles.unavailable} data-shot>
                  <span className={styles.unavailableName}>{project.name}</span>
                  <span className={styles.unavailableNote}>Live preview on {project.domain}</span>
                </div>
              )}
              <span className={styles.glare} aria-hidden />
            </div>
          </div>
        </a>

        {preview && (
          <div className={styles.phone} data-phone aria-hidden>
            <img src={preview.mobile} width={390} height={844} alt="" loading="lazy" decoding="async" draggable={false} />
          </div>
        )}
      </div>

      <div className={styles.info} data-info>
        <p className={styles.index}>
          <span className={styles.mask}>
            <span data-reveal>{pad(index)}</span>
          </span>
          <span className={styles.total}>/ {pad(total)}</span>
        </p>
        <h3
          id={`project-${project.slug}`}
          className={styles.name}
          // Long single words (e.g. "Telekommunikation") scale down to stay inside the column.
          style={{ '--fit': Math.min(1, 12 / longestWord(project.name)) } as CSSProperties}
        >
          <span className={styles.mask}>
            <span data-reveal>{project.name}</span>
          </span>
        </h3>
        <ul className={styles.meta} data-fade aria-label="Project details">
          <li className={styles.category}>{project.category}</li>
          {project.platform && <li>{project.platform}</li>}
          {project.market && (
            <li className={styles.market}>
              <i aria-hidden />
              {project.market}
            </li>
          )}
        </ul>
        <p className={styles.desc} data-fade>
          {project.description}
        </p>
        <div className={styles.cta} data-fade>
          <CtaButton href={project.url} label="VIEW LIVE PROJECT" aria-label={`View ${project.name} live (opens in a new tab)`} />
        </div>
      </div>
    </article>
  )
})
