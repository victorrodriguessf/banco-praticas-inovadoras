import { z } from 'zod';
import { MAX_DESCRICAO_LENGTH } from '../data/formOptions';

// Espelha o Quadro 2 (critérios de avaliação) do edital. Ver
// frontend/src/data/autoavaliacaoOptions.ts para os textos/ids de cada item.
// "Atitude Sustentável" não tem campo aqui: é derivada da seleção de ODS
// (ver frontend/src/utils/autoavaliacaoScore.ts).
export const autoavaliacaoSchema = z.object({
  contextualizacaoRealidade: z.union([z.literal(0), z.literal(1.5), z.literal(3)]),
  aprendizagemIntegradora: z.array(z.string()),
  protagonismoEstudante: z.array(z.string()),
  visaoCritica: z.boolean(),
  autonomiaDigital: z.array(z.string()),
  colaboracaoComunicacao: z.array(z.string()),
  criatividadeEmpreendedora: z.boolean(),
  praticaInclusiva: z.array(z.string()),
  impactoSocial: z.boolean(),
});

export type Autoavaliacao = z.infer<typeof autoavaliacaoSchema>;

export const submissionSchema = z.object({
  titulo: z.string().min(5, 'Informe um título com ao menos 5 caracteres'),
  editalId: z.string().min(1, 'Selecione um edital'),
  autores: z
    .array(z.string().min(1))
    .min(1, 'Adicione ao menos um autor'),
  unidades: z.array(z.string()).min(1, 'Selecione ao menos uma unidade'),
  segmentos: z.array(z.string()),
  cursos: z.array(z.string()),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  descricao: z
    .string()
    .min(20, 'Descreva a prática com ao menos 20 caracteres')
    .max(MAX_DESCRICAO_LENGTH, `A descrição deve ter no máximo ${MAX_DESCRICAO_LENGTH} caracteres`),
  ods: z.array(z.number()),
  autoavaliacao: autoavaliacaoSchema,
  termosAceitos: z.literal(true, {
    message: 'É necessário aceitar os termos para enviar a submissão',
  }),
  anexos: z
    .array(z.string())
    .min(1, 'Anexe ao menos uma evidência')
    .max(3, 'Envie no máximo 3 evidências'),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
