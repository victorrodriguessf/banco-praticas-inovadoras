export interface ODS {
  id: number;
  label: string;
  color: string;
}

export interface ODSDetail {
  numero: number;
  nome: string;
  tag: string;
  fonte?: string;
}

export interface Practice {
  id: string;
  originalId: string;
  year: number;

  title: string;
  instructor: string;
  pedagogicalGuidance: string;
  unit: string;
  segment: string;

  competencyElements: string;
  formativeBrands: string[];

  ods: number[];
  odsDetails: ODSDetail[];

  integrativeLearning: boolean;
  inclusivePractice: boolean;
  inclusionPromotionPractice: boolean;

  learningSituation: string;

  pages: {
    initial: number;
    situation: number;
  };

  tags: string[];

  raw: unknown;
}

export const ODS_DATA: Record<number, ODS> = {
  1: {
    id: 1,
    label: "Erradicação da Pobreza",
    color: "#E5243B",
  },
  2: {
    id: 2,
    label: "Fome Zero e Agricultura Sustentável",
    color: "#DDA63A",
  },
  3: {
    id: 3,
    label: "Saúde e Bem-Estar",
    color: "#4C9F38",
  },
  4: {
    id: 4,
    label: "Educação de Qualidade",
    color: "#C5192D",
  },
  5: {
    id: 5,
    label: "Igualdade de Gênero",
    color: "#FF3A21",
  },
  6: {
    id: 6,
    label: "Água Potável e Saneamento",
    color: "#26BDE2",
  },
  7: {
    id: 7,
    label: "Energia Limpa e Acessível",
    color: "#FCC30B",
  },
  8: {
    id: 8,
    label: "Trabalho Decente e Crescimento Econômico",
    color: "#A21942",
  },
  9: {
    id: 9,
    label: "Indústria, Inovação e Infraestrutura",
    color: "#FD6925",
  },
  10: {
    id: 10,
    label: "Redução das Desigualdades",
    color: "#DD1367",
  },
  11: {
    id: 11,
    label: "Cidades e Comunidades Sustentáveis",
    color: "#FD9D24",
  },
  12: {
    id: 12,
    label: "Consumo e Produção Responsáveis",
    color: "#BF8B2E",
  },
  13: {
    id: 13,
    label: "Ação Contra a Mudança Global do Clima",
    color: "#3F7E44",
  },
  14: {
    id: 14,
    label: "Vida na Água",
    color: "#0A97D9",
  },
  15: {
    id: 15,
    label: "Vida Terrestre",
    color: "#56C02B",
  },
  16: {
    id: 16,
    label: "Paz, Justiça e Instituições Eficazes",
    color: "#00689D",
  },
  17: {
    id: 17,
    label: "Parcerias e Meios de Implementação",
    color: "#19486A",
  },
};