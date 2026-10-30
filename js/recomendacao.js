import { vencedor, prazosDiferentes } from './calculo/comparacao.js';
import { ROTULO_INDEXADOR } from './conteudo.js';

const pct = n => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const pct0 = n => new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 0 }).format(n);

export function recomendar(ofertas, resultados, mercado, ipca12m) {
  const validos = ofertas.map((o, i) => resultados[i] ? { o, r: resultados[i] } : null).filter(Boolean);
  const p = [];
  const iv = vencedor(resultados);

  if (iv >= 0) {
    const { tipo, indexador } = ofertas[iv];
    const r = resultados[iv];
    p.push(`Pelas taxas de hoje, **${tipo} (${ROTULO_INDEXADOR[indexador]})** tende a ser a melhor opção: ${pct(r.rentLiqAno)} líquidos ao ano, equivalente a ${pct0(r.equivalenciaCDI)} do CDI.`);
  }

  if (validos.length > 1 && prazosDiferentes(validos.map(v => v.o))) {
    const menor = validos.reduce((a, b) => (b.o.meses < a.o.meses ? b : a));
    p.push(`Os prazos são diferentes: ${menor.o.tipo} (${menor.o.meses} meses) devolve o dinheiro antes, o que pesa se você puder precisar dele.`);
  }

  const juroReal = (1 + mercado.selic) / (1 + ipca12m) - 1;
  if (juroReal >= .06) {
    p.push(`O juro real está alto (${pct(juroReal)} ao ano). Historicamente isso favorece travar taxas (pré-fixado ou IPCA+) em prazos mais longos — se a Selic cair, quem travou ganha.`);
  } else if (juroReal < .03) {
    p.push(`O juro real está baixo (${pct(juroReal)} ao ano); travar taxa longa agora tende a ser menos vantajoso.`);
  }

  if (iv >= 0 && ['pre', 'ipcaMais'].includes(ofertas[iv].indexador) && ofertas[iv].meses > 24) {
    p.push('Atenção: vender antes do vencimento pode dar prejuízo (marcação a mercado).');
  }

  p.push('Projeção com as taxas de hoje mantidas constantes; não é garantia de resultado.');
  return p;
}
