import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const BASE_PATH = '/bancodepraticas';
const PORT = process.env.PORT || 3000;

// Assets com hash no nome (gerados pelo Vite) recebem cache longo e imutável.
const LONG_CACHE_EXTENSIONS = /\.(?:js|css|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|ico)$/i;

const app = express();

// strict routing: sem isso, o Express trata "/bancodepraticas" e
// "/bancodepraticas/" como a mesma rota, e o redirect abaixo interceptaria
// também a versão com barra (que deve, em vez disso, servir o index.html).
app.set('strict routing', true);

app.get('/healthz', (_req, res) => {
  res.type('text/plain').status(200).send('ok');
});

// Raiz -> app. Evita servir um 404 cru quando o domínio é aberto sem o path.
app.get('/', (_req, res) => {
  res.redirect(301, `${BASE_PATH}/`);
});

// /bancodepraticas (sem barra) -> /bancodepraticas/
app.get(BASE_PATH, (_req, res) => {
  res.redirect(301, `${BASE_PATH}/`);
});

app.use(
  BASE_PATH,
  express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (LONG_CACHE_EXTENSIONS.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback de SPA: qualquer rota sob /bancodepraticas/* que não bata em um
// arquivo estático cai no index.html, para as rotas do react-router
// funcionarem em refresh/deep-link.
app.get(`${BASE_PATH}/*`, (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server ouvindo na porta ${PORT}`);
});
