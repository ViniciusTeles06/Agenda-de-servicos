const MINUTO = 60 * 1000
const DIA = 24 * 60 * MINUTO

export function paraDataIso(data: Date) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function deIso(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export function somarDias(data: Date, dias: number) {
  const nova = new Date(data)
  nova.setDate(nova.getDate() + dias)
  return nova
}

export function formatarHora(isoDataHora: string) {
  return new Date(isoDataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatarDataLonga(data: Date) {
  const texto = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function diaDaSemanaCurto(iso: string) {
  const texto = deIso(iso).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function rotuloDoDia(iso: string, agora: number) {
  const diferenca = Math.round((deIso(paraDataIso(new Date(agora))).getTime() - deIso(iso).getTime()) / DIA)
  if (diferenca === 0) return 'Hoje'
  if (diferenca === 1) return 'Ontem'
  return deIso(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

export function tempoRelativo(isoDataHora: string, agora: number) {
  const minutos = Math.max(0, Math.round((agora - new Date(isoDataHora).getTime()) / MINUTO))
  if (minutos < 1) return 'agora'
  if (minutos < 60) return `há ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `há ${horas} h`
  const dias = Math.floor(horas / 24)
  return dias === 1 ? 'ontem' : `há ${dias} dias`
}