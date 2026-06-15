import { useState, useEffect, useRef } from 'react';
import { BookOpen, ExternalLink, Tag, User, Globe, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { ODS_DATA, type Practice } from '../types';
import { printPracticePdf } from '../utils/pdfPrint';

type PracticeCardProps = {
  practice: Practice;
  onReadSummary?: () => void;
  variant?: 'grid' | 'list';
};

const CLOSE_TOOLTIPS_EVENT = 'close-info-tooltips';

const InfoTooltip = ({ year, openUp = false }: { year: number; openUp?: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCloseAll = () => setOpen(false);
    document.addEventListener(CLOSE_TOOLTIPS_EVENT, handleCloseAll);
    return () => document.removeEventListener(CLOSE_TOOLTIPS_EVENT, handleCloseAll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) {
      document.dispatchEvent(new CustomEvent(CLOSE_TOOLTIPS_EVENT));
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        aria-label="Informação sobre publicação no e-book"
        onClick={handleClick}
        className={`p-0.5 rounded-full transition-colors cursor-pointer ${open ? 'text-senac-blue' : 'text-gray-300 hover:text-senac-blue'}`}
      >
        <Info size={14} />
      </button>

      {open && (
        <div className={`absolute right-0 ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-30 pointer-events-none`}>
          <div className={`absolute right-2 w-2.5 h-2.5 bg-senac-blue rotate-45 ${openUp ? '-bottom-[5px]' : '-top-[5px]'}`} />
          <div className="bg-senac-blue text-white text-[10px] font-semibold rounded-xl px-3 py-1.5 shadow-xl whitespace-nowrap">
            Prática publicada no E-book Educação Inovadora – {year}
          </div>
        </div>
      )}
    </div>
  );
};

export const PracticeCard = ({
  practice,
  onReadSummary,
  variant = 'grid',
}: PracticeCardProps) => {
  const handleDownloadPdf = () => {
    printPracticePdf({ year: practice.year, originalId: practice.originalId });
  };

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ backgroundColor: '#f9fafb' }}
        className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4 transition-colors duration-150"
      >
        {/* Year + Unit */}
        <div className="shrink-0 flex flex-col items-center gap-1.5 w-24 pt-0.5">
          <span className="bg-senac-blue text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-full text-center">
            {practice.year}
          </span>
          <span className="bg-senac-orange/10 text-senac-orange text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-full text-center leading-tight break-words">
            {practice.unit}
          </span>
        </div>

        {/* Main info */}
        <div className="flex-grow min-w-0">
          <h3 className="font-bold text-senac-blue leading-snug line-clamp-1 mb-1">
            {practice.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-1.5">
            <span className="flex items-center gap-1">
              <User size={10} className="text-senac-orange shrink-0" />
              {practice.instructor}
            </span>
            <span className="flex items-center gap-1 min-w-0">
              <Tag size={10} className="text-senac-orange shrink-0" />
              <span className="truncate">{practice.segment}</span>
            </span>
          </div>

          {practice.ods.length > 0 && (
            <div className="flex items-center gap-1 mb-1.5">
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

          {practice.learningSituation && (
            <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
              {practice.learningSituation}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-2 pt-0.5">
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

        {/* Info — canto inferior direito */}
        <div className="absolute bottom-2.5 right-3">
          <InfoTooltip year={practice.year} openUp />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: '0 8px 20px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
      }}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full transition-all duration-300"
    >
      {/* Info — canto superior direito, fora do fluxo dos ODS */}
      <div className="absolute top-3 right-3 z-10">
        <InfoTooltip year={practice.year} />
      </div>

      {/* Year + Unit + ODS — com padding direito para não encostar no i */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 pr-7">
        <span className="bg-senac-blue text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
          {practice.year}
        </span>
        <span className="bg-senac-orange/10 text-senac-orange text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
          {practice.unit}
        </span>
        {practice.ods.slice(0, 3).map((odsId) => {
          const ods = ODS_DATA[odsId];
          if (!ods) return null;
          return (
            <span
              key={odsId}
              style={{ backgroundColor: ods.color }}
              className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
            >
              <Globe size={9} />
              ODS {odsId}
            </span>
          );
        })}
        {practice.ods.length > 3 && (
          <span className="text-[9px] font-bold text-gray-400">
            +{practice.ods.length - 3}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-base text-senac-blue leading-tight mb-3 line-clamp-2">
        {practice.title}
      </h3>

      {/* Docente + Segmento */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <User size={12} className="text-senac-orange shrink-0" />
          <span className="truncate">{practice.instructor}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Tag size={12} className="text-senac-orange shrink-0" />
          <span className="truncate">{practice.segment}</span>
        </div>
      </div>

      {/* Resumo preview */}
      {practice.learningSituation && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 flex-grow">
          {practice.learningSituation}
        </p>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-50">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onReadSummary}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-xs hover:border-senac-blue hover:text-senac-blue hover:bg-gray-50 transition-all group"
          >
            <BookOpen size={13} className="group-hover:scale-110 transition-transform" />
            Resumo
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-senac-blue text-white font-bold text-xs hover:bg-senac-blue/90 shadow-md shadow-senac-blue/20 transition-all group"
          >
            <ExternalLink size={13} className="group-hover:scale-110 transition-transform" />
            Acessar prática
          </button>
        </div>
      </div>
    </motion.div>
  );
};
