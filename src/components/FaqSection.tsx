import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  id: number;
  pergunta: string;
  resposta: string;
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFaqs(data);
        }
      })
      .catch(err => console.error('Erro ao buscar FAQ:', err));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="faq-section" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-white/5 relative overflow-hidden">
      {/* Decorative radial gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-accent tracking-widest uppercase mb-4"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Dúvidas Frequentes
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
          >
            Perguntas Frequentes
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-sm max-w-xl mx-auto"
          >
            Encontre respostas rápidas para as principais dúvidas sobre inscrições, matrículas, suplência e certificados do VixCursos.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`glass-dark border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none bg-transparent border-none"
                >
                  <span className="font-semibold text-sm md:text-base text-white hover:text-accent transition-colors duration-200">
                    {faq.pergunta}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-accent border-accent/20 bg-accent/5' : ''
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-5 pt-1 text-white/70 text-xs md:text-sm leading-relaxed border-t border-white/5 bg-white/[0.01]">
                        {faq.resposta}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
