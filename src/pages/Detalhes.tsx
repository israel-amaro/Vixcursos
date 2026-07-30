import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Calendar, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, GraduationCap, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseDetails {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
  vagas: number;
  status: string;
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


const imagensCursos: { [key: string]: string } = {
  'Administração': '/imagem/proficao/administracao.jpg',
  'Artesanato': '/imagem/proficao/artesanato.jpg',
  'AUTOMAÇÃO INDUSTRIAL': '/imagem/proficao/automacao.jpg',
  'Beleza': '/imagem/proficao/proficao.png',
  'Cinema': '/imagem/proficao/cinema.jpg',
  'Comércio / Gestão Empresarial': '/imagem/proficao/comercio.jpg',
  'Confecção': '/imagem/proficao/proficao2.png',
  'Construção Civil / Serviço': '/imagem/proficao/construcao.jpg',
  'Cultura': '/imagem/proficao/cultura.jpg',
  'Dança': '/imagem/proficao/danca.jpg',
  'Dança e Teatro': '/imagem/proficao/teatro.jpg',
  'Educação': '/imagem/proficao/educacao.jpg',
  'Eletrônica': '/imagem/proficao/eletronica.jpg',
  'Eletricista / Energia': '/imagem/proficao/eletricista.jpg',
  'Enfermagem / Saúde': '/imagem/proficao/enfermagem.jpg',
  'Estética': '/imagem/proficao/estetica.jpg',
  'Eventos': '/imagem/proficao/eventos.jpg',
  'Fotografia': '/imagem/proficao/fotografia.jpg',
  'Gastronomia': '/imagem/proficao/proficao3.png',
  'Gestão': '/imagem/proficao/gestao.jpg',
  'Idiomas': '/imagem/proficao/idiomas.jpg',
  'Informática / Tecnologia': '/imagem/proficao/informatica.jpg',
  'Logística': '/imagem/proficao/logistica.jpg',
  'Manutenção': '/imagem/proficao/manutencao.jpg',
  'Mecânica': '/imagem/proficao/mecanica.jpg',
  'Meio Ambiente': '/imagem/proficao/meio-ambiente.jpg',
  'Moda': '/imagem/proficao/moda.jpg',
  'Música': '/imagem/proficao/musica.jpg',
  'Panificação / Confeitaria': '/imagem/proficao/panificacao.jpg',
  'Produção Cultural': '/imagem/proficao/producao-cultural.jpg',
  'Programação / TI': '/imagem/proficao/programacao.jpg',
  'Recursos Humanos': '/imagem/proficao/rh.jpg',
  'Redes / Telecom': '/imagem/proficao/redes.jpg',
  'Segurança do Trabalho': '/imagem/proficao/seguranca-trabalho.jpg',
  'Serviço Social': '/imagem/proficao/servico-social.jpg',
  'Soldagem': '/imagem/proficao/soldagem.jpg',
  'Turismo / Hotelaria': '/imagem/proficao/turismo.jpg',
  'Vendas / Marketing': '/imagem/proficao/marketing.jpg',
  'Veículos': '/imagem/proficao/proficao4.png',
  'Humanas': '/imagem/proficao/proficao.png'
};

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
      <div className="min-h-screen flex flex-col bg-bg-light">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400 font-medium">Carregando detalhes do curso...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-light">
        <Header />
        <div className="flex-grow flex items-center justify-center px-6">
          <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <XCircle className="w-16 h-16 text-danger/85 mx-auto mb-4" />
            <h2 className="text-xl font-display font-extrabold text-slate-800">Curso não encontrado</h2>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              O link que você seguiu pode estar quebrado ou o curso foi encerrado pela administração.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Início
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isEsgotado = course.vagas_disponiveis <= 0 || course.status === 'esgotado';
  
  // Get description texts from database primary fields
  const detailTexts = {
    aprender: course.ementa || course.competencias || course.descricao || "Este curso oferece um ensino prático e estruturado com foco na atuação profissional.",
    atuar: course.competencias || "O mercado de trabalho de Vitória busca profissionais qualificados nesta área, permitindo atuação em empresas locais ou empreendimento autônomo."
  };

  // Get image path
  const imageSrc = imagensCursos[course.categoria] || imagensCursos[course.nome] || '/imagem/proficao/proficao.png';

  const getStatusDisplay = (vagas: number) => {
    if (isEsgotado) {
      return {
        label: "Vagas Esgotadas",
        class: "text-danger bg-red-50 border-red-100",
        icon: <XCircle className="w-4 h-4" />
      };
    }
    if (vagas <= 5) {
      return {
        label: `${vagas} vagas restantes (Poucas vagas!)`,
        class: "text-warning bg-orange-50 border-orange-100",
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
    return {
      label: `${vagas} vagas disponíveis`,
      class: "text-success bg-green-50 border-green-100",
      icon: <CheckCircle2 className="w-4 h-4" />
    };
  };

  const statusDisplay = getStatusDisplay(course.vagas_disponiveis);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg-light">
      <Header />

      <main className="flex-grow pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Back Link */}
        <div className="flex items-center justify-start mt-2">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Cursos
          </Link>
        </div>

        {/* Hero Details Block */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />

          {/* Left Block: Course Details & Text */}
          <div className="lg:col-span-7 flex flex-col items-start text-left justify-center">
            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              {course.categoria}
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 leading-tight tracking-tight">
              {course.nome}
            </h1>
            
            <p className="text-slate-500 text-sm md:text-base mt-4 leading-relaxed">
              O curso de <b>{course.nome}</b> no portal <b>Qualifica Vix</b> está com inscrições abertas! 
              Aulas no formato <b>{course.modalidade}</b> na região de <b>{course.local}</b>.
            </p>

            <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-extrabold uppercase tracking-wide ${statusDisplay.class}`}>
              {statusDisplay.icon}
              {statusDisplay.label}
            </div>

            {/* Inscription Action Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                className={`px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 transform hover:scale-[1.02] shadow-lg cursor-pointer ${
                  isEsgotado 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-primary hover:bg-primary/95'
                }`}
              >
                {isEsgotado ? 'Entrar em Fila de Espera' : 'Fazer Pré-inscrição'}
              </button>
            </div>
          </div>

          {/* Right Block: Image showcase */}
          <div className="lg:col-span-5 flex items-center justify-center rounded-2xl overflow-hidden shadow-md max-h-72 lg:max-h-none select-none pointer-events-none">
            <img
              src={imageSrc}
              alt={course.nome}
              onError={(e) => {
                // Fallback if image doesn't exist
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800';
              }}
              className="w-full h-full object-cover min-h-[250px]"
            />
          </div>
        </section>

        {/* Details Information Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Box 1: Learn Path */}
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <GraduationCap className="w-5 h-5" />
                <h3 className="font-display text-lg tracking-wide uppercase">O que você vai aprender</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mt-2">
                {detailTexts.aprender}
              </p>
            </div>

            <div className="h-[1px] bg-slate-100" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <Briefcase className="w-5 h-5" />
                <h3 className="font-display text-lg tracking-wide uppercase">Onde você vai trabalhar</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mt-2">
                {detailTexts.atuar}
              </p>
            </div>

            {/* Oportunidade de Mercado & Média Salarial (Item 7 Requirement) */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-600 text-white rounded-xl font-extrabold text-base shadow-sm">
                  💰
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Possibilidades Profissionais & Remuneração
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Formação voltada tanto para <strong>Carteira Assinada (CLT)</strong> quanto para <strong>Empreendedorismo/Autônomo</strong>.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-extrabold text-xs whitespace-nowrap shadow-xs">
                Média Salarial ES: R$ 2.200 a R$ 4.500/mês
              </div>
            </div>
          </div>

          {/* Box 2: Quick Infos */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-6">
            <h3 className="font-display font-bold text-slate-800 text-base uppercase tracking-wider border-b border-slate-100 pb-3">
              Informações Gerais
            </h3>

            <div className="flex flex-col gap-4">
              {/* Info: Local */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Localidade</span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 leading-snug">{course.local}</span>
                </div>
              </div>

              {/* Info: Period */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Período Letivo</span>
                  <span className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                    De {course.data_inicio} até {course.data_termino}
                  </span>
                </div>
              </div>

              {/* Info: Time */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário das Aulas</span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5">
                    {course.horario_inicio} às {course.horario_termino}
                  </span>
                </div>
              </div>

              {/* Info: Age Group */}
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Faixa Etária</span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5">
                    {course.idade_min} a {course.idade_max} anos
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              * Menores de idade deverão estar acompanhados pelo responsável legal no momento da confirmação presencial da matrícula.
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
