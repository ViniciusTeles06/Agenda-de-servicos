import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { formatarDataLonga, paraDataIso } from '../../lib/datas'
import { useConsulta } from '../../lib/useConsulta'
import AtividadeItem from '../atividades/AtividadeItem'
import { listarAtividades } from '../atividades/atividadesApi'
import GraficoSemana from './components/GraficoSemana'
import Indicador from './components/Indicador'
import ProximosAtendimentos from './components/ProximosAtendimentos'
import { buscarResumo } from './workspaceApi'
import type { ServicoAgendado } from './types'

function Bloco({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[10px] border border-line bg-surface ${className}`} />
}

function ServicosMaisAgendados({ servicos }: { servicos: ServicoAgendado[] }) {
  const reduceMotion = useReducedMotion()
  const maior = Math.max(1, ...servicos.map((servico) => servico.total))

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">Serviços mais procurados</h2>
        <Link to="/app/servicos" className="text-xs text-muted transition-colors hover:text-ink">
          Ver serviços
        </Link>
      </header>

      {servicos.length === 0 ? (
        <p className="flex flex-1 items-center justify-center py-10 text-center text-xs text-muted">
          Cadastre serviços ativos para ver o ranking.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col gap-4">
          {servicos.map((servico, indice) => (
            <li key={servico.id} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate text-ink">{servico.nome}</span>
                <span className="shrink-0 text-xs text-muted tabular-nums">{servico.total} no mês</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#EEF0ED]">
                <motion.div
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={{ width: `${(servico.total / maior) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.25 + indice * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${indice === 0 ? 'bg-accent' : 'bg-[#9FBDB1]'}`}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

function AtividadesRecentes({ agora }: { agora: number }) {
  const { dados, erro, carregando } = useConsulta(listarAtividades, { tipo: 'todas', pagina: 0, tamanho: 5 })

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">Atividades recentes</h2>
        <Link
          to="/app/atividades"
          className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
        >
          Ver todas
          <ArrowRight size={13} strokeWidth={1.7} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </header>

      {carregando && !dados ? (
        <div aria-hidden="true" className="mt-5 flex flex-col gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex gap-3">
              <span className="size-8 shrink-0 animate-pulse rounded-full bg-[#EEF0ED]" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <span className="h-3 w-full animate-pulse rounded bg-[#EEF0ED]" />
                <span className="h-2.5 w-24 animate-pulse rounded bg-[#F3F4F1]" />
              </div>
            </div>
          ))}
        </div>
      ) : erro && !dados ? (
        <p className="py-10 text-center text-xs text-muted">{erro.message}</p>
      ) : dados && dados.content.length > 0 ? (
        <ol className="mt-5 flex flex-col gap-5">
          {dados.content.map((atividade) => (
            <li key={atividade.id}>
              <AtividadeItem atividade={atividade} agora={agora} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-10 text-center text-xs text-muted">Nenhuma atividade ainda.</p>
      )}
    </Card>
  )
}

function WorkspacePage() {
  const [agora] = useState(() => Date.now())
  const hoje = paraDataIso(new Date(agora))
  const { dados, erro, carregando, recarregar } = useConsulta(buscarResumo, hoje)

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Visão geral' }]}
        title="Visão geral"
        description={`${formatarDataLonga(new Date(agora))}. Veja como está o dia e o que vem pela frente.`}
      />

      {erro && !dados ? (
        <Card className="mt-7 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink">Não foi possível carregar o resumo</p>
          <p className="max-w-sm text-xs text-muted">{erro.message}</p>
          <Button variant="secondary" size="sm" onClick={recarregar}>
            Tentar de novo
          </Button>
        </Card>
      ) : carregando && !dados ? (
        <div className="mt-7 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Bloco key={item} className="h-[118px]" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <Bloco className="h-[330px]" />
            <Bloco className="h-[330px]" />
          </div>
        </div>
      ) : dados ? (
        <div className="mt-7 flex flex-col gap-4">
          <section aria-label="Indicadores de hoje" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Indicador titulo="Agendamentos hoje" valor={dados.hoje.total} anterior={dados.ontem.total} tom="brand" />
            <Indicador
              titulo="Confirmados"
              valor={dados.hoje.confirmados}
              anterior={dados.ontem.confirmados}
              tom="success"
              atraso={0.08}
            />
            <Indicador
              titulo="Aguardando confirmação"
              valor={dados.hoje.aguardando}
              anterior={dados.ontem.aguardando}
              tom="warning"
              menorEhMelhor
              atraso={0.16}
            />
            <Indicador
              titulo="Cancelados"
              valor={dados.hoje.cancelados}
              anterior={dados.ontem.cancelados}
              tom="danger"
              menorEhMelhor
              atraso={0.24}
            />
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <GraficoSemana dias={dados.semana} hoje={hoje} />
            <ServicosMaisAgendados servicos={dados.servicosMaisAgendados} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <ProximosAtendimentos atendimentos={dados.proximos} agora={agora} />
            <AtividadesRecentes agora={agora} />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default WorkspacePage