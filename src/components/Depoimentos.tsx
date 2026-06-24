import React from 'react';
import { Star, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  name: string;
  text: string;
  course: string;
  neighborhood: string;
  year: string;
}

export default function Depoimentos() {
  const list: Testimonial[] = [
    {
      name: "João Carlos M.",
      text: "Depois do curso de Barbeiro, abri meu próprio salão em menos de 6 meses. VIX Cursos me deu a base técnica e a confiança que eu precisava.",
      course: "Barbeiro",
      neighborhood: "São Pedro",
      year: "2025"
    },
    {
      name: "Ana Paula F.",
      text: "O curso de Informática Básica foi o que me faltava para conseguir meu primeiro emprego. Hoje trabalho em escritório e faço parte do time de TI.",
      course: "Informática Básica",
      neighborhood: "Jardim Camburi",
      year: "2024"
    },
    {
      name: "Rosane T.",
      text: "Aprendi Confeitaria do zero e hoje vendo bolos artesanais na minha comunidade. O que era hobby virou renda real. Gratidão ao VIX Cursos!",
      course: "Confeitaria",
      neighborhood: "Maruípe",
      year: "2025"
    }
  ];

  return (
    <section className="w-full bg-white py-20 px-6 md:px-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabecalho */}
        <div className="text-center mb-14">
          <div className="w-12 h-[2px] bg-primary mx-auto mb-4" />
          <span className="font-sans italic text-sm tracking-[0.2em] uppercase text-primary font-bold">
            Histórias Reais
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-800 mt-3 tracking-tight">
            O que dizem nossos alunos
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-3 max-w-xl mx-auto font-medium">
            Pessoas que transformaram suas vidas através dos cursos VIX Cursos
          </p>
        </div>

        {/* Grid de Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: 'easeOut' }}
              className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Estrelas */}
                <div className="flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-accent stroke-none" />
                  ))}
                </div>

                {/* Depoimento */}
                <p className="text-slate-600 text-sm leading-relaxed mt-5 italic">
                  "{item.text}"
                </p>
              </div>

              <div>
                {/* Separador */}
                <div className="w-10 h-[1px] bg-slate-200 my-5" />

                {/* Rodape */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm leading-tight">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5 font-semibold">
                      {item.course} — concluído em {item.year} • {item.neighborhood}
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
