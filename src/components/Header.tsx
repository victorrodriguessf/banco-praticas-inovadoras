import { useState } from 'react';
import { Menu } from 'lucide-react';

export const Header = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-[#ffb84d] border-b border-orange-300 sticky top-0 z-50 shadow-md">
      <div
        id="header-inner"
        className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between"
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
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Início
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Sobre
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Edital
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#004a8d] border-b-2 border-[#004a8d] pb-1 transition-colors"
          >
            Práticas
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            E-books
          </a>
          <a
            href="#"
            className="font-extrabold text-sm uppercase tracking-widest text-[#003366] hover:text-white transition-colors"
          >
            Contato
          </a>
        </nav>

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
