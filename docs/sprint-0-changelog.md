# Sprint 0 — Fundação Conteinerizada e Monorepo

Documentação das mudanças aplicadas a partir do plano [`docs/sprints/sprint_0.md`](sprints/sprint_0.md), na
branch `feature/sprint-0-fundacao` (PR: [EduTech-Labs/banco-praticas-inovadoras#1](https://github.com/EduTech-Labs/banco-praticas-inovadoras/pull/1)).

**Data:** 08/07/2026
**Branch:** `feature/sprint-0-fundacao` → `develop`
**Commit principal:** `feat: setup fundação sprint 0 (monorepo, docker, express)`

---

## Objetivo da sprint

Transformar o repositório (até então só o frontend na raiz) em um **monorepo**,
com a fundação de infraestrutura e backend necessária para as próximas
features do produto (submissão de práticas, autenticação, gestão de editais).

---

## 1. Git Flow

Branches criadas e publicadas nos dois remotes (`origin`, pessoal, e
`edutech`, o repositório da organização EduTech-Labs):

- `develop` — branch de integração, criada a partir da `main`.
- `feature/sprint-0-fundacao` — branch de trabalho desta sprint, criada a
  partir da `develop`.

O trabalho foi integrado via **Pull Request** (`feature/sprint-0-fundacao` →
`develop`) no repositório da organização, em vez de commit direto — permite
revisão do time antes do merge.

---

## 2. Monorepo — reestruturação preservando histórico

Todos os arquivos do frontend foram movidos da raiz para `frontend/` usando
`git mv`, o que preserva o histórico de commits de cada arquivo (verificável
com `git log --follow`).

**Antes:**
```
.
├── src/
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── scripts/
└── README.md
```

**Depois:**
```
.
├── frontend/           # tudo que era a raiz, sem alteração de conteúdo
│   ├── src/
│   ├── public/
│   ├── scripts/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── .env.local.example
│   └── README.md
├── backend/             # novo
├── docs/                # novo
├── docker-compose.yml    # novo
├── .env.example          # novo
└── README.md             # novo, específico do monorepo
```

Também foi movido `node_modules/` (sem `git mv`, por não ser versionado) para
dentro de `frontend/`, para que `npm run dev`/`build` continuem funcionando
sem precisar reinstalar dependências.

### README

- **`README.md` (raiz, novo):** documenta a estrutura do monorepo, como subir
  a infraestrutura Docker, rodar backend e frontend, o fluxo de Git Flow,
  autoria (Felipe Lemos e Victor Fonseca, Senac RN) e a licença CC BY-NC-SA 4.0.
- **`frontend/README.md`:** mantido com toda a documentação específica do
  catálogo de práticas (funcionalidades, tecnologias, dados, LGPD), com uma
  nota no rodapé apontando para o README raiz.

---

## 3. Infraestrutura Docker

**Arquivo novo:** `docker-compose.yml` (raiz), com dois serviços:

| Serviço | Imagem | Portas | Função |
|---|---|---|---|
| `db` | `postgres:16-alpine` | `5432:5432` | Banco de dados relacional |
| `storage` | `minio/minio` | `9000:9000` (API), `9001:9001` (console) | Armazenamento de objetos (S3-compatível) |

Ambos com variáveis de ambiente (usuário/senha) vindas do `.env` e volumes
persistentes nomeados (`db_data`, `storage_data`).

**Arquivos novos:** `.env.example` (versionado) e `.env` (local, ignorado
pelo `.gitignore` — já havia uma regra para `.env` no `.gitignore` existente).

> ✅ **Validado com Docker Desktop instalado:** `docker compose up -d` sobe os
> dois containers (`praticas-inovadoras-db`, `praticas-inovadoras-storage`)
> com sucesso. Confirmado `pg_isready` no Postgres e HTTP 200 na API
> (`:9000/minio/health/live`) e no console (`:9001`) do MinIO. Containers
> parados com `docker compose down` após o teste (não ficam rodando por
> padrão).

---

## 4. Backend — Node.js + Express + TypeScript

**Pasta nova:** `backend/`

- `backend/src/server.ts` — servidor Express na porta `3333` (configurável via
  `PORT`), com CORS habilitado e rota `GET /health` retornando
  `{ "status": "ok" }`.
- `backend/package.json` — scripts `dev` (nodemon + ts-node), `build` (tsc) e
  `start` (roda o build compilado).
- `backend/tsconfig.json` — configurado para CommonJS/Node clássico
  (`module`/`moduleResolution`), compatível com `ts-node`.

**Dependências instaladas:**
- Produção: `express`, `cors`, `dotenv`
- Desenvolvimento: `typescript`, `@types/node`, `@types/express`,
  `@types/cors`, `ts-node`, `nodemon`

### Decisão técnica: versão do TypeScript

O `npm install -D typescript` resolveu inicialmente para a **v7.0.2**, que
**quebra a compatibilidade com `ts-node@10.9.2`** (erro
`Cannot read properties of undefined (reading 'fileExists')`, causado por
mudanças internas na API do compilador). Como o plano pedia explicitamente
`ts-node` + `nodemon`, a correção foi fixar `typescript@^5.7.0` (resolvido
para `5.9.3`) no `backend/package.json`, em vez de trocar o executor de
TypeScript. Testado e funcionando: `npm run dev` sobe o servidor e recarrega
a cada alteração; `npm run build` gera `backend/dist/server.js` sem erros.

---

## 5. Contrato de API (OpenAPI 3.0)

**Arquivo novo:** `docs/api-contract.yml`

Define, de forma **API-first**, as 3 rotas previstas no plano — permitindo
que o frontend use mocks (ex.: MSW) antes de o backend implementá-las de
verdade:

| Rota | Método | Descrição |
|---|---|---|
| `/auth/login` | `POST` | Recebe `email`/`senha`, retorna token JWT e dados do usuário |
| `/submissoes` | `POST` | Recebe os dados do formulário de submissão de uma prática (requer autenticação Bearer) |
| `/editais/ativos` | `GET` | Lista os editais em andamento |

Inclui schemas completos (`LoginRequest`, `LoginResponse`, `SubmissaoRequest`,
`Submissao`, `Edital`, `Error`) e o esquema de segurança `bearerAuth` (JWT).
Validado sintaticamente com `js-yaml`.

---

## 6. Verificação

| Verificação | Resultado |
|---|---|
| `cd frontend && npm run lint` (tsc --noEmit) | ✅ Sem erros |
| `cd backend && npm run build` (tsc) | ✅ Sem erros, gera `backend/dist/server.js` |
| `cd backend && npm run dev` | ✅ Sobe em `:3333`; `GET /health` → `{"status":"ok"}` |
| `cd frontend && npm run dev` | ✅ Sobe sem conflito de porta com o backend |
| Histórico preservado (`git log --follow`) | ✅ Confirmado em `frontend/src/App.tsx` |
| `docker compose up -d` | ✅ `db` e `storage` sobem; Postgres `pg_isready` ok; MinIO API e console HTTP 200 |

---

## 7. Frontend — Roteamento e MSW

Implementação da infraestrutura de roteamento e da fundação para desenvolvimento API-First no frontend:

- **React Router:** Adicionado `react-router-dom` para suportar *Deep Linking* e preservar a intenção do usuário em formulários extensos. Refatoração do `App.tsx` para gerenciar as rotas (`/`, `/login`, `/submissao`) e extração do conteúdo original para `pages/Home.tsx`.
- **MSW (Mock Service Worker):** Configurado para interceptar requisições. O endpoint `POST /auth/login` foi implementado em `src/mocks/handlers.ts` usando o contrato OpenAPI como referência.
- **Telas:** Criação da `LoginPage` (interface de autenticação com validação via MSW) e `SubmissionPage` (stub para a próxima sprint). O botão "Submeta sua prática" agora direciona internamente para o fluxo de autenticação.

## 8. Backend — Banco de Dados e Integração API

Finalização das integrações essenciais para a Sprint 0:

- **Prisma ORM e PostgreSQL:** Integração com o Prisma (`v5`), configuração do schema de acordo com o Swagger e execução da migração inicial (tabelas `Usuario`, `Edital` e `Submissao`).
- **AWS S3 / MinIO:** Criação do arquivo de serviço `storage.ts` configurado para comunicação local com MinIO utilizando `@aws-sdk/client-s3`.
- **Rotas Reais Implementadas:** Substituição do stub inicial pelas 3 rotas requeridas:
  - `POST /auth/login` - Autenticação JWT mockando a criação e retorno de Token.
  - `GET /editais/ativos` - Consulta no PostgreSQL por editais `em_andamento`.
  - `POST /submissoes` - Criação de registros de submissão vinculados a um Edital.

---

## Resumo por arquivo

| Arquivo/pasta | Natureza |
|---|---|
| `frontend/**` | Movido da raiz via `git mv` (sem alteração de conteúdo, exceto o README) |
| `frontend/README.md` | Editado — removidas seções de autoria/licença (agora só no README raiz) |
| `README.md` (raiz) | Novo — documentação do monorepo |
| `docs/sprints/sprint_0.md` | Novo — cópia do plano desta sprint, com a codificação de caracteres corrigida |
| `docs/sprints/README.md` | Novo — convenção de documentação de sprints (prompt vs. changelog) |
| `CLAUDE.md` | Novo — instruções internas para o Claude Code consultar essa convenção |
| `docker-compose.yml` | Novo — serviços `db` (Postgres) e `storage` (MinIO) |
| `.env.example` | Novo — variáveis de ambiente de exemplo |
| `.env` | Novo, local, não versionado (ignorado pelo `.gitignore`) |
| `backend/src/server.ts` | Novo — servidor Express com rota `/health` |
| `backend/package.json` | Novo — scripts `dev`/`build`/`start` |
| `backend/tsconfig.json` | Novo — configuração TypeScript do backend |
| `docs/api-contract.yml` | Novo — contrato OpenAPI 3.0 |
| `frontend/src/pages/**` | Novo — telas da aplicação (Home, LoginPage, SubmissionPage) |
| `frontend/src/mocks/**` | Novo — configuração e handlers do MSW |
| `docs/sprint-0-changelog.md` | Este documento |

---

## Pendências / próximos passos sugeridos

1. ~~Implementar de fato as 3 rotas do contrato de API no backend (hoje só existe `/health`).~~ *(Concluído)*
2. ~~Conectar o backend ao PostgreSQL (ex.: Prisma ou outro ORM) e ao MinIO (SDK S3) — nenhuma dessas integrações foi feita nesta sprint, só a infraestrutura.~~ *(Concluído)*
3. ~~Configurar MSW no frontend usando `docs/api-contract.yml` como referência.~~ *(Concluído)*
4. Revisar e mergear o [PR #1](https://github.com/EduTech-Labs/banco-praticas-inovadoras/pull/1) na `develop`.
