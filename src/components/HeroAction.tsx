import { ArrowUpRight } from 'lucide-react';
import MotionPill from './MotionPill';

export default function HeroAction() {
  return (
    <MotionPill
      as="a"
      href="#cursos-section"
      tone="brand"
      className="course-hero-action"
      icon={<ArrowUpRight size={20} aria-hidden="true" />}
    >
      Encontrar meu curso
    </MotionPill>
  );
}
