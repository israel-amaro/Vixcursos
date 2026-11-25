import { startLabel } from '../lib/images';
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, MapPin, Award, BookOpen, CheckCircle2, Users, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import MotionPill from './MotionPill';

export interface CourseModalData {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
  status: string;
  situacao?: string;
  situacao_label?: string;
  aceita_inscricoes?: boolean;
  horario_inicio: string;
  horario_termino: string;
  data_inicio: string;
  data_termino: string;
  categoria: string;
  idade_min: string | number;
  idade_max: string | number;
  modalidade: string;
  local: string;
  descricao?: string;
  ementa?: string;
  mascote_id?: string;
  competencias?: string;
  pre_requisitos?: string;
  carga_horaria?: number;
}

interface CourseModalProps {
  course: CourseModalData | null;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  onInterest?: (course: CourseModalData) => void;
}

export default function CourseModal({ course, isOpen, onClose, triggerRef, onInterest }: CourseModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        if (e.key === 'Tab' && modalRef.current) {
          const focusables = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        if (triggerRef?.current) {
          triggerRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !course) return null;

  const isEsgotado = course.status === 'esgotado' || course.vagas_disponiveis <= 0;
  const ementaTexto = course.ementa || course.competencias || 'Conteúdo ainda não informado pela instituição.';
  const requisitosTexto = course.pre_requisitos || 'Nenhum pré-requisito adicional informado';

  return (
    <AnimatePresence>
      <div
        data-lenis-prevent
        className="responsive-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="responsive-dialog relative my-auto flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border border-[var(--line)] bg-white text-left shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative flex shrink-0 items-start justify-between border-b border-[var(--line)] bg-[#00486c] p-5 text-white sm:p-6">
            <div>
              <span className="mb-2.5 inline-block rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[13px] font-bold uppercase tracking-wide text-white">
                {course.categoria} · {course.modalidade}
              </span>
              <h2 id="course-modal-title" className="editorial-caps text-2xl leading-none text-white sm:text-3xl">
                {course.nome}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="ml-4 flex-shrink-0 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25 cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content Body */}
          <div data-lenis-prevent className="min-h-0 space-y-6 overflow-y-auto overscroll-contain p-5 text-[15px] leading-relaxed text-[var(--ink)] sm:p-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col border border-[var(--line)] bg-[var(--canvas)] p-3.5">
                <span className="flex items-center gap-1 text-[13px] font-bold uppercase text-[var(--ink-soft)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--brand)]" /> Carga Horária
                </span>
                <span className="mt-1 font-mono text-sm font-extrabold text-[var(--ink)]">
                  {course.carga_horaria ? `${course.carga_horaria} horas` : 'A definir'}
                </span>
              </div>

              <div className="flex flex-col border border-[var(--line)] bg-[var(--canvas)] p-3.5">
                <span className="flex items-center gap-1 text-[13px] font-bold uppercase text-[var(--ink-soft)]">
                  <Users className="h-3.5 w-3.5 text-[var(--brand)]" /> Faixa Etária
                </span>
                <span className="mt-1 font-mono text-sm font-extrabold text-[var(--ink)]">
                  {course.idade_min || 'A definir'} a {course.idade_max || 'A definir'} anos
                </span>
              </div>

              <div className="flex flex-col border border-[var(--line)] bg-[var(--canvas)] p-3.5">
                <span className="flex items-center gap-1 text-[13px] font-bold uppercase text-[var(--ink-soft)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--open)]" /> Vagas Livres
                </span>
                <span className="mt-1 font-mono text-sm font-extrabold text-[var(--ink)]">
                  {course.vagas_disponiveis} de {course.vagas_totais}
                </span>
              </div>

              <div className="flex flex-col border border-[var(--line)] bg-[var(--canvas)] p-3.5">
                <span className="flex items-center gap-1 text-[13px] font-bold uppercase text-[var(--ink-soft)]">
                  <MapPin className="h-3.5 w-3.5 text-[var(--brand)]" /> Modalidade
                </span>
                <span className="mt-1 truncate text-sm font-extrabold text-[var(--ink)]">
                  {course.modalidade}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                <FileText className="h-4 w-4 text-[var(--brand)]" /> Descrição Completa
              </h3>
              <p className="border border-[var(--line)] bg-[var(--canvas)] p-4 font-medium leading-relaxed text-[var(--ink)]">
                {course.descricao || 'Capacitação profissional presencial gratuita oferecida pela Prefeitura de Vitória, com foco em desenvolvimento prático e inserção no mercado de trabalho.'}
              </p>
            </div>

            {/* Syllabus */}
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                <BookOpen className="h-4 w-4 text-[var(--brand)]" /> O que você vai aprender
              </h3>
              <div className="whitespace-pre-line border border-[var(--line)] bg-[var(--canvas)] p-4 font-medium leading-relaxed text-[var(--ink)]">
                {ementaTexto}
              </div>
            </div>

            {/* Competencies & Prerequisites */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                  <Award className="h-4 w-4 text-[var(--brand)]" /> Competências
                </h3>
                <div className="border border-[var(--line)] bg-[var(--canvas)] p-4 text-sm font-semibold leading-normal text-[var(--ink)]">
                  {course.competencias || 'Desenvolvimento de habilidades técnicas específicas, postura profissional e prática supervisionada.'}
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" /> Pré-requisitos
                </h3>
                <div className="border border-[var(--line)] bg-[var(--canvas)] p-4 text-sm font-semibold leading-normal text-[var(--ink)]">
                  {requisitosTexto}
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="space-y-2 border-l-4 border-[var(--vitoria-gold)] bg-[var(--canvas)] p-4 text-sm">
              <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
                <MapPin className="h-4 w-4 flex-shrink-0 text-[var(--brand)]" />
                <span>Local: <strong>{course.local}</strong></span>
              </div>
              <div className="flex flex-wrap gap-4 font-medium text-[var(--ink-soft)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[var(--brand)]" />
                  {startLabel(course.data_inicio)} a {course.data_termino || 'A definir'}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="h-4 w-4 text-[var(--brand)]" />
                  Horário: {course.horario_inicio || 'A definir'} às {course.horario_termino || 'A definir'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-[var(--line)] bg-[var(--canvas)] p-4 sm:flex-row sm:p-5">
            {onInterest && (
              <button
                onClick={() => onInterest(course)}
                className="w-full rounded-full border border-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--brand)] transition-colors hover:bg-[var(--brand)] hover:text-white sm:w-auto cursor-pointer"
              >
                Tenho interesse
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                navigate(`/detalhes/${course.id}`);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--ink)] sm:w-auto cursor-pointer"
            >
              <span>Ver Detalhes Completos</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <MotionPill
              onClick={() => {
                onClose();
                navigate(`/pre-inscricao/${course.id}`);
              }}
              disabled={course.aceita_inscricoes === false}
              className={`w-full sm:w-auto ${isEsgotado ? '!bg-[var(--wait)]' : ''}`}
            >
              {course.aceita_inscricoes === false ? course.situacao_label : isEsgotado ? 'Entrar na Lista de Espera' : 'Fazer Pré-Inscrição'}
            </MotionPill>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
