import { useCallback, useEffect, useState } from 'react'

interface EstadoConsulta<T> {
  chave: string
  dados?: T
  erro?: Error
}

export function useConsulta<P, T>(buscar: (parametros: P) => Promise<T>, parametros: P) {
  const [versao, setVersao] = useState(0)
  const [estado, setEstado] = useState<EstadoConsulta<T> | null>(null)
  const json = JSON.stringify(parametros)
  const chave = `${versao}:${json}`

  useEffect(() => {
    let ativo = true

    buscar(JSON.parse(json) as P).then(
      (dados) => {
        if (ativo) setEstado({ chave, dados })
      },
      (erro: unknown) => {
        if (!ativo) return
        const falha = erro instanceof Error ? erro : new Error('Algo deu errado. Tente de novo.')
        setEstado((anterior) => ({ chave, dados: anterior?.dados, erro: falha }))
      },
    )

    return () => {
      ativo = false
    }
  }, [buscar, json, chave])

  const recarregar = useCallback(() => setVersao((atual) => atual + 1), [])
  const carregando = estado?.chave !== chave

  return {
    dados: estado?.dados,
    erro: carregando ? undefined : estado?.erro,
    carregando,
    recarregar,
  }
}