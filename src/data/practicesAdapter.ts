import catalogo2023 from './catalogo_2023.json';
import catalogo2024 from './catalogo_2024.json';
import catalogo2025 from './catalogo_2025.json';
import type { Practice, ODSDetail } from '../types';

type RawCatalog = {
  fonte: string;
  total_projetos: number;
  projetos: RawProject[];
};

type RawProject = {
  id_projeto: string;
  pagina_inicial: number;
  pagina_situacao: number;
  nome_projeto: string;
  cep: string;
  instrutor: string;
  orientacao_pedagogica: string;
  segmento_curso: string;
  elementos_competencia: string;
  marcas_formativas: string[];
  aprendizagem_integradora?: {
    valor: boolean;
  };
  pratica_inclusiva?: {
    valor: boolean;
  };
  pratica_fomento_inclusao?: {
    valor: boolean;
  };
  ods: ODSDetail[];
  situacao_aprendizagem: string;
  tags_identificacao: string[];
};

function cleanText(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') return fallback;
  return value.trim() || fallback;
}

function normalizeCatalog(catalog: RawCatalog, year: number): Practice[] {
  return catalog.projetos.map((project) => {
    const title = cleanText(project.nome_projeto, 'Projeto sem título');

    return {
      id: `${year}-${project.id_projeto}`,
      originalId: project.id_projeto,
      year,

      title,
      instructor: cleanText(project.instrutor, 'Não informado'),
      pedagogicalGuidance: cleanText(project.orientacao_pedagogica, 'Não informado'),
      unit: cleanText(project.cep, 'Não informado'),
      segment: cleanText(project.segmento_curso, 'Não informado'),

      competencyElements: cleanText(project.elementos_competencia),
      formativeBrands: Array.isArray(project.marcas_formativas)
        ? project.marcas_formativas
        : [],

      ods: Array.isArray(project.ods)
        ? project.ods.map((item) => item.numero).filter(Boolean)
        : [],

      odsDetails: Array.isArray(project.ods)
        ? project.ods
        : [],

      integrativeLearning: Boolean(project.aprendizagem_integradora?.valor),
      inclusivePractice: Boolean(project.pratica_inclusiva?.valor),
      inclusionPromotionPractice: Boolean(project.pratica_fomento_inclusao?.valor),

      learningSituation: cleanText(project.situacao_aprendizagem),

      pages: {
        initial: project.pagina_inicial,
        situation: project.pagina_situacao,
      },

      tags: Array.isArray(project.tags_identificacao)
        ? project.tags_identificacao
        : [],

      raw: project,
    };
  });
}

export const PRACTICES: Practice[] = [
  ...normalizeCatalog(catalogo2023 as RawCatalog, 2023),
  ...normalizeCatalog(catalogo2024 as RawCatalog, 2024),
  ...normalizeCatalog(catalogo2025 as RawCatalog, 2025),
];