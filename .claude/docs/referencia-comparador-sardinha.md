# Referência: Comparador de Renda Fixa (Investidor Sardinha)

URL: https://investidorsardinha.r7.com/calculadoras/comparador-de-renda-fixa/
Lido em 2026-10-29 via `playwright-cli` (o WebFetch é bloqueado nesse domínio).

## Entradas (duas colunas lado a lado, A × B)
- **Tipo de investimento** (select): CDB, LCI, LCA, CRI, CRA, Debênture, Debênture Incentivada, Tesouro Direto, AUPO11
- **A rentabilidade está em** (botões): pré-fixado | % do CDI | taxa fixada + IPCA
- **Rentabilidade** (texto, placeholder `10,00`)
- **Tempo de investimento (meses)** (texto, placeholder `12`)
- Taxas base fixas exibidas: "CDI 14.4%, IPCA 4.5%" (sem campo para editar)
- Não há valor investido, aporte mensal nem data.

## Saída
- Frase-resumo: "O investimento X vai render N% a.a ... Y é melhor que X."
- Card por investimento: rentabilidade líquida a.a., período, faixa de prazo, alíquota de IR ou "isento".
- Só percentuais. Nada em R$, sem gráfico, sem tabela de evolução.

## Teste executado (exemplo da própria página)
CDB pré 10% × LCI 105% do CDI, 12 meses → CDB **8,00% a.a.** (IR 20%), LCI **15,12% a.a.** (isento). LCI vence.
- 105% × 14,4% = 15,12% → % do CDI é aplicado de forma linear sobre o CDI anual.
- 10% × (1 − 0,20) = 8% → IR aplicado direto sobre a taxa anual, não sobre o rendimento do período.

## Pontos fracos observados (candidatos a melhoria)
- 12 meses classificado como "181 a 360 dias" com IR 20%. Pela tabela regressiva, 12 meses (~365 dias) cai em 361–720 dias, alíquota 17,5%. Parece que o site conta o mês como 30 dias.
- IR descontado da taxa anual, quando o correto é descontar do rendimento acumulado no fim do prazo.
- CDI e IPCA fixos, sem como o usuário ajustar ou ver de quando são.
- Sem valor em R$, aportes, IOF (< 30 dias), custódia do Tesouro (B3) ou poupança.
- Compara só 2 investimentos.
- "Tesouro Direto" é uma opção única, sem distinguir Selic / Prefixado / IPCA+.

## Melhorias pedidas pelo usuário (2026-10-29, não definitivas — refinar com o uso)
- Exibir Selic, IPCA e dólar atuais ao abrir o site; se possível, atualizar sozinho com a página aberta.
- 3 calculadoras por padrão, com opção de reduzir ou ampliar.
- Buscar investimentos em sites de bancos indicados e no Tesouro Direto (pode ser por ação do usuário, ex.: botão).
- Quando o navegador automatizado for aberto, usar modo visível (`--headed`) para o usuário acompanhar.
