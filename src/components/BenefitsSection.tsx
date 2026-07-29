import React from 'react';
import { Award, GraduationCap, Users, Building2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Award,
      title: 'Certificado Reconhecido',
      description: 'Documento oficial da Prefeitura e instituições parceiras (SENAI/SENAC).',
    },
    {
      icon: GraduationCap,
      title: 'Formação 100% Gratuita',
      description: 'Zero custo com mensalidade ou inscrição para moradores e trabalhadores de Vitória.',
    },
    {
      icon: Users,
      title: 'Professores Especializados',
      description: 'Instrução prática com profissionais atuantes e experientes no mercado.',
    },
    {
      icon: Building2,
      title: 'Aulas Presenciais',
      description: 'Infraestrutura moderna e laboratórios com equipamentos reais.',
    },
    {
      icon: Briefcase,
      title: 'Inserção no Mercado',
      description: 'Oportunidades de emprego formal (CLT) ou capacitação para empreender.',
    },
  ];

  return (
    <section className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-12 px-6 md:px-12 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-accent font-bold">
            Vantagens Exclusivas
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-1">
            Ao concluir o curso você recebe:
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="p-3.5 rounded-2xl bg-accent text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
