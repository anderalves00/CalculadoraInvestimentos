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
  const { tipo, meses, valor } = oferta;
  const vencimento = somarMeses(hoje, meses);
  const dc = diasCorridos(hoje, vencimento);
  const du = diasUteis(hoje, vencimento);

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

  const aliqCDB = aliquotaIR(dc);
  const brutoNecessario = valor + (liquido - valor) / (1 - aliqCDB);
  const equivalenciaCDI = du > 0
    ? ((brutoNecessario / valor) ** (1 / du) - 1) / (diario(mercado.cdi) - 1)
    : 0;

  return {
    valor, bruto, rendimento, iof, ir, custodia: cust, liquido,
    aliquotaIR: aliq, isento, diasCorridos: dc, diasUteis: du, vencimento,
    rentLiqPeriodo, rentLiqAno, equivalenciaCDI,
  };
}
