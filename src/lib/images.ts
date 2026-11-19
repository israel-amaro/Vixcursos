export function cloudinary(url: string, width: number) {
  return /^https:\/\/res\.cloudinary\.com\//.test(url) ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`) : url;
}
export function imageSrcSet(url: string) {
  if (url.includes('res.cloudinary.com')) return [480, 800, 1200, 1600].map(w => `${cloudinary(url, w)} ${w}w`).join(', ');
  if (url.includes('images.unsplash.com')) return [600, 800, 1200].map(w => `${url.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(', ');
  return undefined;
}
export function startLabel(value: string) {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return `Início das aulas: ${value || 'A definir'}`;
  const start = new Date(+match[3], +match[2] - 1, +match[1]);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return start < today ? `Aulas já começaram em ${match[1]}/${match[2]}` : `Início das aulas: ${value}`;
}
