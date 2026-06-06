import React from 'react';
import {
  Menu,
  Search,
  Filter,
  BookOpen,
  Download,
  ChevronRight,
  ChevronDown,
  MapPin,
  User,
  Tag,
  Globe,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ODS_DATA, type Practice } from '../types';
import { printPracticePdf } from '../utils/pdfPrint';

// --- Header Component ---
export const Header = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const [logoError, setLogoError] = React.useState(false);

  return (
    <header className="bg-[#ffb84d] border-b border-orange-300 sticky top-0 z-50 shadow-md">
      <div
        id="header-inner"
        className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center">
            {!logoError ? (
              <img
                src="/logo_senac_labs.png"
                alt="Senac Labs"
                className="h-14 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-2xl tracking-tighter text-[#004a8d]">
                  SENAC
                </span>
                <span className="font-bold text-xs tracking-[0.2em] text-[#004a8d] uppercase">
                  LABS RN
                </span>
              </div>
            )}
          </a>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Início
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Sobre
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Edital
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#004a8d] border-b-2 border-[#004a8d] pb-1 transition-colors"
          >
            Práticas
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            E-books
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Contato
          </a>
        </nav>

        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden p-2 text-[#003366] hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={32} />
        </button>
      </div>
    </header>
  );
};

// --- Hero Component ---
export const Hero = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) => (
  <section className="bg-[#f0f4f8] border-b border-blue-100 py-16 px-4 relative overflow-hidden">
    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-senac-blue/5 rounded-full blur-3xl" />
    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-senac-orange/5 rounded-full blur-3xl" />

    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-senac-blue border border-blue-100 shadow-sm uppercase tracking-widest">
          Transição Digital e Educacional
        </div>

        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#003366]">
          BANCO DE PRÁTICAS{' '}
          <span className="text-senac-orange">INOVADORAS</span>
        </h1>

        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Explore, inspire-se e replique as melhores metodologias educacionais
          desenvolvidas pelos docentes do Senac Rio Grande do Norte.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative max-w-3xl mx-auto"
      >
        <div className="flex bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden p-2 border border-blue-50 focus-within:ring-4 focus-within:ring-senac-blue/5 transition-all">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="text-gray-400" size={24} />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palavra-chave, título, instrutor ou curso..."
              className="w-full h-14 outline-none text-gray-800 placeholder:text-gray-400 text-lg font-medium"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <ChevronRight className="rotate-45" size={20} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="bg-senac-blue hover:bg-[#003366] text-white px-10 rounded-xl font-bold text-lg transition-all shadow-lg shadow-senac-blue/20"
          >
            Pesquisar
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

// --- Filter Section Component ---
const FilterSection = ({
  title,
  children,
  expanded = true,
}: {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
}) => {
  const [isOpen, setIsOpen] = React.useState(expanded);

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

interface SidebarProps {
  isMobile?: boolean;
  selectedYears: number[];
  onYearChange: (y: number) => void;
  selectedODS: number[];
  onODSChange: (id: number) => void;
  selectedCEPs: string[];
  onCEPChange: (c: string) => void;
}

export const Sidebar = ({
  isMobile = false,
  selectedYears,
  onYearChange,
  selectedODS,
  onODSChange,
  selectedCEPs,
  onCEPChange,
}: SidebarProps) => {
  const [showAllODS, setShowAllODS] = React.useState(false);

  const visibleODS = showAllODS
    ? Array.from({ length: 17 }, (_, index) => index + 1)
    : [1, 2, 3, 4];

  return (
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

      <FilterSection title="Objetivos da ONU (ODS)">
        {visibleODS.map((id) => (
          <Checkbox
            key={id}
            id={`ods-${id}`}
            label={`ODS ${id} - ${
              ODS_DATA[id]?.label || 'Objetivo não informado'
            }`}
            checked={selectedODS.includes(id)}
            onChange={() => onODSChange(id)}
          />
        ))}

        <button
          type="button"
          onClick={() => setShowAllODS((prev) => !prev)}
          className="text-[10px] font-black uppercase tracking-widest text-senac-orange hover:underline pt-2"
        >
          {showAllODS ? 'Mostrar menos ODS' : 'Ver todos os 17 ODS'}
        </button>
      </FilterSection>

      <FilterSection title="Unidade (CEP)">
        {['Alecrim', 'Centro', 'Zona Sul', 'Zona Norte', 'Barreira Roxa'].map(
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

        <button
          type="button"
          className="text-[10px] font-black uppercase tracking-widest text-senac-orange hover:underline pt-2"
        >
          Ver pólos do interior
        </button>
      </FilterSection>

      <FilterSection title="Eixo / Segmento">
        {['Gestão', 'TI', 'Saúde', 'Turismo'].map((seg) => (
          <Checkbox key={seg} id={`seg-${seg}`} label={seg} />
        ))}
      </FilterSection>

      <FilterSection title="Marcas Formativas">
        {['Autonomia Digital', 'Atitude Sustentável', 'Visão Crítica'].map(
          (brand) => (
            <Checkbox key={brand} id={`brand-${brand}`} label={brand} />
          )
        )}
      </FilterSection>
    </aside>
  );
};

// --- Card Component ---
export const PracticeCard = ({
  practice,
  onReadSummary,
}: {
  practice: Practice;
  onReadSummary?: () => void;
}) => {
  const handleDownloadPdf = async () => {
    try {
      await printPracticePdf({
        year: practice.year,
        initialPage: practice.pages.initial,
        situationPage: practice.pages.situation,
        title: practice.title,
      });
    } catch (error) {
      console.error(error);
      alert(
        'Não foi possível gerar o PDF desta prática. Verifique se o PDF original está disponível em public/pdfs.'
      );
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -5,
        boxShadow:
          '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full transition-all duration-300"
    >
      <div className="flex flex-wrap gap-1.5 mb-4">
        {practice.ods.map((odsId) => {
          const ods = ODS_DATA[odsId];

          if (!ods) return null;

          return (
            <span
              key={odsId}
              style={{ backgroundColor: ods.color }}
              className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm"
            >
              <Globe size={10} />
              ODS {odsId}
            </span>
          );
        })}
      </div>

      <h3 className="font-bold text-lg text-senac-blue leading-tight mb-4 flex-grow">
        {practice.title}
      </h3>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} className="text-senac-orange" />
          <span className="font-medium text-gray-700">
            CEP: {practice.unit}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <User size={16} className="text-senac-orange" />
          <span>
            Instrutor:{' '}
            <span className="font-semibold text-gray-700">
              {practice.instructor}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Tag size={16} className="text-senac-orange" />
          <span>
            Segmento:{' '}
            <span className="font-semibold text-gray-700">
              {practice.segment}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-50">
        <button
          type="button"
          onClick={onReadSummary}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-xs hover:border-senac-blue hover:text-senac-blue hover:bg-gray-50 transition-all group"
        >
          <BookOpen
            size={14}
            className="group-hover:scale-110 transition-transform"
          />
          Leia Resumo
        </button>

        <button
          type="button"
          onClick={handleDownloadPdf}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-senac-blue text-white font-bold text-xs hover:bg-senac-blue/90 shadow-md shadow-senac-blue/20 transition-all group"
        >
          <Download
            size={14}
            className="group-hover:translate-y-0.5 transition-transform"
          />
          Baixar PDF
        </button>
      </div>
    </motion.div>
  );
};

// --- Practice Summary Modal ---
export const PracticeSummaryModal = ({
  practice,
  onClose,
}: {
  practice: Practice | null;
  onClose: () => void;
}) => {
  if (!practice) return null;

  const handleDownloadPdf = async () => {
    try {
      await printPracticePdf({
        year: practice.year,
        initialPage: practice.pages.initial,
        situationPage: practice.pages.situation,
        title: practice.title,
      });
    } catch (error) {
      console.error(error);
      alert(
        'Não foi possível gerar o PDF desta prática. Verifique se o PDF original está disponível em public/pdfs.'
      );
    }
  };

  const previewText =
    practice.learningSituation.length > 1200
      ? `${practice.learningSituation.slice(0, 1200).trim()}...`
      : practice.learningSituation;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          aria-label="Fechar resumo"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/20"
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-senac-blue text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {practice.year}
                </span>

                <span className="bg-senac-orange/10 text-senac-orange text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  CEP {practice.unit}
                </span>
              </div>

              <h2 className="text-2xl font-black text-senac-blue leading-tight">
                {practice.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 rounded-full text-gray-400 hover:text-senac-blue hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryInfoBox title="Instrutor" value={practice.instructor} />

              <SummaryInfoBox
                title="Orientação Pedagógica"
                value={practice.pedagogicalGuidance}
              />

              <div className="md:col-span-2">
                <SummaryInfoBox
                  title="Segmento / Curso"
                  value={practice.segment}
                />
              </div>
            </div>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                ODS relacionados
              </h3>

              <div className="flex flex-wrap gap-2">
                {practice.odsDetails.map((ods) => (
                  <span
                    key={`${practice.id}-${ods.tag}`}
                    className="text-xs font-bold bg-senac-blue text-white px-3 py-1.5 rounded-full"
                  >
                    ODS {ods.numero} - {ods.nome}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Marcas formativas
              </h3>

              <div className="flex flex-wrap gap-2">
                {practice.formativeBrands.map((brand) => (
                  <span
                    key={`${practice.id}-${brand}`}
                    className="text-xs font-bold bg-senac-orange/10 text-senac-orange px-3 py-1.5 rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SummaryBooleanBox
                title="Aprendizagem Integradora"
                active={practice.integrativeLearning}
              />

              <SummaryBooleanBox
                title="Prática Inclusiva"
                active={practice.inclusivePractice}
              />

              <SummaryBooleanBox
                title="Fomento à Inclusão"
                active={practice.inclusionPromotionPractice}
              />
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Resumo da situação de aprendizagem
              </h3>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {previewText || 'Resumo não informado.'}
              </p>

              {practice.learningSituation.length > 1200 && (
                <p className="mt-3 text-sm font-semibold text-senac-blue">
                  Para ler mais,{' '}
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="underline underline-offset-2 font-black hover:text-senac-orange transition-colors"
                  >
                    baixe o PDF
                  </button>
                  .
                </p>
              )}
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Elementos de competência
              </h3>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {practice.competencyElements || 'Não informado.'}
              </p>
            </section>

            <div className="bg-blue-50 rounded-2xl p-4 text-sm text-senac-blue font-bold">
              Páginas no e-book: {practice.pages.initial}
              {practice.pages.situation !== practice.pages.initial
                ? ` a ${practice.pages.situation}`
                : ''}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const SummaryInfoBox = ({
  title,
  value,
}: {
  title: string;
  value: string;
}) => (
  <div className="bg-gray-50 rounded-2xl p-4">
    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">
      {title}
    </p>
    <p className="font-bold text-gray-800 text-justify">
      {value || 'Não informado.'}
    </p>
  </div>
);

const SummaryBooleanBox = ({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) => (
  <div className="rounded-2xl border border-gray-100 p-4">
    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
      {title}
    </p>

    <p
      className={`font-black mt-1 ${
        active ? 'text-green-600' : 'text-gray-400'
      }`}
    >
      {active ? 'Sim' : 'Não'}
    </p>
  </div>
);