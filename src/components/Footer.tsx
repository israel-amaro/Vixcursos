import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const social = [
  { label: 'Facebook da Prefeitura de Vitória', href: 'https://facebook.com/prefeituradevitoria', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
  { label: 'Instagram da Prefeitura de Vitória', href: 'https://instagram.com/prefeituradevitoria', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm9 9.4A4 4 0 1 1 12.6 8a4 4 0 0 1 3.4 3.4zM17.5 6.5h0' },
  { label: 'YouTube da Prefeitura de Vitória', href: 'https://youtube.com/prefeituradevitoria', path: 'M22.5 6.4a2.8 2.8 0 0 0-1.9-2C18.9 4 12 4 12 4s-6.9 0-8.6.5a2.8 2.8 0 0 0-1.9 2A29 29 0 0 0 1 11.8a29 29 0 0 0 .5 5.3A2.8 2.8 0 0 0 3.4 19c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.8 2.8 0 0 0 1.9-2 29 29 0 0 0 .5-5.2 29 29 0 0 0-.5-5.4zM9.8 15V8.5l5.7 3.3z' },
];

export default function Footer({ onOpenSurvey }: { onOpenSurvey?: () => void }) {
  return (
    <footer className="border-t border-[var(--line)] bg-white px-4 pb-28 pt-12 sm:px-6 sm:pb-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-4">
          <BrandLogo className="h-12 w-auto" />
          <span className="h-8 w-px bg-[var(--line)]" />
          <img src="/imagem/prefeitura-preto-transparente.webp" alt="Prefeitura de Vitória" className="h-10 w-auto" />
        </div>

        <nav aria-label="Rodapé" className="mt-8 grid grid-cols-1 text-[16px] sm:grid-cols-4">
          <Link to="/sobre" className="flex min-h-12 items-center text-[var(--ink)] hover:text-[var(--brand)]">Sobre o programa</Link>
          {onOpenSurvey && <button onClick={onOpenSurvey} className="flex min-h-12 items-center text-left text-[var(--ink)] hover:text-[var(--brand)]">Avaliar o Qualifica Vix</button>}
          <a href="https://vivacidade.vitoria.es.gov.br/" target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center text-[var(--ink)] hover:text-[var(--brand)]">Esporte e cultura: VIVAcidade ↗</a>
          <a href="tel:+552731351000" className="flex min-h-12 items-center text-[var(--ink)] hover:text-[var(--brand)]">(27) 3135-1000</a>
        </nav>

        <div className="mt-8 flex flex-col gap-6 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] text-[var(--ink-soft)]">© 2026 Qualifica Vix · Prefeitura Municipal de Vitória</p>
          <div className="flex gap-2">
            {social.map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="grid h-11 w-11 place-items-center rounded-full bg-[var(--canvas)] text-[var(--ink)] hover:text-[var(--brand)]">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
