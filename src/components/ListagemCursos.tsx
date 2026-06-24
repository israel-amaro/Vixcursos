import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BookX, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { FilterState } from './FiltroBusca';

const imagensCursos: { [key: string]: string } = {
  'Beleza': '/imagem/proficao/proficao.png',
  'Confecção': '/imagem/proficao/proficao2.png',
  'Gastronomia': '/imagem/proficao/proficao3.png',
  'Veículos': '/imagem/proficao/proficao4.png',
  'Humanas': '/imagem/proficao/proficao.png',
  'Administração': '/imagem/proficao/administracao.jpg',
  'Artesanato': '/imagem/proficao/artesanato.jpg',
  'AUTOMAÇÃO INDUSTRIAL': '/imagem/proficao/automacao.jpg',
  'Cinema': '/imagem/proficao/cinema.jpg',
  'Comércio / Gestão Empresarial': '/imagem/proficao/comercio.jpg',
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
  'Vendas / Marketing': '/imagem/proficao/marketing.jpg'
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

        {/* Listagem em Grade por Instituição */}
        {Object.entries(groupedCourses).map(([localName, coursesInLocal]) => {
          const instInfo = getInstitutionDetails(localName);
          return (
            <div key={localName} className="mb-10">
              
              {/* Cabeçalho da Instituição */}
              <div className="bg-white rounded-2xl px-6 py-5 mb-5 shadow-sm border border-slate-100 flex items-start gap-4 hover:border-primary/20 transition-all duration-300">
                <div className="p-3 bg-primary/10 text-primary rounded-xl mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-display font-bold text-slate-800 leading-tight">
                    {instInfo.name}
                  </h3>
                  <span className="text-xs md:text-sm text-gray-400 mt-1.5 font-medium tracking-wide">
                    {instInfo.address}
                  </span>
                </div>
              </div>

              {/* Lista de Cards de Cursos daquela Instituição */}
              {coursesInLocal.map((course) => {
                const status = getStatusConfig(course.vagas_disponiveis, course.status);
                const isEsgotado = course.status === 'esgotado' || course.vagas_disponiveis <= 0;
                const imgSrc = imagensCursos[course.categoria] || imagensCursos[course.nome] || '/imagem/proficao/proficao.png';

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-2xl mb-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col hover:border-slate-200 overflow-hidden text-left"
                  >
                    {/* Imagem do Curso Premium */}
                    <div className="h-44 w-full overflow-hidden relative select-none pointer-events-none">
                      <img 
                        src={imgSrc} 
                        alt={course.nome} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/imagem/proficao/proficao.png';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md ${status.class}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col">
                      {/* Cabeçalho do Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {course.categoria}
                          </span>
                          <h4 className="text-xl font-display font-bold text-slate-800 leading-snug">
                            {course.nome}
                          </h4>
                        </div>
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Total de Vagas
                          </span>
                          <span className="font-display font-black text-2xl text-slate-800 mt-1 badge-vagas">
                            {course.vagas_totais}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300 mb-4 select-none">
                        Turma Única / Turma 1
                      </div>

                    {/* Responsive Grid/Table for Turmas */}
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 mb-2">
                      <table className="w-full text-left border-collapse" role="table" aria-label={`Turmas para ${course.nome}`}>
                        <thead>
                          <tr className="bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                            <th className="py-3.5 px-4 font-bold" role="columnheader">Faixa Etária</th>
                            <th className="py-3.5 px-4 font-bold" role="columnheader">Período</th>
                            <th className="py-3.5 px-4 font-bold" role="columnheader">Horário</th>
                            <th className="py-3.5 px-4 font-bold" role="columnheader">Detalhes</th>
                            <th className="py-3.5 px-4 font-bold" role="columnheader">Situação</th>
                            <th className="py-3.5 px-4 font-bold text-center" role="columnheader">Vagas Disp.</th>
                            <th className="py-3.5 px-4 text-right font-bold" role="columnheader">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-mono font-medium text-slate-600">
                              {course.idade_min} a {course.idade_max} anos
                            </td>
                            <td className="py-4 px-4 font-mono font-medium text-slate-600 leading-snug">
                              De {course.data_inicio}<br />até {course.data_termino}
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-600">
                              2ª a 6ª — {formatSchedule(course.horario_inicio, course.horario_termino)}
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => navigate(`/detalhes/${course.id}`)}
                                className="border border-primary/20 text-primary rounded-xl px-3.5 py-1.5 text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer"
                              >
                                Saiba +
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${status.class}`}>
                                {status.icon}
                                {status.label}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="font-display font-black text-2xl text-primary badge-vagas">
                                {course.vagas_disponiveis}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white transition-all duration-300 cursor-pointer transform hover:scale-[1.03] ${
                                    isEsgotado
                                      ? 'bg-orange-500 hover:bg-orange-600'
                                      : 'bg-primary hover:bg-primary-dark shadow-sm'
                                  }`}
                                >
                                  {isEsgotado ? 'Lista de Espera' : 'Pré-inscrição'}
                                </button>
                                {isEsgotado && (
                                  <span className="block bg-success text-white text-[9px] rounded-lg px-2 py-1 font-bold text-center leading-tight ml-2 max-w-[80px]">
                                    vaga p/ suplente
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View (Alternative to table) */}
                    <div className="flex flex-col gap-4 md:hidden border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Situação</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold ${status.class}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-100/70 pt-2">
                        <span className="text-xs font-bold text-slate-400">Faixa Etária</span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {course.idade_min} a {course.idade_max} anos
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/70 pt-2">
                        <span className="text-xs font-bold text-slate-400">Período</span>
                        <span className="text-xs font-mono font-bold text-slate-700 text-right">
                          {course.data_inicio} até {course.data_termino}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-slate-100/70 pt-2">
                        <span className="text-xs font-bold text-slate-400">Horário</span>
                        <span className="text-xs font-bold text-slate-700">
                          2ª a 6ª — {formatSchedule(course.horario_inicio, course.horario_termino)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-100/70 pt-2 pb-2">
                        <span className="text-xs font-bold text-slate-400">Vagas Disp.</span>
                        <span className="font-display font-black text-xl text-primary badge-vagas">
                          {course.vagas_disponiveis}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                        <button
                          onClick={() => navigate(`/detalhes/${course.id}`)}
                          className="w-full border border-primary/20 text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer text-center"
                        >
                          Saiba Mais
                        </button>
                        <button
                          onClick={() => navigate(`/pre-inscricao/${course.id}`)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all cursor-pointer text-center ${
                            isEsgotado ? 'bg-orange-500' : 'bg-primary'
                          }`}
                        >
                          {isEsgotado ? 'Lista de Espera' : 'Pré-inscrição'}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

            </div>
          );
        })}

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
