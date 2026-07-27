import type { Autoavaliacao } from '../schemas/submissionSchema';

const PONTOS_POR_ITEM = 3;

// ODS 4 (Educação de Qualidade) não pontua — sempre selecionado por padrão e
// não conta para o critério de Atitude Sustentável, que exige 2+ ODS além dele.
function atitudeSustentavelPontos(ods: number[]): number {
  const odsRelevantes = ods.filter((id) => id !== 4);
  return odsRelevantes.length >= 2 ? PONTOS_POR_ITEM : 0;
}

// Pontuação estimada, para referência visual do(a) docente durante o
// preenchimento — não é a pontuação oficial, que é atribuída pela banca/NQI.
export function computeAutoavaliacaoScore(autoavaliacao: Autoavaliacao, ods: number[]): number {
  return (
    autoavaliacao.contextualizacaoRealidade +
    autoavaliacao.aprendizagemIntegradora.length * PONTOS_POR_ITEM +
    autoavaliacao.protagonismoEstudante.length * PONTOS_POR_ITEM +
    (autoavaliacao.visaoCritica ? PONTOS_POR_ITEM : 0) +
    // Autonomia Digital pontua fixo, não por item presente
    (autoavaliacao.autonomiaDigital.length > 0 ? PONTOS_POR_ITEM : 0) +
    autoavaliacao.colaboracaoComunicacao.length * PONTOS_POR_ITEM +
    atitudeSustentavelPontos(ods) +
    (autoavaliacao.criatividadeEmpreendedora ? PONTOS_POR_ITEM : 0) +
    autoavaliacao.praticaInclusiva.length * PONTOS_POR_ITEM
    // "Impacto social ou conexão com o mercado" não tem pontuação definida no edital
  );
}

export function isAtitudeSustentavelAtendida(ods: number[]): boolean {
  return atitudeSustentavelPontos(ods) > 0;
}
