import { imageSrcSet } from '../lib/images';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Depoimentos from '../components/Depoimentos';
import MotionPill from '../components/MotionPill';
import PhotoReveal from '../components/PhotoReveal';
import { CheckCircle, Truck, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Sobre() {
  const reduced = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white text-[var(--ink)]">
      <Header />

      {/* Faixa Hero Institucional Editorial */}
      <section className="border-b-4 border-[var(--vitoria-gold)] bg-[#00486c] px-4 py-14 text-white sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="flex flex-col items-start text-left lg:col-span-7">
            <span className="mb-5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-bold uppercase tracking-wide text-white">
              Programa oficial da Prefeitura de Vitória
            </span>
            <h1 className="editorial-caps text-5xl leading-[0.9] text-white sm:text-6xl xl:text-7xl">
              Qualificação gratuita com foco em oportunidade real
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#e1edf2] sm:text-lg">
              O Qualifica Vix conecta formação, empregabilidade e desenvolvimento local, aproximando cursos profissionalizantes de quem quer iniciar, retomar ou fortalecer sua trajetória no mercado.
            </p>
            <div className="mt-8">
              <MotionPill as="link" to="/" tone="light" className="!bg-white !text-[#181916]" icon={<ArrowRight className="h-4 w-4" />}>
                Explorar Cursos
              </MotionPill>
            </div>
          </div>

          <div className="border border-white/20 bg-[#135b7c] p-6 text-white sm:p-8 lg:col-span-5">
            <span className="text-[13px] font-bold uppercase tracking-wide text-[var(--vitoria-gold)]">
              Impacto do portal
            </span>
            <h2 className="editorial-caps mt-2 mb-6 text-3xl text-white">
              Uma jornada simples para descobrir, escolher e se inscrever
            </h2>
            <ul className="flex flex-col gap-4 text-[15px] text-[#e1edf2]">
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--vitoria-gold)]" aria-hidden="true" />
                <span>Busca de cursos por categoria, faixa etária e local.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--vitoria-gold)]" aria-hidden="true" />
                <span>Pré-inscrição digital com fluxo mais rápido e organizado.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--vitoria-gold)]" aria-hidden="true" />
                <span>Informação clara sobre vagas, horários e unidades.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-grow flex-col gap-16 px-4 py-16 sm:px-6 sm:py-20">
        {/* Steps Process Grid */}
        <section className="flex flex-col gap-8">
          <div className="max-w-2xl">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              Como funciona
            </span>
            <h2 className="editorial-caps mt-2 text-4xl text-[var(--ink)] sm:text-5xl">
              Uma experiência pensada para facilitar o acesso
            </h2>
            <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ink-soft)]">
              Do primeiro contato até a entrada na turma, o fluxo foi desenhado para ser direto e acessível.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: '01', title: 'Descoberta de cursos', desc: 'O usuário explora turmas por área, unidade, idade e disponibilidade de vagas.' },
              { num: '02', title: 'Escolha orientada', desc: 'O portal ajuda na decisão com informações objetivas e suporte do assistente virtual Vitoruga.' },
              { num: '03', title: 'Pré-inscrição online', desc: 'Com poucos dados, a pessoa demonstra interesse e entra no fluxo de organização da turma.' },
              { num: '04', title: 'Conexão com a oportunidade', desc: 'As turmas aproximam qualificação, renda e desenvolvimento profissional no território.' },
            ].map((step, idx) => (
              <motion.article
                key={step.num}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={reduced ? { duration: 0 } : { duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-start border border-[var(--line)] bg-[var(--canvas)] p-6 text-left transition-colors hover:border-[var(--ink)]"
              >
                <span className="font-mono text-4xl font-extrabold text-[var(--brand)]" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.num}
                </span>
                <h3 className="mt-3 text-lg font-bold leading-snug text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  {step.desc}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Target Public and benefits panel */}
        <section className="grid grid-cols-1 gap-8 border-t border-[var(--line)] pt-16 lg:grid-cols-2">
          <div className="flex flex-col items-start border border-[var(--line)] bg-white p-6 text-left sm:p-8">
            <span className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--brand)]">
              Público prioritário
            </span>
            <h3 className="editorial-caps mb-6 text-3xl text-[var(--ink)]">
              Para quem o Qualifica Vix foi desenhado
            </h3>
            <ul className="flex flex-col gap-4 text-[15px] text-[var(--ink-soft)]">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                <span>Moradores de Vitória em busca do primeiro passo profissional.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                <span>Pessoas que precisam de recolocação ou atualização de competências.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                <span>Quem quer empreender e fortalecer sua geração de renda.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                <span>Comunidades atendidas por unidades fixas e estruturas móveis.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start justify-between border border-[var(--line)] bg-[var(--canvas)] p-6 text-left sm:p-8">
            <div className="w-full">
              <span className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[var(--brand)]">
                Benefícios
              </span>
              <h3 className="editorial-caps mb-6 text-3xl text-[var(--ink)]">
                O que o portal entrega de forma prática
              </h3>
            </div>

            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <strong className="text-sm font-bold uppercase tracking-wide text-[var(--ink)]">Visual claro</strong>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Informações objetivas sobre turmas, horários e locais.
                </p>
              </div>
              <div>
                <strong className="text-sm font-bold uppercase tracking-wide text-[var(--ink)]">Busca inteligente</strong>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Filtros por categoria, idade e região para facilitar a descoberta.
                </p>
              </div>
              <div>
                <strong className="text-sm font-bold uppercase tracking-wide text-[var(--ink)]">Orientação inicial</strong>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Assistente virtual para apoiar dúvidas e a escolha de trilhas de formação.
                </p>
              </div>
              <div>
                <strong className="text-sm font-bold uppercase tracking-wide text-[var(--ink)]">Conexão territorial</strong>
                <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Oferta mais próxima dos bairros e das necessidades da população.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Carreta Infrastructure Showcase */}
        <section className="flex flex-col gap-8 border-t border-[var(--line)] pt-16">
          <div className="max-w-2xl">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              Estrutura Itinerante
            </span>
            <h2 className="editorial-caps mt-2 text-4xl text-[var(--ink)] sm:text-5xl">
              Capacitação que chega a diferentes pontos da cidade
            </h2>
            <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ink-soft)]">
              As unidades móveis ampliam o alcance do programa e aproximam a formação de quem mais precisa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <article className="overflow-hidden border border-[var(--line)] bg-white transition-colors hover:border-[var(--ink)]">
              <div className="course-card-photo relative aspect-[16/10] overflow-hidden bg-[var(--canvas)]">
                <img
                  src="https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800"
                  srcSet={imageSrcSet('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=800')}
                  sizes="(max-width: 639px) 100vw, 50vw"
                  alt="Carreta do QualificaVix"
                  className="h-full w-full object-cover"
                />
                <PhotoReveal />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white">
                  <Truck className="h-5 w-5 text-[var(--vitoria-gold)]" aria-hidden="true" />
                  <span className="text-shadow text-sm font-bold uppercase tracking-wide">Unidade Móvel</span>
                </div>
              </div>
              <div className="p-6 text-left md:p-8">
                <h3 className="text-xl font-bold text-[var(--ink)]">
                  Unidade de qualificação profissional
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Estrutura itinerante montada em carretas equipadas para atender bairros com cursos técnicos práticos e formações de curta duração diretamente na comunidade.
                </p>
              </div>
            </article>

            <article className="overflow-hidden border border-[var(--line)] bg-white transition-colors hover:border-[var(--ink)]">
              <div className="course-card-photo relative aspect-[16/10] overflow-hidden bg-[var(--canvas)]">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800"
                  srcSet={imageSrcSet('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800')}
                  sizes="(max-width: 639px) 100vw, 50vw"
                  alt="Carreta Cozinha Capixaba"
                  className="h-full w-full object-cover"
                />
                <PhotoReveal />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 flex items-center gap-2 text-white">
                  <Truck className="h-5 w-5 text-[var(--vitoria-gold)]" aria-hidden="true" />
                  <span className="text-shadow text-sm font-bold uppercase tracking-wide">Unidade Gastronômica</span>
                </div>
              </div>
              <div className="p-6 text-left md:p-8">
                <h3 className="text-xl font-bold text-[var(--ink)]">
                  Panificação e gastronomia
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  Cozinha móvel sobre rodas totalmente preparada para atividades práticas do setor de alimentação, como confeitaria, doceria e técnicas de panificação rápida.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Partners Block */}
        <section className="flex flex-col gap-8 border-t border-[var(--line)] pt-16 text-center">
          <div className="mx-auto max-w-xl">
            <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              Parcerias
            </span>
            <h2 className="editorial-caps mt-2 text-4xl text-[var(--ink)] sm:text-5xl">
              Instituições que fortalecem a qualidade da formação
            </h2>
            <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ink-soft)]">
              O ecossistema do portal combina o poder público municipal com os principais players de formação profissional do Brasil.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <a
              href="https://senaies.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-caps flex items-center gap-3 border border-[var(--line)] bg-[var(--canvas)] px-10 py-5 text-2xl text-[var(--ink)] transition-colors duration-300 hover:border-[var(--ink)] hover:bg-white"
            >
              SENAI ES
            </a>
            <a
              href="https://www.es.senac.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-caps flex items-center gap-3 border border-[var(--line)] bg-[var(--canvas)] px-10 py-5 text-2xl text-[var(--ink)] transition-colors duration-300 hover:border-[var(--ink)] hover:bg-white"
            >
              SENAC ES
            </a>
          </div>
        </section>

        {/* Presentation Video */}
        <section aria-labelledby="video-title" className="flex flex-col gap-4 border-t border-[var(--line)] pt-16">
          <h2 id="video-title" className="editorial-caps text-4xl text-[var(--ink)] sm:text-5xl">
            Conheça o Qualifica Vix
          </h2>
          <video
            src="https://res.cloudinary.com/j35zooeo/video/upload/f_auto,q_auto/v1791308141/1006_1_1.mp4"
            controls
            playsInline
            preload="none"
            className="w-full border border-[var(--line)] bg-black"
            aria-label="Vídeo de apresentação do Qualifica Vix"
          />
        </section>
      </main>

      <Depoimentos />
      <Footer />
    </div>
  );
}
