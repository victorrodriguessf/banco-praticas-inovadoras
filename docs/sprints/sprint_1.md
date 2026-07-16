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
  `POWER_AUTOMATE_WEBHOOK_URL="<REDIGIDO-webhook-revogado>"`
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
