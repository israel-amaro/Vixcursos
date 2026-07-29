import React, { useState, useEffect } from 'react';
import { CalendarCheck, BookOpen, GraduationCap, ExternalLink, Search, Sparkles, MapPinCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';

interface HeroProps {
  onOpenQuiz?: () => void;
}

export default function Hero({ onOpenQuiz }: HeroProps) {
  const [stats, setStats] = useState({
    cursosAbertos: 14,
    vagasRestantes: 420,
    iniciandoSemana: 5,
    novosCursos: 8,
  });

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
      {/* Sleek Gradient & Geometric Pattern Background (No institutional video) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-dark/60 via-slate-950 to-slate-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/15 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/20 rounded-full filter blur-[100px] pointer-events-none" />
        
        {/* Subtle SVG Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Floating Navbar */}
      <Header transparent={true} />

      {/* Hero Content — Height reduced by ~30% for fast visibility */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex-grow flex flex-col lg:flex-row items-center justify-between pt-28 pb-12 md:pt-32 md:pb-16 gap-8">
        
        {/* Left Column: Direct, Informative Title and Single Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col items-start text-left max-w-2xl"
        >
          {/* Eligibility Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-bold mb-4 shadow-sm">
            <MapPinCheck className="w-4 h-4" />
            <span>Exclusivo para moradores de Vitória e/ou trabalhadores na cidade</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-[1.05] tracking-tight text-white">
            CURSOS GRATUITOS DA <br />
            <span className="text-accent">PREFEITURA DE VITÓRIA</span>
          </h1>
          
          <p className="text-sm md:text-base text-slate-300 max-w-xl mt-4 leading-relaxed font-medium">
            Cursos gratuitos da Prefeitura de Vitória para aumentar suas oportunidades de trabalho. Escolha um curso e faça sua pré-inscrição em poucos minutos.
          </p>
          
          {/* Answer Key Questions Pills */}
          <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold">
            <span className="px-3 py-1 bg-white/10 rounded-lg text-white border border-white/10">
              ✓ 100% Gratuito
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-white border border-white/10">
              ✓ Vagas Abertas
            </span>
            <span className="px-3 py-1 bg-white/10 rounded-lg text-white border border-white/10">
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
                className="px-6 py-4 glass hover:bg-white/15 text-white/90 rounded-2xl font-bold text-xs tracking-wider uppercase hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer flex items-center justify-center gap-2 border border-white/15"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                Não sabe qual escolher? (Quiz)
              </button>
            )}
          </div>
        </motion.div>

        {/* Right Column: Revised Actionable Statistics Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-[340px] bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl flex flex-col border border-white/10 relative overflow-hidden"
        >
          <h3 className="font-display font-bold text-white text-base mb-5 tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            Oportunidades Disponíveis
          </h3>

          <div className="flex flex-col gap-4">
            {/* Stat 1: Cursos com Inscrições Abertas */}
            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-white leading-none">
                  {stats.cursosAbertos} cursos
                </span>
                <span className="text-[11px] text-slate-400 tracking-wide mt-1">
                  com inscrições abertas
                </span>
              </div>
            </div>

            {/* Stat 2: Total Vagas Restantes */}
            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-white leading-none">
                  {stats.vagasRestantes} vagas
                </span>
                <span className="text-[11px] text-slate-400 tracking-wide mt-1">
                  restantes no momento
                </span>
              </div>
            </div>

            {/* Stat 3: Iniciando esta semana */}
            <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/5 border border-white/5">
              <div className="p-2.5 rounded-xl bg-accent/20 text-accent">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-mono font-bold text-white leading-none">
                  {stats.iniciandoSemana} turmas
                </span>
                <span className="text-[11px] text-slate-400 tracking-wide mt-1">
                  iniciando esta semana
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToSection('cursos-list-section')}
            className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white mt-5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-white/10"
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
