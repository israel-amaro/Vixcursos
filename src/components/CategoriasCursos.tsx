/**
 * CategoriasCursos — Horizontal Cinematic Scroll
 *
 * ARCHITECTURE (bulletproof React + GSAP):
 * ─────────────────────────────────────────
 * ❌ pin: true  → modifies DOM structure → React reconciler loses node references
 * ✅ CSS sticky → element stays in flow → React never conflicts
 *
 * The trick:
 *   <section style="height: N*100vh">          ← creates scroll distance
 *     <div style="position:sticky; top:0">     ← CSS holds it in viewport
 *       <div ref={trackRef}>                   ← GSAP only moves translateX
 *         {panels}
 *       </div>
 *     </div>
 *   </section>
 *
 * GSAP only mutates `transform: translateX()` — zero DOM structure changes.
 * Works correctly with React.StrictMode double-mount via gsap.matchMedia() cleanup.
 */

import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scissors, Shirt, ChefHat, Monitor, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef  = useRef<HTMLDivElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const dotsRef     = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Direct DOM dot update — zero React state changes from GSAP */
  function setActiveDot(idx: number) {
    if (!dotsRef.current) return;
    dotsRef.current.querySelectorAll<HTMLElement>('.cat-dot').forEach((dot, i) => {
      const acc = categorias[i].accent;
      Object.assign(dot.style, i === idx
        ? { height: '6rem',   opacity: '1',    backgroundColor: acc,                      boxShadow: `0 0 14px 3px ${acc}66` }
        : { height: '2.5rem', opacity: '0.25', backgroundColor: 'rgba(255,255,255,0.3)', boxShadow: 'none' }
      );
    });
  }

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    /* ══════════════════════════════════════════════════════
       DESKTOP ≥ 1024px
       CSS sticky holds the viewport frame.
       GSAP scrubs translateX on the inner flex track.
       NO pin: true → NO DOM structure mutation → NO React conflict.
    ══════════════════════════════════════════════════════ */
    mm.add('(min-width: 1024px)', () => {
      const ctx = gsap.context(() => {
        const section = sectionRef.current!;
        const track   = trackRef.current!;

        // How far to scroll horizontally (total panels width − one viewport)
        const dist = () => track.scrollWidth - window.innerWidth;

        // Main tween: scrub the X translation of the track
        const mainTween = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,           // the full-height section drives scroll
            start: 'top top',
            end: () => `+=${dist()}`,   // ends when we've scrolled one panel-width × N
            scrub: 1.5,
            invalidateOnRefresh: true,
            onUpdate(self) {
              // progress bar
              if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${self.progress})`;
              }
              // active dot
              setActiveDot(
                Math.min(categorias.length - 1, Math.floor(self.progress * categorias.length * 1.001))
              );
            },
          },
        });

        // Text entrance animation per panel, tied to horizontal scroll progress
        track.querySelectorAll<HTMLElement>('.cat-panel').forEach((panel) => {
          gsap.from(panel.querySelectorAll<HTMLElement>('.cat-anim'), {
            opacity: 0,
            scale: 0.93,
            filter: 'blur(14px)',
            stagger: 0.13,
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: mainTween,  // tied to horizontal scroll, not window
              start: 'left 85%',
              toggleActions: 'play none none none',
            },
          });
        });

        setActiveDot(0);
      }, sectionRef);

      return () => ctx.revert();
    });

    /* ══════════════════════════════════════════════════════
       MOBILE < 1024px — vertical stack, fade-in per panel
    ══════════════════════════════════════════════════════ */
    mm.add('(max-width: 1023px)', () => {
      const ctx = gsap.context(() => {
        sectionRef.current!.querySelectorAll<HTMLElement>('.cat-panel').forEach((panel) => {
          gsap.from(panel.querySelectorAll<HTMLElement>('.cat-anim'), {
            opacity: 0,
            scale: 0.95,
            filter: 'blur(12px)',
            stagger: 0.12,
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          });
        });
      }, sectionRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const handleCTA = () =>
    document.getElementById('cursos-section')?.scrollIntoView({ behavior: 'smooth' });

  /* Dot click: calculate the window scroll position that shows panel [i] */
  const scrollToPanel = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: sectionTop + i * window.innerWidth, behavior: 'smooth' });
  };

  return (
    <>
      {/* Pure CSS keyframes — no Tailwind JIT, no runtime overhead */}
      <style>{`
        @keyframes catFloat {
          0%,100% { transform:translateY(0)     scale(1);    opacity:.28; }
          50%      { transform:translateY(-18px) scale(1.22); opacity:.58; }
        }
        @keyframes catSpin  { to   { transform:rotate(360deg); } }
        @keyframes catPulse {
          0%   { transform:scale(1);    opacity:.5; }
          100% { transform:scale(1.72); opacity:0;  }
        }

        /* ─ Desktop: sticky viewport + flex row track ─ */
        @media (min-width: 1024px) {
          /*
           * SCROLL DISTANCE FIX:
           * On widescreen (vw > vh), 5×vh < 4×vw — section ends too early.
           * Correct formula: 100vh (first panel) + (N-1)×100vw (remaining panels).
           * This guarantees section scroll distance = (N-1)×vw = track.scrollWidth - vw.
           */
          .cat-section   { height: calc(100vh + 400vw); }
          .cat-sticky    { position:sticky; top:0; height:100vh; overflow:hidden; }
          .cat-track     { display:flex; flex-direction:row; height:100%; will-change:transform; }
          .cat-panel     { width:100vw; height:100vh; flex-shrink:0; }
          .cat-progress  { display:block; }
          .cat-sidebar   { display:flex; }
          .cat-hint      { display:block; }
        }

        /* ─ Mobile: stacked panels, normal scroll ─ */
        @media (max-width: 1023px) {
          .cat-section   { height:auto; }
          .cat-sticky    { position:static; height:auto; overflow:visible; }
          .cat-track     { display:flex; flex-direction:column; }
          .cat-panel     { width:100%; height:100svh; }
          .cat-progress  { display:none !important; }
          .cat-sidebar   { display:none !important; }
          .cat-hint      { display:none !important; }
        }

        /* ─ Shared panel styles ─ */
        .cat-panel        { position:relative; overflow:hidden; background:#000; }
        .cat-dot {
          width:3px; border-radius:9999px; cursor:pointer;
          transition: height .5s cubic-bezier(.22,1,.36,1),
                      background-color .4s ease, box-shadow .4s ease, opacity .4s ease;
        }
      `}</style>

      {/* SECTION — height drives scroll distance on desktop */}
      <div ref={sectionRef} id="categorias-section" className="cat-section relative bg-black">

        {/* STICKY FRAME — CSS sticky, never touched by GSAP */}
        <div className="cat-sticky">

          {/* TRACK — only this element's transform is changed by GSAP */}
          <div ref={trackRef} className="cat-track">
            {categorias.map((cat, pi) => {
              const { Icon } = cat;
              return (
                <div key={cat.id} className="cat-panel">

                  {/* Background */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/52" />
                  <div
                    className="absolute inset-0"
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
                    <div className="flex flex-col justify-center max-w-3xl">

                      {/* Category label */}
                      <div className="cat-anim flex items-center gap-3 mb-6">
                        <Icon className="w-5 h-5" style={{ color: cat.accent }} />
                        <span className="text-sm font-mono tracking-[0.3em] uppercase text-white/50">
                          {cat.label}
                        </span>
                      </div>

                      {/* Subtitle */}
                      <p className="cat-anim font-sans italic text-lg text-white/55 mb-4">
                        {cat.subtitle}
                      </p>

                      {/* Giant title */}
                      <h2
                        className="cat-anim font-display font-black leading-[0.72] tracking-tighter text-white"
                        style={{
                          fontSize: 'clamp(4rem, 11vw, 15rem)',
                          textShadow: '0 20px 80px rgba(0,0,0,0.8)',
                        }}
                      >
                        {cat.title}
                      </h2>

                      {/* Description */}
                      <p
                        className="cat-anim border-l-2 pl-6 text-white/75 max-w-sm text-base leading-relaxed mt-8"
                        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                      >
                        {cat.description}
                      </p>

                      {/* CTA button */}
                      <div className="cat-anim mt-10">
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
                  </div>{/* /content */}

                  {/* Bottom panel label */}
                  <div className="absolute bottom-8 left-20 z-30 select-none pointer-events-none">
                    <span className="font-mono text-[10px] tracking-[0.4em] text-white/20 uppercase">
                      {cat.label}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>{/* /track */}

          {/* ─ Dot sidebar (inside sticky so it stays in viewport) ─ */}
          <div
            ref={dotsRef}
            className="cat-sidebar absolute left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40"
          >
            {categorias.map((_, i) => (
              <div
                key={i}
                className="cat-dot"
                onClick={() => scrollToPanel(i)}
                style={{
                  height:          i === 0 ? '6rem'                    : '2.5rem',
                  backgroundColor: i === 0 ? categorias[0].accent      : 'rgba(255,255,255,0.3)',
                  opacity:         i === 0 ? 1                          : 0.25,
                  boxShadow:       i === 0 ? `0 0 14px 3px ${categorias[0].accent}66` : 'none',
                }}
              />
            ))}
          </div>

          {/* ─ Progress bar ─ */}
          <div className="cat-progress absolute bottom-0 left-0 right-0 h-[2px] z-40">
            <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div
              ref={progressRef}
              className="absolute inset-0 origin-left"
              style={{
                background: 'linear-gradient(90deg,#ff8a5a,#f472b6)',
                transform: 'scaleX(0)',
                transition: 'transform 0.06s linear',
              }}
            />
          </div>

          {/* ─ Scroll hint ─ */}
          <div className="cat-hint absolute bottom-10 right-8 z-40 select-none pointer-events-none">
            <span className="text-xs tracking-[0.3em] text-white/25 font-mono uppercase">
              ROLE PARA VER MAIS CATEGORIAS →
            </span>
          </div>

        </div>{/* /sticky */}
      </div>{/* /section */}
    </>
  );
}
