import { motion, useReducedMotion } from 'framer-motion';

export default function PhotoReveal() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <motion.div className="photo-curtain" aria-hidden="true" initial="covered" whileInView="open" viewport={{ once: true, amount: 0.15 }}>
      {[0, 1, 2, 3, 4].map(index => (
        <motion.span key={index} variants={{ covered: { scaleX: 1 }, open: { scaleX: 0 } }}
          transition={{ duration: 0.9, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }} />
      ))}
    </motion.div>
  );
}
