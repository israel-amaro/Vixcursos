const TIME_ZONE = 'America/Sao_Paulo';

// Calendar dates represent the day recorded by the institution, not a UTC instant.
function calendarDate(value) {
    if (!value) return null;
    const text = String(value);
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
    const br = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const parts = iso ? [iso[1], iso[2], iso[3]] : br ? [br[3], br[2], br[1]] : null;
    if (!parts) return null;
    const [year, month, day] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return parts.join('-');
}

function localDay(value = Date.now()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
    const part = name => parts.find(p => p.type === name).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
}

function courseState(course, now = Date.now()) {
    const today = localDay(now);
    const end = calendarDate(course.data_termino);
    const publication = course.data_publicacao || course.publicado_em;
    const opening = course.data_abertura_inscricao || course.inscricoes_abertas_em;
    const closing = course.data_encerramento_inscricao || course.inscricoes_fecham_em;
    const before = value => value && (value.includes('T') ? now < Date.parse(value) : today < calendarDate(value));
    const after = value => value && (value.includes('T') ? now >= Date.parse(value) : today > calendarDate(value));
    let situacao, label;
    if (course.status === 'arquivado') [situacao, label] = ['arquivado', 'Arquivado'];
    else if (end && today > end) [situacao, label] = ['encerrado', 'Encerrado'];
    else if (publication && now < Date.parse(publication)) [situacao, label] = ['agendado', 'Agendado'];
    else if (before(opening)) [situacao, label] = ['inscricoes_futuras', 'Inscrições em breve'];
    else if (after(closing)) [situacao, label] = ['inscricoes_encerradas', 'Inscrições encerradas'];
    else if (course.status === 'esgotado' || Number(course.vagas_disponiveis) === 0) [situacao, label] = ['esgotado', 'Lista de espera'];
    else [situacao, label] = ['aberto', 'Inscrições abertas'];
    return { situacao, situacao_label: label, aceita_inscricoes: ['aberto', 'esgotado'].includes(situacao),
        data_inicio_iso: calendarDate(course.data_inicio), data_termino_iso: end };
}

module.exports = { calendarDate, localDay, courseState, TIME_ZONE };
