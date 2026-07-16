import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { prisma } from '../prismaClient';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
      usuarioRole?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };

    // Revalida o usuário no banco: um token de conta removida deixa de valer,
    // e o papel (role) vem sempre do banco, nunca do conteúdo do token.
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, verificado: true },
    });

    if (!usuario || !usuario.verificado) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    req.usuarioId = usuario.id;
    req.usuarioRole = usuario.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
