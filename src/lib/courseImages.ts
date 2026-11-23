// Photos of real Qualifica Vix classes, served from /public/imagem/cursos in two widths.
// Regenerate them with scripts/fotos-cursos.cjs after adding a photo to public/imagem/proficao.
export type CourseImage = { src: string; srcSet: string; local: boolean };

const local = (name: string): CourseImage => ({
  src: `/imagem/cursos/${name}-640.webp`,
  srcSet: `/imagem/cursos/${name}-640.webp 640w, /imagem/cursos/${name}-1200.webp 1200w`,
  local: true,
});

const unsplash = (id: string): CourseImage => {
  const url = (w: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70&w=${w}`;
  return { src: url(640), srcSet: `${url(640)} 640w, ${url(1200)} 1200w`, local: false };
};

// Order matters: the first rule whose keywords appear in the course name or category wins.
const rules: [string[], () => CourseImage][] = [
  [['enfermag', 'saude', 'cuidador', 'socorro'], () => local('saude')],
  [['barbe', 'cabele', 'beleza', 'estetica', 'manicure', 'unha', 'maquiag'], () => local('beleza')],
  [['gastronom', 'cozinha', 'confeit', 'panific', 'bolo', 'alimenta', 'salgad'], () => local('gastronomia')],
  [['eletric', 'energia', 'solar', 'eletron'], () => local('eletrica')],
  [['moto', 'veicul', 'mecanic', 'automot'], () => local('veiculos')],
  [['confec', 'costura', 'moda', 'artesan'], () => local('confeccao')],
  [['administ', 'gestao', 'rh', 'recursos humanos', 'logistic', 'comerc', 'atendimento'], () => local('administracao')],
  [['informat', 'tecnolog', 'program', 'excel', 'computa', 'digital'], () => unsplash('photo-1517077304055-6e89abbf09b0')],
  [['constru', 'pedreir', 'pintor', 'servico'], () => unsplash('photo-1504307651254-35680f356dfd')],
];

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function courseImage(categoria = '', nome = ''): CourseImage {
  const text = normalize(`${nome} ${categoria}`);
  const rule = rules.find(([keywords]) => keywords.some(k => text.includes(k)));
  return rule ? rule[1]() : local('gastronomia');
}

// Rotating photos for the home hero, in display order.
export const heroImages = ['beleza', 'gastronomia', 'eletrica', 'veiculos'].map(local);
