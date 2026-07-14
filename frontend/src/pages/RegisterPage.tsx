import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, User, Lock, Mail, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import logoSenacLabs from '../logo_senac_labs.png';

const DOMINIO_INSTITUCIONAL = '@rn.senac.br';

const dadosSchema = z.object({
  nome: z.string().min(3, 'Informe seu nome completo'),
  email: z
    .string()
    .email('Informe um e-mail válido')
    .refine((value) => value.endsWith(DOMINIO_INSTITUCIONAL), {
      message: `Utilize seu e-mail institucional (${DOMINIO_INSTITUCIONAL})`,
    }),
  senha: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

const codigoSchema = z.object({
  codigo: z
    .string()
    .length(6, 'O código tem 6 dígitos')
    .regex(/^\d{6}$/, 'O código deve conter apenas números'),
});

type DadosForm = z.infer<typeof dadosSchema>;
type CodigoForm = z.infer<typeof codigoSchema>;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const dadosForm = useForm<DadosForm>({ resolver: zodResolver(dadosSchema) });
  const codigoForm = useForm<CodigoForm>({ resolver: zodResolver(codigoSchema) });

  const onSubmitDados = async (dados: DadosForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3333/auth/register/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const data = await response.json();

      if (response.ok) {
        setEmail(dados.email);
        setStep(2);
      } else {
        setError(data.message || 'Erro ao solicitar cadastro.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCodigo = async (dados: CodigoForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3333/auth/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: dados.codigo }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/submissao');
      } else {
        setError(data.message || 'Código inválido.');
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
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/diagonal_pattern.svg')] opacity-10"></div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider relative z-10">
              Criar Conta
            </h1>
            <p className="text-blue-200 mt-2 text-sm relative z-10">
              {step === 1
                ? 'Cadastre-se com seu e-mail institucional'
                : `Digite o código enviado para ${email}`}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-4 mx-8 mt-6 rounded-xl text-sm font-medium flex items-start gap-3 border border-red-100"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={dadosForm.handleSubmit(onSubmitDados)} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      {...dadosForm.register('nome')}
                      className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                        dadosForm.formState.errors.nome ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {dadosForm.formState.errors.nome && (
                    <p className="text-red-500 text-sm mt-1">{dadosForm.formState.errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                    E-mail institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="docente@rn.senac.br"
                      {...dadosForm.register('email')}
                      className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                        dadosForm.formState.errors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {dadosForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{dadosForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      placeholder="Crie uma senha"
                      {...dadosForm.register('senha')}
                      className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                        dadosForm.formState.errors.senha ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {dadosForm.formState.errors.senha && (
                    <p className="text-red-500 text-sm mt-1">{dadosForm.formState.errors.senha.message}</p>
                  )}
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
                    Enviando código...
                  </>
                ) : (
                  'Enviar código de verificação'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-[#003366] font-bold hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={codigoForm.handleSubmit(onSubmitCodigo)} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Código de verificação
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    {...codigoForm.register('codigo')}
                    className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                      codigoForm.formState.errors.codigo ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {codigoForm.formState.errors.codigo && (
                  <p className="text-red-500 text-sm mt-1">{codigoForm.formState.errors.codigo.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ffb84d] hover:bg-[#ffa31a] text-[#003366] font-black uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Verificando...
                  </>
                ) : (
                  'Confirmar cadastro'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-500 hover:underline"
              >
                Voltar e corrigir dados
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
