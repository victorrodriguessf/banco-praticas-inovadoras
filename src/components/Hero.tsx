import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

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
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#003366]">
          BANCO DE PRÁTICAS{' '} <br></br>
          <span className="text-senac-orange">EDUCAÇÃO INOVADORA</span>
        </h1>

        <p className="text-gray-500 font-medium max-w-2xl mx-auto">
          Explore, inspire-se e replique práticas pedagógicas dos docentes do
          Senac RN, selecionadas pelo edital Educação Inovadora, validadas por
          banca avaliadora e publicadas no e-book do programa.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative max-w-xl mx-auto"
      >
        <div className="flex bg-white rounded-2xl shadow-xl shadow-blue-900/5 overflow-hidden p-2 border border-blue-50 focus-within:ring-4 focus-within:ring-senac-blue/5 transition-all">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="text-gray-400" size={24} />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, docente, metodologia ou tecnologia."
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

        </div>
      </motion.div>
    </div>
  </section>
);
