import { useState } from 'react';
import { Menu, Send } from 'lucide-react';

export const Header = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-[#ffb84d] border-b border-orange-300 sticky top-0 z-50 shadow-md">
      <div
        id="header-inner"
        className="max-w-7xl mx-auto px-4 h-[116px] flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center">
            {!logoError ? (
              <img
                src="/logo_senac_labs.png"
                alt="Senac Labs"
                className="h-14 w-auto object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex flex-col -space-y-1">
                <span className="font-black text-2xl tracking-tighter text-[#004a8d]">
                  SENAC
                </span>
                <span className="font-bold text-xs tracking-[0.2em] text-[#004a8d] uppercase">
                  LABS RN
                </span>
              </div>
            )}
          </a>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors">
            Início
          </a>
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors">
            Sobre
          </a>
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors">
            Edital
          </a>
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#004a8d] border-b-2 border-[#004a8d] pb-1 transition-colors">
            Práticas
          </a>
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors">
            E-books
          </a>
          <a href="#" className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors">
            Contato
          </a>
        </nav>

        {/* CTA — desktop */}
        <a
          href="https://labs.rn.senac.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex flex-col items-center gap-1 group"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-[#003366]/60 group-hover:text-[#003366] transition-colors">
            Exclusivo para docentes do Senac RN
          </span>
          <span className="flex items-center gap-2 bg-[#003366] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border-2 border-[#003366] hover:bg-white hover:text-[#003366] transition-all shadow-md">
            <Send size={13} />
            Submeta sua prática
          </span>
        </a>

        <button
          type="button"
          onClick={onOpenMenu}
          className="lg:hidden p-2 text-[#003366] hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={32} />
        </button>
      </div>
    </header>
  );
};
