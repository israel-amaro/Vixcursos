/**
 * CategoriasCursos — Full-Screen Autoplay Loop Carousel
 */

import React from 'react';
import { Scissors, Shirt, ChefHat, Monitor, Heart } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

/* ─── Data ─── */
const categorias = [
  {
    id: 1,
    label: 'Categoria 01',
    title: 'BELEZA',
    subtitle: 'Transforme vidas com as suas mãos',
    description:
      'Barbeiro, Cabeleireiro, Manicure e Estética. Aprenda técnicas profissionais e conquiste sua independência.',
    coursesCount: 12,
    image: '/imagem/proficao/proficao4.png',
    Icon: Scissors,
    accent: '#ff8a5a',
  },
  {
    id: 2,
    label: 'Categoria 02',
    title: 'MODA',
    subtitle: 'Crie, costure e mostre ao mundo',
    description:
      'Confecção, Corte e Costura, Moda Praia. Da teoria à prática, com espaço para toda a sua criatividade.',
    coursesCount: 8,
    image: '/imagem/proficao/confeccao.jpg',
    Icon: Shirt,
    accent: '#f472b6',
  },
  {
    id: 3,
    label: 'Categoria 03',
    title: 'GASTRONOMIA',
    subtitle: 'O sabor que transforma carreiras',
    description:
      'Cozinha básica, Confeitaria, Padaria e Doceria. Do fogão ao empreendimento gastronômico profissional.',
    coursesCount: 10,
    image: '/imagem/proficao/proficao.png',
    Icon: ChefHat,
    accent: '#fbbf24',
  },
  {
    id: 4,
    label: 'Categoria 04',
    title: 'TECNOLOGIA',
    subtitle: 'O futuro começa com conhecimento',
    description:
      'Informática Básica, Manutenção de Computadores, Excel e Internet. Habilidades digitais essenciais para o mercado.',
    coursesCount: 6,
    image: '/imagem/proficao/proficao3.png',
    Icon: Monitor,
    accent: '#60a5fa',
  },
  {
    id: 5,
    label: 'Categoria 05',
    title: 'SAÚDE',
    subtitle: 'Cuidar de vidas é uma vocação',
    description:
      'Primeiros Socorros, Cuidador de Idosos, Auxiliar de Farmácia. Formação humanizada para profissões que fazem diferença.',
    coursesCount: 7,
    image: '/imagem/proficao/enfermagem.png',
    Icon: Heart,
    accent: '#34d399',
  },
];

/* Stable particle positions — computed once, never change across renders */
const PARTICLES = categorias.map((_, ci) =>
  Array.from({ length: 15 }, (__, i) => ({
    top:   `${10 + Math.sin((ci * 100 + i) * 0.731) * 38 + 38}%`,
    left:  `${10 + Math.cos((ci * 100 + i) * 0.573) * 38 + 38}%`,
    dur:   `${14 + (i % 5) * 3}s`,
    delay: `${i * 0.65}s`,
  }))
);

/* ─── Component ─── */
export default function CategoriasCursos() {
  // Configured to move right-to-left smoothly, loop, support drag/swipe, no pause on hover/interaction
  // Speed is set to 0.2 for a very slow, continuous, and readable full-screen slider
  const [emblaRef] = useEmblaCarousel({ loop: true, dragFree: false }, [
    AutoScroll({ speed: 0.2, stopOnInteraction: false, stopOnMouseEnter: false })
  ]);

  const handleCTA = () =>
    document.getElementById('cursos-list-section')?.scrollIntoView({ behavior: 'smooth' });

  // 5 slides of 100vw is perfect for infinite looping without duplication in full viewportwidth
  return (
    <div id="categorias-section" className="w-full h-[100vh] bg-black overflow-hidden relative" ref={emblaRef}>
      <div className="flex h-full">
        {categorias.map((cat, pi) => {
          const { Icon } = cat;
          return (
            <div 
              key={cat.id} 
              className="flex-shrink-0 w-screen h-full relative overflow-hidden bg-black select-none"
            >
              {/* Background image */}
              <img
                src={cat.image}
                alt={cat.title}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/imagem/proficao/proficao.png';
                }}
              />
              <div className="absolute inset-0 bg-black/52" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 62% 48%, ${cat.accent}18, transparent 58%)`,
                  mixBlendMode: 'overlay',
                }}
              />

              {/* Floating particles */}
              {PARTICLES[pi].map((p, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full blur-[1px] pointer-events-none"
                  style={{
                    top: p.top, left: p.left,
                    animation: `catFloat ${p.dur} ease-in-out infinite`,
                    animationDelay: p.delay,
                  }}
                />
              ))}

              {/* Content — single full-width column */}
              <div className="relative z-20 h-full max-w-7xl mx-auto w-full px-8 md:px-20 flex items-center">
                <div className="flex flex-col justify-center max-w-3xl text-left">
                  {/* Category label */}
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-5 h-5" style={{ color: cat.accent }} />
                    <span className="text-sm font-mono tracking-[0.3em] uppercase text-white/50">
                      {cat.label}
                    </span>
                  </div>

                  {/* Subtitle */}
                  <p className="font-sans italic text-lg text-white/55 mb-4">
                    {cat.subtitle}
                  </p>

                  {/* Giant title */}
                  <h2
                    className="font-display font-black leading-[0.72] tracking-tighter text-white uppercase"
                    style={{
                      fontSize: 'clamp(4rem, 11vw, 15rem)',
                      textShadow: '0 20px 80px rgba(0,0,0,0.8)',
                    }}
                  >
                    {cat.title}
                  </h2>

                  {/* Description */}
                  <p
                    className="border-l-2 pl-6 text-white/75 max-w-sm text-base leading-relaxed mt-8"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {cat.description}
                  </p>

                  {/* CTA button */}
                  <div className="mt-10">
                    <button
                      onClick={handleCTA}
                      className="group relative px-10 py-5 rounded-full font-semibold tracking-widest text-sm uppercase text-white cursor-pointer overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.18)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <span className="relative z-10 group-hover:text-[#004564] transition-colors duration-300">
                        Ver cursos desta categoria
                      </span>
                      <span className="absolute inset-0 bg-white origin-bottom scale-y-0 group-hover:scale-y-100 rounded-full transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom panel label */}
              <div className="absolute bottom-8 left-20 z-30 select-none pointer-events-none hidden md:block">
                <span className="font-mono text-[10px] tracking-[0.4em] text-white/20 uppercase">
                  {cat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes catFloat {
          0%,100% { transform:translateY(0)     scale(1);    opacity:.28; }
          50%      { transform:translateY(-18px) scale(1.22); opacity:.58; }
        }
      `}</style>
    </div>
  );
}
