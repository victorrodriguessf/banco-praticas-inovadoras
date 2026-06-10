import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  onChange,
}: {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: () => void;
}) => (
  <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
    <div className="relative">
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

    <span className="text-sm font-semibold text-gray-500 group-hover:text-senac-blue transition-colors">
      {label}
    </span>
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

const BRANDS = [
  { label: 'Prática de inclusão' },
  { label: 'Aprendizagem integradora' },
  { label: 'Prática de fomento à inclusão' },
  { label: 'Impacto social', placeholder: true },
  { label: 'Conexão com o mercado', placeholder: true },
  { label: 'Autonomia digital' },
  { label: 'Atitude sustentável' },
  { label: 'Atitude criativa e empreendedora' },
  { label: 'Comunicação e colaboração' },
  { label: 'Domínio técnico-científico' },
  { label: 'Visão crítica' },
];

interface SidebarProps {
  isMobile?: boolean;
  selectedYears: number[];
  onYearChange: (y: number) => void;
  selectedCEPs: string[];
  onCEPChange: (c: string) => void;
  selectedSegments: string[];
  onSegmentChange: (s: string) => void;
  selectedBrands: string[];
  onBrandChange: (b: string) => void;
}

export const Sidebar = ({
  isMobile = false,
  selectedYears,
  onYearChange,
  selectedCEPs,
  onCEPChange,
  selectedSegments,
  onSegmentChange,
  selectedBrands,
  onBrandChange,
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
      {[2025, 2024, 2023, 2022].map((year) => (
        <Checkbox
          key={year}
          id={`year-${year}`}
          label={year.toString()}
          checked={selectedYears.includes(year)}
          onChange={() => onYearChange(year)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Marcas Formativas">
      {BRANDS.map(({ label, placeholder }) => (
        <Checkbox
          key={label}
          id={`brand-${label}`}
          label={label}
          checked={selectedBrands.includes(label)}
          onChange={placeholder ? undefined : () => onBrandChange(label)}
        />
      ))}
    </FilterSection>

    <FilterSection title="Unidade (CEP)">
      {['Alecrim', 'Assú', 'Barreira Roxa', 'Caicó', 'Centro', 'Mossoró', 'Zona Norte', 'Zona Sul'].map(
        (cep) => (
          <Checkbox
            key={cep}
            id={`cep-${cep}`}
            label={cep}
            checked={selectedCEPs.includes(cep)}
            onChange={() => onCEPChange(cep)}
          />
        )
      )}
    </FilterSection>

    <FilterSection title="Eixo / Segmento" expanded={false}>
      {[
        'Beleza e Estética',
        'Design, Artes e Comunicação',
        'Gastronomia e Hospitalidade',
        'Gestão e Negócios',
        'Idiomas',
        'Moda',
        'Saúde',
        'Tecnologia da Informação',
      ].map((seg) => (
        <Checkbox
          key={seg}
          id={`seg-${seg}`}
          label={seg}
          checked={selectedSegments.includes(seg)}
          onChange={() => onSegmentChange(seg)}
        />
      ))}
    </FilterSection>
  </aside>
);
