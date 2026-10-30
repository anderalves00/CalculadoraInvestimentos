import { brl, pct, esc, dataBR } from './formato.js';

const linha = (rotulo, valor, classe = '') =>
  `<div class="res-linha ${classe}"><span>${rotulo}</span><span>${valor}</span></div>`;

export function renderCard(el, r, { venceu, cor }) {
  const alvo = el.querySelector('[data-resultado]');
  el.classList.toggle('vencedora', venceu);
  el.style.setProperty('--cor-serie', cor);
  if (!r) { alvo.innerHTML = ''; return; }

  alvo.innerHTML = `<div class="resultado">
    ${venceu ? '<div class="selo">★ Melhor opção</div>' : ''}
    <div class="res-liquido">
      <span class="marca-serie" aria-hidden="true"></span>
      <span>Você recebe</span>
      <strong>${brl(r.liquido)}</strong>
    </div>
    <div class="res-taxa"><strong>${pct(r.rentLiqAno)}</strong> líquidos ao ano · equivale a ${pct(r.equivalenciaCDI, 0)} do CDI</div>
    ${linha('Valor investido', brl(r.valor))}
    ${linha('Valor bruto', brl(r.bruto))}
    ${r.iof > 0 ? linha('IOF', '− ' + brl(r.iof)) : ''}
    ${linha(r.isento ? 'IR' : `IR (${pct(r.aliquotaIR, 1)})`, r.isento ? 'Isento' : '− ' + brl(r.ir))}
    ${r.custodia > 0 ? linha('Custódia B3', '− ' + brl(r.custodia)) : ''}
    ${linha('Rentabilidade no período', pct(r.rentLiqPeriodo))}
    ${linha('Vencimento', `${dataBR(r.vencimento)} (${r.diasCorridos} dias)`)}
  </div>`;
}

export function renderRecomendacao(el, paragrafos) {
  el.innerHTML = '<h2>Recomendação</h2>' + paragrafos
    .map(p => `<p>${esc(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
    .join('');
}
