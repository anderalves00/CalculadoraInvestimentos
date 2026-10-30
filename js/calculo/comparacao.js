import { simular } from './simulacao.js';

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
  for (let mes = 1; mes <= oferta.meses; mes++) {
    pontos.push({ mes, liquido: simular({ ...oferta, meses: mes }, mercado, hoje).liquido });
  }
  return pontos;
}
