import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

const MAX_ITENS_ARRAY = 50;
const MAX_LEN_TITULO = 300;
const MAX_LEN_CATEGORIA = 100;
const MAX_LEN_DESCRICAO = 10000;
const MAX_LEN_ITEM = 500;

const arrayStringValido = (valor: unknown, obrigatorio: boolean): valor is string[] => {
  if (!Array.isArray(valor)) return !obrigatorio && valor === undefined;
  if (obrigatorio && valor.length === 0) return false;
  if (valor.length > MAX_ITENS_ARRAY) return false;
  return valor.every((item) => typeof item === 'string' && item.length <= MAX_LEN_ITEM);
};

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
      typeof titulo !== 'string' || titulo.trim() === '' || titulo.length > MAX_LEN_TITULO ||
      typeof editalId !== 'string' || editalId.trim() === '' ||
      typeof categoria !== 'string' || categoria.trim() === '' || categoria.length > MAX_LEN_CATEGORIA ||
      typeof descricao !== 'string' || descricao.trim() === '' || descricao.length > MAX_LEN_DESCRICAO ||
      !arrayStringValido(autores, true) ||
      !arrayStringValido(unidades, true) ||
      !arrayStringValido(segmentos, true) ||
      !arrayStringValido(cursos, false) ||
      !arrayStringValido(marcasFormativas, false) ||
      !arrayStringValido(anexos, false) ||
      (ods !== undefined && (!Array.isArray(ods) || ods.length > MAX_ITENS_ARRAY || !ods.every((n) => Number.isInteger(n) && n >= 1 && n <= 17))) ||
      termosAceitos !== true
    ) {
      res.status(400).json({ message: 'Dados inválidos ou campos obrigatórios ausentes' });
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
