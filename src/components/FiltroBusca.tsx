import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface FilterState {
  idade: string;
  categoria: string;
  modalidade: string;
  local: string;
  somenteDisponiveis: boolean;
}

interface FiltroBuscaProps {
  onFilterChange: (filters: FilterState) => void;
}

interface CategoryObj {
  id: number;
  categoria: string;
}

export default function FiltroBusca({ onFilterChange }: FiltroBuscaProps) {
  const [filters, setFilters] = useState<FilterState>({
    idade: '',
    categoria: '',
    modalidade: '',
    local: '',
    somenteDisponiveis: false,
  });

  const [categoriesObj, setCategoriesObj] = useState<CategoryObj[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);
  const [locals, setLocals] = useState<string[]>([]);

  // Custom Dropdown for Modalidade state
  const [isOpenModalidade, setIsOpenModalidade] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenModalidade(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch Categories
        const catRes = await fetch('/public/categoria');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategoriesObj(catData);
          setCategories(catData.map((c: any) => c.categoria).filter(Boolean));
        } else {
          const fallbackCats = [
            { id: 1, categoria: "Beleza" },
            { id: 2, categoria: "Confecção" },
            { id: 3, categoria: "Gastronomia" },
            { id: 4, categoria: "Humanas" },
            { id: 5, categoria: "Veículos" }
          ];
          setCategoriesObj(fallbackCats);
          setCategories(fallbackCats.map(c => c.categoria));
        }

        // Fetch Locals
        const locRes = await fetch('/public/local');
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocals(locData.map((l: any) => l.local).filter(Boolean));
        } else {
          setLocals([
            "Bento Ferreira", "Centro", "Jardim da Penha",
            "Jardim Camburi", "Maruípe", "São Pedro", "Goiabeiras",
            "Praia do Canto"
          ]);
        }
      } catch (err) {
        console.warn("Aviso: Falha ao carregar opções de filtro", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch Modalities dynamically when selected Category changes
  useEffect(() => {
    const fetchModalities = async () => {
      try {
        const selectedCat = categoriesObj.find(
          c => c && c.categoria && filters.categoria && c.categoria.toLowerCase() === filters.categoria.toLowerCase()
        );
        const catId = selectedCat ? selectedCat.id : '';

        let url = '/public/modalidade';
        if (catId) {
          url += `?categoria_id=${catId}`;
        }

        const modRes = await fetch(url);
        if (modRes.ok) {
          const modData = await modRes.json();
          setModalities(modData.map((m: any) => m.modalidade).filter(Boolean));
        } else {
          // Fallbacks based on category
          const categoryLower = (filters.categoria || '').toLowerCase();
          if (categoryLower === 'beleza') {
            setModalities(["Barbeiro", "Cuidador de Idoso"]);
          } else if (categoryLower === 'confecção') {
            setModalities(["Confecção Moda Praia", "Técnicas de Costura e Acabamento"]);
          } else if (categoryLower === 'gastronomia') {
            setModalities(["Drinks para o Verão", "Técnicas de Confeitaria Básica"]);
          } else {
            setModalities([]);
          }
        }
      } catch (err) {
        console.warn("Aviso: Falha ao carregar modalidades", err);
      }
    };

    fetchModalities();
  }, [filters.categoria, categoriesObj]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updated = { ...filters, [name]: value };
    if (name === 'categoria') {
      updated.modalidade = ''; // Reset modality when category changes
    }
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleSelectModalidade = (val: string) => {
    const updated = { ...filters, modalidade: val };
    setFilters(updated);
    onFilterChange(updated);
    setIsOpenModalidade(false);
    setSearchQuery('');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const updated = { ...filters, [name]: checked };
    setFilters(updated);
    onFilterChange(updated);
  };

  const triggerMobileSearch = () => {
    const el = document.getElementById('cursos-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredModalities = modalities.filter(mod =>
    mod.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="cursos-section" className="w-full bg-primary py-10 px-6 md:px-12 relative z-30">
      <div className="max-w-7xl mx-auto">
        <h2 className="sr-only">Filtro de Busca de Cursos</h2>
        
        {/* Grid de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Filtro 1: Idade */}
          <div className="flex flex-col">
            <label htmlFor="filtro-idade" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Idade:
            </label>
            <div className="relative">
              <select
                id="filtro-idade"
                name="idade"
                value={filters.idade}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none transition-all duration-300 cursor-pointer pr-10"
              >
                <option value="">Todas as idades</option>
                <option value="14-17">14 a 17 anos</option>
                <option value="18-29">18 a 29 anos</option>
                <option value="30-49">30 a 49 anos</option>
                <option value="50-90">50 a 90 anos</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 2: Categoria */}
          <div className="flex flex-col">
            <label htmlFor="filtro-categoria" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Categoria:
            </label>
            <div className="relative">
              <select
                id="filtro-categoria"
                name="categoria"
                value={filters.categoria}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none transition-all duration-300 cursor-pointer pr-10"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 3: Modalidade (Custom Dropdown com Lupa/Search) */}
          <div className="flex flex-col" ref={dropdownRef}>
            <label htmlFor="busca-modalidade-input" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Modalidade:
            </label>
            <div className="relative">
              <button
                id="select-modalidade-btn"
                type="button"
                onClick={() => setIsOpenModalidade(!isOpenModalidade)}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none transition-all duration-300 cursor-pointer pr-10 text-left flex justify-between items-center h-[48px]"
              >
                <span className="truncate">
                  {filters.modalidade || "Todas as modalidades"}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpenModalidade ? 'rotate-180' : ''}`} />
              </button>

              {isOpenModalidade && (
                <div className="absolute left-0 mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  {/* Campo de Busca com Lupa */}
                  <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      id="busca-modalidade-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquisar modalidade..."
                      className="w-full bg-transparent border-none focus:outline-none text-xs text-gray-700 py-1"
                      autoFocus
                    />
                  </div>
                  {/* Opções */}
                  <div className="max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleSelectModalidade('')}
                      className={`w-full text-left px-4 py-3 text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer border-b border-slate-50 block ${
                        filters.modalidade === '' ? 'text-primary bg-primary/5' : 'text-gray-600'
                      }`}
                    >
                      Todas as modalidades
                    </button>
                    {filteredModalities.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-gray-400 text-center">
                        Nenhuma modalidade encontrada
                      </div>
                    ) : (
                      filteredModalities.map((mod) => (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => handleSelectModalidade(mod)}
                          className={`w-full text-left px-4 py-3 text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer border-b border-slate-50 block ${
                            filters.modalidade === mod ? 'text-primary bg-primary/5' : 'text-gray-600'
                          }`}
                        >
                          {mod}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filtro 4: Local */}
          <div className="flex flex-col">
            <label htmlFor="filtro-local" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Local:
            </label>
            <div className="relative">
              <select
                id="filtro-local"
                name="local"
                value={filters.local}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none transition-all duration-300 cursor-pointer pr-10"
              >
                <option value="">Todos os locais</option>
                {locals.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Linha de Opções Extras */}
        <div className="flex items-center justify-end gap-3 mt-5">
          <input
            type="checkbox"
            id="somenteDisponiveis"
            name="somenteDisponiveis"
            checked={filters.somenteDisponiveis}
            onChange={handleCheckboxChange}
            className="w-4.5 h-4.5 rounded text-accent accent-accent border-gray-300 focus:ring-accent focus:ring-offset-primary cursor-pointer"
          />
          <label htmlFor="somenteDisponiveis" className="text-white text-xs md:text-sm font-medium cursor-pointer select-none">
            Exibir somente turmas com vagas disponíveis
          </label>
        </div>

        {/* Botão de Busca Mobile */}
        <button
          onClick={triggerMobileSearch}
          className="w-full bg-white text-primary hover:bg-white/95 font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs mt-6 flex items-center justify-center gap-2 lg:hidden shadow-lg cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Buscar Cursos
        </button>

      </div>
    </section>
  );
}
