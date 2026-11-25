import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import MotionPill from './MotionPill';

const links = [
  { label: 'Cursos', section: 'cursos-section' },
  { label: 'Como funciona', section: 'como-funciona' },
  { label: 'Ajuda', section: 'ajuda' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [away, setAway] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();

  useMotionValueEvent(scrollY, 'change', current => {
    setScrolled(current > 16);
    const delta = current - (scrollY.getPrevious() ?? current);
    if (current < 40) setAway(false);
    else if (Math.abs(delta) >= 6) setAway(delta > 0);
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    const closeOnDesktop = () => { if (window.innerWidth >= 1200) setIsOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    window.addEventListener('resize', closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', closeOnEscape);
      window.removeEventListener('resize', closeOnDesktop);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!pendingSection || isOpen) return;
    document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth' });
    setPendingSection(null);
  }, [pendingSection, isOpen]);

  const goTo = (section: string) => {
    setIsOpen(false);
    if (location.pathname === '/') setPendingSection(section);
    else navigate('/', { state: { scrollTo: section } });
  };

  return (
    <header
      data-away={away && !isOpen && !reduced}
      data-scrolled={scrolled}
      className="site-header sticky top-0 z-50 w-full"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Qualifica Vix, página inicial" className="flex items-center gap-4">
          <BrandLogo className="h-11 w-auto" />
          <span className="hidden h-7 w-px bg-[var(--line)] sm:block" />
          <img src="/imagem/prefeitura-preto-transparente.webp" alt="Prefeitura de Vitória" className="hidden h-9 w-auto sm:block" />
        </Link>

        <nav className="hidden items-center gap-1 min-[1200px]:flex" aria-label="Principal">
          {links.map(l => (
            <button key={l.section} onClick={() => goTo(l.section)} className="btn-quiet editorial-link text-[var(--ink)] hover:bg-transparent">
              {l.label}
            </button>
          ))}
          <Link to="/sobre" className="btn-quiet editorial-link text-[var(--ink)] hover:bg-transparent">
            Sobre
          </Link>
          <MotionPill
            onClick={() => goTo('cursos-section')}
            tone="brand"
            className="ml-3 !min-h-11 !px-5 !text-[15px]"
          >
            Encontrar curso
          </MotionPill>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="menu-celular"
          className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-[15px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)] min-[1200px]:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          {isOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="menu-celular"
            aria-label="Menu"
            initial={reduced ? false : { clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={reduced ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
            transition={reduced ? { duration: 0 } : { duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between border-t border-[var(--line)] bg-white px-5 pb-8 pt-4 min-[1200px]:hidden"
          >
            <div>
              {links.map((l, idx) => (
                <motion.button
                  key={l.section}
                  onClick={() => goTo(l.section)}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.08 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="menu-drawer-link flex min-h-16 w-full items-center border-b border-[var(--line)] text-left text-[var(--ink)] transition-colors hover:text-[var(--brand)]"
                >
                  {l.label}
                </motion.button>
              ))}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.23, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to="/sobre"
                  onClick={() => setIsOpen(false)}
                  className="menu-drawer-link flex min-h-16 w-full items-center border-b border-[var(--line)] text-[var(--ink)] transition-colors hover:text-[var(--brand)]"
                >
                  Sobre o programa
                </Link>
              </motion.div>
              <button onClick={() => goTo('cursos-section')} className="btn-primary mt-6 w-full">
                Encontrar meu curso
              </button>
            </div>

            <div className="mt-8 border-t border-[var(--line)] pt-5 text-[14px] text-[var(--ink-soft)]">
              <p className="font-semibold text-[var(--ink)]">Prefeitura Municipal de Vitória</p>
              <p className="mt-1">Atendimento: (27) 3135-1000 · seg. a sex., 8h às 17h</p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
