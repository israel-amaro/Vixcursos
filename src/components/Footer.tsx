import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const handleNavClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-slate-900 text-white/80 py-16 px-6 md:px-12 border-t border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Identity */}
          <div className="flex flex-col items-start">
            <div className="flex select-none mb-2">
              <img 
                src="/imagem/VIxcursos.png" 
                alt="VIX Cursos" 
                className="h-10 w-auto object-contain"
              />
            </div>
            
            <p className="text-sm text-white/40 mt-4 max-w-xs leading-relaxed">
              Plataforma oficial de cursos profissionalizantes gratuitos da Prefeitura Municipal de Vitória, Espírito Santo.
            </p>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://facebook.com/prefeituradevitoria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da PMV"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://instagram.com/prefeituradevitoria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da PMV"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href="https://youtube.com/prefeituradevitoria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube da PMV"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all flex items-center justify-center"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col items-start md:pl-10">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-6">
              Navegação
            </h4>
            <nav className="flex flex-col gap-3 text-sm">
              <Link to="/" className="text-white/50 hover:text-white transition-colors">
                Início
              </Link>
              <button
                onClick={() => handleNavClick('cursos-section')}
                className="text-left text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Buscar Cursos
              </button>
              <button
                onClick={() => handleNavClick('categorias-section')}
                className="text-left text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Categorias
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('abrir-chat-quiz'));
                }}
                className="text-left text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none block"
              >
                Quiz Vocacional
              </button>
              <Link to="/sobre" className="text-white/50 hover:text-white transition-colors">
                Sobre o VIX Cursos
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="flex flex-col items-start">
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-white/30 mb-6">
              Contato
            </h4>
            
            <div className="flex flex-col gap-4 text-sm text-white/50">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>(27) 3135-1000</span>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="break-all">vixcursos@vitoria.es.gov.br</span>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Vitória, Espírito Santo — Brasil</span>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Atendimento: Seg a Sex, das 8h às 17h</span>
              </div>
            </div>
          </div>

        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-white/10 my-10" />

        {/* Bottom footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <span className="text-[10px] text-white/20 tracking-wider font-mono">
            © 2026 VIX Cursos — Prefeitura Municipal de Vitória. Todos os direitos reservados.
          </span>
          <div className="flex items-center gap-3 justify-center md:justify-end select-none">
            <span className="text-[10px] text-white/20 tracking-wider font-mono">
              Desenvolvido para a comunidade capixaba 💙
            </span>
            <span className="text-white/10 hidden sm:inline">|</span>
            <a
              href="/admin/login.html"
              className="text-[10px] text-white/10 hover:text-white/40 hover:bg-white/[0.02] px-2 py-1 rounded transition-all duration-300 font-mono flex items-center gap-1.5 select-none border border-transparent hover:border-white/5"
              title="Painel de Administração"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Acesso Restrito
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
