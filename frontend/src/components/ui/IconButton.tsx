import type { ComponentProps, ReactNode } from 'react'

type IconButtonTone = 'default' | 'danger'

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children'> {
  label: string
  icon: ReactNode
  tone?: IconButtonTone
}

const toneClasses: Record<IconButtonTone, string> = {
  default: 'hover:bg-surface-soft hover:text-ink',
  danger: 'hover:bg-[#FBEDED] hover:text-danger',
}

function IconButton({ label, icon, tone = 'default', className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  )
}

export default IconButton