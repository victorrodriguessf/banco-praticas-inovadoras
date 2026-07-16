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

---

## 6. Complemento: Esqueci Minha Senha (Forgot Password)

Implementado a partir do plano em [`docs/sprints/sprint_1.md`](sprints/sprint_1.md#complemento-esqueci-minha-senha-forgot-password),
como continuação da mesma branch/sprint.

### Backend (`backend/src/controllers/authController.ts`)

- `enviarEmailOtp` passou a receber um quarto parâmetro `contexto: 'CADASTRO' | 'RECUPERACAO_SENHA'`,
  incluído no payload enviado ao Webhook do Power Automate. `registerRequest` foi
  atualizado para chamar `enviarEmailOtp(..., 'CADASTRO')`.
- `POST /auth/forgot-password/request`: busca o usuário pelo e-mail normalizado. Só gera
  um novo código/expira e dispara o webhook (`contexto: 'RECUPERACAO_SENHA'`) se o usuário
  existir **e** estiver `verificado`; em qualquer outro caso (e-mail inexistente ou conta
  não verificada) não faz nada. A resposta é **sempre** `200` com a mesma mensagem
  genérica, para não permitir enumeração de contas — decisão validada previamente com o
  usuário.
- `POST /auth/forgot-password/reset`: valida código/expiração (mesmo padrão de
  `registerVerify`), valida a força da `novaSenha` no backend (mesma regex usada no
  frontend — reaproveitando `SENHA_FORTE_REGEX`, não confia apenas na validação do
  client), grava o novo hash via bcrypt, limpa os campos de OTP e retorna o JWT (login
  automático), assim como o `registerVerify`.
- Nenhuma rota nova usa `authMiddleware`, já que o usuário ainda não está autenticado
  nesse fluxo.
- `docs/api-contract.yml`: adicionados os paths `/auth/forgot-password/request` e
  `/auth/forgot-password/reset`, e os schemas `ForgotPasswordRequest` /
  `ForgotPasswordResetRequest`.

### Frontend

- `frontend/src/schemas/passwordSchema.ts` (novo): extrai `senhaSchema` (regex de senha
  forte) e `codigoSchema` (OTP de 6 dígitos), antes duplicados/inline apenas dentro de
  `RegisterPage.tsx`. `RegisterPage.tsx` foi atualizado para importar dali em vez de
  declarar a regra localmente — elimina a duplicação que surgiria com a nova tela.
- `frontend/src/pages/ForgotPasswordPage.tsx` (novo): fluxo em 2 passos no mesmo padrão
  visual do `RegisterPage`. Passo 1 pede o e-mail e chama
  `POST /auth/forgot-password/request` — como a resposta é sempre genérica, a tela
  sempre avança para o passo 2, sem revelar se o e-mail existe. Passo 2 pede código +
  nova senha + confirmação (reaproveitando `senhaSchema`/`codigoSchema`), chama
  `POST /auth/forgot-password/reset` e, em caso de sucesso, salva o token e replica a
  mesma lógica de redirecionamento condicional (`GET /submissoes/minhas`) já usada em
  `LoginPage`/`RegisterPage` para decidir entre `/minhas-submissoes` e `/submissao`.
- `frontend/src/pages/LoginPage.tsx`: adicionado o link "Esqueci minha senha" abaixo do
  campo de senha, apontando para `/esqueci-senha`.
- `frontend/src/App.tsx`: rota `/esqueci-senha` registrada.
- Nenhuma mudança de schema Prisma foi necessária — os campos `codigoVerificacao`/
  `codigoExpiraEm` do `Usuario`, já existentes desde o cadastro, foram reaproveitados
  integralmente para o fluxo de reset.

### Verificação realizada

Testado ponta a ponta via `curl` contra o backend local (Postgres + MinIO já rodando):

1. `POST /auth/forgot-password/request` com e-mail inexistente → `200` genérico, sem
   gerar nenhum registro no banco. ✅
2. Fluxo completo de cadastro + verify para criar um usuário verificado de teste
   (`teste.forgotpw@rn.senac.br`). ✅
3. `POST /auth/forgot-password/request` com esse e-mail → `200` genérico (mesma
   resposta do caso 1), código gravado no banco. ✅
4. `POST /auth/forgot-password/reset` com código errado → `400`. ✅
5. `POST /auth/forgot-password/reset` com código certo e senha fraca (`senhafraca`,
   sem número/especial) → `400`, validação de força de senha no backend confirmada. ✅
6. `POST /auth/forgot-password/reset` com código certo e senha forte → `200` + JWT. ✅
7. `POST /auth/login` com a senha antiga → `401` (credenciais inválidas); com a nova
   senha → `200`. ✅
8. Frontend verificado via Playwright headless: link "Esqueci minha senha" no login,
   navegação para `/esqueci-senha`, os dois passos renderizados corretamente, e as
   mensagens de validação (senha fraca, senhas não coincidem) aparecendo como esperado.
   Nenhum erro de console. ✅
9. `npx tsc --noEmit` limpo em `backend/` e `frontend/` após todas as mudanças.
10. Dados de teste (usuário `teste.forgotpw@rn.senac.br`) removidos do banco ao final.

**Não verificado nesta sessão:** entrega real do e-mail de recuperação (com
`contexto: 'RECUPERACAO_SENHA'`) na caixa de entrada institucional — mesma limitação já
registrada na seção 4, depende de acesso à caixa de e-mail de destino.

---

## 7. Complemento: correção do campo de código + termômetro de força de senha

Reportado pelo usuário após uso real da tela de recuperação de senha: o campo "Código de
verificação" aparecia preenchido com o e-mail digitado no passo anterior. Ao investigar,
a causa **não era autofill do navegador** (como eu havia registrado, incorretamente, na
seção 6) — era um bug real de reconciliação do React.

### Causa raiz

Tanto `RegisterPage.tsx` quanto `ForgotPasswordPage.tsx` renderizam o passo 1 e o passo 2
como uma ternária (`step === 1 ? <form>...</form> : <form>...</form>`) sem nenhuma `key`
diferenciando as duas árvores. Como as duas `<form>` ficam na mesma posição da árvore de
componentes, o React reconcilia (reaproveita) o mesmo nó DOM do primeiro `<input>` em vez
de desmontá-lo e criar um novo ao trocar de passo. Como esses inputs são não-controlados
(react-hook-form usa `ref`, sem prop `value`), o React nunca limpa o `.value` do nó DOM
reaproveitado — então o campo de código "herdava" o valor que estava no campo de e-mail
antes da troca de passo. Confirmado inspecionando o DOM diretamente via Playwright
(`input.value` continha o e-mail, não era só um artefato visual).

**Correção:** adicionada uma `key` fixa e distinta (`key="step-1"` / `key="step-2"`) em
cada `<form>` das duas telas, forçando o React a desmontar completamente a árvore antiga e
montar nós DOM novos ao trocar de passo — o que também elimina qualquer chance de
autofill real do navegador carregar valor de um campo para outro.

Também foram adicionados, como reforço defensivo (não eram a causa do bug, mas são boas
práticas para campos de OTP):
- `autoComplete="one-time-code"` nos inputs de código (valor semântico padrão para OTP).
- Sanitização no `onChange` do campo de código (`replace(/\D/g, '').slice(0, 6)`), via a
  opção `onChange` do `register` do react-hook-form, garantindo que só dígitos e no
  máximo 6 caracteres cheguem ao estado do formulário mesmo se algum mecanismo do
  navegador tentar colar um valor maior que o `maxLength`.

### Termômetro de força de senha

- `frontend/src/schemas/passwordSchema.ts`: adicionada a função `calcularForcaSenha(senha)`,
  que retorna um nível de 0 a 3 (Fraca/Razoável/Boa/Forte) com base em: atendimento aos
  requisitos mínimos do `senhaSchema` (nível 0 se não atende), comprimento ≥ 10 e ≥ 14,
  presença de maiúscula+minúscula, e presença de número+caractere especial simultâneos
  (não apenas um dos dois, que já é exigido pelo schema).
- `frontend/src/components/PasswordStrengthMeter.tsx` (novo): barra segmentada de 4 blocos
  (vermelho/laranja/amarelo/verde) com rótulo textual abaixo, escondida quando o campo está
  vazio.
- Adicionado abaixo do campo de senha em `RegisterPage.tsx` (senha do cadastro) e em
  `ForgotPasswordPage.tsx` (nova senha do reset) — os dois únicos lugares onde o usuário
  cria uma senha nova.

### Verificação realizada

- `npx tsc --noEmit` limpo em `frontend/` após as mudanças.
- Via Playwright: inspecionado o `value` real do DOM do campo de código após navegar do
  passo 1 para o passo 2 em `/esqueci-senha` — confirmado vazio (`""`) após a correção,
  contra o valor do e-mail antes dela.
- Termômetro testado com 4 senhas de exemplo cobrindo os 4 níveis (`abc` → Fraca,
  `abc123` → Razoável, `Abcdef1` → Boa, `Abcdefgh12!@1234` → Forte), todos renderizando a
  cor/rótulo esperados. Nenhum erro de console.

---

## 8. Complemento: investigação de erro de CORS + cronômetro/reenvio de OTP

### Erro de CORS reportado ao cadastrar

O usuário reportou, ao tentar cadastrar uma conta nova: *"Requisição cross-origin
bloqueada... motivo: falha na requisição CORS. Código de status: (null)."* e que o
webhook não disparou.

**Investigação:** o backend (`backend/src/server.ts`) usa `app.use(cors())` sem
restrição de origem, o que permite qualquer origem — testado diretamente via `curl`
(`OPTIONS` de preflight e `POST` real), ambos retornando `Access-Control-Allow-Origin: *`
e sucesso. A mensagem "*Código de status: (null)*" é o texto padrão que o Firefox exibe
para **qualquer** falha de rede em uma requisição cross-origin (conexão recusada,
DNS, servidor fora do ar, etc.), não exclusivamente para bloqueios reais de política CORS
— e coincide com o fato de que, ao final da sessão anterior, os processos de
`backend`/`frontend` haviam sido encerrados. Reproduzido o fluxo completo de cadastro via
Playwright contra o backend e o frontend já em execução (iniciados pelo próprio usuário) e
o cadastro funcionou de ponta a ponta, sem nenhum erro de CORS ou de rede. **Conclusão:**
não é um bug de CORS no código — o servidor simplesmente não estava rodando no momento do
teste anterior. Nenhuma mudança de código foi necessária para este item.

### Cronômetro de validade do código + reenvio com cooldown

Adicionado às telas de cadastro (`RegisterPage.tsx`, passo 2) e recuperação de senha
(`ForgotPasswordPage.tsx`, passo 2):

- `frontend/src/hooks/useCountdown.ts` (novo): hook genérico de contagem regressiva por
  segundo, controlável por uma flag `ativo` (só roda o `setInterval` quando `true`).
- `frontend/src/components/OtpResendTimer.tsx` (novo): combina dois `useCountdown` —
  um de **validade** (600s / 10 min, deve casar com `OTP_VALIDADE_MINUTOS` no backend) e
  um de **cooldown de reenvio** (60s, decisão validada com o usuário). Exibe
  "Código válido por MM:SS" (ou "Código expirado" em vermelho ao chegar a zero) e um botão
  "Reenviar código", desabilitado e mostrando "Reenviar em Xs" enquanto o cooldown não
  zera — disponível a qualquer momento após os 60s, independente do código de 10 minutos
  ainda ser válido ou não (decisão validada com o usuário: cobre tanto "não recebi o
  e-mail" quanto "expirou", sem esperar os 10 minutos inteiros).
- Ambas as páginas ganharam um `otpResetKey` (state numérico incrementado a cada envio ou
  reenvio bem-sucedido) passado como prop `resetKey` ao `OtpResendTimer`, que reinicia os
  dois cronômetros para os valores cheios sempre que um novo código é de fato enviado.
- `RegisterPage.tsx` guarda os dados do passo 1 (`dadosSubmetidos`) para poder reenviar
  chamando `POST /auth/register/request` novamente com os mesmos `nome`/`email`/`senha`
  (a rota já lida com e-mail já existente e não-verificado, atualizando o código). Em
  `ForgotPasswordPage.tsx` o reenvio chama `POST /auth/forgot-password/request` de novo
  apenas com o e-mail já guardado do passo 1.

### Verificação realizada

- `npx tsc --noEmit` limpo em `frontend/`.
- Via Playwright: fluxo de cadastro completo confirmado funcionando (contra os servidores
  já em execução), sem erros de CORS/console — screenshot do passo 2 mostrando
  "Código válido por 10:00" e "Reenviar em 60s" logo após o envio inicial.
- Botão de reenviar confirmado desabilitado nos primeiros segundos e habilitado
  (`textContent` = "Reenviar código") após o cooldown de 60s zerar (aguardado em tempo
  real via `page.waitForFunction`); ao clicar, a chamada de reenvio foi feita com sucesso e
  o cooldown voltou para "Reenviar em 60s", confirmando o reset dos timers.
- Dados de teste removidos do banco ao final.
- **Não testado nesta sessão** (levaria 10 minutos de espera real): a transição do rótulo
  "Código válido por..." para "Código expirado" ao zerar a validade de 10 minutos — a
  lógica é idêntica (mesmo hook `useCountdown`) à do cooldown de 60s, já verificado
  chegando a zero corretamente.

---

## 9. Complemento: hardening de segurança (a partir do relatório de verificação)

Após uma verificação de segurança completa (estática + testes ativos), os achados foram
tratados. Severidades: 🔴 Crítico, 🟠 Alto, 🟡 Médio, 🔵 Baixo/Hardening.

### Segredos e credenciais
- 🔴 **Webhook do Power Automate vazado** (`docs/sprints/sprint_1.md`): a URL com a
  assinatura `sig=` estava versionada e havia sido enviada ao remote. **Ações:** o fluxo foi
  **rotacionado** (nova URL/assinatura fornecida pelo responsável); o valor foi **redigido**
  do documento; a URL real passou a viver **apenas** no `.env` (gitignored); e o histórico
  do git foi reescrito para purgar o segredo (ver commit/force-push de reescrita).
- 🔴 **`JWT_SECRET` = `supersecret`** (fallback hardcoded em `config.ts` e no `.env`):
  removido o fallback — `config.ts` agora **exige** `JWT_SECRET` via `requireEnv()` e o
  servidor **não inicia** sem ele. Gerado um segredo forte (`openssl rand -base64 48`) no
  `.env`. **Prova:** um token forjado com `supersecret` que antes retornava HTTP 200 agora
  retorna **401**.
- 🟡 **Credenciais default Postgres/MinIO** (`admin`/`admin123`): rotacionadas para valores
  fortes e aleatórios; os containers/volumes foram recriados (`docker compose down -v`),
  migrações reaplicadas e o edital re-semeado. `storage.ts` deixou de ter fallback embutido
  (exige `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD` do ambiente).
- 🔵 `.env.example` (raiz e backend) passou a usar **placeholders** (`CHANGE_ME_...`), sem
  o `supersecret` nem `admin/admin123`, com instruções de geração de segredos.

### Autenticação e sessão
- 🟠 **Sem rate-limiting**: adicionado `express-rate-limit`
  (`backend/src/middlewares/rateLimit.ts`) — `authLimiter` (20/15min) em
  login/verify/reset e `emailLimiter` (5/15min) nos endpoints que disparam e-mail
  (register/request, forgot-password/request), mitigando força bruta de senha/OTP e abuso
  do webhook. **Prova:** 25 logins seguidos → 401 até o 19º e **429** a partir do 20º.
- 🟠 **OTP com `Math.random()`**: trocado por `crypto.randomInt(100000, 1000000)`
  (criptograficamente seguro).
- 🟡 **Enumeração de usuários** no cadastro: `/auth/register/request` deixou de responder
  "Já existe uma conta verificada" (400) e passou a devolver a **mesma mensagem genérica**
  em todos os casos (como já era no fluxo de recuperação).
- 🟡 **Middleware confiava no token**: `authMiddleware` agora **revalida o usuário no
  banco** a cada requisição e deriva o `role` do banco (não do payload); token de conta
  removida ou não-verificada deixa de valer.
- Validade do JWT reduzida para **8h** (configurável via `JWT_EXPIRES_IN`).

### Superfície HTTP e uploads
- 🟠 **XSS armazenado via upload**: `uploadController` passou a validar o conteúdo por
  **magic bytes** (não confia no MIME declarado), aceitando **apenas imagens rasterizadas**
  (JPG/PNG/WEBP/GIF — que não executam script); `multer` ganhou limite de **5 MB** e 1
  arquivo; o nome do objeto é gerado pelo servidor (UUID + extensão do tipo detectado),
  ignorando o nome original. **Prova:** upload de `.html` com `<script>` → **400**; PNG
  real → **201**, servido como `Content-Type: image/png` com `X-Content-Type-Options:
  nosniff`.
- 🟡 **CORS aberto**: substituído `cors()` por allowlist via env (`CORS_ORIGINS`, padrão
  `http://localhost:3000`). **Prova:** origem `https://evil.example` não recebe
  `Access-Control-Allow-Origin`; `http://localhost:3000` é permitida.
- 🔵 **Sem cabeçalhos de segurança**: adicionado `helmet` (CSP, HSTS, `X-Content-Type-
  Options`, `X-Frame-Options`, etc.). Corpo JSON limitado a **1 MB**.
- 🔵 **Payload de submissão sem limites**: `createSubmissao` passou a validar tipos,
  tamanho de strings (título/descrição/itens) e cardinalidade dos arrays (máx. 50 itens),
  além de checar `ods` inteiro no intervalo 1–17 e `termosAceitos === true`.
- 🔵 **Política de senha**: mínimo elevado de 6 para **8** caracteres (backend em
  `authController`, frontend em `passwordSchema.ts` + telas), mantendo o requisito de
  letra + número/especial.

### Itens deferidos (documentados como follow-up)
- **Bucket privado + URLs pré-assinadas** (endurecimento adicional do #4): mantido público
  por decisão, já que a whitelist de imagens rasterizadas neutraliza o XSS sem quebrar o
  fluxo atual de URLs.
- **Migração do token para cookie `HttpOnly`/refresh token + revogação** (#9): mudança
  arquitetural maior; por ora, mitigado com expiração de 8h e revalidação no banco.
- **Lockout por conta após N tentativas de OTP**: exigiria campo/migração no schema;
  hoje coberto pelo rate-limit por IP.

### Verificação
`npx tsc --noEmit` limpo em `backend/` e `frontend/`. Todos os testes ativos acima
confirmados contra o backend em execução com os segredos rotacionados. Fluxo feliz
(cadastro com senha de 8+ → verify → submissão) confirmado retornando 201; artefatos e
usuários de teste removidos do banco e do MinIO ao final.
