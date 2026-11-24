import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type ModalWidth = 'sm' | 'md' | 'lg'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  width?: ModalWidth
  closeDisabled?: boolean
}

const widthClasses: Record<ModalWidth, string> = {
  sm: 'sm:max-w-[420px]',
  md: 'sm:max-w-[540px]',
  lg: 'sm:max-w-[680px]',
}

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function Modal({ open, onClose, title, description, children, footer, width = 'md', closeDisabled = false }: ModalProps) {
  const reduceMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel || panel.contains(document.activeElement)) return
      const autofocus = panel.querySelector<HTMLElement>('[data-autofocus]')
      ;(autofocus ?? panel).focus()
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open || closeDisabled) return

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, closeDisabled, onClose])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !panelRef.current) return

    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector))
    if (items.length === 0) return

    const first = items[0]
    const last = items[items.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" onKeyDown={handleKeyDown}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-[rgba(32,40,36,0.32)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDisabled ? undefined : onClose}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-[0_24px_64px_-24px_rgba(32,40,36,0.35)] outline-none sm:rounded-xl ${widthClasses[width]}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
              <div className="flex flex-col gap-1.5">
                <h2 id={titleId} className="text-base leading-tight font-semibold tracking-[-0.2px] text-ink">
                  {title}
                </h2>
                {description && (
                  <p id={descriptionId} className="text-xs leading-snug text-muted">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Fechar"
                disabled={closeDisabled}
                onClick={onClose}
                className="-mt-1 -mr-2 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:opacity-40"
              >
                <X size={16} strokeWidth={1.6} />
              </button>
            </header>

            {children && <div className="overflow-y-auto px-6 py-5">{children}</div>}

            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-surface-soft px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal