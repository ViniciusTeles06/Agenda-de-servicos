import { esperar, lerArmazenado, montarQuery, requisicao, usandoApiReal } from '../../lib/api'
import { paraDataIso, somarDias } from '../../lib/datas'
import { CHAVE_PROFISSIONAIS, nomesDosServicos, servicosAtivos } from '../servicos/servicosApi'
import type { ContagemStatus, ProximoAtendimento, ResumoWorkspace, StatusAgendamento } from './types'

const clientes = [
  'Mariana Alves',
  'Pedro Henrique',
  'Juliana Costa',
  'Rafael Torres',
  'Beatriz Lopes',
  'Lucas Ferreira',
  'Camila Rocha',
  'Thiago Nunes',
  'Larissa Melo',
  'Gustavo Pires',
]

function sorteio(semente: string) {
  let estado = 0
  for (const letra of semente) estado = (estado * 31 + letra.charCodeAt(0)) >>> 0

  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inteiro(aleatorio: () => number, minimo: number, maximo: number) {
  return minimo + Math.floor(aleatorio() * (maximo - minimo + 1))
}

function totalDoDia(data: Date) {
  const aleatorio = sorteio(paraDataIso(data))
  const diaSemana = data.getDay()
  if (diaSemana === 0) return 0
  if (diaSemana === 6) return inteiro(aleatorio, 4, 8)
  return inteiro(aleatorio, 7, 15)
}

function contagem(data: Date): ContagemStatus {
  const total = totalDoDia(data)
  const aleatorio = sorteio(`status-${paraDataIso(data)}`)
  const cancelados = Math.min(total, inteiro(aleatorio, 0, 2))
  const aguardando = Math.min(total - cancelados, inteiro(aleatorio, 1, 3))
  return { total, confirmados: total - cancelados - aguardando, aguardando, cancelados }
}

function inicioDaSemana(data: Date) {
  const diaSemana = data.getDay() === 0 ? 7 : data.getDay()
  return somarDias(data, 1 - diaSemana)
}

function gerarProximos(agora: Date): ProximoAtendimento[] {
  const ativos = new Set(servicosAtivos().map((servico) => servico.id))
  const profissionais = lerArmazenado<{ nome: string; ativo: boolean; servicoIds: number[] }[]>(CHAVE_PROFISSIONAIS, [])
    .filter((item) => item.ativo)
    .map((item) => ({
      nome: item.nome,
      servicos: nomesDosServicos(item.servicoIds).filter((servico) => ativos.has(servico.id)),
    }))
    .filter((item) => item.servicos.length > 0)

  if (profissionais.length === 0) return []

  const aleatorio = sorteio(`proximos-${paraDataIso(agora)}`)
  const inicio = new Date(agora)
  inicio.setSeconds(0, 0)
  inicio.setMinutes(inicio.getMinutes() < 30 ? 30 : 60)

  if (inicio.getHours() >= 18 || inicio.getHours() < 8) {
    if (inicio.getHours() >= 18) inicio.setDate(inicio.getDate() + 1)
    inicio.setHours(8, 0, 0, 0)
  }

  const lista: ProximoAtendimento[] = []
  const atual = new Date(inicio)

  for (let indice = 0; indice < 5; indice += 1) {
    const profissional = profissionais[inteiro(aleatorio, 0, profissionais.length - 1)]
    const servico = profissional.servicos[inteiro(aleatorio, 0, profissional.servicos.length - 1)]
    const status: StatusAgendamento = aleatorio() < 0.75 ? 'confirmado' : 'aguardando'

    lista.push({
      id: indice + 1,
      inicio: atual.toISOString(),
      duracaoMinutos: [30, 45, 60][inteiro(aleatorio, 0, 2)],
      clienteNome: clientes[inteiro(aleatorio, 0, clientes.length - 1)],
      servicoNome: servico.nome,
      profissionalNome: profissional.nome,
      status,
    })

    atual.setMinutes(atual.getMinutes() + [30, 30, 60, 90][inteiro(aleatorio, 0, 3)])
  }

  return lista
}

export async function buscarResumo(data: string): Promise<ResumoWorkspace> {
  if (usandoApiReal) {
    return requisicao(`/api/relatorios/resumo${montarQuery({ data })}`)
  }

  await esperar(450)
  const agora = new Date()
  const hoje = new Date(`${data}T12:00:00`)
  const segunda = inicioDaSemana(hoje)
  const aleatorio = sorteio(`servicos-${data}`)

  const servicosMaisAgendados = servicosAtivos()
    .map((servico) => ({ ...servico, total: inteiro(aleatorio, 2, 26) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return {
    hoje: contagem(hoje),
    ontem: contagem(somarDias(hoje, -1)),
    semana: Array.from({ length: 7 }, (_, indice) => {
      const dia = somarDias(segunda, indice)
      return { data: paraDataIso(dia), total: totalDoDia(dia) }
    }),
    servicosMaisAgendados,
    proximos: gerarProximos(agora),
  }
}