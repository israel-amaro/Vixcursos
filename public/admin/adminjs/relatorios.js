let charts = {};
let relatorioAtual = null;
let consultaRelatorio = '';
let filtrosRelatorio = '';
let geradoEm = '';
let requisicaoRelatorio = 0;
let imagensRelatorio = {};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

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
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.nome} (Turma #${c.id})`;
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error('Erro ao carregar cursos:', err);
    }
}

async function carregarRelatorios() {
    const sequencia = ++requisicaoRelatorio;
    document.getElementById('btnRelatorioPdf').disabled = true;
    document.getElementById('btnRelatorioExcel').disabled = true;
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
    if (data_inicio && data_fim && data_fim < data_inicio) {
        document.getElementById('relatorioResumo').textContent = 'A data final precisa ser igual ou posterior à data inicial.';
        return;
    }
    const filters = [curso_id ? document.getElementById('filtroCurso').selectedOptions[0].textContent : 'Todas as turmas', genero, raca_cor, bairro ? `Bairro: ${bairro}` : '', data_inicio ? `De ${data_inicio.split('-').reverse().join('/')}` : '', data_fim ? `Até ${data_fim.split('-').reverse().join('/')}` : ''].filter(Boolean).join(' · ');

    try {
        const res = await fetch(`/api/admin/relatorios-stats?${query.toString()}`);
        const data = await lerJsonOuLancar(res);
        if (sequencia !== requisicaoRelatorio) return;
        relatorioAtual = data;
        consultaRelatorio = query.toString();
        filtrosRelatorio = filters;
        geradoEm = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        document.getElementById('relatorioResumo').textContent = `${data.kpis.total} inscrição(ões) · ${filters} · Atualizado em ${geradoEm}`;
        
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
        for (const chart of Object.values(charts)) chart.update('none');
        imagensRelatorio = Object.fromEntries(['chartGenero', 'chartFaixaEtaria', 'chartRaca', 'chartBairro'].map(id => [id, imagemGraficoRelatorio(id)]));
        document.getElementById('btnRelatorioPdf').disabled = false;
        document.getElementById('btnRelatorioExcel').disabled = false;
    } catch (err) {
        console.error('Erro ao carregar relatórios:', err);
        mostrarPopup('Erro ao carregar dados dos relatórios.', 'error');
        document.getElementById('relatorioResumo').textContent = 'Não foi possível atualizar o relatório. Tente novamente.';
    }
}

const PALETTE = [
    '#283e69', '#75429b', '#2e64bd', '#146844', '#6366f1',
    '#ec4899', '#14b8a6', '#f59e0b', '#84cc16', '#a855f7'
];

const TEXT_COLOR = '#50617c';
const GRID_COLOR = '#dde5ef';

function imagemGraficoRelatorio(id) {
    const source = charts[id];
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 320;
    const chart = new Chart(canvas.getContext('2d'), {
        type: source.config.type,
        data: { labels: [...source.data.labels], datasets: source.data.datasets.map(d => ({ label: d.label, data: [...d.data], backgroundColor: d.backgroundColor, borderColor: d.borderColor, borderWidth: d.borderWidth })) },
        options: { responsive: false, animation: false, plugins: { legend: { display: source.config.type !== 'bar', position: 'bottom' } }, ...(source.config.type === 'bar' ? { scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } : {}) },
    });
    const image = canvas.toDataURL('image/png');
    chart.destroy();
    return image;
}

function prepararRelatorio() {
    if (!relatorioAtual) return;
    const data = relatorioAtual, k = data.kpis;
    const metric = (value, title) => `<div class="report-metric"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(title)}</span></div>`;
    const header = title => `<header class="report-header"><div><p>Prefeitura Municipal de Vitória</p><h1>${title}</h1><p>Qualificação profissional · Qualifica Vix</p></div><img src="/imagem/qualifica-vix.svg" alt="Qualifica Vix"></header>`;
    const groups = [['genero', 'Gênero'], ['faixa_etaria', 'Faixa etária'], ['raca_cor', 'Raça/cor'], ['escolaridade', 'Escolaridade'], ['deficiencia', 'Pessoas com deficiência'], ['objetivo', 'Objetivos declarados'], ['bairro', 'Bairros']];
    const tables = groups.map(([key, title]) => `<section class="report-table"><h3>${title}</h3><table><thead><tr><th>Perfil</th><th>Total</th><th>%</th></tr></thead><tbody>${data[key].length ? [...data[key]].sort((a, b) => b.total - a.total).map(row => `<tr><td>${escapeHtml(row.label)}</td><td>${row.total}</td><td>${k.total ? (row.total / k.total * 100).toFixed(1) : '0.0'}%</td></tr>`).join('') : '<tr><td colspan="3">Nenhuma inscrição neste filtro.</td></tr>'}</tbody></table></section>`).join('');
    const chartIds = [['chartGenero', 'Gênero'], ['chartFaixaEtaria', 'Faixa etária'], ['chartRaca', 'Raça/cor'], ['chartBairro', 'Bairros com mais inscrições']];
    const graphs = chartIds.map(([id, title]) => `<figure class="report-chart"><figcaption>${title}</figcaption><img src="${imagensRelatorio[id]}" alt="Gráfico de ${title}"></figure>`).join('');
    const summary = k.total ? `Das ${k.total} inscrições selecionadas, ${k.concluidos} registram conclusão (${(k.concluidos / k.total * 100).toFixed(1)}%) e ${k.evadidos} registram evasão (${(k.evadidos / k.total * 100).toFixed(1)}%).` : 'Nenhuma inscrição encontrada para os filtros selecionados.';
    const footer = `<footer class="report-footer">Qualifica Vix · Prefeitura Municipal de Vitória · Emitido em ${escapeHtml(geradoEm)} (Brasília)</footer>`;
    document.getElementById('relatorioImpressao').innerHTML = `<section class="report-page">${header('Relatório de qualificação')}<div class="report-meta"><strong>Filtros:</strong> ${escapeHtml(filtrosRelatorio)}<br><strong>Atualização:</strong> ${escapeHtml(geradoEm)} (Brasília)</div><h2>Visão geral</h2><p>${escapeHtml(summary)}</p><div class="report-metrics">${metric(k.total, 'Inscrições')}${metric(k.concluidos, 'Conclusões')}${metric(k.evadidos, 'Evasões')}${metric(k.satisfacao_media ? Number(k.satisfacao_media).toFixed(1) : '—', 'Satisfação média / 10')}</div><div class="report-charts">${graphs}</div><p class="report-note">A satisfação considera as avaliações respondidas. Inscrições canceladas permanecem no histórico. O relatório apresenta dados agregados dos filtros selecionados.</p>${footer}</section><section class="report-page">${header('Perfil dos participantes')}<div class="report-meta">${escapeHtml(filtrosRelatorio)} · ${k.total} inscrição(ões)</div><div class="report-tables">${tables}</div>${footer}</section>`;
}
async function imprimirRelatorio() {
    prepararRelatorio();
    await Promise.all([...document.querySelectorAll('#relatorioImpressao img')].map(img => img.decode().catch(() => {})));
    window.print();
}
function exportarRelatorioExcel() { window.location.href = `/api/admin/exportar-excel?${consultaRelatorio}`; }
window.addEventListener('beforeprint', prepararRelatorio);

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
                borderColor: '#ffffff'
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
                borderColor: '#ffffff'
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
                backgroundColor: '#2e64bd',
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
                backgroundColor: '#75429b',
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
