# syntax=docker/dockerfile:1

# ============================================================
# Estágio 1 — build: instala dependências e gera o dist/
# ============================================================
FROM node:20-alpine AS build
WORKDIR /app

# Copia só os manifests primeiro para aproveitar o cache de camadas:
# o npm ci só re-executa quando package*.json mudam.
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera o build de produção.
# O vite.config.ts define base=/bancodepraticas/ quando command === 'build'.
COPY . .
RUN npm run build

# ============================================================
# Estágio 2 — dev: servidor de desenvolvimento do Vite
# Usado localmente (ex.: docker compose com target: dev).
# Roda como usuário não-root "node" (já existe na imagem oficial).
# ============================================================
FROM node:20-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development

# Instala as dependências já como usuário não-root, para que o cache do
# Vite (node_modules/.vite) seja gravável em tempo de execução.
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm ci
COPY --chown=node:node . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ============================================================
# Estágio 3 — production: servidor Node/Express servindo os estáticos
# ============================================================
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/server.js ./

RUN npm ci --omit=dev

# Roda como usuário não-root "node" (já existe na imagem oficial), mantendo
# a mesma postura de segurança do estágio nginx-unprivileged anterior.
USER node

EXPOSE 3000
CMD ["npm", "start"]
