import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral'

interface StatusBadgeProps {
  tone: StatusTone
  children: ReactNode
  pulse?: boolean
  className?: string
}

const toneStyles: Record<StatusTone, { badge: string; dot: string; rgb: string }> = {
  success: { badge: 'bg-success-soft text-success', dot: 'bg-success', rgb: '23, 179, 25' },
  warning: { badge: 'bg-warning-soft text-warning', dot: 'bg-warning', rgb: '146, 105, 29' },
  danger: { badge: 'bg-danger-soft text-danger', dot: 'bg-danger', rgb: '187, 7, 10' },
  neutral: { badge: 'bg-[#F1F2EF] text-muted', dot: 'bg-placeholder', rgb: '146, 154, 149' },
}

function StatusBadge({ tone, children, pulse = false, className = '' }: StatusBadgeProps) {
  const reduceMotion = useReducedMotion()
  const styles = toneStyles[tone]
  const showPulse = pulse && !reduceMotion

  return (
    <span
      className={`inline-flex h-[23px] items-center gap-1.5 rounded-full px-2.5 text-xs whitespace-nowrap ${styles.badge} ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className={`size-[5px] shrink-0 rounded-full ${styles.dot}`}
        animate={
          showPulse
            ? {
                scale: [1, 1.15, 1],
                boxShadow: [
                  `0 0 0 0 rgba(${styles.rgb}, 0.45)`,
                  `0 0 0 4px rgba(${styles.rgb}, 0)`,
                  `0 0 0 0 rgba(${styles.rgb}, 0)`,
                ],
              }
            : undefined
        }
        transition={
          showPulse
            ? {
                duration: 1.8,
                ease: 'easeOut',
                times: [0, 0.7, 1],
                repeat: Infinity,
              }
            : undefined
        }
      />
      {children}
    </span>
  )
}

export default StatusBadge