# CalculadoraInvestimentos

> Regras **só deste projeto**. As gerais já chegam sozinhas pelos `CLAUDE.md` de cima (global, raiz do
> DevMode e `Projetos/CLAUDE.md`) — não repetir nada delas aqui.
> **Manter curto:** este arquivo é lido inteiro em toda sessão do projeto. Explicação longa, estudo ou
> especificação vai para `.claude/docs/` e aqui fica só o ponteiro.
> As regras crescem com o projeto: entra uma linha quando uma decisão vira regra de trabalho.

## O que é
Página estática que simula e compara investimentos de renda fixa (CDB, LCI, tributos, meta), com dados do
Banco Central. Publicada em https://anderalves00.github.io/CalculadoraInvestimentos/.

## Estrutura
- `index.html`, `css/`, `js/` (`calculo/`, `dados/`, `ui/`) — a página.
- `tests/` — testes (`npm test`). Rodar local: `python servir.py` → http://localhost:8000.
- `docs/superpowers/` — spec e plano; `.claude/docs/` — referência analisada (comparador do Sardinha).

## Regras deste projeto
- **Repositório público e site no ar:** todo push na `main` atualiza o site via GitHub Pages. Nada de dado
  pessoal ou de carteira real no repositório.
