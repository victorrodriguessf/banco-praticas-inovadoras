import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { type Practice } from '../types';
import { printPracticePdf } from '../utils/pdfPrint';

const SummaryInfoBox = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gray-50 rounded-2xl p-4">
    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">
      {title}
    </p>
    <p className="font-bold text-gray-800 text-justify">
      {value || 'Não informado.'}
    </p>
  </div>
);

const SummaryBooleanBox = ({
  title,
  active,
}: {
  title: string;
  active: boolean;
}) => (
  <div className="rounded-2xl border border-gray-100 p-4">
    <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
      {title}
    </p>
    <p className={`font-black mt-1 ${active ? 'text-green-600' : 'text-gray-400'}`}>
      {active ? 'Sim' : 'Não'}
    </p>
  </div>
);

export const PracticeSummaryModal = ({
  practice,
  onClose,
}: {
  practice: Practice | null;
  onClose: () => void;
}) => {
  if (!practice) return null;

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

  const previewText =
    practice.learningSituation.length > 1200
      ? `${practice.learningSituation.slice(0, 1200).trim()}...`
      : practice.learningSituation;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          aria-label="Fechar resumo"
          onClick={onClose}
          className="absolute inset-0 cursor-default"
        />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-white/20"
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-senac-blue text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  {practice.year}
                </span>

                <span className="bg-senac-orange/10 text-senac-orange text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                  CEP {practice.unit}
                </span>
              </div>

              <h2 className="text-2xl font-black text-senac-blue leading-tight">
                {practice.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 rounded-full text-gray-400 hover:text-senac-blue hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SummaryInfoBox title="Docente" value={practice.instructor} />

              <SummaryInfoBox
                title="Orientação Pedagógica"
                value={practice.pedagogicalGuidance}
              />

              <div className="md:col-span-2">
                <SummaryInfoBox
                  title="Segmento / Curso"
                  value={practice.segment}
                />
              </div>
            </div>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Marcas formativas
              </h3>

              <div className="flex flex-wrap gap-2">
                {practice.formativeBrands.map((brand) => (
                  <span
                    key={`${practice.id}-${brand}`}
                    className="text-xs font-bold bg-senac-orange/10 text-senac-orange px-3 py-1.5 rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SummaryBooleanBox
                title="Aprendizagem Integradora"
                active={practice.integrativeLearning}
              />

              <SummaryBooleanBox
                title="Prática Inclusiva"
                active={practice.inclusivePractice}
              />

              <SummaryBooleanBox
                title="Fomento à Inclusão"
                active={practice.inclusionPromotionPractice}
              />
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Resumo da situação de aprendizagem
              </h3>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {previewText || 'Resumo não informado.'}
              </p>

              {practice.learningSituation.length > 1200 && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="mt-3 text-sm font-black text-senac-blue underline underline-offset-2 hover:text-senac-orange transition-colors"
                >
                  Visualizar no e-book ({practice.year})
                </button>
              )}
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-widest text-senac-blue mb-3">
                Elementos de competência
              </h3>

              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {practice.competencyElements || 'Não informado.'}
              </p>
            </section>

            <div className="bg-blue-50 rounded-2xl p-4 text-sm text-senac-blue font-bold">
              Páginas no e-book: {practice.pages.initial}
              {practice.pages.situation !== practice.pages.initial
                ? ` a ${practice.pages.situation}`
                : ''}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
