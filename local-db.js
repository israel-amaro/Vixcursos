const filtroCursos = [
    "Administração",
    "Artesanato",
    "AUTOMAÇÃO INDUSTRIAL",
    "Beleza",
    "Cinema",
    "Comércio / Gestão Empresarial",
    "Confecção",
    "Construção Civil / Serviço",
    "Cultura",
    "Dança",
    "Dança e Teatro",
    "Educação",
    "Eletrônica",
    "Eletricista / Energia",
    "Enfermagem / Saúde",
    "Estética",
    "Eventos",
    "Fotografia",
    "Gastronomia",
    "Gestão",
    "Idiomas",
    "Informática / Tecnologia",
    "Logística",
    "Manutenção",
    "Mecânica",
    "Meio Ambiente",
    "Moda",
    "Música",
    "Panificação / Confeitaria",
    "Produção Cultural",
    "Programação / TI",
    "Recursos Humanos",
    "Redes / Telecom",
    "Segurança do Trabalho",
    "Serviço Social",
    "Soldagem",
    "Turismo / Hotelaria",
    "Vendas / Marketing"
].map((curso, index) => ({ id: index + 1, curso }));

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
    "Carreta de Eletricidade (Local itinerante - consultar curso específico)",
    "Carreta de Informática (Local itinerante - consultar curso específico)",
    "Carreta de Refrigeração e Climatização (Local itinerante - consultar curso específico)",
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

const initialCursos = [
    {
        id: 1,
        curso_id: 4,
        vagas: 20,
        vagas_pcd: 2,
        status: "ativo",
        categoria_id: 4,
        modalidade_id: 1,
        local_id: 12,
        idade_min: 16,
        idade_max: 80,
        data_inicio: "2026-07-01",
        data_termino: "2026-08-15",
        horario_inicio: "13:30:00",
        horario_termino: "17:30:00",
        descricao: "Curso de técnicas de cabeleireiro profissional, cortes modernos, escovação e tratamento de fios.",
        competencias: "Corte feminino, hidratação avançada, técnicas de colorimetria básica",
        pre_requisitos: "Ensino Fundamental completo e idade mínima de 16 anos",
        carga_horaria: 80,
        nivel_empregabilidade: "alta",
        video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        faixa_salarial_min: 1500,
        faixa_salarial_max: 3500,
        criado_em: "2026-06-24T00:00:00.000Z",
        acessos_contador: 0
    },
    {
        id: 2,
        curso_id: 7,
        vagas: 15,
        vagas_pcd: 1,
        status: "ativo",
        categoria_id: 27,
        modalidade_id: 1,
        local_id: 26,
        idade_min: 16,
        idade_max: 80,
        data_inicio: "2026-07-05",
        data_termino: "2026-09-10",
        horario_inicio: "08:00:00",
        horario_termino: "12:00:00",
        descricao: "Aprenda corte, costura básica e avançada, modelagem de roupas e confecção de peças completas.",
        competencias: "Modelagem plana, costura industrial, acabamento fino e regulagem de máquinas",
        pre_requisitos: "Ensino Fundamental completo e idade mínima de 16 anos",
        carga_horaria: 120,
        nivel_empregabilidade: "media",
        video_url: null,
        faixa_salarial_min: 1800,
        faixa_salarial_max: 4000,
        criado_em: "2026-06-24T00:00:00.000Z",
        acessos_contador: 0
    },
    {
        id: 3,
        curso_id: 19,
        vagas: 18,
        vagas_pcd: 2,
        status: "ativo",
        categoria_id: 19,
        modalidade_id: 1,
        local_id: 12,
        idade_min: 18,
        idade_max: 80,
        data_inicio: "2026-07-10",
        data_termino: "2026-08-30",
        horario_inicio: "18:30:00",
        horario_termino: "22:30:00",
        descricao: "Introdução às artes culinárias, técnicas de corte de legumes, manipulação de carnes e preparo de molhos clássicos.",
        competencias: "Técnicas de facas, preparo de massas frescas, molhos e sobremesas finas",
        pre_requisitos: "Ensino Médio completo e idade mínima de 18 anos",
        carga_horaria: 100,
        nivel_empregabilidade: "alta",
        video_url: null,
        faixa_salarial_min: 1600,
        faixa_salarial_max: 3800,
        criado_em: "2026-06-24T00:00:00.000Z",
        acessos_contador: 0
    },
    {
        id: 4,
        curso_id: 22,
        vagas: 25,
        vagas_pcd: 3,
        status: "ativo",
        categoria_id: 22,
        modalidade_id: 2,
        local_id: 26,
        idade_min: 14,
        idade_max: 80,
        data_inicio: "2026-07-02",
        data_termino: "2026-08-20",
        horario_inicio: "14:00:00",
        horario_termino: "17:00:00",
        descricao: "Curso de lógica de programação, banco de dados básico e desenvolvimento de sistemas web simples.",
        competencias: "Lógica de programação com Javascript, fundamentos de bancos de dados relacionais, HTML5 e CSS3",
        pre_requisitos: "Ensino Fundamental II completo e idade mínima de 14 anos",
        carga_horaria: 60,
        nivel_empregabilidade: "alta",
        video_url: null,
        faixa_salarial_min: 2200,
        faixa_salarial_max: 6000,
        criado_em: "2026-06-24T00:00:00.000Z",
        acessos_contador: 0
    },
    {
        id: 5,
        curso_id: 15,
        vagas: 30,
        vagas_pcd: 3,
        status: "ativo",
        categoria_id: 15,
        modalidade_id: 1,
        local_id: 13,
        idade_min: 18,
        idade_max: 80,
        data_inicio: "2026-07-12",
        data_termino: "2026-09-30",
        horario_inicio: "08:00:00",
        horario_termino: "12:00:00",
        descricao: "Capacitação em atendimento de primeiros socorros em situações de emergência doméstica e profissional.",
        competencias: "Reanimação cardiopulmonar, curativos emergenciais, transporte seguro de vítimas",
        pre_requisitos: "Ensino Fundamental completo e idade mínima de 18 anos",
        carga_horaria: 40,
        nivel_empregabilidade: "media",
        video_url: null,
        faixa_salarial_min: 1400,
        faixa_salarial_max: 2500,
        criado_em: "2026-06-24T00:00:00.000Z",
        acessos_contador: 0
    }
];

const defaultFaqs = [
    {
        pergunta: "Quem pode se inscrever?",
        resposta: "Os cursos do VixCursos são destinados exclusivamente a moradores de Vitória - ES que atendam aos pré-requisitos de idade e escolaridade do curso pretendido.",
        ordem: 0
    },
    {
        pergunta: "Como funciona a confirmação de matrícula?",
        resposta: "Após a pré-inscrição online, o aluno titular recebe uma notificação por e-mail/SMS com prazo de 24h ou 48h para confirmar sua matrícula. Caso não confirme, a vaga é liberada para o próximo suplente.",
        ordem: 1
    },
    {
        pergunta: "O que acontece se eu for suplente?",
        resposta: "Caso as vagas imediatas estejam preenchidas, você entrará na fila de suplência automática. Se um candidato titular desistir ou não confirmar a matrícula no prazo, o próximo suplente da fila é convocado por e-mail/SMS.",
        ordem: 2
    },
    {
        pergunta: "Qual o limite de cursos por semestre?",
        resposta: "Cada cidadão pode se inscrever em até 4 cursos por semestre. A partir da 3ª inscrição simultânea, a inscrição entra automaticamente como suplente para dar oportunidade a outros moradores.",
        ordem: 3
    },
    {
        pergunta: "Os cursos são realmente gratuitos?",
        resposta: "Sim, todos os cursos oferecidos pelo portal VixCursos são 100% gratuitos e contam com fornecimento de vale-transporte.",
        ordem: 4
    },
    {
        pergunta: "Menores de 18 anos podem se inscrever?",
        resposta: "Sim, desde que atendam a idade mínima do curso. No momento da inscrição, deverão ser informados os dados do responsável legal, que deverá autorizar a participação.",
        ordem: 5
    }
].map((faq, index) => ({ id: index + 1, ...faq }));

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function normalizeSql(sql) {
    return String(sql || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function toDateBr(value) {
    if (!value) return null;
    const [year, month, day] = String(value).slice(0, 10).split("-");
    if (!year || !month || !day) return value;
    return `${day}/${month}/${year}`;
}

function toDateTimeBr(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pt-BR");
}

function toTime(value) {
    if (!value) return null;
    return String(value).slice(0, 5);
}

function createLocalState() {
    return {
        cursos: clone(initialCursos),
        preInscricoes: [],
        interessados: [],
        sugestoes: [],
        faq: clone(defaultFaqs),
        configuracoes: [{ id: 1, limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 }]
    };
}

function createLocalDb() {
    const state = createLocalState();

    const nextId = (rows) => rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
    const cursoNome = (id) => filtroCursos.find((item) => item.id === Number(id))?.curso || "Curso";
    const categoriaNome = (id) => filtroCategorias.find((item) => item.id === Number(id))?.categoria || "Geral";
    const modalidadeNome = (id) => filtroModalidades.find((item) => item.id === Number(id))?.modalidade || "Não informada";
    const localNome = (id) => filtroLocais.find((item) => item.id === Number(id))?.local || "Vitória";

    const titularesCurso = (cursoId) => state.preInscricoes.filter((item) => Number(item.curso_id) === Number(cursoId) && item.status_inscricao === "titular").length;
    const publicCourse = (curso) => {
        const inscritos = titularesCurso(curso.id);
        const vagasDisponiveis = Math.max(0, Number(curso.vagas || 0) - inscritos);
        return {
            id: curso.id,
            nome: cursoNome(curso.curso_id),
            vagas_totais: Number(curso.vagas || 0),
            inscritos,
            vagas_disponiveis: vagasDisponiveis,
            vagas: vagasDisponiveis,
            status: curso.status || "ativo",
            horario_inicio: toTime(curso.horario_inicio),
            horario_termino: toTime(curso.horario_termino),
            data_inicio: toDateBr(curso.data_inicio),
            data_termino: toDateBr(curso.data_termino),
            categoria: categoriaNome(curso.categoria_id),
            idade_min: String(curso.idade_min ?? "-"),
            idade_max: String(curso.idade_max ?? "-"),
            modalidade: modalidadeNome(curso.modalidade_id),
            local: localNome(curso.local_id),
            descricao: curso.descricao,
            competencias: curso.competencias,
            pre_requisitos: curso.pre_requisitos,
            carga_horaria: curso.carga_horaria,
            nivel_empregabilidade: curso.nivel_empregabilidade,
            video_url: curso.video_url,
            faixa_salarial_min: curso.faixa_salarial_min,
            faixa_salarial_max: curso.faixa_salarial_max,
            acessos_contador: curso.acessos_contador || 0,
            data_publicacao: curso.data_publicacao || curso.publicado_em || null,
            data_abertura_inscricao: curso.data_abertura_inscricao || curso.inscricoes_abertas_em || null,
            data_encerramento_inscricao: curso.data_encerramento_inscricao || curso.inscricoes_fecham_em || null,
            criado_em: curso.criado_em
        };
    };

    const adminCourse = (curso) => {
        const base = publicCourse(curso);
        return {
            ...base,
            vagas: base.vagas_disponiveis
        };
    };

    const historicoAluno = (cpf) => state.preInscricoes
        .filter((item) => item.cpf === cpf)
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .map((item) => ({
            ...clone(item),
            curso_nome: cursoNome(state.cursos.find((curso) => curso.id === Number(item.curso_id))?.curso_id),
            local_nome: localNome(state.cursos.find((curso) => curso.id === Number(item.curso_id))?.local_id)
        }));

    const query = async (sql, values = []) => {
        const rawSql = String(sql || "");
        const s = normalizeSql(rawSql);

        if (!s || s.startsWith("create table") || s.startsWith("alter table") || s.startsWith("create index") || s.startsWith("create unique index")) {
            return [[], []];
        }

        if (s.includes("information_schema.columns") || s.includes("from pg_indexes")) {
            return [[{ total: 1 }], []];
        }

        if (s.includes("from configuracoes")) {
            if (s.startsWith("select count")) return [[{ total: state.configuracoes.length }], []];
            if (s.startsWith("select")) return [clone(state.configuracoes), []];
        }
        if (s.startsWith("insert into configuracoes")) {
            if (!state.configuracoes.length) state.configuracoes.push({ id: 1, limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 });
            return [[], []];
        }
        if (s.startsWith("update configuracoes")) {
            state.configuracoes[0] = {
                ...(state.configuracoes[0] || { id: 1 }),
                limite_inscricoes_semestre: Number(values[0]),
                prazo_confirmacao_horas: Number(values[1])
            };
            return [[], []];
        }

        if (s.includes("from filtro_idade")) return [clone(filtroIdades), []];
        if (s.includes("from filtro_curso")) {
            if (s.includes("where")) {
                const termo = String(values[0] || "");
                return [clone(filtroCursos.filter((item) => item.curso === termo || Number(item.id) === Number(termo))), []];
            }
            return [clone(filtroCursos), []];
        }
        if (s.includes("from filtro_categoria")) {
            if (s.includes("where")) {
                const termo = String(values[0] || "");
                return [clone(filtroCategorias.filter((item) => item.categoria === termo || Number(item.id) === Number(termo))), []];
            }
            return [clone(filtroCategorias), []];
        }
        if (s.includes("from filtro_modalidade")) {
            if (s.includes("where modalidade")) {
                const termo = String(values[0] || "");
                return [clone(filtroModalidades.filter((item) => item.modalidade === termo || Number(item.id) === Number(termo))), []];
            }
            return [clone(filtroModalidades), []];
        }
        if (s.includes("from filtro_local")) return [clone(filtroLocais), []];
        if (s.startsWith("insert into filtro_") || s.startsWith("update filtro_")) return [[], []];

        if (s.includes("from faq")) {
            if (s.startsWith("select count")) return [[{ total: state.faq.length }], []];
            if (s.startsWith("select")) return [clone(state.faq).sort((a, b) => (a.ordem - b.ordem) || (a.id - b.id)), []];
        }
        if (s.startsWith("insert into faq")) {
            const row = { id: nextId(state.faq), pergunta: values[0], resposta: values[1], ordem: Number(values[2] || 0) };
            state.faq.push(row);
            return [[{ id: row.id }], []];
        }
        if (s.startsWith("update faq")) {
            const row = state.faq.find((item) => Number(item.id) === Number(values[3]));
            if (row) Object.assign(row, { pergunta: values[0], resposta: values[1], ordem: Number(values[2] || 0) });
            return [[], []];
        }
        if (s.startsWith("delete from faq")) {
            state.faq = state.faq.filter((item) => Number(item.id) !== Number(values[0]));
            return [[], []];
        }

        if (s.startsWith("insert into cursos")) {
            const row = {
                id: nextId(state.cursos),
                curso_id: Number(values[0]),
                vagas: Number(values[1] || 0),
                vagas_pcd: 0,
                status: "ativo",
                idade_min: values[2] ? Number(values[2]) : null,
                idade_max: values[3] ? Number(values[3]) : null,
                local_id: values[4] ? Number(values[4]) : null,
                modalidade_id: values[5] ? Number(values[5]) : null,
                data_inicio: values[6] || null,
                data_termino: values[7] || null,
                horario_inicio: values[8] || null,
                horario_termino: values[9] || null,
                categoria_id: values[10] ? Number(values[10]) : Number(values[0]) || null,
                criado_em: new Date().toISOString(),
                acessos_contador: 0
            };
            state.cursos.push(row);
            return [[{ id: row.id }], []];
        }

        if (s.startsWith("select id from cursos where id")) {
            return [clone(state.cursos.filter((curso) => Number(curso.id) === Number(values[0])).map(({ id }) => ({ id }))), []];
        }
        if (s.startsWith("delete from cursos")) {
            const id = Number(values[0]);
            state.cursos = state.cursos.filter((curso) => Number(curso.id) !== id);
            state.preInscricoes = state.preInscricoes.filter((item) => Number(item.curso_id) !== id);
            return [[], []];
        }
        if (s.startsWith("update cursos set status")) {
            const curso = state.cursos.find((item) => Number(item.id) === Number(values[0] ?? values[1]));
            if (curso) curso.status = values.length > 1 ? values[0] : "esgotado";
            return [[], []];
        }
        if (s.startsWith("update cursos set vagas = vagas + 1")) {
            const curso = state.cursos.find((item) => Number(item.id) === Number(values[0]));
            if (curso) {
                curso.vagas += 1;
                curso.status = "ativo";
            }
            return [[], []];
        }
        if (s.startsWith("update cursos set acessos_contador")) {
            const curso = state.cursos.find((item) => Number(item.id) === Number(values[0]));
            if (curso) curso.acessos_contador = Number(curso.acessos_contador || 0) + 1;
            return [[], []];
        }

        if (s.includes("select f.curso, l.local, cat.categoria")) {
            const curso = state.cursos.find((item) => Number(item.id) === Number(values[0]));
            return [curso ? [{
                curso: cursoNome(curso.curso_id),
                local: localNome(curso.local_id),
                categoria: categoriaNome(curso.categoria_id),
                data_inicio: toDateBr(curso.data_inicio),
                data_termino: toDateBr(curso.data_termino),
                horario_inicio: toTime(curso.horario_inicio),
                horario_termino: toTime(curso.horario_termino)
            }] : [], []];
        }

        if (s.includes("from cursos c") && s.includes("count(pi.id)") && s.includes("group by c.id")) {
            const id = values[0] ? Number(values[0]) : null;
            const rows = state.cursos
                .filter((curso) => !id || Number(curso.id) === id)
                .map((curso) => {
                    const base = publicCourse(curso);
                    return {
                        vagas_totais: base.vagas_totais,
                        inscritos: base.inscritos,
                        vagas_disponiveis: base.vagas_disponiveis,
                        status: base.status
                    };
                });
            return [rows, []];
        }

        if (s.includes("from cursos c") && s.includes("left join pre_inscricoes pi")) {
            const id = s.includes("where c.id") ? Number(values[0]) : null;
            let rows = state.cursos.map(publicCourse);
            if (id) rows = rows.filter((curso) => Number(curso.id) === id);
            if (s.includes("where c.status = 'ativo'")) rows = rows.filter((curso) => curso.status === "ativo");
            return [clone(rows).sort((a, b) => b.id - a.id), []];
        }

        if (s.includes("from cursos c") && s.includes("left join filtro_curso")) {
            const id = values.length ? Number(values[0]) : null;
            const rows = state.cursos
                .filter((curso) => !id || Number(curso.id) === id)
                .map(adminCourse)
                .sort((a, b) => b.id - a.id);
            return [clone(rows), []];
        }

        if (s.includes("select sum(vagas) as total") || s.includes("select sum(vagas) as totais")) {
            const total = state.cursos.filter((curso) => curso.status === "ativo").reduce((sum, curso) => sum + Number(curso.vagas || 0), 0);
            return [[{ total, totais: total }], []];
        }
        if (s.includes("select count(*) as total from cursos")) return [[{ total: state.cursos.length }], []];
        if (s.includes("select count(*) as ativos from cursos")) return [[{ ativos: state.cursos.filter((curso) => curso.status === "ativo").length }], []];
        if (s.includes("select count(*) as inscritos from pre_inscricoes")) return [[{ inscritos: state.preInscricoes.length }], []];
        if (s.includes("select count(*) as leads from interessados")) return [[{ leads: state.interessados.filter((lead) => lead.status === "aguardando").length }], []];

        if (s.includes("from pre_inscricoes") && s.includes("where curso_id =") && s.includes("and cpf")) {
            return [clone(state.preInscricoes.filter((item) => Number(item.curso_id) === Number(values[0]) && item.cpf === values[1]).map(({ id }) => ({ id }))), []];
        }
        if (s.includes("select count(*)") && s.includes("from pre_inscricoes") && s.includes("where cpf =")) {
            const total = state.preInscricoes.filter((item) => item.cpf === values[0]).length;
            return [[{ total }], []];
        }
        if (s.includes("select count(*) as total from pre_inscricoes where curso_id")) {
            const total = state.preInscricoes.filter((item) => Number(item.curso_id) === Number(values[0]) && item.status_inscricao === "titular").length;
            return [[{ total }], []];
        }
        if (s.includes("select count(id) as preenchidas from pre_inscricoes")) {
            return [[{ preenchidas: state.preInscricoes.length }], []];
        }

        if (s.startsWith("insert into pre_inscricoes")) {
            const row = {
                id: nextId(state.preInscricoes),
                nome: values[0],
                email: values[1],
                telefone: values[2],
                cpf: values[3],
                rg: values[4],
                curso_id: Number(values[5]),
                mora_vitoria: values[6],
                escolaridade: values[7],
                cep: values[8],
                numero: values[9],
                rua: values[10],
                bairro: values[11],
                municipio: values[12],
                possui_necessidade_especial: values[13],
                tipo_necessidade_especial: values[14],
                cpf_documento: values[15],
                rg_documento: values[16],
                data_nascimento: values[17],
                genero: values[18],
                raca_cor: values[19],
                telefone_alternativo: values[20],
                responsavel_nome: values[21],
                responsavel_cpf: values[22],
                responsavel_parentesco: values[23],
                responsavel_telefone: values[24],
                responsavel_email: values[25],
                responsavel_autorizacao: values[26],
                deficiencia_adaptacoes: values[27],
                deficiencia_recursos: values[28],
                objetivo: values[29],
                autoriza_lgpd: values[30],
                status_inscricao: values[31],
                matricula_confirmada: 0,
                matricula_confirmada_em: null,
                situacao_final: "inscrito",
                criado_em: new Date().toISOString(),
                convocado_em: values[31] === "titular" ? new Date().toISOString() : null,
                vaga_expira_em: values[31] === "titular" ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null
            };
            state.preInscricoes.push(row);
            return [[{ id: row.id }], []];
        }

        if (s.includes("from pre_inscricoes") && s.includes("where cpf =")) {
            const cpf = values[0];
            const rows = historicoAluno(cpf);
            if (s.includes("limit 1")) return [rows.slice(0, 1), []];
            return [rows, []];
        }
        if (s.includes("from pre_inscricoes") && s.includes("where curso_id =")) {
            return [clone(state.preInscricoes.filter((item) => Number(item.curso_id) === Number(values[0])).sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em)).map((item) => ({ ...item, data: item.criado_em }))), []];
        }
        if (s.includes("select curso_id from pre_inscricoes where id")) {
            return [clone(state.preInscricoes.filter((item) => Number(item.id) === Number(values[0])).map(({ curso_id }) => ({ curso_id }))), []];
        }
        if (s.startsWith("delete from pre_inscricoes")) {
            state.preInscricoes = state.preInscricoes.filter((item) => Number(item.id) !== Number(values[0]));
            return [[], []];
        }
        if (s.startsWith("update pre_inscricoes")) {
            const id = Number(values[values.length - 1]);
            const row = state.preInscricoes.find((item) => Number(item.id) === id);
            if (row) {
                if (s.includes("matricula_confirmada = 1")) {
                    row.matricula_confirmada = 1;
                    row.matricula_confirmada_em = new Date().toISOString();
                }
                if (s.includes("questionario_conclusao_respondido")) row.questionario_conclusao_respondido = 1;
                if (s.includes("pesquisa_satisfacao_respondida")) row.pesquisa_satisfacao_respondida = 1;
            }
            return [[], []];
        }

        if (s.startsWith("insert into interessados")) {
            const row = { id: nextId(state.interessados), nome: values[0], whatsapp: values[1], email: values[2], regiao: values[3], perfil_curso: values[4], status: "aguardando", enviado_em: null };
            state.interessados.push(row);
            return [[{ id: row.id }], []];
        }
        if (s.includes("from interessados")) {
            if (s.startsWith("select")) return [clone(state.interessados).sort((a, b) => b.id - a.id), []];
        }
        if (s.startsWith("update interessados")) {
            const row = state.interessados.find((item) => Number(item.id) === Number(values[2]));
            if (row) {
                row.status = values[0];
                row.enviado_em = values[0] === "enviado" ? new Date().toISOString() : null;
            }
            return [[], []];
        }

        if (s.startsWith("insert into sugestoes_cursos")) {
            state.sugestoes.push({ id: nextId(state.sugestoes), cpf: values[0], areas_interesse: values[1], sugestao_texto: values[2], criado_em: new Date().toISOString() });
            return [[], []];
        }

        if (s.includes("select pi.*")) {
            const id = Number(values[0]);
            const row = state.preInscricoes.find((item) => Number(item.id) === id);
            if (!row) return [[], []];
            const curso = state.cursos.find((item) => Number(item.id) === Number(row.curso_id));
            return [[{
                ...clone(row),
                curso_nome: cursoNome(curso?.curso_id),
                local_nome: localNome(curso?.local_id),
                data_inicio_formatada: toDateBr(curso?.data_inicio),
                data_termino_formatada: toDateBr(curso?.data_termino)
            }], []];
        }

        if (s.includes("group by")) return [[], []];
        if (s.includes("count(*) as total")) return [[{ total: 0 }], []];

        console.warn("[local-db] Query sem implementacao especifica:", rawSql.slice(0, 180));
        return [[], []];
    };

    return {
        query,
        getConnection: async () => ({ release: () => undefined }),
        state,
        getPublicCourses: () => clone(state.cursos.map(publicCourse))
    };
}

const LOCAL_PUBLIC_CURSOS = createLocalDb().getPublicCourses();

module.exports = {
    LOCAL_PUBLIC_CURSOS,
    createLocalDb
};
