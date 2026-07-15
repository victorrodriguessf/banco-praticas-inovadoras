import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const createSubmissao = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    const {
      titulo,
      editalId,
      autores,
      unidades,
      segmentos,
      cursos,
      categoria,
      descricao,
      ods,
      marcasFormativas,
      termosAceitos,
      anexos,
    } = req.body;

    if (
      !titulo ||
      !editalId ||
      !categoria ||
      !descricao ||
      !Array.isArray(autores) ||
      autores.length === 0 ||
      !Array.isArray(unidades) ||
      unidades.length === 0 ||
      !Array.isArray(segmentos) ||
      segmentos.length === 0 ||
      !termosAceitos
    ) {
      res.status(400).json({ message: 'Faltam campos obrigatórios' });
      return;
    }

    const submissao = await prisma.submissao.create({
      data: {
        titulo,
        editalId,
        usuarioId,
        autores,
        unidades,
        segmentos,
        cursos: cursos || [],
        categoria,
        descricao,
        ods: ods || [],
        marcasFormativas: marcasFormativas || [],
        termosAceitos,
        anexos: anexos || [],
      },
    });

    res.status(201).json(submissao);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar submissão' });
  }
};

export const getMinhasSubmissoes = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      res.status(401).json({ message: 'Não autenticado' });
      return;
    }

    const submissoes = await prisma.submissao.findMany({
      where: { usuarioId },
      orderBy: { criadaEm: 'desc' },
      select: {
        id: true,
        titulo: true,
        status: true,
        criadaEm: true
      }
    });

    res.json(submissoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar submissões' });
  }
};
