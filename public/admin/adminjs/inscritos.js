/* =========================================================
   SISTEMA MESTRE-DETALHE (REAL COM BANCO DE DADOS)
========================================================= */

let cursosGlobais = []; 
let cursoAbertoAtual = null; 
let alunosGlobais = []; // NOVO: Guarda a lista de alunos daquele curso
let requisicaoLista = 0;

function mostrarPopup(mensagem, tipo = 'info') {
    const icones = {
        success: 'OK',
        error: '!',
        warning: '!',
        info: 'i'
    };

    let container = document.getElementById('admin-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'admin-toast-container';
        container.className = 'admin-toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `admin-toast ${tipo}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    toast.innerHTML = `
        <span class="admin-toast-icon">${icones[tipo] || 'i'}</span>
        <div class="admin-toast-content">${mensagem}</div>
        <button type="button" class="admin-toast-close" aria-label="Fechar">x</button>
    `;

    const removerToast = () => toast.remove();
    toast.querySelector('.admin-toast-close').addEventListener('click', removerToast);
    container.appendChild(toast);
    setTimeout(removerToast, 4200);
}

function confirmarPopup({ titulo = 'Confirmar ação', mensagem = 'Deseja continuar?', textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', tipo = 'warning' } = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'admin-confirm-overlay';

        const modal = document.createElement('div');
        modal.className = 'admin-confirm-modal';

        const titleEl = document.createElement('div');
        titleEl.className = 'admin-confirm-title';
        titleEl.textContent = titulo;

        const textEl = document.createElement('div');
        textEl.className = 'admin-confirm-text';
        textEl.textContent = mensagem;

        const actions = document.createElement('div');
        actions.className = 'admin-confirm-actions';

        const btnCancelar = document.createElement('button');
        btnCancelar.type = 'button';
        btnCancelar.className = 'btn btn-outline';
        btnCancelar.textContent = textoCancelar;

        const btnConfirmar = document.createElement('button');
        btnConfirmar.type = 'button';
        btnConfirmar.className = tipo === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
        btnConfirmar.textContent = textoConfirmar;

        const fechar = (resultado) => {
            overlay.remove();
            resolve(resultado);
        };

        btnCancelar.addEventListener('click', () => fechar(false));
        btnConfirmar.addEventListener('click', () => fechar(true));
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) fechar(false);
        });

        actions.append(btnCancelar, btnConfirmar);
        modal.append(titleEl, textEl, actions);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        btnConfirmar.focus();
    });
}

async function lerJsonOuLancar(res) {
    if (res.status === 401 || (res.redirected && String(res.url || '').includes('/admin/login.html'))) {
        window.location.href = '/admin/login.html';
        throw new Error('sessao-expirada');
    }

    const tipo = String(res.headers.get('content-type') || '').toLowerCase();
    if (!tipo.includes('application/json')) {
        throw new Error('resposta-nao-json');
    }

    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data.error || 'Não foi possível concluir a operação.'), { status: res.status });
    return data;
}

function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let menuAcoesAtivo = null;
function fecharAcoesMenu(restaurarFoco = false) {
    if (!menuAcoesAtivo) return;
    const { dropdown, origem, botao } = menuAcoesAtivo;
    dropdown.classList.remove('open');
    origem.appendChild(dropdown);
    botao.setAttribute('aria-expanded', 'false');
    menuAcoesAtivo = null;
    if (restaurarFoco) botao.focus();
}
function toggleAcoesMenu(event) {
    event.stopPropagation();
    const botao = event.currentTarget;
    const eraAberto = menuAcoesAtivo?.botao === botao;
    fecharAcoesMenu();
    if (eraAberto) return;
    const origem = botao.closest('.acoes-menu');
    const dropdown = origem.querySelector('.acoes-dropdown');
    // Render outside the scrollable table so no ancestor can clip the actions.
    document.body.appendChild(dropdown);
    dropdown.classList.add('open');
    menuAcoesAtivo = { dropdown, origem, botao };
    botao.setAttribute('aria-expanded', 'true');
    const anchor = botao.getBoundingClientRect();
    const rect = dropdown.getBoundingClientRect();
    dropdown.style.left = `${Math.max(12, Math.min(anchor.right - rect.width, innerWidth - rect.width - 12))}px`;
    const below = anchor.bottom + 8;
    dropdown.style.top = `${Math.max(12, below + rect.height <= innerHeight - 12 ? below : anchor.top - rect.height - 8)}px`;
    dropdown.querySelector('button, a:not([aria-disabled="true"])')?.focus();
}
document.addEventListener('click', () => fecharAcoesMenu());
window.addEventListener('resize', () => fecharAcoesMenu());
document.addEventListener('scroll', event => {
    if (menuAcoesAtivo && !menuAcoesAtivo.dropdown.contains(event.target)) fecharAcoesMenu();
}, true);
document.addEventListener('keydown', event => {
    if (!menuAcoesAtivo) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
        fecharAcoesMenu(true);
        if (event.key === 'Escape') event.preventDefault();
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const items = [...menuAcoesAtivo.dropdown.querySelectorAll('button, a:not([aria-disabled="true"])')];
        const index = items.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items[next]?.focus();
    }
});

function formatarCpf(cpf) {
    const limpo = String(cpf || '').replace(/\D/g, '').slice(0, 11);
    if (limpo.length !== 11) return cpf || '-';
    return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarDataBr(dataIso) {
    if (!dataIso) return '-';
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) return dataIso;
    return data.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/* =========================================================
   1. FUNÇÃO PARA BUSCAR E DESENHAR OS CURSOS (TELA 1)
========================================================= */
async function carregarCursos() {
    const id = new URLSearchParams(location.search).get('curso') || '';
    const sequencia = ++requisicaoLista;
    try {
        const list = await lerJsonOuLancar(await fetch('/cursos', { cache: 'no-store' }));
        if (sequencia !== requisicaoLista) return;
        cursosGlobais = list;
        const select = document.getElementById('filtroTurma');
        select.innerHTML = '<option value="">Todas as turmas</option>' + list.map(c =>
            '<option value="' + c.id + '">#' + c.id + ' — ' + escapeHtml(c.nome) + '</option>').join('');
        await abrirListaAlunos(id);
    } catch (err) {
        if (sequencia !== requisicaoLista || err.message === 'sessao-expirada') return;
        document.getElementById('tabelaAlunosBody').innerHTML = '<tr><td colspan="7" class="empty-state">Não foi possível carregar as inscrições. <button class="btn btn-outline" onclick="carregarCursos()">Tentar novamente</button></td></tr>';
    }
}

async function abrirListaAlunos(idCurso = '') {
    fecharAcoesMenu();
    const sequencia = ++requisicaoLista;
    const curso = idCurso ? cursosGlobais.find(c => String(c.id) === String(idCurso)) : null;
    const tbody = document.getElementById('tabelaAlunosBody');
    cursoAbertoAtual = curso;
    tbody.closest('table').classList.toggle('por-turma', Boolean(curso));
    alunosGlobais = [];
    const btnPdf = document.getElementById('btnGerarPdfInscritos');
    const btnExcel = document.getElementById('btnExportarExcel');
    btnPdf.style.display = 'none'; btnExcel.style.display = 'none';
    document.getElementById('btnTodasInscricoes').hidden = !idCurso;
    const url = new URL(location.href);
    if (idCurso) url.searchParams.set('curso', idCurso); else url.searchParams.delete('curso');
    history.replaceState(null, '', url);
    document.getElementById('filtroTurma').value = idCurso;
    document.getElementById('resumoCursoDetalhe').hidden = !curso;
    if (idCurso && !curso) {
        document.getElementById('tituloPaginaInscritos').textContent = 'Turma não encontrada';
        document.getElementById('subtituloPaginaInscritos').textContent = 'Confira a turma solicitada ou consulte todas as inscrições.';
        document.getElementById('tituloCursoDetalhe').textContent = 'Turma indisponível';
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Turma não encontrada. Selecione outra turma ou clique em Todas as inscrições.</td></tr>';
        return;
    }
    document.getElementById('tituloPaginaInscritos').textContent = curso ? 'Inscritos — ' + curso.nome : 'Alunos Inscritos';
    document.getElementById('subtituloPaginaInscritos').textContent = curso ? 'Lista de alunos da turma #' + curso.id : 'Inscrições de todas as turmas';
    document.getElementById('tituloCursoDetalhe').textContent = curso ? '#' + curso.id + ' — ' + curso.nome : 'Todas as inscrições';
    if (curso) {
        document.getElementById('localCursoDetalhe').textContent = curso.local;
        document.getElementById('vagasCursoDetalhe').textContent = curso.vagas + ' vagas restantes';
        document.getElementById('periodoCursoDetalhe').textContent =
            (curso.data_inicio || 'Início a definir') + ' até ' + (curso.data_termino || 'Término a definir') +
            ' · ' + (curso.horario_inicio || 'Horário a definir') + (curso.horario_termino ? ' às ' + curso.horario_termino : '');
        document.getElementById('statusCursoDetalhe').textContent = curso.situacao_label;
    }
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Carregando alunos…</td></tr>';
    try {
        const res = await fetch(curso ? '/inscritos/' + curso.id : '/api/admin/inscricoes', { cache: 'no-store' });
        const lista = await lerJsonOuLancar(res);
        if (sequencia !== requisicaoLista) return;
        alunosGlobais = lista;
        document.getElementById('subtituloPaginaInscritos').textContent =
            (curso ? 'Turma #' + curso.id + ' · ' : 'Todas as turmas · ') + lista.length + ' inscrição(ões)';
        if (curso) { btnPdf.style.display = 'inline-flex'; btnExcel.style.display = 'inline-flex'; }
        tbody.innerHTML = '';

        if (alunosGlobais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Nenhum aluno inscrito ainda.</td></tr>`;
        } else {
            alunosGlobais.forEach(aluno => {
                const bairroAluno = aluno.bairro || 'Não informado';
                const foneLimpo = (aluno.telefone || '').replace(/\D/g, '');
                const linkWhats = foneLimpo ? `https://wa.me/55${foneLimpo}` : '#';
                const nomeEscapadoJs = escapeHtml(JSON.stringify(String(aluno.nome || '')));
                const possuiNecessidadeEspecial = String(aluno.possui_necessidade_especial || '').toLowerCase() === 'sim';
                const tipoNecessidadeEspecial = possuiNecessidadeEspecial
                    ? (aluno.tipo_necessidade_especial || 'Não informado')
                    : 'Não';
                const badgeNecessidade = possuiNecessidadeEspecial
                    ? `<span class="badge-necessidade sim"><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> ${escapeHtml(tipoNecessidadeEspecial)}</span>`
                    : '<span class="badge-necessidade nao"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Não</span>';

                const statusSelecionado = String(aluno.status || 'inscrito').toLowerCase();
                const selectStatus = `
                    <select aria-label="Situação de ${escapeHtml(aluno.nome)}" onchange="atualizarStatusAluno(${aluno.id}, this.value, ${nomeEscapadoJs})" class="admin-status-select" style="background:#ffffff; color:#24365a; border:1px solid #dde5ef; padding:6px 10px; border-radius:6px; font-size:0.75rem; font-weight:600; outline:none; cursor:pointer;">
                        <option value="inscrito" ${['inscrito', 'pendente_validacao'].includes(statusSelecionado) ? 'selected' : ''}>Pré-inscrito</option>
                        <option value="titular" ${statusSelecionado === 'titular' ? 'selected' : ''}>Classificado (Titular)</option>
                        <option value="suplente" ${statusSelecionado === 'suplente' ? 'selected' : ''}>Suplente</option>
                        <option value="matriculado" ${statusSelecionado === 'matriculado' ? 'selected' : ''}>Matriculado</option>
                        <option value="desistente" ${['desistente', 'desistencia'].includes(statusSelecionado) ? 'selected' : ''}>Desistente</option>
                        <option value="nao_compareceu" ${['não compareceu', 'nao_compareceu'].includes(statusSelecionado) ? 'selected' : ''}>Não Compareceu</option>
                        <option value="concluido" ${['concluído', 'concluido'].includes(statusSelecionado) ? 'selected' : ''}>Concluído</option>
                        <option value="nao_concluido" ${['não concluído', 'nao_concluido'].includes(statusSelecionado) ? 'selected' : ''}>Não Concluído</option>
                        <option value="certificado_emitido" ${['certificado emitido', 'certificado_emitido'].includes(statusSelecionado) ? 'selected' : ''}>Certificado Emitido</option>
                    </select>
                `;

                tbody.innerHTML += `
                    <tr class="${possuiNecessidadeEspecial ? 'aluno-necessidade' : ''}">
                        <td><strong>${escapeHtml(aluno.nome)}</strong><br><small>${aluno.status_inscricao === "suplente" ? "Suplente" : "Titular"}</small></td>
                        <td>#${aluno.curso_id} — ${escapeHtml(aluno.curso_nome)}</td>
                        <td>${escapeHtml(formatarCpf(aluno.cpf))}</td>
                        <td>${escapeHtml(aluno.telefone || '-')}</td>
                        <td>${escapeHtml(bairroAluno)}</td>
                        <td>${badgeNecessidade}</td>
                        <td>
                            <div class="acoes-container">
                                <button class="btn-ficha" onclick="abrirFichaAluno(${aluno.id})" aria-label="Ver ficha de ${escapeHtml(aluno.nome)}"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Ver ficha</button>
                                ${selectStatus}
                                <div class="acoes-menu">
                                    <button class="acoes-toggle" onclick="toggleAcoesMenu(event)" aria-label="Mais ações para ${escapeHtml(aluno.nome)}" aria-haspopup="menu" aria-expanded="false"><i class="bi bi-three-dots-vertical" aria-hidden="true"></i></button>
                                    <div class="acoes-dropdown" data-aluno-id="${aluno.id}" role="menu" aria-label="Ações do aluno">
                                        <button role="menuitem" onclick="abrirFichaAluno(${aluno.id})"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Ver ficha completa</button>
                                        <a role="menuitem" href="${linkWhats}" target="_blank" rel="noopener noreferrer" ${foneLimpo ? '' : 'aria-disabled="true" tabindex="-1" style="pointer-events:none;opacity:.55;"'}><i class="bi bi-whatsapp" aria-hidden="true"></i> Conversar no WhatsApp</a>
                                        <button role="menuitem" class="acao-excluir" onclick="excluirAluno(${aluno.id}, ${nomeEscapadoJs})"><i class="bi bi-trash" aria-hidden="true"></i> Excluir inscrição</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        if (sequencia !== requisicaoLista || err.message === 'sessao-expirada') return;
        console.error("Erro ao buscar alunos:", err);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Não foi possível carregar os alunos. <button class="btn btn-outline" onclick="carregarCursos()">Tentar novamente</button></td></tr>';
    }
}

/* =========================================================
   3. SISTEMA DA FICHA COMPLETA DO ALUNO (MODAL)
========================================================= */
let alunoFichaAtiva = null;
let historicoFichaAtiva = null;
let focoAntesFicha = null;
let requisicaoFicha = 0;

function mostrarModalFicha() {
    const modal = document.getElementById('modalDetalhes');
    if (modal.style.display !== 'flex') focoAntesFicha = menuAcoesAtivo?.botao || document.activeElement;
    fecharAcoesMenu();
    modal.style.display = 'flex';
    document.body.classList.add('ficha-aberta');
    modal.querySelector('.close-modal').focus();
}

async function carregarFichaCpf(cpf) {
    const sequencia = ++requisicaoFicha;
    alunoFichaAtiva = null;
    historicoFichaAtiva = [];
    document.getElementById('btnImprimirFicha').disabled = true;
    document.getElementById('resumoFicha').textContent = 'Buscando cadastro e histórico de inscrições…';
    document.getElementById('conteudoDetalhes').innerHTML = '<p class="ficha-mensagem" role="status">Carregando ficha completa…</p>';
    mostrarModalFicha();
    try {
        const res = await fetch(`/api/admin/aluno/completo/${encodeURIComponent(cpf)}`, { cache: 'no-store' });
        const data = await lerJsonOuLancar(res);
        if (sequencia !== requisicaoFicha) return;
        if (!data.aluno || typeof data.aluno !== 'object') throw new Error('ficha-invalida');
        exibirFichaCompleta(data.aluno, Array.isArray(data.historico) ? data.historico : []);
    } catch (err) {
        if (sequencia !== requisicaoFicha || err.message === 'sessao-expirada') return;
        document.getElementById('resumoFicha').textContent = 'Não foi possível abrir este cadastro.';
        const area = document.getElementById('conteudoDetalhes');
        area.innerHTML = '<div class="ficha-mensagem" role="alert"><p></p><button class="btn btn-primary" type="button">Tentar novamente</button></div>';
        area.querySelector('p').textContent = err.status === 404 ? 'Nenhum cadastro foi encontrado para este CPF. Confira o número informado.' : 'O carregamento da ficha falhou. Tente novamente em alguns instantes.';
        area.querySelector('button').addEventListener('click', () => carregarFichaCpf(cpf));
    }
}

async function abrirFichaAluno(idAluno) {
    const a = alunosGlobais.find(x => String(x.id) === String(idAluno));
    if (!a) return;
    await carregarFichaCpf(a.cpf);
}

function exibirFichaCompleta(aluno, historico) {
    alunoFichaAtiva = aluno;
    historicoFichaAtiva = historico;

    const conteudo = document.getElementById('conteudoDetalhes');
    if (!conteudo) return;

    const checar = (valor) => valor !== undefined && valor !== null && valor !== '' ? escapeHtml(valor) : '<em class="nao-informado">Não informado</em>';
    const simNao = (valor) => valor === undefined || valor === null || valor === '' ? checar(null) : ['sim', 'true', '1'].includes(String(valor).toLowerCase()) ? 'Sim' : 'Não';

    const renderizarDocumento = (documento, label) => {
        if (!documento) {
            return '<em class="nao-informado">Sem arquivo anexado. A pré-inscrição não exige envio de imagens de documentos.</em>';
        }
        const url = String(documento);
        if (!/^(https?:\/\/|\/[^/]|data:(application\/pdf|image\/(png|jpeg|webp));base64,)/i.test(url)) return checar(null);
        documento = escapeHtml(url);
        if (String(documento).startsWith('data:application/pdf') || String(documento).includes('.pdf')) {
            return `<a href="${documento}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;background:#f7f9fd;border:1px solid #dde5ef;color:#24365a;text-decoration:none;"><i class="bi bi-filetype-pdf" aria-hidden="true"></i> Abrir PDF do ${label} (Histórico)</a>`;
        }
        return `<img src="${documento}" alt="Documento ${label}" style="width:100%;max-height:220px;object-fit:contain;border-radius:8px;border:1px solid #dde5ef;background:#f7f9fd;padding:6px;">`;
    };

    let idadeTexto = 'Não informada';
    if (aluno.data_nascimento) {
        const partes = String(aluno.data_nascimento).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        const nasc = partes ? new Date(Number(partes[3]), Number(partes[2]) - 1, Number(partes[1])) : new Date(String(aluno.data_nascimento).slice(0, 10) + 'T12:00:00');
        if (!isNaN(nasc.getTime())) {
            const hoje = new Date();
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                idade--;
            }
            idadeTexto = `${nasc.toLocaleDateString('pt-BR')} · ${idade} anos`;
        }
    }

    let html = `
        <div class="detalhe-secao"><i class="bi bi-person-fill" aria-hidden="true"></i> Dados de Identificação</div>
        <div class="detalhe-item"><span>Nome Completo</span><strong>${checar(aluno.nome)}</strong></div>
        <div class="detalhe-item"><span>CPF</span><strong>${checar(formatarCpf(aluno.cpf))}</strong></div>
        <div class="detalhe-item"><span>RG</span><strong>${checar(aluno.rg)}</strong></div>
        <div class="detalhe-item"><span>Data de Nascimento</span><strong>${idadeTexto}</strong></div>
        <div class="detalhe-item"><span>Gênero</span><strong>${checar(aluno.genero)}</strong></div>
        <div class="detalhe-item"><span>Raça/Cor (IBGE)</span><strong>${checar(aluno.raca_cor)}</strong></div>
        <div class="detalhe-item"><span>Escolaridade</span><strong>${checar(aluno.escolaridade)}</strong></div>
        
        <div class="detalhe-secao"><i class="bi bi-telephone-fill" aria-hidden="true"></i> Contatos e Endereço</div>
        <div class="detalhe-item"><span>Celular Principal (WhatsApp)</span><strong>${checar(aluno.telefone)}</strong></div>
        <div class="detalhe-item"><span>Telefone Alternativo</span><strong>${checar(aluno.telefone_alternativo)}</strong></div>
        <div class="detalhe-item"><span>E-mail</span><strong>${checar(aluno.email)}</strong></div>
        <div class="detalhe-item"><span>CEP</span><strong>${checar(aluno.cep)}</strong></div>
        <div class="detalhe-item"><span>Rua, Nº</span><strong>${checar(aluno.rua)}, Nº ${checar(aluno.numero)}</strong></div>
        <div class="detalhe-item"><span>Bairro / Município</span><strong>${checar(aluno.bairro)} - ${checar(aluno.municipio)}</strong></div>
        <div class="detalhe-item"><span>Trabalha em Vitória (declaração para validação)</span><strong>${aluno.trabalha_vitoria === 'sim' ? 'Sim' : aluno.trabalha_vitoria === 'nao' ? 'Não' : 'Não informado'}</strong></div>
        <div class="detalhe-item"><span>Estado</span><strong>${checar(aluno.uf)}</strong></div>
        
        <div class="detalhe-secao"><i class="bi bi-person-exclamation" aria-hidden="true"></i> Condições Especiais</div>
        <div class="detalhe-item"><span>Possui Deficiência / Nec. Especial?</span><strong>${simNao(aluno.possui_necessidade_especial)}</strong></div>
        <div class="detalhe-item"><span>Tipo de Deficiência</span><strong>${checar(aluno.tipo_necessidade_especial)}</strong></div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Adaptações Necessárias</span><strong>${checar(aluno.deficiencia_adaptacoes)}</strong></div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Recursos Assistivos</span><strong>${checar(aluno.deficiencia_recursos)}</strong></div>
    `;

    if (aluno.responsavel_nome) {
        html += `
            <div class="detalhe-secao"><i class="bi bi-shield-fill-check" aria-hidden="true"></i> Dados do Responsável Legal (Menor de Idade)</div>
            <div class="detalhe-item"><span>Nome do Responsável</span><strong>${checar(aluno.responsavel_nome)}</strong></div>
            <div class="detalhe-item"><span>CPF do Responsável</span><strong>${checar(formatarCpf(aluno.responsavel_cpf))}</strong></div>
            <div class="detalhe-item"><span>Grau de Parentesco</span><strong>${checar(aluno.responsavel_parentesco)}</strong></div>
            <div class="detalhe-item"><span>Telefone do Responsável</span><strong>${checar(aluno.responsavel_telefone)}</strong></div>
            <div class="detalhe-item"><span>E-mail do Responsável</span><strong>${checar(aluno.responsavel_email)}</strong></div>
            <div class="detalhe-item"><span>Autorização do Responsável</span><strong>${simNao(aluno.responsavel_autorizacao)}</strong></div>
        `;
    }

    html += `
        <div class="detalhe-secao"><i class="bi bi-compass-fill" aria-hidden="true"></i> Objetivos no Curso</div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Objetivo Declarado</span><strong>${checar(aluno.objetivo)}</strong></div>
        <div class="detalhe-secao"><i class="bi bi-shield-check" aria-hidden="true"></i> Consentimentos da última pré-inscrição</div>
        <div class="detalhe-item"><span>Autoriza nome em lista pública</span><strong>${simNao(aluno.autoriza_lgpd)}</strong></div>
        <div class="detalhe-item"><span>Autoriza uso de imagem</span><strong>${simNao(aluno.autoriza_uso_imagem)}</strong></div>
        <div class="detalhe-item"><span>Ciência das condições de matrícula</span><strong>${simNao(aluno.aceitou_termos_ciencia)}</strong></div>
        <div class="detalhe-item"><span>Aceite do aviso de privacidade (LGPD)</span><strong>${simNao(aluno.aceitou_aviso_lgpd)}</strong></div>
        <div class="detalhe-item"><span>Data do aceite</span><strong>${checar(aluno.timestamp_aceite_lgpd ? formatarDataBr(aluno.timestamp_aceite_lgpd) : null)}</strong></div>
    `;

    if (Number(aluno.questionario_conclusao_respondido) === 1) {
        html += `
            <div class="detalhe-secao"><i class="bi bi-chat-square-text-fill" aria-hidden="true"></i> Pesquisa de Conclusão / Empregabilidade</div>
            <div class="detalhe-item"><span>Conseguiu emprego na área?</span><strong>${checar(aluno.emprego_pos_curso)}</strong></div>
            <div class="detalhe-item"><span>Contribuição profissional</span><strong>${checar(aluno.contribuicao_profissional)} / 5</strong></div>
            <div class="detalhe-item"><span>Recomendaria o curso?</span><strong>${simNao(aluno.recomendaria)}</strong></div>
            <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Principal benefício apontado</span><strong>${checar(aluno.beneficio_principal)}</strong></div>
        `;
    }

    if (Number(aluno.pesquisa_satisfacao_respondida) === 1) {
        html += `
            <div class="detalhe-secao"><i class="bi bi-star-fill" aria-hidden="true"></i> Pesquisa de Satisfação pós-curso</div>
            <div class="detalhe-item"><span>Nota Instrutor</span><strong>${checar(aluno.nota_satisfacao_instrutor)} ★</strong></div>
            <div class="detalhe-item"><span>Nota Estrutura/Local</span><strong>${checar(aluno.nota_satisfacao_estrutura)} ★</strong></div>
            <div class="detalhe-item"><span>Nota Material Didático</span><strong>${checar(aluno.nota_satisfacao_material)} ★</strong></div>
            <div class="detalhe-item"><span>Nota Geral (1-10)</span><strong>${checar(aluno.nota_satisfacao_geral)} / 10</strong></div>
            <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Comentário Adicional</span><strong>${checar(aluno.comentario_satisfacao)}</strong></div>
        `;
    }

    html += `
        <div class="detalhe-secao"><i class="bi bi-clock-history" aria-hidden="true"></i> Histórico de Inscrições</div>
        <div class="table-wrap" style="grid-column: 1 / -1; margin-top: 8px;">
            <table style="width: 100%; font-size: 0.8rem;">
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Local</th>
                        <th>Classificação</th>
                        <th>Data Inscrição</th>
                        <th>Status</th>
                        <th>Situação Final</th>
                        <th>Certificado</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (!historico || historico.length === 0) {
        html += `<tr><td colspan="7" style="text-align:center; padding:10px;">Nenhuma outra inscrição registrada.</td></tr>`;
    } else {
        historico.forEach(h => {
            const classBadge = String(h.status_inscricao).toLowerCase() === 'suplente' 
                ? '<span class="badge esgotado">Suplente</span>' 
                : '<span class="badge aberto">Titular</span>';

            const statusMatricula = Number(h.matricula_confirmada) === 1
                ? '<span style="color:#10b981; font-weight:bold;">Matriculado</span>'
                : '<span style="color:#94a3b8;">Pendente</span>';

            const dataInscr = formatarDataBr(h.criado_em).split(' ')[0];
            
            let certLink = '-';
            if (h.situacao_final === 'concluido') {
                certLink = `<a href="/certificado/${h.id}" target="_blank" style="color:#f9c852; font-weight:bold; text-decoration:underline;"><i class="bi bi-award-fill" aria-hidden="true"></i> Baixar</a>`;
            }

            html += `
                <tr>
                    <td><strong>${escapeHtml(h.curso_nome)}</strong></td>
                    <td>${escapeHtml(h.local_nome)}</td>
                    <td>${classBadge}</td>
                    <td>${escapeHtml(dataInscr)}</td>
                    <td>${statusMatricula}</td>
                    <td>${checar(h.situacao_final)}</td>
                    <td>${certLink}</td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    if (aluno.rg_documento || aluno.cpf_documento) html += `
        <div class="detalhe-secao"><i class="bi bi-images" aria-hidden="true"></i> Documentação Enviada</div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Documento de Identidade (RG)</span><strong>${renderizarDocumento(aluno.rg_documento, 'RG')}</strong></div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Comprovante de CPF</span><strong>${renderizarDocumento(aluno.cpf_documento, 'CPF')}</strong></div>
    `;

    conteudo.innerHTML = html;
    document.getElementById('resumoFicha').textContent = `${aluno.nome || 'Cadastro do cidadão'} · ${historico.length} inscrição(ões) registrada(s)`;
    document.getElementById('btnImprimirFicha').disabled = false;
    document.querySelector('.ficha-corpo').scrollTop = 0;
    mostrarModalFicha();
}

async function buscarAlunoPorCpf() {
    const input = document.getElementById('buscaCpfInput');
    if (!input) return;
    const cpf = input.value.trim();
    if (cpf.replace(/\D/g, '').length !== 11) {
        mostrarPopup('Digite o CPF completo, com 11 dígitos.', 'warning');
        return;
    }

    await carregarFichaCpf(cpf);
}

function exportarExcelTurma() {
    if (!cursoAbertoAtual) {
        mostrarPopup('Nenhum curso aberto para exportação.', 'warning');
        return;
    }
    window.location.href = `/api/admin/exportar-excel?curso_id=${cursoAbertoAtual.id}`;
}

function exportarExcelCompleto() {
    window.location.href = `/api/admin/exportar-excel`;
}

function imprimirFichaAluno(aluno, historico) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        mostrarPopup('Por favor, autorize pop-ups para imprimir a ficha.', 'warning');
        return;
    }
    // Print the same complete record shown on screen, including consents and surveys.
    const ficha = document.getElementById('conteudoDetalhes').innerHTML;
    printWindow.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
        <title>Ficha do aluno — ${escapeHtml(aluno.nome)}</title>
        <style>
            body { font-family: Arial, sans-serif; color: #24365a; margin: 28px; line-height: 1.5; }
            h1 { font-size: 22px; margin-bottom: 5px; }
            header { border-bottom: 2px solid #24365a; padding-bottom: 14px; margin-bottom: 18px; }
            header p { font-size: 12px; margin: 4px 0; }
            .grid-detalhes { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 9px; }
            .detalhe-secao { grid-column: 1 / -1; font-size: 16px; font-weight: bold; border-bottom: 1px solid #cbd5e1; margin-top: 16px; padding-bottom: 6px; break-after: avoid; }
            .detalhe-item { padding: 9px; border: 1px solid #dde5ef; break-inside: avoid; min-width: 0; }
            .detalhe-item span { display: block; font-size: 11px; color: #59677b; }
            .detalhe-item strong { display: block; font-size: 12px; overflow-wrap: anywhere; white-space: pre-wrap; }
            .nao-informado { font-style: normal; font-weight: normal; color: #6b788d; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th, td { border: 1px solid #dde5ef; padding: 6px; text-align: left; }
            thead { display: table-header-group; }
            tr { break-inside: avoid; }
            img { max-width: 100%; max-height: 220px; }
            @page { size: A4; margin: 14mm; }
            @media print { body { margin: 0; } }
        </style></head><body>
        <header><h1>Ficha completa do aluno</h1><p>Prefeitura de Vitória — Qualifica Vix</p><p>Emitida em ${new Date().toLocaleString('pt-BR')}</p></header>
        <div class="grid-detalhes">${ficha}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function fecharModalDetalhes() {
    ++requisicaoFicha;
    document.getElementById('modalDetalhes').style.display = 'none';
    document.body.classList.remove('ficha-aberta');
    if (focoAntesFicha?.isConnected) focoAntesFicha.focus();
}

document.getElementById('modalDetalhes').addEventListener('click', event => {
    if (event.target.id === 'modalDetalhes') fecharModalDetalhes();
});
document.getElementById('modalDetalhes').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); fecharModalDetalhes(); }
    if (event.key !== 'Tab') return;
    const items = [...event.currentTarget.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});


/* =========================================================
   4. VOLTAR PARA CURSOS E EXCLUIR
========================================================= */
function voltarParaCursos() { abrirListaAlunos(''); }

function gerarPdfInscritos() {
    if (!cursoAbertoAtual) {
        mostrarPopup('Selecione um curso primeiro.', 'warning');
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        mostrarPopup('Biblioteca de PDF não carregou. Recarregue a página.', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const hoje = new Date().toLocaleString('pt-BR');
    const totalInscritos = alunosGlobais.length;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Relatório de Inscritos - Qualifica Vix', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Curso: ${cursoAbertoAtual.nome || '-'}`, 14, 24);
    doc.text(`Local: ${cursoAbertoAtual.local || '-'}`, 14, 30);
    doc.text(`Data de geração: ${hoje}`, 14, 36);
    doc.text(`Total de inscritos: ${totalInscritos}`, 14, 42);

    const linhas = alunosGlobais.map((aluno, idx) => [
        String(idx + 1),
        String(aluno.nome || '-'),
        String(formatarCpf(aluno.cpf) || '-'),
        String(aluno.rg || '-'),
        String(String(aluno.possui_necessidade_especial || '').toLowerCase() === 'sim'
            ? (aluno.tipo_necessidade_especial || 'Sim')
            : 'Não'),
        String(aluno.telefone || '-'),
        String(aluno.email || '-')
    ]);

    doc.autoTable({
        startY: 48,
        head: [['#', 'Nome', 'CPF', 'RG', 'Necessidade', 'Telefone', 'E-mail']],
        body: linhas.length ? linhas : [['-', 'Nenhum inscrito', '-', '-', '-', '-', '-']],
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [15, 34, 71] }
    });

    const nomeArquivo = `inscritos_${String(cursoAbertoAtual.nome || 'curso').replace(/\s+/g, '_').toLowerCase()}.pdf`;
    doc.save(nomeArquivo);
}

async function excluirAluno(idAluno, nomeAluno) {
    const confirmacao2 = await confirmarPopup({
        titulo: 'Excluir inscrição',
        mensagem: `Deseja remover a inscrição de ${nomeAluno} desta turma?`,
        textoConfirmar: 'Sim, excluir',
        textoCancelar: 'Cancelar',
        tipo: 'danger'
    });

    if (!confirmacao2) return;

    try {
        const res = await fetch(`/api/inscricoes/${idAluno}`, { method: 'DELETE' });
        if (res.ok) {
            mostrarPopup('Inscrição removida da lista.', 'success');
            await carregarCursos();
        } else {
            await lerJsonOuLancar(res);
        }
    } catch (err) {
        if (err.message !== 'sessao-expirada') mostrarPopup(err.message || 'Não foi possível remover a inscrição.', 'error');
    }
}

async function confirmarMatricula(idAluno, nomeAluno) {
    const ok = await confirmarPopup({
        titulo: 'Confirmar matrícula',
        mensagem: `Deseja confirmar a matrícula de ${nomeAluno}?`,
        textoConfirmar: 'Sim, confirmar',
        textoCancelar: 'Cancelar',
        tipo: 'info'
    });
    if (!ok) return;

    try {
        const res = await fetch(`/api/inscricoes/${idAluno}/confirmar`, { method: 'PUT' });
        const data = await lerJsonOuLancar(res);

        if (!res.ok) {
            mostrarPopup(data.error || 'Erro ao confirmar matrícula.', 'error');
            return;
        }

        if (data.status === 'ja-confirmada') {
            mostrarPopup('Matrícula já estava confirmada.', 'info');
        } else if (data.email === 'falhou') {
            const detalhe = data.email_erro ? ` Motivo: ${data.email_erro}` : '';
            mostrarPopup(`Matrícula confirmada, mas o e-mail não foi enviado.${detalhe}`, 'warning');
        } else if (data.email === 'enviado') {
            mostrarPopup('Matrícula confirmada e e-mail enviado!', 'success');
        } else {
            mostrarPopup('Matrícula confirmada com sucesso.', 'success');
        }

        await carregarCursos();
    } catch (err) {
        if (err.message !== 'sessao-expirada') mostrarPopup(err.message || 'Não foi possível confirmar a matrícula.', 'error');
    }
}

async function atualizarStatusAluno(idAluno, novoStatus, nomeAluno) {
    const ok = await confirmarPopup({
        titulo: 'Alterar Status',
        mensagem: `Deseja alterar o status de ${nomeAluno} para "${novoStatus}"?`,
        textoConfirmar: 'Sim, alterar',
        textoCancelar: 'Cancelar',
        tipo: 'info'
    });
    if (!ok) {
        carregarCursos();
        return;
    }

    try {
        const res = await fetch(`/api/inscricoes/${idAluno}/status-final`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });
        const data = await lerJsonOuLancar(res);

        if (!res.ok) {
            mostrarPopup(data.error || 'Erro ao alterar status.', 'error');
        } else {
            mostrarPopup('Status alterado com sucesso!', 'success');
        }
        await carregarCursos();
    } catch (err) {
        if (err.message !== 'sessao-expirada') mostrarPopup(err.message || 'Não foi possível alterar a situação.', 'error');
        carregarCursos();
    }
}

document.getElementById('btnImprimirFicha')?.addEventListener('click', () => {
    if (alunoFichaAtiva) {
        imprimirFichaAluno(alunoFichaAtiva, historicoFichaAtiva);
    } else {
        mostrarPopup('Nenhuma ficha ativa para imprimir.', 'warning');
    }
});

carregarCursos();
function atualizarListaVisivel() {
    if (!document.hidden && !menuAcoesAtivo && !document.querySelector('.admin-confirm-overlay') && document.getElementById('modalDetalhes').style.display !== 'flex' && !document.activeElement?.matches('.admin-status-select')) carregarCursos();
}
document.addEventListener('visibilitychange', atualizarListaVisivel);
setInterval(atualizarListaVisivel, 30000);

window.addEventListener('popstate', carregarCursos);
