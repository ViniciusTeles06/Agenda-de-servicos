import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error'

export interface ToastOptions {
  title: string
  description?: string
  tone?: ToastTone
}

export const ToastContext = createContext<((options: ToastOptions) => void) | null>(null)

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast precisa estar dentro do ToastProvider')
  return show
}