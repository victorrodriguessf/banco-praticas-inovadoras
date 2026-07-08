# Instruções para o Claude Code neste repositório

## Documentação de sprints

Este projeto documenta cada sprint em dois arquivos separados, dentro de `docs/`:

- **`docs/sprints/sprint_N.md`** — o prompt/plano original recebido para
  executar a sprint N (o "pedido"). Ver [docs/sprints/README.md](docs/sprints/README.md)
  para a convenção completa.
- **`docs/sprint-N-changelog.md`** — o que foi de fato implementado na sprint N:
  mudanças, decisões técnicas, divergências do plano original e resultado da
  verificação.

**Antes de iniciar uma nova sprint ou de dar continuidade a um trabalho em
andamento**, consulte `docs/sprints/` e os changelogs correspondentes para
entender o histórico e as decisões já tomadas — evita repetir perguntas já
respondidas ou contradizer decisões anteriores (ex.: versões de dependências
fixadas por incompatibilidade, como o `typescript@5.x` no `backend/`, ver
`docs/sprint-0-changelog.md`).

**Ao concluir uma sprint**, siga o mesmo padrão:
1. Salve o prompt/plano recebido em `docs/sprints/sprint_N.md` (conteúdo
   literal, sem reescrever).
2. Gere o changelog em `docs/sprint-N-changelog.md` com tudo que foi feito.
3. Atualize o índice em `docs/sprints/README.md`.
