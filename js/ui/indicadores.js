import { numero, esc } from './formato.js';

const NOMES = { selic: 'Selic', cdi: 'CDI', ipca12m: 'IPCA (12 meses)', dolar: 'Dólar' };

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Cada série tem uma referência diferente; a etiqueta diz qual é.
function referencia(nome, ind) {
  if (!ind) return 'sem atualização';
  const [, mes, ano] = String(ind.data).split('/');
  switch (nome) {
    case 'selic': return 'meta vigente do Copom';
    case 'cdi': return `taxa de ${esc(ind.data)}`;
    case 'ipca12m': return `acumulado até ${MESES[Number(mes) - 1] ?? '?'}/${esc(ano)}`;
    case 'dolar': return `PTAX de ${esc(ind.data)}`;
    default: return esc(ind.data);
  }
}

function blocoFixo(nome, ind, formatado) {
  return `<div class="indicador">
    <label class="rotulo" for="ind-${nome}">${NOMES[nome]} (R$)</label>
    <input id="ind-${nome}" readonly value="${formatado}" title="Só informativo: não entra no cálculo">
    <div class="data">${referencia(nome, ind)}</div>
  </div>`;
}

function blocoEditavel(nome, ind, valorAtual, sobrescrito) {
  return `<div class="indicador">
    <label class="rotulo" for="ind-${nome}">${NOMES[nome]} (% a.a.)</label>
    <input id="ind-${nome}" data-indicador="${nome}" inputmode="decimal" value="${numero(valorAtual * 100)}">
    <div class="data">${sobrescrito ? '<button class="restaurar" data-restaurar="' + nome + '">valor seu · restaurar</button>' : referencia(nome, ind)}</div>
  </div>`;
}

export function renderIndicadores(el, { indicadores, sobrescritos, valores, padrao }, { aoEditar, aoRestaurar }) {
  const { erros = [] } = indicadores;
  const aviso = erros.length
    ? `<div class="aviso">Não foi possível atualizar: ${erros.map(e => NOMES[e]).join(', ')}. Usando ${erros.map(e => `${NOMES[e]} ${e === 'dolar' ? 'R$ ' + numero(padrao[e], 4) : numero(padrao[e] * 100) + '%'}`).join(', ')}.</div>`
    : '';

  el.innerHTML = `<div class="indicadores">
    ${blocoEditavel('selic', indicadores.selic, valores.selic, sobrescritos.selic != null)}
    ${blocoEditavel('cdi', indicadores.cdi, valores.cdi, sobrescritos.cdi != null)}
    ${blocoEditavel('ipca12m', indicadores.ipca12m, valores.ipca12m, sobrescritos.ipca12m != null)}
    ${blocoFixo('dolar', indicadores.dolar, numero(valores.dolar, 4))}
  </div>${aviso}`;

  el.querySelectorAll('[data-indicador]').forEach(inp =>
    inp.addEventListener('change', () => aoEditar(inp.dataset.indicador, inp.value)));
  el.querySelectorAll('[data-restaurar]').forEach(b =>
    b.addEventListener('click', () => aoRestaurar(b.dataset.restaurar)));
}
