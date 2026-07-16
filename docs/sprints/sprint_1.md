# Sprint 1: Autenticação Segura (OTP) e Formulário de Submissão

Este plano detalha o desenvolvimento de duas grandes frentes para a Sprint 1:
1. **O fluxo de Cadastro (Registration):** Validação rígida com e-mail institucional e verificação via código de segurança (OTP) enviado através de um Webhook do **Power Automate**.
2. **O Formulário de Submissão:** Coleta estruturada dos dados com arrays, validações estilo Bootstrap e upload de evidências no MinIO.

---

## 0. Instruções de Git Flow para a IA

Antes de iniciar qualquer codificação, garanta que você está partindo de uma base limpa e atualizada, seguindo o nosso fluxo de trabalho.

**Instruções de inicialização:**
1. Volte para a branch de integração: `git checkout develop`
2. Atualize a branch local: `git pull origin develop`
3. Crie a nova branch de trabalho para esta sprint: `git checkout -b feature/sprint-1-auth-submissao`

*Todo o código e os commits devem ser feitos nesta nova branch.*

---

## User Review Required

> [!IMPORTANT]
> **Alterações no Banco de Dados (Prisma):**
> 1. O modelo `Usuario` precisará de campos novos para suportar a verificação de e-mail (ex: `verificado`, `codigoVerificacao`, `codigoExpiraEm`).
> 2. O modelo `Submissao` precisará de mudanças agressivas para suportar todos os arrays (múltiplas unidades, segmentos, categorias) e se relacionar diretamente com o `Usuario`.

## Open Questions

> [!TIP]
> **Integração de E-mails via Webhook (Power Automate):** A IA não precisará instalar pacotes de e-mail no Node.js. O backend fará apenas uma chamada HTTP POST para a URL do Webhook do Power Automate. A URL oficial já foi gerada e deve ser configurada no backend.

---

## Proposed Changes

### 1. Atualização do Banco de Dados (Prisma)

#### [MODIFY] `backend/prisma/schema.prisma`
Atualizar os modelos para suportar a nova lógica de cadastro e submissão completa:

```prisma
// (Mantenha o Enum Role e a configuração do DataSource iguais a Sprint 0)

model Usuario {
  id                String   @id @default(uuid())
  nome              String
  email             String   @unique
  senha             String
  role              Role     @default(DOCENTE)
  // Novos campos para validação OTP:
  verificado        Boolean  @default(false)
  codigoVerificacao String?
  codigoExpiraEm    DateTime?
  criadoEm          DateTime @default(now())

  // Relacionamento reverso (Um usuário possui várias submissões)
  submissoes        Submissao[]
}

model Edital {
  id          String      @id
  nome        String
  dataInicio  DateTime
  dataFim     DateTime
  status      String
  submissoes  Submissao[]
}

model Submissao {
  id               String   @id @default(uuid())
  titulo           String

  editalId         String
  edital           Edital   @relation(fields: [editalId], references: [id])

  // Ligação com o Docente autenticado
  usuarioId        String
  usuario          Usuario  @relation(fields: [usuarioId], references: [id])

  // Arrays para suportar o novo formulário
  autores          String[]
  unidades         String[]
  segmentos        String[]
  cursos           String[]
  categoria        String
  descricao        String
  ods              Int[]
  marcasFormativas String[]
  termosAceitos    Boolean  @default(false)
  anexos           String[] // URLs do MinIO

  status           String   @default("recebida")
  criadaEm         DateTime @default(now())
}
```

*Ação requerida na IA:* Rodar `npx prisma migrate dev --name sprint1_cadastro_submissao` após as alterações.

---

### 2. Contrato de API (Swagger) e Rotas

#### [MODIFY] `docs/api-contract.yml`
- Adicionar `POST /auth/register/request`: Recebe `nome`, `email`, `senha`.
- Adicionar `POST /auth/register/verify`: Recebe `email` e `codigo`. Retorna o JWT após criar a conta validada.
- Adicionar `POST /upload`: Multipart/form-data para receber imagens.
- Modificar `POST /submissoes`: Atualizar o JSON esperado para refletir os arrays.

#### [NEW/MODIFY] Rotas no Express (`backend/src/`)
- A IA **NÃO** deve instalar `nodemailer`. A IA utilizará o `fetch` ou `axios` interno do Node.
- Adicionar no arquivo `.env` a seguinte variável de ambiente (já contendo a URL final e a chave de assinatura):
  `POWER_AUTOMATE_WEBHOOK_URL="<REDIGIDO — segredo movido para o .env, ver docs/sprint-1-changelog.md §9>"`
  > ⚠️ A URL real do webhook (com a assinatura `sig=`) **não** deve ser versionada. Ela vive apenas no `.env` (gitignored). O valor que constava aqui foi revogado/rotacionado por ter vazado no histórico do git.
- **Rota `register/request`:** Verifica se o e-mail termina com `@rn.senac.br` e gera um código aleatório de 6 dígitos. Salva no banco (como usuário não-verificado). Em seguida, faz um `POST` para `process.env.POWER_AUTOMATE_WEBHOOK_URL` enviando o JSON `{ "nomeDestinatario": "...", "emailDestino": "...", "codigoOtp": "..." }`.
- **Rota `register/verify`:** Recebe o código do front, confere se bate com o do banco e se não expirou. Muda `verificado` para `true` e gera o Token JWT de login.
- **Rota `upload`:** Utiliza o `s3Client` existente e a lib `multer` para upar o arquivo pro MinIO local e devolver a URL formatada (`http://localhost:9000/banco-de-praticas/...`).
- **Rota `submissoes`:** Conecta o `usuarioId` da requisição logada (obtido via JWT) aos dados recebidos e os salva no Postgres.

---

### 3. Frontend: Telas e Validações

#### [NEW] `frontend/src/pages/RegisterPage.tsx`
- Tela dividida em dois passos.
- Passo 1: Nome, Email e Senha. Validação rígida com `zod` (`.endsWith('@rn.senac.br')`).
- Passo 2: Abre após o sucesso do passo 1. Campo para inserir o OTP numérico de 6 dígitos. Após sucesso, loga o usuário automaticamente redirecionando para a Dashboard ou Submissão.

#### [MODIFY] `frontend/src/pages/SubmissionPage.tsx`
- Refatorar completamente o formulário usando `react-hook-form` e `zod`.
- Simular as classes de erro do Bootstrap nas bordas (`border-red-500` e mensagem vermelha em text-sm embaixo do campo inválido).
- Adicionar os Dropdowns de múltipla escolha (ou lista de checkboxes) para Unidades, Segmentos e Cursos.
- Input file múltiplo para "Suba as imagens/evidencias". Assim que os arquivos forem selecionados, iterar chamando a rota de Upload, aguardar o retorno das URLs e salvá-las no estado do form.
- Ao final, submeter o JSON completo idêntico ao modelo atualizado.

---

## Verification Plan

1. **Testar Cadastro:** Criar um e-mail com `@gmail.com` -> Frontend e Backend devem rejeitar a criação da conta.
2. **Testar Envio via Power Automate:** Criar conta com `@rn.senac.br` -> Verificar se a caixa de entrada do e-mail recebe o código OTP via Power Automate (agora com a assinatura de segurança `sig=...` devidamente configurada).
3. **Testar Formulário:** Na rota `/submissao`, deixar campos vazios e observar o feedback visual idêntico ao Bootstrap.
4. **Testar Upload e Relacionamento:** Preencher o formulário, subir imagens. Checar se as URLs aparecem no MinIO e se o Prisma Studio mostra a Submissão perfeitamente atrelada ao usuário logado.
5. **Finalização:** Efetuar o `git commit` com todas as funcionalidades e dar `git push origin feature/sprint-1-auth-submissao`.

---

## Complemento: Esqueci Minha Senha (Forgot Password)

> Recebido como complemento da Sprint 1, após a implementação inicial de cadastro/OTP e submissão.

### Contexto

O fluxo de autenticação até aqui só cobria cadastro (com OTP institucional via Power Automate) e login. Não existia caminho para o docente recuperar o acesso se esquecesse a senha. Esta feature adiciona um botão "Esqueci minha senha" no login, reaproveitando a infraestrutura de OTP que já existe e está validada.

Decisões já validadas com o usuário:
- Resposta da API para "esqueci senha" é sempre genérica (200 mesmo se o e-mail não existir ou não estiver verificado) — evita enumeração de contas.
- Depois de confirmar o código e a nova senha, o usuário é logado automaticamente, sem precisar digitar a senha de novo em `/login`.

### User Review Required / Open Questions

> [!IMPORTANT]
> **Condicional de E-mail no Power Automate:** Para diferenciar se o e-mail a ser disparado é de Boas-vindas/Cadastro ou de Recuperação de Senha, o Backend passará a enviar uma variável "contexto" no JSON do Webhook (valores: "CADASTRO" ou "RECUPERACAO_SENHA").

### Proposed Changes

#### Backend

**backend/src/controllers/authController.ts**
- Alterar o helper `enviarEmailOtp` (que chama o Webhook) para aceitar um quarto parâmetro: `contexto: 'CADASTRO' | 'RECUPERACAO_SENHA'`.
- O payload do fetch para o Power Automate deve ficar: `{ nomeDestinatario: nome, emailDestino: email, codigoOtp: codigo, contexto }`.
- O método `registerRequest` existente deve chamar `enviarEmailOtp(..., 'CADASTRO')`.
- Criar `forgotPasswordRequest` (`POST /auth/forgot-password/request`, body `{ email }`):
  - Normaliza e-mail.
  - Busca o usuário. Se não existir OU `verificado === false`, não retorna erro — apenas não gera código e devolve a resposta genérica.
  - Se existir e estiver verificado: gera novo `codigoOtp`/`codigoExpiraEm`, grava no usuário, e chama `enviarEmailOtp(user.nome, emailLower, codigoOtp, 'RECUPERACAO_SENHA')`.
  - Resposta única: `200 { message: 'Se o e-mail existir, um código de recuperação foi enviado.' }`.
- Criar `forgotPasswordReset` (`POST /auth/forgot-password/reset`, body `{ email, codigo, novaSenha }`):
  - Valida código e expiração.
  - Se válido: hash da `novaSenha` com bcrypt (aplicar a mesma regex de segurança no backend também), atualiza senha, limpa código do banco.
  - Retorna o JWT para login automático.

**backend/src/routes/index.ts**
- Adicionar as rotas (sem `authMiddleware`):
  - `router.post('/auth/forgot-password/request', forgotPasswordRequest);`
  - `router.post('/auth/forgot-password/reset', forgotPasswordReset);`

**docs/api-contract.yml**
- Adicionar os dois novos paths e schemas (`ForgotPasswordRequest` e `ForgotPasswordResetRequest`).

#### Frontend

**Extrair a validação de senha forte para reuso**
- Mover a regex de senha forte de `RegisterPage.tsx` para `frontend/src/schemas/passwordSchema.ts` (`senhaSchema = z.string().min(6).regex(...)`).
- Importar esse novo schema tanto no `RegisterPage` quanto no novo fluxo.

**frontend/src/pages/ForgotPasswordPage.tsx (novo)**
- Estrutura de 2 passos:
  - Passo 1: campo de e-mail (schema com `.email()`). Submete para `POST /auth/forgot-password/request`. Recebendo 200, avança para o passo 2.
  - Passo 2: campos `codigo`, `novaSenha` e `confirmarSenha` (reusando `senhaSchema`). Submete para `POST /auth/forgot-password/reset`. Em caso de sucesso: salva o token e decide o roteamento baseado no mesmo critério do `LoginPage`.
- Usar botões `Eye`/`EyeOff` nos campos de senha.

**frontend/src/pages/LoginPage.tsx**
- Adicionar link "Esqueci minha senha" apontando para `/esqueci-senha`.

**frontend/src/App.tsx**
- Adicionar a rota `<Route path="/esqueci-senha" element={<ForgotPasswordPage />} />`.

### Verification Plan (complemento)

1. **Testar Webhook (Backend):**
   - Disparar `registerRequest` -> Verificar se o Power Automate recebe `contexto: 'CADASTRO'`.
   - Disparar `forgotPasswordRequest` -> Verificar se o Power Automate recebe `contexto: 'RECUPERACAO_SENHA'`.
2. **Teste Negativo (Segurança):**
   - Tentar reset em e-mail inexistente -> Deve retornar 200, banco intacto.
3. **Teste de Reset Completo:**
   - E-mail válido -> Recebe código -> Tenta reset com senha fraca (backend e frontend devem barrar 400).
   - Tenta reset com senha forte -> Retorna 200 + JWT. Login com senha antiga falha, login com nova senha funciona.
4. **Documentação:** O trabalho deve ser registrado como complemento da sprint 1.
