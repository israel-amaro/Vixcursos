import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import CourseCard, { PublicCourse, shift } from './CourseCard';
import CourseModal, { CourseModalData } from './CourseModal';
import InterestModal from './InterestModal';

// Everyday words people type, mapped to words found in course names and categories.
const synonyms: Record<string, string[]> = {
  cozinha: ['gastronom', 'cozinha', 'confeit', 'panific'], comida: ['gastronom'], bolo: ['confeit'], pao: ['panific'],
  cabelo: ['beleza', 'cabele', 'barbe'], barba: ['barbe'], unha: ['manicure', 'beleza'], maquiagem: ['beleza', 'estetica'],
  computador: ['informat', 'tecnolog'], celular: ['informat', 'tecnolog'], ti: ['informat', 'tecnolog', 'program'],
  costura: ['confec', 'costura', 'moda'], roupa: ['confec', 'moda'], luz: ['eletric'], eletrica: ['eletric'],
  obra: ['constru'], pedreiro: ['constru'], escritorio: ['administ'], vendas: ['administ', 'comerc'], idoso: ['saude', 'cuidador'],
  moto: ['moto', 'veicul', 'mecanic'], carro: ['veicul', 'mecanic'],
};
const normalize = (text: string) => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const PAGE = 6;

type Filters = { turno: string; local: string; idade: string; somenteVagas: boolean };
const emptyFilters: Filters = { turno: '', local: '', idade: '', somenteVagas: false };

interface Props {
  courses: PublicCourse[];
  loading: boolean;
  error: string;
  requestedCategory?: { name: string; at: number } | null;
}

export default function CursosSection({ courses, loading, error, requestedCategory }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [visible, setVisible] = useState(PAGE);
  const [detail, setDetail] = useState<CourseModalData | null>(null);
  const [interest, setInterest] = useState<CourseModalData | null | undefined>(undefined);
  const sheet = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!requestedCategory) return;
    setCategory(requestedCategory.name);
    document.getElementById('cursos-section')?.scrollIntoView({ behavior: 'smooth' });
  }, [requestedCategory]);

  const categories = useMemo(() => [...new Set(courses.map(c => c.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [courses]);
  const places = useMemo(() => [...new Set(courses.map(c => c.local).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [courses]);

  const results = useMemo(() => {
    const words = normalize(query).split(/\s+/).filter(Boolean);
    const age = Number(filters.idade);
    return courses.filter(c => {
      const text = normalize(`${c.nome} ${c.categoria} ${c.descricao || ''} ${c.local}`);
      if (words.length && !words.every(w => text.includes(w) || (synonyms[w] || []).some(s => text.includes(s)))) return false;
      if (category && c.categoria !== category) return false;
      if (filters.turno && shift(c.horario_inicio) !== filters.turno) return false;
      if (filters.local && c.local !== filters.local) return false;
      if (age && ((Number(c.idade_min) && age < Number(c.idade_min)) || (Number(c.idade_max) && age > Number(c.idade_max)))) return false;
      if (filters.somenteVagas && (c.vagas_disponiveis <= 0 || c.status === 'esgotado' || c.aceita_inscricoes === false)) return false;
      return true;
    }).sort((a, b) => Number(b.vagas_disponiveis > 0) - Number(a.vagas_disponiveis > 0) || b.id - a.id);
  }, [courses, query, category, filters]);

  useEffect(() => setVisible(PAGE), [query, category, filters]);

  const activeFilters = Object.entries(filters).filter(([, v]) => v).length;
  const hasAnyFilter = Boolean(query || category || activeFilters);
  const clearAll = () => { setQuery(''); setCategory(''); setFilters(emptyFilters); };
  const openSheet = () => { setDraft(filters); sheet.current?.showModal(); };
  const applySheet = () => { setFilters(draft); sheet.current?.close(); };

  return (
    <section id="cursos-section" aria-labelledby="cursos-title" className="bg-[var(--canvas)] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 id="cursos-title" className="text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
          O que você quer aprender?
        </h2>

        <div className="mt-5 flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Buscar curso ou profissão</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-soft)]" aria-hidden="true" />
            <input
              type="search" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Ex.: cozinha, costura"
              className="h-14 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white pl-12 pr-4 text-[17px] text-[var(--ink)] placeholder:text-slate-400 focus:border-[var(--brand)] focus:outline-none"
            />
          </label>
          <button onClick={openSheet} className="relative flex h-14 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-4 text-[16px] font-semibold text-[var(--ink)]">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Filtros</span>
            <span className="sr-only sm:hidden">Filtros</span>
            {activeFilters > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--brand)] px-1.5 text-[13px] font-bold text-white">{activeFilters}</span>}
          </button>
        </div>

        {categories.length > 1 && (
          <div id="filtro-categoria" role="group" aria-label="Áreas" className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            <button className="chip" aria-pressed={!category} onClick={() => setCategory('')}>Todas</button>
            {categories.map(name => (
              <button key={name} className="chip" aria-pressed={category === name} onClick={() => setCategory(category === name ? '' : name)}>{name}</button>
            ))}
          </div>
        )}

        <div id="cursos-list-section" className="mt-8 flex min-h-11 items-center justify-between gap-3" aria-live="polite">
          <p className="text-[16px] font-semibold text-[var(--ink-soft)]">
            {loading ? 'Carregando cursos…' : `${results.length} ${results.length === 1 ? 'curso encontrado' : 'cursos encontrados'}`}
          </p>
          {hasAnyFilter && <button onClick={clearAll} className="btn-quiet !min-h-11 !px-3">Limpar</button>}
        </div>

        {error && <p role="alert" className="mt-3 rounded-[var(--radius-control)] bg-red-50 p-4 text-[16px] text-red-700">{error}</p>}

        {loading && !courses.length ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map(i => <div key={i} className="h-[420px] animate-pulse rounded-[var(--radius-card)] bg-white" />)}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-card)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
            <p className="text-xl font-bold text-[var(--ink)]">Nenhum curso encontrado</p>
            <p className="mx-auto mt-2 max-w-sm text-[16px] text-[var(--ink-soft)]">
              {hasAnyFilter ? 'Tente outra palavra ou limpe os filtros.' : 'No momento não há turmas abertas. Avisamos você quando abrir uma.'}
            </p>
            {hasAnyFilter
              ? <button onClick={clearAll} className="btn-primary mt-6">Ver todos os cursos</button>
              : <button onClick={() => setInterest(null)} className="btn-primary mt-6">Quero ser avisado</button>}
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.slice(0, visible).map(c => (
                <CourseCard key={c.id} course={c} onDetails={(course, button) => { trigger.current = button; setDetail(course as CourseModalData); }} />
              ))}
            </div>
            {visible < results.length && (
              <button onClick={() => setVisible(v => v + PAGE)} className="mx-auto mt-8 flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--line)] bg-white text-[17px] font-semibold text-[var(--ink)] sm:w-auto sm:px-8">
                Mostrar mais {Math.min(PAGE, results.length - visible)} cursos
              </button>
            )}
          </>
        )}
      </div>

      <dialog ref={sheet} className="sheet" aria-labelledby="filtros-title" onClick={e => { if (e.target === sheet.current) sheet.current?.close(); }}>
        <div className="flex max-h-[88svh] flex-col">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
            <h3 id="filtros-title" className="text-xl font-bold">Filtros</h3>
            <button onClick={() => sheet.current?.close()} aria-label="Fechar filtros" className="grid h-11 w-11 place-items-center rounded-full hover:bg-[var(--canvas)]"><X className="h-6 w-6" /></button>
          </div>
          <div className="space-y-7 overflow-y-auto px-5 py-6">
            <fieldset>
              <legend className="text-[17px] font-bold">Turno</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {['', 'Manhã', 'Tarde', 'Noite'].map(t => (
                  <button key={t || 'todos'} type="button" className="chip" aria-pressed={draft.turno === t} onClick={() => setDraft(d => ({ ...d, turno: t }))}>{t || 'Qualquer'}</button>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-[17px] font-bold">Local</span>
              <select value={draft.local} onChange={e => setDraft(d => ({ ...d, local: e.target.value }))} className="mt-3 h-14 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-4 text-[17px]">
                <option value="">Todos os locais</option>
                {places.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[17px] font-bold">Sua idade</span>
              <span className="block text-[15px] text-[var(--ink-soft)]">Mostra só os cursos para a sua idade.</span>
              <input type="number" inputMode="numeric" min={10} max={110} value={draft.idade} onChange={e => setDraft(d => ({ ...d, idade: e.target.value }))} placeholder="Ex.: 45" className="mt-3 h-14 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-white px-4 text-[17px]" />
            </label>
            <label className="flex min-h-14 items-center justify-between gap-4 rounded-[var(--radius-control)] border border-[var(--line)] px-4">
              <span className="text-[17px] font-semibold">Só cursos com vagas</span>
              <input type="checkbox" checked={draft.somenteVagas} onChange={e => setDraft(d => ({ ...d, somenteVagas: e.target.checked }))} className="h-6 w-6 accent-[var(--brand)]" />
            </label>
          </div>
          <div className="flex gap-3 border-t border-[var(--line)] px-5 py-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
            <button onClick={() => setDraft(emptyFilters)} className="btn-quiet flex-1 border border-[var(--line)]">Limpar</button>
            <button onClick={applySheet} className="btn-primary flex-[2]">Aplicar filtros</button>
          </div>
        </div>
      </dialog>

      <CourseModal
        course={detail}
        isOpen={Boolean(detail)}
        onClose={() => setDetail(null)}
        triggerRef={trigger}
        onInterest={course => { setDetail(null); setInterest(course); }}
      />
      {interest !== undefined && <InterestModal course={interest} onClose={() => setInterest(undefined)} />}
    </section>
  );
}
