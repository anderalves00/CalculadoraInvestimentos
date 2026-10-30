import { buscarIndicadores, VALORES_PADRAO } from './dados/bcb.js';
import { simular } from './calculo/simulacao.js';
import { EDUCATIVO } from './conteudo.js';
import { parseNumeroBR } from './ui/formato.js';
import { renderIndicadores } from './ui/indicadores.js';
import { criarColuna, mostrarErros } from './ui/colunas.js';
import { renderCard, renderRecomendacao } from './ui/resultados.js';
import { renderGraficos, corSerie } from './ui/graficos.js';
import { vencedor, evolucaoMensal } from './calculo/comparacao.js';
import { recomendar } from './recomendacao.js';
import { TIPOS } from './conteudo.js';
import { esc } from './ui/formato.js';

const MIN_COLUNAS = 1;
const MAX_COLUNAS = 6;
const ATUALIZAR_MS = 30 * 60 * 1000;

const estado = {
  indicadores: { erros: [] },
  sobrescritos: { selic: null, cdi: null, ipca12m: null },
  colunas: [
    { tipo: 'CDB', indexador: 'pre', taxa: '12', meses: '12', valor: '10.000' },
    { tipo: 'LCI', indexador: 'pctCDI', taxa: '95', meses: '12', valor: '10.000' },
    { tipo: 'Tesouro Selic', indexador: 'selicMais', taxa: '0,05', meses: '12', valor: '10.000' },
  ],
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

function validar(c) {
  const erros = {};
  const taxa = parseNumeroBR(c.taxa);
  const meses = parseNumeroBR(c.meses);
  const valor = parseNumeroBR(c.valor);
  if (String(c.taxa).trim() === '') erros.taxa = 'Informe a taxa.';
  else if (taxa == null || taxa < 0) erros.taxa = 'Informe uma taxa válida (ex.: 10,5).';
  if (meses == null || !Number.isInteger(meses) || meses < 1 || meses > 600) erros.meses = 'Informe um prazo inteiro entre 1 e 600 meses.';
  if (valor == null || valor <= 0) erros.valor = 'Informe um valor maior que zero.';
  if (Object.keys(erros).length) return { oferta: null, erros };
  return { oferta: { tipo: c.tipo, indexador: c.indexador, taxa: taxa / 100, meses, valor }, erros };
}

const ganchos = [];
export const aoRecalcular = fn => ganchos.push(fn);

export function recalcular() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const m = mercado();
  const validacoes = estado.colunas.map(validar);
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
  recalcular();
}

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
  const primeira = estado.colunas[0];
  estado.colunas.push({ tipo: 'CDB', indexador: 'pctCDI', taxa: '100', meses: primeira.meses, valor: primeira.valor });
  renderColunas();
});

aoRecalcular(({ ofertas, resultados, mercado: m, ipca12m, hoje, elementos: els }) => {
  const iv = vencedor(resultados);
  resultados.forEach((r, i) => renderCard(els[i], r, { venceu: i === iv, cor: corSerie(i) }));
  renderRecomendacao(document.getElementById('recomendacao'), recomendar(ofertas, resultados, m, ipca12m));

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
