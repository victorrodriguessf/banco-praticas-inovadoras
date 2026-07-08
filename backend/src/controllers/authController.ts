import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      res.status(400).json({ message: 'Email e senha são obrigatórios' });
      return;
    }

    // Procura o usuário, se não existir e for o mock, a gente cria.
    let user = await prisma.usuario.findUnique({ where: { email } });

    if (!user) {
      if (email === 'docente@senac.br' && senha === 'minhaSenha123') {
        const hashed = await bcrypt.hash(senha, 10);
        user = await prisma.usuario.create({
          data: {
            nome: 'Docente Senac',
            email: email,
            senha: hashed,
            role: 'DOCENTE'
          }
        });
      } else {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
      }
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
