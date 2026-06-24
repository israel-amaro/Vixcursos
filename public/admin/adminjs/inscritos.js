/* =========================================================
   SISTEMA MESTRE-DETALHE (REAL COM BANCO DE DADOS)
========================================================= */

let cursosGlobais = []; 
let cursoAbertoAtual = null; 
let alunosGlobais = []; // NOVO: Guarda a lista de alunos daquele curso

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

    if (!res.ok) {
        throw new Error(`http-${res.status}`);
    }

    const tipo = String(res.headers.get('content-type') || '').toLowerCase();
    if (!tipo.includes('application/json')) {
        throw new Error('resposta-nao-json');
    }

    return res.json();
}

function escapeHtml(valor) {
    return String(valor || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function toggleAcoesMenu(event) {
    event.stopPropagation();
    const menu = event.target.closest('.acoes-menu');
    const dropdown = menu.querySelector('.acoes-dropdown');
    
    // Fecha todos os outros menus abertos
    document.querySelectorAll('.acoes-dropdown.open').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('open');
        }
    });
    
    dropdown.classList.toggle('open');
}

// Fecha menu ao clicar fora
document.addEventListener('click', () => {
    document.querySelectorAll('.acoes-dropdown.open').forEach(d => {
        d.classList.remove('open');
    });
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
    return data.toLocaleString('pt-BR');
}

/* =========================================================
   1. FUNÇÃO PARA BUSCAR E DESENHAR OS CURSOS (TELA 1)
========================================================= */
async function carregarCursos() {
    try {
        const res = await fetch('/cursos'); 
        cursosGlobais = await lerJsonOuLancar(res);

        const tbody = document.getElementById('tabelaCursosBody');
        tbody.innerHTML = '';

        if (cursosGlobais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum curso cadastrado.</td></tr>`;
            return;
        }

        cursosGlobais.forEach(curso => {
            const estaEsgotado = (curso.status === 'esgotado');
            const statusHtml = estaEsgotado 
                ? '<span class="badge esgotado">ESGOTADO</span>' 
                : '<span class="badge aberto">ABERTO</span>';

            tbody.innerHTML += `
                <tr>
                    <td><strong>${curso.nome}</strong></td>
                    <td>${curso.local}</td>
                    <td>${curso.vagas} restantes</td>
                    <td>${statusHtml}</td>
                    <td>
                        <button onclick="abrirListaAlunos(${curso.id})" class="btn-acao btn-ver"><i class="bi bi-people-fill" aria-hidden="true"></i> Ver Lista</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar cursos:", err);
        document.getElementById('tabelaCursosBody').innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Sessão expirada ou erro ao carregar dados do servidor.</td></tr>`;
    }
}

/* =========================================================
   2. FUNÇÃO PARA BUSCAR E DESENHAR OS ALUNOS (TELA 2)
========================================================= */
async function abrirListaAlunos(idCurso) {
    cursoAbertoAtual = cursosGlobais.find(c => c.id === idCurso);
    const btnPdf = document.getElementById('btnGerarPdfInscritos');
    const btnExcel = document.getElementById('btnExportarExcel');

    document.getElementById('tituloCursoDetalhe').innerText = cursoAbertoAtual.nome;
    document.getElementById('localCursoDetalhe').innerText = cursoAbertoAtual.local;
    document.getElementById('vagasCursoDetalhe').innerText = `${cursoAbertoAtual.vagas} vagas restantes`;

    const tbody = document.getElementById('tabelaAlunosBody');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Buscando alunos... 🐢</td></tr>`;

    document.getElementById('telaCursos').classList.add('tela-oculta');
    document.getElementById('telaAlunos').classList.remove('tela-oculta');

    try {
        const res = await fetch(`/inscritos/${idCurso}`);
        alunosGlobais = await lerJsonOuLancar(res); // Salva os alunos na memória para a ficha
        if (btnPdf) btnPdf.style.display = 'inline-flex';
        if (btnExcel) btnExcel.style.display = 'inline-flex';

        tbody.innerHTML = ''; 

        if (alunosGlobais.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhum aluno inscrito ainda.</td></tr>`;
        } else {
            alunosGlobais.forEach(aluno => {
                const bairroAluno = aluno.bairro || 'Não informado';
                const foneLimpo = (aluno.telefone || '').replace(/\D/g, '');
                const linkWhats = foneLimpo ? `https://wa.me/55${foneLimpo}` : '#';
                const nomeEscapadoJs = String(aluno.nome || '').replace(/'/g, "\\'");
                const matriculaConfirmada = Number(aluno.matricula_confirmada) === 1;
                const possuiNecessidadeEspecial = String(aluno.possui_necessidade_especial || '').toLowerCase() === 'sim';
                const tipoNecessidadeEspecial = possuiNecessidadeEspecial
                    ? (aluno.tipo_necessidade_especial || 'Não informado')
                    : 'Não';
                const badgeNecessidade = possuiNecessidadeEspecial
                    ? `<span class="badge-necessidade sim"><i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> ${escapeHtml(tipoNecessidadeEspecial)}</span>`
                    : '<span class="badge-necessidade nao"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Não</span>';

                const botaoConfirmacao = matriculaConfirmada
                    ? `<span class="btn-acao btn-confirmado"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Confirmada</span>`
                    : `<button onclick="confirmarMatricula(${aluno.id}, '${nomeEscapadoJs}')" class="btn-acao btn-confirmar"><i class="bi bi-check-circle-fill" aria-hidden="true"></i> Confirmar Matrícula</button>`;

                tbody.innerHTML += `
                    <tr class="${possuiNecessidadeEspecial ? 'aluno-necessidade' : ''}">
                        <td><strong>${escapeHtml(aluno.nome)}</strong></td>
                        <td>${escapeHtml(formatarCpf(aluno.cpf))}</td>
                        <td>${aluno.telefone || '-'}</td>
                        <td>${escapeHtml(bairroAluno)}</td>
                        <td>${badgeNecessidade}</td>
                        <td>
                            <div class="acoes-container">
                                ${botaoConfirmacao}
                                <div class="acoes-menu">
                                    <button class="acoes-toggle" onclick="toggleAcoesMenu(event)" title="Mais ações"><i class="bi bi-three-dots-vertical" aria-hidden="true"></i></button>
                                    <div class="acoes-dropdown" data-aluno-id="${aluno.id}">
                                        <button onclick="abrirFichaAluno(${aluno.id})" title="Ver detalhes completos"><i class="bi bi-file-earmark-text" aria-hidden="true"></i> Ficha</button>
                                        <a href="${linkWhats}" target="_blank" ${foneLimpo ? '' : 'style="pointer-events:none;opacity:.55;"'} title="Abrir WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i> WhatsApp</a>
                                        <button onclick="excluirAluno(${aluno.id}, '${nomeEscapadoJs}')" title="Remover e liberar vaga"><i class="bi bi-trash" aria-hidden="true"></i> Excluir</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error("Erro ao buscar alunos:", err);
        tbody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Erro ao carregar lista de alunos.</td></tr>`;
    }
}

/* =========================================================
   3. SISTEMA DA FICHA COMPLETA DO ALUNO (MODAL)
========================================================= */
let alunoFichaAtiva = null;
let historicoFichaAtiva = null;

async function abrirFichaAluno(idAluno) {
    const a = alunosGlobais.find(x => x.id === idAluno);
    if (!a) return;
    try {
        const res = await fetch(`/api/admin/aluno/completo/${a.cpf}`);
        const data = await lerJsonOuLancar(res);
        exibirFichaCompleta(data.aluno, data.historico);
    } catch (err) {
        if (err.message !== 'sessao-expirada') {
            mostrarPopup('Erro ao carregar detalhes completos do aluno.', 'error');
        }
    }
}

function exibirFichaCompleta(aluno, historico) {
    alunoFichaAtiva = aluno;
    historicoFichaAtiva = historico;

    const conteudo = document.getElementById('conteudoDetalhes');
    if (!conteudo) return;

    const checar = (valor) => valor ? escapeHtml(valor) : '<em style="color:#64748b">Não inf.</em>';
    const simNao = (valor) => String(valor || '').toLowerCase() === 'sim' 
        ? '<span style="color:#10b981; font-weight:bold;">Sim</span>' 
        : '<span style="color:#ef4444; font-weight:bold;">Não</span>';

    const renderizarDocumento = (documento, label) => {
        if (!documento) {
            return '<em style="color:#64748b">Não enviado</em>';
        }
        if (String(documento).startsWith('data:application/pdf') || String(documento).includes('.pdf')) {
            return `<a href="${documento}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:6px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;text-decoration:none;"><i class="bi bi-filetype-pdf" aria-hidden="true"></i> Abrir PDF do ${label}</a>`;
        }
        return `<img src="${documento}" alt="Documento ${label}" style="width:100%;max-height:220px;object-fit:contain;border-radius:8px;border:1px solid #334155;background:#0f172a;padding:6px;">`;
    };

    let idadeTexto = 'Não informada';
    if (aluno.data_nascimento) {
        const nasc = new Date(aluno.data_nascimento);
        if (!isNaN(nasc.getTime())) {
            const hoje = new Date();
            let idade = hoje.getFullYear() - nasc.getFullYear();
            const m = hoje.getMonth() - nasc.getMonth();
            if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
                idade--;
            }
            idadeTexto = `${idade} anos (${formatarDataBr(aluno.data_nascimento).split(' ')[0]})`;
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
        <div class="detalhe-item"><span>Autoriza nome em lista pública (LGPD)</span><strong>${simNao(aluno.autoriza_lgpd)}</strong></div>
        
        <div class="detalhe-secao"><i class="bi bi-telephone-fill" aria-hidden="true"></i> Contatos e Endereço</div>
        <div class="detalhe-item"><span>Celular Principal (WhatsApp)</span><strong>${checar(aluno.telefone)}</strong></div>
        <div class="detalhe-item"><span>Telefone Alternativo</span><strong>${checar(aluno.telefone_alternativo)}</strong></div>
        <div class="detalhe-item"><span>E-mail</span><strong>${checar(aluno.email)}</strong></div>
        <div class="detalhe-item"><span>CEP</span><strong>${checar(aluno.cep)}</strong></div>
        <div class="detalhe-item"><span>Rua, Nº</span><strong>${checar(aluno.rua)}, Nº ${checar(aluno.numero)}</strong></div>
        <div class="detalhe-item"><span>Bairro / Município</span><strong>${checar(aluno.bairro)} - ${checar(aluno.municipio)}</strong></div>
        
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
    `;

    if (Number(aluno.questionario_conclusao_respondido) === 1) {
        html += `
            <div class="detalhe-secao"><i class="bi bi-chat-square-text-fill" aria-hidden="true"></i> Pesquisa de Conclusão / Empregabilidade</div>
            <div class="detalhe-item"><span>Conseguiu emprego na área?</span><strong>${checar(aluno.emprego_pos_curso)}</strong></div>
            <div class="detalhe-item"><span>Contribuição profissional</span><strong>${aluno.contribuicao_profissional || '-'} / 5</strong></div>
            <div class="detalhe-item"><span>Recomendaria o curso?</span><strong>${simNao(aluno.recomendaria)}</strong></div>
            <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Principal benefício apontado</span><strong>${checar(aluno.beneficio_principal)}</strong></div>
        `;
    }

    if (Number(aluno.pesquisa_satisfacao_respondida) === 1) {
        html += `
            <div class="detalhe-secao"><i class="bi bi-star-fill" aria-hidden="true"></i> Pesquisa de Satisfação pós-curso</div>
            <div class="detalhe-item"><span>Nota Instrutor</span><strong>${aluno.nota_satisfacao_instrutor || '-'} ★</strong></div>
            <div class="detalhe-item"><span>Nota Estrutura/Local</span><strong>${aluno.nota_satisfacao_estrutura || '-'} ★</strong></div>
            <div class="detalhe-item"><span>Nota Material Didático</span><strong>${aluno.nota_satisfacao_material || '-'} ★</strong></div>
            <div class="detalhe-item"><span>Nota Geral (1-10)</span><strong>${aluno.nota_satisfacao_geral || '-'} / 10</strong></div>
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
                    <td>${dataInscr}</td>
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

    html += `
        <div class="detalhe-secao"><i class="bi bi-images" aria-hidden="true"></i> Documentação Enviada</div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Documento de Identidade (RG)</span><strong>${rgDocumento}</strong></div>
        <div class="detalhe-item" style="grid-column: 1 / -1;"><span>Comprovante de CPF</span><strong>${cpfDocumento}</strong></div>
    `;

    conteudo.innerHTML = html;
    document.getElementById('modalDetalhes').style.display = 'flex';
}

async function buscarAlunoPorCpf() {
    const input = document.getElementById('buscaCpfInput');
    if (!input) return;
    const cpf = input.value.trim();
    if (!cpf) {
        mostrarPopup('Digite um CPF para buscar.', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/admin/aluno/completo/${encodeURIComponent(cpf)}`);
        if (res.status === 404) {
            mostrarPopup('Aluno não encontrado com este CPF.', 'warning');
            return;
        }
        const data = await lerJsonOuLancar(res);
        exibirFichaCompleta(data.aluno, data.historico);
    } catch (err) {
        if (err.message !== 'sessao-expirada') {
            mostrarPopup('Erro ao buscar ficha do aluno.', 'error');
        }
    }
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

    const checar = (valor) => valor ? escapeHtml(valor) : 'Não informado';
    const formatarData = (iso) => iso ? formatarDataBr(iso).split(' ')[0] : 'Não informado';

    let responsavelHtml = '';
    if (aluno.responsavel_nome) {
        responsavelHtml = `
            <h2>Dados do Responsável Legal (Menor de Idade)</h2>
            <div class="grid">
                <div><strong>Nome do Responsável:</strong> ${checar(aluno.responsavel_nome)}</div>
                <div><strong>CPF do Responsável:</strong> ${checar(formatarCpf(aluno.responsavel_cpf))}</div>
                <div><strong>Parentesco:</strong> ${checar(aluno.responsavel_parentesco)}</div>
                <div><strong>Telefone do Responsável:</strong> ${checar(aluno.responsavel_telefone)}</div>
                <div><strong>E-mail:</strong> ${checar(aluno.responsavel_email)}</div>
                <div><strong>Autorização:</strong> ${checar(aluno.responsavel_autorizacao)}</div>
            </div>
        `;
    }

    let historicoTbody = '';
    if (historico && historico.length > 0) {
        historico.forEach(h => {
            historicoTbody += `
                <tr>
                    <td>${escapeHtml(h.curso_nome)}</td>
                    <td>${escapeHtml(h.local_nome)}</td>
                    <td>${String(h.status_inscricao).toUpperCase()}</td>
                    <td>${formatarData(h.criado_em)}</td>
                    <td>${Number(h.matricula_confirmada) === 1 ? 'Matriculado' : 'Pendente'}</td>
                    <td>${checar(h.situacao_final)}</td>
                </tr>
            `;
        });
    } else {
        historicoTbody = `<tr><td colspan="6" style="text-align:center;">Nenhuma outra inscrição registrada.</td></tr>`;
    }

    printWindow.document.write(\`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Ficha do Aluno — \${aluno.nome}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    margin: 40px;
                    line-height: 1.5;
                }
                .header-print {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header-print h1 {
                    margin: 0;
                    font-size: 24px;
                    text-transform: uppercase;
                }
                .header-print p {
                    margin: 5px 0 0;
                    font-size: 14px;
                    color: #666;
                }
                h2 {
                    font-size: 16px;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 5px;
                    margin-top: 30px;
                    text-transform: uppercase;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    font-size: 13px;
                }
                .grid div {
                    padding: 4px 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                @media print {
                    body { margin: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header-print">
                <h1>Ficha de Cadastro do Aluno</h1>
                <p>Prefeitura Municipal de Vitória — VixCursos</p>
                <p>Data de Emissão: \${new Date().toLocaleString('pt-BR')}</p>
            </div>

            <h2>Dados de Identificação</h2>
            <div class="grid">
                <div><strong>Nome Completo:</strong> \${checar(aluno.nome)}</div>
                <div><strong>CPF:</strong> \${checar(formatarCpf(aluno.cpf))}</div>
                <div><strong>RG:</strong> \${checar(aluno.rg)}</div>
                <div><strong>Data de Nascimento:</strong> \${formatarData(aluno.data_nascimento)}</div>
                <div><strong>Gênero:</strong> \${checar(aluno.genero)}</div>
                <div><strong>Raça/Cor (IBGE):</strong> \${checar(aluno.raca_cor)}</div>
                <div><strong>Escolaridade:</strong> \${checar(aluno.escolaridade)}</div>
                <div><strong>Autoriza LGPD:</strong> \${checar(aluno.autoriza_lgpd)}</div>
            </div>

            <h2>Contatos e Endereço</h2>
            <div class="grid">
                <div><strong>Celular/WhatsApp:</strong> \${checar(aluno.telefone)}</div>
                <div><strong>Telefone Alternativo:</strong> \${checar(aluno.telefone_alternativo)}</div>
                <div><strong>E-mail:</strong> \${checar(aluno.email)}</div>
                <div><strong>CEP:</strong> \${checar(aluno.cep)}</div>
                <div><strong>Rua:</strong> \${checar(aluno.rua)}, Nº \${checar(aluno.numero)}</div>
                <div><strong>Bairro:</strong> \${checar(aluno.bairro)}</div>
                <div><strong>Município:</strong> \${checar(aluno.municipio)}</div>
            </div>

            <h2>Condições Especiais</h2>
            <div class="grid">
                <div><strong>Possui Deficiência / Nec. Especial?:</strong> \${checar(aluno.possui_necessidade_especial)}</div>
                <div><strong>Tipo de Deficiência:</strong> \${checar(aluno.tipo_necessidade_especial)}</div>
                <div style="grid-column: 1 / -1;"><strong>Adaptações Necessárias:</strong> \${checar(aluno.deficiencia_adaptacoes)}</div>
                <div style="grid-column: 1 / -1;"><strong>Recursos Assistivos:</strong> \${checar(aluno.deficiencia_recursos)}</div>
            </div>

            \${responsavelHtml}

            <h2>Objetivo no Curso</h2>
            <p style="font-size: 13px;"><strong>Objetivo:</strong> \${checar(aluno.objetivo)}</p>

            <h2>Histórico de Inscrições</h2>
            <table>
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Local</th>
                        <th>Classificação</th>
                        <th>Data Inscrição</th>
                        <th>Status</th>
                        <th>Situação Final</th>
                    </tr>
                </thead>
                <tbody>
                    \${historicoTbody}
                </tbody>
            </table>

            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    \`);
    printWindow.document.close();
}etalhes').style.display = 'flex';
}

function fecharModalDetalhes() {
    document.getElementById('modalDetalhes').style.display = 'none';
}


/* =========================================================
   4. VOLTAR PARA CURSOS E EXCLUIR
========================================================= */
function voltarParaCursos() {
    const btnPdf = document.getElementById('btnGerarPdfInscritos');
    if (btnPdf) btnPdf.style.display = 'none';

    document.getElementById('telaAlunos').classList.add('tela-oculta');
    document.getElementById('telaCursos').classList.remove('tela-oculta');
    carregarCursos();
}

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
    doc.text('Relatório de Inscritos - Vix Cursos', 14, 16);

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
        mensagem: `Isso vai excluir ${nomeAluno} e liberar 1 vaga automaticamente. Deseja continuar?`,
        textoConfirmar: 'Sim, excluir',
        textoCancelar: 'Cancelar',
        tipo: 'danger'
    });

    if (!confirmacao2) return;

    try {
        const res = await fetch(`/api/inscricoes/${idAluno}`, { method: 'DELETE' });
        if (res.ok) {
            mostrarPopup('Inscrição removida. Vaga devolvida.', 'success');
            abrirListaAlunos(cursoAbertoAtual.id);
        } else {
            mostrarPopup('Erro ao tentar excluir no banco de dados.', 'error');
        }
    } catch (err) {
        mostrarPopup('Falha na comunicação com o servidor.', 'error');
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
        const data = await res.json();

        if (!res.ok) {
            mostrarPopup(data.error || 'Erro ao confirmar matrícula.', 'error');
            return;
        }

        if (data.status === 'ja-confirmada') {
            mostrarPopup('Matrícula já estava confirmada.', 'info');
        } else if (data.email === 'falhou') {
            const detalhe = data.email_erro ? ` Motivo: ${data.email_erro}` : '';
            mostrarPopup(`Matrícula confirmada, mas o e-mail não foi enviado.${detalhe}`, 'warning');
        } else {
            mostrarPopup('Matrícula confirmada e e-mail enviado!', 'success');
        }

        abrirListaAlunos(cursoAbertoAtual.id);
    } catch (err) {
        mostrarPopup('Falha na comunicação com o servidor.', 'error');
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