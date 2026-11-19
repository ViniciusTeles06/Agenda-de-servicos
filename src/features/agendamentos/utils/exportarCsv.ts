import { ROTULO_STATUS } from '../constants';
import type { AgendamentoDetalhado } from '../types';
import { formatarDataBR, paraIsoData } from './datas';

const SEPARADOR = ';'; // Excel em pt-BR usa ponto e vírgula

/** Escapa a célula e neutraliza fórmulas (=, +, -, @) para evitar injeção de CSV. */
function escaparCelula(valor: string | number): string {
  let texto = String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;
  if (/[";\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export function gerarCsvAgenda(lista: readonly AgendamentoDetalhado[]): string {
  const cabecalho = [
    'Cliente', 'E-mail', 'Serviço', 'Duração (min)', 'Status', 'Responsável', 'Data', 'Início', 'Término',
  ];
  const linhas = lista.map((ag) => [
    ag.cliente.nome,
    ag.cliente.email,
    ag.servico.nome,
    ag.duracaoMin,
    ROTULO_STATUS[ag.status],
    ag.profissional.nome,
    formatarDataBR(ag.data),
    ag.hora,
    ag.horaFim,
  ]);
  return [cabecalho, ...linhas]
    .map((linha) => linha.map(escaparCelula).join(SEPARADOR))
    .join('\r\n');
}

export function nomeArquivoAgenda(hoje: Date = new Date()): string {
  return `agenda-servicehub-${paraIsoData(hoje)}.csv`;
}

/** Baixa o conteúdo como arquivo (apenas download: nada é gravado no navegador). */
export function baixarCsv(nomeArquivo: string, conteudo: string): void {
  const blob = new Blob(['\ufeff', conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}