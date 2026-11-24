import { ArrowUpRight } from 'lucide-react';
import { heroImages } from '../lib/courseImages';

export default function Hero({ courses }: { courses: { vagas_disponiveis: number; aceita_inscricoes?: boolean }[] }) {
  const open = courses.filter(course => course.aceita_inscricoes !== false && course.vagas_disponiveis > 0);
  return (
    <section aria-labelledby="hero-title" className="course-hero">
      <div className="course-hero-photos" aria-hidden="true">
        <img src={heroImages[1].src} srcSet={heroImages[1].srcSet} sizes="50vw" alt="" fetchPriority="high" />
        <img src={heroImages[2].src} srcSet={heroImages[2].srcSet} sizes="50vw" alt="" fetchPriority="high" />
      </div>
      <div className="course-hero-shade" />
      <div className="course-hero-content">
        <p className="course-hero-location">Qualificação profissional · Vitória, ES</p>
        <h1 id="hero-title">Seu próximo<br />passo começa<br />aqui.</h1>
        <p className="course-hero-description">Aprenda uma profissão. Descubra novas possibilidades. Cursos gratuitos, com certificado.</p>
        <a href="#cursos-section" className="btn-primary course-hero-action">
          Encontrar meu curso <ArrowUpRight size={20} aria-hidden="true" />
        </a>
      </div>
      <div className="course-hero-bottom">
        <span>{open.length > 0 ? `${open.length} ${open.length === 1 ? 'curso com vagas abertas' : 'cursos com vagas abertas'}` : 'Conheça as oportunidades'}</span>
      </div>
    </section>
  );
}
