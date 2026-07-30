import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, ArrowRight, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';

interface MaskedIdentity {
  nome: string;
  email: string;
  telefone: string;
}

interface CpfVerificationModalProps {
  cpf: string;
  maskedIdentity: MaskedIdentity;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (userData: any, sessionToken: string) => void;
  onStartFromScratch: () => void;
}

export default function CpfVerificationModal({
  cpf,
  maskedIdentity,
  isOpen,
  onClose,
  onVerified,
  onStartFromScratch
}: CpfVerificationModalProps) {
  const [step, setStep] = useState<'prompt' | 'code'>('prompt');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes (300 seconds)
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (timerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendCode = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/cidadaos/enviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
        setTimeLeft(300);
        setTimerActive(true);
      } else {
        setErrorMsg(data.error || 'Erro ao enviar código de verificação.');
      }
    } catch (err) {
      setErrorMsg('Falha de conexão com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.replace(/\D/g, '').length !== 6) {
      setErrorMsg('Por favor, informe os 6 dígitos do código recebido.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const resVal = await fetch('/api/cidadaos/validar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, codigo: code.replace(/\D/g, '') })
      });
      const valData = await resVal.json();

      if (!resVal.ok || !valData.sessionToken) {
        setErrorMsg(valData.error || 'Código inválido ou expirado.');
        setLoading(false);
        return;
      }

      // Authenticated fetch for user profile
      const resProfile = await fetch('/api/cidadaos/me', {
        headers: {
          'Authorization': `Bearer ${valData.sessionToken}`
        }
      });
      const profileData = await resProfile.json();

      if (resProfile.ok) {
        onVerified(profileData, valData.sessionToken);
      } else {
        setErrorMsg('Erro ao recuperar dados do perfil autenticado.');
      }
    } catch (err) {
      setErrorMsg('Falha de conexão ao validar o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl text-left flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-3 rounded-2xl bg-accent/15 text-accent border border-accent/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-lg leading-snug">
              Validação de Segurança (OTP)
            </h3>
            <p className="text-xs text-white/60">
              Proteção de dados do cidadão — Qualifica Vix
            </p>
          </div>
        </div>

        {/* Content Step 1: Prompt */}
        {step === 'prompt' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-white/80 leading-relaxed">
              Encontramos um cadastro existente vinculado ao CPF informado. Por razões de privacidade (LGPD), precisamos confirmar sua identidade antes de preencher seus dados:
            </p>

            {/* Masked Info Card */}
            <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 font-mono text-xs text-white/90">
              <div>
                <span className="text-white/40 uppercase text-[10px] block font-sans">Nome</span>
                <strong>{maskedIdentity.nome}</strong>
              </div>
              <div>
                <span className="text-white/40 uppercase text-[10px] block font-sans">E-mail</span>
                <strong>{maskedIdentity.email}</strong>
              </div>
              <div>
                <span className="text-white/40 uppercase text-[10px] block font-sans">Celular</span>
                <strong>{maskedIdentity.telefone}</strong>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="w-full py-3.5 bg-accent hover:bg-accent/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" /> Enviar Código de Verificação
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onStartFromScratch}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 text-white/70 hover:text-white font-semibold text-xs rounded-xl transition-all text-center cursor-pointer"
              >
                Não reconheço esses dados (Preencher do zero)
              </button>
            </div>
          </div>
        )}

        {/* Content Step 2: Code Input */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <p className="text-xs text-white/80 leading-relaxed">
              Enviamos um código de 6 dígitos para o e-mail <strong>{maskedIdentity.email}</strong> e celular <strong>{maskedIdentity.telefone}</strong>. Digite-o abaixo:
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-accent/40 text-center font-mono font-extrabold text-2xl tracking-[0.5em] text-white focus:outline-none focus:border-accent"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Validade do código:</span>
              <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-accent'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Validar Código e Acessar Cadastro <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading || timeLeft > 240}
                className="w-full py-2 bg-transparent text-white/60 hover:text-white text-xs text-center cursor-pointer disabled:opacity-30"
              >
                Reenviar novo código
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
