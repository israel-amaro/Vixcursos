import { Star, User } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

interface Testimonial {
  name: string;
  text: string;
  course: string;
  neighborhood: string;
  year: string;
}

export default function Depoimentos() {
  const reduced = useReducedMotion();
  const list: Testimonial[] = [
    {
      name: 'João Carlos M.',
      text: 'Depois do curso de Barbeiro, abri meu próprio salão em menos de 6 meses. O Qualifica Vix me deu a base técnica e a confiança que eu precisava.',
      course: 'Barbeiro',
      neighborhood: 'São Pedro',
      year: '2025',
    },
    {
      name: 'Ana Paula F.',
      text: 'O curso de Informática Básica foi o que me faltava para conseguir meu primeiro emprego. Hoje trabalho em escritório e faço parte do time de TI.',
      course: 'Informática Básica',
      neighborhood: 'Jardim Camburi',
      year: '2024',
    },
    {
      name: 'Rosane T.',
      text: 'Aprendi Confeitaria do zero e hoje vendo bolos artesanais na minha comunidade. O que era hobby virou renda real. Gratidão ao Qualifica Vix!',
      course: 'Confeitaria',
      neighborhood: 'Maruípe',
      year: '2025',
    },
  ];

  return (
    <section className="w-full border-t border-[var(--line)] bg-white px-4 py-14 sm:px-6 sm:py-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Histórias Reais
          </span>
          <h2 className="editorial-caps mt-3 text-4xl text-[var(--ink)] md:text-6xl">
            O que dizem nossos alunos
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base font-medium text-[var(--ink-soft)]">
            Pessoas que transformaram suas vidas através dos cursos do Qualifica Vix
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {list.map((item, index) => (
            <motion.div
              key={item.name}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={reduced ? { duration: 0 } : { duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between border border-[var(--line)] bg-[var(--canvas)] p-6 transition-colors duration-300 hover:border-[var(--ink)] sm:p-8"
            >
              <div>
                <div className="flex gap-1 text-[var(--brand)]" aria-label="5 de 5 estrelas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current stroke-none" aria-hidden="true" />
                  ))}
                </div>

                <p className="mt-5 text-[15px] leading-relaxed text-[var(--ink)]">
                  "{item.text}"
                </p>
              </div>

              <div>
                <div className="my-5 h-px w-full bg-[var(--line)]" />
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand)]">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight text-[var(--ink)]">
                      {item.name}
                    </span>
                    <span className="mt-0.5 text-[13px] font-semibold text-[var(--ink-soft)]">
                      {item.course} · {item.year} · {item.neighborhood}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
