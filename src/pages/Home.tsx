import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import FiltroBusca, { FilterState } from '../components/FiltroBusca';
import ListagemCursos from '../components/ListagemCursos';
import Depoimentos from '../components/Depoimentos';
import Footer from '../components/Footer';
import CourseQuizModal from '../components/CourseQuizModal';
import SatisfactionSurvey from '../components/SatisfactionSurvey';

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
  const [isMobile, setIsMobile] = useState(false);

  const [showIntro, setShowIntro] = useState(() => {
    return !(sessionStorage.getItem('qualificavix-intro-shown') || sessionStorage.getItem('vixcursos-intro-shown'));
  });

  const [contentRevealed, setContentRevealed] = useState(() => {
    return !!(sessionStorage.getItem('qualificavix-intro-shown') || sessionStorage.getItem('vixcursos-intro-shown'));
  });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showIntro) {
      const zoomTimer = setTimeout(() => {}, 2200);

      const revealTimer = setTimeout(() => {
        setContentRevealed(true);
      }, 3600);

      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('qualificavix-intro-shown', 'true');
      }, 4000);

      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(revealTimer);
        clearTimeout(timer);
      };
    }
  }, [showIntro]);

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
      {/* Intro Splash Screen */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{
              opacity: 0,
              filter: 'blur(16px)',
              scale: 1.02,
            }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{ background: '#0a0a0a' }}
          >
            <div className="relative flex items-center justify-center w-full max-w-4xl px-8 md:px-20">
              <motion.div
                className="flex-1 flex items-center justify-end pr-10 md:pr-14"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.55 }}
              >
                <img
                  src="/imagem/VIxcursos.png"
                  alt="Qualifica Vix"
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain select-none"
                />
              </motion.div>

              <div className="relative flex-none flex items-center justify-center w-[1px]">
                <div className="w-[1px] h-20 bg-white/40 rounded-full" />
              </div>

              <motion.div
                className="flex-1 flex flex-col items-start justify-center pl-10 md:pl-14 gap-2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.65 }}
              >
                <img
                  src="/imagem/prefeitura.png"
                  alt="Prefeitura de Vitória"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain select-none"
                />
                <p className="text-white/40 text-[9px] tracking-[0.3em] uppercase hidden sm:block font-sans select-none">
                  Qualificação Profissional
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Layout */}
      <motion.main
        className={showIntro ? 'h-screen overflow-hidden' : ''}
        initial={{ filter: 'blur(20px)', opacity: 0 }}
        animate={contentRevealed
          ? { filter: 'blur(0px)', opacity: 1 }
          : { filter: 'blur(20px)', opacity: 0 }
        }
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
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
      </motion.main>
    </>
  );
}
