export const aplicarUnico = (colunas, unico) =>
  colunas.map(c => ({
    ...c,
    ...(unico.meses.ativo ? { meses: unico.meses.texto } : {}),
    ...(unico.valor.ativo ? { valor: unico.valor.texto } : {}),
  }));

import { parseNumeroBR } from './ui/formato.js';

export const COLUNA_VAZIA = () => ({ tipo: '', indexador: '', taxa: '', meses: '', valor: '' });

// Card sem tipo escolhido ainda não foi usado: fica em branco, sem avisos.
export function validarColuna(c) {
  if (!c.tipo) return { oferta: null, erros: {} };
  const erros = {};
  const taxa = parseNumeroBR(c.taxa);
  const meses = parseNumeroBR(c.meses);
  const valor = parseNumeroBR(c.valor);
  if (!c.indexador) erros.indexador = 'Escolha a rentabilidade.';
  if (String(c.taxa).trim() === '') erros.taxa = 'Informe a taxa.';
  else if (taxa == null || taxa < 0) erros.taxa = 'Informe uma taxa válida (ex.: 10,5).';
  if (meses == null || !Number.isInteger(meses) || meses < 1 || meses > 600) erros.meses = 'Informe um prazo inteiro entre 1 e 600 meses.';
  if (valor == null || valor <= 0) erros.valor = 'Informe um valor maior que zero.';
  if (Object.keys(erros).length) return { oferta: null, erros };
  return { oferta: { tipo: c.tipo, indexador: c.indexador, taxa: taxa / 100, meses, valor }, erros };
}
