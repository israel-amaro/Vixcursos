import { useEffect, useState } from 'react';
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
  const [enabled, setEnabled] = useState(() => window.matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setEnabled(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled]);

  return null;
}

function ViewportSize() {
  useEffect(() => {
    const update = () => {
      const viewport = window.visualViewport;
      document.documentElement.style.setProperty('--app-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      document.documentElement.style.setProperty('--app-viewport-top', `${viewport?.offsetTop ?? 0}px`);
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);
  return null;
}

function FloatingHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [show, setShow] = useState(false);
  useEffect(() => {
    const update = () => setShow(window.scrollY > 500);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const handleClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  if (isHome && !show) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="floating-home fixed z-[998] p-3 sm:p-4 rounded-full bg-slate-900/85 sm:bg-black/35 backdrop-blur-md text-white border border-white/10 hover:bg-accent hover:border-accent/40 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all flex items-center justify-center cursor-pointer group"
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

function FloatingAssistants() {
  const { pathname } = useLocation();
  // The registration page already has its own assistant and back navigation.
  if (pathname.startsWith('/pre-inscricao/')) return null;
  return <><VitorugaChat /><FloatingHomeButton /></>;
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
      <ViewportSize />
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
        <FloatingAssistants />
      </div>
    </Router>
  );
}
