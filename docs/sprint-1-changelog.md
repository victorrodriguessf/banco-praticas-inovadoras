# Sprint 1 — Autenticação Segura (OTP) e Formulário de Submissão

Documentação das mudanças aplicadas a partir do plano [`docs/sprints/sprint_1.md`](sprints/sprint_1.md), na
branch `feature/sprint-1-auth-submissao`.

**Data:** 14/07/2026
**Branch:** `feature/sprint-1-auth-submissao` → `develop`

---

## Objetivo da sprint

Implementar o fluxo de cadastro de docentes com verificação de e-mail institucional via
OTP (código de 6 dígitos enviado por Webhook do Power Automate) e o formulário completo
de submissão de práticas, com upload de evidências para o MinIO e vínculo direto entre a
submissão e o usuário autenticado.

---

## 1. Banco de dados (Prisma)

**Migração:** `20260714195024_sprint1_cadastro_submissao`, aplicada com sucesso contra o
Postgres local (via `docker compose up -d`).

- `Usuario` ganhou `verificado` (Boolean, default `false`), `codigoVerificacao` (String?) e
  `codigoExpiraEm` (DateTime?), além da relação reversa `submissoes`.
- `Submissao` foi remodelada conforme o plano: os campos `instrutor`/`segmento`/`unidade`
  (singulares) foram substituídos por `autores`, `unidades`, `segmentos`, `cursos` (arrays)
  e `categoria` (string única). Foram adicionados `usuarioId`/`usuario` (relação obrigatória),
  `termosAceitos` (Boolean) e `anexos` (String[], URLs do MinIO).
- Esta é uma mudança **destrutiva** de schema (o plano já sinalizava isso em "User Review
  Required") — não há dados de produção envolvidos, então não foi necessário script de
  migração de dados.
- Foi adicionado `backend/prisma/seed.ts` (com `npm run seed` e `prisma.seed` no
  `package.json`) para popular o edital `edital-2026`, necessário para exercitar o fluxo de
  submissão em desenvolvimento — o plano original não previa seed, mas sem edital nenhum
  não é possível testar `POST /submissoes` de ponta a ponta.

---

## 2. Backend

### Autenticação e OTP (`backend/src/controllers/authController.ts`)

- `POST /auth/register/request`: valida o domínio `@rn.senac.br`, gera um código de 6
  dígitos com validade de 10 minutos, grava o usuário como não-verificado (com senha já
  hasheada via bcrypt) e dispara o Webhook do Power Automate via `fetch` nativo do Node
  (nenhuma lib de e-mail foi instalada, conforme pedido). Se `POWER_AUTOMATE_WEBHOOK_URL`
  não estiver configurada ou a chamada falhar, o erro é apenas logado — a criação da conta
  não é bloqueada por uma falha do webhook.
- `POST /auth/register/verify`: confere código e expiração, marca `verificado = true`,
  limpa os campos de OTP e retorna o JWT (mesmo formato do `/auth/login`).
- `POST /auth/login` e as rotas de cadastro agora aplicam `.toLowerCase().trim()` no e-mail recebido, garantindo robustez contra espaços ocultos (comuns no autocomplete de teclados) e divergência de caixa alta/baixa.
- O login mock (`docente@senac.br` / `minhaSenha123`) foi **removido** para dar espaço ao fluxo real, com o usuário de teste sendo apagado do banco de inicialização.

### Autorização (`backend/src/middlewares/auth.ts`, `backend/src/config.ts`)

- Novo middleware `authMiddleware` valida o Bearer token e popula `req.usuarioId` /
  `req.usuarioRole`. `JWT_SECRET` foi extraído para `config.ts` e reaproveitado por
  `authController` e pelo middleware (não existia módulo compartilhado antes).
- Aplicado em `POST /upload` e `POST /submissoes` — o plano só exigia autenticação em
  `/submissoes`, mas o upload de evidências também precisa saber quem está enviando (evita
  upload anônimo para o bucket), então o middleware foi replicado ali também.

### Upload (`backend/src/controllers/uploadController.ts`)

- Usa `multer` com `memoryStorage` (já era dependência do projeto) e o `s3Client` existente
  em `backend/src/services/storage.ts` para enviar o arquivo ao bucket `banco-de-praticas`
  no MinIO, retornando a URL pública `http://localhost:9000/banco-de-praticas/<uuid>-<nome>`.
- O bucket `banco-de-praticas` agora é criado e configurado automaticamente (permissão pública de download)
  no `docker-compose.yml` através do contêiner de inicialização `storage-init`.

### Submissões (`backend/src/controllers/submissaoController.ts`)

- Reescrita para receber o novo formato com arrays e `usuarioId` extraído do JWT (via
  `authMiddleware`), gravando a submissão já vinculada ao usuário autenticado.
- Rota `GET /submissoes/minhas` adicionada para listar todas as submissões enviadas pelo usuário (utilizada no fluxo de login para redirecionamento condicional da página `/minhas-submissoes`).

### Contrato de API (`docs/api-contract.yml`)

- Adicionados os schemas/paths de `RegisterRequest`, `RegisterVerifyRequest`,
  `/auth/register/request`, `/auth/register/verify` e `/upload`.
- `SubmissaoRequest` foi atualizado para o novo formato de arrays.

---

## 3. Frontend

### Dependências

- Adicionados `zod`, `react-hook-form` e `@hookform/resolvers` (zod v4 foi instalado —
  houve necessidade de ajustar `z.literal(true, { message: ... })` no lugar de `errorMap`,
  que existia apenas em zod v3).
- **Remoção**: A ferramenta de simulação `msw` (Mock Service Worker) foi completamente desativada e removida do `frontend/src/main.tsx`. Ela estava interceptando as requisições de `POST /auth/login` em ambiente de desenvolvimento, impedindo a comunicação com a API real.

### Estilização Global (`frontend/src/index.css`)
- Adicionada regra CSS no escopo global (`input::-ms-reveal { display: none !important; }`) para esconder o ícone de olho nativo injetado por navegadores como o Microsoft Edge em campos de senha, evitando conflito visual (dois olhos) com o botão personalizado da interface.

### `frontend/src/pages/RegisterPage.tsx` (novo)

- Fluxo em dois passos como especificado: passo 1 (nome/e-mail/senha/confirmar senha, validado com zod,
  e-mail obrigatoriamente `@rn.senac.br`, senha mínima de 6 caracteres obrigatoriamente contendo letras E pelo menos um número ou caractere especial e confirmação de senha igual à original) e passo 2 (código OTP de 6 dígitos). Ao confirmar
  o código, o token é salvo e o usuário é redirecionado para `/minhas-submissoes` ou `/submissao`.
- Adicionado botão (ícone de olho) para alternar a visibilidade das senhas nos campos de formulário, tanto na tela de cadastro quanto no login.
- Rota registrada em `/cadastro` (`App.tsx`); `LoginPage.tsx` ganhou um link "Cadastre-se"
  apontando para lá.

### `frontend/src/pages/SubmissionPage.tsx` (reescrita completa)

- Formulário com `react-hook-form` + `zodResolver`, replicando o padrão de erro do
  Bootstrap (borda vermelha + mensagem `text-sm` vermelha abaixo do campo inválido).
- Campos: título, edital (select populado via `GET /editais/ativos`), autores (tag input),
  unidades/segmentos (checkboxes), cursos (tag input), categoria (select), descrição
  (textarea), ODS (grid de 17 checkboxes reaproveitando `ODS_DATA` já existente em
  `types.ts`), marcas formativas (checkboxes), upload múltiplo de evidências e aceite de
  termos.
- Upload: cada arquivo selecionado é enviado individualmente para `POST /upload` (com o
  Bearer token do usuário logado); as URLs retornadas são acumuladas no campo `anexos` do
  formulário.
- Submissão bem-sucedida mostra uma tela de confirmação (reaproveitando o visual da tela
  antiga "Autenticado com sucesso").
- **Divergência do plano:** as listas de opções de Unidades, Segmentos, Categoria e Marcas
  Formativas (`frontend/src/data/formOptions.ts`) são um recorte curado a partir dos dados
  reais dos catálogos 2022–2025 (unidades e marcas formativas) e de uma proposta própria
  para Categoria, já que o plano não especificou essas listas nem havia uma fonte única e
  limpa nos catálogos (muito texto livre/inconsistente). Deve ser validado com o time antes
  de considerar definitivo.
- **Melhorias de UX/UI:** O formulário recebeu um acabamento estético Premium utilizando conceitos de *Glassmorphism* no container principal (fundo translúcido com `bg-white/40`), mantendo a identidade visual do Senac (Azul e Laranja).
- Foram introduzidas melhorias de foco dinâmico nos inputs (fundo `bg-gray-50` que muda para `bg-white` ao receber foco) e uma prop `hint` no componente `TagInput` para guiar o usuário na inserção de Autores e Cursos. Para contornar bugs de renderização do motor Chromium com a propriedade `backdrop-blur` nas bordas do navegador, a opacidade e transparência foram ajustadas evitando o artefato escuro na tela.

### `frontend/src/pages/MinhasSubmissoesPage.tsx` (nova tela de verificação de envios)

- Uma nova página foi adicionada para atuar como landing page após login caso o usuário já possua submissões cadastradas.
- Essa página lista as submissões realizadas mostrando título, data de submissão e o status atual da avaliação ("Aguardando avaliação", etc).
- Oferece a opção para o usuário enviar uma nova prática inovadora.
- O fluxo de sucesso em `/submissao` foi atualizado: o botão final agora leva para `/minhas-submissoes` (em vez de retornar para a raiz do projeto), fechando o ciclo do usuário.
- A navegação a partir do login (`LoginPage.tsx` e `RegisterPage.tsx`) foi alterada para redirecionar para `/minhas-submissoes` caso existam registros vinculados àquele usuário (via consulta prévia à API `GET /submissoes/minhas`), e caso não haja, para `/submissao`.


---

## 4. Verificação realizada

Testado ponta a ponta via `curl` contra o backend local (Postgres + MinIO via
`docker compose up -d`):

1. `POST /auth/register/request` com e-mail `@gmail.com` → `400` (rejeitado). ✅
2. `POST /auth/register/request` com e-mail `@rn.senac.br` → `201`, código gerado e
   webhook do Power Automate chamado sem erro de rede. ✅
3. `POST /auth/register/verify` com o código correto → `200` + JWT válido. ✅
4. `POST /upload` autenticado → arquivo gravado no bucket `praticas-uploads` do MinIO,
   URL retornada. ✅
5. `POST /submissoes` autenticado, com arrays e anexo → `201`, submissão criada com
   `usuarioId` corretamente vinculado ao usuário do token. ✅
6. Frontend: `/cadastro` e `/login` foram testados na API real e validados contra problemas comuns como espaços adicionais e ícones nativos conflitantes. A validação visual obedece rigorosamente às regras de complexidade de senha. ✅
7. Banco de dados limpo ao final da verificação (remoção de submissões e contas de teste órfãs).

`npx tsc --noEmit` roda limpo em `backend/` e `frontend/`.

**Não verificado nesta sessão:** entrega real do e-mail de OTP na caixa de entrada
institucional (item 2 do Verification Plan original) — depende de acesso à caixa de e-mail
de destino, fora do escopo desta verificação automatizada.

---

## 5. Próximos passos sugeridos

- Confirmar com o time as listas definitivas de Unidades/Segmentos/Categoria/Marcas
  Formativas usadas no formulário de submissão.
- [x] Automatizada a criação e configuração (permissão pública) do bucket `banco-de-praticas` no MinIO via
  `docker-compose` (serviço `storage-init`).
- Validar recebimento real do e-mail OTP via Power Automate com alguém que tenha acesso à
  caixa de entrada institucional.
