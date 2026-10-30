import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vencedor, prazosDiferentes, evolucaoMensal } from '../js/calculo/comparacao.js';
import { recomendar } from '../js/recomendacao.js';
import { simular } from '../js/calculo/simulacao.js';

test('vencedor pelo maior % a.a. e ignora inválidos', () => {
  assert.equal(vencedor([{ rentLiqAno: .12 }, null, { rentLiqAno: .169 }]), 2);
  assert.equal(vencedor([null, null]), -1);
  assert.equal(vencedor([{ rentLiqAno: .1 }, { rentLiqAno: .1 }]), 0);
});
test('prazos diferentes', () => {
  assert.ok(prazosDiferentes([{ meses: 8 }, { meses: 12 }]));
  assert.ok(!prazosDiferentes([{ meses: 12 }, { meses: 12 }]));
});
test('evolução começa no valor e termina no líquido final', () => {
  const o = { tipo: 'CDB', indexador: 'pre', taxa: .1, meses: 6, valor: 1000 };
  const m = { cdi: .1, selic: .1, ipca: .045 };
  const h = new Date(2026, 9, 29);
  const e = evolucaoMensal(o, m, h);
  assert.equal(e.length, 7);
  assert.equal(e[0].liquido, 1000);
  assert.ok(Math.abs(e[6].liquido - simular(o, m, h).liquido) < 1e-9);
});
test('recomendação cita vencedor, prazos diferentes e fecho', () => {
  const m = { cdi: .1365, selic: .1375, ipca: .045 };
  const h = new Date(2026, 9, 29);
  const os = [{ tipo: 'CDB', indexador: 'pre', taxa: .12, meses: 12, valor: 1000 }, { tipo: 'LCI', indexador: 'pctCDI', taxa: .95, meses: 8, valor: 1000 }];
  const p = recomendar(os, os.map(o => simular(o, m, h)), m, .0458);
  assert.ok(p.some(x => x.includes('tende a ser a melhor')));
  assert.ok(p.some(x => x.includes('prazos são diferentes')));
  assert.ok(p.at(-1).includes('não é garantia'));
});
test('evolução de 600 meses é rápida (< 300 ms)', () => {
  const o = { tipo: 'CDB', indexador: 'pre', taxa: .1, meses: 600, valor: 1000 };
  const m = { cdi: .1, selic: .1, ipca: .045 };
  const h = new Date(2026, 9, 29);
  const t = performance.now();
  const e = evolucaoMensal(o, m, h);
  assert.ok(performance.now() - t < 300, `${Math.round(performance.now() - t)} ms`);
  assert.ok(Math.abs(e[600].liquido - simular(o, m, h).liquido) < 1e-6);
});
test('recomendação sem NaN quando CDI é zero', () => {
  const m = { cdi: 0, selic: .1375, ipca: .045 };
  const os = [{ tipo: 'CDB', indexador: 'pre', taxa: .12, meses: 12, valor: 1000 }];
  const p = recomendar(os, os.map(o => simular(o, m, new Date(2026, 9, 29))), m, .0458);
  assert.ok(!p.join(' ').includes('NaN'), p[0]);
  assert.ok(!p[0].includes('equivalente a'), p[0]);
});
