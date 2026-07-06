import { BookOpen, Download, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

type EbookSectionProps = {
  onFilterByYear: (year: number) => void;
};

const EBOOKS = [
  { year: 2022, practices: 40 },
  { year: 2023, practices: 75 },
  { year: 2024, practices: 91 },
  { year: 2025, practices: 104 },
];

const ebookTitle = (year: number) =>
  `E-book Educação Inovadora do Senac RN: Melhores Práticas – ${year}`;

export const EbookSection = ({ onFilterByYear }: EbookSectionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-senac-orange" size={18} />
          <h2 className="font-black text-xs uppercase tracking-[0.2em] text-[#003366]">
            E-books Completos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {EBOOKS.map(({ year, practices }) => (
            <motion.div
              key={year}
              className="group cursor-pointer motion-reduce:transform-none motion-reduce:transition-none"
              whileHover={reduceMotion ? undefined : { y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {/* Capa */}
              <div className="relative rounded-2xl shadow-md group-hover:shadow-2xl group-hover:shadow-senac-blue/25 transition-shadow duration-300 overflow-hidden">
                <img
                  src={`/covers/capa-${year}.jpg`}
                  alt={ebookTitle(year)}
                  className="w-full aspect-video object-cover rounded-2xl transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:-rotate-1 motion-reduce:transform-none motion-reduce:transition-none"
                />
                <div className="absolute inset-0 rounded-2xl bg-senac-blue/0 group-hover:bg-senac-blue/10 transition-colors duration-300" />
              </div>

              {/* Texto */}
              <div className="mt-4 text-center">
                <p className="text-senac-blue leading-tight">
                  <span className="font-black text-3xl">{practices}</span>{' '}
                  <span className="font-bold text-base">práticas</span>
                </p>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Educação Inovadora do Senac RN
                </p>
                <span className="inline-block mt-2 text-xs font-black text-senac-blue bg-senac-blue/10 px-2.5 py-1 rounded-full tracking-wide">
                  {year}
                </span>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-2 mt-4">
                <a
                  href={`/pdfs/praticas-inovadoras-${year}.pdf`}
                  download={`ebook-educacao-inovadora-senac-rn-melhores-praticas-${year}.pdf`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-senac-blue text-white text-sm font-bold hover:bg-[#003366] transition-colors"
                >
                  <Download size={14} />
                  <span>Baixar PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => onFilterByYear(year)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-gray-200 text-senac-blue text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight size={14} />
                  <span>Ver as {practices} práticas</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
