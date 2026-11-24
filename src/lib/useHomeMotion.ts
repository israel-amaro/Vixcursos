import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// One observer for the home. Content stays readable before and after animation.
export function useHomeMotion() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const element = root.current;
    if (!element || reduced) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('motion-entered');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.15 });
    element.querySelectorAll('h2, #como-funciona li, #ajuda li').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [reduced]);
  return root;
}
