# DIÁRIO — CalculadoraInvestimentos

> **Passado recente.** Append-only, entrada nova sempre no topo.
> O cabeçalho `## AAAA-MM-DD` é o que o hook SessionStart procura para injetar as entradas mais
> recentes — não mudar esse formato.
> Registrar o que o `git log` não guarda: porquês, alternativas descartadas, definições do usuário.
> Não narrar o diff.
>
> **Teto de 2.500 caracteres por entrada.** Passou disso, o excedente é narrativa de estudo:
> vai para `.claude/docs/` e aqui fica o ponteiro com a conclusão.
> **Teto de 25 KB no arquivo.** Na virada do mês ou ao estourar esse tamanho, mover as entradas
> antigas para `.claude/docs/diario/AAAA-MM.md`.
>
> Ao acrescentar entrada: ler só as primeiras ~40 linhas deste arquivo, nunca ele inteiro.
> Assunto do ambiente DevMode (sincronização, hooks, estrutura) não entra aqui — vai para
> `configuracao/docs/diario-ambiente.md` no repositório da raiz.

## 2026-10-29

**Decisões:** escopo definido em brainstorming, design em `docs/superpowers/specs/2026-10-29-calculadora-investimentos-design.md`. Uso só pessoal (sem restrição CVM para recomendação). Evolução por fases: 1) calculadora no navegador, sem servidor; 2) servidor com senha, Tesouro e IA; 3) marcação a mercado e cenários passados; 4) ofertas de bancos. Vencedor = maior rentabilidade líquida ao ano, sem simular reinvestimento — o usuário quer uma foto das ofertas de hoje para decidir agora; descartei comparar numa data final comum com reinvestimento por ser simulação de aporte futuro. 3 colunas por padrão, ajustáveis; gráficos já na Fase 1.

**Estudos:** referência Sardinha lida via playwright-cli (WebFetch bloqueado no domínio): erra faixa de IR e desconta IR da taxa anual — `.claude/docs/referencia-comparador-sardinha.md`. Teste em 2026-10-29 no navegador: API SGS do Banco Central responde 200 direto da página (Selic, CDI, IPCA, dólar, Focus); Tesouro Direto bloqueia (Failed to fetch) → Fase 2.

**Implementação:** Fase 1 feita no mesmo dia. Regras conferidas por busca: LCI/LCA isentas em 2026 (MP 1.303/2025 caducou 08/10/2025); custódia 0,20% a.a., Tesouro Selic isento até R$ 10 mil. Gráfico de barras mostra só o rendimento (com valor total a diferença sumia). Cores dos gráficos: paleta de referência da skill dataviz (validador não rodou por bloqueio de permissão na pasta temporária).

**Ficou aberto:** hospedagem para acessar de outros dispositivos.

## AAAA-MM-DD

**Decisões:** <o que ficou decidido e por quê; o que foi descartado e por quê>

**Estudos:** <a conclusão em uma linha; o estudo em si em `.claude/docs/<estudo>.md`>

**Ficou aberto:** <o que não se resolveu; decisão do usuário vai para `DecisoesProj.md`>
