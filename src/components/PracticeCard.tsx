import { BookOpen, Download, MapPin, User, Tag, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { ODS_DATA, type Practice } from '../types';
import { printPracticePdf } from '../utils/pdfPrint';

type PracticeCardProps = {
  practice: Practice;
  onReadSummary?: () => void;
  variant?: 'grid' | 'list';
};

export const PracticeCard = ({
  practice,
  onReadSummary,
  variant = 'grid',
}: PracticeCardProps) => {
  const handleDownloadPdf = () => {
    printPracticePdf({
      year: practice.year,
      originalId: practice.originalId,
    });
  };

  if (variant === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        whileHover={{ backgroundColor: '#fafafa' }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-5 transition-colors duration-200"
      >
        {/* Year + Unit */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 w-[4.5rem]">
          <span className="bg-senac-blue text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-full text-center">
            {practice.year}
          </span>
          <span className="bg-senac-orange/10 text-senac-orange text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-full text-center truncate">
            {practice.unit}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-senac-blue leading-snug line-clamp-1 mb-1">
            {practice.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User size={11} className="text-senac-orange shrink-0" />
              {practice.instructor}
            </span>
            <span className="flex items-center gap-1 min-w-0">
              <Tag size={11} className="text-senac-orange shrink-0" />
              <span className="truncate">{practice.segment}</span>
            </span>
          </div>

          {practice.ods.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {practice.ods.slice(0, 4).map((odsId) => {
                const ods = ODS_DATA[odsId];
                if (!ods) return null;
                return (
                  <span
                    key={odsId}
                    style={{ backgroundColor: ods.color }}
                    className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full"
                  >
                    ODS {odsId}
                  </span>
                );
              })}
              {practice.ods.length > 4 && (
                <span className="text-[9px] font-bold text-gray-400">
                  +{practice.ods.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={onReadSummary}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-xs hover:border-senac-blue hover:text-senac-blue hover:bg-gray-50 transition-all"
          >
            <BookOpen size={13} />
            <span className="hidden lg:inline">Resumo</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-senac-blue text-white font-bold text-xs hover:bg-senac-blue/90 shadow-md shadow-senac-blue/20 transition-all"
          >
            <Download size={13} />
            <span className="hidden lg:inline">E-book</span>
          </button>
        </div>
      </motion.div>
    );
  }

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
