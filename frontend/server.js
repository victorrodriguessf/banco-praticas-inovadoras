import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Assets com hash no nome (gerados pelo Vite) recebem cache longo e imutável.
const LONG_CACHE_EXTENSIONS = /\.(?:js|css|woff2?|ttf|otf|eot|svg|png|jpe?g|gif|webp|ico)$/i;

const app = express();

app.get('/healthz', (_req, res) => {
  res.type('text/plain').status(200).send('ok');
});

// O proxy do Coolify (Traefik/Caddy) remove o prefixo /bancodepraticas antes
// de encaminhar a requisição para este container (stripprefix/handle_path).
// Ou seja: por aqui, tudo chega como se este servidor estivesse na raiz — o
// prefixo só existe entre o navegador e o proxy. Por isso os estáticos e o
// fallback de SPA são servidos a partir de "/", e não de "/bancodepraticas".
// (O build continua gerado com base: '/bancodepraticas/' no vite.config.ts,
// pois é isso que o navegador precisa ver nas URLs para o proxy rotear.)
app.use(
  express.static(DIST_DIR, {
    setHeaders: (res, filePath) => {
      if (LONG_CACHE_EXTENSIONS.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  })
);

// Fallback de SPA: qualquer rota que não bata em um arquivo estático cai no
// index.html, para as rotas do react-router funcionarem em refresh/deep-link.
app.get('*', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server ouvindo na porta ${PORT}`);
});
