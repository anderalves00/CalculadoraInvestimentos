import { simularComDias } from './simulacao.js';
import { diasUteis, diasCorridos, somarMeses } from './calendario.js';

export function vencedor(resultados) {
  let melhor = -1;
  resultados.forEach((r, i) => {
    if (r && (melhor < 0 || r.rentLiqAno > resultados[melhor].rentLiqAno)) melhor = i;
  });
  return melhor;
}

export const prazosDiferentes = ofertas => new Set(ofertas.map(o => o.meses)).size > 1;

export function evolucaoMensal(oferta, mercado, hoje) {
  const pontos = [{ mes: 0, liquido: oferta.valor }];
  let anterior = hoje, du = 0;
  for (let mes = 1; mes <= oferta.meses; mes++) {
    const venc = somarMeses(hoje, mes);
    du += diasUteis(anterior, venc);
    anterior = venc;
    const r = simularComDias({ ...oferta, meses: mes }, mercado, venc, diasCorridos(hoje, venc), du);
    pontos.push({ mes, liquido: r.liquido });
  }
  return pontos;
}
