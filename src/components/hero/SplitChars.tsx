import { memo } from 'react'

interface Props {
  text: string
  className?: string
  charClassName?: string
}

/**
 * Splits text into masked characters for reveal animations. Assistive tech
 * reads the intact string; the per-character spans are hidden from it.
 */
export const SplitChars = memo(function SplitChars({ text, className, charClassName }: Props) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {Array.from(text).map((ch, i) => (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
            <span className={charClassName} data-char style={{ display: 'inline-block' }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          </span>
        ))}
      </span>
    </span>
  )
})
