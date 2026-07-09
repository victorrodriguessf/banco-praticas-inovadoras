import { useEffect, useRef, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const SEARCH_PLACEHOLDER =
  'Buscar por título, docente, metodologia ou tecnologia.';

export const Hero = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) => {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState<number>();
  const reduceMotion = useReducedMotion();
  const compact = searchQuery.trim().length > 0;

  useEffect(() => {
    if (measureRef.current) {
      setInputWidth(measureRef.current.offsetWidth);
    }
  }, []);

  return (
  <section
    className={`bg-hero-navy px-4 relative overflow-hidden transition-[padding] duration-300 ease-in-out ${
      compact ? 'py-6 md:py-8' : 'py-20 md:py-28'
    }`}
  >
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1
          className={`font-black tracking-tight text-white transition-all duration-300 ease-in-out ${
            compact ? 'text-xl md:text-2xl' : 'text-4xl md:text-5xl'
          }`}
        >
          BANCO DE PRÁTICAS{!compact && <br />}{' '}
          <span className="text-senac-orange">EDUCAÇÃO INOVADORA</span>
        </h1>

        <motion.div
          initial={false}
          animate={{
            height: compact ? 0 : 'auto',
            opacity: compact ? 0 : 1,
            marginTop: compact ? 0 : 16,
          }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }
          }
          className="overflow-hidden"
        >
          <p className="text-white/90 font-medium max-w-2xl mx-auto">
            Explore, inspire-se e replique práticas pedagógicas dos docentes do
            Senac RN, selecionadas pelo edital Educação Inovadora, validadas por
            banca avaliadora e publicadas no e-book do programa.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`relative w-full flex justify-center px-4 md:px-0 transition-all duration-300 ease-in-out ${
          compact ? 'mt-4' : 'mt-8'
        }`}
      >
        <div className="inline-flex max-w-full items-center gap-3 bg-white rounded-full shadow-md shadow-black/10 h-14 px-5 focus-within:ring-4 focus-within:ring-white/20 transition-all">
          <Search className="text-gray-400 shrink-0" size={22} />

          {/* Span invisível só para medir a largura exata do placeholder */}
          <span
            ref={measureRef}
            aria-hidden="true"
            className="absolute invisible whitespace-pre text-lg font-medium"
          >
            {SEARCH_PLACEHOLDER}
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            style={inputWidth ? { width: inputWidth } : undefined}
            className="min-w-0 max-w-full h-full outline-none text-gray-800 placeholder:text-gray-400 text-lg font-medium bg-transparent text-left"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 shrink-0"
            >
              <ChevronRight className="rotate-45" size={20} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  </section>
  );
};
