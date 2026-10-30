import { numero, esc } from './formato.js';

const NOMES = { selic: 'Selic', cdi: 'CDI', ipca12m: 'IPCA (12 meses)', dolar: 'Dólar' };

function blocoFixo(nome, ind, formatado) {
  return `<div class="indicador">
    <div class="rotulo">${NOMES[nome]}</div>
    <div class="valor">${formatado}</div>
    <div class="data">${ind ? `ref. ${esc(ind.data)}` : 'sem atualização'}</div>
  </div>`;
}

function blocoEditavel(nome, ind, valorAtual, sobrescrito) {
  return `<div class="indicador">
    <label class="rotulo" for="ind-${nome}">${NOMES[nome]} (% a.a.)</label>
    <input id="ind-${nome}" data-indicador="${nome}" inputmode="decimal" value="${numero(valorAtual * 100)}">
    <div class="data">${sobrescrito ? '<button class="restaurar" data-restaurar="' + nome + '">valor seu · restaurar</button>' : ind ? `ref. ${esc(ind.data)}` : 'sem atualização'}</div>
  </div>`;
}

export function renderIndicadores(el, { indicadores, sobrescritos, valores, padrao }, { aoEditar, aoRestaurar }) {
  const { erros = [] } = indicadores;
  const aviso = erros.length
    ? `<div class="aviso">Não foi possível atualizar: ${erros.map(e => NOMES[e]).join(', ')}. Usando ${erros.map(e => `${NOMES[e]} ${e === 'dolar' ? 'R$ ' + numero(padrao[e], 4) : numero(padrao[e] * 100) + '%'}`).join(', ')}.</div>`
    : '';

  el.innerHTML = `<div class="indicadores">
    ${blocoFixo('selic', indicadores.selic, numero(valores.selic * 100) + '%')}
    ${blocoEditavel('cdi', indicadores.cdi, valores.cdi, sobrescritos.cdi != null)}
    ${blocoEditavel('ipca12m', indicadores.ipca12m, valores.ipca12m, sobrescritos.ipca12m != null)}
    ${blocoFixo('dolar', indicadores.dolar, 'R$ ' + numero(valores.dolar, 4))}
  </div>${aviso}`;

  el.querySelectorAll('[data-indicador]').forEach(inp =>
    inp.addEventListener('change', () => aoEditar(inp.dataset.indicador, inp.value)));
  el.querySelectorAll('[data-restaurar]').forEach(b =>
    b.addEventListener('click', () => aoRestaurar(b.dataset.restaurar)));
}
