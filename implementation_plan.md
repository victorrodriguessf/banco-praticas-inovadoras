# Sprint 0: Fundação Conteinerizada e Monorepo

Este documento contém o plano de execução detalhado da Sprint 0. **Contexto de execução:** Este plano foi desenhado para ser lido e executado por um assistente de IA (como o Claude Code) ou por um desenvolvedor em um ambiente onde o projeto **já é um repositório Git** (atualmente apenas com a branch `main` contendo os arquivos do frontend na raiz). O backend será construído com Node.js e **Express.js**.

---

## 1. Configuração do Git Flow

O repositório já existe e está na branch `main`. O primeiro passo é adequar as branches ao fluxo de trabalho definido.

**Comandos esperados:**
1. Garantir que a `main` está atualizada:
   `git checkout main && git pull origin main`
2. Criar e enviar a branch de integração `develop`:
   `git checkout -b develop && git push -u origin develop`
3. Criar a branch de trabalho para esta sprint:
   `git checkout -b feature/sprint-0-fundacao`

---

## 2. Reestruturação do Monorepo (Preservando Histórico)

Como os arquivos atuais do frontend (React/Vite) estão na raiz e já estão versionados, é **obrigatório usar `git mv`** para movê-los para a nova pasta `frontend/`. Isso garantirá que o histórico de commits do React não seja perdido.

**Passos:**
1. Criar o diretório: `mkdir frontend`
2. Usar `git mv` para mover todos os arquivos e pastas relacionados ao Vite/React para dentro de `frontend/`. Exemplo de arquivos a mover:
   - `src/`
   - `public/`
   - `package.json`
   - `package-lock.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `index.html`
   - `README.md` (Pode ser movido e um novo README criado na raiz para o monorepo)
   *(Nota para a IA que for executar: Liste os arquivos no diretório e mova cuidadosamente o que for do frontend, ignorando a pasta `.git` e arquivos ocultos globais desnecessários).*
3. Na raiz do projeto, criar um `.gitignore` global que ignore `node_modules`, `.env`, e pastas de build.

---

## 3. Infraestrutura Docker (PostgreSQL e MinIO)

Criação dos serviços de apoio para o backend.

1. Na raiz do projeto, criar o arquivo `docker-compose.yml` contendo:
   - Serviço **db**: Usando a imagem `postgres:16-alpine`. Configurar os atributos `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` usando variáveis de ambiente. Expor a porta `5432:5432`. Mapear volume persistente.
   - Serviço **storage**: Usando a imagem `minio/minio`. Expor as portas `9000:9000` (API) e `9001:9001` (Console). Configurar variáveis `MINIO_ROOT_USER` e `MINIO_ROOT_PASSWORD`. Definir o comando de entrada como `server /data --console-address ":9001"`. Mapear volume persistente.
2. Na raiz do projeto, criar o arquivo `.env.example` e `.env` com as seguintes variáveis de exemplo:
   ```env
   # Database (PostgreSQL)
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=admin
   POSTGRES_DB=praticas_inovadoras

   # Storage (MinIO)
   MINIO_ROOT_USER=admin
   MINIO_ROOT_PASSWORD=admin123
   ```

---

## 4. Setup do Backend (Node.js + Express)

Criar a estrutura base da API para que o frontend tenha onde se conectar.

1. Na raiz do projeto, criar a pasta `backend/`.
2. Dentro de `backend/`, inicializar um projeto Node: `npm init -y`
3. Instalar dependências principais: `npm install express cors dotenv`
4. Instalar dependências de desenvolvimento: `npm install -D typescript @types/node @types/express @types/cors ts-node nodemon`
5. Inicializar o TypeScript: `npx tsc --init`
6. Criar a estrutura básica de pastas e arquivos:
   - `backend/src/server.ts`: Servidor Express básico na porta 3333, com CORS habilitado e rota `/health` para verificação.
   - Atualizar o `package.json` do backend adicionando scripts de `"dev": "nodemon src/server.ts"` e `"build": "tsc"`.

---

## 5. Contrato de API (API-First com Swagger)

Definir os contratos que o frontend vai usar no MSW.

1. Na raiz do projeto, criar a pasta `docs/`.
2. Criar o arquivo `docs/api-contract.yml` com uma especificação OpenAPI 3.0 para as seguintes rotas:
   - `POST /auth/login`: Recebe email/senha, retorna token JWT.
   - `POST /submissoes`: Recebe dados do formulário da prática.
   - `GET /editais/ativos`: Retorna uma lista de editais em andamento.

---

## Verification Plan e Finalização

Após o Claude Code (ou o desenvolvedor) executar todos os passos acima:
1. Subir a infra com `docker-compose up -d`.
2. Rodar o backend: `cd backend && npm run dev`.
3. Rodar o frontend: `cd frontend && npm run dev`.
4. Tudo rodando sem conflitos de portas? Fazer os commits com `git add .` e `git commit -m "feat: setup fundação sprint 0 (monorepo, docker, express)"`.
5. Fazer o push da branch `feature/sprint-0-fundacao` e abrir um Pull Request para a `develop`.
