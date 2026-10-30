import { simularComDias } from './simulacao.js';
import { diasUteis, diasCorridos, somarMeses } from './calendario.js';

const TETO = { pctCDI: 10, pre: 2, cdiMais: 2, ipcaMais: 2, selicMais: 2 };

// Menor taxa do indexador que entrega a meta mensal líquida no prazo. O líquido cresce com a taxa,
// então a busca binária converge.
export function taxaNecessaria({ tipo, indexador, alvoMensal, meses, valor }, mercado, hoje) {
  const alvo = (1 + alvoMensal) ** meses;
  const venc = somarMeses(hoje, meses);
  const dc = diasCorridos(hoje, venc), du = diasUteis(hoje, venc);
  const fator = taxa => simularComDias({ tipo, indexador, taxa, meses, valor }, mercado, venc, dc, du).liquido / valor;

  if (fator(0) >= alvo) return { taxa: 0, situacao: 'qualquer' };
  let lo = 0, hi = TETO[indexador];
  if (fator(hi) < alvo) return { taxa: null, situacao: 'inviavel' };
  for (let i = 0; i < 100 && hi - lo > 1e-12; i++) {
    const meio = (lo + hi) / 2;
    if (fator(meio) < alvo) lo = meio; else hi = meio;
  }
  return { taxa: hi, situacao: 'ok' };
}

export const metaEmCDI = (alvoMensal, meses, mercado, hoje) =>
  taxaNecessaria({ tipo: 'CDB', indexador: 'pctCDI', alvoMensal, meses, valor: 10000 }, mercado, hoje).taxa;
