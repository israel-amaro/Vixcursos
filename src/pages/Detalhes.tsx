import { startLabel } from '../lib/images';
import { courseImage } from '../lib/courseImages';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MotionPill from '../components/MotionPill';
import PhotoReveal from '../components/PhotoReveal';
import { MapPin, Clock, Calendar, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, GraduationCap, Briefcase, Share2 } from 'lucide-react';

interface CourseDetails {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
  vagas: number;
  status: string;
  situacao?: string;
  situacao_label?: string;
  aceita_inscricoes?: boolean;
  horario_inicio: string;
  horario_termino: string;
  data_inicio: string;
  data_termino: string;
  categoria: string;
  idade_min: string | number;
  idade_max: string | number;
  modalidade: string;
  local: string;
  descricao?: string;
  ementa?: string;
  competencias?: string;
  pre_requisitos?: string;
  carga_horaria?: number;
}

export default function Detalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/cursos-public/${id}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do curso', err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
        <Header />
        <div className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--brand)]" />
            <p className="font-medium text-[var(--ink-soft)]">Carregando detalhes do curso...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--canvas)]">
        <Header />
        <div className="flex flex-grow items-center justify-center px-6">
          <div className="max-w-md border border-[var(--line)] bg-white p-8 text-center">
            <XCircle className="mx-auto mb-4 h-14 w-14 text-red-600" />
            <h2 className="editorial-caps text-3xl text-[var(--ink)]">Curso não encontrado</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
              O link que você seguiu pode estar quebrado ou o curso foi encerrado pela administração.
            </p>
            <MotionPill as="link" to="/" className="mt-6" icon={<ArrowLeft className="h-4 w-4" />}>
              Voltar ao Início
            </MotionPill>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isEsgotado = course.vagas_disponiveis <= 0 || course.status === 'esgotado';

  const detailTexts = {
    aprender: course.ementa || course.competencias || course.descricao || 'Este curso oferece um ensino prático e estruturado com foco na atuação profissional.',
    atuar: course.competencias || 'O mercado de trabalho de Vitória busca profissionais qualificados nesta área, permitindo atuação em empresas locais ou empreendimento autônomo.',
  };

  const image = courseImage(course.categoria, course.nome);

  const getStatusDisplay = (vagas: number) => {
    if (course.aceita_inscricoes === false) {
      return {
        label: course.situacao_label || 'Inscrições indisponíveis',
        class: 'bg-slate-100 text-[var(--ink-soft)] border-[var(--line)]',
        icon: <XCircle className="h-4 w-4" />,
      };
    }
    if (isEsgotado) {
      return {
        label: 'Vagas Esgotadas',
        class: 'bg-[var(--wait-bg)] text-[var(--wait)] border-[var(--wait)]/25',
        icon: <XCircle className="h-4 w-4" />,
      };
    }
    if (vagas <= 5) {
      return {
        label: `${vagas} vagas restantes (Poucas vagas!)`,
        class: 'bg-[var(--wait-bg)] text-[var(--wait)] border-[var(--wait)]/25',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    }
    return {
      label: `${vagas} vagas disponíveis`,
      class: 'bg-[var(--open-bg)] text-[var(--open)] border-[var(--open)]/25',
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  };

  const statusDisplay = getStatusDisplay(course.vagas_disponiveis);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[var(--canvas)]">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-grow flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-start">
          <Link
            to="/"
            className="editorial-link inline-flex items-center gap-2 py-2 text-sm font-bold uppercase tracking-wide text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Cursos
          </Link>
        </div>

        {/* Hero Details Block */}
        <section className="grid grid-cols-1 gap-8 border border-[var(--line)] bg-white p-5 sm:p-8 lg:grid-cols-12 lg:p-10">
          <div className="flex flex-col items-start justify-center text-left lg:col-span-7">
            <span className="mb-4 rounded-full border border-[var(--line)] bg-[var(--canvas)] px-3.5 py-1 text-[13px] font-bold uppercase tracking-wide text-[var(--brand)]">
              {course.categoria}
            </span>
            <h1 className="editorial-caps text-4xl text-[var(--ink)] sm:text-5xl md:text-6xl">
              {course.nome}
            </h1>
            <p className="mt-3 text-base font-semibold text-[var(--ink)]">{startLabel(course.data_inicio)}</p>

            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--ink-soft)] sm:text-base">
              O curso de <strong className="text-[var(--ink)]">{course.nome}</strong> no portal <strong className="text-[var(--ink)]">Qualifica Vix</strong> está disponível no formato{' '}
              <strong className="text-[var(--ink)]">{course.modalidade}</strong> na região de <strong className="text-[var(--ink)]">{course.local}</strong>.
            </p>

            <div className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusDisplay.class}`}>
              {statusDisplay.icon}
              {statusDisplay.label}
            </div>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <MotionPill
                disabled={course.aceita_inscricoes === false}
                onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                className={`px-8 ${isEsgotado ? '!bg-[var(--wait)]' : ''}`}
              >
                {course.aceita_inscricoes === false ? course.situacao_label : isEsgotado ? 'Entrar na Fila de Espera' : 'Fazer Pré-inscrição'}
              </MotionPill>

              <button
                type="button"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-6 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)] cursor-pointer"
                onClick={async () => {
                  const data = { title: course.nome, url: window.location.href };
                  if (navigator.share) {
                    try { await navigator.share(data); } catch (e) { if ((e as Error).name !== 'AbortError') window.open(`https://wa.me/?text=${encodeURIComponent(data.title + ' ' + data.url)}`, '_blank', 'noopener'); }
                  } else {
                    window.open(`https://wa.me/?text=${encodeURIComponent(data.title + ' ' + data.url)}`, '_blank', 'noopener');
                  }
                }}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Compartilhar
              </button>
            </div>
          </div>

          <div className="relative flex max-h-80 items-center justify-center overflow-hidden bg-[var(--canvas)] lg:col-span-5 lg:max-h-none">
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes="(max-width: 1023px) 100vw, 40vw"
              alt={course.nome}
              className="h-full min-h-[260px] w-full object-cover object-[50%_25%]"
            />
            <PhotoReveal />
          </div>
        </section>

        {/* Details Information Panel */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 border border-[var(--line)] bg-white p-6 sm:p-8 lg:col-span-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
                <h2 className="editorial-caps text-2xl text-[var(--ink)]">O que você vai aprender</h2>
              </div>
              <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-[var(--ink-soft)] sm:text-base">
                {detailTexts.aprender}
              </p>
            </div>

            <div className="h-px bg-[var(--line)]" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[var(--brand)]">
                <Briefcase className="h-5 w-5" aria-hidden="true" />
                <h2 className="editorial-caps text-2xl text-[var(--ink)]">Onde você vai trabalhar</h2>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)] sm:text-base">
                {detailTexts.atuar}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border border-[var(--line)] bg-white p-6 sm:p-8">
            <h2 className="editorial-caps border-b border-[var(--line)] pb-3 text-2xl text-[var(--ink)]">
              Informações Gerais
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">Localidade</span>
                  <span className="mt-0.5 text-[15px] font-semibold leading-snug text-[var(--ink)]">{course.local}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">Período Letivo</span>
                  <span className="mt-0.5 font-mono text-[15px] font-bold text-[var(--ink)]">
                    De {course.data_inicio} até {course.data_termino}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">Horário das Aulas</span>
                  <span className="mt-0.5 font-mono text-[15px] font-semibold text-[var(--ink)]">
                    {course.horario_inicio} às {course.horario_termino}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">Faixa Etária</span>
                  <span className="mt-0.5 font-mono text-[15px] font-semibold text-[var(--ink)]">
                    {course.idade_min} a {course.idade_max} anos
                  </span>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-[var(--vitoria-gold)] bg-[var(--canvas)] p-4 text-sm font-medium leading-relaxed text-[var(--ink)]">
              * Menores de idade deverão estar acompanhados pelo responsável legal no momento da confirmação presencial da matrícula.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
