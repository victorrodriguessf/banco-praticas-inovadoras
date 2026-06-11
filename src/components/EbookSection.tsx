import { BookOpen, Download, Lock } from 'lucide-react';

const EBOOKS = [
  { year: 2022, available: true },
  { year: 2023, available: true },
  { year: 2024, available: true },
  { year: 2025, available: true },
];

export const EbookSection = () => (
  <section className="bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-senac-orange" size={18} />
          <h2 className="font-black text-xs uppercase tracking-[0.2em] text-[#003366]">
            E-books Completos
          </h2>
        </div>
        <p className="text-xs text-gray-400 font-medium">
          Acesse os anuários completos de Educação Inovadora
        </p>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-3">
        {EBOOKS.map(({ year, available }) => (
          <div
            key={year}
            className={`relative rounded-xl md:rounded-2xl border transition-all ${
              available
                ? 'border-senac-blue/20 bg-blue-50/30 hover:border-senac-blue/40 hover:shadow-md hover:shadow-senac-blue/5'
                : 'border-gray-100 bg-gray-50/50'
            }
            flex flex-row md:flex-col items-center md:items-start gap-3 px-4 py-3 md:p-4`}
          >
            {!available && (
              <span className="hidden md:block absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full">
                Em breve
              </span>
            )}

            <div
              className={`shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${
                available ? 'bg-senac-blue text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {available ? <BookOpen size={16} /> : <Lock size={14} />}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-[10px] uppercase tracking-widest font-black leading-none mb-0.5 ${available ? 'text-gray-400' : 'text-gray-300'}`}>
                Edição
              </p>
              <p className={`text-xl md:text-2xl font-black leading-none ${available ? 'text-senac-blue' : 'text-gray-300'}`}>
                {year}
              </p>
            </div>

            {available ? (
              <a
                href={`/pdfs/praticas-inovadoras-${year}.pdf`}
                download={`ebook-praticas-inovadoras-${year}.pdf`}
                className="shrink-0 flex items-center gap-1.5 py-2 px-3 rounded-xl bg-senac-blue text-white text-xs font-bold hover:bg-[#003366] transition-colors shadow-sm shadow-senac-blue/20 md:w-full md:justify-center"
              >
                <Download size={12} />
                <span>Baixar PDF</span>
              </a>
            ) : (
              <div className="shrink-0 py-2 px-3 rounded-xl bg-gray-100 text-gray-300 text-xs font-bold text-center cursor-not-allowed md:w-full">
                Em breve
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);
