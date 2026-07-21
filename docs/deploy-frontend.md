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

Três estágios:

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

### 2.2 `frontend/nginx.conf`

- Escuta na porta **8080** (padrão da imagem não-root).
- Serve a app sob `location /bancodepraticas/` com **fallback de SPA**
  (`try_files ... /bancodepraticas/index.html`) — necessário para as rotas do
  react-router funcionarem em refresh/deep-link.
- Cache longo e imutável para assets versionados; endpoint `/healthz`.

### 2.3 `frontend/.dockerignore`

Evita copiar `node_modules`, `dist`, `.env*` (segredos) e metadados de Git para
o contexto de build.

### 2.4 `docker-compose.yml` (dev local)

Adicionado o serviço **`frontend`** (`target: dev`, porta 3000) com hot-reload.
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
   **8080**.

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
