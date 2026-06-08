import { BookOpen, Download, MapPin, User, Tag, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { ODS_DATA, type Practice } from '../types';
import { printPracticePdf } from '../utils/pdfPrint';

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
            Docente:{' '}
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
          Visualizar no e-book
        </button>
      </div>
    </motion.div>
  );
};
