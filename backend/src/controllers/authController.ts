import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../config';

const EMAIL_DOMINIO_INSTITUCIONAL = '@rn.senac.br';
const OTP_VALIDADE_MINUTOS = 10;

const gerarCodigoOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const enviarEmailOtp = async (nomeDestinatario: string, emailDestino: string, codigoOtp: string): Promise<void> => {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('POWER_AUTOMATE_WEBHOOK_URL não configurada — OTP não enviado por e-mail.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeDestinatario, emailDestino, codigoOtp }),
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
      { expiresIn: '1d' }
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

export const registerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      return;
    }

    const emailLower = email.toLowerCase().trim();

    if (!emailLower.endsWith(EMAIL_DOMINIO_INSTITUCIONAL)) {
      res.status(400).json({ message: `Utilize um e-mail institucional (${EMAIL_DOMINIO_INSTITUCIONAL})` });
      return;
    }

    const existente = await prisma.usuario.findUnique({ where: { email: emailLower } });
    if (existente?.verificado) {
      res.status(400).json({ message: 'Já existe uma conta verificada com este e-mail' });
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

    await enviarEmailOtp(nome, emailLower, codigoOtp);

    res.status(201).json({ message: 'Código de verificação enviado para o e-mail institucional' });
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
      { expiresIn: '1d' }
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
