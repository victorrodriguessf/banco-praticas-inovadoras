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
# Estágio 3 — production: nginx não-root servindo os estáticos
# ============================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

# Configuração que serve a SPA sob /bancodepraticas/ (porta 8080).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# O build é copiado para o subdiretório que espelha o subpath, de modo que
# o `root` do nginx resolva /bancodepraticas/... para os arquivos corretos.
COPY --from=build /app/dist /usr/share/nginx/html/bancodepraticas

# A imagem nginx-unprivileged já roda como uid 101 (usuário nginx, não-root)
# e escuta na porta 8080 por padrão.
EXPOSE 8080
