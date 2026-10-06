import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const INTRO_SESSION_KEY = 'qualificavix-intro-video-v1';
export const INTRO_VIDEO_URL = 'https://res.cloudinary.com/j35zooeo/video/upload/v1791308141/1006_1_1.mp4';

export function shouldShowIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try { return sessionStorage.getItem(INTRO_SESSION_KEY) !== 'true'; }
  catch { return true; }
}

export default function IntroVideo({ onFinish }: { onFinish: () => void }) {
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    skip.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFinish();
      if (event.key === 'Tab') { event.preventDefault(); skip.current?.focus(); }
    };
    document.addEventListener('keydown', keyboard);
    // A blocked player or a slow connection must never prevent access to courses.
    const timeout = window.setTimeout(onFinish, 15000);
    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keyboard);
      previousFocus?.focus();
    };
  }, [onFinish]);

  return <motion.div role="dialog" aria-modal="true" aria-label="Boas-vindas ao Qualifica Vix"
    className="intro-video fixed inset-0 z-[10010] flex items-center justify-center bg-white"
    initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
    <video src={INTRO_VIDEO_URL} autoPlay muted playsInline preload="auto"
      aria-label="Abertura da Prefeitura de Vitória" className="h-full w-full object-contain"
      onEnded={onFinish} onError={onFinish} />
    <button ref={skip} onClick={onFinish}
      className="absolute right-4 sm:right-8 bottom-6 sm:bottom-8 rounded-full border border-slate-200 bg-white/95 text-primary px-5 py-3 text-sm font-semibold shadow-sm hover:bg-slate-100">
      Pular abertura
    </button>
  </motion.div>;
}
