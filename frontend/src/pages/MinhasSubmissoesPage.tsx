import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, Plus, FileText, ArrowLeft, Clock } from 'lucide-react';
import logoSenacLabs from '../logo_senac_labs.png';

const API_URL = 'http://localhost:3333';

type SubmissaoResumo = {
  id: string;
  titulo: string;
  status: string;
  criadaEm: string;
};

export default function MinhasSubmissoesPage() {
  const navigate = useNavigate();
  const [submissoes, setSubmissoes] = useState<SubmissaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissoes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_URL}/submissoes/minhas`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          navigate('/login');
          return;
        }

        if (!res.ok) {
          setError('Erro ao carregar submissões.');
          return;
        }

        const data = await res.json();
        setSubmissoes(data);
      } catch (err) {
        setError('Erro de conexão.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissoes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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

      <main className="flex-grow flex flex-col items-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#003366] uppercase tracking-tighter">
                Minhas Submissões
              </h1>
              <p className="text-gray-500 mt-1">Acompanhe o status das práticas que você já enviou.</p>
            </div>
            
            <Link
              to="/submissao"
              className="flex items-center gap-2 bg-[#003366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#002244] transition-all active:scale-95 shadow-md"
            >
              <Plus size={20} />
              Nova Submissão
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Carregando...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : submissoes.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <h2 className="text-xl font-bold text-gray-700 mb-2">Nenhuma submissão encontrada</h2>
              <p className="text-gray-500 mb-6">Você ainda não enviou nenhuma prática inovadora.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {submissoes.map(sub => (
                <div key={sub.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#003366] mb-1">{sub.titulo}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      Enviada em {new Date(sub.criadaEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold border border-amber-200 whitespace-nowrap">
                    {sub.status === 'recebida' ? 'Aguardando avaliação' : sub.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
