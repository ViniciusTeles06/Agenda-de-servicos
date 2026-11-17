import { useId } from 'react'
import type { ComponentProps } from 'react'

interface TextareaProps extends ComponentProps<'textarea'> {
  label?: string
  hint?: string
  error?: string
  containerClassName?: string
}

function Textarea({
  label,
  hint,
  error,
  id,
  className = '',
  containerClassName = '',
  maxLength,
  value,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const messageId = `${textareaId}-message`
  const message = error ?? hint
  const hasError = Boolean(error)
  const length = typeof value === 'string' ? value.length : 0

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={textareaId} className="text-[13px] leading-none font-medium text-ink">
            {label}
          </label>
          {maxLength && (
            <span className={`text-[11px] tabular-nums ${length >= maxLength ? 'text-danger' : 'text-placeholder'}`}>
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        value={value}
        maxLength={maxLength}
        aria-invalid={hasError || undefined}
        aria-describedby={message ? messageId : undefined}
        className={`min-h-[88px] w-full resize-y rounded-md border bg-surface px-3.5 py-2.5 text-xs leading-relaxed text-ink transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-placeholder ${
          hasError
            ? 'border-danger focus:shadow-[0_0_0_4px_rgba(187,7,10,0.12)]'
            : 'border-line hover:border-[#D3D9D4] focus:border-brand focus:shadow-[0_0_0_4px_rgba(19,71,161,0.14)]'
        } ${className}`}
        {...props}
      />

      {message && (
        <p id={messageId} className={`text-xs leading-snug ${hasError ? 'text-danger' : 'text-muted'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Textarea