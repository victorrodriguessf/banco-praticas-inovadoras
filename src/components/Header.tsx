import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Send } from 'lucide-react';

const navEntries = [
  { label: 'Início', href: 'https://labs.rn.senac.br/' },
  { label: 'EDUTECH', href: 'https://labs.rn.senac.br/edutech/' },
  { label: 'CODE', href: 'https://labs.rn.senac.br/code/' },
  { label: 'PERTENSER', href: 'https://labs.rn.senac.br/pertenser/' },
  { label: 'Banco de Práticas', href: 'https://banco-praticas-inovadoras.vercel.app/' },
  { label: 'Docentes', href: 'https://labs.rn.senac.br/docentes-destaques/' },
  { label: 'Aconteceu', href: 'https://labs.rn.senac.br/aconteceu/' },
];

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

        <nav className="hidden lg:flex items-center">
          {navEntries.map((entry, i) => (
            <div key={entry.label} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="h-4 w-px border-l border-dotted border-[#7A7A7A] mx-4"
                />
              )}
              <a
                href={entry.href}
                className="font-bold text-sm text-[#2F3973] hover:text-[#B97919] transition-colors whitespace-nowrap"
              >
                {entry.label}
              </a>
            </div>
          ))}
        </nav>

        {/* CTA — desktop */}
        <Link
          to="/login"
          className="hidden lg:flex flex-col items-center gap-1 group"
        >
          <span className="text-[9px] font-black uppercase tracking-widest text-[#003366]/60 group-hover:text-[#003366] transition-colors">
            Exclusivo para docentes do Senac RN
          </span>
          <span className="flex items-center gap-2 bg-[#003366] text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl border-2 border-[#003366] hover:bg-white hover:text-[#003366] transition-all shadow-md">
            <Send size={13} />
            Submeta sua prática
          </span>
        </Link>

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
