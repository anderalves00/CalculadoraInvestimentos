import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simular } from '../js/calculo/simulacao.js';
import { indexadoresDoTipo } from '../js/conteudo.js';

const hoje = new Date(2026, 9, 29);
const mercado = { cdi: .10, selic: .10, ipca: .045 };
const perto = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test('indexadores válidos por tipo', () => {
  assert.deepEqual(indexadoresDoTipo('Tesouro Selic'), ['selicMais']);
  assert.equal(indexadoresDoTipo('CDB').length, 4);
});
test('CDB pré 10% 12 meses usa IR 17,5% (corrige a referência)', () => {
  const r = simular({ tipo: 'CDB', indexador: 'pre', taxa: .10, meses: 12, valor: 1000 }, mercado, hoje);
  assert.equal(r.diasCorridos, 365);
  assert.equal(r.aliquotaIR, .175);
  perto(r.bruto, 1000 * 1.1 ** (r.diasUteis / 252));
  perto(r.ir, (r.bruto - 1000) * .175);
});
test('LCI isenta', () => {
  const r = simular({ tipo: 'LCI', indexador: 'pctCDI', taxa: 1, meses: 12, valor: 1000 }, mercado, hoje);
  assert.equal(r.ir, 0);
  assert.equal(r.liquido, r.bruto);
});
test('CDB 100% CDI equivale a 100% do CDI', () => {
  const r = simular({ tipo: 'CDB', indexador: 'pctCDI', taxa: 1, meses: 12, valor: 1000 }, mercado, hoje);
  perto(r.equivalenciaCDI, 1, 1e-6);
});
test('LCI 100% CDI 12m equivale a ~120% do CDI', () => {
  const r = simular({ tipo: 'LCI', indexador: 'pctCDI', taxa: 1, meses: 12, valor: 1000 }, mercado, hoje);
  assert.ok(r.equivalenciaCDI > 1.18 && r.equivalenciaCDI < 1.22, String(r.equivalenciaCDI));
});
test('IOF em prazo < 30 dias', () => {
  const r = simular({ tipo: 'CDB', indexador: 'pre', taxa: .10, meses: 1, valor: 1000 }, mercado, new Date(2026, 1, 1));
  assert.equal(r.diasCorridos, 28);
  perto(r.iof, r.rendimento * .06);
});
test('Tesouro Selic até 10 mil sem custódia; acima só no excedente', () => {
  const a = simular({ tipo: 'Tesouro Selic', indexador: 'selicMais', taxa: 0, meses: 12, valor: 5000 }, mercado, hoje);
  assert.equal(a.custodia, 0);
  const b = simular({ tipo: 'Tesouro Selic', indexador: 'selicMais', taxa: 0, meses: 12, valor: 20000 }, mercado, hoje);
  perto(b.custodia, ((20000 + b.bruto) / 2 - 10000) * .002 * 365 / 365);
});
test('CDB sem custódia', () => {
  assert.equal(simular({ tipo: 'CDB', indexador: 'pre', taxa: .1, meses: 12, valor: 50000 }, mercado, hoje).custodia, 0);
});
test('CDI zero não gera NaN na equivalência', () => {
  const r = simular({ tipo: 'CDB', indexador: 'pre', taxa: .1, meses: 12, valor: 1000 }, { cdi: 0, selic: .1, ipca: .045 }, hoje);
  assert.equal(r.equivalenciaCDI, null);
});
test('equivalência considera IOF: CDB 100% CDI em 1 mês equivale a 100%', () => {
  const r = simular({ tipo: 'CDB', indexador: 'pctCDI', taxa: 1, meses: 1, valor: 1000 }, mercado, new Date(2026, 1, 1));
  assert.ok(r.iof > 0);
  perto(r.equivalenciaCDI, 1, 1e-6);
});
