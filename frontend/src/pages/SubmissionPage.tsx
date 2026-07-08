import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import logoSenacLabs from '../logo_senac_labs.png';

export default function SubmissionPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <header className="bg-[#ffb84d] border-b border-orange-300 p-4 shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[#003366] hover:bg-white/20 p-2 rounded-lg transition-colors font-bold text-sm">
          <ArrowLeft size={18} />
          Voltar ao Início
        </Link>
        <img src={logoSenacLabs} alt="Senac Labs" className="h-10 object-contain" />
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-[#003366] hover:bg-white/20 p-2 rounded-lg transition-colors font-bold text-sm"
        >
          Sair
          <LogOut size={18} />
        </button>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-10 text-center border border-gray-100"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          
          <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter mb-4">
            Autenticado com sucesso!
          </h1>
          
          <p className="text-gray-500 mb-8 leading-relaxed">
            Você está logado. O formulário de submissões estará disponível na <strong>próxima sprint</strong>.
          </p>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#002244] text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            Retornar à página inicial
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
