import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Pagination from '../../components/ui/Pagination'
import SegmentedControl from '../../components/ui/SegmentedControl'
import { paraDataIso, rotuloDoDia } from '../../lib/datas'
import { useConsulta } from '../../lib/useConsulta'
import AtividadeItem from './AtividadeItem'
import { listarAtividades } from './atividadesApi'
import type { Atividade, FiltroTipo } from './types'

const TAMANHO_PAGINA = 10

const opcoesTipo: { value: FiltroTipo; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'agendamento', label: 'Agendamentos' },
  { value: 'servico', label: 'Serviços' },
  { value: 'profissional', label: 'Profissionais' },
]

function agruparPorDia(lista: Atividade[]) {
  const grupos: { dia: string; itens: Atividade[] }[] = []

  for (const atividade of lista) {
    const dia = paraDataIso(new Date(atividade.criadoEm))
    const grupo = grupos.at(-1)
    if (grupo && grupo.dia === dia) grupo.itens.push(atividade)
    else grupos.push({ dia, itens: [atividade] })
  }

  return grupos
}

function AtividadesPage() {
  const reduceMotion = useReducedMotion()
  const [agora] = useState(() => Date.now())
  const [tipo, setTipo] = useState<FiltroTipo>('todas')
  const [pagina, setPagina] = useState(0)

  const { dados, erro, carregando, recarregar } = useConsulta(listarAtividades, { tipo, pagina, tamanho: TAMANHO_PAGINA })
  const grupos = agruparPorDia(dados?.content ?? [])

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Workspace', to: '/app' }, { label: 'Atividades' }]}
        title="Atividades"
        description="Tudo o que mudou na agenda, nos serviços e na equipe, do mais recente ao mais antigo."
      />

      <Card className="mt-7 overflow-hidden">
        <div className="overflow-x-auto border-b border-line p-4 sm:px-6">
          <SegmentedControl
            label="Filtrar por tipo"
            options={opcoesTipo}
            value={tipo}
            onChange={(valor) => {
              setTipo(valor)
              setPagina(0)
            }}
          />
        </div>

        <div aria-busy={carregando} className={`transition-opacity duration-200 ${carregando && dados ? 'opacity-60' : ''}`}>
          {carregando && !dados ? (
            <div aria-hidden="true" className="flex flex-col gap-6 px-6 py-6">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex gap-3">
                  <span className="size-8 shrink-0 animate-pulse rounded-full bg-[#EEF0ED]" />
                  <div className="flex flex-1 flex-col gap-2 pt-1">
                    <span className="h-3 w-3/4 max-w-[420px] animate-pulse rounded bg-[#EEF0ED]" />
                    <span className="h-2.5 w-32 animate-pulse rounded bg-[#F3F4F1]" />
                  </div>
                </div>
              ))}
            </div>
          ) : erro && !dados ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">Não foi possível carregar as atividades</p>
              <p className="max-w-sm text-xs text-muted">{erro.message}</p>
              <Button variant="secondary" size="sm" onClick={recarregar}>
                Tentar de novo
              </Button>
            </div>
          ) : grupos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <p className="text-sm font-medium text-ink">Nenhuma atividade por aqui</p>
              <p className="max-w-sm text-xs text-muted">Quando alguém mexer na agenda, nos serviços ou na equipe, aparece aqui.</p>
            </div>
          ) : (
            grupos.map((grupo) => (
              <section key={grupo.dia} aria-label={rotuloDoDia(grupo.dia, agora)} className="border-b border-line last:border-b-0">
                <h2 className="bg-surface-soft px-4 py-2.5 text-xs font-medium text-muted sm:px-6">{rotuloDoDia(grupo.dia, agora)}</h2>
                <ol className="flex flex-col">
                  {grupo.itens.map((atividade, index) => (
                    <motion.li
                      key={atividade.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
                      className="px-4 py-4 sm:px-6"
                    >
                      <AtividadeItem atividade={atividade} agora={agora} mostrarHora />
                    </motion.li>
                  ))}
                </ol>
              </section>
            ))
          )}
        </div>

        {dados && dados.content.length > 0 && (
          <div className="border-t border-line px-4 py-3 sm:px-6">
            <Pagination
              page={dados.number}
              totalPages={dados.totalPages}
              totalItems={dados.totalElements}
              pageSize={dados.size}
              onChange={setPagina}
            />
          </div>
        )}
      </Card>
    </>
  )
}

export default AtividadesPage