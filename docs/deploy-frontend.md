# Deploy do frontend — Docker, GHCR e subpath `/bancodepraticas`

Documento das mudanças feitas para **colocar o frontend no ar** (apenas a
landing/main page; o fluxo de submissão ainda não é publicado). Serve como
referência de _o que foi feito_, _por que_ e _o que ainda precisa ser feito
manualmente_ no GitHub e no servidor.

Data: 2026-07-21 · Branch de origem: `feature/sprint-1-auth-submissao`

---

## 1. Objetivo

- Servir o frontend em produção sob o subpath **`exemplo.com/bancodepraticas`**.
- Publicar automaticamente uma imagem Docker no **GHCR** a cada push na `main`,
  para o servidor (Coolify) consumir a tag `:latest`.
- Ainda **não** liberar a submissão de práticas: os botões "Submeta sua
  prática" viram um _mock_ com selo **"Em breve"**.

## 2. Docker

### 2.1 `frontend/Dockerfile` (multistage)

> **Nota:** esta seção descreve o estágio `production` original, baseado em
> nginx. Ele foi substituído por um servidor Node/Express — ver §9.

Três estágios (histórico, ver §9 para o estágio `production` atual):

| Estágio      | Base                                   | Usuário        | Porta | Uso                                   |
|--------------|----------------------------------------|----------------|-------|---------------------------------------|
| `build`      | `node:20-alpine`                       | root (efêmero) | —     | `npm ci` + `npm run build` → `dist/`  |
| `dev`        | `node:20-alpine`                       | `node` (não-root) | 3000  | `npm run dev` (hot-reload local)      |
| `production` | `nginxinc/nginx-unprivileged:1.27-alpine` | uid 101 (não-root) | 8080  | serve os estáticos via nginx          |

- **Não-root** garantido nos dois estágios que rodam (`dev` e `production`).
- O estágio `production` copia o build para
  `/usr/share/nginx/html/bancodepraticas`, de modo que o segmento do subpath
  exista fisicamente e o `root` do nginx resolva os arquivos (evita o clássico
  problema de `alias` + `location` regex).
- O pipeline mira o estágio `production` via `target: production`.

### 2.2 `frontend/nginx.conf` (removido — ver §9)

> Este arquivo não existe mais no repositório. Documentado aqui apenas como
> histórico da configuração original.

- Escuta na porta **8080** (padrão da imagem não-root).
- Serve a app sob `location /bancodepraticas/` com **fallback de SPA**
  (`try_files ... /bancodepraticas/index.html`) — necessário para as rotas do
  react-router funcionarem em refresh/deep-link.
- Redireciona a **raiz `/` → `/bancodepraticas/`** (senão o domínio cru mostra o
  `index.html` padrão "Welcome to nginx" que sobra em `/usr/share/nginx/html`).
- Cache longo e imutável para assets versionados; endpoint `/healthz`.

### 2.3 `frontend/.dockerignore`

Evita copiar `node_modules`, `dist`, `.env*` (segredos) e metadados de Git para
o contexto de build.

### 2.4 `docker-compose.yml` (dev local)

Adicionado o serviço **`banco-de-praticas-frontend`** (`target: dev`, porta 3000)
com hot-reload. O nome é específico (e não apenas `frontend`) para não colidir
com outros serviços/containers no servidor.
Usa um **volume anônimo em `/app/node_modules`** para preservar o `node_modules`
do container (Linux) — sem isso, o `node_modules` do host (macOS) o
sobrescreveria e quebraria os binários nativos do esbuild/Vite.

## 3. Subpath `/bancodepraticas`

Servidor/proxy **mantém** o prefixo `/bancodepraticas` ao encaminhar para o
container (padrão do Traefik/Coolify por prefixo de path). Três ajustes
coordenados:

1. **`vite.config.ts`** — `base: command === 'build' ? '/bancodepraticas/' : '/'`.
   Ou seja: subpath **só no build de produção**; no `dev` local segue na raiz.
2. **`src/App.tsx`** — `basename` do `<BrowserRouter>` derivado de
   `import.meta.env.BASE_URL`. Todos os `<Link>` do react-router se ajustam
   automaticamente.
3. **`src/utils/asset.ts`** (novo) — helper `asset(path)` que prefixa o
   `BASE_URL` em assets estáticos referenciados por caminho absoluto (que **não**
   passam pelo router). Aplicado em:
   - `components/Header.tsx` (logo)
   - `components/EbookSection.tsx` (capas e PDFs)
   - `pages/Home.tsx` (PDF do e-book)
   - `utils/pdfPrint.ts` (PDF da prática)
   - `pages/LoginPage.tsx`, `pages/RegisterPage.tsx`,
     `pages/ForgotPasswordPage.tsx` (padrão de fundo `diagonal_pattern.svg`, via
     `style` inline — ver §8)

   > Sem isso, esses arquivos dariam **404** sob o subpath, pois apontariam para
   > a raiz do domínio.

## 4. Mock da submissão

Os dois botões "Submeta sua prática" (`Header.tsx` desktop e `Home.tsx` menu
mobile) viraram elementos **não-clicáveis**, com aparência desabilitada e selo
**"Em breve"**. As rotas `/login`, `/cadastro`, `/esqueci-senha`, `/submissao` e
`/minhas-submissoes` **permanecem no código** intactas, para uma entrega futura.

## 5. Pipeline — `.github/workflows/publish-ghcr.yml`

Gatilho: **push na `main`** (+ `workflow_dispatch` manual).

Fluxo:
1. `checkout` do código;
2. login no GHCR com o `GITHUB_TOKEN` automático (sem PAT);
3. `docker/metadata-action` gera o nome da imagem **em minúsculas** (exigência do
   Docker/GHCR — importante porque o owner pode ter maiúsculas, ex.:
   `EduTech-Labs`) e as tags `latest` + `sha-<hash>`;
4. `docker/build-push-action` constrói o estágio `production`
   (`context: ./frontend`, `target: production`) e publica no GHCR, com cache de
   camadas via GitHub Actions.

Imagem final: `ghcr.io/<owner>/banco-praticas-inovadoras-frontend:latest`
(sufixo `-frontend` para não colidir com uma futura imagem do backend).

## 6. Passos manuais pendentes (fora do código)

1. **Permissões do Actions**: no repositório →
   _Settings → Actions → General → Workflow permissions_ → marcar
   **Read and write permissions**.
2. **Visibilidade do pacote GHCR**: por padrão a imagem nasce **privada**. Para o
   servidor puxá-la, ou torná-la **pública**, ou configurar no Coolify um login
   no GHCR com um PAT (`read:packages`).
3. **Qual remote é o oficial do deploy**: a imagem fica sob o owner do repositório
   onde a `main` receber o push (`victorrodriguessf` ou `EduTech-Labs`).
4. **Proxy do Coolify**: confirmar que a rota `/bancodepraticas` é encaminhada ao
   container **sem remover** o prefixo, e que o container é exposto na porta
   **3000** (atualizado — era 8080 na versão com nginx; ver §9).

## 7. Verificação realizada

- `npx tsc --noEmit` — sem erros.
- `npm run build` — OK; o `dist/index.html` referencia `/bancodepraticas/assets/...`.
- Smoke test do container **não** executado localmente (Docker Desktop desligado);
  a imagem será construída no CI.

## 8. Correções e pendências

- **`diagonal_pattern.svg`** (corrigido): antes era uma referência absoluta e
  **quebrada** (`bg-[url('/diagonal_pattern.svg')]`, arquivo inexistente) nas
  páginas de auth. Foram feitas duas correções: (1) criado o arquivo em
  `public/diagonal_pattern.svg`; (2) trocada a classe Tailwind — que não respeita
  o `base` do Vite — por um `style` inline com `asset('diagonal_pattern.svg')`,
  passando a funcionar sob o subpath.
- **API fixa em `http://localhost:3333`** (pendente) nas páginas de
  auth/submissão — só relevante quando o backend for publicado; não afeta a
  landing.

## 9. Remoção do nginx — servidor Node/Express

O estágio `production` do `Dockerfile`, que servia os estáticos via
**nginx** (`nginxinc/nginx-unprivileged`, porta 8080), foi substituído por um
**servidor Node/Express** (`frontend/server.js`), eliminando a dependência de
uma camada web server externa. `express` já constava em `dependencies` do
projeto e não era usado.

### 9.1 Por quê

Reduzir o número de tecnologias na imagem de produção (um único runtime
Node, sem nginx) e manter a configuração de servir estáticos em JavaScript,
junto do resto do projeto, em vez de um DSL de config separado
(`nginx.conf`).

### 9.2 Novo fluxo

- **`frontend/server.js`** (novo): servidor Express mínimo que replica o
  comportamento do nginx.conf removido:
  - `express.static` monta o `dist/` sob o prefixo `/bancodepraticas` (os
    arquivos do build já saem prefixados porque `vite.config.ts` usa
    `base: '/bancodepraticas/'`; não há necessidade de replicar a estrutura
    de pastas que o nginx usava — `dist/` fica na raiz da imagem).
  - `/` → redirect 301 para `/bancodepraticas/`.
  - `/bancodepraticas` (sem barra) → redirect 301 para `/bancodepraticas/`.
  - Fallback de SPA: qualquer rota sob `/bancodepraticas/*` que não bata em
    um arquivo estático cai no `index.html` (equivalente ao
    `try_files ... /bancodepraticas/index.html` do nginx).
  - `GET /healthz` → `200 "ok"` em texto plano (paridade com o healthcheck
    anterior).
  - Cache longo e imutável (`Cache-Control: public, max-age=31536000,
    immutable`) para assets com hash no nome (js/css/fontes/imagens).
  - Escuta em `process.env.PORT || 3000` e `0.0.0.0`.
- **`frontend/package.json`**: novo script `"start": "node server.js"`.
- **`frontend/Dockerfile`** — estágio `production` reescrito: base
  `node:20-alpine`, copia `dist/`, `package*.json` e `server.js` do estágio
  `build`, roda `npm ci --omit=dev`, usuário não-root **`node`** (paridade de
  segurança com o `nginx-unprivileged` anterior), `EXPOSE 3000`,
  `CMD ["npm", "start"]`. Os estágios `build` e `dev` **não foram alterados**.
- **`frontend/nginx.conf`**: removido do repositório (`git rm`).
- **`.github/workflows/publish-ghcr.yml`**: sem mudanças funcionais — o
  workflow builda `target: production`, que continua existindo com o mesmo
  nome; só um comentário desatualizado (mencionava nginx) foi corrigido.

### 9.3 Impacto na porta exposta pelo container

A porta do container **mudou de 8080 para 3000**. Isso exige ajuste manual
no Coolify: atualizar a porta configurada em "Ports Exposes" (ou equivalente)
de `8080` para **`3000`**, e fazer Redeploy. Sem esse ajuste, o Traefik volta
a apontar para a porta errada e o site retorna 502 novamente (mesmo sintoma
documentado em §6 antes da correção original de porta).

### 9.4 Verificação realizada

- `npm run build` — gera `dist/` com assets prefixados por `/bancodepraticas/`.
- `node server.js` local após o build, testado manualmente (via `curl`) em:
  `/` (301), `/bancodepraticas` (301), `/bancodepraticas/` (200, index.html),
  uma rota profunda do react-router (200, cai no index.html), um asset
  estático com `Cache-Control` de cache longo, e `/healthz` (200 "ok").
- Durante esse teste foi encontrado e corrigido um bug: por padrão o Express
  ignora a barra final ao casar rotas, então a rota de redirect de
  `/bancodepraticas` também interceptava `/bancodepraticas/` (que deveria
  servir o `index.html`). Corrigido com `app.set('strict routing', true)`
  (não afeta o `express.static`, que usa `app.use` e continua casando por
  prefixo normalmente).
- `docker build --target production` e `docker run` **não foram executados**
  nesta verificação — Docker Desktop indisponível no ambiente usado. Rodar
  manualmente antes do deploy:
  ```
  docker build --target production -t banco-praticas-frontend:test ./frontend
  docker run --rm -p 3000:3000 banco-praticas-frontend:test
  ```
  e repetir os mesmos testes de path acima contra `localhost:3000`.
