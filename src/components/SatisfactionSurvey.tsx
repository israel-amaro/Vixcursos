import { useState } from 'react';
import { X, CheckCircle2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import MotionPill from './MotionPill';

interface SatisfactionSurveyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SatisfactionSurvey({ isOpen, onClose }: SatisfactionSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();

  const questions = [
    { id: 1, question: '1. Como você avalia a facilidade para encontrar um curso no site?', options: ['Fácil', 'Regular', 'Difícil'] },
    { id: 2, question: '2. Qual informação você considera mais importante ao procurar um curso?', options: ['Horário das aulas', 'Local do curso', 'Quantidade de vagas', 'Duração do curso', 'Requisitos para inscrição'] },
    { id: 3, question: '3. O que poderia melhorar na busca de cursos?', options: ['Filtro por horário', 'Filtro por área profissional', 'Filtro por vagas disponíveis', 'Não precisa melhorar'] },
    { id: 4, question: '4. As informações do curso são claras?', options: ['Sim', 'Parcialmente', 'Não'] },
    { id: 5, question: '5. Você conseguiu entender facilmente como fazer a pré-inscrição?', options: ['Sim', 'Parcialmente', 'Não'] },
    { id: 6, question: '6. Você acha importante conhecer sua colocação na pré-inscrição, dentro das vagas ou na lista de espera?', options: ['Sim', 'Não'] },
    { id: 7, question: '7. Qual melhoria ajudaria mais no processo de inscrição?', options: ['Passo a passo da inscrição', 'Vídeo explicativo', 'Mensagens de confirmação mais claras', 'Redução de etapas', 'Nenhuma'] },
    { id: 8, question: '8. Você acessa o site principalmente por:', options: ['Celular', 'Computador', 'Tablet'] },
    { id: 9, question: '9. No celular, o site é fácil de usar?', options: ['Sim', 'Parcialmente', 'Não'] },
    { id: 10, question: '10. Que recurso você gostaria que existisse no site?', options: ['Lista de cursos favoritos', 'Aviso de abertura de vagas', 'Histórico de inscrições', 'Certificados disponíveis no portal', 'Chat para tirar dúvidas'] },
    { id: 11, question: '11. Você gostaria de receber notificações sobre novos cursos?', options: ['Sim, por WhatsApp', 'Sim, por e-mail', 'Sim, pelo próprio site', 'Não tenho interesse'] },
    { id: 12, question: '12. Qual área de cursos você mais procura?', options: ['Atendimento e vendas', 'Beleza e estética', 'Gastronomia e confeitaria', 'Manutenção e serviços técnicos', 'Empreendedorismo', 'Outra'] },
    { id: 13, question: '13. De forma geral, qual mudança teria maior impacto para você?', options: ['Site mais rápido', 'Busca mais eficiente', 'Informações mais organizadas', 'Inscrição mais simples', 'Melhor uso no celular'] },
    { id: 14, question: '14. Você sente falta de alguma informação antes de se inscrever?', options: ['Material necessário', 'Possibilidade de certificado', 'Oportunidades de emprego após o curso', 'Mapa/localização do curso', 'Renda média salarial', 'Não sinto falta'] },
    { id: 15, question: '15. (Opcional) Se pudesse mudar apenas uma coisa no site do Qualifica Vix, o que mudaria?', options: ['Mais cursos no período noturno', 'Mais vagas por turma', 'Melhor navegação pelo celular', 'Aviso antecipado de vagas', 'Nenhuma alteração'] },
  ];

  const handleSelectOption = (option: string) => {
    setAnswers({ ...answers, [currentStep]: option });
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div data-lenis-prevent className="responsive-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
          transition={reduced ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="Pesquisa de satisfação"
          className="responsive-dialog relative w-full max-w-lg overflow-y-auto overscroll-contain border border-[var(--line)] bg-white p-5 text-left shadow-2xl sm:p-6 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--canvas)] font-bold text-[var(--brand)]">
                <MessageSquare className="h-5 w-5 text-[var(--brand)]" />
              </div>
              <div>
                <h3 className="editorial-caps text-2xl text-[var(--ink)]">
                  Pesquisa de Satisfação
                </h3>
                <p className="text-sm font-medium text-[var(--ink-soft)]">
                  Sua opinião ajuda a melhorar os serviços da PMV
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Fechar pesquisa"
              className="rounded-full p-2.5 text-[var(--ink-soft)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!submitted ? (
            <div>
              <div className="mb-6 h-2 w-full overflow-hidden bg-[var(--canvas)]">
                <div
                  className="h-full bg-[var(--brand)] transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="mb-3 flex items-center justify-between font-mono text-sm font-bold uppercase text-[var(--ink-soft)]">
                <span>Pergunta {currentStep + 1} de {questions.length}</span>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="text-[var(--brand)] hover:underline cursor-pointer"
                  >
                    Anterior
                  </button>
                )}
              </div>

              <h4 className="mb-6 text-lg font-bold leading-snug text-[var(--ink)]">
                {questions[currentStep].question}
              </h4>

              <div className="mb-6 flex flex-col gap-2.5">
                {questions[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className={`flex w-full items-center justify-between border p-4 text-left text-sm font-semibold transition-colors duration-200 cursor-pointer hover:border-[var(--ink)] ${
                      answers[currentStep] === opt
                        ? 'border-[var(--brand)] bg-[var(--canvas)] font-bold text-[var(--brand)]'
                        : 'border-[var(--line)] bg-white text-[var(--ink)]'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${answers[currentStep] === opt ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[var(--line)]'}`}>
                      {answers[currentStep] === opt ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--open-bg)] text-[var(--open)]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="editorial-caps text-3xl text-[var(--ink)]">
                Obrigado por participar!
              </h4>
              <p className="max-w-sm text-[15px] leading-relaxed text-[var(--ink-soft)]">
                Sua avaliação foi registrada com sucesso e orientará as próximas melhorias no portal Qualifica Vix.
              </p>
              <MotionPill
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="mt-2"
              >
                Concluir
              </MotionPill>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
