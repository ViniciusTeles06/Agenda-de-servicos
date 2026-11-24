import { apiAtiva, esperar, lerArmazenado, montarQuery, paginar, requisicao, salvarArmazenado } from '../../lib/api'
import type { Pagina } from '../../lib/api'
import type { Atividade, FiltrosAtividade, TipoAtividade } from './types'

const CHAVE = 'servicehub:atividades'
const MINUTO = 60 * 1000

function minutosAtras(minutos: number) {
  return new Date(Date.now() - minutos * MINUTO).toISOString()
}

function iniciais(): Atividade[] {
  const modelo: [TipoAtividade, string, string, number][] = [
    ['agendamento', 'Agendamento de Mariana Alves confirmado para Corte de cabelo às 14:00', 'Ana Souza', 12],
    ['agendamento', 'Novo agendamento de Pedro Henrique para Barba amanhã às 09:30', 'Bruno Lima', 38],
    ['agendamento', 'Agendamento de Juliana Costa cancelado pelo cliente', 'Carla Mendes', 95],
    ['servico', 'Serviço Coloração passou a durar 1h 30min', 'Administrador', 180],
    ['profissional', 'Carla Mendes passou a atender Massagem relaxante', 'Administrador', 320],
    ['agendamento', 'Agendamento de Rafael Torres concluído', 'Bruno Lima', 1500],
    ['profissional', 'Diego Santos foi desativado', 'Administrador', 1620],
    ['servico', 'Serviço Limpeza de pele foi desativado', 'Administrador', 1700],
    ['agendamento', 'Agendamento de Beatriz Lopes remarcado para sexta às 16:00', 'Ana Souza', 2900],
    ['servico', 'Novo serviço Design de sobrancelha cadastrado', 'Administrador', 3100],
    ['profissional', 'Horários de Ana Souza atualizados', 'Administrador', 4400],
    ['agendamento', 'Novo agendamento de Lucas Ferreira para Manicure', 'Carla Mendes', 4600],
  ]

  return modelo.map(([tipo, descricao, autor, minutos], indice) => ({
    id: modelo.length - indice,
    tipo,
    descricao,
    autor,
    criadoEm: minutosAtras(minutos),
  }))
}

let atividades = lerArmazenado<Atividade[]>(CHAVE, iniciais())

export function registrarAtividade(tipo: TipoAtividade, descricao: string) {
  if (apiAtiva('atividades')) return

  const id = Math.max(0, ...atividades.map((item) => item.id)) + 1
  atividades = [{ id, tipo, descricao, autor: 'Você', criadoEm: new Date().toISOString() }, ...atividades].slice(0, 200)
  salvarArmazenado(CHAVE, atividades)
}

export async function listarAtividades(filtros: FiltrosAtividade): Promise<Pagina<Atividade>> {
  if (apiAtiva('atividades')) {
    const query = montarQuery({
      tipo: filtros.tipo === 'todas' ? undefined : filtros.tipo,
      page: filtros.pagina,
      size: filtros.tamanho,
      sort: 'criadoEm,desc',
    })
    return requisicao(`/api/atividades${query}`)
  }

  await esperar()

  const filtradas = atividades
    .filter((item) => filtros.tipo === 'todas' || item.tipo === filtros.tipo)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))

  return paginar(filtradas, filtros.pagina, filtros.tamanho)
}