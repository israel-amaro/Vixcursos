/**
 * Vix Cursos - Frontend Mock Database & API Interceptor
 * Overrides window.fetch globally to simulate the backend.
 * Uses localStorage to persist data.
 */

(function () {
    // -------------------------------------------------------------
    // 1. DATA INITIALIZATION & STATIC METADATA
    // -------------------------------------------------------------

    const filtroCursos = [
        { id: 1, curso: "Administração" },
        { id: 2, curso: "Artesanato" },
        { id: 3, curso: "AUTOMAÇÃO INDUSTRIAL" },
        { id: 4, curso: "Beleza" },
        { id: 5, curso: "Cinema" },
        { id: 6, curso: "Comércio / Gestão Empresarial" },
        { id: 7, curso: "Confecção" },
        { id: 8, curso: "Construção Civil / Serviço" },
        { id: 9, curso: "Cultura" },
        { id: 10, curso: "Dança" },
        { id: 11, curso: "Dança e Teatro" },
        { id: 12, curso: "Educação" },
        { id: 13, curso: "Eletrônica" },
        { id: 14, curso: "Eletricista / Energia" },
        { id: 15, curso: "Enfermagem / Saúde" },
        { id: 16, curso: "Estética" },
        { id: 17, curso: "Eventos" },
        { id: 18, curso: "Fotografia" },
        { id: 19, curso: "Gastronomia" },
        { id: 20, curso: "Gestão" },
        { id: 21, curso: "Idiomas" },
        { id: 22, curso: "Informática / Tecnologia" },
        { id: 23, curso: "Logística" },
        { id: 24, curso: "Manutenção" },
        { id: 25, curso: "Mecânica" },
        { id: 26, curso: "Meio Ambiente" },
        { id: 27, curso: "Moda" },
        { id: 28, curso: "Música" },
        { id: 29, curso: "Panificação / Confeitaria" },
        { id: 30, curso: "Produção Cultural" },
        { id: 31, curso: "Programação / TI" },
        { id: 32, curso: "Recursos Humanos" },
        { id: 33, curso: "Redes / Telecom" },
        { id: 34, curso: "Segurança do Trabalho" },
        { id: 35, curso: "Serviço Social" },
        { id: 36, curso: "Soldagem" },
        { id: 37, curso: "Turismo / Hotelaria" },
        { id: 38, curso: "Vendas / Marketing" }
    ];

    const filtroCategorias = filtroCursos.map(({ id, curso }) => ({ id, categoria: curso }));

    const filtroModalidades = [
        { id: 1, modalidade: "Presencial" },
        { id: 2, modalidade: "Híbrido" },
        { id: 3, modalidade: "Online" }
    ];

    const filtroLocais = [
        "Administração Regional da Praia do Canto",
        "Academia Popular de Santa Martha",
        "Andorinhas",
        "Área de Lazer e Eventos de Jardim Camburi",
        "Bairro da Penha",
        "Bento Ferreira",
        "Bonfim",
        "Caratoíra",
        "Carreta de Eletricidade (Local itinerante)",
        "Carreta de Informática (Local itinerante)",
        "Carreta de Refrigeração e Climatização (Local itinerante)",
        "Centro de Formação Profissional do Senac Vitória",
        "Centro de Referência da Assistência Social (CRAS) Jucutuquara",
        "Centro de Referência da Assistência Social (CRAS) São Pedro V",
        "Centro de Referência para a Juventude (CRJ) Andorinhas",
        "Comunidade de Piedade",
        "Horto de Maruípe",
        "Ilha de Santa Maria",
        "Jardim Camburi",
        "Jardim da Penha",
        "Mata da Praia",
        "Mário Cypreste",
        "Parque Moscoso",
        "Praça do Hi-Fi",
        "Residencial Santo André",
        "SENAI Cícero Freire",
        "SENAI Porto de Santana",
        "Santa Martha",
        "Santos Dumont",
        "São Benedito"
    ].map((local, index) => ({ id: index + 1, local }));

    const filtroIdades = Array.from({ length: 72 }, (_, index) => ({ id: index + 1, idade: index + 10 }));

    const defaultFaqs = [
        { id: 1, pergunta: "Quem pode se inscrever?", resposta: "Os cursos do VixCursos são destinados exclusivamente a moradores de Vitória - ES que atendam aos pré-requisitos de idade e escolaridade do curso pretendido.", ordem: 0 },
        { id: 2, pergunta: "Como funciona a confirmação de matrícula?", resposta: "Após a pré-inscrição online, o aluno titular recebe uma notificação por e-mail/SMS com prazo de 24h ou 48h para confirmar sua matrícula. Caso não confirme, a vaga é liberada para o próximo suplente.", ordem: 1 },
        { id: 3, pergunta: "O que acontece se eu for suplente?", resposta: "Caso as vagas imediatas estejam preenchidas, você entrará na fila de suplência automática. Se um candidato titular desistir ou não confirmar a matrícula no prazo, o próximo suplente da fila é convocado por e-mail/SMS.", ordem: 2 },
        { id: 4, pergunta: "Qual o limite de cursos por semestre?", resposta: "Cada cidadão pode se inscrever em até 4 cursos por semestre. A partir da 3ª inscrição simultânea, a inscrição entra automaticamente como suplente para dar oportunidade a outros moradores.", ordem: 3 },
        { id: 5, pergunta: "Os cursos são realmente gratuitos?", resposta: "Sim, todos os cursos oferecidos pelo portal VixCursos são 100% gratuitos e contam com fornecimento de vale-transporte.", ordem: 4 },
        { id: 6, pergunta: "Menores de 18 anos podem se inscrever?", resposta: "Sim, desde que atendam a idade mínima do curso. No momento da inscrição, deverão ser informados os dados do responsável legal, que deverá autorizar a participação.", ordem: 5 }
    ];

    const initialCursos = [
        {
            id: 1,
            nome: "Cabeleireiro Profissional",
            vagas_totais: 20,
            vagas_disponiveis: 18,
            status: "ativo",
            horario_inicio: "13:30",
            horario_termino: "17:30",
            data_inicio: "01/07/2026",
            data_termino: "15/08/2026",
            categoria: "Beleza",
            idade_min: "16",
            idade_max: "80",
            modalidade: "Presencial",
            local: "Centro de Formação Profissional do Senac Vitória",
            descricao: "Curso de técnicas de cabeleireiro profissional, cortes modernos, escovação e tratamento de fios.",
            competencias: "Corte feminino, hidratação avançada, técnicas de colorimetria básica",
            pre_requisitos: "Ensino Fundamental completo e idade mínima de 16 anos",
            carga_horaria: 80,
            nivel_empregabilidade: "alta",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            faixa_salarial_min: 1500,
            faixa_salarial_max: 3500,
            criado_em: "2026-06-24T00:00:00.000Z",
            acessos_contador: 14
        },
        {
            id: 2,
            nome: "Costura e Modelagem Industrial",
            vagas_totais: 15,
            vagas_disponiveis: 14,
            status: "ativo",
            horario_inicio: "08:00",
            horario_termino: "12:00",
            data_inicio: "05/07/2026",
            data_termino: "10/09/2026",
            categoria: "Confecção",
            idade_min: "16",
            idade_max: "80",
            modalidade: "Presencial",
            local: "SENAI Cícero Freire",
            descricao: "Aprenda corte, costura básica e avançada, modelagem de roupas e confecção de peças completas.",
            competencias: "Modelagem plana, costura industrial, acabamento fino e regulagem de máquinas",
            pre_requisitos: "Ensino Fundamental completo e idade mínima de 16 anos",
            carga_horaria: 120,
            nivel_empregabilidade: "media",
            video_url: null,
            faixa_salarial_min: 1800,
            faixa_salarial_max: 4000,
            criado_em: "2026-06-24T00:00:00.000Z",
            acessos_contador: 8
        },
        {
            id: 3,
            nome: "Culinária Básica e Molhos Finos",
            vagas_totais: 18,
            vagas_disponiveis: 17,
            status: "ativo",
            horario_inicio: "18:30",
            horario_termino: "22:30",
            data_inicio: "10/07/2026",
            data_termino: "30/08/2026",
            categoria: "Gastronomia",
            idade_min: "18",
            idade_max: "80",
            modalidade: "Presencial",
            local: "Centro de Formação Profissional do Senac Vitória",
            descricao: "Introdução às artes culinárias, técnicas de corte de legumes, manipulação de carnes e preparo de molhos clássicos.",
            competencias: "Técnicas de facas, preparo de massas frescas, molhos e sobremesas finas",
            pre_requisitos: "Ensino Médio completo e idade mínima de 18 anos",
            carga_horaria: 100,
            nivel_empregabilidade: "alta",
            video_url: null,
            faixa_salarial_min: 1600,
            faixa_salarial_max: 3800,
            criado_em: "2026-06-24T00:00:00.000Z",
            acessos_contador: 25
        },
        {
            id: 4,
            nome: "Lógica de Programação e Sistemas Web",
            vagas_totais: 25,
            vagas_disponiveis: 25,
            status: "ativo",
            horario_inicio: "14:00",
            horario_termino: "17:00",
            data_inicio: "02/07/2026",
            data_termino: "20/08/2026",
            categoria: "Informática / Tecnologia",
            idade_min: "14",
            idade_max: "80",
            modalidade: "Híbrido",
            local: "SENAI Cícero Freire",
            descricao: "Curso de lógica de programação, banco de dados básico e desenvolvimento de sistemas web simples.",
            competencias: "Lógica de programação com Javascript, fundamentos de bancos de dados relacionais, HTML5 e CSS3",
            pre_requisitos: "Ensino Fundamental II completo e idade mínima de 14 anos",
            carga_horaria: 60,
            nivel_empregabilidade: "alta",
            video_url: null,
            faixa_salarial_min: 2200,
            faixa_salarial_max: 6000,
            criado_em: "2026-06-24T00:00:00.000Z",
            acessos_contador: 42
        },
        {
            id: 5,
            nome: "Eletricista de Redes de Distribuição",
            vagas_totais: 30,
            vagas_disponiveis: 30,
            status: "ativo",
            horario_inicio: "08:00",
            horario_termino: "12:00",
            data_inicio: "12/07/2026",
            data_termino: "30/09/2026",
            categoria: "Eletricista / Energia",
            idade_min: "18",
            idade_max: "80",
            modalidade: "Presencial",
            local: "Centro de Referência da Assistência Social (CRAS) Jucutuquara",
            descricao: "Capacitação em atendimento de primeiros socorros em situações de emergência doméstica e profissional.",
            competencias: "Reanimação cardiopulmonar, curativos emergenciais, transporte seguro de vítimas",
            pre_requisitos: "Ensino Fundamental completo e idade mínima de 18 anos",
            carga_horaria: 40,
            nivel_empregabilidade: "media",
            video_url: null,
            faixa_salarial_min: 1400,
            faixa_salarial_max: 2500,
            criado_em: "2026-06-24T00:00:00.000Z",
            acessos_contador: 3
        }
    ];

    const defaultPreInscricoes = [
        {
            id: 1,
            curso_id: 1,
            nome: "João da Silva",
            cpf: "111.111.111-11",
            rg: "1.111.111",
            telefone: "(27) 99999-8888",
            bairro: "Jardim Camburi",
            possui_necessidade_especial: "Não",
            tipo_necessidade_especial: "",
            status_inscricao: "titular",
            matricula_confirmada: 1,
            matricula_confirmada_em: "2026-06-24T10:00:00.000Z",
            criado_em: "2026-06-24T09:00:00.000Z",
            situacao_final: "inscrito",
            email: "joao.silva@gmail.com",
            rg_documento: "documento_rg.pdf",
            cpf_documento: "documento_cpf.pdf",
            documento_confirmacao: "confirmacao.pdf",
            genero: "Masculino",
            raca_cor: "Parda",
            data_nascimento: "1995-05-15",
            escolaridade: "Ensino Médio Completo"
        },
        {
            id: 2,
            curso_id: 1,
            nome: "Maria Santos",
            cpf: "222.222.222-22",
            rg: "2.222.222",
            telefone: "(27) 98888-7777",
            bairro: "Praia do Canto",
            possui_necessidade_especial: "Sim",
            tipo_necessidade_especial: "Auditiva",
            status_inscricao: "titular",
            matricula_confirmada: 0,
            matricula_confirmada_em: null,
            criado_em: "2026-06-24T09:30:00.000Z",
            situacao_final: "inscrito",
            email: "maria.santos@outlook.com",
            rg_documento: "documento_rg.pdf",
            cpf_documento: "documento_cpf.pdf",
            documento_confirmacao: "confirmacao.pdf",
            genero: "Feminino",
            raca_cor: "Branca",
            data_nascimento: "1988-09-20",
            escolaridade: "Superior Completo"
        },
        {
            id: 3,
            curso_id: 2,
            nome: "Carlos Souza",
            cpf: "333.333.333-33",
            rg: "3.333.333",
            telefone: "(27) 97777-6666",
            bairro: "Centro",
            possui_necessidade_especial: "Não",
            tipo_necessidade_especial: "",
            status_inscricao: "suplente",
            matricula_confirmada: 0,
            matricula_confirmada_em: null,
            criado_em: "2026-06-24T10:15:00.000Z",
            situacao_final: "inscrito",
            email: "carlos.souza@yahoo.com",
            rg_documento: "documento_rg.pdf",
            cpf_documento: "documento_cpf.pdf",
            documento_confirmacao: "confirmacao.pdf",
            genero: "Masculino",
            raca_cor: "Preta",
            data_nascimento: "2000-02-10",
            escolaridade: "Ensino Médio Incompleto"
        },
        {
            id: 4,
            curso_id: 3,
            nome: "Lucia Lima",
            cpf: "444.444.444-44",
            rg: "4.444.444",
            telefone: "(27) 96666-3333",
            bairro: "Jardim Camburi",
            possui_necessidade_especial: "Não",
            tipo_necessidade_especial: "",
            status_inscricao: "titular",
            matricula_confirmada: 1,
            matricula_confirmada_em: "2026-06-24T12:00:00.000Z",
            criado_em: "2026-06-24T11:00:00.000Z",
            situacao_final: "concluido",
            email: "lucia.lima@gmail.com",
            rg_documento: "documento_rg.pdf",
            cpf_documento: "documento_cpf.pdf",
            documento_confirmacao: "confirmacao.pdf",
            genero: "Feminino",
            raca_cor: "Parda",
            data_nascimento: "1992-12-05",
            escolaridade: "Ensino Médio Completo",
            nota_satisfacao_geral: 5,
            pesquisa_satisfacao_respondida: 1
        },
        {
            id: 5,
            curso_id: 3,
            nome: "Marcos Ribeiro",
            cpf: "555.555.555-55",
            rg: "5.555.555",
            telefone: "(27) 95555-2222",
            bairro: "Maruípe",
            possui_necessidade_especial: "Não",
            tipo_necessidade_especial: "",
            status_inscricao: "titular",
            matricula_confirmada: 1,
            matricula_confirmada_em: "2026-06-24T13:00:00.000Z",
            criado_em: "2026-06-24T12:00:00.000Z",
            situacao_final: "evadido",
            email: "marcos.ribeiro@gmail.com",
            rg_documento: "documento_rg.pdf",
            cpf_documento: "documento_cpf.pdf",
            documento_confirmacao: "confirmacao.pdf",
            genero: "Masculino",
            raca_cor: "Branca",
            data_nascimento: "1994-08-18",
            escolaridade: "Superior Completo"
        }
    ];

    const defaultInteressados = [
        {
            id: 1,
            nome: "Pedro Oliveira",
            whatsapp: "(27) 96666-5555",
            email: "pedro@gmail.com",
            regiao: "São Pedro",
            perfil_curso: "tecnologia",
            status: "aguardando",
            enviado_em: null
        },
        {
            id: 2,
            nome: "Ana Rocha",
            whatsapp: "(27) 95555-4444",
            email: "ana.rocha@hotmail.com",
            regiao: "Jardim da Penha",
            perfil_curso: "gastronomia",
            status: "enviado",
            enviado_em: "2026-06-24T14:00:00.000Z"
        }
    ];

    // Helper functions to get/set LocalStorage items
    function getStored(key, defaultValue) {
        const item = localStorage.getItem(key);
        if (!item) {
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        }
        try {
            return JSON.parse(item);
        } catch {
            return defaultValue;
        }
    }

    function setStored(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Initialize databases in localStorage
    getStored("vix_cursos", initialCursos);
    getStored("vix_pre_inscricoes", defaultPreInscricoes);
    getStored("vix_interessados", defaultInteressados);
    getStored("vix_sugestoes", []);
    getStored("vix_configuracoes", { limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 });

    // -------------------------------------------------------------
    // 2. MOCK FETCH INTERCEPTOR
    // -------------------------------------------------------------

    const originalFetch = window.fetch;

    window.fetch = async function (resource, options) {
        let url = typeof resource === 'string' ? resource : resource.url;
        let method = (options && options.method || 'GET').toUpperCase();
        let body = null;
        if (options && options.body) {
            try {
                body = JSON.parse(options.body);
            } catch {
                body = options.body;
            }
        }

        // Clean query parameters from URL path
        const urlObj = new URL(url, window.location.origin);
        const path = urlObj.pathname;
        const queryParams = urlObj.searchParams;

        // Check if the route starts with any of our mocked endpoints
        const isMocked = path.startsWith('/api/') || 
                         path.startsWith('/public/') || 
                         path === '/cursos' || 
                         path.startsWith('/cursos/') || 
                         path === '/inscricao' || 
                         path.startsWith('/inscritos/') || 
                         path === '/chat';

        if (!isMocked) {
            return originalFetch(resource, options);
        }

        console.log(`[Mock API Interceptor] ${method} ${path}`, body);

        // Helper function to return JSON response
        const jsonResponse = (data, status = 200) => {
            return Promise.resolve({
                ok: status >= 200 && status < 300,
                status: status,
                statusText: status === 200 ? 'OK' : 'Error',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                json: () => Promise.resolve(data),
                text: () => Promise.resolve(JSON.stringify(data)),
                redirected: false,
                url: url
            });
        };

        // -------------------------------------------------------------
        // ADMIN AUTH ENDPOINTS
        // -------------------------------------------------------------

        // GET /api/admin/me
        if (path === '/api/admin/me') {
            const isLoggedIn = localStorage.getItem('vix_admin_logged_in') === 'true';
            if (isLoggedIn) {
                return jsonResponse({ username: "admin@vixcursos.com" });
            } else {
                return jsonResponse({ error: "Nao autorizado" }, 401);
            }
        }

        // POST /api/admin/login
        if (path === '/api/admin/login' && method === 'POST') {
            const { username, password } = body || {};
            if (username === 'admin@vixcursos.com' && password === 'admin123') {
                localStorage.setItem('vix_admin_logged_in', 'true');
                return jsonResponse({ success: true, token: "mock_token" });
            } else {
                return jsonResponse({ error: "Credenciais inválidas." }, 401);
            }
        }

        // POST /api/admin/logout
        if (path === '/api/admin/logout' || (path === '/api/admin/me' && method === 'DELETE')) {
            localStorage.removeItem('vix_admin_logged_in');
            return jsonResponse({ success: true });
        }

        // -------------------------------------------------------------
        // CONFIGURATIONS ENDPOINTS
        // -------------------------------------------------------------

        // GET /api/admin/configuracoes
        if (path === '/api/admin/configuracoes' && method === 'GET') {
            const config = getStored("vix_configuracoes", { limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 });
            return jsonResponse(config);
        }

        // PUT /api/admin/configuracoes
        if (path === '/api/admin/configuracoes' && method === 'PUT') {
            setStored("vix_configuracoes", body);
            return jsonResponse({ ok: true });
        }

        // -------------------------------------------------------------
        // STATS ENDPOINTS
        // -------------------------------------------------------------

        // GET /api/admin/stats
        if (path === '/api/admin/stats') {
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const leads = getStored("vix_interessados", defaultInteressados);

            const total = cur.length;
            const ativos = cur.filter(c => c.status === 'ativo').length;
            const inscritos = pre.length;
            const leadsCount = leads.length;

            return jsonResponse({ total, ativos, inscritos, leads: leadsCount });
        }

        // GET /api/admin/cursos-stats
        if (path === '/api/admin/cursos-stats') {
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);

            const stats = cur.map(c => {
                const inscritos = pre.filter(p => Number(p.curso_id) === Number(c.id) && p.status_inscricao === 'titular').length;
                const rest = Math.max(0, c.vagas_totais - inscritos);
                return {
                    nome: c.nome,
                    local: c.local,
                    inscritos: inscritos,
                    vagas_restantes: rest,
                    status: rest === 0 ? 'esgotado' : c.status
                };
            });

            return jsonResponse(stats);
        }

        // GET /api/estatisticas
        if (path === '/api/estatisticas') {
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);

            return jsonResponse({
                totalCursos: cur.length,
                totalPreInscritos: pre.length,
                totalMatriculasConfirmadas: pre.filter(p => p.matricula_confirmada === 1).length
            });
        }

        // -------------------------------------------------------------
        // STATIC FILTERS AND PUBLIC OPTIONS
        // -------------------------------------------------------------

        // GET /public/categoria
        if (path === '/public/categoria') {
            return jsonResponse(filtroCategorias);
        }

        // GET /public/local
        if (path === '/public/local') {
            return jsonResponse(filtroLocais);
        }

        // GET /public/idade
        if (path === '/public/idade') {
            return jsonResponse(filtroIdades);
        }

        // GET /public/curso
        if (path === '/public/curso') {
            return jsonResponse(filtroCursos);
        }

        // GET /public/modalidade
        if (path === '/public/modalidade') {
            const catId = queryParams.get('categoria_id');
            const defaultMods = [
                { id: 1, modalidade: "Presencial" },
                { id: 2, modalidade: "Híbrido" },
                { id: 3, modalidade: "Online" }
            ];

            if (catId) {
                // Return specific modes based on category
                const cat = filtroCategorias.find(c => Number(c.id) === Number(catId));
                const catName = cat ? cat.categoria.toLowerCase() : '';
                
                if (catName === 'beleza') {
                    return jsonResponse([{ id: 1, modalidade: "Barbeiro" }, { id: 2, modalidade: "Cuidador de Idoso" }]);
                } else if (catName === 'confecção') {
                    return jsonResponse([{ id: 3, modalidade: "Confecção Moda Praia" }, { id: 4, modalidade: "Técnicas de Costura e Acabamento" }]);
                } else if (catName === 'gastronomia') {
                    return jsonResponse([{ id: 5, modalidade: "Drinks para o Verão" }, { id: 6, modalidade: "Técnicas de Confeitaria Básica" }]);
                }
            }
            return jsonResponse(defaultMods);
        }

        // GET /api/faq
        if (path === '/api/faq') {
            return jsonResponse(defaultFaqs);
        }

        // -------------------------------------------------------------
        // CURSO MANAGEMENT ENDPOINTS
        // -------------------------------------------------------------

        // GET /cursos
        if (path === '/cursos' && method === 'GET') {
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);

            const result = cur.map(c => {
                const inscritos = pre.filter(p => Number(p.curso_id) === Number(c.id)).length;
                return {
                    id: c.id,
                    nome: c.nome,
                    vagas: Math.max(0, c.vagas_totais - inscritos),
                    vagas_totais: c.vagas_totais,
                    status: c.status,
                    data_inicio: c.data_inicio,
                    data_termino: c.data_termino,
                    horario_inicio: c.horario_inicio,
                    horario_termino: c.horario_termino,
                    local: c.local,
                    modalidade: c.modalidade
                };
            });

            return jsonResponse(result);
        }

        // POST /cursos
        if (path === '/cursos' && method === 'POST') {
            const cur = getStored("vix_cursos", initialCursos);
            const newCurso = {
                id: cur.reduce((max, c) => Math.max(max, c.id), 0) + 1,
                nome: body.curso || "Novo Curso",
                vagas_totais: Number(body.vagas || 20),
                vagas_disponiveis: Number(body.vagas || 20),
                status: "ativo",
                horario_inicio: body.horario_inicio || "08:00",
                horario_termino: body.horario_termino || "12:00",
                data_inicio: body.data_inicio ? body.data_inicio.split('-').reverse().join('/') : "01/07/2026",
                data_termino: body.data_termino ? body.data_termino.split('-').reverse().join('/') : "30/07/2026",
                categoria: "Geral",
                idade_min: body.idade_min || "14",
                idade_max: body.idade_max || "80",
                modalidade: body.modalidade || "Presencial",
                local: body.local || "Vitória",
                descricao: "Turma cadastrada via painel de administração.",
                competencias: "Habilidades técnicas gerais",
                pre_requisitos: `Idade entre ${body.idade_min || 14} e ${body.idade_max || 80} anos`,
                carga_horaria: 60,
                nivel_empregabilidade: "media",
                criado_em: new Date().toISOString(),
                acessos_contador: 0
            };
            cur.push(newCurso);
            setStored("vix_cursos", cur);
            return jsonResponse(newCurso);
        }

        // PUT /cursos/esgotar/:id
        if (path.startsWith('/cursos/esgotar/')) {
            const id = Number(path.split('/').pop());
            const cur = getStored("vix_cursos", initialCursos);
            const c = cur.find(item => Number(item.id) === id);
            if (c) {
                c.status = 'esgotado';
                c.vagas_disponiveis = 0;
                setStored("vix_cursos", cur);
                return jsonResponse({ ok: true });
            }
            return jsonResponse({ error: "Curso não encontrado" }, 404);
        }

        // GET /api/cursos-public
        if (path === '/api/cursos-public') {
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);

            const result = cur.map(c => {
                const inscritos = pre.filter(p => Number(p.curso_id) === Number(c.id) && p.status_inscricao === 'titular').length;
                return {
                    ...c,
                    vagas: Math.max(0, c.vagas_totais - inscritos),
                    vagas_disponiveis: Math.max(0, c.vagas_totais - inscritos),
                    inscritos: inscritos
                };
            });

            return jsonResponse(result);
        }

        // GET /api/cursos-public/:id
        if (path.startsWith('/api/cursos-public/') && !path.endsWith('/vagas')) {
            const id = Number(path.split('/').pop());
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const c = cur.find(item => Number(item.id) === id);
            if (c) {
                const inscritos = pre.filter(p => Number(p.curso_id) === Number(c.id) && p.status_inscricao === 'titular').length;
                return jsonResponse({
                    ...c,
                    vagas: Math.max(0, c.vagas_totais - inscritos),
                    vagas_disponiveis: Math.max(0, c.vagas_totais - inscritos),
                    inscritos: inscritos
                });
            }
            return jsonResponse({ error: "Curso não encontrado" }, 404);
        }

        // GET /api/cursos-public/:id/vagas
        if (path.startsWith('/api/cursos-public/') && path.endsWith('/vagas')) {
            const parts = path.split('/');
            const id = Number(parts[parts.length - 2]);
            const cur = getStored("vix_cursos", initialCursos);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const c = cur.find(item => Number(item.id) === id);
            if (c) {
                const inscritos = pre.filter(p => Number(p.curso_id) === Number(c.id) && p.status_inscricao === 'titular').length;
                return jsonResponse({ vagas: Math.max(0, c.vagas_totais - inscritos) });
            }
            return jsonResponse({ vagas: 0 });
        }

        // -------------------------------------------------------------
        // PRE-INSCRICAO / REGISTRATION MANAGEMENT ENDPOINTS
        // -------------------------------------------------------------

        // GET /api/pre-inscricoes/por-cpf/:cpf
        if (path.startsWith('/api/pre-inscricoes/por-cpf/')) {
            const cpf = decodeURIComponent(path.split('/').pop());
            const cleanCpf = cpf.replace(/\D/g, '');
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const cur = getStored("vix_cursos", initialCursos);

            const result = pre
                .filter(p => p.cpf.replace(/\D/g, '') === cleanCpf)
                .map(p => {
                    const c = cur.find(item => Number(item.id) === Number(p.curso_id));
                    return {
                        ...p,
                        curso_nome: c ? c.nome : "Curso",
                        local_nome: c ? c.local : "Vitória",
                        data_inicio_formatada: c ? c.data_inicio : ""
                    };
                });

            return jsonResponse(result);
        }

        // POST /inscricao
        if (path === '/inscricao' && method === 'POST') {
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const cur = getStored("vix_cursos", initialCursos);
            const config = getStored("vix_configuracoes", { limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 });

            const { curso_id, cpf, nome, rg, telefone, bairro } = body || {};
            const cleanCpf = cpf.replace(/\D/g, '');

            // 1. Check if course exists
            const c = cur.find(item => Number(item.id) === Number(curso_id));
            if (!c) {
                return jsonResponse({ error: "Curso inexistente." }, 400);
            }

            // 2. Check if student already registered in this course
            const duplicate = pre.find(p => Number(p.curso_id) === Number(curso_id) && p.cpf.replace(/\D/g, '') === cleanCpf);
            if (duplicate) {
                return jsonResponse({ error: "Você já está cadastrado nesta turma." }, 400);
            }

            // 3. Count total active inscriptions for this CPF this semester
            const studentCount = pre.filter(p => p.cpf.replace(/\D/g, '') === cleanCpf).length;
            if (studentCount >= config.limite_inscricoes_semestre) {
                return jsonResponse({ error: `Você excedeu o limite máximo de ${config.limite_inscricoes_semestre} inscrições por semestre.` }, 400);
            }

            // 4. Determine status (titular or suplente)
            const titulares = pre.filter(p => Number(p.curso_id) === Number(curso_id) && p.status_inscricao === 'titular').length;
            const status_inscricao = (titulares < c.vagas_totais) ? 'titular' : 'suplente';

            // Generate fake protocol
            const protocolo = "PRT-" + Math.floor(Math.random() * 900000 + 100000);

            const newInscricao = {
                id: pre.reduce((max, p) => Math.max(max, p.id), 0) + 1,
                curso_id: Number(curso_id),
                nome: nome,
                cpf: cpf,
                rg: rg,
                telefone: telefone,
                bairro: bairro || "Não informado",
                possui_necessidade_especial: body.possui_necessidade_especial || "Não",
                tipo_necessidade_especial: body.tipo_necessidade_especial || "",
                status_inscricao: status_inscricao,
                matricula_confirmada: 0,
                matricula_confirmada_em: null,
                criado_em: new Date().toISOString(),
                situacao_final: "inscrito",
                email: body.email || "",
                genero: body.genero || "Não informado",
                raca_cor: body.raca_cor || "Não informado",
                data_nascimento: body.data_nascimento || null,
                escolaridade: body.escolaridade || "Ensino Médio Completo",
                protocolo: protocolo,
                notificacoes: { canal: 'sms' }
            };

            pre.push(newInscricao);
            setStored("vix_pre_inscricoes", pre);

            return jsonResponse({
                success: true,
                protocolo: protocolo,
                status_inscricao: status_inscricao,
                notificacoes: { canal: 'sms' }
            });
        }

        // GET /inscritos/:idCurso
        if (path.startsWith('/inscritos/')) {
            const idCurso = Number(path.split('/').pop());
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const filtered = pre.filter(p => Number(p.curso_id) === idCurso);
            return jsonResponse(filtered);
        }

        // GET /api/admin/aluno/completo/:cpf
        if (path.startsWith('/api/admin/aluno/completo/')) {
            const cpf = decodeURIComponent(path.split('/').pop());
            const cleanCpf = cpf.replace(/\D/g, '');
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const cur = getStored("vix_cursos", initialCursos);

            const aluno = pre.find(p => p.cpf.replace(/\D/g, '') === cleanCpf);
            if (!aluno) {
                return jsonResponse({ error: "Aluno não encontrado." }, 404);
            }

            const historico = pre
                .filter(p => p.cpf.replace(/\D/g, '') === cleanCpf)
                .map(p => {
                    const c = cur.find(item => Number(item.id) === Number(p.curso_id));
                    return {
                        id: p.id,
                        curso_nome: c ? c.nome : "Curso",
                        status: p.status_inscricao,
                        matricula_confirmada: p.matricula_confirmada
                    };
                });

            return jsonResponse({ aluno, historico });
        }

        // DELETE /api/inscricoes/:idAluno
        if (path.startsWith('/api/inscricoes/') && method === 'DELETE') {
            const idAluno = Number(path.split('/').pop());
            let pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            pre = pre.filter(p => Number(p.id) !== idAluno);
            setStored("vix_pre_inscricoes", pre);
            return jsonResponse({ success: true });
        }

        // PUT /api/inscricoes/:idAluno/confirmar
        if (path.startsWith('/api/inscricoes/') && path.endsWith('/confirmar') && method === 'PUT') {
            const parts = path.split('/');
            const idAluno = Number(parts[parts.length - 2]);
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);
            const p = pre.find(item => Number(item.id) === idAluno);
            if (p) {
                p.matricula_confirmada = 1;
                p.matricula_confirmada_em = new Date().toISOString();
                setStored("vix_pre_inscricoes", pre);
                return jsonResponse({ success: true });
            }
            return jsonResponse({ error: "Inscrição não encontrada" }, 404);
        }

        // -------------------------------------------------------------
        // INTERESTED LEADS ENDPOINTS
        // -------------------------------------------------------------

        // GET /api/interessados
        if (path === '/api/interessados' && method === 'GET') {
            const leads = getStored("vix_interessados", defaultInteressados);
            return jsonResponse(leads);
        }

        // POST /api/interessados
        if (path === '/api/interessados' && method === 'POST') {
            const leads = getStored("vix_interessados", defaultInteressados);
            const newLead = {
                id: leads.reduce((max, l) => Math.max(max, l.id), 0) + 1,
                nome: body.nome || "Lead",
                whatsapp: body.whatsapp || "",
                email: body.email || "",
                regiao: body.regiao || "Outra",
                perfil_curso: body.perfil_curso || "Tecnologia",
                status: "aguardando",
                enviado_em: null
            };
            leads.push(newLead);
            setStored("vix_interessados", leads);
            return jsonResponse({ success: true, id: newLead.id });
        }

        // -------------------------------------------------------------
        // CHATBOT & SUGGESTIONS ENDPOINTS
        // -------------------------------------------------------------

        // POST /api/pre-inscricoes/sugestoes
        if (path === '/api/pre-inscricoes/sugestoes' && method === 'POST') {
            const sug = getStored("vix_sugestoes", []);
            const newSug = {
                id: sug.length + 1,
                cpf: body.cpf || "",
                areas_interesse: body.areas_interesse || "",
                sugestao_texto: body.sugestao_texto || "",
                criado_em: new Date().toISOString()
            };
            sug.push(newSug);
            setStored("vix_sugestoes", sug);
            return jsonResponse({ success: true });
        }

        // POST /chat
        if (path === '/chat' && method === 'POST') {
            const message = (body.message || '').toLowerCase();
            let reply = "Olá! Sou o Vitoruga, assistente virtual do VixCursos. Como posso ajudar você hoje?";

            if (message.includes('curso') || message.includes('turma') || message.includes('vaga')) {
                reply = "Temos excelentes turmas abertas em áreas como Tecnologia (Lógica de Programação), Gastronomia, Beleza (Cabeleireiro) e confecção. Você pode conferir os detalhes na página principal e fazer sua pré-inscrição em poucos minutos!";
            } else if (message.includes('limite') || message.includes('inscri')) {
                reply = "Você pode fazer até 4 inscrições por semestre. A partir da 3ª inscrição simultânea, ela entra na lista de espera (suplente) para dar chances a outros cidadãos.";
            } else if (message.includes('paga') || message.includes('gratis') || message.includes('gratuito')) {
                reply = "Sim! Todos os cursos do VixCursos são 100% gratuitos e contam com vale-transporte para os dias de aula.";
            } else if (message.includes('documento') || message.includes('requisito')) {
                reply = "Para a matrícula, você precisa de RG, CPF, Comprovante de Residência em Vitória e comprovante de escolaridade conforme exigido pelo curso.";
            } else if (message.includes('obrigado') || message.includes('vlw') || message.includes('valeu')) {
                reply = "De nada! Se tiver mais dúvidas, é só chamar. Bons estudos!";
            }

            return jsonResponse({ reply: reply });
        }

        // -------------------------------------------------------------
        // REPORT STATISTICS ENDPOINT
        // -------------------------------------------------------------

        // GET /api/admin/relatorios-stats
        if (path === '/api/admin/relatorios-stats') {
            const pre = getStored("vix_pre_inscricoes", defaultPreInscricoes);

            // Filter logic can be applied if query params exist
            const cursoId = queryParams.get('curso_id');
            const genero = queryParams.get('genero');
            const raca = queryParams.get('raca_cor');
            const bairro = queryParams.get('bairro');

            let filtered = pre;
            if (cursoId) filtered = filtered.filter(p => Number(p.curso_id) === Number(cursoId));
            if (genero) filtered = filtered.filter(p => p.genero === genero);
            if (raca) filtered = filtered.filter(p => p.raca_cor === raca);
            if (bairro) filtered = filtered.filter(p => p.bairro.toLowerCase().includes(bairro.toLowerCase()));

            const total = filtered.length;
            const concluidos = filtered.filter(p => p.situacao_final === 'concluido').length;
            const evadidos = filtered.filter(p => p.situacao_final === 'evadido').length;
            
            // Calculate media satisfaction
            const rated = filtered.filter(p => typeof p.nota_satisfacao_geral === 'number');
            const sumSatisfacao = rated.reduce((sum, p) => sum + p.nota_satisfacao_geral, 0);
            const media = rated.length > 0 ? sumSatisfacao / rated.length : 4.8; // default beautiful mock fallback

            // Genero stats
            const genMap = {};
            filtered.forEach(p => { genMap[p.genero] = (genMap[p.genero] || 0) + 1; });
            const generoStats = Object.keys(genMap).map(k => ({ label: k, total: genMap[k] }));
            if (generoStats.length === 0) {
                generoStats.push({ label: 'Feminino', total: 0 }, { label: 'Masculino', total: 0 });
            }

            // Faixa etaria stats
            const faixas = { 'Sub-18': 0, '18-29': 0, '30-49': 0, '50+': 0 };
            filtered.forEach(p => {
                const birth = p.data_nascimento ? new Date(p.data_nascimento) : null;
                if (!birth) {
                    faixas['18-29']++;
                    return;
                }
                const age = new Date().getFullYear() - birth.getFullYear();
                if (age < 18) faixas['Sub-18']++;
                else if (age < 30) faixas['18-29']++;
                else if (age < 50) faixas['30-49']++;
                else faixas['50+']++;
            });
            const faixaStats = Object.keys(faixas).map(k => ({ label: k, total: faixas[k] }));

            // Raca stats
            const racaMap = {};
            filtered.forEach(p => { racaMap[p.raca_cor] = (racaMap[p.raca_cor] || 0) + 1; });
            const racaStats = Object.keys(racaMap).map(k => ({ label: k, total: racaMap[k] }));

            // Escolaridade stats
            const escMap = {};
            filtered.forEach(p => { escMap[p.escolaridade] = (escMap[p.escolaridade] || 0) + 1; });
            const escolaridadeStats = Object.keys(escMap).map(k => ({ label: k, total: escMap[k] }));

            // Deficiencia stats
            const defMap = { 'Sim': 0, 'Não': 0 };
            filtered.forEach(p => {
                if (p.possui_necessidade_especial === 'Sim') defMap['Sim']++;
                else defMap['Não']++;
            });
            const deficienciaStats = Object.keys(defMap).map(k => ({ label: k, total: defMap[k] }));

            // Bairro stats
            const bMap = {};
            filtered.forEach(p => { bMap[p.bairro] = (bMap[p.bairro] || 0) + 1; });
            const bairroStats = Object.keys(bMap).map(k => ({ label: k, total: bMap[k] })).sort((a,b) => b.total - a.total);

            // Objetivo stats
            const objMap = { 'Qualificação': 3, 'Inserção no Mercado': 2, 'Empreendedorismo': 1 };
            const objetivoStats = Object.keys(objMap).map(k => ({ label: k, total: objMap[k] }));

            return jsonResponse({
                kpis: { total, concluidos, evadidos, satisfacao_media: media },
                genero: generoStats,
                faixa_etaria: faixaStats,
                raca_cor: racaStats,
                escolaridade: escolaridadeStats,
                deficiencia: deficienciaStats,
                objetivo: objetivoStats,
                bairro: bairroStats
            });
        }

        // Catch-all mock fallback
        return jsonResponse({});
    };

})();
