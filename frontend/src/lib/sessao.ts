import { useSyncExternalStore } from 'react'

export interface Usuario {
  id: number
  nome: string
  email: string
}

export interface Sessao {
  token: string
  usuario: Usuario
}

const CHAVE = 'servicehub:sessao'
const EVENTO = 'servicehub:sessao'

let atual: Sessao | null | undefined

function ler(): Sessao | null {
  if (atual !== undefined) return atual

  try {
    const texto = window.localStorage.getItem(CHAVE)
    atual = texto ? (JSON.parse(texto) as Sessao) : null
  } catch {
    atual = null
  }

  return atual
}

function avisar() {
  window.dispatchEvent(new Event(EVENTO))
}

export function obterSessao() {
  return ler()
}

export function salvarSessao(sessao: Sessao) {
  atual = sessao

  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    return avisar()
  }

  avisar()
}

export function encerrarSessao() {
  atual = null

  try {
    window.localStorage.removeItem(CHAVE)
  } catch {
    return avisar()
  }

  avisar()
}

function assinar(aoMudar: () => void) {
  const aoMudarSessao = () => {
    atual = undefined
    aoMudar()
  }

  const aoMudarArmazenamento = (evento: StorageEvent) => {
    if (evento.key !== CHAVE) return
    aoMudarSessao()
  }

  window.addEventListener(EVENTO, aoMudarSessao)
  window.addEventListener('storage', aoMudarArmazenamento)

  return () => {
    window.removeEventListener(EVENTO, aoMudarSessao)
    window.removeEventListener('storage', aoMudarArmazenamento)
  }
}

export function useSessao() {
  return useSyncExternalStore(assinar, ler, () => null)
}