# Calculadora de Investimentos — Fase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página estática que compara N ofertas de renda fixa (3 por padrão) em R$ e % a.a. líquidos, com cotações do Banco Central ao vivo, vencedor destacado, gráficos, recomendação por regras e textos educativos.

**Architecture:** HTML + CSS + JavaScript puro em módulos ES, sem build. Lógica de cálculo em módulos puros (sem DOM) testados com o test runner nativo do Node; a camada `js/ui/` só lê o estado, chama o cálculo e desenha. Servida por qualquer servidor estático (dev: `python -m http.server 8000`; módulos ES não carregam via `file://`).

**Tech Stack:** JavaScript ES2022 (módulos), Node 24 `node --test` para testes, Chart.js 4.4.1 via cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js`), API SGS do Banco Central.

**Spec:** `docs/superpowers/specs/2026-10-29-calculadora-investimentos-design.md`

## Global Constraints

- Português do Brasil em toda a interface; números `1.234,56` (via `Intl.NumberFormat('pt-BR')`); datas `dd/mm/aaaa`.
- Mobile-first: colunas empilhadas abaixo de 768 px de largura, lado a lado acima.
- Sem dependências npm. Única biblioteca externa: Chart.js 4.4.1 via cdnjs.
- 3 colunas por padrão; mínimo 1, máximo 6.
- Tipos: CDB, LCI, LCA, CRI, CRA, Debênture, Debênture Incentivada, Tesouro Selic, Tesouro Prefixado, Tesouro IPCA+.
- Indexadores privados: `pre`, `pctCDI`, `cdiMais`, `ipcaMais`. Tesouro Selic → `selicMais`; Tesouro Prefixado → `pre`; Tesouro IPCA+ → `ipcaMais`.
- Isentos de IR (PF): LCI, LCA, CRI, CRA, Debênture Incentivada (confirmado 2026-10-29: MP 1.303/2025 caducou em 08/10/2025).
- IR sobre o **rendimento**, por dias corridos: ≤180 → 22,5%; 181–360 → 20%; 361–720 → 17,5%; >720 → 15%.
- IOF regressivo nos dias 1–29 (dia 30 em diante = 0): `[96,93,90,86,83,80,76,73,70,66,63,60,56,53,50,46,43,40,36,33,30,26,23,20,16,13,10,6,3]` % do rendimento.
- Custódia B3 só no Tesouro: 0,20% a.a.; Tesouro Selic isento até R$ 10.000 (cobra só sobre o excedente). Cobrada no resgate/vencimento. Aproximação: `(saldoMédio − isenção) × 0,002 × diasCorridos/365`, saldo médio = (valor + bruto)/2.
- Ordem de descontos: IOF sobre o rendimento; IR sobre (rendimento − IOF − custódia).
- Capitalização em dias úteis/252 para todos os indexadores (convenção de mercado); feriados nacionais incluindo Carnaval (seg e ter), Sexta-feira Santa, Corpus Christi e 20/11.
- Vencedor = maior rentabilidade líquida ao ano: `(líquido/valor)^(252/diasUteis) − 1`. Empate → a primeira coluna.
- Projeção mantém as taxas atuais constantes — premissa escrita na tela.
- Toda cotação exibe a data de referência.
- Séries SGS (URL `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{id}/dados/ultimos/1?formato=json`): Selic meta 432, CDI anual 4389, IPCA 12 meses 13522, dólar venda 1. Atualização automática a cada 30 min com a página aberta.
- Tom da recomendação: "tende a", nunca certeza.
- Todo commit é seguido de `git push` (regra do projeto).

## Review Focus

1. Taxa/valor digitado no formato brasileiro (`10,5`, `1.000,00`), vazio, zero ou negativo → coluna mostra mensagem de erro e não entra na comparação; nunca exibe `NaN`. Teste em Task 6 (`parseNumeroBR`) e Task 4 (`vencedor` ignora `null`).
2. API do Banco Central fora do ar ou sem rede → painel mostra aviso, campos editáveis com valores padrão e a calculadora continua funcionando. Teste em Task 5 (fetch que rejeita).
3. Combinação tipo × indexador inválida (ex.: Tesouro Selic com "pré") → o seletor de indexador só oferece os válidos para o tipo. Teste em Task 3 (`indexadoresDoTipo`).
4. Tesouro Selic acima de R$ 10.000 → custódia só sobre o excedente; abaixo → zero. Teste em Task 3.
5. Prazo de 1 mês (menos de 30 dias corridos, ex.: fevereiro) → IOF aplicado. Teste em Task 3.

---

## Arquivos

```
index.html                 estrutura da página
css/estilo.css             estilos, mobile-first
package.json               {"type":"module","scripts":{"test":"node --test tests/"}}
js/calculo/calendario.js   datas, feriados, dias úteis
js/calculo/tributos.js     IR, IOF, isenções
js/calculo/simulacao.js    simular uma oferta
js/calculo/comparacao.js   vencedor, prazos diferentes, evolução mensal
js/dados/bcb.js            busca de indicadores no Banco Central
js/conteudo.js             tipos, indexadores válidos, textos educativos
js/recomendacao.js         recomendação por regras
js/ui/formato.js           formatação e leitura de números pt-BR
js/ui/indicadores.js       painel de cotações
js/ui/colunas.js           formulários das colunas
js/ui/resultados.js        cards, vencedor, recomendação
js/ui/graficos.js          gráficos Chart.js
js/app.js                  estado e orquestração
tests/*.test.js
```

---

### Task 1: Calendário

**Files:** Create `package.json`, `js/calculo/calendario.js`, `tests/calendario.test.js`

**Interfaces — Produces:**
- `feriadosNacionais(ano: number): Set<string>` — datas `'AAAA-MM-DD'`.
- `diasUteis(inicio: Date, fim: Date): number` — exclui `inicio`, inclui `fim`; sem sábados, domingos e feriados.
- `diasCorridos(inicio: Date, fim: Date): number`
- `somarMeses(data: Date, meses: number): Date` — dia limitado ao último do mês.
- Datas sempre em hora local, meia-noite.

- [ ] **Step 1: Write the failing tests**

```js
import { test } from 'node:test'; import assert from 'node:assert/strict';
import { feriadosNacionais, diasUteis, diasCorridos, somarMeses } from '../js/calculo/calendario.js';
const d = s => { const [a,m,dd] = s.split('-').map(Number); return new Date(a, m-1, dd); };
test('feriados 2026 incluem móveis e 20/11', () => {
  const f = feriadosNacionais(2026);
  for (const x of ['2026-02-16','2026-02-17','2026-04-03','2026-06-04','2026-11-20','2026-04-21','2026-12-25']) assert.ok(f.has(x), x);
});
test('dias úteis pulam fim de semana e feriado', () => assert.equal(diasUteis(d('2026-10-29'), d('2026-11-05')), 4));
test('dias corridos', () => { assert.equal(diasCorridos(d('2026-10-29'), d('2026-11-05')), 7); assert.equal(diasCorridos(d('2026-10-29'), d('2027-10-29')), 365); });
test('somar meses limita ao fim do mês', () => assert.equal(somarMeses(d('2026-01-31'), 1).getDate(), 28));
```

- [ ] **Step 2:** Run `npm test` — Expected: FAIL (módulo não existe).
- [ ] **Step 3:** Implement. Páscoa pelo algoritmo de Meeus/Butcher; Carnaval = Páscoa −48 e −47; Sexta Santa −2; Corpus Christi +60. Fixos: 01/01, 21/04, 01/05, 07/09, 12/10, 02/11, 15/11, 20/11, 25/12. `diasCorridos` arredonda a diferença em dias (evita erro de horário de verão).
- [ ] **Step 4:** Run `npm test` — Expected: PASS.
- [ ] **Step 5:** `git add package.json js/calculo/calendario.js tests/calendario.test.js && git commit -m "feat: calendário com feriados e dias úteis" && git push`

### Task 2: Tributos

**Files:** Create `js/calculo/tributos.js`, `tests/tributos.test.js`

**Interfaces — Produces:**
- `aliquotaIR(diasCorridos: number): number` — decimal.
- `aliquotaIOF(diasCorridos: number): number` — decimal; 0 a partir de 30.
- `ehIsento(tipo: string): boolean`

- [ ] **Step 1: Write the failing tests**

```js
test('IR por faixa', () => {
  for (const [dias, a] of [[180,.225],[181,.20],[360,.20],[361,.175],[720,.175],[721,.15]]) assert.equal(aliquotaIR(dias), a);
});
test('IOF', () => { assert.equal(aliquotaIOF(1), .96); assert.equal(aliquotaIOF(28), .06); assert.equal(aliquotaIOF(29), .03); assert.equal(aliquotaIOF(30), 0); });
test('isenções', () => { for (const t of ['LCI','LCA','CRI','CRA','Debênture Incentivada']) assert.ok(ehIsento(t)); for (const t of ['CDB','Debênture','Tesouro Selic']) assert.ok(!ehIsento(t)); });
```

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement com as tabelas das Global Constraints.
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit + push `feat: alíquotas de IR, IOF e isenções`.

### Task 3: Conteúdo e simulação

**Files:** Create `js/conteudo.js`, `js/calculo/simulacao.js`, `tests/simulacao.test.js`

**Interfaces:**
- Consumes: Task 1 (`diasUteis`, `diasCorridos`, `somarMeses`), Task 2 (todas).
- Produces:
  - `TIPOS: string[]` (ordem das Global Constraints).
  - `indexadoresDoTipo(tipo: string): string[]` — Tesouro Selic `['selicMais']`, Tesouro Prefixado `['pre']`, Tesouro IPCA+ `['ipcaMais']`, demais `['pre','pctCDI','cdiMais','ipcaMais']`.
  - `ROTULO_INDEXADOR: Record<string,string>` — `pre` "Pré-fixado (% a.a.)", `pctCDI` "% do CDI", `cdiMais` "CDI + taxa", `ipcaMais` "IPCA + taxa", `selicMais` "Selic + taxa".
  - `EDUCATIVO: Record<tipo, {oQueE, garantia, liquidez, tributacao, indicadoPara}>` — textos curtos (2–3 frases cada) escritos pelo implementador, factuais (FGC até R$ 250 mil por CPF/instituição para CDB/LCI/LCA; Tesouro garantido pelo governo federal; CRI/CRA/Debênture sem FGC).
  - Oferta: `{ tipo, indexador, taxa, meses, valor }` — `taxa` decimal (pctCDI: 1.05 = 105%).
  - Mercado: `{ cdi, selic, ipca }` decimais a.a.
  - `simular(oferta, mercado, hoje: Date): Resultado`
  - Resultado: `{ valor, bruto, rendimento, iof, ir, custodia, liquido, aliquotaIR, isento, diasCorridos, diasUteis, vencimento: Date, rentLiqPeriodo, rentLiqAno, equivalenciaCDI }`

Fator diário por indexador (`du` = dias úteis; `f(x) = (1+x)^(1/252)`):
- `pre`: `f(taxa)`; `pctCDI`: `1 + taxa·(f(cdi)−1)`; `cdiMais`: `f(cdi)·f(taxa)`; `ipcaMais`: `f(ipca)·f(taxa)`; `selicMais`: `f(selic)·f(taxa)`. Bruto = `valor · fator^du`.

`equivalenciaCDI`: o % do CDI de um CDB (tributado na alíquota de IR do mesmo prazo, sem IOF/custódia) que entregaria o mesmo líquido:
```
brutoNecessario = valor + (liquido − valor) / (1 − aliquotaIR)
p = ((brutoNecessario/valor)^(1/du) − 1) / (f(cdi) − 1)
```

- [ ] **Step 1: Write the failing tests**

```js
const hoje = new Date(2026, 9, 29); const mercado = { cdi: .10, selic: .10, ipca: .045 };
test('indexadores válidos por tipo', () => { assert.deepEqual(indexadoresDoTipo('Tesouro Selic'), ['selicMais']); assert.equal(indexadoresDoTipo('CDB').length, 4); });
test('CDB pré 10% 12 meses usa IR 17,5% (corrige a referência)', () => {
  const r = simular({ tipo:'CDB', indexador:'pre', taxa:.10, meses:12, valor:1000 }, mercado, hoje);
  assert.equal(r.diasCorridos, 365); assert.equal(r.aliquotaIR, .175);
  assert.ok(Math.abs(r.bruto - 1000 * 1.1 ** (r.diasUteis/252)) < 1e-9);
  assert.ok(Math.abs(r.ir - (r.bruto - 1000) * .175) < 1e-9);
});
test('LCI isenta', () => { const r = simular({ tipo:'LCI', indexador:'pctCDI', taxa:1, meses:12, valor:1000 }, mercado, hoje); assert.equal(r.ir, 0); assert.equal(r.liquido, r.bruto); });
test('CDB 100% CDI equivale a 100% do CDI', () => { const r = simular({ tipo:'CDB', indexador:'pctCDI', taxa:1, meses:12, valor:1000 }, mercado, hoje); assert.ok(Math.abs(r.equivalenciaCDI - 1) < 1e-6); });
test('LCI 100% CDI 12m equivale a ~120% do CDI', () => { const r = simular({ tipo:'LCI', indexador:'pctCDI', taxa:1, meses:12, valor:1000 }, mercado, hoje); assert.ok(r.equivalenciaCDI > 1.18 && r.equivalenciaCDI < 1.22); });
test('IOF em prazo < 30 dias', () => { const r = simular({ tipo:'CDB', indexador:'pre', taxa:.10, meses:1, valor:1000 }, mercado, new Date(2026,1,1)); assert.equal(r.diasCorridos, 28); assert.ok(Math.abs(r.iof - r.rendimento*.06) < 1e-9); });
test('Tesouro Selic até 10 mil sem custódia; acima só no excedente', () => {
  const a = simular({ tipo:'Tesouro Selic', indexador:'selicMais', taxa:0, meses:12, valor:5000 }, mercado, hoje); assert.equal(a.custodia, 0);
  const b = simular({ tipo:'Tesouro Selic', indexador:'selicMais', taxa:0, meses:12, valor:20000 }, mercado, hoje);
  const esperado = ((20000 + b.bruto)/2 - 10000) * .002 * 365/365; assert.ok(Math.abs(b.custodia - esperado) < 1e-9);
});
test('CDB sem custódia', () => assert.equal(simular({ tipo:'CDB', indexador:'pre', taxa:.1, meses:12, valor:50000 }, mercado, hoje).custodia, 0));
```

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement `conteudo.js` e `simular` conforme fórmulas acima e Global Constraints.
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit + push `feat: simulação de ofertas e conteúdo educativo`.

### Task 4: Comparação e recomendação

**Files:** Create `js/calculo/comparacao.js`, `js/recomendacao.js`, `tests/comparacao.test.js`

**Interfaces:**
- Consumes: Task 3 (`simular`, Resultado, Oferta, Mercado).
- Produces:
  - `vencedor(resultados: (Resultado|null)[]): number` — índice do maior `rentLiqAno`, ignorando `null`; `-1` se nenhum válido.
  - `prazosDiferentes(ofertas: Oferta[]): boolean`
  - `evolucaoMensal(oferta, mercado, hoje): {mes:number, liquido:number}[]` — para `mes` de 1 a `oferta.meses`, o líquido se resgatado naquele mês (`simular` com `meses = mes`); inclui `{mes:0, liquido: valor}`.
  - `recomendar(ofertas, resultados, mercado, ipca12m): string[]` — parágrafos.

Regras de `recomendar` (cada uma gera no máximo um parágrafo, nesta ordem):
1. Vencedor: "Pelas taxas de hoje, **{tipo} ({rótulo indexador})** tende a ser a melhor opção: {rentLiqAno} líquidos ao ano, equivalente a {equivalenciaCDI} do CDI."
2. Se `prazosDiferentes`: "Os prazos são diferentes: {tipo de menor prazo} devolve o dinheiro antes, o que pesa se você puder precisar dele."
3. Juro real = `(1+selic)/(1+ipca12m) − 1`. Se ≥ 6%: "O juro real está alto ({x}). Historicamente isso favorece travar taxas (pré-fixado ou IPCA+) em prazos mais longos — se a Selic cair, quem travou ganha." Se < 3%: "O juro real está baixo ({x}); travar taxa longa agora tende a ser menos vantajoso."
4. Se o vencedor for indexado a `pre`/`ipcaMais` e o prazo > 24 meses: "Atenção: vender antes do vencimento pode dar prejuízo (marcação a mercado)."
5. Fecho fixo: "Projeção com as taxas de hoje mantidas constantes; não é garantia de resultado."

- [ ] **Step 1: Write the failing tests**

```js
test('vencedor pelo maior % a.a. e ignora inválidos', () => {
  assert.equal(vencedor([{ rentLiqAno:.12 }, null, { rentLiqAno:.169 }]), 2);
  assert.equal(vencedor([null, null]), -1);
  assert.equal(vencedor([{ rentLiqAno:.1 }, { rentLiqAno:.1 }]), 0);
});
test('prazos diferentes', () => { assert.ok(prazosDiferentes([{meses:8},{meses:12}])); assert.ok(!prazosDiferentes([{meses:12},{meses:12}])); });
test('evolução começa no valor e termina no líquido final', () => {
  const o = { tipo:'CDB', indexador:'pre', taxa:.1, meses:6, valor:1000 }; const m = { cdi:.1, selic:.1, ipca:.045 }; const h = new Date(2026,9,29);
  const e = evolucaoMensal(o, m, h); assert.equal(e.length, 7); assert.equal(e[0].liquido, 1000);
  assert.ok(Math.abs(e[6].liquido - simular(o, m, h).liquido) < 1e-9);
});
test('recomendação cita vencedor, prazos diferentes e fecho', () => {
  const m = { cdi:.1365, selic:.1375, ipca:.045 }; const h = new Date(2026,9,29);
  const os = [{ tipo:'CDB', indexador:'pre', taxa:.12, meses:12, valor:1000 }, { tipo:'LCI', indexador:'pctCDI', taxa:.95, meses:8, valor:1000 }];
  const p = recomendar(os, os.map(o => simular(o, m, h)), m, .0458);
  assert.ok(p.some(x => x.includes('tende a ser a melhor')));
  assert.ok(p.some(x => x.includes('prazos são diferentes')));
  assert.ok(p.at(-1).includes('não é garantia'));
});
```

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit + push `feat: comparação, evolução e recomendação por regras`.

### Task 5: Indicadores do Banco Central

**Files:** Create `js/dados/bcb.js`, `tests/bcb.test.js`

**Interfaces — Produces:**
- `SERIES = { selic: 432, cdi: 4389, ipca12m: 13522, dolar: 1 }`
- `buscarIndicadores(fetchFn = fetch): Promise<{ selic, cdi, ipca12m, dolar, erros: string[] }>` — cada indicador `{ valor: number, data: string } | null`. Selic, CDI e IPCA convertidos para decimal (13.65 → 0.1365); dólar em reais. Falha de uma série não derruba as outras: vira `null` e o nome entra em `erros`.
- `VALORES_PADRAO = { selic: .1375, cdi: .1365, ipca12m: .0458, dolar: 5.3744 }` (medidos em 2026-10-29) — usados quando a série falha.

- [ ] **Step 1: Write the failing tests**

```js
const resp = (v, data='28/10/2026') => Promise.resolve({ ok:true, json: () => Promise.resolve([{ data, valor: v }]) });
test('converte séries', async () => {
  const f = url => resp(url.includes('.4389/') ? '13.65' : url.includes('.1/') ? '5.3744' : '4.58');
  const r = await buscarIndicadores(f);
  assert.ok(Math.abs(r.cdi.valor - .1365) < 1e-12); assert.equal(r.dolar.valor, 5.3744); assert.equal(r.cdi.data, '28/10/2026'); assert.deepEqual(r.erros, []);
});
test('falha isolada vira null e erro', async () => {
  const f = url => url.includes('.1/') ? Promise.reject(new Error('rede')) : resp('10');
  const r = await buscarIndicadores(f); assert.equal(r.dolar, null); assert.deepEqual(r.erros, ['dolar']); assert.ok(r.cdi);
});
```

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement (requisições em paralelo com `Promise.allSettled`; resposta `!ok` conta como falha).
- [ ] **Step 4:** `npm test` — PASS.
- [ ] **Step 5:** Commit + push `feat: indicadores do Banco Central`.

### Task 6: Página, colunas e indicadores na tela

**Files:** Create `index.html`, `css/estilo.css`, `js/ui/formato.js`, `js/ui/indicadores.js`, `js/ui/colunas.js`, `js/app.js`, `tests/formato.test.js`

**Interfaces:**
- Consumes: Tasks 3 e 5.
- Produces:
  - `brl(n): string` ("R$ 1.234,56"), `pct(n, casas=2): string` (0.1512 → "15,12%"), `parseNumeroBR(texto): number|null` (`'10,5'`→10.5, `'1.000,00'`→1000, `''`/`'abc'`→null).
  - `app.js` mantém o estado `{ mercado, indicadores, ofertas: Oferta[] }` e expõe `recalcular()`, chamado a cada mudança.
  - Na tela, a taxa é digitada em % (o usuário digita `105` para 105% do CDI, `10` para 10% a.a.); a UI converte para decimal.

Comportamento:
- Painel de indicadores no topo: Selic, CDI, IPCA 12m, dólar, cada um com a data; CDI e IPCA editáveis (sobrescrever para simular); aviso "Não foi possível atualizar: {nomes}. Usando {valores}." quando houver `erros`; nova busca a cada 30 min.
- 3 colunas iniciais (CDB pré 12%, LCI 95% do CDI, Tesouro Selic +0,05%; 12 meses; R$ 10.000). Botões "+ Adicionar" (até 6) e "Remover" por coluna (mínimo 1). Coluna nova copia o valor e o prazo da primeira.
- Trocar o tipo reabastece o seletor de indexador com `indexadoresDoTipo` e seleciona o primeiro.
- Campo inválido (`parseNumeroBR` null, ou ≤ 0 para valor/meses, ou < 0 para taxa) → borda de erro e mensagem curta na coluna; essa oferta vira `null` na comparação.
- Ícone "?" ao lado do tipo abre o texto `EDUCATIVO` do tipo.

- [ ] **Step 1: Write the failing test** (`tests/formato.test.js`)

```js
test('parseNumeroBR', () => { assert.equal(parseNumeroBR('10,5'), 10.5); assert.equal(parseNumeroBR('1.000,00'), 1000); assert.equal(parseNumeroBR(''), null); assert.equal(parseNumeroBR('abc'), null); });
test('formatos', () => { assert.equal(pct(.1512), '15,12%'); assert.match(brl(1234.56), /1\.234,56/); });
```

- [ ] **Step 2:** `npm test` — FAIL.
- [ ] **Step 3:** Implement `formato.js`; `npm test` — PASS.
- [ ] **Step 4:** Implement `index.html`, `estilo.css`, `indicadores.js`, `colunas.js`, `app.js`.
- [ ] **Step 5: Verificar no navegador** (manter visível ao usuário): `python -m http.server 8000` em segundo plano; `playwright-cli goto http://localhost:8000`. Expected: indicadores com datas reais; 3 colunas; adicionar até 6 e remover até 1; Tesouro Selic só oferece "Selic + taxa"; digitar `abc` na taxa mostra erro sem `NaN`; em `playwright-cli resize 390 844` as colunas empilham.
- [ ] **Step 6:** Commit + push `feat: página com colunas e indicadores`.

### Task 7: Resultados, gráficos, recomendação e seção educativa

**Files:** Create `js/ui/resultados.js`, `js/ui/graficos.js`; Modify `index.html`, `css/estilo.css`, `js/app.js`

**Interfaces — Consumes:** Tasks 3, 4, 6 (`simular`, `vencedor`, `prazosDiferentes`, `evolucaoMensal`, `recomendar`, `brl`, `pct`, `EDUCATIVO`).

Comportamento:
- Card por coluna: valor investido, bruto, IOF (só se > 0), IR (alíquota e valor, ou "Isento"), custódia (só Tesouro), **líquido em destaque**, rentabilidade líquida no período e ao ano, "equivale a X% do CDI", data de vencimento.
- Card vencedor com destaque visual inequívoco (borda/selo "Melhor opção"); demais neutros.
- Bloco de recomendação com os parágrafos de `recomendar`.
- Gráfico de linhas: `evolucaoMensal` de cada oferta válida (eixo x em meses, y em R$).
- Gráfico de barras empilhadas por oferta: líquido, IR, IOF, custódia.
- Cores das séries consistentes entre cards e gráficos; legíveis em tema claro e escuro.
- Seção "Conheça os investimentos" ao fim da página com todos os `EDUCATIVO`.
- Linha fixa sob os resultados: "Projeção com as taxas atuais mantidas constantes até o vencimento."

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `npm test` — Expected: todos PASS (nada quebrou).
- [ ] **Step 3: Verificar no navegador** com o exemplo da referência: CDB pré 10% × LCI 105% do CDI, 12 meses, R$ 10.000, CDI sobrescrito para 14,4%. Expected: CDB com IR 17,5% (a referência mostrava 20%); LCI vencedora destacada; gráficos com uma linha/barra por oferta; recomendação com o fecho. Repetir em 390×844.
- [ ] **Step 4:** Atualizar `StatusProj.md`, `BacklogProj.md` e `DiarioProj.md` (Fase 1 concluída; próximo item: escolher hospedagem estática que aceite repositório privado).
- [ ] **Step 5:** Commit + push `feat: resultados, gráficos e recomendação`.
