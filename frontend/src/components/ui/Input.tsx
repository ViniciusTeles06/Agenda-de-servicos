import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'

interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  label?: string
  hint?: string
  error?: string
  icon?: ReactNode
  trailing?: ReactNode
  containerClassName?: string
}

function Input({
  label,
  hint,
  error,
  icon,
  trailing,
  id,
  className = '',
  containerClassName = '',
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error ?? hint
  const hasError = Boolean(error)

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-[13px] leading-none font-medium text-ink">
          {label}
        </label>
      )}

      <div className="group relative">
        {icon && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 left-3.5 flex -translate-y-1/2 transition-[color,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-within:scale-110 ${
              hasError ? 'text-danger' : 'text-muted group-focus-within:text-brand'
            }`}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? messageId : undefined}
          className={`h-[38px] w-full rounded-md border bg-surface text-xs text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-placeholder disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60 ${
            icon ? 'pl-[38px]' : 'pl-3.5'
          } ${trailing ? 'pr-10' : 'pr-3.5'} ${
            hasError
              ? 'border-danger focus:shadow-[0_0_0_4px_rgba(187,7,10,0.12)]'
              : 'border-line hover:border-[#D3D9D4] focus:border-brand focus:shadow-[0_0_0_4px_rgba(19,71,161,0.14)]'
          } ${className}`}
          {...props}
        />

        {trailing && <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2">{trailing}</span>}
      </div>

      {message && (
        <p id={messageId} className={`text-xs leading-snug ${hasError ? 'text-danger' : 'text-muted'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Input