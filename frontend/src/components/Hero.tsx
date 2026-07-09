import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const Hero = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) => (
  <section className="bg-hero-navy py-20 md:py-28 px-4 relative overflow-hidden">
    <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          BANCO DE PRÁTICAS{' '} <br></br>
          <span className="text-senac-orange">EDUCAÇÃO INOVADORA</span>
        </h1>

        <p className="text-white/90 font-medium max-w-2xl mx-auto">
          Explore, inspire-se e replique práticas pedagógicas dos docentes do
          Senac RN, selecionadas pelo edital Educação Inovadora, validadas por
          banca avaliadora e publicadas no e-book do programa.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full flex justify-center px-4 md:px-0"
      >
        <div className="inline-flex max-w-full items-center gap-3 bg-white rounded-full shadow-md shadow-black/10 h-14 px-5 focus-within:ring-4 focus-within:ring-white/20 transition-all">
          <Search className="text-gray-400 shrink-0" size={22} />

          <input
            type="text"
            size={54}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, docente, metodologia ou tecnologia."
            className={`min-w-0 h-full outline-none text-gray-800 placeholder:text-gray-400 text-lg font-medium bg-transparent ${
              searchQuery ? 'text-left' : 'text-center'
            }`}
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
