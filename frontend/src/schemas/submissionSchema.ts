import { z } from 'zod';

export const submissionSchema = z.object({
  titulo: z.string().min(5, 'Informe um título com ao menos 5 caracteres'),
  editalId: z.string().min(1, 'Selecione um edital'),
  autores: z
    .array(z.string().min(1))
    .min(1, 'Adicione ao menos um autor'),
  unidades: z.array(z.string()).min(1, 'Selecione ao menos uma unidade'),
  segmentos: z.array(z.string()).min(1, 'Selecione ao menos um segmento'),
  cursos: z.array(z.string()),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  descricao: z.string().min(20, 'Descreva a prática com ao menos 20 caracteres'),
  ods: z.array(z.number()),
  marcasFormativas: z.array(z.string()),
  termosAceitos: z.literal(true, {
    message: 'É necessário aceitar os termos para enviar a submissão',
  }),
  anexos: z.array(z.string()),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
