import { useState, useMemo } from 'react';
import { PRACTICES } from '../data/practicesAdapter';

type SortBy = 'recentes' | 'antigas' | 'az';

export function usePractices() {
  const [sortBy, setSortBy] = useState<SortBy>('recentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedODS, setSelectedODS] = useState<number[]>([]);
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
      const matchesODS =
        selectedODS.length === 0 ||
        practice.ods.some((id) => selectedODS.includes(id));
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
          practice.formativeBrands.some((b) =>
            b.toLowerCase().includes(brand.toLowerCase())
          )
        );

      return (
        matchesSearch &&
        matchesYear &&
        matchesODS &&
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
  }, [
    searchQuery,
    selectedYears,
    selectedODS,
    selectedCEPs,
    selectedSegments,
    selectedBrands,
    sortBy,
  ]);

  const activeFiltersCount =
    selectedYears.length +
    selectedODS.length +
    selectedCEPs.length +
    selectedSegments.length +
    selectedBrands.length;

  const handleYearChange = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleODSChange = (id: number) => {
    setSelectedODS((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
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
    setSelectedODS([]);
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
    selectedODS,
    selectedCEPs,
    selectedSegments,
    selectedBrands,
    sortedPractices,
    activeFiltersCount,
    handleYearChange,
    handleODSChange,
    handleCEPChange,
    handleSegmentChange,
    handleBrandChange,
    clearAllFilters,
  };
}
