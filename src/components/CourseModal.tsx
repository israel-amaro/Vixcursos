import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, MapPin, Award, BookOpen, CheckCircle2, Users, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CourseModalData {
  id: number;
  nome: string;
  vagas_totais: number;
  inscritos: number;
  vagas_disponiveis: number;
  status: string;
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
  competencias?: string;
  pre_requisitos?: string;
  carga_horaria?: number;
}

interface CourseModalProps {
  course: CourseModalData | null;
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function CourseModal({ course, isOpen, onClose, triggerRef }: CourseModalProps) {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll and set up accessibility listeners (Escape key, Focus lock, Restore focus)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }

        // Focus trap
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
  const ementaTexto = course.ementa || course.competencias || "Fundamentos técnicos, teoria aplicada, normas de segurança e práticas orientadas à atuação profissional.";
  const requisitosTexto = course.pre_requisitos || "Nenhum pré-requisito adicional informado";

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
        aria-hidden="true"
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-200 overflow-hidden text-left my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex items-start justify-between relative">
            <div>
              <span className="inline-block px-3 py-1 bg-accent/20 border border-accent/40 text-accent rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                {course.categoria} • {course.modalidade}
              </span>
              <h2 id="course-modal-title" className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                {course.nome}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer ml-4 flex-shrink-0"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
            
            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent" /> Carga Horária
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {course.carga_horaria || 40} horas
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-accent" /> Faixa Etária
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {course.idade_min || 16} a {course.idade_max || 80} anos
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Vagas Livres
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {course.vagas_disponiveis} / {course.vagas_totais}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent" /> Modalidade
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 truncate">
                  {course.modalidade}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent" /> Descrição Completa
              </h3>
              <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                {course.descricao || "Capacitação profissional presencial gratuita oferecida pela Prefeitura de Vitória, com foco em desenvolvimento prático e inserção no mercado de trabalho."}
              </p>
            </div>

            {/* Syllabus (Ementa) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-accent" /> Ementa do Curso
              </h3>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                {ementaTexto}
              </div>
            </div>

            {/* Competencies & Prerequisites */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-accent" /> Competências
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold leading-normal">
                  {course.competencias || "Desenvolvimento de habilidades técnicas específicas, postura profissional e prática supervisionada."}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Pré-requisitos
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 font-semibold leading-normal">
                  {requisitosTexto}
                </div>
              </div>
            </div>

            {/* Logistics & Location */}
            <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span>Local: <strong className="text-slate-900">{course.local}</strong></span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Período: {course.data_inicio || 'Imediato'} a {course.data_termino || 'A definir'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Horário: {course.horario_inicio || '08:00'} às {course.horario_termino || '12:00'}
                </span>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                navigate(`/detalhes/${course.id}`);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Detalhes Completos</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate(`/pre-inscricao/${course.id}`);
              }}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                isEsgotado ? 'bg-orange-500 hover:bg-orange-600' : 'bg-accent hover:bg-accent/90'
              }`}
            >
              {isEsgotado ? 'Entrar na Lista de Espera' : 'Fazer Pré-Inscrição Agora'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
