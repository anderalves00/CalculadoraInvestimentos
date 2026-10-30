import { TIPOS, indexadoresDoTipo } from '../conteudo.js';
import { taxaNecessaria, metaEmCDI } from '../calculo/meta.js';
import { pct, esc } from './formato.js';

const COLUNAS = [
  ['pre', 'Pré (a.a.)'],
  ['pctCDI', '% do CDI'],
  ['cdiMais', 'CDI +'],
  ['ipcaMais', 'IPCA +'],
  ['selicMais', 'Selic +'],
];

// Acima disso a meta é rara em renda fixa e costuma vir com mais risco (critério de referência, ajustável).
export const LIMITE_META_ALTA = 1.3;

function celula(tipo, indexador, params, mercado, hoje) {
  if (!indexadoresDoTipo(tipo).includes(indexador)) return '<td class="na">—</td>';
  const { taxa, situacao } = taxaNecessaria({ tipo, indexador, ...params }, mercado, hoje);
  if (situacao === 'qualquer') return '<td class="facil">já atinge com 0%</td>';
  if (situacao === 'inviavel') return '<td class="inviavel">inviável</td>';
  const casas = indexador === 'pctCDI' ? 0 : 2;
  return `<td>≥ ${pct(taxa, casas)}</td>`;
}

export function renderSimulacao(el, { alvoMensal, meses, valor }, mercado, hoje) {
  const params = { alvoMensal, meses, valor };
  const anual = (1 + alvoMensal) ** 12 - 1;
  const emCDI = metaEmCDI(alvoMensal, meses, mercado, hoje);
  const alta = emCDI == null || emCDI > LIMITE_META_ALTA;

  const linhas = TIPOS.map(t =>
    `<tr><th scope="row">${esc(t)}</th>${COLUNAS.map(([ix]) => celula(t, ix, params, mercado, hoje)).join('')}</tr>`).join('');

  el.innerHTML = `
    <p class="sim-resumo">${pct(alvoMensal)} ao mês líquido = <strong>${pct(anual)} ao ano</strong> líquido.
    ${emCDI != null ? `Equivale a um CDB de <strong>${pct(emCDI, 0)} do CDI</strong> nesse prazo.` : ''}</p>
    ${alta ? `<p class="aviso">Meta alta: ofertas acima de ${pct(LIMITE_META_ALTA, 0)} do CDI são raras e costumam ter mais risco.</p>` : ''}
    <p class="legenda-grafico">Taxa mínima a procurar em cada investimento para atingir a meta, com os indicadores atuais.</p>
    <div class="tabela-rolagem">
      <table class="tabela-meta">
        <thead><tr><th scope="col">Investimento</th>${COLUNAS.map(([, r]) => `<th scope="col">${r}</th>`).join('')}</tr></thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
}
