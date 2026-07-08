# Banco de Práticas Educação Inovadora — Senac RN

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Monorepo do projeto **Banco de Práticas Educação Inovadora**, catálogo interativo das melhores práticas educacionais desenvolvidas pelos docentes do Senac Rio Grande do Norte.

Este repositório reúne o **frontend** (aplicação já publicada) e, a partir da Sprint 0, a **infraestrutura e o backend** que sustentarão as próximas features (submissão de práticas, autenticação, editais).

---

## Estrutura do monorepo

```
.
├── frontend/          # Aplicação React + Vite (catálogo de práticas) — já em produção
├── backend/           # API Node.js + Express + TypeScript (em construção)
├── docs/
│   ├── sprints/           # Prompt/plano original de cada sprint (sprint_0.md, sprint_1.md, ...)
│   ├── sprint-0-changelog.md # O que foi de fato implementado em cada sprint
│   └── api-contract.yml      # Contrato de API (OpenAPI 3.0)
├── docker-compose.yml # Infraestrutura local: PostgreSQL + MinIO
├── .env.example       # Modelo de variáveis de ambiente
└── CLAUDE.md          # Instruções internas para o Claude Code
```

Cada pacote (`frontend/`, `backend/`) tem seu próprio `package.json`, dependências e scripts — não há workspaces compartilhados nesta etapa.

---

## Como rodar o projeto localmente

**Pré-requisitos:** Node.js 18+, Docker e Docker Compose.

### 1. Subir a infraestrutura (PostgreSQL + MinIO)

```bash
cp .env.example .env   # ajuste as variáveis se necessário
docker-compose up -d
```

- PostgreSQL disponível em `localhost:5432`
- MinIO (API) em `localhost:9000` e console em `localhost:9001`

### 2. Rodar o backend

```bash
cd backend
npm install
npm run dev   # http://localhost:3333 — checar em /health
```

### 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

Frontend e backend rodam em portas diferentes (3000 e 3333) e não conflitam entre si nem com a infraestrutura Docker (5432, 9000, 9001).

---

## Frontend

A documentação completa do catálogo de práticas (funcionalidades, tecnologias, dados, LGPD) está em [`frontend/README.md`](frontend/README.md).

## Backend

API em Node.js + Express + TypeScript. Ainda em construção (Sprint 0 criou apenas a fundação: servidor Express com rota `/health`). O contrato das rotas planejadas está documentado em [`docs/api-contract.yml`](docs/api-contract.yml) (OpenAPI 3.0).

## Infraestrutura

- **PostgreSQL 16** — banco de dados relacional da aplicação.
- **MinIO** — armazenamento de objetos compatível com S3, para arquivos enviados nas submissões de práticas.

Ambos definidos em [`docker-compose.yml`](docker-compose.yml), com credenciais configuráveis via `.env`.

---

## Fluxo de trabalho (Git Flow)

- `main` — produção / estável.
- `develop` — branch de integração.
- `feature/*` — branches de trabalho, abertas a partir de `develop` e integradas via Pull Request.

---

## Autoria

- **Felipe Lemos** - Assistente I - Suporte On-line
- **Victor Fonseca** - Estagiário

Senac - RN

---

## Licença

**CC BY-NC-SA 4.0**

Este projeto está licenciado sob a licença Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0).

- **Compartilhar e Adaptar**: Você tem a liberdade de baixar, alterar e construir a partir desta obra.
- **Uso Não-Comercial**: O uso do software para fins comerciais é estritamente proibido.
- **Mesma Licença**: Modificações e obras derivadas devem ser distribuídas sob esta exata licença.
