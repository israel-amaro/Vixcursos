let interessados = [];
let carregando = false;
let meuGrafico;
const statuses = { aguardando: 'Aguardando contato', contatado: 'Contatado', enviado: 'Aviso enviado', matriculado: 'Matriculado', desinteressado: 'Sem interesse' };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const formatarDataHoraBR = value => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString('pt-BR') : '—';
const clean = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

async function lerResposta(response) {
    if (response.status === 401 || response.status === 403) { window.location.replace('/admin/login.html'); throw new Error('Sessão expirada.'); }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao consultar o servidor.');
    return data;
}

function renderizarInteressados() {
    const query = clean(document.getElementById('buscaInteressados').value);
    const status = document.getElementById('statusInteressados').value;
    const list = interessados.filter(lead => (!status || lead.status === status) && clean([lead.nome, lead.email, lead.whatsapp, lead.perfil_curso, lead.curso_nome].join(' ')).includes(query));
    document.getElementById('resumoInteressados').textContent = `${list.length} de ${interessados.length} interessados • Dados atualizados do site`;
    const tbody = document.querySelector('.tabela-admin tbody');
    if (!list.length) { tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum interessado encontrado.</td></tr>'; return; }
    tbody.innerHTML = list.map(lead => {
        const phone = String(lead.whatsapp || '').replace(/\D/g, '');
        const source = { site: 'Site', site_curso: 'Página do curso', chat_quiz: 'Quiz do Vitoruga' }[lead.origem] || 'Quiz do Vitoruga';
        return `<tr>
            <td><strong>${escapeHtml(lead.nome)}</strong><br><small>${formatarDataHoraBR(lead.criado_em)}</small></td>
            <td>${phone ? `<a href="https://wa.me/${phone.startsWith('55') && phone.length > 11 ? phone : '55' + phone}" target="_blank" rel="noopener">${escapeHtml(lead.whatsapp)}</a>` : '—'}<br>${escapeHtml(lead.email)}</td>
            <td>${escapeHtml(String(lead.regiao || 'Não informada').replaceAll('_', ' '))}</td>
            <td><strong>${escapeHtml(lead.perfil_curso)}</strong><br>${escapeHtml(lead.curso_nome || 'Interesse na área')}</td>
            <td><select class="interest-status" data-lead="${lead.id}" aria-label="Situação de ${escapeHtml(lead.nome)}">${Object.entries(statuses).map(([id, label]) => `<option value="${id}" ${lead.status === id ? 'selected' : ''}>${label}</option>`).join('')}</select></td>
            <td>${source}<br><small>${formatarDataHoraBR(lead.enviado_em)}</small></td>
        </tr>`;
    }).join('');
}

async function carregarInteressados() {
    if (carregando) return;
    carregando = true;
    try {
        interessados = await lerResposta(await fetch('/api/interessados', { cache: 'no-store', signal: AbortSignal.timeout(15000) }));
        document.getElementById('avisoInteressados').textContent = '';
        renderizarInteressados();
        if (meuGrafico) inicializarGrafico(meuGrafico.config.type);
    } catch (error) { document.getElementById('avisoInteressados').textContent = error.message; }
    finally { carregando = false; }
}

document.querySelector('.tabela-admin tbody').addEventListener('change', async event => {
    const select = event.target.closest('[data-lead]');
    if (!select) return;
    select.disabled = true;
    try {
        await lerResposta(await fetch(`/api/interessados/${select.dataset.lead}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value }), signal: AbortSignal.timeout(15000) }));
        await carregarInteressados();
    } catch (error) {
        document.getElementById('avisoInteressados').textContent = error.message;
        select.value = interessados.find(l => String(l.id) === select.dataset.lead)?.status || 'aguardando';
    } finally { select.disabled = false; }
});
document.getElementById('buscaInteressados').addEventListener('input', renderizarInteressados);
document.getElementById('statusInteressados').addEventListener('change', renderizarInteressados);

function inicializarGrafico(tipo) {
    if (typeof Chart === 'undefined') return;
    const groups = Object.create(null);
    interessados.forEach(lead => { const area = lead.perfil_curso || 'Não informada'; groups[area] = (groups[area] || 0) + 1; });
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(document.getElementById('graficoDemanda').getContext('2d'), {
        type: tipo, data: { labels: Object.keys(groups), datasets: [{ label: 'Interessados por área', data: Object.values(groups), backgroundColor: '#75429b99', borderColor: '#75429b', borderWidth: 2 }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
    });
}
function mudarTipoGrafico(tipo) {
    document.getElementById('btnBarra').classList.toggle('ativo', tipo === 'bar');
    document.getElementById('btnLinha').classList.toggle('ativo', tipo === 'line');
    inicializarGrafico(tipo);
}
function abrirModalGrafico() { document.getElementById('modalGrafico').style.display = 'flex'; mudarTipoGrafico('bar'); }
function fecharModalGrafico() { document.getElementById('modalGrafico').style.display = 'none'; }
document.addEventListener('visibilitychange', () => { if (!document.hidden) carregarInteressados(); });
setInterval(() => { if (!document.hidden) carregarInteressados(); }, 30000);
carregarInteressados();
