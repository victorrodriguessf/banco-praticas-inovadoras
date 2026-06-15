import { useState, useMemo } from 'react';
import { PRACTICES } from '../data/practicesAdapter';
import type { Practice } from '../types';

type SortBy = 'recentes' | 'antigas' | 'az';

const SEGMENT_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Beleza e Estética': (p) =>
    /^beleza/i.test(p.segment) || /técnico em estética/i.test(p.segment),

  'Gestão e Negócios': (p) =>
    /^(gestão|aprendizagem|comércio)/i.test(p.segment) ||
    /\bgestão\b/i.test(p.segment) ||
    /^asseio/i.test(p.segment),

  'Saúde': (p) =>
    /saúde/i.test(p.segment) && !/estética/i.test(p.segment),

  'Tecnologia da Informação': (p) =>
    /^ti[\s\-|/]/i.test(p.segment) ||
    /^tecnologia\s(da|de)\sinformação/i.test(p.segment) ||
    /informática para (internet|adolescentes)/i.test(p.segment) ||
    /robótica educacional/i.test(p.segment),

  'Gastronomia e Hospitalidade': (p) =>
    /^gastronomia/i.test(p.segment) ||
    /turismo/i.test(p.segment) ||
    /hospitalidade/i.test(p.segment) ||
    /garçom/i.test(p.segment) ||
    /manipulação de alimentos/i.test(p.segment),

  'Moda': (p) => /^moda/i.test(p.segment),

  'Design, Artes e Comunicação': (p) =>
    /^(comunicação|design|artes e design)/i.test(p.segment) ||
    /ensino médio técnico.*(artes?|l[íi]ngua portuguesa)/i.test(p.segment),

  'Idiomas': (p) =>
    /^idiomas/i.test(p.segment) ||
    /ensino médio técnico.*ingl[êe]s/i.test(p.segment),
};

const BRAND_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Prática de inclusão': (p) => p.inclusivePractice,
  'Aprendizagem integradora': (p) => p.integrativeLearning,
  'Prática de fomento à inclusão': (p) => p.inclusionPromotionPractice,
  'Impacto social': () => false,
  'Conexão com o mercado': () => false,
  'Autonomia digital': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'autonomia digital'),
  'Atitude sustentável': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'atitude sustentável'),
  'Atitude criativa e empreendedora': (p) =>
    p.formativeBrands.some(
      (b) => b.toLowerCase() === 'atitude criativa e empreendedora'
    ),
  'Comunicação e colaboração': (p) =>
    p.formativeBrands.some(
      (b) => b.toLowerCase() === 'comunicação e colaboração'
    ),
  'Domínio técnico-científico': (p) =>
    p.formativeBrands.some(
      (b) => b.toLowerCase() === 'domínio técnico-científico'
    ),
  'Visão crítica': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'visão crítica'),
};

export function usePractices() {
  const [sortBy, setSortBy] = useState<SortBy>('recentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedCEPs, setSelectedCEPs] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const sortedPractices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = PRACTICES.filter((practice) => {
      const searchableText = [
        practice.title,
        practice.instructor,
        practice.pedagogicalGuidance,
        practice.unit,
        practice.segment,
        practice.competencyElements,
        practice.learningSituation,
        practice.formativeBrands.join(' '),
        practice.odsDetails
          .map((ods) => `${ods.numero} ${ods.nome} ${ods.tag}`)
          .join(' '),
        practice.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = query === '' || searchableText.includes(query);
      const matchesYear =
        selectedYears.length === 0 || selectedYears.includes(practice.year);
      const matchesCEP =
        selectedCEPs.length === 0 || selectedCEPs.includes(practice.unit);
      const matchesSegment =
        selectedSegments.length === 0 ||
        selectedSegments.some((seg) =>
          SEGMENT_MATCHERS[seg]?.(practice) ?? false
        );
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some((brand) =>
          BRAND_MATCHERS[brand]?.(practice) ?? false
        );

      return (
        matchesSearch &&
        matchesYear &&
        matchesCEP &&
        matchesSegment &&
        matchesBrand
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'antigas') return a.year - b.year;
      return b.year - a.year;
    });
  }, [searchQuery, selectedYears, selectedCEPs, selectedSegments, selectedBrands, sortBy]);

  const activeFiltersCount =
    selectedYears.length +
    selectedCEPs.length +
    selectedSegments.length +
    selectedBrands.length;

  const handleYearChange = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleCEPChange = (cep: string) => {
    setSelectedCEPs((prev) =>
      prev.includes(cep) ? prev.filter((c) => c !== cep) : [...prev, cep]
    );
  };

  const handleSegmentChange = (seg: string) => {
    setSelectedSegments((prev) =>
      prev.includes(seg) ? prev.filter((s) => s !== seg) : [...prev, seg]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedYears([]);
    setSelectedCEPs([]);
    setSelectedSegments([]);
    setSelectedBrands([]);
  };

  const filterByYear = (year: number) => {
    setSelectedYears([year]);
  };

  return {
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    selectedYears,
    selectedCEPs,
    selectedSegments,
    selectedBrands,
    sortedPractices,
    activeFiltersCount,
    handleYearChange,
    handleCEPChange,
    handleSegmentChange,
    handleBrandChange,
    clearAllFilters,
    filterByYear,
  };
}
