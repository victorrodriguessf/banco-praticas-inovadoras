import { BookOpen, ExternalLink, MapPin, User, Tag, Globe } from 'lucide-react';
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
        whileHover={{ backgroundColor: '#f9fafb' }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-5 transition-colors duration-150"
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
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
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
              <ExternalLink size={13} />
              <span className="hidden lg:inline">Acessar prática</span>
            </button>
          </div>
          <span className="text-[9px] font-medium text-gray-400 hidden lg:block">
            Recorte · E-book {practice.year}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow:
          '0 8px 20px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
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

      <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onReadSummary}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-xs hover:border-senac-blue hover:text-senac-blue hover:bg-gray-50 transition-all group"
          >
            <BookOpen
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
            Resumo
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-senac-blue text-white font-bold text-xs hover:bg-senac-blue/90 shadow-md shadow-senac-blue/20 transition-all group"
          >
            <ExternalLink
              size={14}
              className="group-hover:scale-110 transition-transform"
            />
            Acessar prática
          </button>
        </div>

        <p className="text-[10px] text-gray-400 font-medium text-center">
          Recorte do E-book Educação Inovadora – {practice.year}
        </p>
      </div>
    </motion.div>
  );
};
