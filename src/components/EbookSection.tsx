import { BookOpen, Download, ArrowRight } from 'lucide-react';

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

export const EbookSection = ({ onFilterByYear }: EbookSectionProps) => (
  <section className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-senac-orange" size={18} />
        <h2 className="font-black text-xs uppercase tracking-[0.2em] text-[#003366]">
          E-books Completos
        </h2>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-3">
        {EBOOKS.map(({ year, practices }) => (
          <div
            key={year}
            className="relative rounded-xl md:rounded-2xl border border-senac-blue/20 bg-blue-50/30 hover:border-senac-blue/40 hover:shadow-lg hover:shadow-senac-blue/10 hover:-translate-y-1 overflow-hidden transition-all duration-300 flex flex-row md:flex-col"
          >
            {/* Cover image — desktop: top strip, mobile: left strip */}
            <div className="relative shrink-0 w-20 md:w-full md:h-28 overflow-hidden">
              <img
                src={`/covers/capa-${year}.jpg`}
                alt={ebookTitle(year)}
                className="w-full h-full object-cover object-top opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r md:bg-gradient-to-b from-transparent to-blue-50/90" />
              <div className="absolute bottom-1.5 right-1.5 md:bottom-2 md:right-2 bg-senac-blue/80 backdrop-blur-sm text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {practices} práticas
              </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col gap-2 px-4 py-3 md:p-4 flex-1 justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-widest font-black leading-none mb-1 text-gray-400">
                  E-book Educação Inovadora do Senac RN
                </p>
                <p className="text-sm font-black leading-snug text-senac-blue">
                  Melhores Práticas – {year}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <a
                  href={`/pdfs/praticas-inovadoras-${year}.pdf`}
                  download={`ebook-educacao-inovadora-senac-rn-melhores-praticas-${year}.pdf`}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-senac-blue text-white text-xs font-bold hover:bg-[#003366] transition-colors shadow-sm shadow-senac-blue/20 justify-center"
                >
                  <Download size={12} />
                  <span>Baixar PDF</span>
                </a>

                <button
                  type="button"
                  onClick={() => onFilterByYear(year)}
                  className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-senac-blue/25 text-senac-blue text-xs font-bold hover:bg-senac-blue/5 transition-colors justify-center"
                >
                  <ArrowRight size={12} />
                  <span>Ver as {practices} práticas</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
