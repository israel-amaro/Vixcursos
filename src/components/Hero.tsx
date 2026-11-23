import { ArrowDown } from 'lucide-react';
import { heroImages } from '../lib/courseImages';

// A real class photo, a short promise and one action. Everything else lives further down.
export default function Hero({ courses }: { courses: { vagas_disponiveis: number; aceita_inscricoes?: boolean }[] }) {
  const open = courses.filter(c => c.aceita_inscricoes !== false && c.vagas_disponiveis > 0);
  const photo = heroImages[1];

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
      <div className="hero-photo flex flex-col justify-end">
        <img
          src={photo.src} srcSet={photo.srcSet} sizes="100vw"
          alt="Alunas em aula prática de gastronomia na Escola Móvel do Qualifica Vix"
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_35%]"
        />
        <div className="hero-scrim absolute inset-0 -z-10" />

        <div className="mx-auto w-full max-w-6xl px-5 pb-10 sm:px-6 sm:pb-14 lg:pb-16">
          {open.length > 0 && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[15px] font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              {open.length} {open.length === 1 ? 'curso' : 'cursos'} com vagas abertas
            </p>
          )}
          <h1 id="hero-title" className="max-w-xl text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
            Seu próximo curso é gratuito.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-snug text-white/85 sm:text-xl">
            Qualificação profissional com certificado, da Prefeitura de Vitória.
          </p>
          <a href="#cursos-section" className="btn-primary mt-7 w-full !bg-white !text-[var(--ink)] hover:!bg-white/90 sm:w-auto">
            Encontrar meu curso
            <ArrowDown className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
