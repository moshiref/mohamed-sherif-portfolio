import { useEffect, useRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type Ref } from 'react'
import { gsap } from 'gsap'
import styles from './CtaButton.module.css'

interface BaseProps {
  label: string
  variant?: 'primary' | 'ghost'
  className?: string
}

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined }
/** With `href` the CTA renders as a real link; external URLs open in a new tab. */
type LinkProps = BaseProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & { href: string }

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
      <path d="M3 13 13 3M5.5 3H13v7.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

/** Pill CTA with a subtle magnetic pull on fine pointers and a label roll on hover. */
export function CtaButton(props: ButtonProps | LinkProps) {
  const { label, variant = 'primary', className, ...rest } = props
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' })
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x((e.clientX - (r.left + r.width / 2)) * 0.18)
      y((e.clientY - (r.top + r.height / 2)) * 0.3)
    }
    const leave = () => {
      x(0)
      y(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  const cls = `${styles.cta} ${styles[variant]} ${className ?? ''}`
  const content = (
    <>
      <span className={styles.fill} aria-hidden />
      <span className={styles.label} data-text={label}>
        <span>{label}</span>
      </span>
      <span className={styles.icon}>
        <Arrow />
      </span>
    </>
  )

  if (typeof rest.href === 'string') {
    const anchor = rest as Omit<LinkProps, keyof BaseProps>
    const external = /^https?:\/\//.test(anchor.href)
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        className={cls}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        {...anchor}
      >
        {content}
      </a>
    )
  }

  return (
    <button ref={ref as Ref<HTMLButtonElement>} type="button" className={cls} {...(rest as Omit<ButtonProps, keyof BaseProps>)}>
      {content}
    </button>
  )
}
