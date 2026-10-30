import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feriadosNacionais, diasUteis, diasCorridos, somarMeses } from '../js/calculo/calendario.js';

const d = s => { const [a, m, dd] = s.split('-').map(Number); return new Date(a, m - 1, dd); };

test('feriados 2026 incluem móveis e 20/11', () => {
  const f = feriadosNacionais(2026);
  for (const x of ['2026-02-16', '2026-02-17', '2026-04-03', '2026-06-04', '2026-11-20', '2026-04-21', '2026-12-25']) assert.ok(f.has(x), x);
});
test('dias úteis pulam fim de semana e feriado', () => assert.equal(diasUteis(d('2026-10-29'), d('2026-11-05')), 4));
test('dias corridos', () => {
  assert.equal(diasCorridos(d('2026-10-29'), d('2026-11-05')), 7);
  assert.equal(diasCorridos(d('2026-10-29'), d('2027-10-29')), 365);
});
test('somar meses limita ao fim do mês', () => assert.equal(somarMeses(d('2026-01-31'), 1).getDate(), 28));
