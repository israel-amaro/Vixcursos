import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const INTRO_SESSION_KEY = 'qualificavix-intro-video-v2';
export const INTRO_VIDEO_URL = 'https://res.cloudinary.com/j35zooeo/video/upload/v1791308141/1006_1_1.mp4';

export function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true'; }
  catch { return true; }
}

export default function IntroVideo({ onFinish }: { onFinish: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab') { event.preventDefault(); overlay.current?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    // A failed player or a slow connection must never prevent access to courses.
    const timeout = window.setTimeout(onFinish, 15000);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyboard);
      previousFocus?.focus();
    };
  }, [onFinish]);

  return <motion.div ref={overlay} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Boas-vindas ao Qualifica Vix"
    className="intro-video fixed inset-0 z-[10010] flex items-center justify-center overflow-hidden bg-white outline-none"
    initial={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
    exit={{ opacity: 0, filter: 'blur(22px)', scale: 1.015 }}
    transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}>
    <video src={INTRO_VIDEO_URL} autoPlay muted playsInline preload="auto"
      aria-label="Abertura da Prefeitura de Vitória" className="h-full w-full object-contain"
      onEnded={onFinish} onError={onFinish} />
  </motion.div>;
}
