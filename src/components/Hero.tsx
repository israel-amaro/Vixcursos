import HeroAction from './HeroAction';
import { heroImages } from '../lib/courseImages';

export default function Hero({ courses }: { courses: { vagas_disponiveis: number; aceita_inscricoes?: boolean }[] }) {
  const open = courses.filter(course => course.aceita_inscricoes !== false && course.vagas_disponiveis > 0);
  return (
    <section aria-labelledby="hero-title" className="course-hero">
      <div className="course-hero-photos" aria-hidden="true">
        <img src={heroImages[1].src} srcSet={heroImages[1].srcSet} sizes="(min-width: 810px) 25vw, 50vw" alt="" fetchPriority="high" />
        <img src={heroImages[2].src} srcSet={heroImages[2].srcSet} sizes="(min-width: 810px) 25vw, 50vw" alt="" fetchPriority="high" />
        <img src={heroImages[0].src} srcSet={heroImages[0].srcSet} sizes="25vw" alt="" loading="lazy" decoding="async" className="hero-extra-photo" />
        <img src={heroImages[3].src} srcSet={heroImages[3].srcSet} sizes="25vw" alt="" loading="lazy" decoding="async" className="hero-extra-photo" />
      </div>
      <div className="course-hero-shade" />
      <div className="course-hero-content">
        <p className="course-hero-location">Qualificação profissional · Vitória, ES</p>
        <h1 id="hero-title">
          <span className="hero-line"><span>Seu próximo</span></span>
          <span className="hero-line"><span>passo começa</span></span>
          <span className="hero-line"><span>aqui.</span></span>
        </h1>
        <p className="course-hero-description">Aprenda uma profissão. Descubra novas possibilidades. Cursos gratuitos, com certificado.</p>
        <HeroAction />
      </div>
      <div className="course-hero-bottom">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3.5 py-1.5 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[var(--vitoria-green)]" aria-hidden="true" />
          <span>{open.length > 0 ? `${open.length} ${open.length === 1 ? 'curso com vagas abertas' : 'cursos com vagas abertas'}` : 'Conheça as oportunidades'}</span>
        </span>
        <span className="hidden text-[13px] font-medium tracking-wide text-white/80 sm:inline" aria-hidden="true">
          Role para explorar ↓
        </span>
      </div>
    </section>
  );
}
