import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxaNecessaria, metaEmCDI } from '../js/calculo/meta.js';
import { simular } from '../js/calculo/simulacao.js';
import { aplicarUnico } from '../js/estado.js';

const hoje = new Date(2026, 9, 29);
const mercado = { cdi: .1365, selic: .1375, ipca: .0458 };

test('taxa necessária entrega a meta mensal líquida', () => {
  const t = taxaNecessaria({ tipo: 'CDB', indexador: 'pre', alvoMensal: .01, meses: 12, valor: 10000 }, mercado, hoje);
  const r = simular({ tipo: 'CDB', indexador: 'pre', taxa: t.taxa, meses: 12, valor: 10000 }, mercado, hoje);
  assert.ok(Math.abs(r.liquido / 10000 - 1.01 ** 12) < 1e-6);
});
test('LCI com meta igual a 100% do CDI pede ~100% do CDI', () => {
  const ref = simular({ tipo: 'LCI', indexador: 'pctCDI', taxa: 1, meses: 12, valor: 10000 }, mercado, hoje);
  const alvoMensal = (ref.liquido / 10000) ** (1 / 12) - 1;
  const t = taxaNecessaria({ tipo: 'LCI', indexador: 'pctCDI', alvoMensal, meses: 12, valor: 10000 }, mercado, hoje);
  assert.ok(Math.abs(t.taxa - 1) < 1e-6);
});
test('meta já atingida com taxa zero', () => {
  const t = taxaNecessaria({ tipo: 'Tesouro Selic', indexador: 'selicMais', alvoMensal: .001, meses: 12, valor: 10000 }, mercado, hoje);
  assert.equal(t.taxa, 0);
  assert.equal(t.situacao, 'qualquer');
});
test('meta inalcançável', () => {
  const t = taxaNecessaria({ tipo: 'CDB', indexador: 'pctCDI', alvoMensal: .5, meses: 12, valor: 10000 }, mercado, hoje);
  assert.equal(t.taxa, null);
  assert.equal(t.situacao, 'inviavel');
});
test('meta expressa como % do CDI de um CDB', () => {
  const ref = simular({ tipo: 'CDB', indexador: 'pctCDI', taxa: 1.1, meses: 12, valor: 10000 }, mercado, hoje);
  const alvoMensal = (ref.liquido / 10000) ** (1 / 12) - 1;
  assert.ok(Math.abs(metaEmCDI(alvoMensal, 12, mercado, hoje) - 1.1) < 1e-6);
});
test('valor e prazo únicos sobrescrevem as colunas', () => {
  const cols = [{ meses: '6', valor: '1' }, { meses: '24', valor: '2' }];
  const r = aplicarUnico(cols, { meses: { ativo: true, texto: '12' }, valor: { ativo: false, texto: '9' } });
  assert.deepEqual(r.map(c => [c.meses, c.valor]), [['12', '1'], ['12', '2']]);
  assert.equal(cols[0].meses, '6');
});
