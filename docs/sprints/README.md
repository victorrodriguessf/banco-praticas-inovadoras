# Prompts de Sprint

Esta pasta guarda, para cada sprint, o **documento original usado como prompt/plano
de execução** (o que foi pedido, não o que foi feito).

## Convenção

- Um arquivo por sprint: `sprint_N.md` (`sprint_0.md`, `sprint_1.md`, `sprint_2.md`, ...).
- O conteúdo é o plano/prompt **tal como recebido** para iniciar a sprint — não deve
  ser reescrito ou resumido aqui. Se o plano mudar durante a execução, isso é
  registrado no changelog da sprint, não editado neste arquivo.
- O **resultado** de cada sprint (o que foi de fato implementado, decisões
  técnicas, divergências do plano, verificação) fica em um changelog separado,
  em `docs/sprint-N-changelog.md`.

## Por que isso existe

Manter o prompt original e o changelog separados dá contexto histórico completo:
dá para comparar o que foi pedido com o que foi entregue, e entender o "porquê"
de decisões tomadas durante a execução (ex.: uma dependência que precisou ser
trocada, uma etapa que não pôde ser validada no momento, etc.).

## Índice

| Sprint | Prompt | Changelog |
|---|---|---|
| 0 — Fundação Conteinerizada e Monorepo | [sprint_0.md](sprint_0.md) | [sprint-0-changelog.md](../sprint-0-changelog.md) |
