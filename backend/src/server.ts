import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CORS_ORIGINS } from './config';

const app = express();

import routes from './routes';

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite ferramentas sem Origin (curl, health checks) e as origens da allowlist.
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pela política de CORS'));
      }
    },
  })
);

// Limita o tamanho do corpo JSON para reduzir superfície de DoS por payload grande.
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
