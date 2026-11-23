import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';

const links = [
  { label: 'Cursos', section: 'cursos-section' },
  { label: 'Como funciona', section: 'como-funciona' },
  { label: 'Ajuda', section: 'ajuda' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
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

  const goTo = (section: string) => {
    setIsOpen(false);
    if (location.pathname === '/') setPendingSection(section);
    else navigate('/', { state: { scrollTo: section } });
  };

  return (
    <header className="site-header sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="Qualifica Vix, página inicial" className="flex items-center gap-4">
          <BrandLogo className="h-11 w-auto" />
          <span className="hidden h-7 w-px bg-[var(--line)] sm:block" />
          <img src="/imagem/prefeitura-preto-transparente.webp" alt="Prefeitura de Vitória" className="hidden h-9 w-auto sm:block" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {links.map(l => (
            <button key={l.section} onClick={() => goTo(l.section)} className="btn-quiet text-[var(--ink)]">{l.label}</button>
          ))}
          <Link to="/sobre" className="btn-quiet text-[var(--ink)]">Sobre</Link>
          <button onClick={() => goTo('cursos-section')} className="btn-primary ml-3 !min-h-11 !px-5 !text-[15px]">Encontrar curso</button>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="menu-celular"
          className="flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-[var(--ink)] hover:bg-[var(--canvas)] lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          {isOpen ? 'Fechar' : 'Menu'}
        </button>
      </div>

      {isOpen && (
        <nav id="menu-celular" aria-label="Menu" className="border-t border-[var(--line)] bg-white px-4 pb-6 pt-2 lg:hidden">
          {links.map(l => (
            <button key={l.section} onClick={() => goTo(l.section)} className="flex min-h-14 w-full items-center border-b border-[var(--line)] text-left text-lg font-semibold text-[var(--ink)]">
              {l.label}
            </button>
          ))}
          <Link to="/sobre" onClick={() => setIsOpen(false)} className="flex min-h-14 w-full items-center border-b border-[var(--line)] text-lg font-semibold text-[var(--ink)]">
            Sobre o programa
          </Link>
          <button onClick={() => goTo('cursos-section')} className="btn-primary mt-5 w-full">Encontrar meu curso</button>
        </nav>
      )}
    </header>
  );
}
