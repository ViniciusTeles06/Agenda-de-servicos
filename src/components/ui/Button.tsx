import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md'
type IconHover = 'none' | 'rotate' | 'drop' | 'nudge'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconHover?: IconHover
  children?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-[0_1px_2px_rgba(19,71,161,0.2)] hover:bg-brand-hover hover:shadow-[0_10px_24px_-10px_rgba(19,71,161,0.65)]',
  secondary: 'border border-line bg-surface text-ink hover:border-[#D3D9D4] hover:bg-surface-soft',
  ghost: 'text-muted hover:bg-surface-soft hover:text-ink',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-2 px-3 text-[13px]',
  md: 'h-10 gap-2.5 px-4 text-sm',
}

const iconHoverClasses: Record<IconHover, string> = {
  none: '',
  rotate: 'group-hover:rotate-90',
  drop: 'group-hover:translate-y-0.5',
  nudge: 'group-hover:translate-x-0.5',
}

function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconHover = 'none',
  children,
  className = '',
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion()
  const animated = !reduceMotion && !disabled

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileHover={animated ? { y: -1 } : undefined}
      whileTap={animated ? { scale: 0.97, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`group inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && (
        <span
          aria-hidden="true"
          className={`flex shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${iconHoverClasses[iconHover]}`}
        >
          {icon}
        </span>
      )}
      {children}
    </motion.button>
  )
}

export default Button