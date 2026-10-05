import { useEffect, useState } from 'react';
import { getMascot, useMascotPreference } from '../lib/mascots';

export default function MascotPicker() {
  const { preference, choose } = useMascotPreference();
  const [open, setOpen] = useState(false);
  const [mascots, setMascots] = useState<Array<{ id: string; nome: string; imagem: string }>>([]);
  useEffect(() => { fetch('/mascotes.json').then(r => r.json()).then(setMascots).catch(() => {}); }, []);
  return <div className="mascot-picker shrink-0 text-left">
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="text-xs font-bold text-accent cursor-pointer py-2">
      🐢 {open ? 'Fechar escolha' : 'Escolha seu Vitoruga'}
    </button>
    {open && <div className="grid grid-cols-3 gap-2 p-2 sm:p-3 rounded-2xl bg-slate-800 border border-white/15 text-white max-h-40 sm:max-h-52 overflow-y-auto overscroll-contain">
      <button type="button" onClick={() => choose('auto')} aria-pressed={preference === 'auto'} className={`rounded-xl p-2 text-xs border ${preference === 'auto' ? 'border-accent bg-accent/15' : 'border-white/10'}`}>
        <img src={getMascot().imagem} alt="" className="h-14 w-full object-contain" />Automático
      </button>
      {mascots.map(m => <button type="button" key={m.id} onClick={() => choose(m.id)} aria-pressed={preference === m.id} className={`rounded-xl p-2 text-xs border ${preference === m.id ? 'border-accent bg-accent/15' : 'border-white/10 hover:border-accent'}`}>
        <img src={m.imagem} alt="" className="h-14 w-full object-contain" />{m.nome}
      </button>)}
    </div>}
  </div>;
}
