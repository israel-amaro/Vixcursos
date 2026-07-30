import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BookX, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Clock, Calendar, BookmarkPlus, TrendingUp, DollarSign, Tag, Info, BookOpen } from 'lucide-react';
import { FilterState } from './FiltroBusca';
import CourseModal, { CourseModalData } from './CourseModal';

const imagensCursos: { [key: string]: string } = {
  'Beleza':                       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
  'Confecção':                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'Gastronomia':                  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
  'Veículos':                     'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
  'Humanas':                      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  'Administração':                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
  'Artesanato':                   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'Informática / Tecnologia':     'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
  'Eletricista / Energia':        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
  'Construção Civil / Serviço':   'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  'Enfermagem / Saúde':           'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
};

const getCourseImage = (categoria: string, nome: string): string => {
  const nm = (nome || '').toLowerCase();
  const cat = (categoria || '').toLowerCase();

  if (nm.includes('barbeiro') || nm.includes('barbearia')) return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800';
  if (nm.includes('cabeleireiro') || nm.includes('corte')) return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800';
  if (nm.includes('manicure') || nm.includes('unhas')) return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800';
  if (nm.includes('bolo') || nm.includes('confeitaria')) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800';
  if (nm.includes('cozinha') || cat.includes('gastronomia')) return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800';
  if (cat.includes('informática') || cat.includes('tecnologia') || nm.includes('excel')) return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800';
  if (cat.includes('energia') || nm.includes('elétrica')) return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800';

  return imagensCursos[categoria] || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800';
};

const getSalaryExpectation = (categoria: string): string => {
  const cat = (categoria || '').toLowerCase();
  if (cat.includes('beleza')) return 'R$ 2.200 — R$ 4.500/mês (autônomo ou salão)';
  if (cat.includes('gastronomia')) return 'R$ 1.900 — R$ 3.800/mês (restaurantes ou negócios)';
  if (cat.includes('informática') || cat.includes('tecnologia')) return 'R$ 2.500 — R$ 5.500/mês (suporte ou TI)';
  if (cat.includes('energia') || cat.includes('elétrica')) return 'R$ 2.800 — R$ 4.800/mês (instalações e serviços)';
  if (cat.includes('confecção')) return 'R$ 1.800 — R$ 3.500/mês (ateliês ou marca própria)';
  if (cat.includes('construção')) return 'R$ 2.400 — R$ 4.200/mês (obras e reformas)';
  return 'R$ 2.000 — R$ 3.800/mês (mercado regional ES)';
};

const getIdealForTags = (categoria: string, nome: string): string[] => {
  const nm = (nome || '').toLowerCase();
  if (nm.includes('barbeiro') || nm.includes('confeitaria') || nm.includes('costura')) {
    return ['Quem deseja empreender', 'Complementar renda', 'Primeiro emprego'];
  }
  if (nm.includes('excel') || nm.includes('informática') || nm.includes('administração')) {
    return ['Primeiro emprego', 'Atualização profissional', 'Trabalho em escritório'];
  }
  return ['Primeiro emprego', 'Quem deseja empreender', 'Transição de carreira'];
};

interface Course {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
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
  isNovo?: boolean;
  isMaisProcurado?: boolean;
}

interface ListagemCursosProps {
  filters: FilterState;
  onClearFilters: () => void;
}

export default function ListagemCursos({ filters, onClearFilters }: ListagemCursosProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'todos' | 'mais_procurados' | 'novos'>('todos');
  const [sortBy, setSortBy] = useState<string>('recentes');

  // Modal State
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<CourseModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/cursos-public');
        if (res.ok) {
          const data: Course[] = await res.json();
          // Flag high demand & new courses
          const mapped = data.map((c, index) => ({
            ...c,
            isNovo: index % 3 === 0,
            isMaisProcurado: ['Beleza', 'Gastronomia', 'Informática / Tecnologia', 'Eletricista / Energia'].includes(c.categoria),
          }));
          setCourses(mapped);
        }
      } catch (err) {
        console.warn('Erro ao carregar cursos para listagem', err);
      }
    };

    fetchCourses();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...courses];

    // Tab Filter
    if (activeTab === 'mais_procurados') {
      result = result.filter(c => c.isMaisProcurado);
    } else if (activeTab === 'novos') {
      result = result.filter(c => c.isNovo);
    }

    // Intelligent Search Query Filter
    if (filters.buscaInteligente) {
      const q = filters.buscaInteligente.toLowerCase().trim();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(q) || 
        c.categoria.toLowerCase().includes(q) ||
        (c.descricao || '').toLowerCase().includes(q) ||
        c.local.toLowerCase().includes(q)
      );
    }

    // Age Filter (14+, 16+, 18+, 60+)
    if (filters.idade) {
      const ageNum = parseInt(filters.idade.replace('+', '')) || 14;
      result = result.filter(c => {
        const minAge = parseInt(c.idade_min) || 14;
        return ageNum >= minAge || minAge <= ageNum;
      });
    }

    // Turno Filter
    if (filters.turno) {
      result = result.filter(c => {
        const h = (c.horario_inicio || '').toLowerCase();
        if (filters.turno === 'Manhã') return h.includes('07') || h.includes('08') || h.includes('09') || h.includes('10') || h.includes('11');
        if (filters.turno === 'Tarde') return h.includes('12') || h.includes('13') || h.includes('14') || h.includes('15') || h.includes('16') || h.includes('17');
        if (filters.turno === 'Noite') return h.includes('18') || h.includes('19') || h.includes('20') || h.includes('21');
        return true;
      });
    }

    // Situação Filter
    if (filters.situacao) {
      if (filters.situacao === 'abertas') {
        result = result.filter(c => c.vagas_disponiveis > 5);
      } else if (filters.situacao === 'ultimas') {
        result = result.filter(c => c.vagas_disponiveis > 0 && c.vagas_disponiveis <= 5);
      } else if (filters.situacao === 'breve') {
        result = result.filter(c => c.status !== 'esgotado');
      }
    }

    // Category Filter
    if (filters.categoria) {
      result = result.filter(c => c.categoria.toLowerCase() === filters.categoria.toLowerCase());
    }

    // Local Filter
    if (filters.local) {
      result = result.filter(c => c.local.toLowerCase().includes(filters.local.toLowerCase()));
    }

    // Available Only Filter
    if (filters.somenteDisponiveis) {
      result = result.filter(c => c.vagas_disponiveis > 0 && c.status !== 'esgotado');
    }

    // Sort Logic
    if (sortBy === 'vagas') {
      result.sort((a, b) => b.vagas_disponiveis - a.vagas_disponiveis);
    } else if (sortBy === 'az') {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      result.sort((a, b) => b.id - a.id);
    }

    setFilteredCourses(result);
    setCurrentPage(1);
  }, [courses, filters, activeTab, sortBy]);

  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const getStatusConfig = (vagas: number, status: string) => {
    if (status === 'esgotado' || vagas <= 0) {
      return {
        label: "Encerrado (Suplência)",
        class: "bg-red-100 text-red-700 border border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />
      };
    }
    if (vagas <= 5) {
      return {
        label: "Últimas Vagas",
        class: "bg-orange-100 text-orange-700 border border-orange-200",
        icon: <AlertTriangle className="w-3.5 h-3.5" />
      };
    }
    return {
      label: "Inscrições Abertas",
      class: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    };
  };

  return (
    <section id="cursos-list-section" className="w-full bg-slate-50 py-14 px-6 md:px-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        
        {/* TAB CONTROLS: Todos, Mais Procurados, Novas Inscrições */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('todos')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'todos'
                  ? 'bg-white text-slate-800 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os Cursos
            </button>

            <button
              onClick={() => setActiveTab('mais_procurados')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'mais_procurados'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Mais Procurados
            </button>

            <button
              onClick={() => setActiveTab('novos')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'novos'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Novas Inscrições
            </button>
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ordenar:
            </span>
            <select
              id="ordenacao"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs border border-slate-300 rounded-xl px-3.5 py-2 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="vagas">Mais Vagas</option>
              <option value="az">A-Z (Ordem Alfabética)</option>
            </select>
          </div>
        </div>

        {/* Quantidade Encontrada */}
        <div className="mb-6 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Mostrando {filteredCourses.length} {filteredCourses.length === 1 ? 'curso' : 'cursos'}</span>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto">
            <BookX className="w-16 h-16 text-slate-300" />
            <h3 className="text-lg font-display font-bold text-slate-800">
              Nenhum curso encontrado com esses filtros
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed px-6">
              Tente alterar os termos da busca ou limpe os filtros selecionados para visualizar todas as opções.
            </p>
            <button
              onClick={() => {
                setActiveTab('todos');
                onClearFilters();
              }}
              className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-primary-dark transition-all cursor-pointer shadow-md"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCourses.map((course) => {
              const status = getStatusConfig(course.vagas_disponiveis, course.status);
              const isEsgotado = course.status === 'esgotado' || course.vagas_disponiveis <= 0;
              const imgSrc = getCourseImage(course.categoria, course.nome);
              const salary = getSalaryExpectation(course.categoria);
              const idealTags = getIdealForTags(course.categoria, course.nome);

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1.5 hover:border-accent/40 transition-all duration-300 flex flex-col justify-between overflow-hidden text-left relative"
                >
                  {/* Card Image Header */}
                  <div className="relative h-48 w-full overflow-hidden select-none bg-slate-900">
                    <img
                      src={imgSrc}
                      alt={course.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/imagem/proficao/proficao.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Status & Ribbon Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] shadow-md font-extrabold ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      {course.isNovo && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-accent text-white shadow-md animate-pulse">
                          NOVAS INSCRIÇÕES
                        </span>
                      )}
                    </div>

                    {/* Category Label at Bottom Left */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-accent bg-slate-950/70 px-2.5 py-0.5 rounded-md border border-white/10">
                        {course.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Course Title */}
                      <h4 className="text-lg font-display font-extrabold text-slate-900 leading-snug line-clamp-2 mb-2 min-h-[3.25rem]">
                        {course.nome}
                      </h4>

                      {/* DATA DE INÍCIO DAS AULAS (Item 7 Requirement) */}
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 border border-slate-200 mb-3 text-xs font-bold text-slate-700">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>Início das aulas: <strong className="text-slate-900">{course.data_inicio || 'Imediato'}</strong></span>
                      </div>

                      {/* Resumo curto + Mercado e Média Salarial */}
                      <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-3">
                        {course.descricao || "Capacitação profissional presencial gratuita com foco prático e certificação para o mercado de Vitória."}
                      </p>

                      <div className="flex items-start gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg mb-4">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Média Salarial na Área:</strong> {salary}</span>
                      </div>

                      {/* BLOCO "IDEAL PARA:" TAGS (Item 7 Requirement) */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-400" /> Ideal para:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {idealTags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pre-requisites display */}
                      <p className="text-[11px] font-semibold text-slate-500 mb-2">
                        <strong>Pré-requisitos:</strong> {course.pre_requisitos || "Nenhum pré-requisito adicional informado"}
                      </p>

                      {/* Informações adicionais */}
                      <div className="flex flex-col gap-1.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Carga Horária: {course.carga_horaria || 40}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">Local: {course.local}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Vagas & Botões CTA */}
                    <div className="pt-4 border-t border-slate-100 mt-5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Vagas Disponíveis</span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {course.vagas_disponiveis} / {course.vagas_totais}
                        </span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          triggerRef.current = e.currentTarget;
                          setSelectedCourseForModal(course);
                          setIsModalOpen(true);
                        }}
                        className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-accent/40 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-accent" />
                        Ver ementa e mais informações
                      </button>

                      <button
                        onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                        className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white transition-all duration-300 cursor-pointer text-center shadow-md transform hover:scale-[1.02] ${
                          isEsgotado
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-accent hover:bg-accent/90'
                        }`}
                      >
                        {isEsgotado ? 'Entrar na Lista de Espera' : 'Quero me Inscrever'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-200 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Modal de Ementa e Informações do Curso */}
        <CourseModal
          course={selectedCourseForModal}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourseForModal(null);
          }}
          triggerRef={triggerRef}
        />
      </div>
    </section>
  );
}
