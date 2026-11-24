import { useState } from 'react';
import { Bell, ChevronRight, Compass, MessageCircle, Phone } from 'lucide-react';
import InterestModal from './InterestModal';

export default function AjudaSection({ onOpenQuiz }: { onOpenQuiz: () => void }) {
  const [interestOpen, setInterestOpen] = useState(false);
  const items = [
    { icon: Compass, title: 'Não sei qual curso escolher', text: 'Responda 7 perguntas rápidas.', action: onOpenQuiz },
    { icon: MessageCircle, title: 'Tirar dúvidas com o Vitoruga', text: 'O assistente do Qualifica Vix.', action: () => window.dispatchEvent(new Event('abrir-chat')) },
    { icon: Bell, title: 'Avisar quando abrir um curso', text: 'Receba aviso no WhatsApp ou e-mail.', action: () => setInterestOpen(true) },
  ];

  return (
    <section id="ajuda" aria-labelledby="ajuda-title" className="bg-[var(--canvas)] px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="ajuda-title" className="text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
          Precisa de ajuda?
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, text, action }) => (
            <li key={title}>
              <button onClick={action} className="flex w-full items-center gap-4 rounded-[var(--radius-card)] bg-white p-5 text-left shadow-[var(--shadow-card)] transition-transform active:scale-[.99]">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--canvas)] text-[var(--brand)]"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[18px] font-bold leading-snug text-[var(--ink)]">{title}</span>
                  <span className="mt-0.5 block text-[16px] text-[var(--ink-soft)]">{text}</span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <a href="tel:+552731351000" className="mt-3 flex items-center gap-4 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--canvas)] text-[var(--brand)]"><Phone className="h-6 w-6" aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-[18px] font-bold text-[var(--ink)]">Ligar para o atendimento</span>
            <span className="mt-0.5 block text-[16px] text-[var(--ink-soft)]">(27) 3135-1000 · seg. a sex., 8h às 17h</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
        </a>
      </div>
      {interestOpen && <InterestModal course={null} onClose={() => setInterestOpen(false)} />}
    </section>
  );
}
