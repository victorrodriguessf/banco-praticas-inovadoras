// Dados extraídos do 5° Edital Programa Educação Inovadora Senac RN Nº 01/2026
// (EDITAL_SUBMISSAO_26.pdf) — Quadro 1 (categorias, pág. 1-2) e Quadro 2
// (critérios de avaliação, pág. 2-6).

export const CATEGORIAS = [
  {
    id: 'categoria-1',
    titulo: 'Categoria 1 – Prática Pedagógica Individual',
    descricao:
      '3 (três) melhores práticas pedagógicas inovadoras de ensino/aprendizagem individuais com maiores pontuações da banca avaliadora de mercado educacional. Nesta categoria não será considerada Projeto Integrador.',
  },
  {
    id: 'categoria-2',
    titulo: 'Categoria 2 – Prática Pedagógica Integradora Coletiva',
    descricao:
      '1 prática pedagógica integradora entre 2 ou até 4 docentes com maior pontuação atribuída pelo Comitê NQI.',
  },
  {
    id: 'categoria-3',
    titulo: 'Categoria 3 – Prática Pedagógica Individual por segmentos/eixos',
    descricao:
      'Destaques dos segmentos – prática pedagógica inovadora com maior pontuação em cada segmento/eixo atribuída pelo Comitê NQI.',
  },
  {
    id: 'categoria-4',
    titulo: 'Categoria 4 – Projeto Integrador Individual',
    descricao:
      '1 Projeto Integrador que se destaque pela inovação, impacto educacional e alinhamento ao Modelo Pedagógico do Senac com maior pontuação atribuída pelo Comitê NQI.',
  },
] as const;

export type CategoriaOption = (typeof CATEGORIAS)[number];

// "Protagonismo do estudante a partir do uso de metodologias e/ou tecnologias
// inovadoras" — 3 pts por item presente
export const PROTAGONISMO_ESTUDANTE_ITENS = [
  { id: 'a', label: 'Estudo de caso' },
  {
    id: 'b',
    label: 'Desenvolvimento de um produto, favorecendo a cultura maker (faça você mesmo)',
  },
  {
    id: 'c',
    label:
      'Utilização de caminhos diferentes para a aprendizagem de acordo com o desempenho dos estudantes (personalização do ensino)',
  },
  { id: 'd', label: 'Gamificação' },
  { id: 'e', label: 'Adaptação de metodologias presenciais para a virtualidade' },
  { id: 'f', label: 'Adaptação de práticas profissionais para a virtualidade' },
  {
    id: 'g',
    label:
      'Uso de Inteligência Artificial e/ou Big Data para favorecer a aprendizagem de forma ética e responsável',
  },
  { id: 'h', label: 'Uso de realidade virtual ou aumentada para favorecer a aprendizagem' },
  { id: 'i', label: 'Simulação (treino de habilidades ou cenário seguido de debriefing)' },
  { id: 'j', label: 'Rotação por estações de aprendizagem' },
  { id: 'k', label: 'Hackathon para aprendizagem' },
] as const;

// "Prática pedagógica inclusiva" — 3 pts por item presente
export const PRATICA_INCLUSIVA_ITENS = [
  {
    id: 'a',
    label:
      'A prática possui evidências de ações pedagógicas intencionais visando à redução de barreiras à aprendizagem e à participação de um ou mais estudantes para que fossem incluídos no processo de aprendizagem',
  },
  {
    id: 'b',
    label: 'A prática promove o desenvolvimento transversal dos estudantes para a inclusão no mercado de trabalho',
  },
] as const;
