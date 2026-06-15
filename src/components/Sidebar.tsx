import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FILTER_COUNTS, type FilterCounts } from '../hooks/usePractices';

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Checkbox = ({
  id,
  label,
  checked = false,
  count,
  onChange,
}: {
  id: string;
  label: string;
  checked?: boolean;
  count?: number;
  onChange?: () => void;
}) => (
  <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
    <div className="relative shrink-0">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        readOnly={!onChange}
      />
      <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-senac-orange peer-checked:border-senac-orange transition-all" />
      <CheckIcon className="absolute top-1 left-1 transform scale-0 peer-checked:scale-100 transition-transform text-white" />
    </div>

    <span className="text-sm font-semibold text-gray-500 group-hover:text-senac-blue transition-colors flex-1 leading-tight">
      {label}
    </span>

    {count !== undefined && (
      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center shrink-0">
        {count}
      </span>
    )}
  </label>
);

const FilterSection = ({
  title,
  children,
  expanded = true,
}: {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(expanded);

  return (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full font-black text-[#003366] text-xs uppercase tracking-widest mb-4 group"
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 text-senac-orange ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SEGMENTS = [
  'Beleza e Gastronomia',
  'Design e Comunicação',
  'Educacional',
  'Gestão e Negócios',
  'Graduação',
  'Idiomas',
  'Mediotec',
  'Moda',
  'Saúde e Segurança',
  'Tecnologia da Informação',
  'Turismo e Hospitalidade',
];

const BRANDS = [
  'Autonomia digital',
  'Atitude sustentável',
  'Atitude criativa e empreendedora',
  'Comunicação e colaboração',
  'Domínio técnico-científico',
  'Visão crítica',
];

const CRITERIA = [
  'Aprendizagem integradora',
  'Prática de inclusão',
  'Prática de fomento à inclusão',
  'Impacto social / Conexão com o mercado',
];

interface SidebarProps {
  isMobile?: boolean;
  selectedYears: number[];
  onYearChange: (y: number) => void;
  selectedSegments: string[];
  onSegmentChange: (s: string) => void;
  selectedBrands: string[];
  onBrandChange: (b: string) => void;
  selectedCriteria: string[];
  onCriteriaChange: (c: string) => void;
  disabledOptions: Set<string>;
  counts: FilterCounts;
}

export const Sidebar = ({
  isMobile = false,
  selectedYears,
  onYearChange,
  selectedSegments,
  onSegmentChange,
  selectedBrands,
  onBrandChange,
  selectedCriteria,
  onCriteriaChange,
  disabledOptions,
  counts,
}: SidebarProps) => (
  <aside
    className={`${
      isMobile
        ? 'p-6'
        : 'w-72 flex-shrink-0 sticky top-28 h-[calc(100vh-140px)] overflow-y-auto pr-4'
    }`}
  >
    <div className="flex items-center gap-2 mb-8 text-senac-blue bg-blue-50/50 p-3 rounded-xl border border-blue-100">
      <Filter className="text-senac-orange" size={20} />
      <h2 className="font-black text-xs uppercase tracking-[0.2em]">
        Refinar Busca
      </h2>
    </div>

    <FilterSection title="Ano do Edital">
      {([2025, 2024, 2023, 2022] as const).map((year) => (
        <Checkbox
          key={year}
          id={`year-${year}`}
          label={String(year)}
          checked={selectedYears.includes(year)}
          count={counts.years[year] ?? 0}
          onChange={() => onYearChange(year)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Segmentação">
      {SEGMENTS.filter((seg) => !disabledOptions.has(seg)).map((seg) => (
        <Checkbox
          key={seg}
          id={`seg-${seg}`}
          label={seg}
          checked={selectedSegments.includes(seg)}
          count={counts.segments[seg] ?? 0}
          onChange={() => onSegmentChange(seg)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Marcas Formativas" expanded={false}>
      {BRANDS.filter((b) => !disabledOptions.has(b)).map((brand) => (
        <Checkbox
          key={brand}
          id={`brand-${brand}`}
          label={brand}
          checked={selectedBrands.includes(brand)}
          count={counts.brands[brand] ?? 0}
          onChange={() => onBrandChange(brand)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Critérios do Edital" expanded={false}>
      {CRITERIA.filter((c) => !disabledOptions.has(c)).map((crit) => (
        <Checkbox
          key={crit}
          id={`crit-${crit}`}
          label={crit}
          checked={selectedCriteria.includes(crit)}
          count={counts.criteria[crit] ?? 0}
          onChange={
            counts.criteria[crit]
              ? () => onCriteriaChange(crit)
              : undefined
          }
        />
      ))}
    </FilterSection>
  </aside>
);
