import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { getMascot, mascots } from '../lib/mascots';

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
    document.body.style.overflow = 'hidden'; close.current?.focus();
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
      const response = await fetch('/api/interessados', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: data.get('nome'), whatsapp: data.get('whatsapp'), email: data.get('email'),
          perfil: course?.categoria || data.get('perfil'), curso_id: course?.id || null,
          regiao: data.get('regiao'), origem: course ? 'site_curso' : 'site', autoriza_contato: data.get('autoriza_contato') === 'on' }),
        signal: AbortSignal.timeout(15000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível registrar o interesse.');
      setSuccess(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Tente novamente.'); }
    finally { setSending(false); }
  };
  const mascot = getMascot(course?.mascote_id, course?.categoria);
  return <div data-lenis-prevent className="responsive-overlay fixed inset-0 z-[10001] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="interest-title" className="responsive-dialog w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 overflow-y-auto text-slate-800 shadow-2xl relative">
      <button ref={close} type="button" onClick={onClose} aria-label="Fechar interesse" className="absolute right-3 top-3 p-3 rounded-full hover:bg-slate-100"><X size={20} /></button>
      <img src={mascot.imagem} alt={mascot.nome} className="w-24 h-24 object-contain mx-auto" />
      <h2 id="interest-title" className="text-xl font-extrabold mb-2 text-center">{success ? 'Interesse registrado!' : 'Quero receber novidades'}</h2>
      {success ? <div className="text-center space-y-4"><CheckCircle2 className="mx-auto text-emerald-600" size={32} /><p>A equipe do Qualifica Vix poderá entrar em contato sobre {course ? course.nome : 'cursos na área escolhida'}. Este cadastro não reserva uma vaga.</p><button onClick={onClose} className="w-full rounded-xl bg-accent text-white p-3 font-bold">Concluir</button></div> : <>
        <p className="text-sm text-slate-500 mb-5">{course ? `Registre seu interesse em ${course.nome}.` : 'Escolha uma área e deixe seu contato para a equipe do Qualifica Vix.'} Não é uma pré-inscrição.</p>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-semibold">Nome completo<input name="nome" required minLength={3} maxLength={160} autoComplete="name" className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-base" /></label>
          <label className="block text-sm font-semibold">WhatsApp com DDD<input name="whatsapp" type="tel" maxLength={20} autoComplete="tel" placeholder="(27) 99999-9999" className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-base" /></label>
          <label className="block text-sm font-semibold">E-mail<input name="email" type="email" maxLength={254} autoComplete="email" className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-base" /></label>
          <p className="text-xs text-slate-500">Informe pelo menos um telefone ou e-mail.</p>
          {!course && <label className="block text-sm font-semibold">Área de interesse<select name="perfil" required className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-base"><option value="">Selecione uma área</option>{areas.length ? areas.map(area => <option key={area.id}>{area.categoria}</option>) : mascots.filter(m => m.id !== 'vitoruga').map(m => <option key={m.id}>{m.profissao}</option>)}</select></label>}
          <label className="block text-sm font-semibold">Cidade ou bairro (opcional)<input name="regiao" maxLength={120} autoComplete="address-level2" className="mt-1 w-full border border-slate-300 rounded-xl p-3 text-base" /></label>
          <label className="flex items-start gap-3 text-xs leading-relaxed py-2"><input name="autoriza_contato" type="checkbox" required className="mt-1 w-4 h-4 shrink-0" /><span>Autorizo o uso destes dados pela equipe do Qualifica Vix para contato sobre cursos e oportunidades de qualificação.</span></label>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={sending} className="w-full rounded-xl bg-accent text-white p-3.5 font-bold disabled:opacity-50">{sending ? 'Salvando…' : 'Registrar meu interesse'}</button>
        </form>
      </>}
    </div>
  </div>;
}
