import { motion, useReducedMotion } from 'framer-motion';

const steps = [
  { title: 'Escolha um curso', text: 'Todos são gratuitos e têm certificado.' },
  { title: 'Faça a pré-inscrição', text: 'Leva poucos minutos. Tenha o CPF em mãos.' },
  { title: 'Aguarde o contato', text: 'A equipe liga para confirmar a sua vaga.' },
];

export default function ComoFunciona() {
  const reduced = useReducedMotion();

  return (
    <section id="como-funciona" aria-labelledby="como-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 id="como-title" className="text-[var(--ink)]">
          Como funciona
        </h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-8">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reduced ? { duration: 0 } : { duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-4 sm:flex-col"
            >
              <span
                className="grid w-12 shrink-0 place-items-start pt-0.5 font-extrabold text-[var(--brand)]"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-[20px] font-bold text-[var(--ink)]">{s.title}</h3>
                <p className="mt-1.5 text-[16px] leading-relaxed text-[var(--ink-soft)]">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <p className="mt-10 border-l-4 border-[var(--vitoria-gold)] bg-[var(--canvas)] px-5 py-4 text-[16px] font-medium text-[var(--ink)]">
          A pré-inscrição não garante a vaga. A matrícula só é confirmada depois do contato da equipe.
        </p>
      </div>
    </section>
  );
}
