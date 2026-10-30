# STATUS — CalculadoraInvestimentos

> **Presente.** Sobrescrito, no mesmo commit do trabalho que descreve.
> Não colocar lista de tarefas aqui — isso é `BacklogProj.md`. Este arquivo descreve, não enfileira.
> **Manter abaixo de 2.500 caracteres** — é o que o hook injeta.
> Configuração de máquina e comando de sincronização não são estado do projeto: não entram aqui.

## Onde paramos
Fase 1 implementada (2026-10-29): plano `docs/superpowers/plans/2026-10-29-fase1-calculadora.md`, 7/7 tarefas. Página estática (`index.html` + `js/`), 24 testes (`npm test`). Verificada no navegador em 1280×900 e 390×844 com o exemplo da referência (CDB pré 10% × LCI 105% CDI, CDI 14,4%): CDB com IR 17,5%, LCI vencedora. Rodar local: `python -m http.server 8000` (módulos ES não abrem via file://). Ainda não publicada em hospedagem.

## Bloqueios
- Nenhum.

## Decisões pendentes do usuário
Nenhuma.

## Decisões firmadas
Índice em `DecisoesProj.md`; porquês no `DiarioProj.md`. Referência analisada: `.claude/docs/referencia-comparador-sardinha.md`.

## Fora do versionamento
- `.playwright-cli/` (capturas temporárias do navegador automatizado; descartáveis).
