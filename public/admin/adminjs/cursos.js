/* =========================================================
   MONITORAMENTO DE TURMAS — cursos.js
   Consome /api/admin/cursos-stats e /api/admin/stats
========================================================= */

async function carregarMonitoramento() {
    try {
        const lerJsonOuLancar = async (res) => {
            if (res.status === 401 || (res.redirected && String(res.url || '').includes('/admin/login.html'))) {
                window.location.href = '/admin/login.html';
                throw new Error('sessao-expirada');
            }
            if (!res.ok) {
                throw new Error(`http-${res.status}`);
            }
            const tipo = String(res.headers.get('content-type') || '').toLowerCase();
            if (!tipo.includes('application/json')) {
                throw new Error('resposta-nao-json');
            }
            return res.json();
        };

        const [resStats, resCursos] = await Promise.all([
            fetch('/api/admin/stats'),
            fetch('/api/admin/cursos-stats')
        ]);
        const stats = await lerJsonOuLancar(resStats);
        const cursos = await lerJsonOuLancar(resCursos);

        // ── KPIs ──────────────────────────────────────────
        const totalInscritos = stats.inscritos;
        const totalVagas = cursos.filter(c => c.situacao === 'aberto').reduce((acc, c) => acc + (c.vagas_disponiveis || 0), 0);
        const esgotadas = cursos.filter(c => c.situacao === 'esgotado').length;

        document.getElementById('kpiTotal').textContent = stats.total;
        document.getElementById('kpiVagas').textContent = totalVagas;
        document.getElementById('kpiInscritos').textContent = totalInscritos;
        document.getElementById('kpiEsgotadas').textContent = esgotadas;

        // ── Tabela ────────────────────────────────────────
        const tbody = document.getElementById('tabelaCursos');
        if (!cursos.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhuma turma cadastrada.</td></tr>';
        } else {
            tbody.innerHTML = cursos.map(c => {
                const badge = '<span class="badge">' + escapeHtml(c.situacao_label) + '</span>';
                return `
                <tr>
                    <td><strong>${escapeHtml(c.nome)}</strong><br><small>${c.data_inicio || "A definir"} até ${c.data_termino || "A definir"}</small><br><a href="/admin/inscritos.html?curso=${c.id}">Ver inscritos</a></td>
                    <td class="text-sm text-muted">${escapeHtml(c.local)}</td>
                    <td><strong>${c.total_inscritos}</strong><br><small>${c.inscritos} vagas ocupadas</small></td>
                    <td>${c.vagas_disponiveis}</td>
                    <td>${badge}</td>
                </tr>`;
            }).join('');
        }

        // ── Barras de progresso ───────────────────────────
        const listaProgresso = document.getElementById('listaProgresso');
        if (!cursos.length) {
            listaProgresso.innerHTML = '<p class="text-muted text-sm">Nenhuma turma para exibir.</p>';
            return;
        }

        listaProgresso.innerHTML = cursos.map(c => {
            const total = c.vagas_totais || 0;
            const taxa = total > 0 ? Math.round((c.inscritos / total) * 100) : 0;
            let cor = 'var(--success)';
            if (taxa >= 90) cor = 'var(--danger)';
            else if (taxa >= 70) cor = 'var(--warning)';

            return `
            <div class="progresso-item">
                <div class="progresso-header">
                    <span class="fw-600">${escapeHtml(c.nome)}</span>
                    <span style="color:${cor}">${taxa}%</span>
                </div>
                <div class="barra-fundo">
                    <div class="barra-preench" style="width:${taxa}%; background:${cor};"></div>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error('Erro ao carregar monitoramento:', err);
        document.getElementById('tabelaCursos').innerHTML =
            '<tr><td colspan="5" style="color:var(--danger);text-align:center;padding:1.5rem;">Sessão expirada ou erro ao carregar dados do servidor.</td></tr>';
    }
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
carregarMonitoramento();
document.addEventListener('visibilitychange', () => { if (!document.hidden) carregarMonitoramento(); });
setInterval(() => { if (!document.hidden) carregarMonitoramento(); }, 30000);
