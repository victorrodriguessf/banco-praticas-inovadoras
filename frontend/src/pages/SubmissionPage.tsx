import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  LogOut,
  CheckCircle,
  Plus,
  X,
  Loader2,
  AlertCircle,
  UploadCloud,
} from 'lucide-react';
import logoSenacLabs from '../logo_senac_labs.png';
import { submissionSchema, type SubmissionFormData } from '../schemas/submissionSchema';
import { UNIDADES, SEGMENTOS, CATEGORIAS, MARCAS_FORMATIVAS } from '../data/formOptions';
import { ODS_DATA } from '../types';

const API_URL = 'http://localhost:3333';

type Edital = {
  id: string;
  nome: string;
  status: string;
};

function TagInput({
  label,
  values,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft('');
  };

  return (
    <div>
      <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          className={`flex-1 bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
            error ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        <button
          type="button"
          onClick={addTag}
          className="bg-[#003366] text-white rounded-xl px-4 hover:bg-[#002244] transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="inline-flex items-center gap-2 bg-blue-50 text-[#003366] text-xs font-bold px-3 py-1.5 rounded-full"
            >
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  error,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}) {
  const toggle = (option: string) => {
    onChange(
      values.includes(option) ? values.filter((v) => v !== option) : [...values, option]
    );
  };

  return (
    <div>
      <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
        {label}
      </label>
      <div className={`flex flex-wrap gap-2 p-3 rounded-xl border ${error ? 'border-red-500' : 'border-gray-200'} bg-gray-50`}>
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg cursor-pointer border transition-colors ${
              values.includes(option)
                ? 'bg-[#003366] text-white border-[#003366]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#ffb84d]'
            }`}
          >
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => toggle(option)}
              className="hidden"
            />
            {option}
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default function SubmissionPage() {
  const navigate = useNavigate();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      autores: [],
      unidades: [],
      segmentos: [],
      cursos: [],
      ods: [],
      marcasFormativas: [],
      anexos: [],
    },
  });

  const autores = watch('autores');
  const unidades = watch('unidades');
  const segmentos = watch('segmentos');
  const cursos = watch('cursos');
  const ods = watch('ods');
  const marcasFormativas = watch('marcasFormativas');
  const anexos = watch('anexos');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/editais/ativos`)
      .then((res) => res.json())
      .then(setEditais)
      .catch(() => setEditais([]));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const token = localStorage.getItem('token');
    setUploading(true);
    setSubmitError('');

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('arquivo', file);

        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Falha ao enviar um dos arquivos');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      setValue('anexos', [...anexos, ...uploadedUrls], { shouldValidate: true });
    } catch (err) {
      setSubmitError('Erro ao enviar evidências. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    setSubmitError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/submissoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setSubmitError(errorData.message || 'Erro ao enviar submissão.');
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError('Erro de conexão com o servidor.');
    }
  };

  if (submitted) {
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
              Submissão enviada!
            </h1>

            <p className="text-gray-500 mb-8 leading-relaxed">
              Sua prática foi recebida e entrará em análise pela equipe do programa.
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

      <main className="flex-grow flex justify-center p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100"
        >
          <div className="bg-[#003366] p-8 text-center">
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              Submeter Prática Inovadora
            </h1>
            <p className="text-blue-200 mt-2 text-sm">
              Preencha os dados da prática para submissão ao edital
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {submitError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3 border border-red-100">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                Título da prática
              </label>
              <input
                type="text"
                placeholder="Ex: Ecoponto Sustentável"
                {...register('titulo')}
                className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                  errors.titulo ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                Edital
              </label>
              <select
                {...register('editalId')}
                className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                  errors.editalId ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Selecione um edital</option>
                {editais.map((edital) => (
                  <option key={edital.id} value={edital.id}>
                    {edital.nome}
                  </option>
                ))}
              </select>
              {errors.editalId && <p className="text-red-500 text-sm mt-1">{errors.editalId.message}</p>}
            </div>

            <TagInput
              label="Autores"
              values={autores}
              onChange={(values) => setValue('autores', values, { shouldValidate: true })}
              error={errors.autores?.message}
              placeholder="Nome do autor e Enter"
            />

            <CheckboxGroup
              label="Unidades"
              options={UNIDADES}
              values={unidades}
              onChange={(values) => setValue('unidades', values, { shouldValidate: true })}
              error={errors.unidades?.message}
            />

            <CheckboxGroup
              label="Segmentos"
              options={SEGMENTOS}
              values={segmentos}
              onChange={(values) => setValue('segmentos', values, { shouldValidate: true })}
              error={errors.segmentos?.message}
            />

            <TagInput
              label="Cursos"
              values={cursos}
              onChange={(values) => setValue('cursos', values, { shouldValidate: true })}
              error={errors.cursos?.message}
              placeholder="Nome do curso e Enter"
            />

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                Categoria
              </label>
              <select
                {...register('categoria')}
                className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                  errors.categoria ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              {errors.categoria && <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                Descrição
              </label>
              <textarea
                rows={5}
                placeholder="Descreva a prática, seus objetivos e resultados"
                {...register('descricao')}
                className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffb84d] focus:border-transparent transition-all ${
                  errors.descricao ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                ODS relacionados
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(ODS_DATA).map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg cursor-pointer border transition-colors ${
                      ods.includes(item.id)
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#ffb84d]'
                    }`}
                    style={ods.includes(item.id) ? { backgroundColor: item.color } : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={ods.includes(item.id)}
                      onChange={() =>
                        setValue(
                          'ods',
                          ods.includes(item.id) ? ods.filter((n) => n !== item.id) : [...ods, item.id],
                          { shouldValidate: true }
                        )
                      }
                      className="hidden"
                    />
                    {item.id}. {item.label}
                  </label>
                ))}
              </div>
            </div>

            <CheckboxGroup
              label="Marcas formativas"
              options={MARCAS_FORMATIVAS}
              values={marcasFormativas}
              onChange={(values) => setValue('marcasFormativas', values, { shouldValidate: true })}
            />

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                Evidências (imagens)
              </label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-8 cursor-pointer hover:border-[#ffb84d] transition-colors">
                <UploadCloud className="text-gray-400" size={28} />
                <span className="text-sm text-gray-500">
                  {uploading ? 'Enviando...' : 'Clique para subir imagens/evidências'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </label>
              {anexos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {anexos.map((url, index) => (
                    <span
                      key={url}
                      className="inline-flex items-center gap-2 bg-blue-50 text-[#003366] text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      Evidência {index + 1}
                      <button
                        type="button"
                        onClick={() => setValue('anexos', anexos.filter((_, i) => i !== index), { shouldValidate: true })}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('termosAceitos')}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  Declaro que as informações prestadas são verdadeiras e aceito os termos de uso e cessão de imagem.
                </span>
              </label>
              {errors.termosAceitos && (
                <p className="text-red-500 text-sm mt-1">{errors.termosAceitos.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full bg-[#ffb84d] hover:bg-[#ffa31a] text-[#003366] font-black uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                'Enviar submissão'
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
