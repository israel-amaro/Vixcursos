import React, { useRef, useEffect, useState } from 'react';
import { Scissors, Shirt, ChefHat, Monitor, Heart } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CategoryItem {
  id: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  image: string;
  icon: React.ReactNode;
  coursesCount: number;
}

export default function CategoriasCursos() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const categorias: CategoryItem[] = [
    {
      id: 1,
      label: "Categoria 01",
      title: "BELEZA",
      subtitle: "Transforme vidas com as suas mãos",
      description: "Barbeiro, Cabeleireiro, Manicure e Estética. Aprenda técnicas profissionais e conquiste sua independência.",
      detail: "12 cursos disponíveis",
      image: "/imagem/proficao/proficao4.png",
      icon: <Scissors className="w-5 h-5 text-accent" />,
      coursesCount: 12
    },
    {
      id: 2,
      label: "Categoria 02",
      title: "MODA",
      subtitle: "Crie, costure e mostre ao mundo",
      description: "Confecção, Corte e Costura, Moda Praia. Da teoria à prática, com espaço para toda a sua criatividade.",
      detail: "8 cursos disponíveis",
      image: "/imagem/proficao/confeccao.jpg",
      icon: <Shirt className="w-5 h-5 text-accent" />,
      coursesCount: 8
    },
    {
      id: 3,
      label: "Categoria 03",
      title: "GASTRONOMIA",
      subtitle: "O sabor que transforma carreiras",
      description: "Cozinha básica, Confeitaria, Padaria e Doceria. Do fogão ao empreendimento gastronômico profissional.",
      detail: "10 cursos disponíveis",
      image: "/imagem/proficao/proficao.png",
      icon: <ChefHat className="w-5 h-5 text-accent" />,
      coursesCount: 10
    },
    {
      id: 4,
      label: "Categoria 04",
      title: "TECNOLOGIA",
      subtitle: "O futuro começa com conhecimento",
      description: "Informática Básica, Manutenção de Computadores, Excel e Internet. Habilidades digitais essenciais para o mercado.",
      detail: "6 cursos disponíveis",
      image: "/imagem/proficao/proficao3.png",
      icon: <Monitor className="w-5 h-5 text-accent" />,
      coursesCount: 6
    },
    {
      id: 5,
      label: "Categoria 05",
      title: "SAÚDE",
      subtitle: "Cuidar de vidas é uma vocação",
      description: "Primeiros Socorros, Cuidador de Idosos, Auxiliar de Farmácia. Formação humanizada para profissões que fazem diferença.",
      detail: "7 cursos disponíveis",
      image: "/imagem/proficao/enfermagem.png",
      icon: <Heart className="w-5 h-5 text-accent" />,
      coursesCount: 7
    },
  ];

  useEffect(() => {
    const checkViewport = () => {
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      setIsDesktop(desktop);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !containerRef.current) return;

      const getScrollWidth = () => {
        if (!containerRef.current) return 0;
        // Ensure scrollWidth is calculated after initial layout passes
        const w = containerRef.current.scrollWidth - window.innerWidth;
        return w > 0 ? w : window.innerWidth * 4;
      };

      gsap.to(containerRef.current, {
        x: () => -getScrollWidth(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.2,
          start: 'top top',
          end: () => `+=${getScrollWidth()}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Find active index
            const progress = self.progress;
            const index = Math.min(categorias.length - 1, Math.floor(progress * categorias.length * 1.05));
            
            // Direct DOM update to avoid React re-rendering during pin spacer modifications
            const dots = document.querySelectorAll('.category-indicator-dot');
            dots.forEach((dot, idx) => {
              if (idx === index) {
                dot.classList.add('h-24', 'bg-accent');
                dot.classList.remove('h-10', 'bg-white/20');
              } else {
                dot.classList.add('h-10', 'bg-white/20');
                dot.classList.remove('h-24', 'bg-accent');
              }
            });
          }
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop, categorias.length]);

  const handleCategoryClick = () => {
    const el = document.getElementById('cursos-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Particles generator helper
  const renderParticles = () => {
    return Array.from({ length: 15 }).map((_, i) => {
      const randomTop = Math.random() * 100;
      const randomLeft = Math.random() * 100;
      const randomDelay = Math.random() * 5;
      const randomDuration = 10 + Math.random() * 20;

      return (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full blur-[1px] pointer-events-none"
          style={{
            top: `${randomTop}%`,
            left: `${randomLeft}%`,
            animation: `float ${randomDuration}s ease-in-out infinite`,
            animationDelay: `${randomDelay}s`,
          }}
        />
      );
    });
  };

  return (
    <div className="w-full overflow-hidden">
      <section
        id="categorias-section"
        ref={sectionRef}
        className={`relative bg-black ${isDesktop ? 'w-full h-screen overflow-hidden' : 'w-full'}`}
      >
        {/* Horizontal Scroll Container */}
        <div
          ref={containerRef}
          className={`${isDesktop ? 'flex h-full w-[500vw]' : 'flex flex-col w-full'}`}
        >
          {categorias.map((cat, idx) => (
            <div
              key={cat.id}
              className="category-panel w-full lg:w-screen h-screen flex-shrink-0 relative overflow-hidden bg-black flex items-center"
            >
              {/* Background Image and Overlays */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/55 z-10" />
                {/* Radial gradient decorative */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_60%)] mix-blend-overlay z-15" />
                {/* Particles */}
                {renderParticles()}
              </div>

              {/* Content Container */}
              <div className="relative z-20 max-w-7xl mx-auto w-full px-8 md:px-20 grid grid-cols-12 items-center gap-8 h-full">
                {/* Left Column (Main details) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col justify-center text-left">
                  {/* Category Label */}
                  <div className="flex items-center gap-3 mb-6">
                    {cat.icon}
                    <span className="text-sm font-mono tracking-[0.3em] uppercase text-white/50">
                      {cat.label}
                    </span>
                  </div>

                   {/* Poetic Subtitle */}
                  <p className="font-sans italic text-lg md:text-xl text-white/60 mb-2">
                    {cat.subtitle}
                  </p>

                  {/* Giant Title */}
                  <h2
                    className="text-6xl md:text-[8rem] xl:text-[10rem] font-display font-black leading-[0.8] tracking-tighter text-white"
                    style={{ textShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
                  >
                    {cat.title}
                  </h2>

                  {/* Description */}
                  <p className="border-l-2 border-white/20 pl-6 text-white/75 max-w-sm text-sm md:text-base leading-relaxed mt-8">
                    {cat.description}
                  </p>

                  {/* Call To Action Button */}
                  <div className="mt-10">
                    <button
                      onClick={handleCategoryClick}
                      className="px-10 py-5 rounded-full glass hover:bg-white hover:text-primary transition-all duration-500 font-semibold tracking-widest text-xs uppercase text-white shadow-xl cursor-pointer"
                    >
                      Ver cursos desta categoria
                    </button>
                  </div>
                </div>

                {/* Right Column (Counter Circle) */}
                <div className="hidden lg:flex col-span-4 items-center justify-center">
                  {/* External Circle */}
                  <div className="w-60 h-60 rounded-full border border-white/10 flex items-center justify-center relative glow-primary">
                    {/* Halo back pulsator */}
                    <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping opacity-25" />
                    
                    {/* Inner circle (glass) */}
                    <div className="w-44 h-44 rounded-full glass flex flex-col items-center justify-center">
                      <span className="font-display font-black text-5xl text-white badge-vagas">
                        {cat.coursesCount}
                      </span>
                      <span className="text-[10px] font-mono text-white/50 text-center tracking-wider mt-2 uppercase">
                        cursos disponíveis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators (Left Side) */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 z-40">
          {categorias.map((_, index) => (
            <div
              key={index}
              className={`category-indicator-dot w-[3px] rounded-full transition-all duration-700 ${
                index === 0 ? 'h-24 bg-accent' : 'h-10 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Scroll Instruction (Right Bottom) */}
        <div className="absolute bottom-10 right-8 z-40 hidden lg:block select-none pointer-events-none">
          <span className="text-[10px] tracking-[0.3em] text-white/35 font-mono uppercase">
            ROLE PARA VER MAIS CATEGORIAS →
          </span>
        </div>
      </section>
    </div>
  );
}
