import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brl, pct, parseNumeroBR, taxaTexto } from '../js/ui/formato.js';

test('parseNumeroBR', () => {
  assert.equal(parseNumeroBR('10,5'), 10.5);
  assert.equal(parseNumeroBR('1.000,00'), 1000);
  assert.equal(parseNumeroBR(''), null);
  assert.equal(parseNumeroBR('abc'), null);
});
test('formatos', () => {
  assert.equal(pct(.1512), '15,12%');
  assert.match(brl(1234.56), /1\.234,56/);
});
test('ponto único é decimal; ponto só é milhar em grupos de 3', () => {
  assert.equal(parseNumeroBR('10.5'), 10.5);
  assert.equal(parseNumeroBR('1.5'), 1.5);
  assert.equal(parseNumeroBR('10.000'), 10000);
  assert.equal(parseNumeroBR('1.234.567,8'), 1234567.8);
  assert.equal(parseNumeroBR('10000.50'), 10000.5);
  assert.equal(parseNumeroBR('1.23.4'), null);
});
test('lê valores já formatados com símbolos', () => {
  assert.equal(parseNumeroBR('R$ 10.000,00'), 10000);
  assert.equal(parseNumeroBR('10,50%'), 10.5);
  assert.equal(parseNumeroBR('R$ 1.234,5'), 1234.5);
});
test('formata taxa para exibição', () => {
  assert.equal(taxaTexto(10.5), '10,50%');
});
