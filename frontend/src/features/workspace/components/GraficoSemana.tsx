import { motion, useReducedMotion } from 'motion/react'
import Card from '../../../components/ui/Card'
import { diaDaSemanaCurto } from '../../../lib/datas'
import type { DiaDaSemana } from '../types'

interface GraficoSemanaProps {
  dias: DiaDaSemana[]
  hoje: string
}

function GraficoSemana({ dias, hoje }: GraficoSemanaProps) {
  const reduceMotion = useReducedMotion()
  const maior = Math.max(1, ...dias.map((dia) => dia.total))
  const total = dias.reduce((soma, dia) => soma + dia.total, 0)

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold text-ink">Agendamentos da semana</h2>
        <p className="text-xs text-muted tabular-nums">{total} no total</p>
      </header>

      <div role="list" aria-label="Agendamentos por dia" className="mt-6 grid h-[200px] grid-cols-7 items-end gap-2 sm:gap-4">
        {dias.map((dia, indice) => {
          const eHoje = dia.data === hoje
          const futuro = dia.data > hoje
          const altura = dia.total === 0 ? 2 : Math.max(6, (dia.total / maior) * 100)

          return (
            <div
              key={dia.data}
              role="listitem"
              aria-label={`${diaDaSemanaCurto(dia.data)}: ${dia.total} agendamentos`}
              className="group flex h-full flex-col items-center justify-end gap-2"
            >
              <span
                className={`text-xs tabular-nums transition-colors ${eHoje ? 'font-semibold text-brand' : 'text-muted group-hover:text-ink'}`}
              >
                {dia.total}
              </span>
              <div className="flex h-[140px] w-full items-end justify-center">
                <motion.div
                  initial={reduceMotion ? false : { height: 0 }}
                  animate={{ height: `${altura}%` }}
                  transition={{ duration: 0.7, delay: 0.15 + indice * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className={`w-full max-w-[44px] rounded-md transition-colors duration-200 ${
                    eHoje
                      ? 'bg-brand'
                      : futuro
                        ? 'border border-dashed border-[#B9C9E4] bg-[#F3F6FB] group-hover:bg-[#E8EEF8]'
                        : 'bg-[#DCE5F4] group-hover:bg-[#C6D5EE]'
                  }`}
                />
              </div>
              <span className={`text-xs ${eHoje ? 'font-medium text-ink' : 'text-muted'}`}>{diaDaSemanaCurto(dia.data)}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-brand" />
          Hoje
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-[#DCE5F4]" />
          Dias anteriores
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-sm border border-dashed border-[#B9C9E4] bg-[#F3F6FB]" />
          Já agendados
        </span>
      </div>
    </Card>
  )
}

export default GraficoSemana