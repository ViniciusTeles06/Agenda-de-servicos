const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const SENHA_MINIMA = 8

export function validarEmail(email: string) {
  if (!email.trim()) return 'Informe seu e-mail.'
  if (!FORMATO_EMAIL.test(email.trim())) return 'Digite um e-mail válido, como voce@empresa.com.'
  return undefined
}