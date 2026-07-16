import rateLimit from 'express-rate-limit';

const mensagem = { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };

// Limitador geral para rotas sensíveis de autenticação (login, verify, reset).
// Protege contra força bruta de senha e de código OTP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensagem,
});

// Limitador mais estrito para os endpoints que disparam e-mail (webhook do Power Automate),
// evitando abuso de envio / custo.
export const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: mensagem,
});
