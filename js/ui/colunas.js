import { TIPOS, indexadoresDoTipo } from '../conteudo.js';
import { esc, brl, taxaTexto, parseNumeroBR } from './formato.js';

const ROTULO_TAXA = {
  pre: 'Taxa ao ano',
  pctCDI: 'Percentual do CDI',
  cdiMais: 'CDI + taxa ao ano',
  ipcaMais: 'IPCA + taxa ao ano',
  selicMais: 'Selic + taxa ao ano',
};

const ROTULO_BOTAO = { pre: 'Pré', pctCDI: '% do CDI', cdiMais: 'CDI +', ipcaMais: 'IPCA +', selicMais: 'Selic +' };

const opcoes = (lista, sel) =>
  lista.map(v => `<option value="${v}"${v === sel ? ' selected' : ''}>${v}</option>`).join('');

// Ao sair do campo, reescreve o número com o símbolo; o cálculo continua lendo pelo parseNumeroBR.
const FORMATADORES = { taxa: taxaTexto, valor: brl };

export function criarColuna(dados, indice, { aoMudar, aoRemover, aoAjuda, podeRemover }) {
  const el = document.createElement('article');
  el.className = 'coluna';
  el.innerHTML = `
    <div class="cabeca">
      <strong>Oferta ${indice + 1}</strong>
      <button class="botao-leve" data-acao="remover"${podeRemover ? '' : ' disabled'}>Remover</button>
    </div>
    <div class="linha-tipo">
      <label>Tipo<select data-campo="tipo">${opcoes(TIPOS, dados.tipo)}</select></label>
      <button class="icone-ajuda" data-acao="ajuda" aria-label="O que é este investimento?">?</button>
    </div>
    <div class="campo">
      <span class="rotulo-campo" id="rent-${indice}">Rentabilidade</span>
      <div class="segmentos" role="radiogroup" aria-labelledby="rent-${indice}" data-indexadores></div>
    </div>
    <div class="dupla">
      <div class="campo">
        <label><span data-rotulo-taxa></span><input data-campo="taxa" inputmode="decimal" value="${esc(dados.taxa)}"></label>
        <span class="msg-erro" data-erro="taxa"></span>
      </div>
      <div class="campo">
        <label>Prazo (meses)<input data-campo="meses" inputmode="numeric" value="${esc(dados.meses)}"></label>
        <span class="msg-erro" data-erro="meses"></span>
      </div>
    </div>
    <div class="campo">
      <label>Valor investido<input data-campo="valor" inputmode="decimal" value="${esc(dados.valor)}"></label>
      <span class="msg-erro" data-erro="valor"></span>
    </div>
    <div data-resultado></div>`;

  const grupo = el.querySelector('[data-indexadores]');
  const rotuloTaxa = el.querySelector('[data-rotulo-taxa]');
  const inputTaxa = el.querySelector('[data-campo="taxa"]');
  let indexadorAnterior = dados.indexador;

  const preencherIndexadores = () => {
    const validos = indexadoresDoTipo(dados.tipo);
    if (!validos.includes(dados.indexador)) dados.indexador = validos[0];
    // Taxa de outro indexador não tem o mesmo significado (95% do CDI ≠ 95% a.a.): pede de novo.
    if (dados.indexador !== indexadorAnterior) { dados.taxa = ''; inputTaxa.value = ''; }
    indexadorAnterior = dados.indexador;
    grupo.innerHTML = validos.map(v => {
      const ativo = v === dados.indexador;
      return `<button type="button" role="radio" aria-checked="${ativo}" class="segmento${ativo ? ' ativo' : ''}" data-indexador="${v}"${validos.length === 1 ? ' disabled' : ''}>${ROTULO_BOTAO[v]}</button>`;
    }).join('');
    rotuloTaxa.textContent = ROTULO_TAXA[dados.indexador];
  };
  preencherIndexadores();

  const formatar = campo => {
    const input = el.querySelector(`[data-campo="${campo}"]`);
    const n = parseNumeroBR(input.value);
    if (n == null) return;
    input.value = FORMATADORES[campo](n);
    dados[campo] = input.value;
  };
  Object.keys(FORMATADORES).forEach(formatar);

  el.addEventListener('input', e => {
    const campo = e.target.dataset.campo;
    if (!campo) return;
    dados[campo] = e.target.value;
    if (campo === 'tipo') preencherIndexadores();
    aoMudar();
  });
  el.addEventListener('focusout', e => {
    const campo = e.target.dataset.campo;
    if (FORMATADORES[campo]) formatar(campo);
  });
  el.addEventListener('click', e => {
    const botao = e.target.closest('button');
    if (!botao) return;
    if (botao.dataset.indexador && botao.dataset.indexador !== dados.indexador) {
      dados.indexador = botao.dataset.indexador;
      preencherIndexadores();
      aoMudar();
    }
    if (botao.dataset.acao === 'remover') aoRemover();
    if (botao.dataset.acao === 'ajuda') aoAjuda(dados.tipo);
  });

  return el;
}

export function mostrarErros(el, erros) {
  for (const campo of ['taxa', 'meses', 'valor']) {
    el.querySelector(`[data-campo="${campo}"]`).classList.toggle('invalido', Boolean(erros[campo]));
    el.querySelector(`[data-erro="${campo}"]`).textContent = erros[campo] ?? '';
  }
}
