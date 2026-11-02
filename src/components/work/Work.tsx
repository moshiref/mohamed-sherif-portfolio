import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { bindGroupDividers, bindProjectScenes, buildWorkEntrance } from '@/animation/workTimeline'
import { projects, workGroups, type Project } from '@/config/projects'
import { SplitChars } from '@/components/hero/SplitChars'
import { ProjectShowcase } from './ProjectShowcase'
import styles from './Work.module.css'

const groups = (['client', 'portfolio'] as const).map((key) => ({
  key,
  ...workGroups[key],
  items: projects.filter((p) => p.group === key),
}))
const markets = Array.from(new Set(projects.map((p) => p.market).filter(Boolean))) as string[]

/**
 * Chapter three: Selected Work. Rises over the finished About scene, then
 * presents each real project as its own scene, in the fixed order of the
 * `projects` config (custom-domain client work first).
 */
export function Work() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const work = root.current
    const stage = document.querySelector<HTMLElement>('[data-story-stage]')
    if (!work || !stage) return

    const mm = gsap.matchMedia()
    mm.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        lite: '(max-width: 767px), (pointer: coarse)',
      },
      (ctx) => {
        const { motion, lite } = ctx.conditions as Record<string, boolean>
        if (!motion) return
        const disposeEntrance = buildWorkEntrance(work, stage, { lite })
        bindGroupDividers(work)
        bindProjectScenes(work, { lite })
        return disposeEntrance
      },
    )
    return () => mm.revert()
  }, [])

  let running = 0
  const numbered = (p: Project) => projects.indexOf(p) + 1

  return (
    <section ref={root} id="work" className={styles.work} aria-labelledby="work-title">
      <span className={styles.seam} data-work-seam aria-hidden />

      <header className={styles.opener} data-work-opener>
        <p className={styles.eyebrow} data-work-fade>
          <span className={styles.eyebrowLine} aria-hidden />
          REAL PROJECTS · REAL CLIENTS
        </p>
        <h2 id="work-title" className={styles.title} data-work-title>
          <SplitChars text="SELECTED" className={styles.titleLine} />
          <SplitChars text="WORK" className={`${styles.titleLine} ${styles.titleChrome}`} charClassName={styles.chrome} />
        </h2>
        <div className={styles.openerMeta}>
          <p className={styles.count} data-work-fade>
            <span className={styles.countNum}>{String(projects.length).padStart(2, '0')}</span>
            <span>
              PROJECTS
              <br />
              <span className={styles.dim}>{markets.join(' · ').toUpperCase()} & BEYOND</span>
            </span>
          </p>
          <p className={styles.lede} data-work-fade>
            Commercial client work comes first, followed by portfolios, platforms and web applications. Every preview
            is the real, live website.
          </p>
        </div>
      </header>

      <div className={styles.list}>
        {groups.map((group) => (
          <Fragment key={group.key}>
            <div className={styles.group} data-group>
              <span className={styles.groupRule} data-group-rule aria-hidden />
              <h3 className={styles.groupLabel} data-group-item>
                {group.label}
              </h3>
              <p className={styles.groupNote} data-group-item>
                {group.note}
              </p>
              <p className={styles.groupRange} data-group-item>
                {String(numbered(group.items[0])).padStart(2, '0')} —{' '}
                {String(numbered(group.items[group.items.length - 1])).padStart(2, '0')}
              </p>
            </div>
            {group.items.map((project) => (
              <ProjectShowcase
                key={project.slug}
                project={project}
                index={numbered(project)}
                total={projects.length}
                side={running++ % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
