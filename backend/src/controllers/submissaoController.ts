import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const createSubmissao = async (req: Request, res: Response): Promise<void> => {
  try {
    const { titulo, editalId, instrutor, segmento, unidade, descricao, ods, marcasFormativas } = req.body;

    // A validação completa deve ser feita aqui (omitida para brevidade no stub).
    if (!titulo || !editalId || !instrutor || !segmento || !descricao) {
      res.status(400).json({ message: 'Faltam campos obrigatórios' });
      return;
    }

    const submissao = await prisma.submissao.create({
      data: {
        titulo,
        editalId,
        instrutor,
        segmento,
        unidade,
        descricao,
        ods: ods || [],
        marcasFormativas: marcasFormativas || []
      }
    });

    res.status(201).json(submissao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar submissão' });
  }
};
