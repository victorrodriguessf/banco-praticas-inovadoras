import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
import { UNIDADES, SEGMENTOS, MAX_DESCRICAO_LENGTH } from '../data/formOptions';
import {
  CATEGORIAS,
  PROTAGONISMO_ESTUDANTE_ITENS,
  PRATICA_INCLUSIVA_ITENS,
} from '../data/autoavaliacaoOptions';
import { ODS_DATA } from '../types';

const API_URL = 'http://localhost:3333';

// Espelha exatamente o que o backend aceita (uploadController.ts: MIMES_PERMITIDOS)
// — evita o usuário escolher um formato que só vai ser rejeitado depois do upload.
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_ANEXOS = 3;

type Edital = {
  id: string;
  nome: string;
  status: string;
};

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function TagInput({
  label,
  values,
  onChange,
  error,
  placeholder,
  hint,
  required,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  placeholder: string;
  hint?: string;
  required?: boolean;
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
        {required && <RequiredMark />}
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
          className={`flex-1 bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all hover:border-[#003366]/30 ${
            error ? 'border-red-300' : 'border-gray-200'
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
      {hint && !error && <p className="text-gray-400 text-xs mt-1.5">{hint}</p>}
      {error && (
        <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  error,
  hint,
  required,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  hint?: string;
  required?: boolean;
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
        {required && <RequiredMark />}
      </label>
      <div className={`flex flex-wrap gap-2 p-3 rounded-xl border ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-gray-50'}`}>
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg cursor-pointer border transition-all ${
              values.includes(option)
                ? 'bg-[#003366] text-white border-[#003366] shadow-md'
                : 'bg-white/80 text-gray-600 border-gray-200 hover:border-[#003366]/30 hover:bg-white'
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
      {hint && !error && <p className="text-gray-400 text-xs mt-1.5">{hint}</p>}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Grupo de checkboxes para os critérios do Quadro 2 do edital (itens com
// id + rótulo longo — layout em lista vertical, diferente do CheckboxGroup
// de pills usado para Unidades/Segmentos).
function CriterioCheckboxGroup({
  title,
  options,
  values,
  onChange,
}: {
  title: string;
  options: readonly { id: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h4 className="font-bold text-sm text-[#003366] mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer hover:text-[#003366] transition-colors"
          >
            <input
              type="checkbox"
              checked={values.includes(option.id)}
              onChange={() => toggle(option.id)}
              className="mt-0.5 shrink-0"
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}

// Critério booleano simples (usado pela maioria dos critérios de
// autoavaliação — ver "2) Alinhamento com o Modelo Pedagógico do Senac")
function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#003366]/30 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="shrink-0"
      />
      <div>
        <h4 className={`font-bold text-sm text-[#003366] ${description ? 'mb-1' : ''}`}>{title}</h4>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
    </label>
  );
}

export default function SubmissionPage() {
  const navigate = useNavigate();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
      // ODS 4 (Educação de Qualidade) vem marcado por padrão e travado — ver Task 5
      ods: [4],
      categoria: '',
      descricao: '',
      autoavaliacao: {
        contextualizacaoRealidade: false,
        aprendizagemIntegradora: false,
        protagonismoEstudante: [],
        visaoCritica: false,
        autonomiaDigital: false,
        colaboracaoComunicacao: false,
        atitudeSustentavel: false,
        criatividadeEmpreendedora: false,
        praticaInclusiva: [],
        impactoSocial: false,
      },
      anexos: [],
    },
  });

  const autores = watch('autores');
  const unidades = watch('unidades');
  const segmentos = watch('segmentos');
  const cursos = watch('cursos');
  const ods = watch('ods');
  const categoria = watch('categoria');
  const autoavaliacao = watch('autoavaliacao');
  const anexos = watch('anexos');
  const descricao = watch('descricao');

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

  // Pré-seleciona o edital assim que a lista (e as <option> correspondentes)
  // já estiverem renderizadas — fazer isso no mesmo tick do fetch falha
  // silenciosamente, porque o <select> ainda não teria a <option> no DOM.
  // O endpoint já retorna só editais em andamento, então usamos o primeiro
  // (na prática, sempre há apenas um edital ativo por vez).
  useEffect(() => {
    if (editais.length > 0) {
      setValue('editalId', editais[0].id, { shouldValidate: true });
    }
  }, [editais, setValue]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (anexos.length + files.length > MAX_ANEXOS) {
      setSubmitError(`Você pode anexar no máximo ${MAX_ANEXOS} evidências.`);
      return;
    }

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
              Prática inovadora submetida com sucesso!
            </h1>

            <p className="text-gray-500 mb-8 leading-relaxed">
              Sua prática foi recebida e entrará em análise pela equipe do programa.
            </p>

            <Link
              to="/minhas-submissoes"
              className="inline-flex items-center justify-center gap-2 bg-[#003366] hover:bg-[#002244] text-white font-black uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg transition-all"
            >
              Ver minhas submissões
            </Link>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-orange-100 flex flex-col font-sans">
      <header className="bg-[#ffb84d] border-b border-orange-300 p-4 flex items-center justify-between">
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
          className="bg-white/40 rounded-3xl shadow-xl shadow-blue-900/10 w-full max-w-3xl overflow-hidden"
        >
          <div className="bg-[#003366] p-8 text-center">
            <h1 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
              Submeter Prática Inovadora
            </h1>
            <p className="text-blue-100 mt-2 text-sm font-medium">
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

            <section className="space-y-4">
              <div className="pt-2">
                <h3 className="text-lg font-black text-[#003366] uppercase tracking-tight mb-1">
                  Dados de Identificação da Prática
                </h3>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Sua prática irá concorrer a qual categoria?
                  <RequiredMark />
                </label>
                <div className="space-y-2">
                  {CATEGORIAS.map((cat) => (
                    <label
                      key={cat.id}
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        categoria === cat.titulo
                          ? 'border-[#003366] bg-[#003366]/5 shadow-md'
                          : 'border-gray-200 bg-white hover:border-[#003366]/30'
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={categoria === cat.titulo}
                        onChange={() => setValue('categoria', cat.titulo, { shouldValidate: true })}
                      />
                      <span className="block font-bold text-sm text-[#003366]">{cat.titulo}</span>
                      <span className="block text-sm text-gray-500 mt-1">{cat.descricao}</span>
                    </label>
                  ))}
                </div>
                {errors.categoria && (
                  <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    {errors.categoria.message}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Título da prática
                  <RequiredMark />
                </label>
                <input
                  type="text"
                  placeholder="Ex: Ecoponto Sustentável"
                  {...register('titulo')}
                  className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all hover:border-[#003366]/30 ${
                    errors.titulo ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                {errors.titulo && (
                  <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    {errors.titulo.message}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Edital
                  <RequiredMark />
                </label>
                <select
                  {...register('editalId')}
                  disabled
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 text-sm opacity-70 cursor-not-allowed"
                >
                  <option value="">Selecione um edital</option>
                  {editais.map((edital) => (
                    <option key={edital.id} value={edital.id}>
                      {edital.nome}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-xs mt-1.5">
                  Edital atual — selecionado automaticamente
                </p>
                {errors.editalId && (
                  <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    {errors.editalId.message}
                  </div>
                )}
              </div>

              <TagInput
                label="Autores"
                required
                values={autores}
                onChange={(values) => setValue('autores', values, { shouldValidate: true })}
                error={errors.autores?.message}
                placeholder="Digite o nome do autor"
                hint="Pressione Enter ou clique no + para adicionar à lista"
              />

              <CheckboxGroup
                label="Unidades"
                required
                options={UNIDADES}
                values={unidades}
                onChange={(values) => setValue('unidades', values, { shouldValidate: true })}
                error={errors.unidades?.message}
              />

              <CheckboxGroup
                label="Segmentos/Eixos:"
                options={SEGMENTOS}
                values={segmentos}
                onChange={(values) => setValue('segmentos', values, { shouldValidate: true })}
                error={errors.segmentos?.message}
                hint="Selecione um ou mais segmentos, se for o caso"
              />

              <TagInput
                label="Cursos"
                values={cursos}
                onChange={(values) => setValue('cursos', values, { shouldValidate: true })}
                error={errors.cursos?.message}
                placeholder="Digite o nome do curso"
                hint="Pressione Enter ou clique no + para adicionar à lista"
              />
            </section>

            <section className="space-y-4">
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-black text-[#003366] uppercase tracking-tight mb-1">
                  Relato da Prática
                </h3>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Situação de aprendizagem
                  <RequiredMark />
                </label>
                <textarea
                  rows={5}
                  maxLength={MAX_DESCRICAO_LENGTH}
                  placeholder="Descreva sua prática inovadora de forma que evidencie como todos os critérios do edital foram utilizados; Os critérios só irão pontuar se estiverem descritos nesse campo e/ou através das evidências anexadas."
                  {...register('descricao')}
                  className={`w-full bg-gray-50 border rounded-xl py-3 px-4 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all hover:border-[#003366]/30 ${
                    errors.descricao ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {(descricao ?? '').length} / {MAX_DESCRICAO_LENGTH} caracteres
                </p>
                {errors.descricao && (
                  <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    {errors.descricao.message}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2 tracking-widest">
                  Evidências (imagens)
                  <RequiredMark />
                </label>
                <p className="text-gray-400 text-xs mb-2">
                  Formatos aceitos: JPG, PNG, WEBP ou GIF — até {MAX_ANEXOS} imagens, 5 MB cada
                </p>
                {anexos.length < MAX_ANEXOS ? (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!uploading) setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (!uploading) handleFilesSelected(e.dataTransfer.files);
                    }}
                    className={`flex flex-col items-center justify-center gap-2 backdrop-blur-sm border-2 border-dashed rounded-xl py-8 cursor-pointer transition-all ${
                      isDraggingOver
                        ? 'border-[#003366] bg-[#003366]/10'
                        : 'bg-white/40 border-gray-300 hover:border-[#003366]/40 hover:bg-white/70'
                    }`}
                  >
                    <UploadCloud className="text-[#003366]/50" size={32} />
                    <span className="text-sm text-gray-500">
                      {uploading ? 'Enviando...' : 'Clique ou arraste aqui para subir imagens/evidências'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES}
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                  </label>
                ) : (
                  <p className="text-center text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-xl py-4">
                    Limite de {MAX_ANEXOS} evidências atingido
                  </p>
                )}
                {anexos.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {anexos.map((url, index) => (
                      <div key={url} className="relative w-20 h-20 shrink-0">
                        <img
                          src={url}
                          alt={`Evidência ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => setValue('anexos', anexos.filter((_, i) => i !== index), { shouldValidate: true })}
                          className="absolute -top-2 -right-2 bg-[#003366] text-white rounded-full p-1 shadow-md hover:bg-[#002244] transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-black text-[#003366] uppercase tracking-tight mb-1">
                  Critérios de avaliação do edital
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Selecione os critérios presentes na sua prática
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                  2) Alinhamento com o Modelo Pedagógico do Senac
                </h4>
                <div className="space-y-3">
                  <Toggle
                    title="Contextualização com a realidade prática"
                    checked={autoavaliacao.contextualizacaoRealidade}
                    onChange={(checked) =>
                      setValue('autoavaliacao.contextualizacaoRealidade', checked, { shouldValidate: true })
                    }
                  />

                  <Toggle
                    title="Aprendizagem Integradora"
                    checked={autoavaliacao.aprendizagemIntegradora}
                    onChange={(checked) =>
                      setValue('autoavaliacao.aprendizagemIntegradora', checked, { shouldValidate: true })
                    }
                  />

                  <CriterioCheckboxGroup
                    title="Protagonismo do estudante a partir do uso de metodologias e/ou tecnologias inovadoras"
                    options={PROTAGONISMO_ESTUDANTE_ITENS}
                    values={autoavaliacao.protagonismoEstudante}
                    onChange={(values) =>
                      setValue('autoavaliacao.protagonismoEstudante', values, { shouldValidate: true })
                    }
                  />

                  <Toggle
                    title="Marca Formativa Visão Crítica"
                    checked={autoavaliacao.visaoCritica}
                    onChange={(checked) =>
                      setValue('autoavaliacao.visaoCritica', checked, { shouldValidate: true })
                    }
                  />

                  <Toggle
                    title="Marca Formativa Autonomia Digital"
                    checked={autoavaliacao.autonomiaDigital}
                    onChange={(checked) =>
                      setValue('autoavaliacao.autonomiaDigital', checked, { shouldValidate: true })
                    }
                  />

                  <Toggle
                    title="Marca Formativa Colaboração e Comunicação"
                    checked={autoavaliacao.colaboracaoComunicacao}
                    onChange={(checked) =>
                      setValue('autoavaliacao.colaboracaoComunicacao', checked, { shouldValidate: true })
                    }
                  />

                  <div>
                    <Toggle
                      title="Marca Formativa Atitude Sustentável"
                      checked={autoavaliacao.atitudeSustentavel}
                      onChange={(checked) => {
                        setValue('autoavaliacao.atitudeSustentavel', checked, { shouldValidate: true });
                        if (!checked) {
                          setValue('ods', [4], { shouldValidate: true });
                        }
                      }}
                    />
                    <AnimatePresence initial={false}>
                      {autoavaliacao.atitudeSustentavel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white rounded-xl border border-gray-200 p-4 mt-3">
                            <p className="text-gray-400 text-xs mb-2">
                              Selecione uma ou mais ODS, correspondente a sua prática
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.values(ODS_DATA).map((item) => {
                                const isOds4 = item.id === 4;
                                return (
                                  <label
                                    key={item.id}
                                    className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${
                                      isOds4 ? 'cursor-not-allowed' : 'cursor-pointer'
                                    } ${
                                      ods.includes(item.id)
                                        ? 'text-white border-transparent shadow-md opacity-100'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#003366]/30 hover:bg-gray-50 opacity-80 hover:opacity-100'
                                    }`}
                                    style={ods.includes(item.id) ? { backgroundColor: item.color } : undefined}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={ods.includes(item.id)}
                                      disabled={isOds4}
                                      onChange={() =>
                                        setValue(
                                          'ods',
                                          ods.includes(item.id)
                                            ? ods.filter((n) => n !== item.id)
                                            : [...ods, item.id],
                                          { shouldValidate: true }
                                        )
                                      }
                                      className="hidden"
                                    />
                                    {item.id}. {item.label}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Toggle
                    title="Marca Formativa Criatividade e Atitude Empreendedoras"
                    checked={autoavaliacao.criatividadeEmpreendedora}
                    onChange={(checked) =>
                      setValue('autoavaliacao.criatividadeEmpreendedora', checked, { shouldValidate: true })
                    }
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                  3) Inclusão
                </h4>
                <CriterioCheckboxGroup
                  title="Prática pedagógica inclusiva"
                  options={PRATICA_INCLUSIVA_ITENS}
                  values={autoavaliacao.praticaInclusiva}
                  onChange={(values) =>
                    setValue('autoavaliacao.praticaInclusiva', values, { shouldValidate: true })
                  }
                />
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-2">
                  4) Impacto Social ou Conexão com o Mercado
                </h4>
                <Toggle
                  title="A prática promoveu impacto social ou conexão com o mercado"
                  description="Contribuição efetiva para transformação social, geração de oportunidades, empregabilidade, empreendedorismo, solução de problemas reais da comunidade ou articulação com demandas do setor produtivo e do mundo do trabalho ou parcerias institucionais."
                  checked={autoavaliacao.impactoSocial}
                  onChange={(checked) =>
                    setValue('autoavaliacao.impactoSocial', checked, { shouldValidate: true })
                  }
                />
              </div>
            </section>

            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('termosAceitos')}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  Declaro que as informações prestadas são verdadeiras e aceito os termos de uso e cessão de imagem.
                  <RequiredMark />
                </span>
              </label>
              {errors.termosAceitos && (
                <div className="text-red-500/90 text-xs mt-1.5 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {errors.termosAceitos.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="w-full bg-[#003366] hover:bg-[#002244] text-white font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(0,51,102,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
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
