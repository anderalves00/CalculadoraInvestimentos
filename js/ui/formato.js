const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const brl = n => moeda.format(n);

export const pct = (n, casas = 2) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);

export const numero = (n, casas = 2) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);

export function parseNumeroBR(texto) {
  const t = String(texto ?? '').trim().replace(/\s|R\$|%/g, '');
  if (!/^-?[\d.]*,?\d*$/.test(t) || !/\d/.test(t)) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export const dataBR = d => d.toLocaleDateString('pt-BR');

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
