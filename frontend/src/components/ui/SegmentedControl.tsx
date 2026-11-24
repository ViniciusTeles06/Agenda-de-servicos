import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

function SegmentedControl<T extends string>({ options, value, onChange, label }: SegmentedControlProps<T>) {
  const reduceMotion = useReducedMotion()
  const indicatorId = useId()

  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-[38px] items-center rounded-md border border-line bg-surface-soft p-[3px]">
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`relative h-full rounded-[5px] px-3 text-xs transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${
              active ? 'font-medium text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {active && (
              <motion.span
                layoutId={indicatorId}
                transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[5px] border border-line bg-surface shadow-[0_1px_2px_rgba(32,40,36,0.06)]"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl