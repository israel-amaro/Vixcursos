import React, { useState } from 'react';
import { HelpCircle, X, Check, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoria: string) => void;
}

export default function CourseQuizModal({ isOpen, onClose, onSelectCategory }: CourseQuizModalProps) {
  const [step, setStep] = useState<number>(1);
  const [objective, setObjective] = useState<string>('');
  const [areaInterest, setAreaInterest] = useState<string>('');

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
    // Scroll smoothly to course list
    const el = document.getElementById('cursos-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 overflow-hidden text-left"
        >
          {/* Top header bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-slate-800 text-lg">
                  Assistente de Escolha de Curso
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Responda 2 perguntas para encontrar seu curso ideal
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

          {/* STEP 1: Objective */}
          {step === 1 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Pergunta 1 de 2: O que você mais procura no momento?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => {
                      setObjective(obj.id);
                      setStep(2);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between hover:border-accent hover:shadow-md ${
                      objective === obj.id
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-2">{obj.icon}</span>
                    <span className="font-bold text-slate-800 text-sm block mb-1">
                      {obj.title}
                    </span>
                    <span className="text-xs text-slate-500 leading-snug">
                      {obj.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Preference area */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Pergunta 2 de 2: Qual dessas áreas te chama mais atenção?
                </h4>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-accent font-bold hover:underline cursor-pointer"
                >
                  Voltar
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {interests.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAreaInterest(item.targetCat);
                      handleFinish(item.targetCat);
                    }}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-accent/10 hover:border-accent text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 group hover:scale-[1.03]"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="font-bold text-slate-800 text-xs leading-tight">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Recomeçar
                </button>
                <button
                  onClick={() => handleFinish('')}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Ver Todos os Cursos
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
