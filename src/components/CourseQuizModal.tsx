import { useState } from 'react';
import { HelpCircle, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import MotionPill from './MotionPill';

interface CourseQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoria: string) => void;
}

export default function CourseQuizModal({ isOpen, onClose, onSelectCategory }: CourseQuizModalProps) {
  const [step, setStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>('');
  const [, setAreaInterest] = useState<string>('');
  const reduced = useReducedMotion();

  const objectives = [
    { id: 'emprego', title: 'Conseguir um Emprego (CLT)', desc: 'Profissões com vagas abertas e contratação rápida no mercado.', icon: '💼' },
    { id: 'empreender', title: 'Empreender / Abrir Negócio', desc: 'Aprenda uma arte ou serviço para trabalhar por conta própria.', icon: '🚀' },
    { id: 'aprender', title: 'Aprender uma Profissão do Zero', desc: 'Cursos completos para quem está começando na área.', icon: '🎓' },
    { id: 'renda', title: 'Complementar Renda', desc: 'Habilidades práticas de aplicação rápida para renda extra.', icon: '💡' },
  ];

  const interests = [
    { id: 'Beleza', name: 'Beleza & Estética', icon: '✂️', targetCat: 'Beleza' },
    { id: 'Gastronomia', name: 'Gastronomia & Culinária', icon: '🍳', targetCat: 'Gastronomia' },
    { id: 'Tecnologia', name: 'Informática & Tecnologia', icon: '💻', targetCat: 'Informática / Tecnologia' },
    { id: 'Moda', name: 'Costura & Moda', icon: '🧵', targetCat: 'Confecção' },
    { id: 'Eletrica', name: 'Elétrica & Manutenção', icon: '⚡', targetCat: 'Eletricista / Energia' },
    { id: 'Construcao', name: 'Construção Civil', icon: '🧱', targetCat: 'Construção Civil / Serviço' },
    { id: 'Gestao', name: 'Administração & Vendas', icon: '📊', targetCat: 'Administração' },
  ];

  const handleReset = () => {
    setStep(1);
    setObjective('');
    setAreaInterest('');
  };

  const handleFinish = (cat: string) => {
    onSelectCategory(cat);
    onClose();
    const el = document.getElementById('cursos-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div data-lenis-prevent className="responsive-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Assistente de escolha de curso"
          className="responsive-dialog relative w-full max-w-xl overflow-y-auto overscroll-contain border border-[var(--line)] bg-white p-5 text-left shadow-2xl sm:p-6 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--canvas)] font-bold text-[var(--brand)]">
                <HelpCircle className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div>
                <h3 className="editorial-caps text-2xl text-[var(--ink)]">
                  Assistente de Escolha de Curso
                </h3>
                <p className="text-sm font-medium text-[var(--ink-soft)]">
                  Responda 2 perguntas para encontrar seu curso ideal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar quiz"
              className="rounded-full p-2.5 text-[var(--ink-soft)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 1 && (
            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                Pergunta 1 de 2: O que você mais procura no momento?
              </h4>
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => {
                      setObjective(obj.id);
                      setStep(2);
                    }}
                    className={`flex flex-col justify-between border p-4 text-left transition-colors duration-200 cursor-pointer hover:border-[var(--ink)] ${
                      objective === obj.id
                        ? 'border-[var(--brand)] bg-[var(--canvas)] ring-1 ring-[var(--brand)]'
                        : 'border-[var(--line)] bg-white'
                    }`}
                  >
                    <span className="mb-2 text-2xl">{obj.icon}</span>
                    <span className="mb-1 block text-sm font-bold text-[var(--ink)]">
                      {obj.title}
                    </span>
                    <span className="text-sm leading-snug text-[var(--ink-soft)]">
                      {obj.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-soft)]">
                  Pergunta 2 de 2: Qual dessas áreas te chama mais atenção?
                </h4>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm font-bold text-[var(--brand)] hover:underline cursor-pointer"
                >
                  Voltar
                </button>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {interests.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAreaInterest(item.targetCat);
                      handleFinish(item.targetCat);
                    }}
                    className="group flex flex-col items-center justify-center gap-2 border border-[var(--line)] bg-white p-4 text-center transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer"
                  >
                    <span className="text-3xl transition-transform group-hover:scale-110">{item.icon}</span>
                    <span className="text-sm font-bold leading-tight text-[var(--ink)]">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" /> Recomeçar
                </button>
                <MotionPill onClick={() => handleFinish('')} className="!min-h-11 !px-5 !text-sm">
                  Ver Todos os Cursos
                </MotionPill>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
