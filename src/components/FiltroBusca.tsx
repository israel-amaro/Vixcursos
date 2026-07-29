import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Sparkles } from 'lucide-react';

export interface FilterState {
  idade: string;
  categoria: string;
  modalidade: string;
  local: string;
  turno: string;
  situacao: string;
  buscaInteligente: string;
  somenteDisponiveis: boolean;
}

interface FiltroBuscaProps {
  onFilterChange: (filters: FilterState) => void;
}

interface CategoryObj {
  id: number;
  categoria: string;
}

// Colloquial term mapping for Intelligent AI Search
const semanticMap: { [key: string]: { category?: string; keywords?: string[] } } = {
  cozinheiro: { category: 'Gastronomia', keywords: ['cozinha', 'culinária', 'gastronomia', 'panificação', 'confeitaria'] },
  cozinha: { category: 'Gastronomia', keywords: ['cozinha', 'culinária', 'gastronomia'] },
  comida: { category: 'Gastronomia', keywords: ['gastronomia', 'salgados', 'doce'] },
  bolo: { category: 'Gastronomia', keywords: ['confeitaria', 'doces', 'bolo'] },
  pão: { category: 'Gastronomia', keywords: ['panificação', 'padaria'] },
  barbeiro: { category: 'Beleza', keywords: ['barbeiro', 'cabelo', 'corte'] },
  barba: { category: 'Beleza', keywords: ['barbeiro'] },
  cabelo: { category: 'Beleza', keywords: ['cabeleireiro', 'corte', 'escova'] },
  unha: { category: 'Beleza', keywords: ['manicure', 'pedicure', 'unhas'] },
  manicure: { category: 'Beleza', keywords: ['manicure', 'unhas'] },
  maquiagem: { category: 'Beleza', keywords: ['maquiagem', 'sobrancelha'] },
  estética: { category: 'Beleza', keywords: ['estética', 'pele', 'depilação'] },
  computador: { category: 'Informática / Tecnologia', keywords: ['informática', 'computador', 'excel', 'word'] },
  pc: { category: 'Informática / Tecnologia', keywords: ['informática', 'tecnologia'] },
  ti: { category: 'Informática / Tecnologia', keywords: ['programação', 'tecnologia', 'redes'] },
  programador: { category: 'Informática / Tecnologia', keywords: ['programação', 'ti', 'desenvolvimento'] },
  costura: { category: 'Confecção', keywords: ['costura', 'confecção', 'moda', 'corte'] },
  roupa: { category: 'Confecção', keywords: ['confecção', 'moda'] },
  elétrica: { category: 'Eletricista / Energia', keywords: ['elétrica', 'eletricista', 'comandos'] },
  fio: { category: 'Eletricista / Energia', keywords: ['elétrica', 'instalação'] },
  luz: { category: 'Eletricista / Energia', keywords: ['elétrica'] },
  obra: { category: 'Construção Civil / Serviço', keywords: ['construção', 'alvenaria', 'pintura'] },
  pedreiro: { category: 'Construção Civil / Serviço', keywords: ['construção', 'alvenaria'] },
  pintor: { category: 'Construção Civil / Serviço', keywords: ['pintura', 'construção'] },
  escritório: { category: 'Administração', keywords: ['administração', 'atendimento', 'vendas'] },
  vendas: { category: 'Administração', keywords: ['vendas', 'comércio', 'atendimento'] },
  idoso: { category: 'Enfermagem / Saúde', keywords: ['cuidador', 'idoso', 'saúde'] },
};

export default function FiltroBusca({ onFilterChange }: FiltroBuscaProps) {
  const [filters, setFilters] = useState<FilterState>({
    idade: '',
    categoria: '',
    modalidade: '',
    local: '',
    turno: '',
    situacao: '',
    buscaInteligente: '',
    somenteDisponiveis: false,
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [locals, setLocals] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const catRes = await fetch('/public/categoria');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.map((c: any) => c.categoria).filter(Boolean));
        } else {
          setCategories([
            "Beleza", "Confecção", "Gastronomia", "Informática / Tecnologia", 
            "Eletricista / Energia", "Construção Civil / Serviço", "Administração", "Enfermagem / Saúde"
          ]);
        }

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updated = { ...filters, [name]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    let updated = { ...filters, buscaInteligente: query };

    // Intelligent semantic mapping: check if query matches a colloquial term
    const normalizedQuery = query.trim().toLowerCase();
    if (semanticMap[normalizedQuery]) {
      const match = semanticMap[normalizedQuery];
      if (match.category) {
        updated.categoria = match.category;
      }
    }

    setFilters(updated);
    onFilterChange(updated);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const updated = { ...filters, [name]: checked };
    setFilters(updated);
    onFilterChange(updated);
  };

  const triggerSearch = () => {
    const el = document.getElementById('cursos-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="cursos-section" className="w-full bg-slate-900 py-10 px-6 md:px-12 relative z-30 border-b border-slate-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="sr-only">Filtro de Busca de Cursos</h2>
        
        {/* BUSCA INTELIGENTE POR IA (Termos Coloquiais) */}
        <div className="mb-8">
          <label htmlFor="busca-inteligente" className="text-white font-bold text-xs tracking-wider uppercase mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Busca Inteligente por Palavra-chave ou Profissão:
          </label>
          <div className="relative">
            <input
              id="busca-inteligente"
              type="text"
              value={filters.buscaInteligente}
              onChange={handleSearchInputChange}
              placeholder="Digite o que você procura (ex: 'cozinheiro', 'barbeiro', 'computador', 'obra')..."
              className="w-full bg-white/10 text-white placeholder-slate-400 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent border border-white/15 transition-all duration-300 pr-12 shadow-inner"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
            Dica: Digite nomes de profissões cotidianas para ver áreas e cursos relacionados automaticamente.
          </p>
        </div>

        {/* Grid de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Filtro 1: Faixa Etária (14+, 16+, 18+, 60+) */}
          <div className="flex flex-col">
            <label htmlFor="filtro-idade" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Faixa Etária:
            </label>
            <div className="relative">
              <select
                id="filtro-idade"
                name="idade"
                value={filters.idade}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer pr-9"
              >
                <option value="">Todas as idades</option>
                <option value="14+">14+ anos (Adolescentes e Jovens)</option>
                <option value="16+">16+ anos (Jovens e Adultos)</option>
                <option value="18+">18+ anos (Maioridade)</option>
                <option value="60+">60+ anos (Melhor Idade)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 2: Turno (Manhã, Tarde, Noite) */}
          <div className="flex flex-col">
            <label htmlFor="filtro-turno" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Turno:
            </label>
            <div className="relative">
              <select
                id="filtro-turno"
                name="turno"
                value={filters.turno}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer pr-9"
              >
                <option value="">Todos os turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 3: Situação da Vaga */}
          <div className="flex flex-col">
            <label htmlFor="filtro-situacao" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Situação da Vaga:
            </label>
            <div className="relative">
              <select
                id="filtro-situacao"
                name="situacao"
                value={filters.situacao}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer pr-9"
              >
                <option value="">Todas as situações</option>
                <option value="abertas">Inscrições Abertas</option>
                <option value="ultimas">Últimas Vagas</option>
                <option value="breve">Início em Breve</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 4: Categoria */}
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
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer pr-9"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Filtro 5: Local */}
          <div className="flex flex-col">
            <label htmlFor="filtro-local" className="text-white font-semibold text-xs tracking-wider uppercase mb-2">
              Local em Vitória:
            </label>
            <div className="relative">
              <select
                id="filtro-local"
                name="local"
                value={filters.local}
                onChange={handleSelectChange}
                className="w-full bg-white text-gray-800 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent appearance-none cursor-pointer pr-9"
              >
                <option value="">Todos os locais</option>
                {locals.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Checkbox Opção Vagas Disponíveis */}
        <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="somenteDisponiveis"
              name="somenteDisponiveis"
              checked={filters.somenteDisponiveis}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded text-accent accent-accent border-gray-300 focus:ring-accent cursor-pointer"
            />
            <label htmlFor="somenteDisponiveis" className="text-white text-xs font-medium cursor-pointer select-none">
              Exibir somente turmas com vagas abertas no momento
            </label>
          </div>

          <button
            onClick={triggerSearch}
            className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer shadow-md flex items-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar Cursos
          </button>
        </div>

      </div>
    </section>
  );
}
