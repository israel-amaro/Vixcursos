import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
const Detalhes = lazy(() => import('./pages/Detalhes'));
const PreInscricao = lazy(() => import('./pages/PreInscricao'));
const Sobre = lazy(() => import('./pages/Sobre'));
const VitorugaChat = lazy(() => import('./components/VitorugaChat'));
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

function FloatingAssistants() {
  const { pathname } = useLocation();
  // The registration page already has its own assistant and back navigation.
  if (pathname.startsWith('/pre-inscricao/')) return null;
  return <><Suspense fallback={null}><VitorugaChat /></Suspense></>;
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
        <Suspense fallback={<p role="status">Carregando...</p>}><Routes>
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
        </Routes></Suspense>
        <FloatingAssistants />
      </div>
    </Router>
  );
}
