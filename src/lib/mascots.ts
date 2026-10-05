import { useEffect, useState } from 'react';
import catalog from '../../public/mascotes.json';

export const mascots = catalog;
const STORAGE_KEY = 'qualifica-vix-mascote';
export function getMascot(id?: string, category = '') {
  const selected = catalog.find(m => m.id === id);
  if (selected) return selected;
  const text = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const inferred = /gastr|panifica|confeit|cozinha/.test(text) ? 'chef'
    : /informat|program|tecnolog|rede/.test(text) ? 'tecnologia'
    : /enferm|saude/.test(text) ? 'saude'
    : /moda|confecc|costura/.test(text) ? 'moda'
    : /beleza|estetica/.test(text) ? 'beleza'
    : /admin|gestao|comerc|venda|logist|recursos humanos/.test(text) ? 'gestao'
    : /construc|eletric|mecanic|manuten|solda/.test(text) ? 'construcao' : 'vitoruga';
  return catalog.find(m => m.id === inferred)!;
}
export function readMascotPreference() {
  try { return localStorage.getItem(STORAGE_KEY) || 'auto'; } catch { return 'auto'; }
}
export function saveMascotPreference(id: string) {
  const safeId = id === 'auto' || catalog.some(m => m.id === id) ? id : 'auto';
  try { localStorage.setItem(STORAGE_KEY, safeId); } catch { /* Storage may be disabled. */ }
  window.dispatchEvent(new Event('mascot-preference'));
}
export function useMascotPreference() {
  const [preference, setPreference] = useState(readMascotPreference);
  useEffect(() => {
    const sync = () => setPreference(readMascotPreference());
    window.addEventListener('mascot-preference', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('mascot-preference', sync); window.removeEventListener('storage', sync); };
  }, []);
  return { preference, choose: saveMascotPreference };
}
