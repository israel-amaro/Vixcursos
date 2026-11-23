const steps = [
  { title: 'Escolha um curso', text: 'Todos são gratuitos e têm certificado.' },
  { title: 'Faça a pré-inscrição', text: 'Leva poucos minutos. Tenha o CPF em mãos.' },
  { title: 'Aguarde o contato', text: 'A equipe liga para confirmar a sua vaga.' },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" aria-labelledby="como-title" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 id="como-title" className="text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-[var(--ink)] sm:text-4xl">
          Como funciona
        </h2>
        <ol className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 sm:flex-col">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--canvas)] text-xl font-extrabold text-[var(--brand)]" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="text-[20px] font-bold text-[var(--ink)]">{s.title}</h3>
                <p className="mt-1 text-[17px] text-[var(--ink-soft)]">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 rounded-[var(--radius-control)] bg-[var(--canvas)] p-4 text-[16px] text-[var(--ink-soft)]">
          A pré-inscrição não garante a vaga. A matrícula só é confirmada depois do contato da equipe.
        </p>
      </div>
    </section>
  );
}
