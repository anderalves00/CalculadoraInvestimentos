export const SERIES = { selic: 432, cdi: 4389, ipca12m: 13522, dolar: 1 };

export const VALORES_PADRAO = { selic: .1375, cdi: .1365, ipca12m: .0458, dolar: 5.3744 };

const url = id => `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${id}/dados/ultimos/1?formato=json`;

async function buscarSerie(fetchFn, id) {
  const r = await fetchFn(url(id));
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const [ultimo] = await r.json();
  const valor = Number(ultimo.valor);
  if (!Number.isFinite(valor)) throw new Error('valor inválido');
  return { valor, data: ultimo.data };
}

export async function buscarIndicadores(fetchFn = (...a) => fetch(...a)) {
  const nomes = Object.keys(SERIES);
  const res = await Promise.allSettled(nomes.map(n => buscarSerie(fetchFn, SERIES[n])));
  const saida = { erros: [] };
  res.forEach((r, i) => {
    const nome = nomes[i];
    if (r.status === 'rejected') { saida[nome] = null; saida.erros.push(nome); return; }
    saida[nome] = nome === 'dolar' ? r.value : { ...r.value, valor: r.value.valor / 100 };
  });
  return saida;
}
