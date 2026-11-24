import { CalendarCheck2, Scissors, UserRound } from 'lucide-react'
import { formatarHora, tempoRelativo } from '../../lib/datas'
import type { Atividade, TipoAtividade } from './types'

const icones: Record<TipoAtividade, { icone: typeof CalendarCheck2; classe: string; rotulo: string }> = {
  agendamento: { icone: CalendarCheck2, classe: 'bg-[#EDF2FA] text-brand', rotulo: 'Agendamento' },
  servico: { icone: Scissors, classe: 'bg-[#F8F2E5] text-warning', rotulo: 'Serviço' },
  profissional: { icone: UserRound, classe: 'bg-[#EAF2EC] text-accent', rotulo: 'Profissional' },
}

interface AtividadeItemProps {
  atividade: Atividade
  agora: number
  mostrarHora?: boolean
}

function AtividadeItem({ atividade, agora, mostrarHora = false }: AtividadeItemProps) {
  const { icone: Icone, classe, rotulo } = icones[atividade.tipo]

  return (
    <div className="flex gap-3">
      <span aria-label={rotulo} role="img" className={`mt-px flex size-8 shrink-0 items-center justify-center rounded-full ${classe}`}>
        <Icone aria-hidden="true" size={15} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug text-ink">{atividade.descricao}</p>
        <p className="mt-1 text-xs text-muted">
          {atividade.autor}
          <span aria-hidden="true" className="mx-1.5 text-placeholder">
            ·
          </span>
          <time dateTime={atividade.criadoEm} title={new Date(atividade.criadoEm).toLocaleString('pt-BR')}>
            {mostrarHora ? formatarHora(atividade.criadoEm) : tempoRelativo(atividade.criadoEm, agora)}
          </time>
        </p>
      </div>
    </div>
  )
}

export default AtividadeItem