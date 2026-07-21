import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Lock, Mail, KeyRound, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import logoSenacLabs from '../logo_senac_labs.png';
import { senhaSchema, codigoSchema } from '../schemas/passwordSchema';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { OtpResendTimer } from '../components/OtpResendTimer';
import { asset } from '../utils/asset';

const emailSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
});

const resetSchema = z
  .object({
    codigo: codigoSchema.shape.codigo,
    novaSenha: senhaSchema,
    confirmarSenha: z.string().min(8, 'A confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmSenha, setShowConfirmSenha] = useState(false);
  const navigate = useNavigate();

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) });
  const novaSenhaDigitada = resetForm.watch('novaSenha');

  const onSubmitEmail = async (dados: EmailForm) => {
    setIsLoading(true);
    setError('');

    try {
      await fetch('http://localhost:3333/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      // A resposta da API é sempre genérica (não revela se o e-mail existe),
      // então sempre avançamos para o passo 2.
      setEmail(dados.email);
      setOtpResetKey((key) => key + 1);
      setStep(2);
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setError('');

    try {
      await fetch('http://localhost:3333/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setOtpResetKey((key) => key + 1);
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    }
  };

  const onSubmitReset = async (dados: ResetForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3333/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: dados.codigo, novaSenha: dados.novaSenha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        try {
          const subRes = await fetch('http://localhost:3333/submissoes/minhas', {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          if (subRes.ok) {
            const submissoes = await subRes.json();
            if (submissoes && submissoes.length > 0) {
              navigate('/minhas-submissoes');
              return;
            }
          }
        } catch (e) {
          // Ignore
        }

        navigate('/submissao');
      } else {
        setError(data.message || 'Não foi possível redefinir a senha.');
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
              Esqueci Minha Senha
            </h1>
            <p className="text-blue-200 mt-2 text-sm relative z-10">
              {step === 1
                ? 'Informe seu e-mail institucional para receber um código'
                : `Digite o código enviado para ${email} e defina uma nova senha`}
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
            <form key="step-1" onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  E-mail institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="docente@rn.senac.br"
                    {...emailForm.register('email')}
                    className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                      emailForm.formState.errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{emailForm.formState.errors.email.message}</p>
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
                    Enviando código...
                  </>
                ) : (
                  'Enviar código de recuperação'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                Lembrou a senha?{' '}
                <Link to="/login" className="text-[#003366] font-bold hover:underline">
                  Entrar
                </Link>
              </p>
            </form>
          ) : (
            <form key="step-2" onSubmit={resetForm.handleSubmit(onSubmitReset)} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Código de verificação
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    {...resetForm.register('codigo', {
                      onChange: (e) => {
                        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      },
                    })}
                    className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-4 text-sm tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                      resetForm.formState.errors.codigo ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </div>
                {resetForm.formState.errors.codigo && (
                  <p className="text-red-500 text-sm mt-1">{resetForm.formState.errors.codigo.message}</p>
                )}
                <OtpResendTimer ativo={step === 2} resetKey={otpResetKey} onReenviar={handleReenviarCodigo} />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Crie uma senha forte"
                    {...resetForm.register('novaSenha')}
                    className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                      resetForm.formState.errors.novaSenha ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(!showSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrengthMeter senha={novaSenhaDigitada ?? ''} />
                <p className="text-xs text-gray-400 mt-2">
                  Mínimo de 8 caracteres, devendo conter letras e pelo menos um número ou caractere especial.
                </p>
                {resetForm.formState.errors.novaSenha && (
                  <p className="text-red-500 text-sm mt-1">{resetForm.formState.errors.novaSenha.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showConfirmSenha ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    {...resetForm.register('confirmarSenha')}
                    className={`w-full bg-gray-50 border rounded-xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                      resetForm.formState.errors.confirmarSenha ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmSenha(!showConfirmSenha)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmarSenha && (
                  <p className="text-red-500 text-sm mt-1">{resetForm.formState.errors.confirmarSenha.message}</p>
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
                    Redefinindo...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-sm text-gray-500 hover:underline"
              >
                Voltar e corrigir o e-mail
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
