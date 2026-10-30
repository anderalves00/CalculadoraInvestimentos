import { buscarIndicadores, VALORES_PADRAO } from './dados/bcb.js';
import { simular } from './calculo/simulacao.js';
import { EDUCATIVO } from './conteudo.js';
import { parseNumeroBR } from './ui/formato.js';
import { renderIndicadores } from './ui/indicadores.js';
import { criarColuna, mostrarErros, travarCampo } from './ui/colunas.js';
import { aplicarUnico, validarColuna, COLUNA_VAZIA } from './estado.js';
import { renderSimulacao } from './ui/simulacao.js';
import { renderCard, renderRecomendacao } from './ui/resultados.js';
import { renderGraficos, corSerie } from './ui/graficos.js';
import { vencedor, evolucaoMensal } from './calculo/comparacao.js';
import { recomendar } from './recomendacao.js';
import { TIPOS } from './conteudo.js';
import { esc, brl, taxaTexto } from './ui/formato.js';

const MIN_COLUNAS = 1;
const MAX_COLUNAS = 6;
const ATUALIZAR_MS = 30 * 60 * 1000;

const estado = {
  indicadores: { erros: [] },
  sobrescritos: { selic: null, cdi: null, ipca12m: null },
  colunas: [COLUNA_VAZIA(), COLUNA_VAZIA(), COLUNA_VAZIA()],
  unico: { meses: { ativo: false, texto: '' }, valor: { ativo: false, texto: '' } },
  simulacao: false,
};

const elColunas = document.getElementById('colunas');
const elIndicadores = document.getElementById('indicadores');
const btnAdicionar = document.getElementById('adicionar');
let elementos = [];

function valores() {
  const ind = estado.indicadores;
  const v = nome => estado.sobrescritos[nome] ?? ind[nome]?.valor ?? VALORES_PADRAO[nome];
  return { selic: v('selic'), cdi: v('cdi'), ipca12m: v('ipca12m'), dolar: v('dolar') };
}

export function mercado() {
  const v = valores();
  return { cdi: v.cdi, selic: v.selic, ipca: v.ipca12m };
}

const ganchos = [];
export const aoRecalcular = fn => ganchos.push(fn);

export function recalcular() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const m = mercado();
  if (estado.simulacao) { recalcularSimulacao(m, hoje); return; }
  const validacoes = aplicarUnico(estado.colunas, estado.unico).map(validarColuna);
  validacoes.forEach((v, i) => mostrarErros(elementos[i], v.erros));
  const ofertas = validacoes.map(v => v.oferta);
  const resultados = ofertas.map(o => (o ? simular(o, m, hoje) : null));
  ganchos.forEach(fn => fn({ ofertas, resultados, mercado: m, ipca12m: valores().ipca12m, hoje, elementos }));
}

function abrirAjuda(tipo) {
  const t = EDUCATIVO[tipo];
  document.getElementById('ajuda-titulo').textContent = tipo;
  document.getElementById('ajuda-corpo').innerHTML = `<dl>
    <dt>O que é</dt><dd>${t.oQueE}</dd>
    <dt>Garantia</dt><dd>${t.garantia}</dd>
    <dt>Liquidez</dt><dd>${t.liquidez}</dd>
    <dt>Tributação</dt><dd>${t.tributacao}</dd>
    <dt>Para quem é indicado</dt><dd>${t.indicadoPara}</dd></dl>`;
  document.getElementById('ajuda').showModal();
}

function renderColunas() {
  elColunas.innerHTML = '';
  const podeRemover = estado.colunas.length > MIN_COLUNAS;
  elementos = estado.colunas.map((dados, i) => {
    const el = criarColuna(dados, i, {
      aoMudar: recalcular,
      aoRemover: () => { estado.colunas.splice(i, 1); renderColunas(); },
      aoAjuda: abrirAjuda,
      podeRemover,
    });
    elColunas.append(el);
    return el;
  });
  btnAdicionar.disabled = estado.colunas.length >= MAX_COLUNAS;
  aplicarTravas();
  recalcular();
}

function aplicarTravas() {
  for (const campo of ['meses', 'valor']) {
    const u = estado.unico[campo];
    elementos.forEach(el => travarCampo(el, campo, u.ativo ? u.texto : null));
    if (!u.ativo) elementos.forEach((el, i) => { el.querySelector(`[data-campo="${campo}"]`).value = estado.colunas[i][campo]; });
  }
}

const FORMATO_UNICO = { valor: brl, meses: n => String(n) };

document.querySelectorAll('[data-unico]').forEach(chk => {
  const campo = chk.dataset.unico;
  const input = document.querySelector(`[data-unico-texto="${campo}"]`);
  chk.addEventListener('change', () => {
    estado.unico[campo].ativo = chk.checked;
    input.disabled = !chk.checked;
    aplicarTravas();
    recalcular();
  });
  input.addEventListener('input', () => {
    estado.unico[campo].texto = input.value;
    aplicarTravas();
    recalcular();
  });
  input.addEventListener('focusout', () => {
    const n = parseNumeroBR(input.value);
    if (n == null) return;
    input.value = estado.unico[campo].texto = FORMATO_UNICO[campo](n);
    aplicarTravas();
  });
});

const sim = {
  meta: document.getElementById('sim-meta'),
  meses: document.getElementById('sim-meses'),
  valor: document.getElementById('sim-valor'),
  erro: document.getElementById('sim-erro'),
  saida: document.getElementById('sim-resultado'),
};

function recalcularSimulacao(m, hoje) {
  const meta = parseNumeroBR(sim.meta.value);
  const meses = parseNumeroBR(sim.meses.value);
  const valor = parseNumeroBR(sim.valor.value);
  let erro = '';
  if (meta == null || meta <= 0 || meta > 20) erro = 'Informe uma meta mensal entre 0 e 20%.';
  else if (meses == null || !Number.isInteger(meses) || meses < 1 || meses > 600) erro = 'Informe um prazo inteiro entre 1 e 600 meses.';
  else if (valor == null || valor <= 0) erro = 'Informe um valor maior que zero.';
  sim.erro.textContent = erro;
  if (erro) { sim.saida.innerHTML = ''; return; }
  renderSimulacao(sim.saida, { alvoMensal: meta / 100, meses, valor }, m, hoje);
}

[sim.meta, sim.meses, sim.valor].forEach(i => i.addEventListener('input', recalcular));
sim.meta.addEventListener('focusout', () => { const n = parseNumeroBR(sim.meta.value); if (n != null) sim.meta.value = taxaTexto(n); });
sim.valor.addEventListener('focusout', () => { const n = parseNumeroBR(sim.valor.value); if (n != null) sim.valor.value = brl(n); });

document.getElementById('modo-simulacao').addEventListener('change', e => {
  estado.simulacao = e.target.checked;
  document.body.classList.toggle('modo-simulacao', estado.simulacao);
  recalcular();
});

function renderPainel() {
  renderIndicadores(elIndicadores, {
    indicadores: estado.indicadores,
    sobrescritos: estado.sobrescritos,
    valores: valores(),
    padrao: VALORES_PADRAO,
  }, {
    aoEditar: (nome, texto) => {
      const n = parseNumeroBR(texto);
      if (n != null && n >= 0) estado.sobrescritos[nome] = n / 100;
      renderPainel();
      recalcular();
    },
    aoRestaurar: nome => { estado.sobrescritos[nome] = null; renderPainel(); recalcular(); },
  });
}

async function atualizarIndicadores() {
  try {
    estado.indicadores = await buscarIndicadores();
  } catch {
    estado.indicadores = { selic: null, cdi: null, ipca12m: null, dolar: null, erros: ['selic', 'cdi', 'ipca12m', 'dolar'] };
  }
  renderPainel();
  recalcular();
}

btnAdicionar.addEventListener('click', () => {
  estado.colunas.push(COLUNA_VAZIA());
  renderColunas();
});

aoRecalcular(({ ofertas, resultados, mercado: m, ipca12m, hoje, elementos: els }) => {
  const iv = vencedor(resultados);
  resultados.forEach((r, i) => renderCard(els[i], r, { venceu: i === iv, cor: corSerie(i) }));
  const elRec = document.getElementById('recomendacao');
  if (resultados.some(Boolean)) renderRecomendacao(elRec, recomendar(ofertas, resultados, m, ipca12m));
  else elRec.innerHTML = '';

  const series = ofertas
    .map((o, i) => o && { nome: `${i + 1}. ${o.tipo}`, cor: corSerie(i), r: resultados[i], evolucao: evolucaoMensal(o, m, hoje) })
    .filter(Boolean);
  if (window.Chart) {
    renderGraficos({
      series,
      canvasLinhas: document.getElementById('grafico-linhas'),
      canvasBarras: document.getElementById('grafico-barras'),
    });
  }
});

document.getElementById('educativo').innerHTML = TIPOS.map(t => {
  const e = EDUCATIVO[t];
  return `<details><summary>${esc(t)}</summary>
    <p>${e.oQueE}</p><p><strong>Garantia:</strong> ${e.garantia}</p>
    <p><strong>Liquidez:</strong> ${e.liquidez}</p><p><strong>Tributação:</strong> ${e.tributacao}</p>
    <p><strong>Para quem:</strong> ${e.indicadoPara}</p></details>`;
}).join('');

renderPainel();
renderColunas();
atualizarIndicadores();
setInterval(atualizarIndicadores, ATUALIZAR_MS);
