import { TIPOS, indexadoresDoTipo, ROTULO_INDEXADOR } from '../conteudo.js';
import { esc } from './formato.js';

const ROTULO_TAXA = {
  pre: 'Taxa (% a.a.)',
  pctCDI: 'Percentual do CDI (%)',
  cdiMais: 'CDI + (% a.a.)',
  ipcaMais: 'IPCA + (% a.a.)',
  selicMais: 'Selic + (% a.a.)',
};

const opcoes = (lista, sel, rotulo = x => x) =>
  lista.map(v => `<option value="${v}"${v === sel ? ' selected' : ''}>${rotulo(v)}</option>`).join('');

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
    <label>Rentabilidade<select data-campo="indexador"></select></label>
    <label><span data-rotulo-taxa></span><input data-campo="taxa" inputmode="decimal" value="${esc(dados.taxa)}"></label>
    <span class="msg-erro" data-erro="taxa"></span>
    <label>Prazo (meses)<input data-campo="meses" inputmode="numeric" value="${esc(dados.meses)}"></label>
    <span class="msg-erro" data-erro="meses"></span>
    <label>Valor investido (R$)<input data-campo="valor" inputmode="decimal" value="${esc(dados.valor)}"></label>
    <span class="msg-erro" data-erro="valor"></span>
    <div data-resultado></div>`;

  const selIndexador = el.querySelector('[data-campo="indexador"]');
  const rotuloTaxa = el.querySelector('[data-rotulo-taxa]');

  const inputTaxa = el.querySelector('[data-campo="taxa"]');
  let indexadorAnterior = dados.indexador;

  const preencherIndexadores = () => {
    const validos = indexadoresDoTipo(dados.tipo);
    if (!validos.includes(dados.indexador)) dados.indexador = validos[0];
    // Taxa de outro indexador não tem o mesmo significado (95% do CDI ≠ 95% a.a.): pede de novo.
    if (dados.indexador !== indexadorAnterior) { dados.taxa = ''; inputTaxa.value = ''; }
    indexadorAnterior = dados.indexador;
    selIndexador.innerHTML = opcoes(validos, dados.indexador, v => ROTULO_INDEXADOR[v]);
    selIndexador.disabled = validos.length === 1;
    rotuloTaxa.textContent = ROTULO_TAXA[dados.indexador];
  };
  preencherIndexadores();

  el.addEventListener('input', e => {
    const campo = e.target.dataset.campo;
    if (!campo) return;
    dados[campo] = e.target.value;
    if (campo === 'tipo' || campo === 'indexador') preencherIndexadores();
    aoMudar();
  });
  el.addEventListener('click', e => {
    const acao = e.target.dataset.acao;
    if (acao === 'remover') aoRemover();
    if (acao === 'ajuda') aoAjuda(dados.tipo);
  });

  return el;
}

export function mostrarErros(el, erros) {
  for (const campo of ['taxa', 'meses', 'valor']) {
    el.querySelector(`[data-campo="${campo}"]`).classList.toggle('invalido', Boolean(erros[campo]));
    el.querySelector(`[data-erro="${campo}"]`).textContent = erros[campo] ?? '';
  }
}
