import React, { useState, useEffect } from 'react';
import { CalendarCheck, BookOpen, GraduationCap, ExternalLink, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from './Header';

export default function Hero() {
  const [stats, setStats] = useState({
    vagasHoje: 0,
    vagas2026: 677,
    cursosNoCatalogo: 0,
  });
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('/api/estatisticas');
        let statsData = { vagasHoje: 0, vagas2026: 677 };
        if (statsRes.ok) {
          statsData = await statsRes.json();
        }

        const coursesRes = await fetch('/api/cursos-public');
        let coursesCount = 0;
        if (coursesRes.ok) {
          const courses = await coursesRes.json();
          coursesCount = courses.length;
        }

        setStats({
          vagasHoje: statsData.vagasHoje || 0,
          vagas2026: statsData.vagas2026 || 677,
          cursosNoCatalogo: coursesCount || 38, // Fallback to database catalog size
        });
      } catch (err) {
        console.warn('Falha ao obter estatísticas para o Hero', err);
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
    <section className="w-full h-screen relative overflow-hidden bg-black flex flex-col justify-between">
      {/* Background Video & Image Fallback */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] saturate-[1.10] transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          src="https://res.cloudinary.com/dlrdwblso/video/upload/v1782242607/Vit%C3%B3ria_da_sa%C3%BAde_e_do_esporte_-_Prefeitura_de_Vit%C3%B3ria_1080p_h264_youtube_i9ozky.mp4"
        />
        <img
          src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=2000"
          alt="Estudando"
          className={`absolute inset-0 w-full h-full object-cover brightness-[0.92] saturate-[1.15] transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Sleek Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/40" />
      </div>

      {/* Floating Navbar */}
      <Header transparent={true} />

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex-grow flex flex-col lg:flex-row items-center justify-between pt-36 pb-24 gap-12">
        
        {/* Left Column: Title and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', staggerChildren: 0.15 }}
          className="flex flex-col items-start text-left max-w-2xl"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-[2px] bg-primary mb-6" 
          />
          
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-sans italic text-sm text-white tracking-widest uppercase mb-4"
          >
            Prefeitura Municipal de Vitória
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl xl:text-8xl font-display font-extrabold leading-[0.9] tracking-tighter text-white text-shadow-large"
          >
            TRANSFORME<br />
            <span className="text-accent">SEU FUTURO</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-base md:text-lg text-white max-w-lg mt-6 leading-relaxed"
          >
            Cursos profissionalizantes gratuitos para os cidadãos de Vitória/ES. 
            Encontre sua área, garanta sua vaga e transforme sua carreira.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 mt-8 w-full sm:w-auto"
          >
            <button
              onClick={() => scrollToSection('cursos-section')}
              className="px-8 py-3.5 bg-accent hover:bg-accent/90 text-white rounded-full uppercase text-xs tracking-widest font-bold shadow-lg hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
            >
              Buscar Minha Vaga
            </button>
            <button
              onClick={() => scrollToSection('categorias-section')}
              className="px-8 py-3.5 glass hover:bg-white/20 text-white rounded-full uppercase text-xs tracking-widest font-bold hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
            >
              Ver Categorias
            </button>
          </motion.div>
        </motion.div>

        {/* Right Column: Statistics Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="w-full max-w-[340px] glass p-8 rounded-3xl shadow-2xl flex flex-col border border-white/10 glow-primary relative overflow-hidden"
        >
          {/* Subtle glow orb inside card */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent/20 rounded-full filter blur-2xl animate-pulse-slow pointer-events-none" />

          <h3 className="font-display font-bold text-white text-lg mb-6 tracking-wide">
            Vagas disponíveis agora
          </h3>

          <div className="flex flex-col gap-6">
            {/* Stat 1: Vagas Abertas Hoje */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/10 text-accent glow-accent">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-white leading-none">
                  {stats.vagasHoje}
                </span>
                <span className="text-xs text-white/50 tracking-wide mt-1">
                  vagas abertas hoje
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-white/10" />

            {/* Stat 2: Vagas Previstas */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/10 text-accent glow-accent">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-white leading-none">
                  {stats.vagas2026}
                </span>
                <span className="text-xs text-white/50 tracking-wide mt-1">
                  vagas previstas em 2026
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-white/10" />

            {/* Stat 3: Cursos no Catálogo */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/10 text-accent glow-accent">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-mono font-bold text-white leading-none">
                  {stats.cursosNoCatalogo}
                </span>
                <span className="text-xs text-white/50 tracking-wide mt-1">
                  cursos no catálogo
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => scrollToSection('cursos-section')}
            className="w-full bg-accent hover:bg-accent/90 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs text-white mt-8 hover:scale-[1.02] transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar Pré-inscrição
          </button>
        </motion.div>
      </div>

      {/* Info Banner at Bottom */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        onClick={() => window.open('https://vivacidade.vitoria.es.gov.br/', '_blank')}
        className="relative z-20 w-full py-4 px-6 bg-accent hover:bg-accent/95 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 group select-none text-center"
      >
        <ExternalLink className="w-4 h-4 text-white animate-pulse" />
        <span className="text-xs md:text-sm font-bold text-white tracking-wider">
          Para consultar atividades esportivas e culturais, clique aqui e acesse o VIVAcidade →
        </span>
      </motion.div>
    </section>
  );
}
