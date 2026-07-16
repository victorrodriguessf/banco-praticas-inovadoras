import type { SignOptions } from 'jsonwebtoken';

function requireEnv(nome: string): string {
  const valor = process.env[nome];
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${nome}. Configure-a no .env antes de iniciar o servidor.`
    );
  }
  return valor;
}

// Segredo do JWT: obrigatório e sem valor padrão fraco. O servidor não sobe sem ele.
export const JWT_SECRET = requireEnv('JWT_SECRET');

// Validade do token de acesso (configurável). Padrão conservador.
export const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '8h';

// Origens permitidas para CORS (lista separada por vírgula). Sem curinga em produção.
export const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
