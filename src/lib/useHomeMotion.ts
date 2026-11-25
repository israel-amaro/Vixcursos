import { useRef } from 'react';

// Preserva a referência de raiz da Home para futuros observadores sem causar flash de opacidade.
export function useHomeMotion() {
  return useRef<HTMLDivElement>(null);
}
