let charts = {};

function mostrarPopup(mensagem, tipo = 'info') {
    const icones = { success: 'OK', error: '!', warning: '!', info: 'i' };
    let container = document.getElementById('admin-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `admin-toast ${tipo}`;
    toast.innerHTML = `
        <span class="admin-toast-icon">${icones[tipo] || 'i'}</span>
        <div class="admin-toast-content">${mensagem}</div>
        <button type="button" class="admin-toast-close">x</button>
    `;
    const removerToast = () => toast.remove();
    toast.querySelector('.admin-toast-close').addEventListener('click', removerToast);
    container.appendChild(toast);
    setTimeout(removerToast, 4200);
}

async function lerJsonOuLancar(res) {
    if (res.status === 401 || (res.redirected && String(res.url || '').includes('/admin/login.html'))) {
        window.location.href = '/admin/login.html';
        throw new Error('sessao-expirada');
    }
    if (!res.ok) throw new Error(`http-${res.status}`);
    return res.json();
}

async function carregarCursos() {
    try {
        const res = await fetch('/cursos');
        const cursos = await lerJsonOuLancar(res);
        const select = document.getElementById('filtroCurso');
        if (select) {
            cursos.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nome} (Turma #${c.id})</option>`;
            });
        }
    } catch (err) {
        console.error('Erro ao carregar cursos:', err);
    }
}

async function carregarRelatorios() {
    const query = new URLSearchParams();
    const curso_id = document.getElementById('filtroCurso').value;
    const genero = document.getElementById('filtroGenero').value;
    const raca_cor = document.getElementById('filtroRaca').value;
    const bairro = document.getElementById('filtroBairro').value.trim();
    const data_inicio = document.getElementById('dataInicio').value;
    const data_fim = document.getElementById('dataFim').value;

    if (curso_id) query.append('curso_id', curso_id);
    if (genero) query.append('genero', genero);
    if (raca_cor) query.append('raca_cor', raca_cor);
    if (bairro) query.append('bairro', bairro);
    if (data_inicio) query.append('data_inicio', data_inicio);
    if (data_fim) query.append('data_fim', data_fim);

    try {
        const res = await fetch(`/api/admin/relatorios-stats?${query.toString()}`);
        const data = await lerJsonOuLancar(res);
        
        // Atualizar KPIs
        const kpis = data.kpis || { total: 0, concluidos: 0, evadidos: 0, satisfacao_media: 0 };
        document.getElementById('kpiTotal').textContent = kpis.total;
        document.getElementById('kpiConcluidos').textContent = kpis.concluidos;
        document.getElementById('kpiEvadidos').textContent = kpis.evadidos;
        document.getElementById('kpiSatisfacao').textContent = Number(kpis.satisfacao_media || 0).toFixed(1);

        const taxaConclusao = kpis.total > 0 ? ((kpis.concluidos / kpis.total) * 100).toFixed(1) : '0.0';
        const taxaEvasao = kpis.total > 0 ? ((kpis.evadidos / kpis.total) * 100).toFixed(1) : '0.0';

        document.getElementById('subConcluidos').textContent = `Taxa de conclusão: ${taxaConclusao}%`;
        document.getElementById('subEvadidos').textContent = `Taxa de evasão: ${taxaEvasao}%`;

        // Renderizar gráficos
        renderDoughnutChart('chartGenero', data.genero, 'Gênero');
        renderBarChart('chartFaixaEtaria', data.faixa_etaria, 'Faixa Etária');
        renderPieChart('chartRaca', data.raca_cor, 'Raça/Cor');
        renderBarChart('chartEscolaridade', data.escolaridade, 'Escolaridade');
        renderDoughnutChart('chartDeficiencia', data.deficiencia, 'PcD');
        renderHorizontalBarChart('chartObjetivo', data.objetivo, 'Objetivos');
        renderBarChart('chartBairro', data.bairro.slice(0, 15), 'Bairro (Top 15)'); // Limita a top 15 bairros para visualização limpa
    } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
        mostrarPopup('Erro ao carregar dados dos relatórios.', 'error');
    }
}

const PALETTE = [
    '#f9c852', '#ff8a5a', '#3b82f6', '#10b981', '#6366f1', 
    '#ec4899', '#14b8a6', '#f59e0b', '#84cc16', '#a855f7'
];

const TEXT_COLOR = '#cbd5e1';
const GRID_COLOR = '#334155';

function getChartData(rawData) {
    const labels = rawData.map(d => d.label || 'Não informado');
    const values = rawData.map(d => Number(d.total || 0));
    return { labels, values };
}

function renderDoughnutChart(canvasId, rawData, label) {
    const { labels, values } = getChartData(rawData);
    if (charts[canvasId]) charts[canvasId].destroy();

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: PALETTE.slice(0, values.length),
                borderWidth: 1,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: TEXT_COLOR, font: { size: 10 } }
                }
            }
        }
    });
}

function renderPieChart(canvasId, rawData, label) {
    const { labels, values } = getChartData(rawData);
    if (charts[canvasId]) charts[canvasId].destroy();

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: PALETTE.slice(0, values.length),
                borderWidth: 1,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: TEXT_COLOR, font: { size: 10 } }
                }
            }
        }
    });
}

function renderBarChart(canvasId, rawData, label) {
    const { labels, values } = getChartData(rawData);
    if (charts[canvasId]) charts[canvasId].destroy();

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Inscrições',
                data: values,
                backgroundColor: '#3b82f6',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: TEXT_COLOR, font: { size: 10 } }
                },
                y: {
                    grid: { color: GRID_COLOR },
                    ticks: { color: TEXT_COLOR, font: { size: 10 }, stepSize: 1 }
                }
            }
        }
    });
}

function renderHorizontalBarChart(canvasId, rawData, label) {
    const { labels, values } = getChartData(rawData);
    if (charts[canvasId]) charts[canvasId].destroy();

    const ctx = document.getElementById(canvasId).getContext('2d');
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Inscrições',
                data: values,
                backgroundColor: '#ff8a5a',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: GRID_COLOR },
                    ticks: { color: TEXT_COLOR, font: { size: 10 }, stepSize: 1 }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: TEXT_COLOR, font: { size: 9 } }
                }
            }
        }
    });
}

function aplicarFiltros(e) {
    e.preventDefault();
    carregarRelatorios();
}

function limparFiltros() {
    document.getElementById('formFiltroRelatorios').reset();
    carregarRelatorios();
}

// Inicializar
carregarCursos();
carregarRelatorios();
