import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export default function HeroAction() {
  const reduced = useReducedMotion();
  const bounds = useRef<DOMRect | null>(null);
  return (
    <a href="#cursos-section" className="btn-primary course-hero-action motion-pill"
      onPointerEnter={event => {
        if (event.pointerType === 'mouse' && !reduced) bounds.current = event.currentTarget.getBoundingClientRect();
      }}
      onPointerMove={event => {
        if (event.pointerType !== 'mouse' || reduced || !bounds.current) return;
        const box = bounds.current;
        event.currentTarget.style.translate = `${(event.clientX - box.left - box.width / 2) * 0.1}px ${(event.clientY - box.top - box.height / 2) * 0.2}px`;
      }}
      onPointerLeave={event => { event.currentTarget.style.translate = ''; bounds.current = null; }}
      onBlur={event => { event.currentTarget.style.translate = ''; bounds.current = null; }}>
      <span className="pill-label">
        <span>Encontrar meu curso</span>
        <span aria-hidden="true">Encontrar meu curso</span>
      </span>
      <ArrowUpRight size={20} aria-hidden="true" />
    </a>
  );
}
