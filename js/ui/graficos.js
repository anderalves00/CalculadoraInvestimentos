import { brl } from './formato.js';

// Paleta categórica de referência da skill dataviz (validada para CVD), na ordem fixa dos slots.
const CORES_CLARO = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const CORES_ESCURO = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];

const escuro = () => matchMedia('(prefers-color-scheme: dark)').matches;
export const corSerie = i => (escuro() ? CORES_ESCURO : CORES_CLARO)[i];

const tinta = () => getComputedStyle(document.documentElement);
const token = nome => tinta().getPropertyValue(nome).trim();

let linhas, barras;

function base() {
  const texto = token('--texto-suave');
  const grade = token('--borda');
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'bottom', labels: { color: texto, usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8, padding: 16 } },
      tooltip: { callbacks: { label: c => `${c.dataset.label}: ${brl(c.parsed.y)}` } },
    },
    scales: {
      x: { ticks: { color: texto }, grid: { display: false } },
      y: { ticks: { color: texto, callback: v => brl(v) }, grid: { color: grade } },
    },
  };
}

export function renderGraficos({ series, canvasLinhas, canvasBarras }) {
  const opLinhas = base();
  opLinhas.scales.x.title = { display: true, text: 'Meses', color: token('--texto-suave') };
  const dadosLinhas = {
    datasets: series.map(s => ({
      label: s.nome,
      data: s.evolucao.map(p => ({ x: p.mes, y: p.liquido })),
      borderColor: s.cor,
      backgroundColor: s.cor,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      tension: 0,
    })),
  };
  opLinhas.scales.x.type = 'linear';
  opLinhas.scales.x.ticks.stepSize = 1;

  const opBarras = base();
  opBarras.interaction = { mode: 'nearest', intersect: true };
  opBarras.scales.x.stacked = true;
  opBarras.scales.y.stacked = true;
  const partes = [
    ['Ganho líquido', s => s.r.liquido - s.r.valor, 1],
    ['IR', s => s.r.ir, .55],
    ['IOF', s => s.r.iof, .35],
    ['Custódia', s => s.r.custodia, .2],
  ];
  const dadosBarras = {
    labels: series.map(s => s.nome),
    datasets: partes.map(([label, f, alfa]) => ({
      label,
      data: series.map(f),
      backgroundColor: series.map(s => s.cor + Math.round(alfa * 255).toString(16).padStart(2, '0')),
      borderColor: token('--superficie'),
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    })),
  };
  opBarras.plugins.legend.display = false;

  if (linhas) { linhas.data = dadosLinhas; linhas.options = opLinhas; linhas.update(); }
  else linhas = new Chart(canvasLinhas, { type: 'line', data: dadosLinhas, options: opLinhas });

  if (barras) { barras.data = dadosBarras; barras.options = opBarras; barras.update(); }
  else barras = new Chart(canvasBarras, { type: 'bar', data: dadosBarras, options: opBarras });
}
