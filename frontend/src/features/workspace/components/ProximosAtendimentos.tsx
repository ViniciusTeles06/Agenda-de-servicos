import Avatar from '../../../components/ui/Avatar'
import Card from '../../../components/ui/Card'
import StatusBadge from '../../../components/ui/StatusBadge'
import { formatarDuracao } from '../../../lib/formatters'
import { formatarHora, paraDataIso, rotuloDoDia } from '../../../lib/datas'
import type { ProximoAtendimento } from '../types'

interface ProximosAtendimentosProps {
  atendimentos: ProximoAtendimento[]
  agora: number
}

function ProximosAtendimentos({ atendimentos, agora }: ProximosAtendimentosProps) {
  const dia = atendimentos[0] ? rotuloDoDia(paraDataIso(new Date(atendimentos[0].inicio)), agora) : ''

  return (
    <Card className="flex flex-col overflow-hidden">
      <header className="flex items-baseline justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
        <h2 className="text-sm font-semibold text-ink">Próximos atendimentos</h2>
        {dia && <p className="text-xs text-muted">{dia === 'Hoje' ? 'Hoje' : 'Amanhã cedo'}</p>}
      </header>

      {atendimentos.length === 0 ? (
        <p className="border-t border-line px-6 py-12 text-center text-xs text-muted">
          Nenhum atendimento marcado. Os próximos horários aparecem aqui.
        </p>
      ) : (
        <ol className="border-t border-line">
          {atendimentos.map((atendimento) => (
            <li
              key={atendimento.id}
              className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-b-0 hover:bg-surface-soft sm:px-6"
            >
              <div className="w-[52px] shrink-0">
                <p className="text-[13px] font-semibold text-ink tabular-nums">{formatarHora(atendimento.inicio)}</p>
                <p className="mt-0.5 text-[11px] text-muted">{formatarDuracao(atendimento.duracaoMinutos)}</p>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{atendimento.clienteNome}</p>
                <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                  <span className="truncate">{atendimento.servicoNome}</span>
                  <span aria-hidden="true" className="text-placeholder">
                    ·
                  </span>
                  <Avatar name={atendimento.profissionalNome} size="sm" variant="outline" className="hidden sm:inline-flex" />
                  <span className="truncate">{atendimento.profissionalNome.split(' ')[0]}</span>
                </p>
              </div>

              <StatusBadge tone={atendimento.status === 'confirmado' ? 'success' : 'warning'} pulse={atendimento.status === 'aguardando'}>
                {atendimento.status === 'confirmado' ? 'Confirmado' : 'Aguardando'}
              </StatusBadge>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}

export default ProximosAtendimentos