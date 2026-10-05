const crypto = require('crypto');
const express = require('express');
const mascots = require('../public/mascotes.json');

const PROFILE_FIELDS = [
    'nome', 'email', 'telefone', 'telefone_alternativo', 'rg', 'data_nascimento', 'genero', 'raca_cor',
    'cep', 'numero', 'rua', 'bairro', 'municipio', 'uf', 'mora_vitoria', 'trabalha_vitoria', 'escolaridade',
    'possui_necessidade_especial', 'tipo_necessidade_especial', 'deficiencia_adaptacoes', 'deficiencia_recursos',
    'responsavel_nome', 'responsavel_cpf', 'responsavel_parentesco', 'responsavel_telefone', 'responsavel_email',
    'responsavel_autorizacao', 'objetivo', 'mascote_preferido',
];
const inactive = new Set(['cancelado', 'desistencia', 'nao_concluido', 'desistente', 'nao_compareceu', 'concluido']);
const digest = text => crypto.createHash('sha256').update(String(text)).digest('hex');
const normalizeCpf = value => String(value || '').replace(/\D/g, '');
function validCpf(value) {
    const cpf = normalizeCpf(value);
    if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
    for (let size = 9; size <= 10; size++) {
        let sum = 0;
        for (let i = 0; i < size; i++) sum += Number(cpf[i]) * (size + 1 - i);
        const digit = (sum * 10) % 11 % 10;
        if (digit !== Number(cpf[size])) return false;
    }
    return true;
}
function error(status, message) { return Object.assign(new Error(message), { status }); }
function profileOf(body) {
    const result = {};
    for (const key of PROFILE_FIELDS) {
        if (body[key] !== undefined) result[key] = typeof body[key] === 'boolean' ? body[key] : String(body[key] || '').trim().slice(0, 1000);
    }
    if (result.mascote_preferido && result.mascote_preferido !== 'auto' && !mascots.some(m => m.id === result.mascote_preferido)) result.mascote_preferido = 'auto';
    return result;
}
function validateProfile(body) {
    for (const key of ['nome', 'email', 'telefone', 'rg', 'cep', 'municipio', 'data_nascimento']) {
        if (!String(body[key] || '').trim()) throw error(400, `Informe o campo obrigatório: ${key}.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw error(400, 'E-mail inválido.');
    if (!/^\d{10,11}$/.test(String(body.telefone).replace(/\D/g, ''))) throw error(400, 'Telefone inválido.');
    if (!/^\d{8}$/.test(String(body.cep).replace(/\D/g, ''))) throw error(400, 'CEP inválido.');
    const match = String(body.data_nascimento).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) throw error(400, 'Data de nascimento inválida.');
    const born = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    if (born.getDate() !== Number(match[1]) || born.getMonth() !== Number(match[2]) - 1 || born > new Date()) throw error(400, 'Data de nascimento inválida.');
    const today = new Date();
    const age = today.getFullYear() - born.getFullYear() - (today < new Date(today.getFullYear(), born.getMonth(), born.getDate()) ? 1 : 0);
    if (age < 18 && (body.responsavel_autorizacao !== 'sim' || !validCpf(body.responsavel_cpf) || !body.responsavel_nome)) throw error(400, 'Informe os dados e a autorização do responsável legal.');
}
function sessionFor(state, req, cpf) {
    const token = String(req.headers.authorization || '').replace(/^Bearer /, '');
    const session = state.sessions?.[digest(token)];
    if (!token || !session || session.expiresAt <= Date.now() || (cpf && cpf !== session.cpf)) throw error(401, 'Valide o código enviado ao seu e-mail para acessar ou atualizar este cadastro.');
    return session;
}
function validateEligibility(body) {
    const city = String(body.municipio || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const resident = city === 'vitoria' && String(body.uf || '').trim().toUpperCase() === 'ES';
    if (!resident && body.trabalha_vitoria !== 'sim') throw error(400, 'Os cursos do Qualifica Vix atendem quem mora ou trabalha em Vitória. Não podemos continuar com a pré-inscrição sem esse vínculo. Se digitou o CEP por engano, você pode corrigi-lo.');
}
function masked(row) {
    const email = String(row.email || '').split('@');
    return {
        nome: String(row.nome || '').split(/\s+/).map(p => p[0] + '***').join(' '),
        email: `${email[0]?.[0] || '*'}***@${email[1] || '***'}`,
        telefone: `(**) *****-${String(row.telefone || '').replace(/\D/g, '').slice(-4)}`,
    };
}
function enroll(state, body, req, now = Date.now()) {
    const cpf = normalizeCpf(body.cpf);
    if (!validCpf(cpf)) throw error(400, 'CPF inválido.');
    if (body.aceitou_termos_ciencia !== true || body.aceitou_aviso_lgpd !== true) throw error(400, 'Confirme os termos de matrícula e o aviso de privacidade.');
    validateProfile(body);
    validateEligibility(body);
    const course = state.cursos.find(c => c.id === Number(body.curso_id));
    if (!course) throw error(404, 'Curso não encontrado.');
    if (!['ativo', 'esgotado'].includes(course.status)) throw error(400, 'Este curso não está recebendo pré-inscrições.');
    if (state.preInscricoes.some(i => i.cpf === cpf && i.curso_id === course.id)) throw error(409, 'Você já possui pré-inscrição neste curso.');
    const existing = state.usuarios.find(u => u.cpf === cpf);
    if (existing) sessionFor(state, req, cpf);
    const active = state.preInscricoes.filter(i => i.cpf === cpf && !inactive.has(i.status));
    const config = state.configuracoes[0] || { limite_inscricoes_semestre: 4 };
    if (active.length >= config.limite_inscricoes_semestre) throw error(400, `Você atingiu o limite de ${config.limite_inscricoes_semestre} inscrições ativas.`);
    const occupied = state.preInscricoes.filter(i => i.curso_id === course.id && i.status_inscricao === 'titular' && !inactive.has(i.status)).length;
    const classification = occupied >= Number(course.vagas) || course.status === 'esgotado' || active.length >= 2 ? 'suplente' : 'titular';
    const nextId = rows => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const profile = { ...profileOf(body), cpf, atualizado_em: new Date(now).toISOString() };
    const user = existing || { id: nextId(state.usuarios), cpf, criado_em: new Date(now).toISOString() };
    Object.assign(user, profile);
    if (!existing) state.usuarios.push(user);
    const id = nextId(state.preInscricoes);
    const enrollment = {
        ...profile, id, usuario_id: user.id, curso_id: course.id,
        status_inscricao: classification, status: 'pendente_validacao', situacao_final: 'inscrito',
        matricula_confirmada: 0, matricula_confirmada_em: null, criado_em: new Date(now).toISOString(),
        // Reservation deadlines begin when the institution contacts the citizen.
        convocado_em: null, vaga_expira_em: null,
        autoriza_lgpd: body.autoriza_lgpd === 'sim' ? 'sim' : 'nao',
        autoriza_uso_imagem: body.autoriza_uso_imagem === 'sim' ? 'sim' : 'nao',
        aceitou_termos_ciencia: true, aceitou_aviso_lgpd: true,
        versao_termos: '2.0', timestamp_aceite_lgpd: new Date(now).toISOString(),
    };
    state.preInscricoes.push(enrollment);
    if (classification === 'titular' && occupied + 1 >= course.vagas) course.status = 'esgotado';
    return { enrollment, course };
}

function createCitizenRouter(db, { sendCode, notifyEnrollment = async () => ({}) }) {
    const router = express.Router();
    const handler = fn => async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try { await fn(req, res); } catch (err) {
            if (!err.status) console.error('[cadastro]', err.message);
            res.status(err.status || 503).json({ error: err.status ? err.message : 'Serviço de cadastro temporariamente indisponível. Tente novamente.' });
        }
    };
    router.post('/api/cidadaos/localizar', handler(async (req, res) => {
        const cpf = normalizeCpf(req.body.cpf);
        if (!validCpf(cpf)) throw error(400, 'CPF inválido.');
        const state = await db.readState();
        const row = state.usuarios.find(u => u.cpf === cpf);
        res.json(row ? { localizou: true, id_mascarado: masked(row) } : { localizou: false });
    }));
    router.post('/api/cidadaos/enviar-codigo', handler(async (req, res) => {
        const cpf = normalizeCpf(req.body.cpf);
        if (!validCpf(cpf)) throw error(400, 'CPF inválido.');
        const state = await db.readState();
        const row = state.usuarios.find(u => u.cpf === cpf);
        if (!row) throw error(404, 'Cadastro não encontrado.');
        const code = String(crypto.randomInt(100000, 1000000));
        const nonce = crypto.randomBytes(16).toString('hex');
        const now = Date.now();
        await db.mutate(s => {
            s.otp ||= {};
            const previous = s.otp[digest(cpf)];
            if (previous && now - previous.sentAt < 60000) throw error(429, 'Aguarde um minuto antes de pedir outro código.');
            s.otp[digest(cpf)] = { hash: digest(code), nonce, sentAt: now, expiresAt: now + 300000, attempts: 0, delivered: false };
        });
        try {
            await sendCode(row.email, code);
            await db.mutate(s => { if (s.otp?.[digest(cpf)]?.nonce === nonce) s.otp[digest(cpf)].delivered = true; });
        } catch {
            await db.mutate(s => { if (s.otp?.[digest(cpf)]?.nonce === nonce) delete s.otp[digest(cpf)]; });
            throw error(503, 'Não foi possível enviar o código. Confira a configuração de e-mail do serviço.');
        }
        res.json({ sucesso: true, canal: 'email' });
    }));
    router.post('/api/cidadaos/validar-codigo', handler(async (req, res) => {
        const cpf = normalizeCpf(req.body.cpf);
        const token = crypto.randomBytes(32).toString('hex');
        const now = Date.now();
        const result = await db.mutate(s => {
            const entry = s.otp?.[digest(cpf)];
            if (!entry || !entry.delivered || now > entry.expiresAt) return { status: 400, message: 'Código expirado ou não solicitado.' };
            if (entry.attempts >= 3) return { status: 429, message: 'Limite de tentativas atingido. Solicite outro código.' };
            if (digest(req.body.codigo || '') !== entry.hash) {
                entry.attempts++;
                return { status: 400, message: 'Código incorreto.' };
            }
            delete s.otp[digest(cpf)];
            s.sessions ||= {};
            // Remove expired sessions and codes during each successful verification.
            for (const [key, session] of Object.entries(s.sessions)) if (session.expiresAt < now) delete s.sessions[key];
            for (const [key, otp] of Object.entries(s.otp)) if (otp.expiresAt < now) delete s.otp[key];
            s.sessions[digest(token)] = { cpf, expiresAt: now + 900000 };
            return { ok: true };
        });
        if (!result.ok) throw error(result.status, result.message);
        res.json({ sucesso: true, sessionToken: token, expiresAt: now + 900000 });
    }));
    router.get('/api/cidadaos/me', handler(async (req, res) => {
        const state = await db.readState();
        const session = sessionFor(state, req);
        const local = require('./local-db').createLocalDb(state);
        const courses = local.getPublicCourses();
        const history = state.preInscricoes.filter(i => i.cpf === session.cpf).map(i => {
            const course = courses.find(c => c.id === i.curso_id);
            return { id: i.id, curso_id: i.curso_id, curso_nome: course?.nome, local_nome: course?.local, status_inscricao: i.status_inscricao, matricula_confirmada: i.matricula_confirmada, situacao_final: i.situacao_final };
        });
        res.json({ found: true, data: state.usuarios.find(u => u.cpf === session.cpf), historico: history });
    }));
    router.put('/api/cidadaos/me', handler(async (req, res) => {
        validateProfile(req.body);
        validateEligibility(req.body);
        await db.mutate(state => {
            const session = sessionFor(state, req);
            const row = state.usuarios.find(u => u.cpf === session.cpf);
            if (!row) throw error(404, 'Cadastro não encontrado.');
            Object.assign(row, profileOf(req.body), { atualizado_em: new Date().toISOString() });
        });
        res.json({ sucesso: true });
    }));
    router.post('/inscricao', handler(async (req, res) => {
        const now = Date.now();
        const saved = await db.mutate(state => enroll(state, req.body, req, now));
        let notifications;
        try { notifications = await notifyEnrollment(saved); } catch { notifications = { email: 'falhou' }; }
        res.json({ status: 'ok', protocolo: `QV-${saved.enrollment.id.toString().padStart(6, '0')}`, status_inscricao: saved.enrollment.status_inscricao, notificacoes: notifications });
    }));
    return router;
}
module.exports = { createCitizenRouter, enroll, validCpf, digest, profileOf, sessionFor };
