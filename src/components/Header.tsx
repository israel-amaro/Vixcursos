import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const isHome = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 bg-black/35 backdrop-blur-md border-b border-white/5 ${
        scrolled
          ? 'bg-black/65 py-3.5 shadow-xl'
          : 'py-5 shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-4 select-none">
          <img 
            src="/imagem/VIxcursos.png" 
            alt="VIX Cursos" 
            className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
          />
          <div className="w-[1px] h-8 bg-white/20 hidden sm:block" />
          <img 
            src="/imagem/prefeitura.png" 
            alt="Prefeitura de Vitória" 
            className="h-9 md:h-11 w-auto object-contain hidden sm:block transition-transform duration-300 hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-xs font-bold tracking-widest uppercase text-white/75 hover:text-white transition-colors"
          >
            Início
          </Link>
          <button
            onClick={() => handleNavClick('cursos-section')}
            className="text-xs font-bold tracking-widest uppercase text-white/75 hover:text-white transition-colors cursor-pointer"
          >
            Cursos
          </button>
          <button
            onClick={() => handleNavClick('categorias-section')}
            className="text-xs font-bold tracking-widest uppercase text-white/75 hover:text-white transition-colors cursor-pointer"
          >
            Categorias
          </button>
          <Link
            to="/sobre"
            className="text-xs font-bold tracking-widest uppercase text-white/75 hover:text-white transition-colors"
          >
            Sobre
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:block">
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
          className="md:hidden p-2 text-white hover:text-accent transition-colors cursor-pointer"
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
            className="md:hidden w-full bg-black/95 backdrop-blur-lg border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white"
              >
                Início
              </Link>
              <button
                onClick={() => handleNavClick('cursos-section')}
                className="text-left text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white cursor-pointer"
              >
                Cursos
              </button>
              <button
                onClick={() => handleNavClick('categorias-section')}
                className="text-left text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white cursor-pointer"
              >
                Categorias
              </button>
              <Link
                to="/sobre"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white"
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
