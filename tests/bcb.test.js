import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarIndicadores } from '../js/dados/bcb.js';

const resp = (v, data = '28/10/2026') => Promise.resolve({ ok: true, json: () => Promise.resolve([{ data, valor: v }]) });

test('converte séries', async () => {
  const f = url => resp(url.includes('.4389/') ? '13.65' : url.includes('.1/') ? '5.3744' : '4.58');
  const r = await buscarIndicadores(f);
  assert.ok(Math.abs(r.cdi.valor - .1365) < 1e-12);
  assert.equal(r.dolar.valor, 5.3744);
  assert.equal(r.cdi.data, '28/10/2026');
  assert.deepEqual(r.erros, []);
});
test('falha isolada vira null e erro', async () => {
  const f = url => url.includes('.1/') ? Promise.reject(new Error('rede')) : resp('10');
  const r = await buscarIndicadores(f);
  assert.equal(r.dolar, null);
  assert.deepEqual(r.erros, ['dolar']);
  assert.ok(r.cdi);
});
test('resposta não ok conta como falha', async () => {
  const f = url => url.includes('.432/') ? Promise.resolve({ ok: false }) : resp('10');
  const r = await buscarIndicadores(f);
  assert.equal(r.selic, null);
  assert.deepEqual(r.erros, ['selic']);
});
