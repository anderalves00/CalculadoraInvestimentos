const DIA_MS = 86400000;

const chave = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const somarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

const cache = new Map();

export function feriadosNacionais(ano) {
  if (cache.has(ano)) return cache.get(ano);
  const fixos = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '11-20', '12-25'];
  const p = pascoa(ano);
  const moveis = [-48, -47, -2, 60].map(n => chave(somarDias(p, n)));
  const s = new Set([...fixos.map(x => `${ano}-${x}`), ...moveis]);
  cache.set(ano, s);
  return s;
}

export function diasCorridos(inicio, fim) {
  return Math.round((fim - inicio) / DIA_MS);
}

export function diasUteis(inicio, fim) {
  let n = 0;
  for (let d = somarDias(inicio, 1); d <= fim; d = somarDias(d, 1)) {
    const sem = d.getDay();
    if (sem !== 0 && sem !== 6 && !feriadosNacionais(d.getFullYear()).has(chave(d))) n++;
  }
  return n;
}

export function somarMeses(data, meses) {
  const alvo = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimo = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate();
  return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(data.getDate(), ultimo));
}
