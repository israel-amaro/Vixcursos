import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import FiltroBusca, { FilterState } from '../components/FiltroBusca';
import ListagemCursos from '../components/ListagemCursos';
import CategoriasCursos from '../components/CategoriasCursos';
import Depoimentos from '../components/Depoimentos';
import Footer from '../components/Footer';

export default function Home() {
  const location = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    idade: '',
    categoria: '',
    modalidade: '',
    local: '',
    somenteDisponiveis: false,
  });

  const [zoomActive, setZoomActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('vixcursos-intro-shown');
  });
  // Triggers the Netflix-style content reveal after intro exits
  const [contentRevealed, setContentRevealed] = useState(() => {
    return !!sessionStorage.getItem('vixcursos-intro-shown');
  });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showIntro) {
      // Start logo zoom phase at 2.2s
      const zoomTimer = setTimeout(() => {
        setZoomActive(true);
      }, 2200);

      // Start cross-fade unblur of main page content at 3.6s
      const revealTimer = setTimeout(() => {
        setContentRevealed(true);
      }, 3600);

      // End entire intro splash overlay at 4.0s (exit animation runs for 1.2s, ending at 5.2s total)
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem('vixcursos-intro-shown', 'true');
      }, 4000);

      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(revealTimer);
        clearTimeout(timer);
      };
    }
  }, [showIntro]);

  useEffect(() => {
    if (!showIntro && location.state && (location.state as any).scrollTo) {
      const targetId = (location.state as any).scrollTo;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      window.history.replaceState({}, document.title);
    }
  }, [location, showIntro]);

  const handleClearFilters = () => {
    setFilters({
      idade: '',
      categoria: '',
      modalidade: '',
      local: '',
      somenteDisponiveis: false,
    });
  };

  return (
    <>
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
            {/* Layout: two columns flanking the center line */}
            <div className="relative flex items-center justify-center w-full max-w-4xl px-8 md:px-20">

              {/* LEFT — VixCursos logo */}
              <motion.div
                className="flex-1 flex items-center justify-end pr-10 md:pr-14"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.img
                  src="/imagem/VIxcursos.png"
                  alt="VIX Cursos"
                  className="h-12 sm:h-16 md:h-20 w-auto object-contain select-none will-change-transform"
                  style={{ originX: 0.5, originY: 0.5 }}
                  animate={zoomActive ? {
                    x: isMobile ? 'calc(2.5rem + 50%)' : 'calc(3.5rem + 50%)',
                    scale: 55,
                    opacity: [1, 1, 0],
                    filter: ["blur(0px)", "blur(3px)", "blur(18px)"],
                  } : {
                    x: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px)",
                  }}
                  transition={zoomActive ? {
                    scale: { duration: 2.2, ease: [0.76, 0, 0.24, 1] },
                    x: { duration: 1.8, ease: [0.25, 1, 0.5, 1] },
                    filter: { duration: 2.2, ease: [0.76, 0, 0.24, 1] },
                    opacity: { duration: 2.2, times: [0, 0.75, 1], ease: 'linear' },
                  } : {
                    duration: 0.2
                  }}
                />
              </motion.div>

              {/* CENTER — Vertical divider line */}
              <div className="relative flex-none flex items-center justify-center w-[1px]">
                <motion.div
                  className="w-[1px] bg-white rounded-full"
                  initial={{ height: 0, opacity: 0 }}
                  animate={zoomActive ? { height: 88, opacity: 0 } : { height: 88, opacity: 1 }}
                  transition={zoomActive ? {
                    opacity: { duration: 0.5, ease: 'easeOut' }
                  } : {
                    height: { duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.2, delay: 0.08 },
                  }}
                  style={{ boxShadow: '0 0 6px 1px rgba(255,255,255,0.18)' }}
                />
              </div>

              {/* RIGHT — Prefeitura logo + label */}
              <motion.div
                className="flex-1 flex flex-col items-start justify-center pl-10 md:pl-14 gap-2"
                initial={{ opacity: 0, x: 24 }}
                animate={zoomActive ? { opacity: 0, x: 24 } : { opacity: 1, x: 0 }}
                transition={zoomActive ? {
                  duration: 0.5,
                  ease: 'easeOut'
                } : {
                  duration: 0.65,
                  delay: 0.65,
                  ease: [0.22, 1, 0.36, 1]
                }}
              >
                <img
                  src="/imagem/prefeitura.png"
                  alt="Prefeitura de Vitória"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain select-none"
                />
                <motion.p
                  className="text-white/35 text-[9px] tracking-[0.3em] uppercase hidden sm:block font-sans select-none"
                  initial={{ opacity: 0 }}
                  animate={zoomActive ? { opacity: 0 } : { opacity: 1 }}
                  transition={zoomActive ? { duration: 0.4 } : { duration: 0.5, delay: 0.9 }}
                >
                  Qualificação Profissional
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main
        className={showIntro ? 'h-screen overflow-hidden' : ''}
        initial={{ filter: 'blur(20px)', scale: 1.08, opacity: 0 }}
        animate={contentRevealed
          ? { filter: 'blur(0px)', scale: 1, opacity: 1 }
          : { filter: 'blur(20px)', scale: 1.08, opacity: 0 }
        }
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center top', willChange: 'filter, transform, opacity' }}
      >
        <Hero />
        <FiltroBusca onFilterChange={setFilters} />
        <ListagemCursos filters={filters} onClearFilters={handleClearFilters} />
        <CategoriasCursos />
        <Depoimentos />
        <Footer />
      </motion.main>
    </>
  );
}
