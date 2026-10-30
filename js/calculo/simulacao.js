import { diasUteis, diasCorridos, somarMeses } from './calendario.js';
import { aliquotaIR, aliquotaIOF, ehIsento } from './tributos.js';

const CUSTODIA_AA = .002;
const ISENCAO_CUSTODIA_SELIC = 10000;

const diario = taxaAnual => (1 + taxaAnual) ** (1 / 252);

function fatorDiario({ indexador, taxa }, { cdi, selic, ipca }) {
  switch (indexador) {
    case 'pre': return diario(taxa);
    case 'pctCDI': return 1 + taxa * (diario(cdi) - 1);
    case 'cdiMais': return diario(cdi) * diario(taxa);
    case 'ipcaMais': return diario(ipca) * diario(taxa);
    case 'selicMais': return diario(selic) * diario(taxa);
    default: throw new Error(`Indexador desconhecido: ${indexador}`);
  }
}

function custodia(tipo, valor, bruto, dc) {
  if (!tipo.startsWith('Tesouro')) return 0;
  const isencao = tipo === 'Tesouro Selic' ? ISENCAO_CUSTODIA_SELIC : 0;
  const base = Math.max(0, (valor + bruto) / 2 - isencao);
  return base * CUSTODIA_AA * dc / 365;
}

export function simular(oferta, mercado, hoje) {
  const vencimento = somarMeses(hoje, oferta.meses);
  return simularComDias(oferta, mercado, vencimento, diasCorridos(hoje, vencimento), diasUteis(hoje, vencimento));
}

export function simularComDias(oferta, mercado, vencimento, dc, du) {
  const { tipo, valor } = oferta;

  const bruto = valor * fatorDiario(oferta, mercado) ** du;
  const rendimento = bruto - valor;
  const iof = rendimento * aliquotaIOF(dc);
  const cust = custodia(tipo, valor, bruto, dc);
  const isento = ehIsento(tipo);
  const aliq = isento ? 0 : aliquotaIR(dc);
  const ir = Math.max(0, rendimento - iof - cust) * aliq;
  const liquido = bruto - iof - cust - ir;

  const rentLiqPeriodo = liquido / valor - 1;
  const rentLiqAno = du > 0 ? (liquido / valor) ** (252 / du) - 1 : 0;

  // Ganho bruto que um CDB precisaria ter para, após IOF e IR do mesmo prazo, entregar o mesmo líquido.
  const brutoNecessario = valor + (liquido - valor) / ((1 - aliquotaIOF(dc)) * (1 - aliquotaIR(dc)));
  const equivalenciaCDI = du > 0 && mercado.cdi > 0
    ? ((brutoNecessario / valor) ** (1 / du) - 1) / (diario(mercado.cdi) - 1)
    : null;

  return {
    valor, bruto, rendimento, iof, ir, custodia: cust, liquido,
    aliquotaIR: aliq, isento, diasCorridos: dc, diasUteis: du, vencimento,
    rentLiqPeriodo, rentLiqAno, equivalenciaCDI,
  };
}
