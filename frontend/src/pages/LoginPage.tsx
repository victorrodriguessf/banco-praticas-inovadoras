import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import logoSenacLabs from '../logo_senac_labs.png';
import { asset } from '../utils/asset';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3333/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        try {
          const subRes = await fetch('http://localhost:3333/submissoes/minhas', {
            headers: { Authorization: `Bearer ${data.token}` }
          });
          if (subRes.ok) {
            const submissoes = await subRes.json();
            if (submissoes && submissoes.length > 0) {
              navigate('/minhas-submissoes');
              return;
            }
          }
        } catch (e) {
          // Ignore and just navigate to /submissao
        }

        navigate('/submissao');
      } else {
        setError(data.message || 'Erro ao realizar login.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <header className="bg-[#ffb84d] border-b border-orange-300 p-4 shadow-sm flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[#003366] hover:bg-white/20 p-2 rounded-lg transition-colors font-bold text-sm">
          <ArrowLeft size={18} />
          Voltar ao Início
        </Link>
        <img src={logoSenacLabs} alt="Senac Labs" className="h-10 object-contain" />
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div className="bg-[#003366] p-8 text-center relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-full opacity-10"
              style={{ backgroundImage: `url(${asset('diagonal_pattern.svg')})` }}
            ></div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider relative z-10">
              Acesso Docente
            </h1>
            <p className="text-blue-200 mt-2 text-sm relative z-10">
              Autentique-se para submeter sua prática inovadora
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border border-red-100"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  E-mail institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="docente@senac.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    required
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-right mt-2">
                  <Link to="/esqueci-senha" className="text-xs text-gray-500 hover:text-[#003366] hover:underline">
                    Esqueci minha senha
                  </Link>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ffb84d] hover:bg-[#ffa31a] text-[#003366] font-black uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Autenticando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
          
          <div className="p-6 bg-gray-50 text-center border-t border-gray-100 space-y-3">
            <p className="text-sm text-gray-500">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="text-[#003366] font-bold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
