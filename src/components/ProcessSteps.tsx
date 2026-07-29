import React from 'react';
import { Search, UserCheck, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProcessSteps() {
  const steps = [
    {
      number: '01',
      title: '1. Escolha o curso',
      description: 'Explore as opções gratuitas e encontre a área ideal para o seu momento profissional.',
      icon: Search,
    },
    {
      number: '02',
      title: '2. Faça seu cadastro',
      description: 'Preencha seus dados básicos e concorde com os termos em poucos minutos.',
      icon: UserCheck,
    },
    {
      number: '03',
      title: '3. Aguarde a convocação',
      description: 'Receba a confirmação da sua vaga e os detalhes para início das aulas.',
      icon: BellRing,
    },
  ];

  return (
    <section className="w-full bg-slate-900 text-white py-12 px-6 md:px-12 border-y border-white/10 relative overflow-hidden">
      {/* Subtle background highlight */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent font-bold">
            Passo a Passo
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-1">
            Como funciona a sua pré-inscrição
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-start hover:border-accent/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-3xl font-black text-white/20 group-hover:text-accent/40 transition-colors">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
