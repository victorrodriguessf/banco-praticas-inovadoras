import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const getEditaisAtivos = async (req: Request, res: Response): Promise<void> => {
  try {
    const editais = await prisma.edital.findMany({
      where: {
        status: 'em_andamento'
      }
    });

    res.json(editais);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar editais' });
  }
};
