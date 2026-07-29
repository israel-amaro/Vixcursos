import React from 'react';
import { 
  Scissors, 
  Shirt, 
  ChefHat, 
  Monitor, 
  Zap, 
  Briefcase, 
  HardHat 
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export interface CategoryItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  Icon: React.ElementType;
  accent: string;
  mascoteIcon: string;
  filterName: string;
}

const categorias: CategoryItem[] = [
  {
    id: 1,
    title: 'INFORMÁTICA',
    subtitle: 'Tecnologia & Inovação',
    description: 'Informática básica, Excel, Manutenção de Computadores e Programação.',
    Icon: Monitor,
    accent: '#60a5fa',
    mascoteIcon: '💻🐢',
    filterName: 'Informática / Tecnologia',
  },
  {
    id: 2,
    title: 'GASTRONOMIA',
    subtitle: 'Culinária & Confeitaria',
    description: 'Cozinha básica, Confeitaria, Padaria, Pizzaiolo e Drinks.',
    Icon: ChefHat,
    accent: '#fbbf24',
    mascoteIcon: '👨‍🍳🐢',
    filterName: 'Gastronomia',
  },
  {
    id: 3,
    title: 'BELEZA',
    subtitle: 'Estética & Cuidados Pessoais',
    description: 'Barbeiro, Cabeleireiro, Manicure, Maquiagem e Estética.',
    Icon: Scissors,
    accent: '#ff8a5a',
    mascoteIcon: '✂️🐢',
    filterName: 'Beleza',
  },
  {
    id: 4,
    title: 'ELÉTRICA',
    subtitle: 'Energia & Manutenção',
    description: 'Instalações elétricas prediais, comandos e manutenção de equipamentos.',
    Icon: Zap,
    accent: '#f59e0b',
    mascoteIcon: '⚡🐢',
    filterName: 'Eletricista / Energia',
  },
  {
    id: 5,
    title: 'COSTURA & MODA',
    subtitle: 'Modelagem & Confecção',
    description: 'Corte e costura, confecção de moda praia, ajustes e técnicas de acabamento.',
    Icon: Shirt,
    accent: '#f472b6',
    mascoteIcon: '🧵🐢',
    filterName: 'Confecção',
  },
  {
    id: 6,
    title: 'ADMINISTRAÇÃO',
    subtitle: 'Gestão & Vendas',
    description: 'Auxiliar administrativo, atendimento ao cliente, vendas e rotinas de escritório.',
    Icon: Briefcase,
    accent: '#34d399',
    mascoteIcon: '💼🐢',
    filterName: 'Administração',
  },
  {
    id: 7,
    title: 'CONSTRUÇÃO CIVIL',
    subtitle: 'Obras & Serviços Técnicos',
    description: 'Alvenaria, pintura predial, hidráulica e reparos residenciais.',
    Icon: HardHat,
    accent: '#a78bfa',
    mascoteIcon: '🧱🐢',
    filterName: 'Construção Civil / Serviço',
  },
];

interface CategoriasCursosProps {
  onSelectCategory?: (category: string) => void;
}

export default function CategoriasCursos({ onSelectCategory }: CategoriasCursosProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 4000, stopOnInteraction: false })
  ]);

  const handleCategoryClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    const el = document.getElementById('cursos-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categorias-section" className="w-full bg-slate-900 text-white py-14 px-6 md:px-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-accent font-bold">
              Áreas de Qualificação
            </span>
            <h2 className="text-2xl md:text-4xl font-display font-extrabold text-white mt-1">
              Explore os Cursos por Categoria
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-lg">
              Clique em uma área profissional para filtrar as turmas disponíveis com o auxílio do nosso mascote Vitoruga!
            </p>
          </div>
        </div>

        {/* Categories Grid (Desktop & Tablet) / Embla Carousel (Mobile) */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-5">
            {categorias.map((cat) => {
              const { Icon } = cat;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.filterName)}
                  className="flex-none w-[260px] sm:w-[280px] bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-accent/50 rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1.5 shadow-lg relative overflow-hidden"
                >
                  {/* Category Accent Pill */}
                  <div
                    className="absolute -top-12 -right-12 w-28 h-28 rounded-full filter blur-xl opacity-30 pointer-events-none transition-opacity group-hover:opacity-60"
                    style={{ backgroundColor: cat.accent }}
                  />

                  {/* Top Bar: Icon + Vitoruga Mascot styling badge */}
                  <div className="flex items-center justify-between mb-6 z-10">
                    <div
                      className="p-3.5 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: cat.accent }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Mascote Vitoruga Badge Styled for Category */}
                    <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 flex items-center gap-1.5 text-xs font-bold text-white/90 group-hover:bg-accent/20 transition-colors">
                      <span className="text-base">{cat.mascoteIcon}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">Vitoruga</span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="z-10 flex-1 flex flex-col justify-end">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                      {cat.subtitle}
                    </span>
                    <h3 className="text-lg font-display font-extrabold text-white leading-tight mb-2 group-hover:text-accent transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between z-10 text-xs font-bold text-slate-400 group-hover:text-accent transition-colors">
                    <span>Ver cursos</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
