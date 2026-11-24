import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, atraso = 300) {
  const [atual, setAtual] = useState(valor)

  useEffect(() => {
    const timer = window.setTimeout(() => setAtual(valor), atraso)
    return () => window.clearTimeout(timer)
  }, [valor, atraso])

  return atual
}