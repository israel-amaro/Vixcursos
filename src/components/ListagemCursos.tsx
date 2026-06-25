import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BookX, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, ChevronDown, Clock } from 'lucide-react';
import { FilterState } from './FiltroBusca';
import { motion, AnimatePresence } from 'framer-motion';

const imagensCursos: { [key: string]: string } = {
  'Beleza':                       'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
  'Confecção':                    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'Gastronomia':                  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
  'Veículos':                     'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
  'Humanas':                      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  'Administração':                'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
  'Artesanato':                   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'AUTOMAÇÃO INDUSTRIAL':         'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&q=80&w=800',
  'Cinema':                       'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
  'Comércio / Gestão Empresarial':'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&q=80&w=800',
  'Construção Civil / Serviço':   'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  'Cultura':                      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=800',
  'Dança':                        'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
  'Dança e Teatro':               'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
  'Educação':                     'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
  'Eletrônica':                   'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  'Eletricista / Energia':        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
  'Enfermagem / Saúde':           'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
  'Estética':                     'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
  'Eventos':                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  'Fotografia':                   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
  'Gestão':                       'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=800',
  'Idiomas':                      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800',
  'Informática / Tecnologia':     'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800',
  'Logística':                    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
  'Manutenção':                   'https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&q=80&w=800',
  'Mecânica':                     'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
  'Meio Ambiente':                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
  'Moda':                         'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
  'Música':                       'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
  'Panificação / Confeitaria':    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800',
  'Produção Cultural':            'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800',
  'Programação / TI':             'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
  'Recursos Humanos':             'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800',
  'Redes / Telecom':              'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
  'Segurança do Trabalho':        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  'Serviço Social':               'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
  'Soldagem':                     'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&q=80&w=800',
  'Turismo / Hotelaria':          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800',
  'Vendas / Marketing':           'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?auto=format&fit=crop&q=80&w=800',
};

const getCourseImage = (categoria: string, nome: string): string => {
  const cat = (categoria || '').toLowerCase();
  const nm = (nome || '').toLowerCase();

  // Keyword matching for high-quality Unsplash photos
  if (nm.includes('barbeiro') || nm.includes('barbearia')) {
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800'; // Barbeiro
  }
  if (nm.includes('cabeleireiro') || nm.includes('corte') || nm.includes('escova')) {
    return 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800'; // Cabeleireiro
  }
  if (nm.includes('unhas') || nm.includes('manicure') || nm.includes('pedicure')) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'; // Manicure
  }
  if (nm.includes('maquiagem') || nm.includes('designer de sobrancelhas')) {
    return 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800'; // Maquiagem
  }
  if (nm.includes('estética') || nm.includes('depilação') || nm.includes('massagem')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'; // Estética
  }
  if (nm.includes('costura') || nm.includes('modelagem') || nm.includes('confecção') || cat.includes('moda') || cat.includes('confecção')) {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'; // Moda/Costura
  }
  if (nm.includes('bolo') || nm.includes('confeitaria') || nm.includes('doces') || nm.includes('cupcake')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800'; // Confeitaria
  }
  if (nm.includes('pizzaiolo') || nm.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800'; // Pizza
  }
  if (nm.includes('pão') || nm.includes('padaria') || nm.includes('panificação')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800'; // Padaria
  }
  if (nm.includes('salgados') || nm.includes('salgadeiro')) {
    return 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800'; // Salgados
  }
  if (cat.includes('gastronomia') || nm.includes('culinária') || nm.includes('cozinha') || nm.includes('gastronomia')) {
    return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800'; // Gastronomia Geral
  }
  if (nm.includes('computador') || nm.includes('informática') || nm.includes('excel') || nm.includes('word') || nm.includes('internet') || cat.includes('tecnologia') || cat.includes('informática') || cat.includes('programação')) {
    return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=800'; // Tecnologia
  }
  if (nm.includes('cuidador') || nm.includes('idoso') || nm.includes('primeiros socorros') || nm.includes('farmácia') || cat.includes('saúde') || cat.includes('enfermagem')) {
    return 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800'; // Saúde
  }
  if (nm.includes('mecânica') || nm.includes('veículos') || cat.includes('veículos')) {
    return 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800'; // Mecânica
  }
  if (nm.includes('eletricista') || nm.includes('elétrica') || cat.includes('energia')) {
    return 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800'; // Elétrica
  }
  if (nm.includes('artesanato') || nm.includes('pintura') || cat.includes('artesanato')) {
    return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'; // Artesanato
  }

  // Fallback by category match
  const matchedImage = imagensCursos[categoria];
  if (matchedImage) return matchedImage;

  // Global fallback
  return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'; // General education
};

interface Course {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
  vagas: number; // mapped to vagas_disponiveis for compatibility
  status: string;
  horario_inicio: string;
  horario_termino: string;
  data_inicio: string;
  data_termino: string;
  categoria: string;
  idade_min: string;
  idade_max: string;
  modalidade: string;
  local: string;
  descricao?: string;
  carga_horaria?: number;
}

interface ListagemCursosProps {
  filters: FilterState;
  onClearFilters: () => void;
}

export default function ListagemCursos({ filters, onClearFilters }: ListagemCursosProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [sortBy, setSortBy] = useState<string>('recentes');
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6; // Grouped institutions per page or direct courses. Let's paginate by courses for simplicity.

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/cursos-public');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
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

    // Age Filter
    if (filters.idade) {
      const [minStr, maxStr] = filters.idade.split('-');
      const minVal = parseInt(minStr) || 0;
      const maxVal = parseInt(maxStr) || 99;
      result = result.filter(c => {
        const cMin = parseInt(c.idade_min) || 0;
        const cMax = parseInt(c.idade_max) || 99;
        // Check overlap or inclusion
        return (cMin <= maxVal && cMax >= minVal);
      });
    }

    // Category Filter
    if (filters.categoria) {
      result = result.filter(c => c.categoria.toLowerCase() === filters.categoria.toLowerCase());
    }

    // Modality Filter
    if (filters.modalidade) {
      // Map Online/Online -> EAD or Híbrido -> Semipresencial for compatibility
      result = result.filter(c => {
        const m = c.modalidade.toLowerCase();
        const filterM = filters.modalidade.toLowerCase();
        if (filterM === 'ead' && (m.includes('online') || m.includes('ead'))) return true;
        if (filterM === 'semipresencial' && (m.includes('híbrido') || m.includes('semi'))) return true;
        return m.includes(filterM);
      });
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
    } else if (sortBy === 'bairro') {
      result.sort((a, b) => a.local.localeCompare(b.local));
    } else { // recentes
      result.sort((a, b) => b.id - a.id);
    }

    setFilteredCourses(result);
    setCurrentPage(1); // Reset page on filter change
  }, [courses, filters, sortBy]);

  // Grouping filtered courses by local
  const indexOfLastCourse = currentPage * itemsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // Group current page courses by local/institution
  const groupedCourses: { [key: string]: Course[] } = {};
  currentCourses.forEach(course => {
    if (!groupedCourses[course.local]) {
      groupedCourses[course.local] = [];
    }
    groupedCourses[course.local].push(course);
  });

  const getInstitutionDetails = (localName: string) => {
    // Return mock detailed name and address for standard locations to look premium
    if (localName.toLowerCase().includes('senac')) {
      return {
        name: "Senac — Serviço Nacional de Aprendizagem Comercial",
        address: "Av. Marechal Mascarenhas de Moraes, 2077 — Bento Ferreira, Vitória - ES"
      };
    }
    if (localName.toLowerCase().includes('senai')) {
      return {
        name: "SENAI — Serviço Nacional de Aprendizagem Industrial",
        address: "SENAI Cícero Freire — Av. Marechal Mascarenhas de Moraes, 2235 — Bento Ferreira, Vitória - ES"
      };
    }
    return {
      name: localName,
      address: "Vitória, Espírito Santo — Brasil"
    };
  };

  const getStatusConfig = (vagas: number, status: string) => {
    if (status === 'esgotado' || vagas <= 0) {
      return {
        label: "Encerrado",
        class: "bg-red-100 text-red-700 border border-red-200",
        icon: <XCircle className="w-3.5 h-3.5" />
      };
    }
    if (vagas <= 5) {
      return {
        label: "Lista de Espera",
        class: "bg-orange-100 text-orange-700 border border-orange-200",
        icon: <AlertTriangle className="w-3.5 h-3.5" />
      };
    }
    return {
      label: "Aberto",
      class: "bg-green-100 text-green-700 border border-green-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    };
  };

  const formatSchedule = (hInicio: string, hFim: string) => {
    if (hInicio && hFim) return `${hInicio} às ${hFim}`;
    if (hInicio) return `A partir das ${hInicio}`;
    return "Consulte o edital";
  };

  return (
    <section id="cursos-list-section" className="w-full bg-slate-50/80 py-16 px-6 md:px-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecalho da Listagem */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <span className="text-gray-500 text-sm font-medium tracking-wide">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </span>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="ordenacao" className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Ordenar por:
            </label>
            <select
              id="ordenacao"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs md:text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value="recentes">Mais Recentes</option>
              <option value="vagas">Mais Vagas</option>
              <option value="az">A-Z (Ordem Alfabética)</option>
              <option value="bairro">Por Bairro/Local</option>
            </select>
          </div>
        </div>

        {/* Estado Vazio */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-28 flex flex-col items-center gap-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto animate-float">
            <BookX className="w-16 h-16 text-primary/10" />
            <h3 className="text-xl font-display font-semibold text-gray-800">
              Nenhum curso encontrado
            </h3>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed px-6">
              Ajuste os filtros acima ou limpe-os para ver todo o catálogo de cursos disponíveis.
            </p>
            <button
              onClick={onClearFilters}
              className="mt-4 px-6 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest text-primary hover:text-primary transition-all duration-300 cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        )}

        {/* Grid de Cards de Cursos */}
        {filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCourses.map((course) => {
              const status = getStatusConfig(course.vagas_disponiveis, course.status);
              const isEsgotado = course.status === 'esgotado' || course.vagas_disponiveis <= 0;
              const imgSrc = getCourseImage(course.categoria, course.nome);

              return (
                <div
                  key={course.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300 flex flex-col justify-between overflow-hidden text-left"
                >
                  {/* Imagem do Card */}
                  <div className="relative h-48 w-full overflow-hidden select-none">
                    <img
                      src={imgSrc}
                      alt={course.nome}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/imagem/proficao/proficao.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono tracking-wider uppercase opacity-85 block">
                        {course.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="mb-5">
                      <h4 className="text-lg font-display font-bold text-slate-800 leading-snug line-clamp-2 mb-2 min-h-[3.5rem] flex items-center">
                        {course.nome}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4 min-h-[3.25rem]">
                        {course.descricao || "Este curso oferece formação prática qualificada, com foco nas habilidades exigidas pelo mercado de trabalho local. Prepare-se para atuar de forma profissional e autônoma."}
                      </p>

                      {/* Detalhes com Ícones */}
                      <div className="flex flex-col gap-2.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary/70 flex-shrink-0" />
                          <span><strong>Carga Horária:</strong> {course.carga_horaria ? `${course.carga_horaria}h` : 'Consulte o edital'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                          <span className="line-clamp-1"><strong>Local:</strong> {course.local}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          <span><strong>Faixa Etária:</strong> {course.idade_min} a {course.idade_max} anos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          <span><strong>Horário:</strong> {formatSchedule(course.horario_inicio, course.horario_termino)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-primary/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <span><strong>Período:</strong> {course.data_inicio} até {course.data_termino}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vagas e CTA */}
                    <div className="pt-4 border-t border-slate-100 mt-auto flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider">Vagas Disponíveis</span>
                        <span className="font-display font-black text-slate-800 text-sm">
                          {course.vagas_disponiveis} / {course.vagas_totais}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                          className={`w-full py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white transition-all duration-300 cursor-pointer text-center transform hover:scale-[1.02] ${
                            isEsgotado
                              ? 'bg-orange-500 hover:bg-orange-600'
                              : 'bg-primary hover:bg-primary-dark shadow-sm'
                          }`}
                        >
                          {isEsgotado ? 'Lista de Espera' : 'Pré-inscrição'}
                        </button>
                        {isEsgotado && (
                          <span className="block bg-success text-white text-[9px] rounded-lg px-2 py-1 font-bold text-center leading-tight max-w-[80px]">
                            vaga p/ suplente
                          </span>
                        )}
                      </div>
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
              className="p-2 border border-slate-200 rounded-full text-slate-600 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-10 h-10 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-full text-slate-600 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
