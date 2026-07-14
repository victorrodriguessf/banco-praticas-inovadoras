import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string;
      usuarioRole?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não informado' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.usuarioId = payload.id;
    req.usuarioRole = payload.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};
