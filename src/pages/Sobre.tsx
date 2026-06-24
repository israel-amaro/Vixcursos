import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { BookOpen, Award, CheckCircle, MapPin, Truck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sobre() {
  return (
    <div className="min-h-screen flex flex-col justify-between text-white relative overflow-hidden select-none">

      {/* === PARALLAX BACKGROUND LAYER 1 — Praça do Papa (hero/top) === */}
      <div
        className="fixed inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(4,8,22,0.42) 0%, rgba(7,17,31,0.50) 60%, rgba(11,23,48,0.62) 100%), url('/imagem/pracadopapa.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* === PARALLAX BACKGROUND LAYER 2 — Santuário (middle sections) === */}
      <div
        className="absolute top-[80vh] left-0 w-full h-[150vh] z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(4,8,22,0.45) 0%, rgba(7,17,31,0.50) 50%, rgba(11,23,48,0.60) 100%), url('/imagem/santuario.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* === PARALLAX BACKGROUND LAYER 3 — Palácio Anchieta (bottom sections) === */}
      <div
        className="absolute top-[210vh] left-0 w-full h-[200vh] z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(180deg, rgba(4,8,22,0.45) 0%, rgba(7,17,31,0.50) 50%, rgba(11,23,48,0.62) 100%), url('/imagem/palacioanchieta.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-400/15 blur-[130px] pointer-events-none animate-pulse-slow z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-accent/15 blur-[130px] pointer-events-none animate-pulse-slow z-0" />

      <Header />

      <main className="flex-grow pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col gap-16 relative z-10" style={{ isolation: 'isolate' }}>
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-4">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="px-4 py-1.5 bg-accent/20 text-accent border border-accent/25 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Programa oficial da Prefeitura de Vitória
            </span>
            <h1 className="text-3xl md:text-5xl xl:text-6xl font-display font-extrabold text-white leading-tight tracking-tight">
              Qualificação gratuita com foco em oportunidade real
            </h1>
            <p className="text-white/80 text-sm md:text-base mt-4 leading-relaxed max-w-xl">
              O VIX Cursos conecta formação, empregabilidade e desenvolvimento local. 
              A proposta é aproximar cursos profissionalizantes de quem quer iniciar, 
              retomar ou fortalecer sua trajetória no mercado.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 w-full sm:w-auto">
              <Link
                to="/"
                className="px-8 py-3.5 bg-accent hover:bg-accent/95 text-white rounded-full uppercase text-xs tracking-widest font-extrabold shadow-lg hover:scale-105 transition-all w-full sm:w-auto text-center border border-white/10"
              >
                Explorar Cursos
              </Link>
            </div>
          </div>

          {/* Highlight Info Card */}
          <div className="lg:col-span-5 glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full filter blur-xl pointer-events-none" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3">
              Impacto do portal
            </span>
            <h2 className="text-xl font-display font-bold text-white mb-6 leading-snug">
              Uma jornada simples para descobrir, escolher e se inscrever
            </h2>
            <ul className="flex flex-col gap-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5 animate-pulse" />
                <span>Busca de cursos por categoria, faixa etária e local.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5 animate-pulse" />
                <span>Pré-inscrição digital com fluxo mais rápido e organizado.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5 animate-pulse" />
                <span>Informação clara sobre vagas, horários e unidades.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Steps Process Grid */}
        <section className="flex flex-col gap-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
              Como funciona
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mt-2 tracking-tight">
              Uma experiência pensada para facilitar o acesso
            </h2>
            <p className="text-xs md:text-sm text-white/80 mt-3 font-medium leading-relaxed">
              Do primeiro contato até a entrada na turma, o fluxo foi desenhado para ser direto e acessível.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Descoberta de cursos", desc: "O usuário explora turmas por área, unidade, idade e disponibilidade de vagas." },
              { num: "02", title: "Escolha orientada", desc: "O portal ajuda na decisão com informações objetivas e suporte do assistente virtual Vitoruga." },
              { num: "03", title: "Pré-inscrição online", desc: "Com poucos dados, a pessoa demonstra interesse e entra no fluxo de organização da turma." },
              { num: "04", title: "Conexão com a oportunidade", desc: "As turmas aproximam qualificação, renda e desenvolvimento profissional no território." }
            ].map((step, idx) => (
              <motion.article
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col items-start text-left hover:border-accent/40 transition-all duration-300"
              >
                <span className="font-display font-black text-4xl text-accent/30 select-none">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-white mt-3 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-white/70 mt-2 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Target Public and benefits panel */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-white/10 pt-16">
          {/* Target Box */}
          <div className="glass p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col items-start text-left">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
              Público prioritário
            </span>
            <h3 className="text-xl font-display font-extrabold text-white mb-6 leading-snug">
              Para quem o VIX Cursos foi desenhado
            </h3>
            <ul className="flex flex-col gap-4 text-sm text-white/85">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Moradores de Vitória em busca do primeiro passo profissional.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Pessoas que precisam de recolocação ou atualização de competências.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Quem quer empreender e fortalecer sua geração de renda.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Comunidades atendidas por unidades fixas e estruturas móveis.</span>
              </li>
            </ul>
          </div>

          {/* Benefits Grid Box */}
          <div className="glass p-8 rounded-3xl border border-white/10 shadow-xl flex flex-col items-start text-left justify-between">
            <div className="w-full">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">
                Benefícios
              </span>
              <h3 className="text-xl font-display font-extrabold text-white mb-6 leading-snug">
                O que o portal entrega de forma prática
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-white uppercase tracking-wider">Visual claro</strong>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Informações objetivas sobre turmas, horários e locais.
                </p>
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-white uppercase tracking-wider">Busca inteligente</strong>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Filtros por categoria, idade e região para facilitar a descoberta.
                </p>
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-white uppercase tracking-wider">Orientação inicial</strong>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Assistente virtual para apoiar dúvidas e a escolha de trilhas de formação.
                </p>
              </div>
              <div className="flex flex-col text-left">
                <strong className="text-xs font-bold text-white uppercase tracking-wider">Conexão territorial</strong>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Oferta mais próxima dos bairros e das necessidades da população.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Carreta Infrastructure Showcase */}
        <section className="flex flex-col gap-8 border-t border-white/10 pt-16">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
              Estrutura Itinerante
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mt-2 tracking-tight">
              Capacitação que chega a diferentes pontos da cidade
            </h2>
            <p className="text-xs md:text-sm text-white/80 mt-3 font-medium leading-relaxed">
              As unidades móveis ampliam o alcance do programa e aproximam a formação de quem mais precisa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Infrastructure Card 1 */}
            <article className="glass rounded-3xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="h-64 overflow-hidden relative select-none pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800"
                  alt="Carreta do QualificaVix"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  <span className="font-bold text-xs uppercase tracking-widest text-shadow">Unidade Móvel</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col items-start text-left">
                <h3 className="text-lg font-display font-bold text-white">
                  Unidade de qualificação profissional
                </h3>
                <p className="text-xs md:text-sm text-white/70 mt-2 leading-relaxed">
                  Estrutura itinerante montada em carretas equipadas para atender bairros com cursos técnicos práticos e formações de curta duração diretamente na comunidade.
                </p>
              </div>
            </article>

            {/* Infrastructure Card 2 */}
            <article className="glass rounded-3xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="h-64 overflow-hidden relative select-none pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800"
                  alt="Carreta Cozinha Capixaba"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-6 text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  <span className="font-bold text-xs uppercase tracking-widest text-shadow">Unidade Gastronômica</span>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col items-start text-left">
                <h3 className="text-lg font-display font-bold text-white">
                  Panificação e gastronomia
                </h3>
                <p className="text-xs md:text-sm text-white/70 mt-2 leading-relaxed">
                  Cozinha móvel sobre rodas totalmente preparada para atividades práticas do setor de alimentação, como confeitaria, doceria e técnicas de panificação rápida.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Partners Block */}
        <section className="flex flex-col gap-8 border-t border-white/10 pt-16 text-center">
          <div className="max-w-xl mx-auto">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
              Parcerias
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mt-2 tracking-tight">
              Instituições que fortalecem a qualidade da formação
            </h2>
            <p className="text-xs md:text-sm text-white/80 mt-3 font-medium leading-relaxed">
              O ecossistema do portal combina o poder público municipal com os principais players de formação profissional do Brasil.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-4">
            <a
              href="https://senaies.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/40 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-xl font-display font-black text-white text-xl"
            >
              SENAI ES
            </a>
            <a
              href="https://www.es.senac.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl hover:border-accent/40 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-xl font-display font-black text-white text-xl"
            >
              SENAC ES
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
