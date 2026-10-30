const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const brl = n => moeda.format(n);

export const pct = (n, casas = 2) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);

export const numero = (n, casas = 2) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(n);

export function parseNumeroBR(texto) {
  let t = String(texto ?? '').trim().replace(/\s|R\$|%/g, '');
  const neg = t.startsWith('-');
  if (neg) t = t.slice(1);
  const milhar = /^\d{1,3}(\.\d{3})+$/;
  let n;
  if (t.includes(',')) {
    const [int, dec, ...resto] = t.split(',');
    if (resto.length || !/^\d*$/.test(dec) || !(/^\d+$/.test(int) || milhar.test(int))) return null;
    n = Number(`${int.replace(/\./g, '')}.${dec || 0}`);
  } else if (milhar.test(t)) {
    n = Number(t.replace(/\./g, ''));
  } else if (/^\d+(\.\d+)?$/.test(t)) {
    n = Number(t);
  } else {
    return null;
  }
  return Number.isFinite(n) ? (neg ? -n : n) : null;
}

export const dataBR = d => d.toLocaleDateString('pt-BR');

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
