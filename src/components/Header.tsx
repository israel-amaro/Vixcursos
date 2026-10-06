import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false); };
    const closeOnDesktop = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
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

  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      setPendingSection(sectionId === 'categorias-section' ? 'filtro-categoria' : sectionId);
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };


  return (
    <header
      className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-white/95 backdrop-blur-md border-b border-slate-200 ${
        scrolled
          ? 'py-1 shadow-sm'
          : 'py-1 sm:py-2 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 select-none">
          <BrandLogo className="header-logo" />
          <div className="w-[1px] h-8 bg-slate-200 hidden sm:block" />
          <img
            src="/imagem/prefeitura.png"
            alt="Prefeitura de Vitória"
            className="h-10 md:h-11 w-auto object-contain hidden sm:block bg-primary rounded-lg px-3 py-2"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            className="text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-primary transition-colors"
          >
            Início
          </Link>
          <button
            onClick={() => handleNavClick('cursos-section')}
            className="text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-primary transition-colors cursor-pointer"
          >
            Cursos
          </button>
          <button
            onClick={() => handleNavClick('categorias-section')}
            className="text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-primary transition-colors cursor-pointer"
          >
            Categorias
          </button>
          <Link
            to="/sobre"
            className="text-xs font-bold tracking-widest uppercase text-slate-600 hover:text-primary transition-colors"
          >
            Sobre
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <button
            onClick={() => handleNavClick('cursos-section')}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary border border-white/10 hover:border-accent/40 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-accent transition-all duration-300 transform hover:scale-[1.03] shadow-md cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar Cursos
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          className="lg:hidden p-3 rounded-xl bg-primary/5 text-primary hover:text-accent transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden w-full bg-white backdrop-blur-lg border-b border-slate-200 overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-4 flex flex-col gap-1 max-h-[calc(100dvh-5rem)] overflow-y-auto">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-bold tracking-widest uppercase text-slate-600 hover:text-primary"
              >
                Início
              </Link>
              <button
                onClick={() => handleNavClick('cursos-section')}
                className="text-left block rounded-xl px-3 py-3 text-sm font-bold tracking-widest uppercase text-slate-600 hover:text-primary cursor-pointer"
              >
                Cursos
              </button>
              <button
                onClick={() => handleNavClick('categorias-section')}
                className="text-left block rounded-xl px-3 py-3 text-sm font-bold tracking-widest uppercase text-slate-600 hover:text-primary cursor-pointer"
              >
                Categorias
              </button>
              <Link
                to="/sobre"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-bold tracking-widest uppercase text-slate-600 hover:text-primary"
              >
                Sobre
              </Link>
              <button
                onClick={() => handleNavClick('cursos-section')}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary border border-white/10 hover:border-accent/40 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-accent transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                Buscar Cursos
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
