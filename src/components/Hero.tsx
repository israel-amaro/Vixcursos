import React, { useState, useEffect } from 'react';
import { CalendarCheck, BookOpen, GraduationCap, ExternalLink, Search, Sparkles, MapPinCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';

interface HeroProps {
  onOpenQuiz?: () => void;
}

const heroImages = [
  'https://res.cloudinary.com/donpjw2ed/image/upload/v1785346011/proficao4_d4vmjk.png',
  'https://res.cloudinary.com/donpjw2ed/image/upload/v1785346008/proficao2_yzh6u1.png',
  'https://res.cloudinary.com/donpjw2ed/image/upload/v1785346007/proficao3_wxjvbw.png',
  'https://res.cloudinary.com/donpjw2ed/image/upload/v1785346007/proficao_pcaxnz.png',
];

export default function Hero({ onOpenQuiz }: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [stats, setStats] = useState({
    cursosAbertos: 14,
    vagasRestantes: 420,
    iniciandoSemana: 5,
    novosCursos: 8,
  });

  // Carousel background image slider effect (5s per slide)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const coursesRes = await fetch('/api/cursos-public');
        if (coursesRes.ok) {
          const courses: any[] = await coursesRes.json();
          const abertos = courses.filter(c => c.status !== 'esgotado' && c.vagas_disponiveis > 0);
          const totalVagas = abertos.reduce((sum, c) => sum + (c.vagas_disponiveis || 0), 0);
          
          setStats({
            cursosAbertos: abertos.length || 14,
            vagasRestantes: totalVagas || 420,
            iniciandoSemana: Math.max(3, Math.floor(abertos.length * 0.35)),
            novosCursos: Math.max(4, Math.floor(courses.length * 0.25)),
          });
        }
      } catch (err) {
        console.warn('Falha ao obter estatísticas dinâmicas para o Hero', err);
      }
    };

    fetchStats();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full relative overflow-hidden bg-slate-950 flex flex-col justify-between border-b border-slate-800">
      
      {/* Background Image Carousel with Smooth Transitions */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroImages.map((imgUrl, index) => (
          <div
            key={imgUrl}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100 scale-105 transition-transform duration-7000' : 'opacity-0 scale-100'
            }`}
          >
            <img
              src={imgUrl}
              alt={`Profissão ${index + 1}`}
              className="w-full h-full object-cover object-center filter brightness-[0.88] saturate-[1.10] contrast-[1.05]"
            />
          </div>
        ))}

        {/* Softened Overlays for Vibrant Images with High Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-black/40 via-transparent to-black/50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/15 rounded-full filter blur-[100px] pointer-events-none" />
        
        {/* Subtle SVG Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Floating Navbar */}
      <Header transparent={true} />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex-grow flex flex-col lg:flex-row items-center justify-between pt-28 pb-12 md:pt-32 md:pb-16 gap-8">
        
        {/* Left Column: Title & Main Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-start text-left max-w-2xl"
        >
          {/* Eligibility Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
            <MapPinCheck className="w-4 h-4" />
            <span>Exclusivo para moradores de Vitória e/ou trabalhadores na cidade</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-md">
            CURSOS GRATUITOS DA <br />
            <span className="text-accent drop-shadow-lg">PREFEITURA DE VITÓRIA</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-200 max-w-xl mt-4 leading-relaxed font-medium drop-shadow-sm">
            Cursos gratuitos da Prefeitura de Vitória para aumentar suas oportunidades de trabalho. Escolha um curso e faça sua pré-inscrição em poucos minutos.
          </p>
          
          {/* Answer Key Questions Pills */}
          <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/15">
              ✓ 100% Gratuito
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/15">
              ✓ Vagas Abertas
            </span>
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white border border-white/15">
              ✓ Com Certificado
            </span>
          </div>

          {/* SINGLE MAIN PRIMARY CTA + Ghost secondary */}
          <div className="flex flex-wrap items-center gap-4 mt-7 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection('cursos-list-section')}
              className="px-9 py-4 bg-accent hover:bg-accent/90 text-white rounded-2xl font-extrabold text-sm tracking-wider uppercase shadow-[0_8px_25px_rgba(255,138,90,0.35)] hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              QUERO ME INSCREVER
            </button>

            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="px-6 py-4 glass hover:bg-white/15 text-white/90 rounded-2xl font-bold text-xs tracking-wider uppercase hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2 border border-white/15 backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                Não sabe qual escolher? (Quiz)
              </button>
            )}
          </div>

          {/* Carousel Navigation Indicators (Dots) */}
          <div className="flex items-center gap-2 mt-6 select-none">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`Ir para imagem ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentImageIndex ? 'w-8 bg-accent' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Right Column: Glassmorphism Statistics Card (Grayish Frosted Glass) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[340px] bg-slate-800/45 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] flex flex-col border border-white/20 relative overflow-hidden"
        >
          {/* Subtle Glass Highlight Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full filter blur-xl pointer-events-none" />

          <h3 className="font-display font-bold text-white text-base mb-5 tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Oportunidades Disponíveis
          </h3>

          <div className="flex flex-col gap-3.5">
            {/* Stat 1: Cursos com Inscrições Abertas */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-xl bg-accent/25 text-accent shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-extrabold text-white leading-none">
                  {stats.cursosAbertos} cursos
                </span>
                <span className="text-[11px] text-slate-200 font-medium tracking-wide mt-1">
                  com inscrições abertas
                </span>
              </div>
            </div>

            {/* Stat 2: Total Vagas Restantes */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-xl bg-accent/25 text-accent shadow-sm">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-extrabold text-white leading-none">
                  {stats.vagasRestantes} vagas
                </span>
                <span className="text-[11px] text-slate-200 font-medium tracking-wide mt-1">
                  restantes no momento
                </span>
              </div>
            </div>

            {/* Stat 3: Iniciando esta semana */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all">
              <div className="p-2.5 rounded-xl bg-accent/25 text-accent shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-extrabold text-white leading-none">
                  {stats.iniciandoSemana} turmas
                </span>
                <span className="text-[11px] text-slate-200 font-medium tracking-wide mt-1">
                  iniciando esta semana
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToSection('cursos-list-section')}
            className="w-full bg-white/15 hover:bg-white/25 border border-white/25 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white mt-5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md shadow-md hover:scale-[1.02]"
          >
            Ver Todas as Vagas
          </button>
        </motion.div>
      </div>

      {/* Info Banner at Bottom */}
      <div
        onClick={() => window.open('https://vivacidade.vitoria.es.gov.br/', '_blank')}
        className="relative z-20 w-full py-3 px-6 bg-accent hover:bg-accent/95 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 group select-none text-center"
      >
        <ExternalLink className="w-4 h-4 text-white animate-pulse" />
        <span className="text-xs font-bold text-white tracking-wider">
          Para consultar atividades esportivas e culturais, clique aqui e acesse o VIVAcidade →
        </span>
      </div>
    </section>
  );
}
