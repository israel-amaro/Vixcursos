import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import Detalhes from './pages/Detalhes';
import PreInscricao from './pages/PreInscricao';
import Sobre from './pages/Sobre';
import VitorugaChat from './components/VitorugaChat';
import Lenis from 'lenis';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}

function FloatingHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[998] p-4 rounded-full bg-black/35 backdrop-blur-md text-white border border-white/10 hover:bg-accent hover:border-accent/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center cursor-pointer group"
      title={isHome ? 'Voltar ao topo' : 'Voltar à tela principal'}
      aria-label={isHome ? 'Voltar ao topo' : 'Voltar à tela principal'}
    >
      {isHome ? (
        <svg
          className="w-6 h-6 text-white group-hover:scale-105 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-white group-hover:scale-105 transition-transform"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      )}
    </motion.button>
  );
}

function LegacyCourseRedirect({ type }: { type: 'detalhes' | 'pre-inscricao' }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (id) {
    return <Navigate to={`/${type}/${id}`} replace />;
  }

  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <SmoothScroll />
      <div className="min-h-screen bg-bg-light text-text-dark font-sans selection:bg-accent selection:text-white antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detalhes/:id" element={<Detalhes />} />
          <Route path="/pre-inscricao/:id" element={<PreInscricao />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/detalhes" element={<LegacyCourseRedirect type="detalhes" />} />
          <Route path="/detalhes.html" element={<LegacyCourseRedirect type="detalhes" />} />
          <Route path="/pages/detalhes.html" element={<LegacyCourseRedirect type="detalhes" />} />
          <Route path="/pre_inscricao" element={<LegacyCourseRedirect type="pre-inscricao" />} />
          <Route path="/pre_inscricao.html" element={<LegacyCourseRedirect type="pre-inscricao" />} />
          <Route path="/pages/pre_inscricao.html" element={<LegacyCourseRedirect type="pre-inscricao" />} />
          <Route path="/informacoes" element={<Navigate to="/sobre" replace />} />
          <Route path="/informacoes.html" element={<Navigate to="/sobre" replace />} />
          <Route path="/pages/informacoes.html" element={<Navigate to="/sobre" replace />} />
          <Route path="/pages/index.html" element={<Navigate to="/" replace />} />
          <Route path="/vocacional" element={<Navigate to="/" replace />} />
          <Route path="/vocacional.html" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <VitorugaChat />
        <FloatingHomeButton />
      </div>
    </Router>
  );
}
