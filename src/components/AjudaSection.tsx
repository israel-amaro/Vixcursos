import { useState } from 'react';
import { Bell, ChevronRight, Compass, MessageCircle, Phone } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import InterestModal from './InterestModal';

export default function AjudaSection({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const [interestOpen, setInterestOpen] = useState(false);
  const reduced = useReducedMotion();
  const items = [
    { icon: Compass, title: 'Não sei qual curso escolher', text: 'Responda 2 perguntas rápidas.', action: onOpenQuiz },
    { icon: MessageCircle, title: 'Tirar dúvidas com o Vitoruga', text: 'O assistente do Qualifica Vix.', action: () => window.dispatchEvent(new Event('abrir-chat')) },
    { icon: Bell, title: 'Avisar quando abrir um curso', text: 'Receba aviso no WhatsApp ou e-mail.', action: () => setInterestOpen(true) },
  ];

  return (
    <section id="ajuda" aria-labelledby="ajuda-title" className="border-t border-[var(--line)] bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 id="ajuda-title" className="text-[var(--ink)]">
          Precisa de ajuda?
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, text, action }, idx) => (
            <motion.li
              key={title}
              initial={reduced ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={action}
                className="group flex h-full w-full items-center gap-4 border border-[var(--line)] bg-white p-5 text-left transition-colors duration-300 hover:border-[var(--ink)] active:scale-[.99]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--canvas)] text-[var(--brand)] transition-colors duration-300 group-hover:bg-[var(--brand)] group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-bold leading-snug text-[var(--ink)] transition-transform duration-300 group-hover:translate-x-0.5">{title}</span>
                  <span className="mt-0.5 block text-[15px] text-[var(--ink-soft)]">{text}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--ink-soft)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]" aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </ul>
        <a
          href="tel:+552731351000"
          className="group mt-4 flex items-center gap-4 border border-[var(--line)] bg-[var(--canvas)] p-5 transition-colors duration-300 hover:border-[var(--ink)]"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[var(--brand)] transition-colors duration-300 group-hover:bg-[var(--ink)] group-hover:text-white">
            <Phone className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-bold text-[var(--ink)]">Ligar para o atendimento</span>
            <span className="mt-0.5 block font-mono text-[15px] text-[var(--ink-soft)]">(27) 3135-1000 · seg. a sex., 8h às 17h</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--ink-soft)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--ink)]" aria-hidden="true" />
        </a>
      </div>
      {interestOpen && <InterestModal course={null} onClose={() => setInterestOpen(false)} />}
    </section>
  );
}
