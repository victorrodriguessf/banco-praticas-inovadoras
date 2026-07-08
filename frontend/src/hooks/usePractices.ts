import { useState, useMemo } from 'react';
import { PRACTICES } from '../data/practicesAdapter';
import type { Practice } from '../types';

type SortBy = 'recentes' | 'antigas' | 'az';

const SEGMENT_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Beleza e Gastronomia': (p) =>
    /^beleza/i.test(p.segment) ||
    /^gastronomia/i.test(p.segment) ||
    /técnico em estética/i.test(p.segment) ||
    /\bgarçom\b/i.test(p.segment) ||
    /manipulação de alimentos/i.test(p.segment) ||
    /auxiliar de padeiro/i.test(p.segment) ||
    /bolos e tortas/i.test(p.segment) ||
    /compotas e doces/i.test(p.segment),

  'Design e Comunicação': (p) =>
    /^comunicação/i.test(p.segment) ||
    /^design/i.test(p.segment) ||
    /^artes e design/i.test(p.segment) ||
    /computa[çc][aã]o gr[áa]fica/i.test(p.segment) ||
    /fotógrafo/i.test(p.segment) ||
    /editor de projeto visual/i.test(p.segment),

  'Educacional': (p) =>
    /^educacional/i.test(p.segment),

  'Gestão e Negócios': (p) =>
    /^aprendizagem\s*[-–|/\s]/i.test(p.segment) ||
    /^comércio/i.test(p.segment) ||
    /^gestão/i.test(p.segment) ||
    /^asseio/i.test(p.segment) ||
    /^gestão e negócios/i.test(p.segment) ||
    /gestão de negócios/i.test(p.segment) ||
    /operador de caixa/i.test(p.segment) ||
    /técnicas de (vendas|atendimento)/i.test(p.segment) ||
    /qualidade no atendimento/i.test(p.segment) ||
    /comunicação assertiva/i.test(p.segment) ||
    /gestão de conflitos/i.test(p.segment) ||
    /estrat[eé]gias em vendas/i.test(p.segment) ||
    /técnicas de organização/i.test(p.segment) ||
    /prototipa[çc][aã]o/i.test(p.segment) ||
    /aprendizagem profissional/i.test(p.segment),

  'Graduação': (p) =>
    /^gradua[çc][aã]o/i.test(p.segment),

  'Idiomas': (p) =>
    /^idiomas/i.test(p.segment) ||
    (/^ensino médio técnico/i.test(p.segment) && /ingl[êe]s/i.test(p.segment)),

  'Mediotec': (p) =>
    /^ensino médio técnico/i.test(p.segment) &&
    !/ingl[êe]s/i.test(p.segment) &&
    !/informática para internet/i.test(p.segment) &&
    !/robótica educacional/i.test(p.segment),

  'Moda': (p) =>
    /^moda/i.test(p.segment),

  'Saúde e Segurança': (p) =>
    (/^saúde/i.test(p.segment) && !/estética/i.test(p.segment)) ||
    /cuidador (de idoso|infantil)/i.test(p.segment),

  'Tecnologia da Informação': (p) =>
    /^ti[\s\-–|/]/i.test(p.segment) ||
    /^ti\s+informática/i.test(p.segment) ||
    /^tecnologia\s(da|de)\sinforma[çc][aã]o/i.test(p.segment) ||
    /^tecnologia de informa[çc][aã]o$/i.test(p.segment) ||
    /robótica educacional/i.test(p.segment) ||
    /informática para internet/i.test(p.segment) ||
    /programador de sistemas/i.test(p.segment) ||
    /operador de computador/i.test(p.segment) ||
    /excel do zero/i.test(p.segment) ||
    /técnico em (desenvolvimento|informática)/i.test(p.segment),

  'Turismo e Hospitalidade': (p) =>
    /^turismo/i.test(p.segment) ||
    /\bhospitalidade\b/i.test(p.segment) ||
    /guia de turismo/i.test(p.segment) ||
    /técnico em hospedagem/i.test(p.segment) ||
    /\brecrear?dor\b/i.test(p.segment) ||
    /camareira/i.test(p.segment) ||
    /organizador de eventos/i.test(p.segment),
};

const BRAND_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Autonomia digital': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'autonomia digital'),
  'Atitude sustentável': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'atitude sustentável'),
  'Atitude criativa e empreendedora': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'atitude criativa e empreendedora'),
  'Comunicação e colaboração': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'comunicação e colaboração'),
  'Domínio técnico-científico': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'domínio técnico-científico'),
  'Visão crítica': (p) =>
    p.formativeBrands.some((b) => b.toLowerCase() === 'visão crítica'),
};

const UNIT_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Alecrim': (p) => /alecrim/i.test(p.unit),
  'Assú': (p) => /ass[uú]/i.test(p.unit),
  'Barreira Roxa': (p) => /barreira\s*roxa/i.test(p.unit),
  'Caicó': (p) => /caic[oó]/i.test(p.unit),
  'Centro': (p) => /centro/i.test(p.unit),
  'Mossoró': (p) => /mossor[oó]/i.test(p.unit),
  'Zona Norte': (p) => /zona\s*norte/i.test(p.unit),
  'Zona Sul': (p) => /zona\s*sul/i.test(p.unit),
};

const CRITERIA_MATCHERS: Record<string, (p: Practice) => boolean> = {
  'Aprendizagem integradora': (p) => p.integrativeLearning,
  'Prática de inclusão': (p) => p.inclusivePractice,
  'Prática de fomento à inclusão': (p) => p.inclusionPromotionPractice,
  'Impacto social / Conexão com o mercado': () => false,
};

// Static counts computed once from full dataset
export const FILTER_COUNTS = (() => {
  const years: Record<number, number> = {};
  const segments: Record<string, number> = {};
  const brands: Record<string, number> = {};
  const units: Record<string, number> = {};
  const criteria: Record<string, number> = {};

  for (const p of PRACTICES) {
    years[p.year] = (years[p.year] || 0) + 1;

    for (const [seg, fn] of Object.entries(SEGMENT_MATCHERS)) {
      if (fn(p)) segments[seg] = (segments[seg] || 0) + 1;
    }
    for (const [brand, fn] of Object.entries(BRAND_MATCHERS)) {
      if (fn(p)) brands[brand] = (brands[brand] || 0) + 1;
    }
    for (const [unit, fn] of Object.entries(UNIT_MATCHERS)) {
      if (fn(p)) units[unit] = (units[unit] || 0) + 1;
    }
    for (const [crit, fn] of Object.entries(CRITERIA_MATCHERS)) {
      if (fn(p)) criteria[crit] = (criteria[crit] || 0) + 1;
    }
  }

  return { years, segments, brands, units, criteria };
})();

export type FilterCounts = typeof FILTER_COUNTS;

export function usePractices() {
  const [sortBy, setSortBy] = useState<SortBy>('recentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  // Temporal logic: hide options with 0 matches for the currently selected years
  const disabledOptions = useMemo(() => {
    if (selectedYears.length === 0) return new Set<string>();
    const yearPractices = PRACTICES.filter((p) => selectedYears.includes(p.year));
    const disabled = new Set<string>();

    for (const [seg, fn] of Object.entries(SEGMENT_MATCHERS)) {
      if (!yearPractices.some(fn)) disabled.add(seg);
    }
    for (const [brand, fn] of Object.entries(BRAND_MATCHERS)) {
      if (!yearPractices.some(fn)) disabled.add(brand);
    }
    for (const [unit, fn] of Object.entries(UNIT_MATCHERS)) {
      if (!yearPractices.some(fn)) disabled.add(unit);
    }
    for (const [crit, fn] of Object.entries(CRITERIA_MATCHERS)) {
      if (!yearPractices.some(fn)) disabled.add(crit);
    }

    return disabled;
  }, [selectedYears]);

  const sortedPractices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = PRACTICES.filter((practice) => {
      const searchableText = [
        practice.title,
        practice.instructor,
        practice.pedagogicalGuidance,
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
      const matchesSegment =
        selectedSegments.length === 0 ||
        selectedSegments.some((seg) => SEGMENT_MATCHERS[seg]?.(practice) ?? false);
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.some((brand) => BRAND_MATCHERS[brand]?.(practice) ?? false);
      const matchesUnit =
        selectedUnits.length === 0 ||
        selectedUnits.some((unit) => UNIT_MATCHERS[unit]?.(practice) ?? false);
      const matchesCriteria =
        selectedCriteria.length === 0 ||
        selectedCriteria.some((crit) => CRITERIA_MATCHERS[crit]?.(practice) ?? false);

      return (
        matchesSearch &&
        matchesYear &&
        matchesSegment &&
        matchesBrand &&
        matchesUnit &&
        matchesCriteria
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      if (sortBy === 'antigas') return a.year - b.year;
      return b.year - a.year;
    });
  }, [
    searchQuery,
    selectedYears,
    selectedSegments,
    selectedBrands,
    selectedUnits,
    selectedCriteria,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedYears.length +
    selectedSegments.length +
    selectedBrands.length +
    selectedUnits.length +
    selectedCriteria.length;

  const handleYearChange = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
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

  const handleUnitChange = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const handleCriteriaChange = (crit: string) => {
    setSelectedCriteria((prev) =>
      prev.includes(crit) ? prev.filter((c) => c !== crit) : [...prev, crit]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedYears([]);
    setSelectedSegments([]);
    setSelectedBrands([]);
    setSelectedUnits([]);
    setSelectedCriteria([]);
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
    selectedSegments,
    selectedBrands,
    selectedUnits,
    selectedCriteria,
    sortedPractices,
    activeFiltersCount,
    disabledOptions,
    handleYearChange,
    handleSegmentChange,
    handleBrandChange,
    handleUnitChange,
    handleCriteriaChange,
    clearAllFilters,
    filterByYear,
  };
}
