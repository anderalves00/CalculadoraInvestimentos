# Calculadora de Investimentos — Design

Data: 2026-10-29
Referência analisada: Comparador de Renda Fixa do Investidor Sardinha (análise completa em `.claude/docs/referencia-comparador-sardinha.md`).

## Intenção

Uma calculadora de renda fixa **para uso pessoal do usuário**, que não para em "qual rende mais": ela apoia a **decisão** de onde investir, levando em conta o momento econômico do país.

A referência (Sardinha) compara 2 investimentos e devolve só percentuais. O usuário quer saber quanto vai ter em reais, entender cada investimento, ver gráficos e receber uma recomendação com o motivo.

O projeto é evolutivo por escolha do usuário: fazer o que for possível agora e aprimorar com o uso, conversando sobre ideias. Nada deste documento é definitivo além da Fase 1.

## Público

Só o usuário. Não é produto público — por isso a recomendação de investimento não tem as restrições regulatórias (CVM) que teria se fosse oferecida a terceiros. Deve funcionar em qualquer dispositivo dele, inclusive celular.

## Objetivos

1. Comparar investimentos de renda fixa lado a lado, **3 por padrão**, com opção de reduzir (mínimo 1) ou ampliar.
2. Mostrar **valores em R$**: valor investido, valor bruto no vencimento, IR, IOF, taxas e valor líquido, além da rentabilidade.
3. Exibir **Selic, CDI, IPCA e dólar atuais** ao abrir a página e atualizar sozinho com a página aberta.
4. **Gráficos** que ajudem a decidir.
5. **Recomendação** de qual escolher, com o porquê.
6. **Parte educativa**: o que é cada investimento, diferenças, para quem é indicado.
7. (Fases seguintes) marcação a mercado, comparação com cenários parecidos do passado, busca de ofertas no Tesouro e em bancos.

## Não objetivos

- Não é para outras pessoas: sem cadastro, sem multiusuário.
- Sem renda variável (ações, FIIs) — o escopo é renda fixa.
- Sem aportes mensais por enquanto (não foi pedido; pode entrar depois).
- Sem poupança e sem o fundo AUPO11 que o Sardinha lista (não pedidos).

## Anti-objetivos (falharia mesmo "funcionando")

- Repetir os erros de cálculo da referência: IR na faixa errada (12 meses tratado como até 360 dias) e IR descontado da taxa anual em vez do rendimento.
- Mostrar cotação desatualizada como se fosse atual — toda cotação exibe a data a que se refere.
- Recomendação sem justificativa, em tom de certeza.
- Tela que não se usa no celular.

## Fases

### Fase 1 — calculadora útil, sem servidor (escopo deste ciclo)

**Cotações.** Lidas do Banco Central direto da página (API SGS). **Testado em 2026-10-29** a partir de outro site no navegador: as séries responderam com status 200 e dados — Selic meta (432): 13,75 em 04/11/2026; CDI anual (4389): 13,65 em 28/10/2026; IPCA mensal (433): 0,82 em 09/2026; IPCA 12 meses (13522): 4,58; dólar venda (1): 5,3744 em 29/10/2026. Expectativas Focus (Olinda) também respondeu 200.
- Exibir cada valor com a data de referência.
- Atualizar periodicamente com a página aberta (frequência: decisão do construtor; essas séries mudam no máximo uma vez por dia).
- Se a busca falhar, campos editáveis com o último valor conhecido e aviso visível.
- Usuário pode sobrescrever CDI/IPCA para simular cenários.

**Cada calculadora (coluna) recebe:**
- Tipo: CDB, LCI, LCA, CRI, CRA, Debênture, Debênture Incentivada, Tesouro Selic, Tesouro Prefixado, Tesouro IPCA+ (o Tesouro é separado por título, diferente da referência).
- Indexador: pré-fixado (% a.a.), % do CDI, CDI + taxa, IPCA + taxa — todos disponíveis para qualquer tipo privado. Tesouro: Selic + taxa (Selic), pré (Prefixado), IPCA + taxa (IPCA+).
- Fase 1 trata só títulos que pagam tudo no vencimento. Títulos com cupom periódico (Tesouro com Juros Semestrais, debêntures/CRI/CRA com cupom) ficam para depois, porque o IR por pagamento e o reinvestimento mudam o motor de cálculo.
- Taxa.
- Prazo — em meses ou por data de vencimento (decisão do construtor como apresentar; o cálculo é em dias corridos para IR/IOF e dias úteis para CDI).
- Valor investido (padrão sugerido: o mesmo valor replicado nas colunas, editável).

**Regras de cálculo:**
- IR pela tabela regressiva sobre o **rendimento**, pela contagem de dias corridos: até 180 dias 22,5%; 181–360 20%; 361–720 17,5%; acima de 720 15%.
- Isentos de IR para pessoa física: LCI, LCA, CRI, CRA, Debênture Incentivada. **Conferir na implementação se as regras de tributação vigentes em 2026 mudaram** (houve propostas de tributar LCI/LCA em 2025; não verificado o desfecho).
- IOF regressivo para resgate antes de 30 dias.
- Taxa de custódia da B3 para o Tesouro (verificar valor e isenções vigentes na implementação).
- Pós-fixado (% do CDI e Selic): projeção com a taxa atual mantida constante no período — premissa explícita na tela.
- IPCA + taxa: projeção com IPCA dos últimos 12 meses (ou expectativa Focus, se o construtor preferir — dizer qual na tela).

**Resultado:**
- Card por coluna com bruto, IR, IOF, custódia, líquido, rentabilidade líquida no período e ao ano.
- **Vencedor destacado visualmente** (na referência, o vencedor só aparece no meio de uma frase).
- **Critério do vencedor: maior rentabilidade líquida ao ano.** A calculadora é uma foto das ofertas disponíveis hoje para decidir agora, não uma simulação do que se faz com o dinheiro depois — por isso não há reinvestimento projetado. Cada card mostra os valores em R$ no próprio vencimento. Exemplo discutido: 11% líquido em 8 meses (≈ 16,9% a.a.) vence 12% em 1 ano.
- Cada oferta mostra também a **equivalência em % do CDI** (ex.: "equivale a um CDB de 118% do CDI").
- Com prazos diferentes entre as colunas, aviso curto: o prazo menor devolve o dinheiro antes.

**Gráficos:**
- Evolução do valor líquido ao longo do prazo, uma linha por investimento.
- Composição do resultado (bruto → impostos/taxas → líquido) por investimento.

**Recomendação por regras:** um parágrafo explicando qual tende a ser melhor e por quê, considerando prazo, isenção, indexador e o momento (Selic alta/baixa, inflação subindo/caindo). As regras ficam a cargo do construtor, com o tom de "tende a", nunca de certeza.

**Parte educativa:** texto sobre cada tipo — o que é, garantia (FGC ou Tesouro), liquidez, tributação, para quem é indicado. Acessível de dentro da calculadora (ex.: ícone de ajuda ao lado do tipo) e numa seção própria.

**Responsivo:** no celular as colunas viram blocos empilhados.

### Fase 2 — servidor na internet
Necessária porque o Tesouro Direto **bloqueia** a leitura direta pela página (testado em 2026-10-29: as duas fontes de preços/taxas do Tesouro falharam por bloqueio de acesso entre sites).
- Acesso por senha, de qualquer dispositivo.
- Busca dos títulos do Tesouro disponíveis para preencher a calculadora.
- Recomendação feita por IA, com a chave guardada no servidor.
- Serviço sugerido: hospedagem com funções de servidor no plano gratuito (ex.: Vercel, Cloudflare). **Limites e custos não verificados** — conferir antes de escolher.

### Fase 3 — análise
- Marcação a mercado: quanto se receberia vendendo antes do vencimento, dada uma nova taxa de mercado.
- Momento atual comparado com períodos passados de cenário parecido (Selic/IPCA), e como cada tipo de investimento se saiu naquele período.

### Fase 4 — ofertas de bancos
Busca de ofertas em bancos indicados pelo usuário, testando banco a banco (muitos exigem login ou montam a página por JavaScript). Alternativa para os difíceis: o usuário cola a oferta e a calculadora preenche.

## Restrições

- Uso pessoal, custo zero ou mínimo.
- Fase 1 sem servidor: tudo roda no navegador.
- Precisa abrir de outros dispositivos — a Fase 1 já deve ser publicável numa hospedagem estática (qual: decisão do plano; verificar se aceita repositório privado).
- Em português do Brasil, números no formato brasileiro (1.234,56).

## Decidido pelo usuário

- Uso pessoal.
- Seguir a ordem de fases proposta.
- Gráficos de apoio à decisão.
- Evolutivo: aprimorar com o uso.
- Ao usar navegador automatizado, deixar visível para acompanhar.
- Vencedor por rentabilidade líquida ao ano, sem simular reinvestimento.

## Decisões minhas (o usuário pode corrigir)

- Mobile-first.
- Tesouro separado por título.
- Sem poupança, AUPO11 e aportes na Fase 1.
- Premissa de taxas constantes na projeção, explícita na tela.
- Indexador CDI + taxa incluído (comum em debêntures, CRI e CRA).
- Fase 1 sem títulos com cupom periódico.

## Deixado ao construtor

Tecnologia e biblioteca de gráficos, layout, regras exatas da recomendação, frequência de atualização das cotações, apresentação do prazo.
