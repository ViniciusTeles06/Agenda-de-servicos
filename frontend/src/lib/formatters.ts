export function formatarDuracao(minutos: number) {
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60

  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`
}

export function pluralizar(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}

export function apenasDigitos(texto: string) {
  return texto.replace(/\D/g, '')
}

export function formatarTelefone(texto: string) {
  const digitos = apenasDigitos(texto).slice(0, 11)

  if (digitos.length <= 2) return digitos ? `(${digitos}` : ''
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}