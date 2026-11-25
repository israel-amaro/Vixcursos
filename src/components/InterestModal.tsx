import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { getMascot, mascots } from '../lib/mascots';
import MotionPill from './MotionPill';

interface InterestCourse { id: number; nome: string; categoria: string; mascote_id?: string }
export default function InterestModal({ course, onClose }: { course?: InterestCourse | null; onClose: () => void }) {
  const [areas, setAreas] = useState<{ id: number; categoria: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const elements = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, a[href]');
        if (elements?.length) {
          const first = elements[0], last = elements[elements.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', keyboard);
    const controller = new AbortController();
    if (!course) fetch('/public/categoria', { signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(setAreas).catch(() => {});
    return () => { controller.abort(); document.body.style.overflow = overflow; document.removeEventListener('keydown', keyboard); previous?.focus(); };
  }, [course, onClose]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    setSending(true); setError('');
    try {
      const response = await fetch('/api/interessados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: data.get('nome'),
          whatsapp: data.get('whatsapp'),
          email: data.get('email'),
          perfil: course?.categoria || data.get('perfil'),
          curso_id: course?.id || null,
          regiao: data.get('regiao'),
          origem: course ? 'site_curso' : 'site',
          autoriza_contato: data.get('autoriza_contato') === 'on',
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível registrar o interesse.');
      setSuccess(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Tente novamente.'); }
    finally { setSending(false); }
  };

  const mascot = getMascot(course?.mascote_id, course?.categoria);
  return (
    <div data-lenis-prevent className="responsive-overlay fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="interest-title" className="responsive-dialog relative w-full max-w-lg overflow-y-auto border border-[var(--line)] bg-white p-5 text-[var(--ink)] shadow-2xl sm:p-7">
        <button ref={close} type="button" onClick={onClose} aria-label="Fechar interesse" className="absolute right-3 top-3 rounded-full p-3 text-[var(--ink-soft)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)]">
          <X size={20} />
        </button>
        <img src={mascot.imagem} alt={mascot.nome} className="mx-auto h-24 w-24 object-contain" />
        <h2 id="interest-title" className="editorial-caps mb-2 text-center text-3xl text-[var(--ink)]">
          {success ? 'Interesse registrado!' : 'Quero receber novidades'}
        </h2>
        {success ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto text-[var(--open)]" size={32} />
            <p className="text-[15px] text-[var(--ink-soft)]">A equipe do Qualifica Vix poderá entrar em contato sobre {course ? course.nome : 'cursos na área escolhida'}. Este cadastro não reserva uma vaga.</p>
            <MotionPill onClick={onClose} className="w-full">Concluir</MotionPill>
          </div>
        ) : (
          <>
            <p className="mb-5 text-center text-[15px] text-[var(--ink-soft)]">
              {course ? `Registre seu interesse em ${course.nome}.` : 'Escolha uma área e deixe seu contato para a equipe do Qualifica Vix.'} Não é uma pré-inscrição.
            </p>
            <form onSubmit={submit} className="space-y-3.5">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Nome completo
                <input name="nome" required minLength={3} maxLength={160} autoComplete="name" className="mt-1.5 h-12 w-full border border-[var(--line)] bg-white px-3.5 text-base focus:border-[var(--brand)] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                WhatsApp com DDD
                <input name="whatsapp" type="tel" maxLength={20} autoComplete="tel" placeholder="(27) 99999-9999" className="mt-1.5 h-12 w-full border border-[var(--line)] bg-white px-3.5 text-base focus:border-[var(--brand)] focus:outline-none" />
              </label>
              <label className="block text-sm font-semibold text-[var(--ink)]">
                E-mail
                <input name="email" type="email" maxLength={254} autoComplete="email" className="mt-1.5 h-12 w-full border border-[var(--line)] bg-white px-3.5 text-base focus:border-[var(--brand)] focus:outline-none" />
              </label>
              <p className="text-sm text-[var(--ink-soft)]">Informe pelo menos um telefone ou e-mail.</p>
              {!course && (
                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Área de interesse
                  <select name="perfil" required className="mt-1.5 h-12 w-full border border-[var(--line)] bg-white px-3.5 text-base focus:border-[var(--brand)] focus:outline-none">
                    <option value="">Selecione uma área</option>
                    {areas.length ? areas.map(area => <option key={area.id}>{area.categoria}</option>) : mascots.filter(m => m.id !== 'vitoruga').map(m => <option key={m.id}>{m.profissao}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Cidade ou bairro (opcional)
                <input name="regiao" maxLength={120} autoComplete="address-level2" className="mt-1.5 h-12 w-full border border-[var(--line)] bg-white px-3.5 text-base focus:border-[var(--brand)] focus:outline-none" />
              </label>
              <label className="flex items-start gap-3 py-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                <input name="autoriza_contato" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]" />
                <span>Autorizo o uso destes dados pela equipe do Qualifica Vix para contato sobre cursos e oportunidades de qualificação.</span>
              </label>
              {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
              <MotionPill type="submit" disabled={sending} className="w-full">
                {sending ? 'Salvando…' : 'Registrar meu interesse'}
              </MotionPill>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
