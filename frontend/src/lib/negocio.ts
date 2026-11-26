import { useSyncExternalStore } from 'react'

export interface ConfiguracaoNegocio {
  nome: string
  email: string
  telefone: string
  endereco: string
  descricao: string
}

const CHAVE = 'servicehub:negocio'
const EVENTO = 'servicehub:negocio'
const PADRAO: ConfiguracaoNegocio = {
  nome: 'Meu Negócio',
  email: '',
  telefone: '',
  endereco: '',
  descricao: '',
}

let atual: ConfiguracaoNegocio | undefined

function ler(): ConfiguracaoNegocio {
  if (atual) return atual

  try {
    const texto = window.localStorage.getItem(CHAVE)
    if (!texto) {
      atual = PADRAO
      return atual
    }

    const dados: unknown = JSON.parse(texto)
    if (!dados || typeof dados !== 'object') {
      atual = PADRAO
      return atual
    }

    const salvo = dados as Partial<ConfiguracaoNegocio>
    atual = {
      nome: typeof salvo.nome === 'string' ? salvo.nome : PADRAO.nome,
      email: typeof salvo.email === 'string' ? salvo.email : '',
      telefone: typeof salvo.telefone === 'string' ? salvo.telefone : '',
      endereco: typeof salvo.endereco === 'string' ? salvo.endereco : '',
      descricao: typeof salvo.descricao === 'string' ? salvo.descricao : '',
    }
  } catch {
    atual = PADRAO
  }

  return atual
}

function avisar() {
  window.dispatchEvent(new Event(EVENTO))
}

export function obterConfiguracaoNegocio() {
  return ler()
}

export function salvarConfiguracaoNegocio(configuracao: ConfiguracaoNegocio) {
  window.localStorage.setItem(CHAVE, JSON.stringify(configuracao))
  atual = configuracao
  avisar()
}

function assinar(aoMudar: () => void) {
  const aoMudarConfiguracao = () => {
    atual = undefined
    aoMudar()
  }

  const aoMudarArmazenamento = (evento: StorageEvent) => {
    if (evento.key !== CHAVE) return
    aoMudarConfiguracao()
  }

  window.addEventListener(EVENTO, aoMudarConfiguracao)
  window.addEventListener('storage', aoMudarArmazenamento)

  return () => {
    window.removeEventListener(EVENTO, aoMudarConfiguracao)
    window.removeEventListener('storage', aoMudarArmazenamento)
  }
}

export function useConfiguracaoNegocio() {
  return useSyncExternalStore(assinar, ler, () => PADRAO)
}
