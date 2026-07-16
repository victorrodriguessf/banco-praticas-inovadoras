import { Request, Response } from 'express';
import { randomInt } from 'crypto';
import { prisma } from '../prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

const EMAIL_DOMINIO_INSTITUCIONAL = '@rn.senac.br';
const OTP_VALIDADE_MINUTOS = 10;
const SENHA_MIN_LENGTH = 8;
const SENHA_FORTE_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/;

// Código OTP com gerador criptograficamente seguro (não Math.random).
const gerarCodigoOtp = (): string => randomInt(100000, 1000000).toString();

const senhaAtendeRequisitos = (senha: unknown): senha is string =>
  typeof senha === 'string' && senha.length >= SENHA_MIN_LENGTH && SENHA_FORTE_REGEX.test(senha);

type ContextoEmailOtp = 'CADASTRO' | 'RECUPERACAO_SENHA';

const enviarEmailOtp = async (
  nomeDestinatario: string,
  emailDestino: string,
  codigoOtp: string,
  contexto: ContextoEmailOtp
): Promise<void> => {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('POWER_AUTOMATE_WEBHOOK_URL não configurada — OTP não enviado por e-mail.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeDestinatario, emailDestino, codigoOtp, contexto }),
    });
  } catch (error) {
    console.error('Falha ao chamar o webhook do Power Automate:', error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    let user = await prisma.usuario.findUnique({ where: { email: emailLower } });

    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    const isValidPassword = await bcrypt.compare(senha, user.senha);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Mensagem única para o fluxo de cadastro, para não revelar se um e-mail já tem conta.
const MENSAGEM_GENERICA_CADASTRO = 'Se os dados estiverem corretos, um código de verificação foi enviado para o e-mail institucional.';

export const registerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      return;
    }

    if (!senhaAtendeRequisitos(senha)) {
      res.status(400).json({
        message: `A senha deve ter ao menos ${SENHA_MIN_LENGTH} caracteres e conter letras e ao menos um número ou caractere especial`,
      });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    if (!emailLower.endsWith(EMAIL_DOMINIO_INSTITUCIONAL)) {
      res.status(400).json({ message: `Utilize um e-mail institucional (${EMAIL_DOMINIO_INSTITUCIONAL})` });
      return;
    }

    const existente = await prisma.usuario.findUnique({ where: { email: emailLower } });

    // Conta já verificada: não recria nem reenvia, mas responde igual ao caso de sucesso
    // para não permitir enumeração de contas existentes.
    if (existente?.verificado) {
      res.status(201).json({ message: MENSAGEM_GENERICA_CADASTRO });
      return;
    }

    const codigoOtp = gerarCodigoOtp();
    const codigoExpiraEm = new Date(Date.now() + OTP_VALIDADE_MINUTOS * 60 * 1000);
    const senhaHash = await bcrypt.hash(senha, 10);

    if (existente) {
      await prisma.usuario.update({
        where: { email: emailLower },
        data: { nome, senha: senhaHash, codigoVerificacao: codigoOtp, codigoExpiraEm },
      });
    } else {
      await prisma.usuario.create({
        data: {
          nome,
          email: emailLower,
          senha: senhaHash,
          verificado: false,
          codigoVerificacao: codigoOtp,
          codigoExpiraEm,
        },
      });
    }

    await enviarEmailOtp(nome, emailLower, codigoOtp, 'CADASTRO');

    res.status(201).json({ message: MENSAGEM_GENERICA_CADASTRO });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao solicitar cadastro' });
  }
};

export const registerVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      res.status(400).json({ message: 'Email e código são obrigatórios' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.usuario.findUnique({ where: { email: emailLower } });

    if (!user || !user.codigoVerificacao || !user.codigoExpiraEm) {
      res.status(400).json({ message: 'Nenhuma verificação pendente para este e-mail' });
      return;
    }

    if (user.codigoVerificacao !== codigo) {
      res.status(400).json({ message: 'Código de verificação inválido' });
      return;
    }

    if (user.codigoExpiraEm.getTime() < Date.now()) {
      res.status(400).json({ message: 'Código de verificação expirado' });
      return;
    }

    const userVerificado = await prisma.usuario.update({
      where: { email: emailLower },
      data: { verificado: true, codigoVerificacao: null, codigoExpiraEm: null },
    });

    const token = jwt.sign(
      { id: userVerificado.id, role: userVerificado.role, email: userVerificado.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: userVerificado.id,
        nome: userVerificado.nome,
        email: userVerificado.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao verificar código' });
  }
};

const MENSAGEM_GENERICA_ESQUECI_SENHA = 'Se o e-mail existir, um código de recuperação foi enviado.';

export const forgotPasswordRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email é obrigatório' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.usuario.findUnique({ where: { email: emailLower } });

    if (user?.verificado) {
      const codigoOtp = gerarCodigoOtp();
      const codigoExpiraEm = new Date(Date.now() + OTP_VALIDADE_MINUTOS * 60 * 1000);

      await prisma.usuario.update({
        where: { email: emailLower },
        data: { codigoVerificacao: codigoOtp, codigoExpiraEm },
      });

      await enviarEmailOtp(user.nome, emailLower, codigoOtp, 'RECUPERACAO_SENHA');
    }

    // Resposta sempre genérica, exista o usuário ou não, para não permitir enumeração de contas.
    res.status(200).json({ message: MENSAGEM_GENERICA_ESQUECI_SENHA });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao solicitar recuperação de senha' });
  }
};

export const forgotPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, codigo, novaSenha } = req.body;

    if (!email || !codigo || !novaSenha) {
      res.status(400).json({ message: 'Email, código e nova senha são obrigatórios' });
      return;
    }

    if (!senhaAtendeRequisitos(novaSenha)) {
      res.status(400).json({
        message: `A senha deve ter ao menos ${SENHA_MIN_LENGTH} caracteres e conter letras e ao menos um número ou caractere especial`,
      });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const user = await prisma.usuario.findUnique({ where: { email: emailLower } });

    if (!user || !user.codigoVerificacao || !user.codigoExpiraEm) {
      res.status(400).json({ message: 'Nenhuma recuperação de senha pendente para este e-mail' });
      return;
    }

    if (user.codigoVerificacao !== codigo) {
      res.status(400).json({ message: 'Código de verificação inválido' });
      return;
    }

    if (user.codigoExpiraEm.getTime() < Date.now()) {
      res.status(400).json({ message: 'Código de verificação expirado' });
      return;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    const userAtualizado = await prisma.usuario.update({
      where: { email: emailLower },
      data: { senha: senhaHash, codigoVerificacao: null, codigoExpiraEm: null },
    });

    const token = jwt.sign(
      { id: userAtualizado.id, role: userAtualizado.role, email: userAtualizado.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: userAtualizado.id,
        nome: userAtualizado.nome,
        email: userAtualizado.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao redefinir senha' });
  }
};
