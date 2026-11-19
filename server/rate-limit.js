const crypto = require('crypto');

const MINUTE = 60000;
// CRAS, schools and telecentres put many citizens behind one public IP, so the
// per-IP ceiling only stops bulk abuse. The tighter per-CPF ceiling stops
// repeated attempts against one person without blocking a group enrollment drive.
const limits = {
    '/api/cidadaos/localizar': { window: MINUTE, ip: 60, cpf: 10 },
    '/api/cidadaos/enviar-codigo': { window: 10 * MINUTE, ip: 30, cpf: 5 },
    '/api/cidadaos/validar-codigo': { window: 10 * MINUTE, ip: 60, cpf: 10 },
    '/inscricao': { window: 10 * MINUTE, ip: 60, cpf: 5 },
    '/api/interessados': { window: 10 * MINUTE, ip: 30 },
    '/chat': { window: MINUTE, ip: 60 },
};
const hash = text => crypto.createHash('sha256').update(text).digest('hex');

function clientIp(req) {
    const forwarded = process.env.VERCEL ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '';
    return forwarded || req.socket?.remoteAddress || 'desconhecido';
}

function createRateLimit(db) {
    return async (req, res, next) => {
        const route = req.path.toLowerCase().replace(/\/+$/, '');
        const rule = req.method === 'POST' && limits[route];
        if (!rule) return next();
        const now = Date.now();
        const expiresAt = (Math.floor(now / rule.window) + 1) * rule.window;
        const counters = [[hash(`ip|${clientIp(req)}|${route}`), rule.ip]];
        const cpf = String(req.body?.cpf || '').replace(/\D/g, '');
        if (rule.cpf && cpf.length === 11) counters.push([hash(`cpf|${cpf}|${route}`), rule.cpf]);
        try {
            const allowed = await db.mutate(state => {
                state.rateLimits ||= {};
                for (const [k, v] of Object.entries(state.rateLimits)) if (v.expiresAt <= now) delete state.rateLimits[k];
                const entries = counters.map(([key, max]) => [state.rateLimits[key] ||= { count: 0, expiresAt }, max]);
                if (entries.some(([entry, max]) => entry.count >= max)) return false;
                for (const [entry] of entries) entry.count++;
                return true;
            });
            if (!allowed) return res.status(429).set('Retry-After', String(Math.ceil((expiresAt - now) / 1000))).json({ error: 'Você fez muitas tentativas. Aguarde alguns minutos e tente novamente.' });
            next();
        } catch { res.status(503).json({ error: 'Serviço temporariamente indisponível. Tente novamente.' }); }
    };
}
module.exports = { createRateLimit, limits };
