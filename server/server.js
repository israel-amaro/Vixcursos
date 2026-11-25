const express = require("express");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const { createLocalDb } = require("./local-db");
const { createLazyFirebaseDb } = require('./firebase-db');
const { createInterestedRouter } = require('./interested-router');
const { createAdminAuth } = require('./admin-auth');
const { createCitizenRouter } = require('./citizen-service');
const { createStateAdminRouter } = require('./state-admin-router');
const { aiChatReply } = require('./ai-chat');
require("dotenv").config({ path: ['.env.local', '.env'] });

const SERVER_PORT = Number(process.env.PORT) || 3000;
const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${SERVER_PORT}`;

async function createApp(options = {}) {
    const app = express();
    app.use(cors({ origin(origin, callback) {
        const allowed = !origin || origin === new URL(baseUrl).origin || (!process.env.VERCEL && process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(?::\d+)?$/.test(origin));
        callback(null, allowed);
    } }));
    app.use(express.json({ limit: "100kb" }));
    app.use(express.urlencoded({ extended: true, limit: "100kb" }));

    const limparEnv = (valor) => String(valor || "").trim().replace(/^['\"]|['\"]$/g, "");
    const EMAIL_HOST = limparEnv(process.env.EMAIL_HOST) || "smtp.gmail.com";
    const EMAIL_PORT = Number(process.env.EMAIL_PORT || 465);
    const EMAIL_SECURE = String(process.env.EMAIL_SECURE || "true").toLowerCase() === "true";
    const EMAIL_CONNECT_TIMEOUT = Number(process.env.EMAIL_CONNECT_TIMEOUT || 12000);
    const EMAIL_SOCKET_TIMEOUT = Number(process.env.EMAIL_SOCKET_TIMEOUT || 15000);
    const EMAIL_USER = limparEnv(process.env.EMAIL_USER);
    const EMAIL_PASS = limparEnv(process.env.EMAIL_PASS);
    const EMAIL_FROM = limparEnv(process.env.EMAIL_FROM) || (EMAIL_USER ? `"Qualifica Vix" <${EMAIL_USER}>` : "");
    const IS_VERCEL = Boolean(process.env.VERCEL);
    const IS_PRODUCTION = process.env.NODE_ENV === "production" || IS_VERCEL;
    const DB_PROVIDER = process.env.DB_PROVIDER === 'local' && !IS_PRODUCTION ? 'local' : 'firebase';
    const EMAIL_CONFIGURADO = Boolean(EMAIL_USER && EMAIL_PASS && EMAIL_FROM);

    const adminAuth = createAdminAuth(options.adminAuth);
    const exigirAuthAdmin = adminAuth.requireAuth;
    app.use(adminAuth.router);
    app.use(adminAuth.protectPages);

    function responderErroBanco(res, erro) {
        console.error('[db]', erro.code || 'indisponível');
        return res.status(erro.status || 503).json({ error: 'Não foi possível carregar os dados. Tente novamente em alguns instantes.' });
    }

    // Servir frontend
    app.use(express.static(path.join(__dirname, "..", "dist")));

    const db = options.db || (DB_PROVIDER === 'local' ? createLocalDb() : createLazyFirebaseDb());

    app.use(require('./rate-limit').createRateLimit(db));
    app.use((req, res, next) => {
        if (/^\/api\/(cursos-public|faq|configuracoes-public)(\/|$)/.test(req.path) || req.path.startsWith('/public/')) res.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
        next();
    });
    app.use(require('./survey-certificate-router').createSurveyCertificateRouter(db, exigirAuthAdmin));
    function criarTransporterEmail(port, secure) {
        return nodemailer.createTransport({
            host: EMAIL_HOST,
            port,
            secure,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            },
            connectionTimeout: EMAIL_CONNECT_TIMEOUT,
            socketTimeout: EMAIL_SOCKET_TIMEOUT,
            tls: {
                minVersion: "TLSv1.2"
            }
        });
    }

    const mailer = criarTransporterEmail(EMAIL_PORT, EMAIL_SECURE);

    app.get('/api/cep/:cep', async (req, res) => {
        if (!/^\d{8}$/.test(req.params.cep)) return res.status(400).json({ error: 'CEP inválido.' });
        try {
            const response = await fetch(`https://viacep.com.br/ws/${req.params.cep}/json/`, { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error('ViaCEP indisponível');
            res.json(await response.json());
        } catch { res.status(503).json({ error: 'Consulta de endereço temporariamente indisponível.' }); }
    });

    if (db.readState && db.mutate) {
        app.get('/api/configuracoes-public', async (_req, res) => {
            try { const s = await db.readState(); res.json({ limite_inscricoes_semestre: s.configuracoes[0]?.limite_inscricoes_semestre || 4 }); }
            catch { res.status(503).json({ error: 'Configuração indisponível.' }); }
        });
        app.use(createStateAdminRouter(db, exigirAuthAdmin));
        app.use(createInterestedRouter(db, exigirAuthAdmin));
        app.use(createCitizenRouter(db, {
            sendCode: async (email, code) => {
                if (!EMAIL_CONFIGURADO) throw new Error('SMTP não configurado.');
                await mailer.sendMail({ from: EMAIL_FROM, to: email, subject: 'Seu código de acesso — Qualifica Vix', text: `Seu código de acesso ao Qualifica Vix é ${code}. Ele expira em 5 minutos. Se você não solicitou, ignore esta mensagem.` });
            },
            notifyEnrollment: async ({ enrollment }) => {
                if (!EMAIL_CONFIGURADO) return { email: 'nao_configurado' };
                await mailer.sendMail({ from: EMAIL_FROM, to: enrollment.email, subject: 'Pré-inscrição recebida — Qualifica Vix', text: `Sua pré-inscrição foi recebida. Protocolo QV-${String(enrollment.id).padStart(6, '0')}. A matrícula será confirmada somente após a instituição entrar em contato e validar as informações.` });
                return { email: 'enviado' };
            },
        }));
    }

    const wrap = fn => async (req, res) => { try { await fn(req, res); } catch (e) { responderErroBanco(res, e); } };
    const publicCourses = state => createLocalDb(state).getPublicCourses().filter(c => ['ativo', 'esgotado'].includes(c.status) && (!c.data_publicacao || Date.parse(c.data_publicacao) <= Date.now()) && c.situacao !== 'encerrado');
    app.get('/public/:tipo', wrap(async (req, res) => {
        if (!['curso', 'categoria', 'local', 'modalidade', 'idade', 'turno'].includes(req.params.tipo)) return res.status(400).json({ error: 'Filtro inválido.' });
        const local = createLocalDb(await db.readState());
        const [rows] = local.query(`SELECT * FROM filtro_${req.params.tipo} ORDER BY id ASC`);
        res.json(req.params.tipo === 'modalidade' && req.query.categoria_id ? rows.filter(r => r.categoria_id === Number(req.query.categoria_id)) : rows);
    }));
    app.get('/api/estatisticas', wrap(async (_req, res) => {
        const state = await db.readState();
        res.json({ vagasHoje: publicCourses(state).reduce((sum, c) => sum + Number(c.vagas_disponiveis || 0), 0), vagas2026: state.preInscricoes.filter(i => String(i.criado_em).startsWith('2026')).length });
    }));
    app.post('/chat', wrap(async (req, res) => {
        const message = req.body?.message ?? req.body?.mensagem;
        if (typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'Digite uma mensagem.' });
        const state = await db.readState();
        const { reply, fonte } = await aiChatReply({ courses: publicCourses(state), message,
            history: req.body.history, limit: state.configuracoes?.[0]?.limite_inscricoes_semestre || 4,
            fallback: chatReply }, options.aiChat);
        res.json({ reply, resposta: reply, fonte });
    }));
    app.get('*', (req, res, next) => {
        if (/^\/(api|public|admin|certificado|cursos|cursos-detalhes|inscritos|chat)(\/|$)/.test(req.path)) return next();
        res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    });
    return app;
}
const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
// The chat widget turns the first "/pre-inscricao/<id>" in a reply into an enrollment button.
function chatReply(courses, message) {
    const text = normalizeText(message);
    const has = words => words.some(w => text.includes(w));
    const vagas = c => Number(c.vagas_disponiveis || 0);
    const line = c => `• ${c.nome} — ${c.local || 'local a definir'} — ${vagas(c) > 0 ? `${vagas(c)} vagas livres` : 'lista de espera'}\n  Inscrição: /pre-inscricao/${c.id}`;
    const detail = c => `${c.nome}\nLocal: ${c.local || 'a definir'}\nSituação: ${c.situacao_label || 'Inscrições abertas'}\nVagas: ${vagas(c) > 0 ? `${vagas(c)} livres de ${c.vagas_totais ?? c.vagas}` : 'lista de espera'}\n\nPara se inscrever: /pre-inscricao/${c.id}`;
    const none = 'No momento não há cursos com inscrições abertas. Deixe seu contato em "Quero receber avisos de cursos" que avisamos quando abrir uma turma.';
    if (!text) return 'Olá! Pergunte, por exemplo: "lista de cursos", "vagas", "curso de informática" ou "quero me inscrever".';
    if (!courses.length) return none;
    const byId = text.match(/(?:curso|id)\s*(\d+)/);
    if (byId) {
        const course = courses.find(c => c.id === Number(byId[1]));
        return course ? detail(course) : 'Não encontrei esse curso. Diga "lista de cursos" para ver os disponíveis.';
    }
    const words = text.split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !['curso', 'cursos', 'quero', 'fazer', 'sobre', 'vagas', 'inscrever', 'inscricao'].includes(w));
    const matches = courses.filter(c => words.some(w => normalizeText(`${c.nome} ${c.categoria || ''}`).includes(w)));
    if (matches.length === 1) return detail(matches[0]);
    if (matches.length > 1) return `Encontrei estes cursos:\n\n${matches.map(line).join('\n\n')}`;
    if (has(['inscri', 'matricul', 'inscrever'])) return `Escolha um curso e toque no link para fazer a pré-inscrição:\n\n${courses.map(line).join('\n\n')}`;
    if (has(['vaga', 'disponive'])) {
        const open = courses.filter(c => vagas(c) > 0);
        return `Temos ${open.reduce((n, c) => n + vagas(c), 0)} vagas livres em ${open.length} curso(s).${open.length ? `\n\n${open.map(line).join('\n\n')}` : ''}`;
    }
    if (has(['onde', 'local', 'endereco', 'bairro'])) return `Locais das turmas:\n\n${[...new Set(courses.map(c => c.local || 'A definir'))].map(l => `• ${l}`).join('\n')}`;
    if (has(['curso', 'lista', 'catalogo', 'opcoes'])) return `Cursos com inscrições:\n\n${courses.map(line).join('\n\n')}`;
    return 'Não entendi. Tente perguntar: "lista de cursos", "vagas", "onde são as aulas" ou o nome da área, como "informática".';
}

if (require.main === module) createApp().then(app => app.listen(SERVER_PORT));
module.exports = createApp;
module.exports.chatReply = chatReply;
