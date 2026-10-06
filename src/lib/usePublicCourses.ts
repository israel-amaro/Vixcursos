import { useEffect, useState } from 'react';

export function usePublicCourses<T>() {
  const [courses, setCourses] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      try {
        const response = await fetch('/api/cursos-public', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) });
        if (!response.ok) throw new Error('Não foi possível atualizar os cursos. Tente novamente em instantes.');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('O catálogo está temporariamente indisponível.');
        if (!controller.signal.aborted) { setCourses(data); setError(''); }
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Catálogo indisponível.');
      } finally { pending = false; if (!controller.signal.aborted) setLoading(false); }
    };
    const visibleRefresh = () => { if (!document.hidden) void refresh(); };
    void refresh();
    const timer = window.setInterval(visibleRefresh, 30000);
    document.addEventListener('visibilitychange', visibleRefresh);
    window.addEventListener('focus', visibleRefresh);
    return () => { controller.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', visibleRefresh); window.removeEventListener('focus', visibleRefresh); };
  }, []);
  return { courses, loading, error };
}
