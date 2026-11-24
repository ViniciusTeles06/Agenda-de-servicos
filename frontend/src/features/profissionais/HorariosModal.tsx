import { useState } from 'react'
import type { FormEvent } from 'react'
import { CopyCheck, Plus, X } from 'lucide-react'
import Button from '../../components/ui/Button'
import IconButton from '../../components/ui/IconButton'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { useConsulta } from '../../lib/useConsulta'
import { DIAS_SEMANA, erroDoIntervalo, formatarHorasSemana, minutosPorSemana } from './horarios'
import { listarDisponibilidades, salvarDisponibilidades } from './profissionaisApi'
import type { Disponibilidade, Profissional } from './types'

interface HorariosModalProps {
  open: boolean
  profissional: Profissional | null
  onClose: () => void
  onSaved: (profissional: Profissional) => void
}

interface Intervalo {
  chave: number
  horaInicio: string
  horaFim: string
}

interface Dia {
  ativo: boolean
  intervalos: Intervalo[]
}

type Semana = Record<number, Dia>

let proximaChave = 0

function novoIntervalo(horaInicio = '09:00', horaFim = '18:00'): Intervalo {
  proximaChave += 1
  return { chave: proximaChave, horaInicio, horaFim }
}

function montarSemana(lista: Disponibilidade[]): Semana {
  const semana: Semana = {}

  for (const dia of DIAS_SEMANA) {
    const doDia = lista.filter((item) => item.diaSemana === dia.valor)
    semana[dia.valor] = {
      ativo: doDia.length > 0,
      intervalos: doDia.length > 0 ? doDia.map((item) => novoIntervalo(item.horaInicio, item.horaFim)) : [novoIntervalo()],
    }
  }

  return semana
}

function paraLista(semana: Semana): Disponibilidade[] {
  return DIAS_SEMANA.flatMap((dia) =>
    semana[dia.valor].ativo
      ? semana[dia.valor].intervalos.map((item) => ({ diaSemana: dia.valor, horaInicio: item.horaInicio, horaFim: item.horaFim }))
      : [],
  )
}

function errosDaSemana(semana: Semana) {
  const erros: Record<number, string> = {}

  for (const dia of DIAS_SEMANA) {
    if (!semana[dia.valor].ativo) continue
    const lista = semana[dia.valor].intervalos.map((item) => ({ ...item, diaSemana: dia.valor }))

    lista.forEach((item, indice) => {
      const anteriores = lista.slice(0, indice)
      const erro = erroDoIntervalo(item, anteriores)
      if (erro) erros[item.chave] = erro
    })
  }

  return erros
}

interface EditorProps {
  profissional: Profissional
  inicial: Disponibilidade[]
  onSalvando: (salvando: boolean) => void
  onSaved: (profissional: Profissional) => void
}

function EditorHorarios({ profissional, inicial, onSalvando, onSaved }: EditorProps) {
  const [semana, setSemana] = useState<Semana>(() => montarSemana(inicial))
  const [enviado, setEnviado] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  const erros = enviado ? errosDaSemana(semana) : {}
  const totalMinutos = minutosPorSemana(paraLista(semana))
  const diasAtivos = DIAS_SEMANA.filter((dia) => semana[dia.valor].ativo).length

  function alterarDia(valor: number, dia: Partial<Dia>) {
    setSemana((atual) => ({ ...atual, [valor]: { ...atual[valor], ...dia } }))
  }

  function alterarIntervalo(valor: number, chave: number, campo: 'horaInicio' | 'horaFim', hora: string) {
    setSemana((atual) => ({
      ...atual,
      [valor]: {
        ...atual[valor],
        intervalos: atual[valor].intervalos.map((item) => (item.chave === chave ? { ...item, [campo]: hora } : item)),
      },
    }))
  }

  function adicionarIntervalo(valor: number) {
    const ultimo = semana[valor].intervalos.at(-1)
    const inicio = ultimo?.horaFim && ultimo.horaFim < '22:00' ? ultimo.horaFim : '14:00'
    const [h, m] = inicio.split(':').map(Number)
    const fim = `${String(Math.min(h + 4, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    alterarDia(valor, { intervalos: [...semana[valor].intervalos, novoIntervalo(inicio, fim)] })
  }

  function removerIntervalo(valor: number, chave: number) {
    const restantes = semana[valor].intervalos.filter((item) => item.chave !== chave)
    alterarDia(valor, restantes.length > 0 ? { intervalos: restantes } : { ativo: false, intervalos: [novoIntervalo()] })
  }

  function copiarSegunda() {
    const base = semana[1]

    setSemana((atual) => {
      const proxima = { ...atual }
      for (const valor of [2, 3, 4, 5]) {
        proxima[valor] = {
          ativo: base.ativo,
          intervalos: base.intervalos.map((item) => novoIntervalo(item.horaInicio, item.horaFim)),
        }
      }
      return proxima
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setEnviado(true)
    setErroGeral('')

    if (Object.keys(errosDaSemana(semana)).length > 0) return

    onSalvando(true)

    try {
      await salvarDisponibilidades(profissional.id, paraLista(semana))
      onSaved(profissional)
    } catch (falha) {
      onSalvando(false)
      setErroGeral(falha instanceof Error ? falha.message : 'Não foi possível salvar os horários. Tente de novo.')
    }
  }

  return (
    <form id="horarios-form" noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {erroGeral && (
        <p role="alert" className="rounded-md border border-[#F1C9CA] bg-[#FBEDED] px-3.5 py-2.5 text-xs leading-snug text-danger">
          {erroGeral}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-soft px-4 py-3">
        <p className="text-xs text-muted">
          <span className="font-medium text-ink tabular-nums">{formatarHorasSemana(totalMinutos)}</span>
          {diasAtivos > 0 && ` em ${diasAtivos} ${diasAtivos === 1 ? 'dia' : 'dias'}`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          icon={<CopyCheck size={15} strokeWidth={1.6} />}
          disabled={!semana[1].ativo}
          onClick={copiarSegunda}
        >
          Repetir segunda nos dias úteis
        </Button>
      </div>

      <ul className="flex flex-col">
        {DIAS_SEMANA.map((dia) => {
          const atual = semana[dia.valor]

          return (
            <li
              key={dia.valor}
              className="grid gap-3 border-b border-line py-3.5 last:border-b-0 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-start"
            >
              <label className="flex h-[38px] cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={atual.ativo}
                  onChange={(event) => alterarDia(dia.valor, { ativo: event.target.checked })}
                  className="size-4 cursor-pointer accent-[#27644E]"
                />
                <span className={`text-[13px] ${atual.ativo ? 'font-medium text-ink' : 'text-muted'}`}>{dia.nome}</span>
              </label>

              {atual.ativo ? (
                <div className="flex flex-col gap-2">
                  {atual.intervalos.map((intervalo, indice) => (
                    <div key={intervalo.chave} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          step={900}
                          aria-label={`${dia.nome}, início do ${indice + 1}º intervalo`}
                          value={intervalo.horaInicio}
                          onChange={(event) => alterarIntervalo(dia.valor, intervalo.chave, 'horaInicio', event.target.value)}
                          className={erros[intervalo.chave] ? 'border-danger' : ''}
                          containerClassName="w-[116px]"
                        />
                        <span aria-hidden="true" className="text-xs text-placeholder">
                          até
                        </span>
                        <Input
                          type="time"
                          step={900}
                          aria-label={`${dia.nome}, fim do ${indice + 1}º intervalo`}
                          value={intervalo.horaFim}
                          onChange={(event) => alterarIntervalo(dia.valor, intervalo.chave, 'horaFim', event.target.value)}
                          className={erros[intervalo.chave] ? 'border-danger' : ''}
                          containerClassName="w-[116px]"
                        />
                        <IconButton
                          label={`Remover intervalo de ${dia.nome}`}
                          icon={<X size={15} strokeWidth={1.6} />}
                          onClick={() => removerIntervalo(dia.valor, intervalo.chave)}
                        />
                      </div>
                      {erros[intervalo.chave] && <p className="text-xs leading-snug text-danger">{erros[intervalo.chave]}</p>}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => adicionarIntervalo(dia.valor)}
                    className="inline-flex w-fit items-center gap-1.5 rounded-md py-1 text-xs font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    <Plus size={14} strokeWidth={1.8} />
                    Adicionar intervalo
                  </button>
                </div>
              ) : (
                <p className="flex h-[38px] items-center text-xs text-placeholder">Não atende</p>
              )}
            </li>
          )
        })}
      </ul>
    </form>
  )
}

function HorariosModal({ open, profissional, onClose, onSaved }: HorariosModalProps) {
  const [salvando, setSalvando] = useState(false)
  const consulta = useConsulta(listarDisponibilidades, profissional?.id ?? 0)
  const primeiroNome = profissional?.nome.split(' ')[0] ?? ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={salvando}
      width="lg"
      title={`Horários de ${primeiroNome}`}
      description="Marque os dias em que essa pessoa atende. Use mais de um intervalo para separar o almoço."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="horarios-form" loading={salvando} disabled={!consulta.dados}>
            Salvar horários
          </Button>
        </>
      }
    >
      {profissional && consulta.dados && !consulta.carregando ? (
        <EditorHorarios profissional={profissional} inicial={consulta.dados} onSalvando={setSalvando} onSaved={onSaved} />
      ) : consulta.erro ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm font-medium text-ink">Não foi possível carregar os horários</p>
          <p className="max-w-sm text-xs text-muted">{consulta.erro.message}</p>
          <Button variant="secondary" size="sm" onClick={consulta.recarregar}>
            Tentar de novo
          </Button>
        </div>
      ) : (
        <div aria-hidden="true" className="flex flex-col gap-4">
          <span className="h-11 animate-pulse rounded-lg bg-[#F3F4F1]" />
          {DIAS_SEMANA.map((dia) => (
            <div key={dia.valor} className="flex items-center gap-6">
              <span className="h-3 w-24 animate-pulse rounded bg-[#EEF0ED]" />
              <span className="h-[38px] w-64 animate-pulse rounded-md bg-[#F3F4F1]" />
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

export default HorariosModal