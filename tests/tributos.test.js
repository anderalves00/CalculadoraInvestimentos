import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aliquotaIR, aliquotaIOF, ehIsento } from '../js/calculo/tributos.js';

test('IR por faixa', () => {
  for (const [dias, a] of [[180, .225], [181, .20], [360, .20], [361, .175], [720, .175], [721, .15]]) assert.equal(aliquotaIR(dias), a, `dias ${dias}`);
});
test('IOF', () => {
  assert.equal(aliquotaIOF(1), .96);
  assert.equal(aliquotaIOF(28), .06);
  assert.equal(aliquotaIOF(29), .03);
  assert.equal(aliquotaIOF(30), 0);
});
test('isenções', () => {
  for (const t of ['LCI', 'LCA', 'CRI', 'CRA', 'Debênture Incentivada']) assert.ok(ehIsento(t), t);
  for (const t of ['CDB', 'Debênture', 'Tesouro Selic']) assert.ok(!ehIsento(t), t);
});
