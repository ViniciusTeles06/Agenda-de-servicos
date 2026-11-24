import type { Profissional } from '../types';

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;

export const MESES_CURTOS = [
  'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
] as const;

export const DIAS_SEMANA = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
] as const;

export const DIAS_SEMANA_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const;

const dois = (n: number): string => String(n).padStart(2, '0');

/* ───────── Datas (sempre no horário local, sem fuso) ───────── */

export function paraIsoData(d: Date): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export function deIsoData(iso: string): Date {
  const p = iso.split('-').map(Number);
  return new Date(p[0] ?? 1970, (p[1] ?? 1) - 1, p[2] ?? 1);
}

export function dataValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  return paraIsoData(deIsoData(iso)) === iso;
}

export function horaValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

export function horaParaMin(hora: string): number {
  const p = hora.split(':').map(Number);
  return (p[0] ?? 0) * 60 + (p[1] ?? 0);
}

export function minParaHora(min: number): string {
  return `${dois(Math.floor(min / 60))}:${dois(min % 60)}`;
}

export function combinarDataHora(iso: string, hora: string): Date {
  const d = deIsoData(iso);
  const min = horaParaMin(hora);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(min / 60), min % 60);
}

export function inicioDoDia(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function somarDias(d: Date, dias: number): Date {
  const r = inicioDoDia(d);
  r.setDate(r.getDate() + dias);
  return r;
}

export function somarMeses(d: Date, meses: number): Date {
  const alvo = new Date(d.getFullYear(), d.getMonth() + meses, 1);
  const ultimoDia = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(d.getDate(), ultimoDia));
}

/** Semana começando no domingo (padrão dos calendários brasileiros). */
export function inicioDaSemana(d: Date): Date {
  return somarDias(d, -d.getDay());
}

export function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 42 dias (6 semanas) que cobrem o mês da data informada. */
export function gradeDoMes(ref: Date): Date[] {
  const inicio = inicioDaSemana(new Date(ref.getFullYear(), ref.getMonth(), 1));
  return Array.from({ length: 42 }, (_, i) => somarDias(inicio, i));
}

/* ───────── Formatação (pt-BR) ───────── */

/** 04 nov. 2026 */
export function formatarDataCurta(iso: string): string {
  const d = deIsoData(iso);
  return `${dois(d.getDate())} ${MESES_CURTOS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 04 nov. 2026 · 09:30 */
export function formatarDataHora(iso: string, hora: string): string {
  return `${formatarDataCurta(iso)} · ${hora}`;
}

/** quarta-feira, 4 de novembro de 2026 */
export function formatarDataExtensa(iso: string): string {
  const d = deIsoData(iso);
  return `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** 04/11/2026 */
export function formatarDataBR(iso: string): string {
  const d = deIsoData(iso);
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** novembro de 2026 */
export function rotuloMes(d: Date): string {
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** 8–14 de nov. de 2026  |  27 out. – 2 nov. 2026 */
export function rotuloSemana(d: Date): string {
  const ini = inicioDaSemana(d);
  const fim = somarDias(ini, 6);
  if (ini.getFullYear() !== fim.getFullYear()) {
    return `${ini.getDate()} ${MESES_CURTOS[ini.getMonth()]} ${ini.getFullYear()} – ${fim.getDate()} ${MESES_CURTOS[fim.getMonth()]} ${fim.getFullYear()}`;
  }
  if (ini.getMonth() !== fim.getMonth()) {
    return `${ini.getDate()} ${MESES_CURTOS[ini.getMonth()]} – ${fim.getDate()} ${MESES_CURTOS[fim.getMonth()]} ${fim.getFullYear()}`;
  }
  return `${ini.getDate()}–${fim.getDate()} de ${MESES_CURTOS[fim.getMonth()]} de ${fim.getFullYear()}`;
}

/** "João Pedro Mendes" → "JM" */
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = (partes[0] ?? '').charAt(0);
  const ultima = partes.length > 1 ? (partes[partes.length - 1] ?? '').charAt(0) : '';
  return `${primeira}${ultima}`.toUpperCase();
}

/** "segunda a sexta, 08:00–18:00" */
export function descreverExpediente(p: Profissional): string {
  const dias = [...p.expediente.diasSemana].sort((a, b) => a - b);
  const contiguos = dias.every((dia, i) => i === 0 || dia === (dias[i - 1] ?? -2) + 1);
  const nomeDia = (n: number): string => (DIAS_SEMANA[n] ?? '').replace('-feira', '');
  let textoDias: string;
  if (dias.length === 0) textoDias = 'sem dias de atendimento';
  else if (dias.length === 1) textoDias = nomeDia(dias[0] ?? 0);
  else if (contiguos) textoDias = `${nomeDia(dias[0] ?? 0)} a ${nomeDia(dias[dias.length - 1] ?? 0)}`;
  else textoDias = dias.map(nomeDia).join(', ');
  return `${textoDias}, ${p.expediente.inicio}–${p.expediente.fim}`;
}