import { useState, useMemo } from 'react';
import { PRACTICES } from '../data/practicesAdapter';
import type { Practice } from '../types';

type SortBy = 'recentes' | 'antigas' | 'az';

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
          practice.segment.toLowerCase().includes(seg.toLowerCase())
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
  };
}
