import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

const MAX_ITENS_ARRAY = 50;
const MAX_LEN_TITULO = 300;
const MAX_LEN_CATEGORIA = 100;
const MAX_LEN_DESCRICAO = 10000;
const MAX_LEN_ITEM = 500;
const MAX_ANEXOS = 3;

const arrayStringValido = (
  valor: unknown,
  obrigatorio: boolean,
  maxItens: number = MAX_ITENS_ARRAY
): valor is string[] => {
  if (!Array.isArray(valor)) return !obrigatorio && valor === undefined;
  if (obrigatorio && valor.length === 0) return false;
  if (valor.length > maxItens) return false;
  return valor.every((item) => typeof item === 'string' && item.length <= MAX_LEN_ITEM);
};

// Ids válidos por critério do Quadro 2 do edital — ver
// frontend/src/data/autoavaliacaoOptions.ts (mesma fonte de verdade).
const IDS_APRENDIZAGEM_INTEGRADORA = ['areas-conhecimento', 'cursos'];
const IDS_PROTAGONISMO_ESTUDANTE = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const IDS_AUTONOMIA_DIGITAL = ['a', 'b', 'c', 'd'];
const IDS_COLABORACAO_COMUNICACAO = ['a', 'b'];
const IDS_PRATICA_INCLUSIVA = ['a', 'b'];

const arrayDeIdsValido = (valor: unknown, idsPermitidos: string[]): boolean =>
  Array.isArray(valor) && valor.every((item) => typeof item === 'string' && idsPermitidos.includes(item));

const autoavaliacaoValida = (valor: unknown): boolean => {
  if (typeof valor !== 'object' || valor === null) return false;
  const a = valor as Record<string, unknown>;

  return (
    (a.contextualizacaoRealidade === 0 || a.contextualizacaoRealidade === 1.5 || a.contextualizacaoRealidade === 3) &&
    arrayDeIdsValido(a.aprendizagemIntegradora, IDS_APRENDIZAGEM_INTEGRADORA) &&
    arrayDeIdsValido(a.protagonismoEstudante, IDS_PROTAGONISMO_ESTUDANTE) &&
    typeof a.visaoCritica === 'boolean' &&
    arrayDeIdsValido(a.autonomiaDigital, IDS_AUTONOMIA_DIGITAL) &&
    arrayDeIdsValido(a.colaboracaoComunicacao, IDS_COLABORACAO_COMUNICACAO) &&
    typeof a.criatividadeEmpreendedora === 'boolean' &&
    arrayDeIdsValido(a.praticaInclusiva, IDS_PRATICA_INCLUSIVA) &&
    typeof a.impactoSocial === 'boolean'
  );
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
      autoavaliacao,
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
      !arrayStringValido(segmentos, false) ||
      !arrayStringValido(cursos, false) ||
      !arrayStringValido(anexos, true, MAX_ANEXOS) ||
      (ods !== undefined && (!Array.isArray(ods) || ods.length > MAX_ITENS_ARRAY || !ods.every((n) => Number.isInteger(n) && n >= 1 && n <= 17))) ||
      !autoavaliacaoValida(autoavaliacao) ||
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
        segmentos: segmentos || [],
        cursos: cursos || [],
        categoria,
        descricao,
        ods: ods || [],
        autoavaliacao,
        termosAceitos,
        anexos,
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
