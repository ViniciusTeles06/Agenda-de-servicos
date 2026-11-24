import type { Disponibilidade } from './types'

export const DIAS_SEMANA = [
  { valor: 1, nome: 'Segunda', curto: 'Seg' },
  { valor: 2, nome: 'Terça', curto: 'Ter' },
  { valor: 3, nome: 'Quarta', curto: 'Qua' },
  { valor: 4, nome: 'Quinta', curto: 'Qui' },
  { valor: 5, nome: 'Sexta', curto: 'Sex' },
  { valor: 6, nome: 'Sábado', curto: 'Sáb' },
  { valor: 7, nome: 'Domingo', curto: 'Dom' },
]

export function paraMinutos(hora: string) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

export function normalizarHora(hora: string) {
  return hora.slice(0, 5)
}

export function ordenarIntervalos(lista: Disponibilidade[]) {
  return [...lista].sort((a, b) => a.diaSemana - b.diaSemana || paraMinutos(a.horaInicio) - paraMinutos(b.horaInicio))
}

export function erroDoIntervalo(intervalo: Disponibilidade, outros: Disponibilidade[]) {
  if (!intervalo.horaInicio || !intervalo.horaFim) return 'Preencha o início e o fim.'

  const inicio = paraMinutos(intervalo.horaInicio)
  const fim = paraMinutos(intervalo.horaFim)

  if (fim <= inicio) return 'O fim precisa ser depois do início.'

  const sobrepoe = outros.some((outro) => {
    if (!outro.horaInicio || !outro.horaFim) return false
    return inicio < paraMinutos(outro.horaFim) && paraMinutos(outro.horaInicio) < fim
  })

  return sobrepoe ? 'Esse horário se sobrepõe a outro do mesmo dia.' : ''
}

export function minutosPorSemana(lista: Disponibilidade[]) {
  return lista.reduce((total, item) => {
    if (!item.horaInicio || !item.horaFim) return total
    return total + Math.max(0, paraMinutos(item.horaFim) - paraMinutos(item.horaInicio))
  }, 0)
}

export function formatarHorasSemana(minutos: number) {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (minutos === 0) return 'Nenhum horário'
  return resto === 0 ? `${horas}h por semana` : `${horas}h${String(resto).padStart(2, '0')} por semana`
}