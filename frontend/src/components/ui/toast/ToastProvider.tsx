import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ToastContext } from './toastContext'
import type { ToastOptions } from './toastContext'

interface ToastItem extends ToastOptions {
  id: number
}

let nextId = 0

function ToastProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (options: ToastOptions) => {
      nextId += 1
      const id = nextId
      setToasts((current) => [...current.slice(-2), { ...options, id }])
      window.setTimeout(() => dismiss(id), options.tone === 'error' ? 6000 : 3500)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const isError = toast.tone === 'error'
            const Icon = isError ? CircleAlert : CircleCheck

            return (
              <motion.div
                key={toast.id}
                layout={!reduceMotion}
                role={isError ? 'alert' : 'status'}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-line bg-surface py-3 pr-2 pl-3.5 shadow-[0_16px_40px_-16px_rgba(32,40,36,0.35)] sm:w-[340px]"
              >
                <Icon
                  aria-hidden="true"
                  size={18}
                  strokeWidth={1.8}
                  className={`mt-px shrink-0 ${isError ? 'text-danger' : 'text-accent'}`}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-[13px] leading-tight font-medium text-ink">{toast.title}</p>
                  {toast.description && <p className="text-xs leading-snug text-muted">{toast.description}</p>}
                </div>
                <button
                  type="button"
                  aria-label="Fechar aviso"
                  onClick={() => dismiss(toast.id)}
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  <X size={14} strokeWidth={1.6} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider