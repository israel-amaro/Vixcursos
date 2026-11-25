type Step = {
  pergunta: string;
  opcional?: boolean;
  mascara?: string;
  opcoes?: { texto: string; valor: string }[];
};

export function normalizeStepText(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isOptionalStep(step: Step) {
  return step.opcional === true || /\b(opcional|pular)\b/.test(normalizeStepText(step.pergunta));
}

const skipAnswers = new Set(['nao', 'n', 'nao tenho', 'nao quero', 'nenhum', 'nenhuma',
  'sem', 'pular', 'pula', 'depois', 'nada', 'nao precisa']);

export function resolveStepIntent(text: string, step: Step) {
  const normalized = normalizeStepText(text);
  if (isOptionalStep(step) && skipAnswers.has(normalized)) {
    return { kind: 'skip' as const, value: '' };
  }
  const optionText = normalized === 's' ? 'sim' : normalized === 'n' ? 'nao' : normalized;
  const matches = step.opcoes?.filter(option =>
    [option.texto, option.valor].some(value => normalizeStepText(value) === optionText));
  if (matches?.length === 1) return { kind: 'option' as const, value: matches[0].valor };

  const question = /[?]/.test(text) || /^(como|por\s*que|pra\s*que|para que|onde|quando|qual|quais|quanto|quem|posso|preciso|tenho duvida|nao entendi|me ajude|me ajuda|ajuda|tem curso|quero saber|esse curso|o curso|e gratuito)\b/.test(normalized);
  return { kind: question ? 'question' as const : 'answer' as const, value: text };
}
