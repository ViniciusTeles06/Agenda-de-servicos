import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
}

function Switch({ checked, onChange, label, description, disabled = false }: SwitchProps) {
  const reduceMotion = useReducedMotion()
  const labelId = useId()
  const descriptionId = useId()

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1">
        <span id={labelId} className="text-[13px] leading-none font-medium text-ink">
          {label}
        </span>
        {description && (
          <span id={descriptionId} className="text-xs leading-snug text-muted">
            {description}
          </span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[3px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'justify-end bg-accent' : 'justify-start bg-[#D9DED9]'
        }`}
      >
        <motion.span
          layout
          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 600, damping: 34 }}
          className="size-4 rounded-full bg-white shadow-[0_1px_3px_rgba(32,40,36,0.25)]"
        />
      </button>
    </div>
  )
}

export default Switch