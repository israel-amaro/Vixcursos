import PhotoReveal from './PhotoReveal';
import MotionPill from './MotionPill';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { courseImage } from '../lib/courseImages';

export interface PublicCourse {
  id: number;
  nome: string;
  categoria: string;
  local: string;
  modalidade?: string;
  vagas_totais: number;
  vagas_disponiveis: number;
  status: string;
  situacao_label?: string;
  aceita_inscricoes?: boolean;
  data_inicio: string;
  data_termino?: string;
  horario_inicio?: string;
  horario_termino?: string;
  idade_min?: string | number;
  idade_max?: string | number;
  descricao?: string;
  ementa?: string;
  competencias?: string;
  pre_requisitos?: string;
  carga_horaria?: number;
  criado_em?: string;
  mascote_id?: string;
  inscritos?: number;
}

const hour = (value?: string) => {
  const m = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return m[2] === '00' ? `${Number(m[1])}h` : `${Number(m[1])}h${m[2]}`;
};
export const shift = (value?: string) => {
  const h = Number(String(value || '').slice(0, 2));
  if (!value || Number.isNaN(h)) return '';
  return h < 12 ? 'Manhã' : h < 18 ? 'Tarde' : 'Noite';
};
export const schedule = (c: PublicCourse) => {
  const start = hour(c.horario_inicio), end = hour(c.horario_termino);
  if (!start) return 'Horário a definir';
  return `${shift(c.horario_inicio)} · ${start}${end ? ` às ${end}` : ''}`;
};
export const startText = (value: string) => {
  const m = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return 'Início a definir';
  const start = new Date(+m[3], +m[2] - 1, +m[1]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const label = start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  return start < today ? `Aulas começaram em ${label}` : `Começa em ${label}`;
};
export function availability(c: PublicCourse) {
  if (c.aceita_inscricoes === false) return { label: c.situacao_label || 'Inscrições fechadas', tone: 'closed' as const, action: c.situacao_label || 'Inscrições fechadas' };
  if (c.status === 'esgotado' || c.vagas_disponiveis <= 0) return { label: 'Lista de espera', tone: 'wait' as const, action: 'Entrar na lista de espera' };
  if (c.vagas_disponiveis <= 5) return { label: c.vagas_disponiveis === 1 ? 'Última vaga' : `Últimas ${c.vagas_disponiveis} vagas`, tone: 'wait' as const, action: 'Quero me inscrever' };
  return { label: `${c.vagas_disponiveis} vagas abertas`, tone: 'open' as const, action: 'Quero me inscrever' };
}
const toneClass = { open: 'bg-[var(--open-bg)] text-[var(--open)]', wait: 'bg-[var(--wait-bg)] text-[var(--wait)]', closed: 'bg-slate-100 text-[var(--ink-soft)]' };

export default function CourseCard({ course, onDetails }: { course: PublicCourse; onDetails: (c: PublicCourse, trigger: HTMLButtonElement) => void }) {
  const navigate = useNavigate();
  const image = courseImage(course.categoria, course.nome);
  const status = availability(course);

  return (
    <article className="group flex flex-col overflow-hidden border border-[var(--line)] bg-white transition-colors hover:border-[var(--ink)]">
      <div
        className="course-card-photo relative aspect-[4/3] overflow-hidden bg-[var(--canvas)] cursor-pointer"
        onClick={e => {
          const trigger = e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('[data-details-trigger]');
          if (trigger) onDetails(course, trigger);
        }}
      >
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 380px"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-[50%_25%]"
        />
        <PhotoReveal />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[13px] font-bold tracking-tight ${toneClass[status.tone]}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {course.categoria && course.categoria !== course.nome && (
          <p className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">{course.categoria}</p>
        )}
        <h3 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          {course.nome}
        </h3>

        <ul className="mt-4 space-y-2 text-[15px] text-[var(--ink-soft)]">
          <li className="flex items-start gap-2.5"><CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" /><span>{startText(course.data_inicio)}</span></li>
          <li className="flex items-start gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" /><span className="font-mono">{schedule(course)}</span></li>
          <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" aria-hidden="true" /><span className="min-w-0">{course.local || 'Local a definir'}</span></li>
        </ul>

        <div className="mt-auto flex flex-col gap-1.5 pt-5">
          <MotionPill
            disabled={course.aceita_inscricoes === false}
            onClick={() => navigate(`/pre-inscricao/${course.id}`)}
            aria-label={`${status.action}: ${course.nome}`}
            className="w-full"
          >
            {status.action}
          </MotionPill>
          <button
            data-details-trigger
            onClick={e => onDetails(course, e.currentTarget)}
            className="btn-quiet editorial-link mx-auto mt-1 min-h-11 px-2 hover:bg-transparent"
          >
            Ver detalhes do curso
          </button>
        </div>
      </div>
    </article>
  );
}
