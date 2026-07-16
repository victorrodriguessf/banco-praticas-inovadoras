import { z } from 'zod';

export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres')
  .regex(
    /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/,
    'A senha deve conter letras e ao menos um número ou caractere especial'
  );

export const codigoSchema = z.object({
  codigo: z
    .string()
    .length(6, 'O código tem 6 dígitos')
    .regex(/^\d{6}$/, 'O código deve conter apenas números'),
});

export type ForcaSenha = 0 | 1 | 2 | 3;

export function calcularForcaSenha(senha: string): ForcaSenha {
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /[0-9]/.test(senha);
  const temEspecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);
  const temMaiuscula = /[A-Z]/.test(senha);
  const temMinuscula = /[a-z]/.test(senha);

  // Ainda não atende ao mínimo exigido pelo senhaSchema.
  if (senha.length < 8 || !temLetra || (!temNumero && !temEspecial)) return 0;

  let pontos = 1;
  if (senha.length >= 10) pontos++;
  if (temMaiuscula && temMinuscula) pontos++;
  if (temNumero && temEspecial) pontos++;
  if (senha.length >= 14) pontos++;

  return Math.min(pontos, 3) as ForcaSenha;
}
