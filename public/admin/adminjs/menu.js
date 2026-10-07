
    let cursoEmEdicao = null;
    let cursosAdmin = [];
    let mascotesAdmin = [];
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const cursoDoFormulario = () => cursosAdmin.find(c => c.id === cursoEmEdicao);
    const diaBrasilia = () => {
        const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        const part = name => parts.find(p => p.type === name).value;
        return `${part('year')}-${part('month')}-${part('day')}`;
    };
    const dataCurta = value => value ? value.split('-').reverse().join('/') : '';
    function escolhaPublicacao() {
        const mode = document.getElementById('publicacaoModo').value;
        const course = cursoDoFormulario();
        if (mode === 'manter') return { publicacao_modo: mode, status: course?.status || 'ativo', data_publicacao: course?.data_publicacao || null };
        const value = document.getElementById('data_publicacao').value;
        return { publicacao_modo: mode, status: mode === 'arquivado' ? 'arquivado' : mode === 'espera' ? 'esgotado' : 'ativo',
            data_publicacao: mode === 'agendada' && value ? `${value}:00-03:00` : null };
    }
    function atualizarPublicacao() {
        const course = cursoDoFormulario();
        const mode = document.getElementById('publicacaoModo').value;
        const scheduled = mode === 'agendada';
        const input = document.getElementById('data_publicacao');
        document.getElementById('publicacaoAgendada').hidden = !scheduled;
        input.required = scheduled;
        input.disabled = !scheduled;
        document.getElementById('situacaoAtualCurso').hidden = !course;
        document.getElementById('modoManter').hidden = !course;
        document.getElementById('modoManter').disabled = !course;
        if (course) {
            document.getElementById('situacaoAtualTexto').textContent = `Situação atual: ${course.situacao === 'arquivado' ? 'Guardado sem mostrar no site' : course.situacao_label}`;
            document.getElementById('situacaoAtualMotivo').textContent = course.situacao === 'encerrado'
                ? `As aulas terminaram em ${course.data_termino}. Para abrir de novo, atualize o período das aulas.`
                : course.situacao === 'agendado' ? `Aparecerá no site em ${formatarPublicacao(course.data_publicacao)} (Brasília).`
                : course.situacao === 'esgotado' ? 'Os alunos podem entrar na lista de espera.'
                : course.situacao === 'arquivado' ? 'O curso está guardado e não aparece para o público.'
                : 'A situação considera as datas das aulas e as vagas disponíveis.';
        }
        const messages = {
            manter: 'As escolhas anteriores serão mantidas. Se mudar o período das aulas, a situação do curso será atualizada.',
            agora: 'Depois de salvar, o público poderá ver o curso e se inscrever.',
            agendada: 'Escolha uma data futura. O curso fica guardado até esse momento.',
            arquivado: 'Você poderá editar e mostrar o curso no site mais tarde.',
            espera: 'O público poderá se cadastrar como suplente, na lista de espera.'
        };
        document.getElementById('avisoPublicacao').textContent = messages[mode];
        const end = document.getElementById('data_termino').value;
        const choice = escolhaPublicacao();
        const ended = end && end < diaBrasilia();
        const summary = document.getElementById('resumoPublicacao');
        summary.dataset.encerrado = Boolean(ended && choice.status !== 'arquivado');
        let result;
        if (choice.status === 'arquivado') result = 'Depois de salvar: guardado, sem aparecer no site.';
        else if (ended) result = `Depois de salvar: encerrado. O último dia de aula, ${dataCurta(end)}, já passou.`;
        else if (!end) result = 'Preencha o período das aulas para conferir como o curso ficará.';
        else if (scheduled && !choice.data_publicacao) result = 'Escolha o dia e a hora em que o curso deve aparecer.';
        else if (choice.data_publicacao && Date.parse(choice.data_publicacao) > Date.now()) result = `Depois de salvar: aparecerá em ${formatarPublicacao(choice.data_publicacao)} (Brasília).`;
        else if (choice.status === 'esgotado' || (course && Number(document.getElementById('vagas').value) <= course.inscritos)) result = 'Depois de salvar: disponível somente para lista de espera.';
        else result = `Depois de salvar: inscrições abertas. Aulas até ${dataCurta(end)}.`;
        summary.textContent = result;
        document.getElementById('data_termino').min = document.getElementById('data_inicio').value;
    }
    const formatarPublicacao = value => new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
    function atualizarMascotePreview() {
        const id = document.getElementById('mascote_id').value;
        const mascot = mascotesAdmin.find(m => m.id === id);
        document.getElementById('mascotePreview').src = mascot?.imagem || '/imagem/Vitoruga.png';
        document.querySelectorAll('[data-mascote]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mascote === id)));
    }
    function abrirModal() {
        cursoEmEdicao = null;
        document.getElementById('formCriarCurso').reset();
        document.getElementById('publicacaoModo').value = 'agora';
        document.getElementById('detalhesCursoOpcionais').open = false;
        document.getElementById('erroFormularioCurso').hidden = true;
        atualizarPublicacao();
        document.getElementById('tituloModalCurso').textContent = 'Novo curso';
        atualizarMascotePreview();
        document.getElementById('modalNovoCurso').classList.add('open');
        document.querySelector('.curso-form-scroll').scrollTop = 0;
        document.getElementById('curso').focus();
    }
    function editarCurso(id) {
        const course = cursosAdmin.find(c => c.id === id);
        if (!course) return;
        abrirModal();
        cursoEmEdicao = id;
        document.getElementById('tituloModalCurso').textContent = `Editar curso #${id}`;
        const fields = { ...course, vagas: course.vagas_totais, local: course.local_id, modalidade: course.modalidade_id,
            idade_min: course.idade_min_id, idade_max: course.idade_max_id,
            data_inicio: course.data_inicio_iso, data_termino: course.data_termino_iso };
        for (const [key, value] of Object.entries(fields)) {
            const input = document.getElementById(key);
            if (input && input.closest('#formCriarCurso')) input.value = value ?? '';
        }
        document.getElementById('publicacaoModo').value = 'manter';
        if (course.data_publicacao) {
            const parts = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(course.data_publicacao));
            document.getElementById('data_publicacao').value = parts.replace(' ', 'T');
        }
        atualizarPublicacao();
        atualizarMascotePreview();
    }
    function fecharModal() {
        document.getElementById('modalNovoCurso').classList.remove('open');
        document.getElementById('formCriarCurso').reset();
    }

    function abrirModalConfig(e) {
        if (e) e.preventDefault();
        document.getElementById('modalConfiguracoes').classList.add('open');
        marcarNavegacaoAdmin(true);
        const url = new URL(location.href); url.searchParams.set('configuracoes', '1'); history.replaceState(null, '', url);
        carregarConfiguracoes();
    }

    function fecharModalConfig() {
        document.getElementById('modalConfiguracoes').classList.remove('open');
        marcarNavegacaoAdmin();
        const url = new URL(location.href); url.searchParams.delete('configuracoes'); history.replaceState(null, '', url);
        document.getElementById('formConfiguracoes').reset();
    }

    async function carregarConfiguracoes() {
        try {
            const res = await fetch('/api/admin/configuracoes');
            const config = await lerJsonOuLancar(res);
            document.getElementById('limite_inscricoes_semestre').value = config.limite_inscricoes_semestre || 4;
            document.getElementById('prazo_confirmacao_horas').value = config.prazo_confirmacao_horas || 48;
        } catch (err) {
            console.error('Erro ao carregar configurações:', err);
            mostrarPopup('Erro ao carregar configurações do servidor.', 'error');
        }
    }

    async function salvarConfiguracoes(e) {
        e.preventDefault();
        const dados = {
            limite_inscricoes_semestre: Number(document.getElementById('limite_inscricoes_semestre').value),
            prazo_confirmacao_horas: Number(document.getElementById('prazo_confirmacao_horas').value)
        };

        try {
            const res = await fetch('/api/admin/configuracoes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            const resDados = await lerJsonOuLancar(res);
            if (resDados.ok) {
                mostrarPopup('Configurações salvas com sucesso!', 'success');
                fecharModalConfig();
            } else {
                mostrarPopup('Erro ao salvar: ' + resDados.message, 'error');
            }
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
            mostrarPopup('Falha na comunicação com o servidor.', 'error');
        }
    }

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

    function deveRedirecionarLogin(res) {
        return res.status === 401 || (res.redirected && String(res.url || '').includes('/admin/login.html'));
    }

    async function lerJsonOuLancar(res) {
        if (deveRedirecionarLogin(res)) {
            window.location.href = '/admin/login.html';
            throw new Error('sessao-expirada');
        }

        const tipo = String(res.headers.get('content-type') || '').toLowerCase();
        if (!tipo.includes('application/json')) {
            throw new Error('resposta-nao-json');
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `http-${res.status}`);
        return data;
    }

    async function carregarStats() {
        try {
            const res = await fetch('/api/admin/stats');
            const s = await lerJsonOuLancar(res);
            const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? '--'; };
            set('kpiTotal', s.total);
            set('kpiAtivos', s.ativos);
            set('kpiInscritos', s.inscritos);
            set('kpiLeads', s.leads);
        } catch (err) {
            console.error('Erro ao carregar stats:', err);
        }
    }

    async function carregarFiltros() {
        // Atualizamos "nome" para "curso" na lista de busca
        const tipos = ["curso", "idade", "local", "modalidade"];
        for (const tipo of tipos) {
            try {
                const req = await fetch(`/public/${tipo}`);
                const dados = await req.json();
                
                if (tipo === "idade") {
                    let options = `<option value="">-- Selecione --</option>`;
                    options += dados.map(d => `<option value="${d.id}">${d.idade} anos</option>`).join("");
                    document.getElementById("idade_min").innerHTML = options;
                    document.getElementById("idade_max").innerHTML = options;
                    continue;
                }

                const select = document.getElementById(tipo);
                if (select) {
                    let options = `<option value="">-- Selecione --</option>`;
                    // Usando d.curso no lugar de d.nome
                    options += dados.map(d => `<option value="${d.id}">${d.curso || d.local || d.modalidade}</option>`).join("");
                    select.innerHTML = options;
                }
            } catch (err) {
                console.error(`Erro filtro ${tipo}:`, err);
            }
        }
    }

    async function carregarCursosAdmin() {
        try {
            const res = await fetch("/cursos");
            const cursos = await lerJsonOuLancar(res);
            cursosAdmin = cursos;
            const tbody = document.getElementById("listaCursos");
            
            if (cursos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">Nenhum curso cadastrado.</td></tr>`;
                return;
            }

            let html = "";
            cursos.forEach(c => {
                const badgeClass = c.situacao === 'aberto' ? 'badge-ativo' : c.situacao === 'esgotado' ? 'badge-esgotado' : 'badge-neutro';
                const statusTexto = escapeHtml(c.situacao_label);

                // O backend (server.js) continua enviando como c.nome para facilitar o front, então deixamos c.nome aqui!
                html += `
                <tr>
                    <td>
                        <strong style="color: var(--primary);">#${c.id}</strong><br>
                        <span style="font-weight: 500;">${escapeHtml(c.nome)}</span>
                        <img class="course-mascot-thumb" src="${escapeHtml(mascotesAdmin.find(m => m.id === c.mascote_id)?.imagem || '/imagem/Vitoruga.png')}" alt="Tartaruga do curso">
                    </td>
                    <td style="font-size: 0.9rem;">
                        <i class="bi bi-calendar3 icon-inline" aria-hidden="true"></i>${c.data_inicio || '-'} até ${c.data_termino || '-'}<br>
                        <i class="bi bi-clock icon-inline" aria-hidden="true"></i>${c.horario_inicio || '-'} às ${c.horario_termino || '-'}
                    </td>
                    <td style="font-size: 0.9rem;">
                        <i class="bi bi-geo-alt icon-inline" aria-hidden="true"></i>${escapeHtml(c.local || 'Não definido')}<br>
                        <i class="bi bi-building icon-inline" aria-hidden="true"></i>${escapeHtml(c.modalidade || '-')}
                    </td>
                    <td><strong>${c.vagas}</strong> rest.</td>
                    <td><span class="badge ${badgeClass}">${statusTexto}</span>${c.data_publicacao && Date.parse(c.data_publicacao) > Date.now() ? `<br><small>Agendado para ${escapeHtml(formatarPublicacao(c.data_publicacao))}</small>` : ''}</td>
                    <td class="acoes">
                        <button data-editar="${c.id}" class="btn btn-outline" title="Editar curso e tartaruga" aria-label="Editar curso"><i class="bi bi-pencil-square" aria-hidden="true"></i></button>
                        <a href="/detalhes/${c.id}" target="_blank" rel="noopener" class="btn btn-outline" title="Ver no site" aria-label="Ver no site"><i class="bi bi-globe" aria-hidden="true"></i></a>
                        <a href="/admin/inscritos.html?curso=${c.id}" class="btn btn-outline" title="Ver Inscritos" aria-label="Ver inscritos"><i class="bi bi-people-fill" aria-hidden="true"></i></a>
                        ${c.status === 'ativo' 
                            ? `<button data-esgotar="${c.id}" class="btn btn-danger" title="Esgotar vagas" aria-label="Esgotar vagas"><i class="bi bi-slash-circle" aria-hidden="true"></i></button>`
                            : `<button class="btn btn-outline" disabled style="opacity: 0.5;" aria-label="Curso encerrado"><i class="bi bi-slash-circle" aria-hidden="true"></i></button>`
                        }
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;
        } catch (err) {
            console.error(err);
            document.getElementById("listaCursos").innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">Sessão expirada ou erro ao carregar dados do servidor.</td></tr>`;
        }
    }

    async function criarCurso(e) {
        e.preventDefault();
        const choice = escolhaPublicacao();
        const end = document.getElementById('data_termino').value;
        const error = document.getElementById('erroFormularioCurso');
        const invalid = (message, field) => { error.textContent = message; error.hidden = false; document.getElementById(field).focus(); };
        if (['agora', 'espera'].includes(choice.publicacao_modo) && end < diaBrasilia()) {
            invalid('Para mostrar o curso de novo, escolha um último dia de aula que ainda não passou.', 'data_termino');
            return;
        }
        if (choice.publicacao_modo === 'agendada' && (!choice.data_publicacao || Date.parse(choice.data_publicacao) <= Date.now())) {
            invalid('Escolha um dia e horário futuros para o curso aparecer no site.', 'data_publicacao');
            return;
        }
        if (choice.publicacao_modo === 'agendada' && choice.data_publicacao.slice(0, 10) > end) {
            invalid('O curso precisa aparecer no site antes de terminar. Confira o dia escolhido.', 'data_publicacao');
            return;
        }
        error.hidden = true;
        const dados = {
            ...choice,
            nome: document.getElementById('nome').value,
            mascote_id: document.getElementById('mascote_id').value || null,
            curso: document.getElementById("curso").value, // Pegando do ID "curso"
            categoria_id: document.getElementById('categoria_id').value || document.getElementById('curso').value,
            vagas: document.getElementById("vagas").value,
            idade_min: document.getElementById("idade_min").value,
            idade_max: document.getElementById("idade_max").value,
            modalidade: document.getElementById("modalidade").value, 
            local: document.getElementById("local").value,
            data_inicio: document.getElementById("data_inicio").value,
            data_termino: document.getElementById("data_termino").value,
            horario_inicio: document.getElementById("horario_inicio").value,
            horario_termino: document.getElementById("horario_termino").value,
            carga_horaria: document.getElementById("carga_horaria")?.value || null,
            descricao: document.getElementById("descricao")?.value || null,
            ementa: document.getElementById("ementa")?.value || null,
            competencias: document.getElementById("competencias")?.value || null,
            pre_requisitos: document.getElementById("pre_requisitos")?.value || null
        };

        const button = document.getElementById('salvarCurso');
        button.disabled = true;
        try {
            const response = await fetch(cursoEmEdicao ? `/cursos/${cursoEmEdicao}` : '/cursos', {
            method: cursoEmEdicao ? 'PUT' : 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
            });
            await lerJsonOuLancar(response);
            mostrarPopup('Curso salvo com sucesso.', 'success');
            fecharModal();
            await Promise.all([carregarCursosAdmin(), carregarStats()]);
        } catch (err) {
            console.error(err);
            if (err.message !== 'sessao-expirada') { error.textContent = err.message || 'Não foi possível salvar o curso. Tente novamente.'; error.hidden = false; }
        } finally { button.disabled = false; }
    }

    async function esgotarCurso(id, nome) {
        const confirmou = await confirmarPopup({
            titulo: 'Esgotar vagas',
            mensagem: `Tem certeza que deseja esgotar as vagas do curso ${nome}?`,
            textoConfirmar: 'Sim, esgotar',
            textoCancelar: 'Cancelar',
            tipo: 'danger'
        });
        if (!confirmou) return;

        try {
            const res = await fetch(`/cursos/esgotar/${id}`, { method: 'PUT' });
            await lerJsonOuLancar(res);
            await Promise.all([carregarCursosAdmin(), carregarStats()]);
            mostrarPopup('Curso atualizado para esgotado.', 'success');
        } catch (err) {
            console.error(err);
            mostrarPopup("Erro de conexão.", 'error');
        }
    }

    document.getElementById('listaCursos').addEventListener('click', event => {
        const edit = event.target.closest('[data-editar]');
        if (edit) editarCurso(Number(edit.dataset.editar));
        const end = event.target.closest('[data-esgotar]');
        if (end) esgotarCurso(Number(end.dataset.esgotar), cursosAdmin.find(c => c.id === Number(end.dataset.esgotar))?.nome || '');
    });
    document.getElementById('curso').addEventListener('change', event => { document.getElementById('categoria_id').value = event.target.value; });
    document.getElementById('formCriarCurso').addEventListener('input', () => { document.getElementById('erroFormularioCurso').hidden = true; atualizarPublicacao(); });
    document.getElementById('formCriarCurso').addEventListener('change', atualizarPublicacao);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.getElementById('modalNovoCurso').classList.contains('open')) fecharModal(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { carregarCursosAdmin(); carregarStats(); } });
    setInterval(() => { if (!document.hidden) { carregarCursosAdmin(); carregarStats(); } }, 30000);
    carregarFiltros();
    carregarCursosAdmin();
    carregarStats();
document.addEventListener('DOMContentLoaded', async () => {
    const select = document.getElementById('mascote_id');
    if (!select) return;
    try {
        const response = await fetch('/mascotes.json');
        const mascots = await response.json();
        mascotesAdmin = mascots;
        for (const mascot of mascots) {
            const option = document.createElement('option');
            option.value = mascot.id;
            option.textContent = `${mascot.nome} — ${mascot.profissao}`;
            select.appendChild(option);
        }
        const choices = document.getElementById('mascoteOpcoes');
        for (const mascot of mascots) {
            const button = document.createElement('button');
            button.type = 'button'; button.className = 'mascot-option'; button.dataset.mascote = mascot.id;
            const img = document.createElement('img'); img.src = mascot.imagem; img.alt = ''; img.loading = 'lazy';
            const label = document.createElement('span'); label.textContent = mascot.nome;
            button.append(img, label);
            button.addEventListener('click', () => { select.value = mascot.id; atualizarMascotePreview(); });
            choices.append(button);
        }
        select.addEventListener('change', atualizarMascotePreview);
        atualizarMascotePreview();
        carregarCursosAdmin();
    } catch (error) { console.error('Não foi possível carregar os mascotes.', error); }
});

document.addEventListener('DOMContentLoaded', () => { if (new URLSearchParams(location.search).has('configuracoes')) abrirModalConfig(); });
