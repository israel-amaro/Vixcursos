import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquare, Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SatisfactionSurveyProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SatisfactionSurvey({ isOpen, onClose }: SatisfactionSurveyProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      question: "1. Como você avalia a facilidade para encontrar um curso no site?",
      options: ["Fácil", "Regular", "Difícil"]
    },
    {
      id: 2,
      question: "2. Qual informação você considera mais importante ao procurar um curso?",
      options: ["Horário das aulas", "Local do curso", "Quantidade de vagas", "Duração do curso", "Requisitos para inscrição"]
    },
    {
      id: 3,
      question: "3. O que poderia melhorar na busca de cursos?",
      options: ["Filtro por horário", "Filtro por área profissional", "Filtro por vagas disponíveis", "Não precisa melhorar"]
    },
    {
      id: 4,
      question: "4. As informações do curso são claras?",
      options: ["Sim", "Parcialmente", "Não"]
    },
    {
      id: 5,
      question: "5. Você conseguiu entender facilmente como fazer a pré-inscrição?",
      options: ["Sim", "Parcialmente", "Não"]
    },
    {
      id: 6,
      question: "6. Você acha importante conhecer sua colocação na pré-inscrição, dentro das vagas ou na suplência?",
      options: ["Sim", "Não"]
    },
    {
      id: 7,
      question: "7. Qual melhoria ajudaria mais no processo de inscrição?",
      options: ["Passo a passo da inscrição", "Vídeo explicativo", "Mensagens de confirmação mais claras", "Redução de etapas", "Nenhuma"]
    },
    {
      id: 8,
      question: "8. Você acessa o site principalmente por:",
      options: ["Celular", "Computador", "Tablet"]
    },
    {
      id: 9,
      question: "9. No celular, o site é fácil de usar?",
      options: ["Sim", "Parcialmente", "Não"]
    },
    {
      id: 10,
      question: "10. Que recurso você gostaria que existisse no site?",
      options: ["Lista de cursos favoritos", "Aviso de abertura de vagas", "Histórico de inscrições", "Certificados disponíveis no portal", "Chat para tirar dúvidas"]
    },
    {
      id: 11,
      question: "11. Você gostaria de receber notificações sobre novos cursos?",
      options: ["Sim, por WhatsApp", "Sim, por e-mail", "Sim, pelo próprio site", "Não tenho interesse"]
    },
    {
      id: 12,
      question: "12. Qual área de cursos você mais procura?",
      options: ["Atendimento e vendas", "Beleza e estética", "Gastronomia e confeitaria", "Manutenção e serviços técnicos", "Empreendedorismo", "Outra"]
    },
    {
      id: 13,
      question: "13. De forma geral, qual mudança teria maior impacto para você?",
      options: ["Site mais rápido", "Busca mais eficiente", "Informações mais organizadas", "Inscrição mais simples", "Melhor uso no celular"]
    },
    {
      id: 14,
      question: "14. Você sente falta de alguma informação antes de se inscrever?",
      options: ["Material necessário", "Possibilidade de certificado", "Oportunidades de emprego após o curso", "Mapa/localização do curso", "Renda média salarial", "Não sinto falta"]
    },
    {
      id: 15,
      question: "15. (Opcional) Se pudesse mudar apenas uma coisa no site do VixCursos, o que mudaria?",
      options: ["Mais cursos no período noturno", "Mais vagas por turma", "Melhor navegação pelo celular", "Aviso antecipado de vagas", "Nenhuma alteração"]
    }
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-800 text-lg">
                  Pesquisa de Satisfação
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Sua opinião ajuda a melhorar os serviços da PMV
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!submitted ? (
            <div>
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mb-3">
                <span>Pergunta {currentStep + 1} de {questions.length}</span>
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="text-accent hover:underline cursor-pointer"
                  >
                    Anterior
                  </button>
                )}
              </div>

              <h4 className="text-base font-bold text-slate-800 mb-6 leading-snug">
                {questions[currentStep].question}
              </h4>

              <div className="flex flex-col gap-2.5 mb-6">
                {questions[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-4 rounded-xl border text-left font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center justify-between hover:border-accent hover:bg-accent/5 ${
                      answers[currentStep] === opt
                        ? 'border-accent bg-accent/10 text-accent font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs">
                      {answers[currentStep] === opt ? '✓' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-display font-extrabold text-slate-800">
                Obrigado por participar!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Sua avaliação foi registrada com sucesso e orientará as próximas melhorias no portal VixCursos.
              </p>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="mt-4 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
