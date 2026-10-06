import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import IntroVideo, { INTRO_SESSION_KEY, shouldShowIntro } from '../components/IntroVideo';
import Hero from '../components/Hero';
import FiltroBusca, { FilterState } from '../components/FiltroBusca';
import ListagemCursos from '../components/ListagemCursos';
import Depoimentos from '../components/Depoimentos';
import Footer from '../components/Footer';
import CourseQuizModal from '../components/CourseQuizModal';
import SatisfactionSurvey from '../components/SatisfactionSurvey';
import { useLocation } from 'react-router-dom';

export default function Home() {
  const location = useLocation();
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

  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem(INTRO_SESSION_KEY, 'true'); } catch { /* Storage may be unavailable. */ }
    setShowIntro(false);
  }, []);

  useEffect(() => {
    const section = location.state?.scrollTo;
    if (section && !showIntro) document.getElementById(section === 'categorias-section' ? 'filtro-categoria' : section)?.scrollIntoView({ behavior: 'smooth' });
  }, [location.key, showIntro]);

  const handleClearFilters = () => {
    setFilters({
      idade: '',
      categoria: '',
      modalidade: '',
      local: '',
      turno: '',
      situacao: '',
      buscaInteligente: '',
      somenteDisponiveis: false,
    });
  };

  const handleSelectCategoryFromGrid = (categoriaName: string) => {
    setFilters(prev => ({ ...prev, categoria: categoriaName }));
  };

  return (
    <>
      <AnimatePresence>{showIntro && <IntroVideo onFinish={finishIntro} />}</AnimatePresence>
      <main inert={showIntro}>
        {/* 1. Hero Principal com texto direto e CTA único */}
        <Hero onOpenQuiz={() => setIsQuizOpen(true)} />

        {/* 2. Filtros de Busca Avançados e Busca Inteligente por IA */}
        <FiltroBusca onFilterChange={setFilters} />

        {/* 3. Listagem de Cursos (Mais Procurados, Novas Inscrições, Cards com Início e Média Salarial) */}
        <ListagemCursos filters={filters} onClearFilters={handleClearFilters} />

        {/* 4. Depoimentos dos Alunos */}
        <Depoimentos />

        {/* 5. Rodapé com Link para Pesquisa de Satisfação */}
        <Footer onOpenSurvey={() => setIsSurveyOpen(true)} />

        {/* Interactive Modals */}
        <CourseQuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          onSelectCategory={handleSelectCategoryFromGrid}
        />

        <SatisfactionSurvey
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
        />
      </main>
    </>
  );
}
