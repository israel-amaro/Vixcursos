const express = require("express");
const fs = require("fs");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");
const XLSX = require("xlsx");
const { LOCAL_PUBLIC_CURSOS, createLocalDb } = require("./local-db");
require("dotenv").config();
require("dotenv").config({ path: ".env.local", override: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";
const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID || "";
const TWILIO_CONTENT_VARIABLES = process.env.TWILIO_CONTENT_VARIABLES || "";
const TWILIO_TO_NUMBER = process.env.TWILIO_TO_NUMBER || "";
const TWILIO_CHANNEL = process.env.TWILIO_CHANNEL || "sms";
const WHATSAPP_PROVIDER = String(process.env.WHATSAPP_PROVIDER || "twilio").toLowerCase();
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "";
const limparEnv = (valor) => String(valor || "").trim().replace(/^['\"]|['\"]$/g, "");
const EMAIL_HOST = limparEnv(process.env.EMAIL_HOST) || "smtp.gmail.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 465);
const EMAIL_SECURE = String(process.env.EMAIL_SECURE || "true").toLowerCase() === "true";
const EMAIL_FALLBACK_PORT = Number(process.env.EMAIL_FALLBACK_PORT || 587);
const EMAIL_FALLBACK_SECURE = String(process.env.EMAIL_FALLBACK_SECURE || "false").toLowerCase() === "true";
const EMAIL_CONNECT_TIMEOUT = Number(process.env.EMAIL_CONNECT_TIMEOUT || 12000);
const EMAIL_SOCKET_TIMEOUT = Number(process.env.EMAIL_SOCKET_TIMEOUT || 15000);
const EMAIL_USER = limparEnv(process.env.EMAIL_USER);
const EMAIL_PASS = limparEnv(process.env.EMAIL_PASS);
const EMAIL_FROM = limparEnv(process.env.EMAIL_FROM) || (EMAIL_USER ? `\"Vix Cursos\" <${EMAIL_USER}>` : "");
const IS_VERCEL = Boolean(process.env.VERCEL);
const IS_PRODUCTION = process.env.NODE_ENV === "production" || IS_VERCEL;
const DB_DISABLED = String(process.env.DB_DISABLED || "true").toLowerCase() !== "false";
const SUPABASE_DB_HOST = limparEnv(process.env.SUPABASE_DB_HOST || process.env.POSTGRES_HOST);
const SUPABASE_DB_USER = limparEnv(process.env.SUPABASE_DB_USER || process.env.POSTGRES_USER);
const SUPABASE_DB_PASSWORD = limparEnv(process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD);
const SUPABASE_DB_NAME = limparEnv(process.env.SUPABASE_DB_NAME || process.env.POSTGRES_DATABASE) || "postgres";
const SUPABASE_DB_PORT = Number(process.env.SUPABASE_DB_PORT || process.env.POSTGRES_PORT || 5432);
const DATABASE_URL_RAW =
    process.env.SUPABASE_POOLER_URL ||
    process.env.SUPABASE_POOLER_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    "";
const ajustarUrlPgCompat = (valor) => {
    if (!valor) return "";
    try {
        const url = new URL(valor);
        url.searchParams.set("sslmode", "require");
        url.searchParams.set("uselibpqcompat", "true");
        return url.toString();
    } catch {
        return valor;
    }
};
const DATABASE_URL_FROM_PARTS = SUPABASE_DB_HOST && SUPABASE_DB_USER
    ? `postgresql://${encodeURIComponent(SUPABASE_DB_USER)}:${encodeURIComponent(SUPABASE_DB_PASSWORD)}@${SUPABASE_DB_HOST}:${SUPABASE_DB_PORT}/${SUPABASE_DB_NAME}`
    : "";
const DATABASE_URL = ajustarUrlPgCompat(DATABASE_URL_RAW) || DATABASE_URL_FROM_PARTS;
const DB_SSL_ENABLED = String(process.env.DB_SSL_ENABLED || "true").toLowerCase() !== "false";
const DB_SSL_REJECT_UNAUTHORIZED = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || "false").toLowerCase() === "true";
const DB_CONNECT_TIMEOUT = Number(process.env.DB_CONNECT_TIMEOUT || 6000);
const DB_QUERY_TIMEOUT = Number(process.env.DB_QUERY_TIMEOUT || 7000);
const DB_CONNECTION_LIMIT = Number(process.env.DB_CONNECTION_LIMIT || (IS_PRODUCTION ? 1 : 10));
const DB_IDLE_TIMEOUT = Number(process.env.DB_IDLE_TIMEOUT || (IS_PRODUCTION ? 10000 : 30000));
const DB_HOST_REF = `${SUPABASE_DB_HOST} ${DATABASE_URL}`.toLowerCase();
const DB_IS_SUPABASE = DB_HOST_REF.includes("supabase.co") || DB_HOST_REF.includes("supabase.com");
const DB_IS_POOLER = DB_HOST_REF.includes("pooler.supabase.com") || DB_HOST_REF.includes(":6543");
const EMAIL_CONFIGURADO = Boolean(EMAIL_USER && EMAIL_PASS && EMAIL_FROM);

const ADMIN_COOKIE_NAME = "porto_admin_token";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "porto-admin-secret-change-me";
const ADMIN_USERNAME = "admin@vixcursos.com";
const ADMIN_PASSWORD = "admin123";
const SERVER_PORT = Number(process.env.PORT) || 3000;

function lerCookie(req, nome) {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").reduce((acc, item) => {
        const [chave, ...resto] = item.trim().split("=");
        if (!chave) return acc;
        acc[chave] = resto.join("=");
        return acc;
    }, {});

    return cookies[nome] || null;
}

function criarCookieAdmin(token) {
    const partes = [
        `${ADMIN_COOKIE_NAME}=${token}`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        "Max-Age=28800"
    ];

    if (process.env.NODE_ENV === "production") {
        partes.push("Secure");
    }

    return partes.join("; ");
}

function limparCookieAdmin() {
    const partes = [
        `${ADMIN_COOKIE_NAME}=`,
        "HttpOnly",
        "Path=/",
        "SameSite=Lax",
        "Max-Age=0"
    ];

    if (process.env.NODE_ENV === "production") {
        partes.push("Secure");
    }

    return partes.join("; ");
}

function eErroTimeoutBanco(erro) {
    const code = erro && erro.code;
    const message = String(erro?.message || "").toLowerCase();
    return Boolean(
        code && [
            "ETIMEDOUT",
            "PROTOCOL_SEQUENCE_TIMEOUT",
            "ECONNREFUSED",
            "ENOTFOUND",
            "EHOSTUNREACH",
            "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
            "57P01",
            "57P02",
            "57P03"
        ].includes(code)
    ) || Boolean(
        message.includes("connection terminated due to connection timeout") ||
        message.includes("connection timeout") ||
        message.includes("timeout exceeded when trying to connect") ||
        message.includes("timeout expired") ||
        message.includes("connect timeout") ||
        message.includes("connection terminated unexpectedly")
    );
}

function converterPlaceholdersSql(sql) {
    let indice = 0;
    return String(sql || "").replace(/\?/g, () => `$${++indice}`);
}

function responderErroBanco(res, erro, mensagem) {
    if (eErroTimeoutBanco(erro)) {
        console.error("[db] erro de conexao/timeout:", erro?.code || "sem_code", erro?.message || erro);
        return res.status(503).json({ error: "Banco de dados indisponivel" });
    }

    console.error(mensagem, erro);
    return res.status(500).json({ error: mensagem.replace(/^Erro na rota\s*/, "").replace(/:$/, "") || "Erro interno" });
}

function verificarTokenAdmin(req) {
    const token = lerCookie(req, ADMIN_COOKIE_NAME);
    if (!token) return null;

    try {
        return jwt.verify(token, ADMIN_JWT_SECRET);
    } catch {
        return null;
    }
}

function exigirAuthAdmin(req, res, next) {
    const payload = verificarTokenAdmin(req);
    if (payload) {
        req.admin = payload;
        return next();
    }

    if (req.accepts("html")) {
        return res.redirect("/admin/login.html");
    }

    return res.status(401).json({ error: "Nao autorizado" });
}

app.use((req, res, next) => {
    if (!req.path.startsWith("/admin")) {
        return next();
    }

    if (req.path === "/admin/login.html") {
        return next();
    }

    const payload = verificarTokenAdmin(req);
    if (payload) {
        req.admin = payload;
        return next();
    }

    return res.redirect("/admin/login.html");
});

let baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${SERVER_PORT}`;

// Servir frontend
app.use(express.static(path.join(__dirname, "dist")));

async function createApp() {
    // ======================================
    // BANCO LOCAL / POSTGRESQL
    // ======================================
    let pgPool = null;
    let db;

    if (DB_DISABLED) {
        console.log("[db] Banco externo desconectado. Usando dados locais em memoria carregados do banco.sql.");
        db = createLocalDb();
    } else {
        console.log("[db] Iniciando configuracao da pool PostgreSQL");
        console.log("[db] Connection limit:", DB_CONNECTION_LIMIT);
        console.log("[db] connectTimeout:", DB_CONNECT_TIMEOUT);
        console.log("[db] queryTimeout:", DB_QUERY_TIMEOUT);
        console.log("[db] idleTimeout:", DB_IDLE_TIMEOUT);
        console.log("[db] SSL habilitado:", DB_SSL_ENABLED);
        console.log("[db] SSL rejectUnauthorized:", DB_SSL_REJECT_UNAUTHORIZED);
        console.log("[db] Host Supabase detectado:", DB_IS_SUPABASE);
        console.log("[db] Pooler Supabase detectado:", DB_IS_POOLER);
        console.log("[db] Database URL configurada:", Boolean(DATABASE_URL));
        if (IS_PRODUCTION && DB_IS_SUPABASE && !DB_IS_POOLER) {
            console.warn("[db] Ambiente serverless detectado com conexao direta ao Supabase. Use o Transaction Pooler na porta 6543.");
        }

        pgPool = new Pool({
            connectionString: DATABASE_URL || undefined,
            max: DB_CONNECTION_LIMIT,
            connectionTimeoutMillis: DB_CONNECT_TIMEOUT,
            idleTimeoutMillis: DB_IDLE_TIMEOUT,
            allowExitOnIdle: true,
            statement_timeout: DB_QUERY_TIMEOUT,
            ssl: DB_SSL_ENABLED
                ? { rejectUnauthorized: DB_IS_SUPABASE ? false : DB_SSL_REJECT_UNAUTHORIZED }
                : false
        });

        db = {
            query: async (sql, values) => {
                const text = typeof sql === "string" ? converterPlaceholdersSql(sql) : sql;
                const result = await pgPool.query(text, values);
                return [result.rows, result.fields];
            },
            getConnection: async () => {
                const client = await pgPool.connect();
                return {
                    release: () => client.release()
                };
            }
        };
    }

    let bancoDisponivelNaInicializacao = false;

    async function inicializarBanco() {
        try {
            console.log("[db] Pool PostgreSQL criada, validando conexao...");
            const connection = await db.getConnection();
            console.log("[db] Conexao PostgreSQL validada com sucesso");
            connection.release();
            console.log("[db] Conexao PostgreSQL liberada de volta para a pool");

            await garantirColuna("pre_inscricoes", "cpf", "VARCHAR(14) NULL");
            await garantirColuna("pre_inscricoes", "rg", "VARCHAR(20) NULL");
            await garantirColuna("pre_inscricoes", "mora_vitoria", "VARCHAR(3) NULL");
            await garantirColuna("pre_inscricoes", "escolaridade", "VARCHAR(80) NULL");
            await garantirColuna("pre_inscricoes", "cep", "VARCHAR(12) NULL");
            await garantirColuna("pre_inscricoes", "numero", "VARCHAR(20) NULL");
            await garantirColuna("pre_inscricoes", "rua", "VARCHAR(150) NULL");
            await garantirColuna("pre_inscricoes", "bairro", "VARCHAR(120) NULL");
            await garantirColuna("pre_inscricoes", "municipio", "VARCHAR(120) NULL");
            await garantirColuna("pre_inscricoes", "possui_necessidade_especial", "VARCHAR(3) NULL");
            await garantirColuna("pre_inscricoes", "tipo_necessidade_especial", "VARCHAR(120) NULL");
            await garantirColuna("pre_inscricoes", "cpf_documento", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "rg_documento", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "documento_confirmacao", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "matricula_confirmada", "SMALLINT NOT NULL DEFAULT 0");
            await garantirColuna("pre_inscricoes", "matricula_confirmada_em", "TIMESTAMP NULL");
            await garantirColuna("interessados", "enviado_em", "TIMESTAMP NULL");
            await garantirIndice("pre_inscricoes", "idx_pre_inscricoes_cpf", "cpf");
            await garantirIndiceUnico("pre_inscricoes", "uk_pre_inscricoes_curso_cpf", "curso_id, cpf");

            // ==========================================
            // MIGRATIONS - NOVOS CAMPOS E CONFIGURAÃ‡Ã•ES
            // ==========================================
            await db.query(`
                CREATE TABLE IF NOT EXISTS configuracoes (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    limite_inscricoes_semestre INT DEFAULT 4,
                    prazo_confirmacao_horas INT DEFAULT 48
                )
            `);
            const [configRows] = await db.query(`SELECT COUNT(*) AS total FROM configuracoes`);
            if (configRows[0].total === 0) {
                await db.query(`INSERT INTO configuracoes (limite_inscricoes_semestre, prazo_confirmacao_horas) VALUES (4, 48)`);
            }

            // pre_inscricoes columns
            await garantirColuna("pre_inscricoes", "status_inscricao", "VARCHAR(20) DEFAULT 'titular'");
            await garantirColuna("pre_inscricoes", "objetivo", "VARCHAR(200) NULL");
            await garantirColuna("pre_inscricoes", "autoriza_lgpd", "VARCHAR(3) DEFAULT 'sim'");
            await garantirColuna("pre_inscricoes", "data_nascimento", "DATE NULL");
            await garantirColuna("pre_inscricoes", "genero", "VARCHAR(30) NULL");
            await garantirColuna("pre_inscricoes", "raca_cor", "VARCHAR(30) NULL");
            await garantirColuna("pre_inscricoes", "telefone_alternativo", "VARCHAR(20) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_nome", "VARCHAR(120) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_cpf", "VARCHAR(14) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_parentesco", "VARCHAR(50) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_telefone", "VARCHAR(20) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_email", "VARCHAR(120) NULL");
            await garantirColuna("pre_inscricoes", "responsavel_autorizacao", "VARCHAR(3) NULL");
            await garantirColuna("pre_inscricoes", "deficiencia_adaptacoes", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "deficiencia_recursos", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "nota_satisfacao_instrutor", "INT NULL");
            await garantirColuna("pre_inscricoes", "nota_satisfacao_estrutura", "INT NULL");
            await garantirColuna("pre_inscricoes", "nota_satisfacao_material", "INT NULL");
            await garantirColuna("pre_inscricoes", "nota_satisfacao_geral", "INT NULL");
            await garantirColuna("pre_inscricoes", "comentario_satisfacao", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "emprego_pos_curso", "VARCHAR(15) NULL");
            await garantirColuna("pre_inscricoes", "contribuicao_profissional", "INT NULL");
            await garantirColuna("pre_inscricoes", "recomendaria", "VARCHAR(3) NULL");
            await garantirColuna("pre_inscricoes", "beneficio_principal", "TEXT NULL");
            await garantirColuna("pre_inscricoes", "pesquisa_satisfacao_respondida", "SMALLINT DEFAULT 0");
            await garantirColuna("pre_inscricoes", "questionario_conclusao_respondido", "SMALLINT DEFAULT 0");
            await garantirColuna("pre_inscricoes", "convocado_em", "TIMESTAMP NULL");
            await garantirColuna("pre_inscricoes", "vaga_expira_em", "TIMESTAMP NULL");

            // cursos columns
            await garantirColuna("cursos", "descricao", "TEXT NULL");
            await garantirColuna("cursos", "video_url", "VARCHAR(255) NULL");
            await garantirColuna("cursos", "faixa_salarial", "VARCHAR(100) NULL");
            await garantirColuna("cursos", "areas_atuacao", "TEXT NULL");
            await garantirColuna("cursos", "competencias", "TEXT NULL");
            await garantirColuna("cursos", "pre_requisitos", "TEXT NULL");
            await garantirColuna("cursos", "nivel_empregabilidade", "VARCHAR(50) NULL");
            await garantirColuna("cursos", "data_publicacao", "TIMESTAMP NULL");
            await garantirColuna("cursos", "data_abertura_inscricao", "TIMESTAMP NULL");
            await garantirColuna("cursos", "data_encerramento_inscricao", "TIMESTAMP NULL");
            await garantirColuna("cursos", "acessos_contador", "INT DEFAULT 0");

            // filtro_modalidade column (categoria_id)
            await garantirColuna("filtro_modalidade", "categoria_id", "INT NULL");

            await garantirColuna("pre_inscricoes", "situacao_final", "VARCHAR(30) DEFAULT 'inscrito'");

            // FAQ Table
            await db.query(`
                CREATE TABLE IF NOT EXISTS faq (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    pergunta TEXT NOT NULL,
                    resposta TEXT NOT NULL,
                    ordem INT DEFAULT 0
                )
            `);
            const [faqCount] = await db.query(`SELECT COUNT(*) AS total FROM faq`);
            if (faqCount[0].total === 0) {
                const defaultFaqs = [
                    { q: "Quem pode se inscrever?", a: "Os cursos do VixCursos sÃ£o destinados exclusivamente a moradores de VitÃ³ria - ES que atendam aos prÃ©-requisitos de idade e escolaridade do curso pretendido." },
                    { q: "Como funciona a confirmaÃ§Ã£o de matrÃ­cula?", a: "ApÃ³s a prÃ©-inscriÃ§Ã£o online, o aluno titular recebe uma notificaÃ§Ã£o por e-mail/SMS com prazo de 24h ou 48h para confirmar sua matrÃ­cula. Caso nÃ£o confirme, a vaga Ã© liberada para o prÃ³ximo suplente." },
                    { q: "O que acontece se eu for suplente?", a: "Caso as vagas imediatas estejam preenchidas, vocÃª entrarÃ¡ na fila de suplÃªncia automÃ¡tica. Se um candidato titular desistir ou nÃ£o confirmar a matrÃ­cula no prazo, o prÃ³ximo suplente da fila Ã© convocado por e-mail/SMS." },
                    { q: "Qual o limite de cursos por semestre?", a: "Cada cidadÃ£o pode se inscrever em atÃ© 4 cursos por semestre. A partir da 3Âª inscriÃ§Ã£o simultÃ¢nea, a inscriÃ§Ã£o entra automaticamente como suplente para dar oportunidade a outros moradores." },
                    { q: "Os cursos sÃ£o realmente gratuitos?", a: "Sim, todos os cursos oferecidos pelo portal VixCursos sÃ£o 100% gratuitos e contam com fornecimento de vale-transporte." },
                    { q: "Menores de 18 anos podem se inscrever?", a: "Sim, desde que atendam a idade mÃ­nima do curso. No momento da inscriÃ§Ã£o, deverÃ£o ser informados os dados do responsÃ¡vel legal, que deverÃ¡ autorizar a participaÃ§Ã£o." }
                ];
                for (let i = 0; i < defaultFaqs.length; i++) {
                    await db.query(`INSERT INTO faq (pergunta, resposta, ordem) VALUES (?, ?, ?)`, [defaultFaqs[i].q, defaultFaqs[i].a, i]);
                }
            }

            // SugestÃµes Table
            await db.query(`
                CREATE TABLE IF NOT EXISTS sugestoes_cursos (
                    id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                    cpf VARCHAR(14) NOT NULL,
                    areas_interesse TEXT,
                    sugestao_texto TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Garantir que categorias existam
            const cats = ['Beleza', 'ConfecÃ§Ã£o', 'Gastronomia', 'Humanas', 'VeÃ­culos'];
            for (const cat of cats) {
                const [exists] = await db.query("SELECT id FROM filtro_categoria WHERE categoria = ?", [cat]);
                if (exists.length === 0) {
                    await db.query("INSERT INTO filtro_categoria (categoria) VALUES (?)", [cat]);
                }
            }

            // Associar modalidades Ã s categorias
            const assoc = [
                { cat: 'Beleza', mods: ['Barbeiro', 'Cuidador de Idoso'] },
                { cat: 'ConfecÃ§Ã£o', mods: ['ConfecÃ§Ã£o Moda Praia', 'TÃ©cnicas de Costura e Acabamento'] },
                { cat: 'Gastronomia', mods: ['Drinks para o VerÃ£o', 'TÃ©cnicas de Confeitaria BÃ¡sica'] }
            ];

            for (const item of assoc) {
                const [catRow] = await db.query("SELECT id FROM filtro_categoria WHERE categoria = ?", [item.cat]);
                if (catRow.length > 0) {
                    const catId = catRow[0].id;
                    for (const m of item.mods) {
                        const [existsMod] = await db.query("SELECT id FROM filtro_modalidade WHERE modalidade = ?", [m]);
                        if (existsMod.length === 0) {
                            await db.query("INSERT INTO filtro_modalidade (modalidade, categoria_id) VALUES (?, ?)", [m, catId]);
                        } else {
                            await db.query("UPDATE filtro_modalidade SET categoria_id = ? WHERE modalidade = ?", [catId, m]);
                        }
                    }
                }
            }

            bancoDisponivelNaInicializacao = true;
            console.log("[db] Inicializacao do banco concluida com sucesso");
        } catch (erro) {
            bancoDisponivelNaInicializacao = false;
            console.warn("[db] Banco indisponivel na inicializacao. O servidor vai subir mesmo assim.");
            console.warn("[db] message:", erro?.message || erro);
            console.warn("[db] code:", erro?.code || "sem_code");
            console.warn("[db] errno:", erro?.errno || "sem_errno");
            console.warn("[db] sqlState:", erro?.sqlState || "sem_sqlState");
        }
    }

    if (DB_DISABLED) {
        bancoDisponivelNaInicializacao = true;
        console.log("[db] Inicializacao local concluida. Nenhuma conexao externa sera aberta.");
    } else {
        void inicializarBanco();
    }

    // ======================================
    // EMAIL
    // ======================================
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

    let mailer = criarTransporterEmail(EMAIL_PORT, EMAIL_SECURE);
    let emailDisponivel = false;

    async function inicializarEmail() {
        if (!EMAIL_CONFIGURADO) {
            emailDisponivel = false;
            console.warn("[email] SMTP desabilitado: preencha EMAIL_USER, EMAIL_PASS e EMAIL_FROM no .env.");
            return;
        }

        try {
            await mailer.verify();
            emailDisponivel = true;
            console.log(`[email] SMTP pronto para envio (${EMAIL_HOST}:${EMAIL_PORT})`);
            return;
        } catch (erroPrincipal) {
            console.warn("[email] Falha na conexao SMTP principal:", erroPrincipal.message || erroPrincipal);
        }

        if (EMAIL_FALLBACK_PORT === EMAIL_PORT && EMAIL_FALLBACK_SECURE === EMAIL_SECURE) {
            emailDisponivel = false;
            return;
        }

        const mailerFallback = criarTransporterEmail(EMAIL_FALLBACK_PORT, EMAIL_FALLBACK_SECURE);

        try {
            await mailerFallback.verify();
            mailer = mailerFallback;
            emailDisponivel = true;
            console.log(`[email] SMTP fallback ativo (${EMAIL_HOST}:${EMAIL_FALLBACK_PORT})`);
        } catch (erroFallback) {
            emailDisponivel = false;
            console.error("[email] Falha ao conectar no SMTP fallback:", erroFallback.message || erroFallback);
        }
    }

    void inicializarEmail();

    async function garantirColuna(tabela, coluna, definicao) {
        const [colunas] = await db.query(
            `SELECT COUNT(*) AS total
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = current_schema()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?`,
            [tabela, coluna]
        );

        if (colunas[0].total === 0) {
            await db.query(`ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${definicao}`);
        }
    }

    async function garantirIndice(tabela, indice, colunas) {
        const [indices] = await db.query(
            `SELECT COUNT(*) AS total
                         FROM pg_indexes
                         WHERE schemaname = current_schema()
                             AND tablename = ?
                             AND indexname = ?`,
            [tabela, indice]
        );

        if (indices[0].total === 0) {
            await db.query(`CREATE INDEX ${indice} ON ${tabela} (${colunas})`);
        }
    }

    async function garantirIndiceUnico(tabela, indice, colunas) {
        const [indices] = await db.query(
            `SELECT COUNT(*) AS total
                         FROM pg_indexes
                         WHERE schemaname = current_schema()
                             AND tablename = ?
                             AND indexname = ?`,
            [tabela, indice]
        );

        if (indices[0].total === 0) {
            try {
                await db.query(`CREATE UNIQUE INDEX ${indice} ON ${tabela} (${colunas})`);
            } catch (err) {
                if (err && (err.code === "23505" || err.code === "ER_DUP_ENTRY")) {
                    const [duplicados] = await db.query(
                        `SELECT curso_id, cpf, COUNT(*) AS total
                         FROM pre_inscricoes
                         GROUP BY curso_id, cpf
                         HAVING COUNT(*) > 1
                         ORDER BY total DESC`
                    );

                    console.warn(
                        `[db] Nao foi possivel criar o indice unico ${indice} por registros duplicados existentes (${duplicados.length} combinacoes). ` +
                        "A aplicacao vai continuar rodando e bloqueando novas duplicidades pela validacao da API."
                    );
                    return;
                }

                throw err;
            }
        }
    }

    function normalizarCpf(valor) {
        return String(valor || "").replace(/\D/g, "").slice(0, 11);
    }

    function normalizarRg(valor) {
        return String(valor || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, " ")
            .slice(0, 20);
    }

    function normalizarTelefoneE164(telefone) {
        const digitos = String(telefone || "").replace(/\D/g, "");

        // BR com DDI jÃ¡ informado: 55 + DDD + numero (10 ou 11 dÃ­gitos locais)
        if (digitos.startsWith("55") && (digitos.length === 12 || digitos.length === 13)) {
            return `+${digitos}`;
        }

        // BR sem DDI: DDD + numero (10 ou 11 dÃ­gitos locais)
        if (digitos.length === 10 || digitos.length === 11) {
            return `+55${digitos}`;
        }

        return null;
    }

    function formatarNumeroTwilio(numero, usarWhatsApp = false) {
        const bruto = String(numero || "").trim();
        if (!bruto) return null;

        const jaTemPrefixoWhatsApp = bruto.toLowerCase().startsWith("whatsapp:");
        const numeroBase = jaTemPrefixoWhatsApp ? bruto.slice("whatsapp:".length) : bruto;
        const e164 = numeroBase.startsWith("+") ? numeroBase : normalizarTelefoneE164(numeroBase);

        if (!e164) return null;

        if (usarWhatsApp || jaTemPrefixoWhatsApp) {
            return `whatsapp:${e164}`;
        }

        return e164;
    }

    function formatarDataBR(valor) {
        if (!valor) return null;

        if (typeof valor === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
            return valor;
        }

        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return String(valor);

        return data.toLocaleDateString("pt-BR");
    }

    function formatarHora(valor) {
        if (!valor) return null;
        return String(valor).slice(0, 5);
    }

    function montarTextoConfirmacao({ cursoNome, dataInicio, dataTermino, horaInicio, horaTermino, local }) {
        const periodo = dataInicio && dataTermino ? `de ${dataInicio} a ${dataTermino}` : null;
        const horario = horaInicio && horaTermino ? `das ${horaInicio}h Ã s ${horaTermino}h` : null;

        return [
            `Recebemos sua prÃ©-matrÃ­cula no curso de ${cursoNome}, Curso do Senai em parceria com a PMV${periodo ? `, que acontecerÃ¡ ${periodo}` : ""}${horario ? `, ${horario}` : ""}${local ? ` no ${local}` : ""}.`,
            "",
            "ðŸ‘‰ Menores de idade devem estar acompanhados do responsÃ¡vel legal.",
            "âœ¨ O curso Ã© 100% gratuito e darÃ¡ direito a vale transporte.",
            "",
            local ? `ðŸ“ EndereÃ§o para matricula: ${local}.` : null,
            "",
            "Esperamos por vocÃª! ðŸš€"
        ].filter(Boolean).join("\n");
    }

    function montarSmsConfirmacao(dados) {
        return montarTextoConfirmacao(dados);
    }

    const mapaPerfis = {
        gastronomia: ['gastronomia', 'panificaÃ§Ã£o / confeitaria', 'eventos', 'turismo / hotelaria'],
        beleza: ['beleza', 'estÃ©tica', 'moda', 'confecÃ§Ã£o', 'artesanato'],
        manutencao: ['manutenÃ§Ã£o', 'mecÃ¢nica', 'eletricista / energia', 'eletrÃ´nica', 'automaÃ§Ã£o industrial', 'soldagem', 'construÃ§Ã£o civil / serviÃ§o', 'seguranÃ§a do trabalho', 'meio ambiente'],
        tecnologia: ['informÃ¡tica / tecnologia', 'programaÃ§Ã£o / ti', 'redes / telecom', 'administraÃ§Ã£o', 'gestÃ£o', 'comÃ©rcio / gestÃ£o empresarial', 'recursos humanos', 'logÃ­stica', 'vendas / marketing']
    };

    function normalizarPerfil(perfil) {
        return String(perfil || '').trim().toLowerCase();
    }

    function categoriasDoPerfil(perfil) {
        return mapaPerfis[normalizarPerfil(perfil)] || [normalizarPerfil(perfil)];
    }

    function cursoCombinaComPerfil(curso, perfil) {
        const categorias = categoriasDoPerfil(perfil);
        const nomeCurso = String(curso.nome || '').toLowerCase();
        const categoriaCurso = String(curso.categoria || '').toLowerCase();
        return categorias.some(cat => nomeCurso.includes(cat) || categoriaCurso.includes(cat));
    }

    function montarLinkPreInscricao(curso) {
        return `${baseUrl}/pre-inscricao/${curso.id}`;
    }

    const EMAIL_BRIDGE_CID = "vix-terceira-ponte";
    const EMAIL_BRIDGE_ASSET_PATH = path.join(__dirname, "public", "imagem", "terceira_ponte.png");

    function montarAnexosEmailPadrao() {
        if (!fs.existsSync(EMAIL_BRIDGE_ASSET_PATH)) {
            return [];
        }

        return [
            {
                filename: "terceira_ponte.png",
                path: EMAIL_BRIDGE_ASSET_PATH,
                cid: EMAIL_BRIDGE_CID
            }
        ];
    }

    function montarLayoutEmailBase({ tituloSecao, subtituloSecao, conteudoHtml, exibirPonte = false, modoPonte = "padrao" }) {
        const classePonte = modoPonte === "cobertura"
            ? "bridge-wrap bridge-cover"
            : "bridge-wrap bridge-soft";

        const camadaPonte = exibirPonte
            ? `
                <div class="${classePonte}">
                    <img src="cid:${EMAIL_BRIDGE_CID}" alt="Terceira Ponte" class="bridge-img">
                    <div class="bridge-fade"></div>
                </div>
            `
            : "";

        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; background: #fdfbf9; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
                    .wrapper { max-width: 640px; margin: 0 auto; background: #fdfbf9; }
                    .hero { position: relative; overflow: hidden; background: linear-gradient(135deg, #004564 0%, #1a5874 100%); padding: 34px 28px 86px; }
                    .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 28px 28px; }
                    .bridge-wrap { position: absolute; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; z-index: 1; }
                    .bridge-soft { height: 46%; opacity: 0.22; }
                    .bridge-cover { height: 68%; opacity: 0.3; }
                    .bridge-img { position: absolute; left: 50%; transform: translateX(-50%); max-width: none; }
                    .bridge-soft .bridge-img { width: 108%; bottom: -10px; }
                    .bridge-cover .bridge-img { width: 132%; bottom: -32px; }
                    .bridge-fade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,69,100,0.76) 8%, rgba(0,69,100,0.42) 45%, rgba(0,69,100,0) 100%); }
                    .hero-content { position: relative; z-index: 2; }
                    .brand { color: #f8fafc; font-weight: 800; font-size: 23px; letter-spacing: -0.02em; margin: 0; }
                    .subtitle { color: #d7eaf3; margin: 6px 0 0; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
                    .card { background: #ffffff; margin: -56px 18px 0; border: 1px solid #e2e8f0; border-radius: 14px; padding: 28px 24px; box-shadow: 0 14px 36px rgba(2, 26, 43, 0.14); position: relative; z-index: 2; }
                    .section-title { margin: 0 0 4px; color: #0f172a; font-size: 20px; }
                    .section-subtitle { margin: 0 0 20px; color: #64748b; font-size: 13px; }
                    .line { border-top: 1px solid #e2e8f0; margin: 18px 0; }
                    .text { margin: 0 0 12px; color: #334155; font-size: 14px; line-height: 1.65; }
                    .highlight { color: #004564; font-weight: 700; }
                    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin: 16px 0; }
                    .info-item { margin: 8px 0; color: #334155; font-size: 14px; line-height: 1.5; }
                    .info-icon { display: inline-block; width: 18px; color: #1a5874; font-weight: 700; }
                    .cta-wrap { text-align: center; margin: 24px 0 6px; }
                    .cta { display: inline-block; text-decoration: none; background: linear-gradient(135deg, #ff8a5a 0%, #f36c6f 100%); color: #ffffff; padding: 12px 24px; border-radius: 999px; font-weight: 700; font-size: 14px; }
                    .footer { text-align: center; color: #64748b; font-size: 11px; padding: 18px 22px 26px; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="hero">
                        <div class="hero-grid"></div>
                        ${camadaPonte}
                        <div class="hero-content">
                            <p class="brand">Vix Cursos</p>
                            <p class="subtitle">Prefeitura de Vitoria</p>
                        </div>
                    </div>

                    <div class="card">
                        <h2 class="section-title">${tituloSecao}</h2>
                        <p class="section-subtitle">${subtituloSecao}</p>
                        ${conteudoHtml}
                    </div>

                    <div class="footer">
                        <p style="margin:0;">Vix Cursos | Prefeitura de Vitoria</p>
                        <p style="margin:6px 0 0;">Mensagem automatica. Nao responda este e-mail.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    function montarEmailDisponibilidade({ nome, curso, perfil }) {
        const link = montarLinkPreInscricao(curso);
        const anexos = montarAnexosEmailPadrao();

        const conteudoHtml = `
            <p class="text">Ola, <span class="highlight">${nome}</span>.</p>
            <p class="text">Encontramos uma oportunidade alinhada ao seu perfil para o curso <span class="highlight">${curso.nome || "Qualificacao"}</span>.</p>

            <div class="info-box">
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Perfil:</strong> ${perfil || "Geral"}</p>
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Local:</strong> ${curso.local || "A definir"}</p>
                ${curso.data_inicio && curso.data_termino ? `<p class="info-item"><span class="info-icon">&#9679;</span><strong>Periodo:</strong> ${curso.data_inicio} a ${curso.data_termino}</p>` : ""}
                ${curso.horario_inicio && curso.horario_termino ? `<p class="info-item"><span class="info-icon">&#9679;</span><strong>Horario:</strong> ${curso.horario_inicio}h as ${curso.horario_termino}h</p>` : ""}
            </div>

            <div class="cta-wrap">
                <a href="${link}" class="cta">Fazer pre-inscricao</a>
            </div>
        `;

        return {
            subject: `Curso disponÃ­vel: ${curso.nome || 'Nova oportunidade'}`,
            html: montarLayoutEmailBase({
                tituloSecao: "Curso disponivel para inscricao",
                subtituloSecao: "Aviso de oportunidade",
                conteudoHtml,
                exibirPonte: anexos.length > 0
            }),
            attachments: anexos
        };
    }

    function montarSmsDisponibilidade({ nome, curso, perfil }) {
        const link = montarLinkPreInscricao(curso);
        return [
            `OlÃ¡, ${nome}!`,
            `O curso de ${curso.nome || 'QualificaÃ§Ã£o'} que combina com o seu perfil de ${perfil} estÃ¡ disponÃ­vel.`,
            curso.local ? `Local: ${curso.local}.` : null,
            curso.data_inicio && curso.data_termino ? `PerÃ­odo: ${curso.data_inicio} a ${curso.data_termino}.` : null,
            curso.horario_inicio && curso.horario_termino ? `HorÃ¡rio: ${curso.horario_inicio}h Ã s ${curso.horario_termino}h.` : null,
            `Acesse para fazer sua prÃ©-inscriÃ§Ã£o: ${link}`
        ].filter(Boolean).join(' ');
    }

    async function notificarInteressado(interessado, curso, perfil) {
        const emailPayload = montarEmailDisponibilidade({ nome: interessado.nome, curso, perfil });
        const smsMensagem = montarSmsDisponibilidade({ nome: interessado.nome, curso, perfil });

        const [emailResult, smsResult] = await Promise.allSettled([
            emailDisponivel
                ? mailer.sendMail({
                    from: EMAIL_FROM,
                    to: interessado.email,
                    subject: emailPayload.subject,
                    html: emailPayload.html,
                    attachments: emailPayload.attachments || []
                })
                : Promise.reject(new Error("smtp-indisponivel")),
            enviarMensagemTwilio({ telefone: interessado.whatsapp, mensagem: smsMensagem })
        ]);

        if (emailResult.status === 'rejected') {
            console.error(`Erro ao enviar aviso para ${interessado.email}:`, emailResult.reason);
        }

        if (smsResult.status === 'rejected') {
            console.error(`Erro ao enviar mensagem para ${interessado.whatsapp}:`, smsResult.reason);
        }

        if (emailResult.status === 'fulfilled' || (smsResult.status === 'fulfilled' && smsResult.value.sent)) {
            await db.query(`UPDATE interessados SET status = 'enviado', enviado_em = NOW() WHERE id = ?`, [interessado.id]);
            return true;
        }

        return false;
    }

    async function notificarInteressadosPorCurso(curso) {
        if (!curso || curso.status !== 'ativo') return 0;

        const [interessados] = await db.query(
            `SELECT id, nome, whatsapp, email, perfil_curso
             FROM interessados
             WHERE status = 'aguardando'`
        );

        const interessadosDoCurso = interessados.filter(interessado => cursoCombinaComPerfil(curso, interessado.perfil_curso));
        let totalEnviados = 0;

        for (const interessado of interessadosDoCurso) {
            const enviado = await notificarInteressado(interessado, curso, interessado.perfil_curso);
            if (enviado) totalEnviados += 1;
        }

        return totalEnviados;
    }

    async function notificarNovoLeadSeHouverCursoAtivo(interessado) {
        const [cursosAtivos] = await db.query(
            `SELECT
                c.id,
                COALESCE(fc.curso, 'Curso') AS nome,
                COALESCE(fc2.categoria, 'Geral') AS categoria,
                COALESCE(fl.local, 'A definir') AS local,
                TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                c.status
             FROM cursos c
             LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
             LEFT JOIN filtro_categoria fc2 ON fc2.id = c.categoria_id
             LEFT JOIN filtro_local fl ON fl.id = c.local_id
             WHERE c.status = 'ativo'
             ORDER BY c.id DESC`
        );

        const cursoEncontrado = cursosAtivos.find(curso => cursoCombinaComPerfil(curso, interessado.perfil_curso));
        if (!cursoEncontrado) return false;

        return notificarInteressado(interessado, cursoEncontrado, interessado.perfil_curso);
    }

    async function enviarMensagemTwilio({ telefone, mensagem }) {
        const accountSid = TWILIO_ACCOUNT_SID;
        const authToken = TWILIO_AUTH_TOKEN;
        const fromNumber = TWILIO_FROM_NUMBER;
        const contentSid = TWILIO_CONTENT_SID;
        const contentVariables = TWILIO_CONTENT_VARIABLES;
        const usarWhatsApp = TWILIO_CHANNEL.toLowerCase() === "whatsapp" || String(fromNumber || "").toLowerCase().startsWith("whatsapp:");
        const canal = usarWhatsApp ? "whatsapp" : "sms";
        const toNumber = formatarNumeroTwilio(telefone || TWILIO_TO_NUMBER, usarWhatsApp);
        const from = formatarNumeroTwilio(fromNumber, usarWhatsApp);

        if (canal === "whatsapp" && WHATSAPP_PROVIDER === "evolution") {
            if (!toNumber) {
                return { sent: false, reason: "telefone-invalido", canal };
            }

            if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
                return { sent: false, reason: "evolution-nao-configurado", canal };
            }

            if (typeof fetch !== "function") {
                return { sent: false, reason: "evolution-fetch-indisponivel", canal };
            }

            const numeroDestino = String(toNumber)
                .replace(/^whatsapp:/i, "")
                .replace(/\D/g, "");

            if (!numeroDestino) {
                return { sent: false, reason: "telefone-invalido", canal };
            }

            try {
                const baseUrl = EVOLUTION_API_URL.replace(/\/$/, "");
                const resposta = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(EVOLUTION_INSTANCE)}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": EVOLUTION_API_KEY
                    },
                    body: JSON.stringify({
                        number: numeroDestino,
                        text: mensagem
                    })
                });

                if (!resposta.ok) {
                    return { sent: false, reason: `evolution-erro-http-${resposta.status}`, canal };
                }

                return { sent: true, canal };
            } catch {
                return { sent: false, reason: "evolution-falha", canal };
            }
        }

        if (!toNumber) {
            return { sent: false, reason: "telefone-invalido", canal };
        }

        if (!accountSid || !authToken || !from) {
            return { sent: false, reason: "twilio-nao-configurado", canal };
        }

        const client = twilio(accountSid, authToken);
        const payload = {
            to: toNumber,
            from
        };

        if (contentSid) {
            payload.contentSid = contentSid;
            if (contentVariables) {
                payload.contentVariables = contentVariables;
            }
        } else {
            payload.body = mensagem;
        }

        try {
            await client.messages.create(payload);
            return { sent: true, canal };
        } catch (err) {
            const code = String(err?.code || "");

            if (usarWhatsApp && code === "63015") {
                return { sent: false, reason: "whatsapp-sandbox-nao-ativado", canal };
            }
            if (code === "21211") {
                return { sent: false, reason: "telefone-invalido", canal };
            }
            if (code === "20003") {
                return { sent: false, reason: "twilio-auth-invalido", canal };
            }

            return {
                sent: false,
                reason: code ? `twilio-erro-${code}` : "twilio-falha",
                canal
            };
        }
    }

    function gerarProtocoloInscricao(idInscricao) {
        const idNum = Number(idInscricao) || 0;
        return `PI-${String(idNum).padStart(6, "0")}`;
    }

    async function enviarEmailRecebimentoPreInscricao({ nome, email, cursoNome, protocolo }) {
        if (!emailDisponivel) {
            throw new Error("smtp-indisponivel");
        }

        const anexos = montarAnexosEmailPadrao();
        const conteudoHtml = `
            <p class="text">Ola, <span class="highlight">${nome}</span>.</p>
            <p class="text">Recebemos sua pre-inscricao no curso <span class="highlight">${cursoNome}</span>.</p>

            <div class="info-box">
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Protocolo:</strong> ${protocolo}</p>
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Status:</strong> Em analise</p>
            </div>

            <div class="line"></div>
            <p class="text">Sua inscricao sera validada e voce recebera novo aviso por e-mail assim que a matricula for confirmada.</p>
        `;

        await mailer.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `PrÃ©-inscriÃ§Ã£o recebida - ${cursoNome}`,
            html: montarLayoutEmailBase({
                tituloSecao: "Pre-inscricao recebida",
                subtituloSecao: "Confirmacao de registro",
                conteudoHtml,
                exibirPonte: anexos.length > 0
            }),
            attachments: anexos
        });
    }

    async function enviarEmailMatriculaConfirmada({ nome, email, cursoNome, dataInicio, dataTermino, horaInicio, horaTermino, local, protocolo }) {
        if (!emailDisponivel) {
            throw new Error("smtp-indisponivel");
        }

        const anexos = montarAnexosEmailPadrao();
        const conteudoHtml = `
            <p class="text">Ola, <span class="highlight">${nome}</span>.</p>
            <p class="text">Sua matricula no curso <span class="highlight">${cursoNome}</span> foi confirmada.</p>

            <div class="info-box">
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Protocolo:</strong> ${protocolo}</p>
                ${dataInicio && dataTermino ? `<p class="info-item"><span class="info-icon">&#9679;</span><strong>Periodo:</strong> ${dataInicio} a ${dataTermino}</p>` : ""}
                ${horaInicio && horaTermino ? `<p class="info-item"><span class="info-icon">&#9679;</span><strong>Horario:</strong> ${horaInicio}h as ${horaTermino}h</p>` : ""}
                ${local ? `<p class="info-item"><span class="info-icon">&#9679;</span><strong>Local:</strong> ${local}</p>` : ""}
            </div>

            <div class="line"></div>
            <p class="text"><span class="highlight">Importante:</span> menores de idade devem estar acompanhados do responsavel legal.</p>
        `;

        await mailer.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `MatrÃ­cula Confirmada - ${cursoNome}`,
            html: montarLayoutEmailBase({
                tituloSecao: "Matricula confirmada",
                subtituloSecao: "Dados da turma",
                conteudoHtml,
                exibirPonte: anexos.length > 0,
                modoPonte: "cobertura"
            }),
            attachments: anexos
        });
    }

    async function enviarEmailExpiracaoVaga({ nome, email, cursoNome }) {
        if (!emailDisponivel) return;
        const anexos = montarAnexosEmailPadrao();
        const conteudoHtml = `
            <p class="text">OlÃ¡, <span class="highlight">${nome}</span>.</p>
            <p class="text">O seu prazo para confirmaÃ§Ã£o de matrÃ­cula no curso <span class="highlight">${cursoNome || "qualificaÃ§Ã£o"}</span> expirou.</p>
            <p class="text">Como a confirmaÃ§Ã£o nÃ£o foi realizada a tempo, sua vaga foi liberada para o prÃ³ximo candidato na lista de suplentes.</p>
        `;
        await mailer.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `Vaga Expirada - VixCursos`,
            html: montarLayoutEmailBase({
                tituloSecao: "Prazo Expirado",
                subtituloSecao: "MatrÃ­cula Cancelada",
                conteudoHtml,
                exibirPonte: anexos.length > 0,
                modoPonte: "cobertura"
            }),
            attachments: anexos
        });
    }

    async function enviarEmailPromocaoSuplente({ nome, email, cursoNome, prazoHoras }) {
        if (!emailDisponivel) return;
        const anexos = montarAnexosEmailPadrao();
        const conteudoHtml = `
            <p class="text">OlÃ¡, <span class="highlight">${nome}</span>.</p>
            <p class="text">Boas notÃ­cias! VocÃª foi promovido da lista de suplentes para <span class="highlight">Titular</span> no curso <span class="highlight">${cursoNome || "qualificaÃ§Ã£o"}</span>.</p>
            <p class="text">VocÃª tem o prazo de <strong>${prazoHoras} horas</strong> para confirmar sua matrÃ­cula no sistema.</p>
        `;
        await mailer.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `ConvocaÃ§Ã£o de Suplente - VixCursos`,
            html: montarLayoutEmailBase({
                tituloSecao: "Vaga DisponÃ­vel!",
                subtituloSecao: "ConvocaÃ§Ã£o de Suplente",
                conteudoHtml,
                exibirPonte: anexos.length > 0,
                modoPonte: "cobertura"
            }),
            attachments: anexos
        });
    }

    async function enviarEmailConvocacaoMatricula({ nome, email, cursoNome, prazoHoras, local, protocolo }) {
        if (!emailDisponivel) return;
        const anexos = montarAnexosEmailPadrao();
        const conteudoHtml = `
            <p class="text">OlÃ¡, <span class="highlight">${nome}</span>.</p>
            <p class="text">ParabÃ©ns! VocÃª foi convocado para a matrÃ­cula no curso <span class="highlight">${cursoNome}</span>.</p>
            <p class="text">VocÃª tem o prazo de <strong>${prazoHoras} horas</strong> para confirmar sua matrÃ­cula online no VixCursos.</p>
            <div class="info-box">
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Protocolo:</strong> ${protocolo}</p>
                <p class="info-item"><span class="info-icon">&#9679;</span><strong>Local:</strong> ${local || 'A definir'}</p>
            </div>
            <p class="text"><span class="highlight">Documentos necessÃ¡rios na matrÃ­cula:</span> CPF, RG e Comprovante de ResidÃªncia.</p>
        `;
        await mailer.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: `ConvocaÃ§Ã£o para MatrÃ­cula - ${cursoNome}`,
            html: montarLayoutEmailBase({
                tituloSecao: "ConvocaÃ§Ã£o de MatrÃ­cula",
                subtituloSecao: "AÃ§Ã£o requerida",
                conteudoHtml,
                exibirPonte: anexos.length > 0,
                modoPonte: "cobertura"
            }),
            attachments: anexos
        });
    }

    app.post("/api/admin/login", (req, res) => {
        const username = String(req.body.username || "").trim();
        const password = String(req.body.password || "").trim();

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return res.status(401).json({ error: "Credenciais invalidas" });
        }

        const token = jwt.sign({ username: ADMIN_USERNAME }, ADMIN_JWT_SECRET, { expiresIn: "8h" });
        res.setHeader("Set-Cookie", criarCookieAdmin(token));
        return res.json({ ok: true });
    });

    app.post("/api/admin/logout", (req, res) => {
        res.setHeader("Set-Cookie", limparCookieAdmin());
        return res.json({ ok: true });
    });

    app.get("/api/admin/me", (req, res) => {
        const payload = verificarTokenAdmin(req);
        if (!payload) {
            return res.status(401).json({ authenticated: false });
        }

        return res.json({ authenticated: true, username: payload.username || ADMIN_USERNAME });
    });

    const tabelas = {
        curso: "filtro_curso", 
        idade: "filtro_idade",
        categoria: "filtro_categoria",
        modalidade: "filtro_modalidade",
        local: "filtro_local"
    };

    const FALLBACK_CURSOS = [
        {
            id: 1,
            nome: "Cabeleireiro Profissional",
            vagas_totais: 20,
            inscritos: 0,
            vagas_disponiveis: 20,
            vagas: 20,
            status: "ativo",
            horario_inicio: "13:30",
            horario_termino: "17:30",
            data_inicio: "01/07/2026",
            data_termino: "15/08/2026",
            categoria: "Beleza",
            idade_min: "16",
            idade_max: "80",
            modalidade: "Presencial",
            local: "SENAI CÃ­cero Freire",
            descricao: "Curso de tÃ©cnicas de cabeleireiro profissional, cortes modernos, escovaÃ§Ã£o e tratamento de fios.",
            competencias: "Corte feminino, hidrataÃ§Ã£o avanÃ§ada, tÃ©cnicas de colorimetria bÃ¡sica",
            pre_requisitos: "Ensino Fundamental completo e idade mÃ­nima de 16 anos",
            carga_horaria: 80,
            nivel_empregabilidade: "alta",
            video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            faixa_salarial_min: 1500.00,
            faixa_salarial_max: 3500.00
        },
        {
            id: 2,
            nome: "Corte e Costura",
            vagas_totais: 15,
            inscritos: 0,
            vagas_disponiveis: 15,
            vagas: 15,
            status: "ativo",
            horario_inicio: "08:00",
            horario_termino: "12:00",
            data_inicio: "05/07/2026",
            data_termino: "10/09/2026",
            categoria: "Moda",
            idade_min: "16",
            idade_max: "80",
            modalidade: "Presencial",
            local: "SENAI Porto de Santana",
            descricao: "Aprenda corte, costura bÃ¡sica e avanÃ§ada, modelagem de roupas e confecÃ§Ã£o de peÃ§as completas.",
            competencias: "Modelagem plana, costura industrial, acabamento fino e regulagem de mÃ¡quinas",
            pre_requisitos: "Ensino Fundamental completo e idade mÃ­nima de 16 anos",
            carga_horaria: 120,
            nivel_empregabilidade: "media",
            video_url: null,
            faixa_salarial_min: 1800.00,
            faixa_salarial_max: 4000.00
        },
        {
            id: 3,
            nome: "CulinÃ¡ria BÃ¡sica",
            vagas_totais: 18,
            inscritos: 0,
            vagas_disponiveis: 18,
            vagas: 18,
            status: "ativo",
            horario_inicio: "18:30",
            horario_termino: "22:30",
            data_inicio: "10/07/2026",
            data_termino: "30/08/2026",
            categoria: "Gastronomia",
            idade_min: "18",
            idade_max: "80",
            modalidade: "Presencial",
            local: "SENAI CÃ­cero Freire",
            descricao: "IntroduÃ§Ã£o Ã s artes culinÃ¡rias, tÃ©cnicas de corte de legumes, manipulaÃ§Ã£o de carnes e preparo de molhos clÃ¡ssicos.",
            competencias: "TÃ©cnicas de facas, preparo de massas frescas, molhos e sobremesas finas",
            pre_requisitos: "Ensino MÃ©dio completo e idade mÃ­nima de 18 anos",
            carga_horaria: 100,
            nivel_empregabilidade: "alta",
            video_url: null,
            faixa_salarial_min: 1600.00,
            faixa_salarial_max: 3800.00
        },
        {
            id: 4,
            nome: "Desenvolvimento Web",
            vagas_totais: 25,
            inscritos: 0,
            vagas_disponiveis: 25,
            vagas: 25,
            status: "ativo",
            horario_inicio: "14:00",
            horario_termino: "17:00",
            data_inicio: "02/07/2026",
            data_termino: "20/08/2026",
            categoria: "Tecnologia",
            idade_min: "14",
            idade_max: "80",
            modalidade: "HÃ­brido",
            local: "SENAI Porto de Santana",
            descricao: "Curso de lÃ³gica de programaÃ§Ã£o, banco de dados bÃ¡sico e desenvolvimento de sistemas web simples.",
            competencias: "LÃ³gica de programaÃ§Ã£o com Javascript, fundamentos de bancos de dados relacionais, HTML5 e CSS3",
            pre_requisitos: "Ensino Fundamental II completo e idade mÃ­nima de 14 anos",
            carga_horaria: 60,
            nivel_empregabilidade: "alta",
            video_url: null,
            faixa_salarial_min: 2200.00,
            faixa_salarial_max: 6000.00
        },
        {
            id: 5,
            nome: "Primeiros Socorros",
            vagas_totais: 30,
            inscritos: 0,
            vagas_disponiveis: 30,
            vagas: 30,
            status: "ativo",
            horario_inicio: "08:00",
            horario_termino: "12:00",
            data_inicio: "12/07/2026",
            data_termino: "30/09/2026",
            categoria: "SaÃºde",
            idade_min: "18",
            idade_max: "80",
            modalidade: "Presencial",
            local: "Centro de FormaÃ§Ã£o Profissional do Senac VitÃ³ria",
            descricao: "CapacitaÃ§Ã£o em atendimento de primeiros socorros em situaÃ§Ãµes de emergÃªncia domÃ©stica e profissional.",
            competencias: "ReanimaÃ§Ã£o cardiopulmonar, curativos emergenciais, transporte seguro de vÃ­timas",
            pre_requisitos: "Ensino Fundamental completo e idade mÃ­nima de 18 anos",
            carga_horaria: 40,
            nivel_empregabilidade: "media",
            video_url: null,
            faixa_salarial_min: 1400.00,
            faixa_salarial_max: 2500.00
        }
    ];

    // ============================================================
    // FILTROS
    // ============================================================
    app.get("/public/:tipo", async (req, res) => {
        try {
            const tabela = tabelas[req.params.tipo];
            if (!tabela) return res.status(400).json({ error: "Filtro invÃ¡lido" });

            let rows = [];
            if (req.params.tipo === 'modalidade' && req.query.categoria_id) {
                const [result] = await db.query(
                    `SELECT * FROM filtro_modalidade WHERE categoria_id = ? ORDER BY id ASC`,
                    [req.query.categoria_id]
                );
                rows = result;
            } else {
                const [result] = await db.query(`SELECT * FROM ${tabela} ORDER BY id ASC`);
                rows = result;
            }
            
            
            res.json(rows);
        } catch (err) {
            if (eErroTimeoutBanco(err)) {
                console.warn(`[db] Falha na conexao do banco ao buscar filtro ${req.params.tipo}, servindo fallback estático.`);
                if (req.params.tipo === 'categoria') {
                    return res.json([
                        { id: 1, categoria: "Beleza" },
                        { id: 2, categoria: "Moda" },
                        { id: 3, categoria: "Gastronomia" },
                        { id: 4, categoria: "Humanas" },
                        { id: 5, categoria: "Veículos" }
                    ]);
                }
                if (req.params.tipo === 'local') {
                    return res.json([
                        { id: 1, local: "Bento Ferreira" },
                        { id: 2, local: "Centro" },
                        { id: 3, local: "Jardim da Penha" },
                        { id: 4, local: "Jardim Camburi" },
                        { id: 5, local: "MaruÃ­pe" },
                        { id: 6, local: "SÃ£o Pedro" },
                        { id: 7, local: "Goiabeiras" },
                        { id: 8, local: "Praia do Canto" }
                    ]);
                }
                if (req.params.tipo === 'modalidade') {
                    return res.json([
                        { id: 1, modalidade: "Presencial" },
                        { id: 2, modalidade: "HÃ­brido" },
                        { id: 3, modalidade: "Online" }
                    ]);
                }
            }
            return responderErroBanco(res, err, "Erro ao buscar filtro");
        }
    });

    // ============================================================
    // LISTAR CURSOS
    // ============================================================
    app.get("/api/cursos-public", async (req, res) => {
        try {
            const querySql = `
                SELECT 
                    c.id, 
                    COALESCE(fcurso.curso, 'Curso sem nome') AS nome, 
                    c.vagas AS vagas_totais, 
                    COALESCE(SUM(CASE WHEN pi.status_inscricao = 'titular' THEN 1 ELSE 0 END), 0) AS inscritos,
                    (c.vagas - COALESCE(SUM(CASE WHEN pi.status_inscricao = 'titular' THEN 1 ELSE 0 END), 0)) AS vagas_disponiveis,
                    c.status,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio, 
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    COALESCE(fc.categoria, 'Geral') AS categoria, 
                    COALESCE(fiMin.idade::text, '-') AS idade_min, 
                    COALESCE(fiMax.idade::text, '-') AS idade_max,
                    COALESCE(fm.modalidade, 'NÃ£o informada') AS modalidade, 
                    COALESCE(fl.local, 'VitÃ³ria') AS local, 
                    c.data_publicacao,
                    c.data_abertura_inscricao,
                    c.data_encerramento_inscricao,
                    COALESCE(c.acessos_contador, 0) AS acessos_contador,
                    c.descricao,
                    c.carga_horaria,
                    c.criado_em
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_idade fiMin ON fiMin.id = c.idade_min
                LEFT JOIN filtro_idade fiMax ON fiMax.id = c.idade_max
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                LEFT JOIN pre_inscricoes pi ON pi.curso_id = c.id
                WHERE c.status = 'ativo' AND (c.data_publicacao IS NULL OR c.data_publicacao <= NOW())
                GROUP BY
                    c.id,
                    fcurso.curso,
                    c.vagas,
                    c.status,
                    c.horario_inicio,
                    c.horario_termino,
                    c.data_inicio,
                    c.data_termino,
                    fc.categoria,
                    fiMin.idade,
                    fiMax.idade,
                    fm.modalidade,
                    fl.local,
                    c.data_publicacao,
                    c.data_abertura_inscricao,
                    c.data_encerramento_inscricao,
                    c.acessos_contador,
                    c.descricao,
                    c.carga_horaria,
                    c.criado_em
                ORDER BY c.id DESC
            `;
            const [rows] = await db.query(querySql);
            
            const cursosFormatados = rows.map(curso => {
                const vagasDisponiveis = Number(curso.vagas_disponiveis);
                return {
                    ...curso,
                    vagas: vagasDisponiveis,
                    disponivel: vagasDisponiveis > 0
                };
            });
            
            res.json(cursosFormatados);
        } catch (err) {
            if (eErroTimeoutBanco(err)) {
                console.warn("[db] Falha na conexao do banco ao buscar cursos pÃºblicos, servindo fallback estÃ¡tico.");
                return res.json(FALLBACK_CURSOS);
            }
            return responderErroBanco(res, err, "Erro na rota /api/cursos-public:");
        }
    });

    app.get("/api/cursos-public/:id", async (req, res) => {
        const { id } = req.params;
        try {
            const querySql = `
                SELECT 
                    c.id, 
                    COALESCE(fcurso.curso, 'Curso sem nome') AS nome, 
                    c.vagas AS vagas_totais, 
                    COALESCE(SUM(CASE WHEN pi.status_inscricao = 'titular' THEN 1 ELSE 0 END), 0) AS inscritos,
                    (c.vagas - COALESCE(SUM(CASE WHEN pi.status_inscricao = 'titular' THEN 1 ELSE 0 END), 0)) AS vagas_disponiveis,
                    c.status,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio, 
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    COALESCE(fc.categoria, 'Geral') AS categoria, 
                    COALESCE(fiMin.idade::text, '-') AS idade_min, 
                    COALESCE(fiMax.idade::text, '-') AS idade_max,
                    COALESCE(fm.modalidade, 'NÃ£o informada') AS modalidade, 
                    COALESCE(fl.local, 'VitÃ³ria') AS local, 
                    c.data_publicacao,
                    c.data_abertura_inscricao,
                    c.data_encerramento_inscricao,
                    COALESCE(c.acessos_contador, 0) AS acessos_contador,
                    c.descricao,
                    c.carga_horaria,
                    c.criado_em
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_idade fiMin ON fiMin.id = c.idade_min
                LEFT JOIN filtro_idade fiMax ON fiMax.id = c.idade_max
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                LEFT JOIN pre_inscricoes pi ON pi.curso_id = c.id
                WHERE c.id = ?
                GROUP BY
                    c.id,
                    fcurso.curso,
                    c.vagas,
                    c.status,
                    c.horario_inicio,
                    c.horario_termino,
                    c.data_inicio,
                    c.data_termino,
                    fc.categoria,
                    fiMin.idade,
                    fiMax.idade,
                    fm.modalidade,
                    fl.local,
                    c.data_publicacao,
                    c.data_abertura_inscricao,
                    c.data_encerramento_inscricao,
                    c.acessos_contador,
                    c.descricao,
                    c.carga_horaria,
                    c.criado_em
            `;
            const [rows] = await db.query(querySql, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: "Curso nÃ£o encontrado" });
            }
            
            const vagasDisponiveis = Number(rows[0].vagas_disponiveis);
            const curso = {
                ...rows[0],
                vagas: vagasDisponiveis,
                disponivel: vagasDisponiveis > 0
            };
            
            // Registrar buscas e cliques dos usuÃ¡rios no catÃ¡logo
            await db.query("UPDATE cursos SET acessos_contador = COALESCE(acessos_contador, 0) + 1 WHERE id = ?", [id]);

            res.json(curso);
        } catch (err) {
            if (eErroTimeoutBanco(err)) {
                console.warn("[db] Falha na conexao do banco ao buscar detalhes do curso, servindo fallback estÃ¡tico.");
                const fallbackCurso = FALLBACK_CURSOS.find(c => c.id === Number(id));
                if (fallbackCurso) {
                    return res.json(fallbackCurso);
                }
            }
            return responderErroBanco(res, err, "Erro na rota /api/cursos-public/:id:");
        }
    });

    /**
     * Endpoint para verificar disponibilidade de vagas de um curso
     * GET /api/cursos-public/:id/vagas
     * Retorna: { disponivel: boolean, vagas_disponiveis: number, vagas_totais: number, inscritos: number }
     */
    app.get("/api/cursos-public/:id/vagas", async (req, res) => {
        try {
            const { id } = req.params;
            
            const [rows] = await db.query(`
                SELECT 
                    c.vagas AS vagas_totais,
                    COALESCE(COUNT(pi.id), 0) AS inscritos,
                    (c.vagas - COALESCE(COUNT(pi.id), 0)) AS vagas_disponiveis,
                    c.status
                FROM cursos c
                LEFT JOIN pre_inscricoes pi ON pi.curso_id = c.id
                WHERE c.id = ?
                GROUP BY c.id
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ error: "Curso nÃ£o encontrado" });
            }
            
            const resultado = rows[0];
            const disponivel = resultado.vagas_disponiveis > 0 && resultado.status !== 'esgotado';
            
            res.json({
                disponivel,
                vagas_disponiveis: resultado.vagas_disponiveis,
                vagas_totais: resultado.vagas_totais,
                inscritos: resultado.inscritos,
                status: resultado.status
            });
        } catch (err) {
            if (eErroTimeoutBanco(err)) {
                console.warn("[db] Falha na conexao do banco ao buscar vagas do curso, servindo fallback estÃ¡tico.");
                const fallbackCurso = FALLBACK_CURSOS.find(c => c.id === Number(req.params.id));
                if (fallbackCurso) {
                    return res.json({
                        disponivel: fallbackCurso.vagas_disponiveis > 0,
                        vagas_disponiveis: fallbackCurso.vagas_disponiveis,
                        vagas_totais: fallbackCurso.vagas_totais,
                        inscritos: fallbackCurso.inscritos,
                        status: fallbackCurso.status
                    });
                }
            }
            return responderErroBanco(res, err, "Erro ao verificar vagas do curso:");
        }
    });

    app.get("/cursos", exigirAuthAdmin, async (req, res) => {
        try {
            const { id } = req.query;

            const querySql = `
                SELECT 
                    c.id, 
                    COALESCE(fcurso.curso, 'Curso sem nome') AS nome, 
                    c.vagas, 
                    c.status,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio, 
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    COALESCE(fc.categoria, 'Geral') AS categoria, 
                    COALESCE(fiMin.idade::text, '-') AS idade_min, 
                    COALESCE(fiMax.idade::text, '-') AS idade_max,
                    COALESCE(fm.modalidade, 'NÃ£o informada') AS modalidade, 
                    COALESCE(fl.local, 'VitÃ³ria') AS local, 
                    c.criado_em
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_idade fiMin ON fiMin.id = c.idade_min
                LEFT JOIN filtro_idade fiMax ON fiMax.id = c.idade_max
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                ${id ? "WHERE c.id = ?" : ""}
                ORDER BY c.id DESC
            `;
            const [rows] = await db.query(querySql, id ? [id] : []);

            res.json(rows);
        } catch (err) {
            return responderErroBanco(res, err, "Erro na rota /cursos:");
        }
    });

    // ============================================================
    // CRIAR CURSO COM DISPARO AUTOMÃTICO VIA GMAIL (CORRIGIDO E BLINDADO)
    // ============================================================
    app.post("/cursos", exigirAuthAdmin, async (req, res) => {
        try {
            const { 
                curso, vagas, idade_min, idade_max, local, modalidade, 
                data_inicio, data_termino, horario_inicio, horario_termino, categoria_id 
            } = req.body;

            if (!curso) return res.status(400).json({ error: "Campo 'curso' Ã© obrigatÃ³rio." });

            // 1. Grava o curso (Tratamento contra erro de "undefined")
            const [result] = await db.query(`
                INSERT INTO cursos 
                (curso_id, vagas, idade_min, idade_max, local_id, modalidade_id, data_inicio, data_termino, horario_inicio, horario_termino, categoria_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING id
            `, [
                curso, vagas || 0, idade_min || null, idade_max || null, 
                local || null, modalidade || null, data_inicio || null, 
                data_termino || null, horario_inicio || null, horario_termino || null, 
                categoria_id || null
            ]);

            // 2. Procura os nomes reais para o e-mail (usando LEFT JOIN para evitar crash)
            const [linhas] = await db.query(`
                SELECT f.curso, l.local, cat.categoria,
                       TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                       TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                       TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                       TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino
                FROM cursos c
                LEFT JOIN filtro_curso f ON c.curso_id = f.id
                LEFT JOIN filtro_local l ON c.local_id = l.id
                LEFT JOIN filtro_categoria cat ON c.categoria_id = cat.id
                WHERE c.id = ?
            `, [result[0].id]);

            const info = linhas[0];

            // TRAVA DE SEGURANÃ‡A: Se o curso nÃ£o tiver categoria informada, pula a automaÃ§Ã£o de email
            if (!info || !info.categoria) {
                return res.json({ status: "ok", msg: "Curso criado (sem avisos automÃ¡ticos, pois a categoria estava vazia)." });
            }

                const cursoCriado = {
                    id: result[0].id,
                    nome: info.curso || 'Curso',
                    categoria: info.categoria || 'Geral',
                    local: info.local || 'A definir',
                    data_inicio: info.data_inicio || null,
                    data_termino: info.data_termino || null,
                    horario_inicio: info.horario_inicio || null,
                    horario_termino: info.horario_termino || null,
                    status: 'ativo'
                };

                await notificarInteressadosPorCurso(cursoCriado);

            res.json({ status: "ok", msg: "Curso criado e avisos processados automaticamente." });

        } catch (err) {
            return responderErroBanco(res, err, "Erro na automaÃ§Ã£o:");
        }
    });

    // ============================================================
    // ESGOTAR CURSO
    // ============================================================
    app.put("/cursos/esgotar/:id", exigirAuthAdmin, async (req, res) => {
        try {
            await db.query(`UPDATE cursos SET status = 'esgotado' WHERE id = ?`, [req.params.id]);
            res.json({ status: "curso esgotado" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao atualizar status");
        }
    });
    // ============================================================
    // INSCRIÃ‡ÃƒO
    // ============================================================
    app.post("/inscricao", async (req, res) => {
        try {
            const {
                nome, email, telefone, cpf, rg, curso_id,
                mora_vitoria, escolaridade, cep, numero, rua, bairro, municipio,
                possui_necessidade_especial, tipo_necessidade_especial,
                cpf_documento, rg_documento,
                data_nascimento, genero, raca_cor, telefone_alternativo,
                responsavel_nome, responsavel_cpf, responsavel_parentesco,
                responsavel_telefone, responsavel_email, responsavel_autorizacao,
                deficiencia_adaptacoes, deficiencia_recursos,
                objetivo, autoriza_lgpd
            } = req.body;

            const cpfLimpo = normalizarCpf(cpf);
            const rgNormalizado = normalizarRg(rg);
            
            const possuiNecessidadeEspecial = String(possui_necessidade_especial || "nao").toLowerCase() === "sim" ? "sim" : "nao";
            const tipoNecessidadeEspecial = possuiNecessidadeEspecial === "sim" ? String(tipo_necessidade_especial || "").trim().slice(0, 120) : null;

            if (!nome || !email || !telefone || !cpfLimpo || !rgNormalizado || !curso_id || !cpf_documento || !rg_documento) {
                return res.status(400).json({ error: "Preencha todos os campos obrigatÃ³rios, inclusive CPF, RG e as fotos dos dois documentos." });
            }

            if (String(municipio || "").trim().toLowerCase() !== "vitoria") {
                return res.status(400).json({ error: "Os cursos do VixCursos sÃ£o destinados exclusivamente a moradores de VitÃ³ria - ES. Seu endereÃ§o nÃ£o estÃ¡ dentro do municÃ­pio." });
            }

            // Check duplicate in same course
            const [inscricaoExistente] = await db.query(
                `SELECT id FROM pre_inscricoes WHERE curso_id = ? AND cpf = ? LIMIT 1`,
                [curso_id, cpfLimpo]
            );

            if (inscricaoExistente.length) {
                return res.status(409).json({
                    error: "VocÃª jÃ¡ possui prÃ©-inscriÃ§Ã£o para este curso com este CPF."
                });
            }

            // Limit check (MÃ³dulo 3.1 & 3.2)
            const [inscricoesCpf] = await db.query(
                `SELECT COUNT(*) as total FROM pre_inscricoes WHERE cpf = ?`,
                [cpfLimpo]
            );
            const totalInscricoesCpf = inscricoesCpf[0].total;

            const [configRows] = await db.query(`SELECT limite_inscricoes_semestre, prazo_confirmacao_horas FROM configuracoes LIMIT 1`);
            const config = configRows[0] || { limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 };
            const limite = config.limite_inscricoes_semestre;
            const prazoHoras = config.prazo_confirmacao_horas;

            if (totalInscricoesCpf >= limite) {
                return res.status(400).json({
                    error: `VocÃª jÃ¡ possui o limite de ${limite} inscriÃ§Ãµes ativas neste perÃ­odo.`
                });
            }

            const [curso] = await db.query(`
                SELECT
                    c.vagas,
                    c.status,
                    COALESCE(fc.curso, 'Curso') AS nome_curso,
                    COALESCE(fl.local, 'A definir') AS local_nome,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino
                FROM cursos c
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE c.id = ?
            `, [curso_id]);

            if (!curso.length) return res.status(404).json({ error: "Curso nÃ£o encontrado" });

            // Count current titulares
            const [titularesRows] = await db.query(
                `SELECT COUNT(*) as total FROM pre_inscricoes WHERE curso_id = ? AND status_inscricao = 'titular'`,
                [curso_id]
            );
            const titularesAtuais = titularesRows[0].total;
            const vagasTotais = curso[0].vagas;
            const vagasRestantes = vagasTotais - titularesAtuais;

            // Determine status
            let status_inscricao = "titular";
            let aviso = null;

            if (possuiNecessidadeEspecial === "sim") {
                status_inscricao = "titular"; // guaranteed PcD
            } else if (totalInscricoesCpf >= 2) {
                status_inscricao = "suplente";
                aviso = "VocÃª jÃ¡ possui 2 inscriÃ§Ãµes ativas. Esta inscriÃ§Ã£o entrarÃ¡ como suplente automaticamente.";
            } else if (vagasRestantes <= 0 || curso[0].status === "esgotado") {
                status_inscricao = "suplente";
                aviso = "Este curso atingiu o nÃºmero mÃ¡ximo de inscriÃ§Ãµes. Esta inscriÃ§Ã£o entrarÃ¡ como suplente automaticamente.";
            } else {
                status_inscricao = "titular";
                if (totalInscricoesCpf === 1) {
                    aviso = "VocÃª agora estÃ¡ concorrendo a 2 cursos ao mesmo tempo.";
                }
            }

            const dataNascimentoValida = data_nascimento ? data_nascimento : null;

            const [insertResult] = await db.query(`
                INSERT INTO pre_inscricoes (
                    nome, email, telefone, cpf, rg, curso_id,
                    mora_vitoria, escolaridade, cep, numero, rua, bairro, municipio,
                    possui_necessidade_especial, tipo_necessidade_especial,
                    cpf_documento, rg_documento,
                    data_nascimento, genero, raca_cor, telefone_alternativo,
                    responsavel_nome, responsavel_cpf, responsavel_parentesco,
                    responsavel_telefone, responsavel_email, responsavel_autorizacao,
                    deficiencia_adaptacoes, deficiencia_recursos,
                    objetivo, autoriza_lgpd, status_inscricao,
                    convocado_em, vaga_expira_em
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                        CASE WHEN ? = 'titular' THEN NOW() ELSE NULL END,
                        CASE WHEN ? = 'titular' THEN NOW() + INTERVAL '${prazoHoras} hours' ELSE NULL END)
                RETURNING id
            `, [
                nome, email, telefone, cpfLimpo, rgNormalizado, curso_id,
                mora_vitoria || null, escolaridade || null, cep || null, numero || null, rua || null, bairro || null, municipio || null,
                possuiNecessidadeEspecial, tipoNecessidadeEspecial,
                cpf_documento, rg_documento,
                dataNascimentoValida, genero || null, raca_cor || null, telefone_alternativo || null,
                responsavel_nome || null, responsavel_cpf ? normalizarCpf(responsavel_cpf) : null, responsavel_parentesco || null,
                responsavel_telefone || null, responsavel_email || null, responsavel_autorizacao || null,
                deficiencia_adaptacoes || null, deficiencia_recursos || null,
                objetivo || null, autoriza_lgpd || 'sim', status_inscricao,
                status_inscricao, status_inscricao
            ]);

            const insertId = insertResult[0].id;
            const protocolo = gerarProtocoloInscricao(insertId);

            // Update course status if now full
            const novoStatus = (vagasRestantes - (status_inscricao === 'titular' ? 1 : 0)) <= 0 ? 'esgotado' : 'ativo';
            await db.query(`UPDATE cursos SET status = ? WHERE id = ?`, [novoStatus, curso_id]);

            const dadosConfirmacao = {
                cursoNome: curso[0].nome_curso,
                dataInicio: formatarDataBR(curso[0].data_inicio),
                dataTermino: formatarDataBR(curso[0].data_termino),
                horaInicio: formatarHora(curso[0].horario_inicio),
                horaTermino: formatarHora(curso[0].horario_termino),
                local: curso[0].local_nome
            };

            const smsMensagem = status_inscricao === 'suplente'
                ? `VixCursos: Sua pre-inscricao no curso ${dadosConfirmacao.cursoNome} foi recebida como SUPLENTE (fila de espera). Protocolo: ${protocolo}.`
                : montarSmsConfirmacao(dadosConfirmacao);

            const [emailResult, smsResult] = await Promise.allSettled([
                status_inscricao === 'suplente'
                    ? enviarEmailRecebimentoPreInscricao({ nome, email, cursoNome: dadosConfirmacao.cursoNome, protocolo })
                    : enviarEmailConvocacaoMatricula({ nome, email, cursoNome: dadosConfirmacao.cursoNome, prazoHoras, local: dadosConfirmacao.local, protocolo }),
                enviarMensagemTwilio({ telefone, mensagem: smsMensagem })
            ]);

            const notificacoes = {
                email: emailResult.status === "fulfilled" ? "enviado" : "falhou",
                sms: smsResult.status === "fulfilled" && smsResult.value.sent ? "enviado" : "falhou",
                canal: smsResult.status === "fulfilled" && smsResult.value.canal ? smsResult.value.canal : "sms"
            };

            res.json({
                status: "ok",
                msg: "InscriÃ§Ã£o realizada com sucesso",
                protocolo,
                status_inscricao,
                aviso,
                notificacoes
            });
        } catch (err) {
            if (err && (err.code === "23505" || err.code === "ER_DUP_ENTRY")) {
                return res.status(409).json({
                    error: "VocÃª jÃ¡ possui prÃ©-inscriÃ§Ã£o para este curso com este CPF."
                });
            }
            return responderErroBanco(res, err, "Erro na rota /inscricao:");
        }
    });

    app.get("/api/pre-inscricoes/por-cpf/:cpf", async (req, res) => {
        try {
            const cpfLimpo = normalizarCpf(req.params.cpf);

            if (cpfLimpo.length !== 11) {
                return res.status(400).json({ error: "CPF invÃ¡lido" });
            }

            const [rows] = await db.query(
                `SELECT
                    id, nome, email, telefone, telefone_alternativo, cpf, rg,
                    cep, numero, rua, bairro, municipio, mora_vitoria, escolaridade,
                    possui_necessidade_especial, tipo_necessidade_especial,
                    deficiencia_adaptacoes, deficiencia_recursos,
                    data_nascimento, genero, raca_cor,
                    responsavel_nome, responsavel_cpf, responsavel_parentesco,
                    responsavel_telefone, responsavel_email, responsavel_autorizacao,
                    autoriza_lgpd, objetivo, cpf_documento, rg_documento
                FROM pre_inscricoes
                WHERE cpf = ?
                ORDER BY criado_em DESC
                LIMIT 1`,
                [cpfLimpo]
            );

            const [historico] = await db.query(`
                SELECT 
                    pi.id, pi.curso_id, pi.status_inscricao, pi.matricula_confirmada, pi.situacao_final,
                    COALESCE(fc.curso, 'Curso') AS curso_nome,
                    COALESCE(fl.local, 'VitÃ³ria') AS local_nome
                FROM pre_inscricoes pi
                LEFT JOIN cursos c ON c.id = pi.curso_id
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE pi.cpf = ?
                ORDER BY pi.criado_em DESC
            `, [cpfLimpo]);

            if (!rows.length) {
                return res.status(404).json({ found: false, data: null, historico: [] });
            }

            res.json({ found: true, data: rows[0], historico });
        } catch (err) {
            console.error("Erro ao buscar inscriÃ§Ã£o por CPF:", err);
            res.status(500).json({ error: "Erro ao buscar CPF" });
        }
    });

    // ============================================================
    // LISTAR INSCRITOS DE UM CURSO ESPECÃFICO (Atualizado)
    // ============================================================
    app.get("/inscritos/:idCurso", exigirAuthAdmin, async (req, res) => {
        try {
            const { idCurso } = req.params;
            try {
                const [rows] = await db.query(`
                    SELECT
                        id,
                        nome,
                        email,
                        telefone,
                        cpf,
                        rg,
                        mora_vitoria,
                        escolaridade,
                        cep,
                        numero,
                        rua,
                        bairro,
                        municipio,
                        possui_necessidade_especial,
                        tipo_necessidade_especial,
                        cpf_documento,
                        rg_documento,
                        matricula_confirmada,
                        matricula_confirmada_em,
                        criado_em AS data
                    FROM pre_inscricoes
                    WHERE curso_id = ?
                    ORDER BY criado_em DESC
                `, [idCurso]);

                return res.json(rows);
            } catch (erroColuna) {
                if (erroColuna && erroColuna.code === "42703") {
                    console.warn("[inscritos] Colunas de matricula ainda nao existem. Aplicando fallback.");

                    const [rowsFallback] = await db.query(`
                        SELECT
                            id,
                            nome,
                            email,
                            telefone,
                            cpf,
                            rg,
                            mora_vitoria,
                            escolaridade,
                            cep,
                            numero,
                            rua,
                            bairro,
                            municipio,
                            possui_necessidade_especial,
                            tipo_necessidade_especial,
                            cpf_documento,
                            rg_documento,
                            0 AS matricula_confirmada,
                            NULL::timestamp AS matricula_confirmada_em,
                            criado_em AS data
                        FROM pre_inscricoes
                        WHERE curso_id = ?
                        ORDER BY criado_em DESC
                    `, [idCurso]);

                    return res.json(rowsFallback);
                }

                throw erroColuna;
            }
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao buscar inscritos");
        }
    });

    // ============================================================
    // CONFIRMAR MATRÃCULA E DISPARAR EMAIL
    // ============================================================
    app.put("/api/inscricoes/:id/confirmar", exigirAuthAdmin, async (req, res) => {
        try {
            const idInscricao = req.params.id;

            const [rows] = await db.query(
                `SELECT
                    pi.id,
                    pi.nome,
                    pi.email,
                    pi.matricula_confirmada,
                    COALESCE(fc.curso, 'Curso') AS curso_nome,
                    COALESCE(fl.local, 'A definir') AS local_nome,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino
                 FROM pre_inscricoes pi
                 LEFT JOIN cursos c ON c.id = pi.curso_id
                 LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                 LEFT JOIN filtro_local fl ON fl.id = c.local_id
                 WHERE pi.id = ?
                 LIMIT 1`,
                [idInscricao]
            );

            if (!rows.length) {
                return res.status(404).json({ error: "InscriÃ§Ã£o nÃ£o encontrada." });
            }

            const inscricao = rows[0];

            if (Number(inscricao.matricula_confirmada) === 1) {
                return res.json({ status: "ja-confirmada", msg: "MatrÃ­cula jÃ¡ estava confirmada." });
            }

            await db.query(
                `UPDATE pre_inscricoes
                 SET matricula_confirmada = 1,
                     matricula_confirmada_em = NOW()
                 WHERE id = ?`,
                [idInscricao]
            );

            let emailStatus = "enviado";
            let emailErro = null;
            try {
                const protocolo = gerarProtocoloInscricao(inscricao.id);
                await enviarEmailMatriculaConfirmada({
                    nome: inscricao.nome,
                    email: inscricao.email,
                    cursoNome: inscricao.curso_nome,
                    dataInicio: inscricao.data_inicio,
                    dataTermino: inscricao.data_termino,
                    horaInicio: inscricao.horario_inicio,
                    horaTermino: inscricao.horario_termino,
                    local: inscricao.local_nome,
                    protocolo
                });
            } catch (err) {
                emailStatus = "falhou";
                emailErro = err?.code || err?.responseCode || err?.message || "erro-desconhecido";
                console.error("Falha ao enviar email de matrÃ­cula confirmada:", err);
            }

            return res.json({ status: "ok", email: emailStatus, email_erro: emailErro });
        } catch (err) {
            console.error("Erro ao confirmar matrÃ­cula:", err);
            return res.status(500).json({ error: "Erro ao confirmar matrÃ­cula." });
        }
    });

    // ============================================================
    // EXCLUIR INSCRIÃ‡ÃƒO E LIBERAR VAGA AUTOMATICAMENTE
    // ============================================================
    app.delete("/api/inscricoes/:id", exigirAuthAdmin, async (req, res) => {
        try {
            const idInscricao = req.params.id;

            // 1. Descobrir de qual curso Ã© essa inscriÃ§Ã£o
            const [inscricao] = await db.query(`SELECT curso_id FROM pre_inscricoes WHERE id = ?`, [idInscricao]);
            
            if (!inscricao.length) {
                return res.status(404).json({ error: "InscriÃ§Ã£o nÃ£o encontrada no sistema." });
            }

            const cursoId = inscricao[0].curso_id;

            // 2. Apagar a inscriÃ§Ã£o
            await db.query(`DELETE FROM pre_inscricoes WHERE id = ?`, [idInscricao]);

            const [cursoRows] = await db.query(`
                SELECT
                    c.id,
                    COALESCE(fcurso.curso, 'Curso') AS nome,
                    COALESCE(fc.categoria, 'Geral') AS categoria,
                    COALESCE(fl.local, 'A definir') AS local,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                    c.status
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE c.id = ?
            `, [cursoId]);

            // 3. Devolver a vaga e garantir que o curso fique 'ativo'
            await db.query(`UPDATE cursos SET vagas = vagas + 1, status = 'ativo' WHERE id = ?`, [cursoId]);

            if (cursoRows.length) {
                await notificarInteressadosPorCurso({ ...cursoRows[0], status: 'ativo' });
            }

            res.json({ message: "InscriÃ§Ã£o removida e vaga liberada com sucesso!" });
        } catch (err) {
            console.error("Erro ao excluir inscriÃ§Ã£o:", err);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    });

    // ============================================================
    // ROTAS DO QUIZ VOCACIONAL (INTERESSADOS/LEADS)
    // ============================================================
    
    // Salvar o aluno que fez o quiz
    app.post('/api/interessados', async (req, res) => {
        try {
            const { nome, whatsapp, email, regiao, perfil } = req.body;
            const [resultado] = await db.query(`
                INSERT INTO interessados (nome, whatsapp, email, regiao, perfil_curso) 
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
            `, [nome, whatsapp, email, regiao, perfil]);

            await notificarNovoLeadSeHouverCursoAtivo({
                id: resultado[0].id,
                nome,
                whatsapp,
                email,
                regiao,
                perfil_curso: perfil,
                status: 'aguardando'
            });
            
            res.json({ message: "Interesse salvo com sucesso!" });
        } catch (err) {
            console.error("Erro ao salvar lead:", err);
            res.status(500).json({ error: "Erro ao salvar os dados" });
        }
    });

    // Listar todos os interessados no Admin
    app.get('/api/interessados', exigirAuthAdmin, async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT * FROM interessados ORDER BY id DESC`);
            res.json(rows);
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao listar interessados");
        }
    });

    // Alterar Status do Contato (Aguardando/Enviado)
    app.put('/api/interessados/:id/status', exigirAuthAdmin, async (req, res) => {
        try {
            const { status } = req.body;
            await db.query(
                `UPDATE interessados
                 SET status = ?, enviado_em = CASE WHEN ? = 'enviado' THEN NOW() ELSE NULL END
                 WHERE id = ?`,
                [status, status, req.params.id]
            );
            res.json({ message: "Status atualizado!" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao atualizar status");
        }
    });

    // ============================================================
    // ADMIN STATS
    // ============================================================
    app.get("/api/admin/stats", exigirAuthAdmin, async (req, res) => {
        try {
            const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM cursos`);
            const [[{ ativos }]] = await db.query(`SELECT COUNT(*) AS ativos FROM cursos WHERE status = 'ativo'`);
            const [[{ inscritos }]] = await db.query(`SELECT COUNT(*) AS inscritos FROM pre_inscricoes`);
            const [[{ leads }]] = await db.query(`SELECT COUNT(*) AS leads FROM interessados WHERE status = 'aguardando'`);
            res.json({ total, ativos, inscritos, leads });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao buscar estatÃ­sticas");
        }
    });

    app.get("/api/admin/cursos-stats", exigirAuthAdmin, async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT
                    c.id,
                    COALESCE(fcurso.curso, 'Sem nome') AS nome,
                    c.vagas AS vagas_restantes,
                    c.status,
                    COALESCE(fl.local, 'N/A') AS local,
                    COUNT(pi.id) AS inscritos
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                LEFT JOIN pre_inscricoes pi ON pi.curso_id = c.id
                GROUP BY c.id, fcurso.curso, c.vagas, c.status, fl.local
                ORDER BY inscritos DESC
            `);
            res.json(rows);
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao buscar stats");
        }
    });

    // ============================================================
    // DELETAR CURSO (CASCADE apaga inscriÃ§Ãµes automaticamente)
    // ============================================================
    app.delete("/cursos/:id", exigirAuthAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const [[curso]] = await db.query(`SELECT id FROM cursos WHERE id = ?`, [id]);
            if (!curso) return res.status(404).json({ error: "Curso nÃ£o encontrado" });
            await db.query(`DELETE FROM cursos WHERE id = ?`, [id]);
            res.json({ message: "Curso removido com sucesso." });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao remover curso");
        }
    });

    // ============================================================
    // CHATBOT
    // ============================================================
    app.post("/chat", async (req, res) => {
        try {
            let text = (req.body.message || "")
                .toString().trim().toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (!text) return res.json({ reply: "Diga algo como: 'curso 5', 'vagas', 'locais', 'lista de cursos'." });

            const has = words => words.some(w => text.includes(w));
            const matchId = text.match(/curso\s*(\d+)/) || text.match(/id\s*(\d+)/);

            if (has(["inscricao", "inscrever", "quero me inscrever", "matricula", "pre inscri", "inscrever"])) {
                return res.json({ reply: `ðŸ”— Clique abaixo para escolher um curso e fazer sua prÃ©-inscriÃ§Ã£o:\n${baseUrl}/#cursos-list-section` });
            }

            if (matchId) {
                const id = matchId[1];
                const [rows] = await db.query(`
                    SELECT c.id, fcurso.curso AS nome, c.vagas, c.status, fl.local, fm.modalidade
                    FROM cursos c
                    LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                    LEFT JOIN filtro_local fl ON fl.id = c.local_id
                    LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                    WHERE c.id = ?
                `, [id]);

                if (!rows.length) return res.json({ reply: "Curso nÃ£o encontrado." });
                const c = rows[0];

                return res.json({
                    reply: `ðŸ“˜ *${c.nome}*\n\nðŸ“ Local: ${c.local}\nðŸ« Modalidade: ${c.modalidade}\nðŸ‘¥ Vagas: ${c.vagas} â€” ${c.status}\n\nðŸ‘‰ *PrÃ©-inscriÃ§Ã£o:* \n${baseUrl}/pre-inscricao/${c.id}`
                });
            }

            if (has(["vaga", "vagas", "disponivel", "tem vaga"])) {
                const [rows] = await db.query(`SELECT SUM(vagas) AS total FROM cursos WHERE status = 'ativo'`);
                const total = rows[0].total || 0;
                return res.json({ reply: `Atualmente temos *${total} vagas disponÃ­veis*.` });
            }

            if (has(["curso", "cursos", "lista", "catalogo", "mostrar cursos"])) {
                const [rows] = await db.query(`
                    SELECT c.id, fcurso.curso AS nome, c.vagas, c.status, fl.local
                    FROM cursos c
                    LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                    LEFT JOIN filtro_local fl ON fl.id = c.local_id
                `);

                const lista = rows.map(r => `ðŸ“˜ *${r.id} â€” ${r.nome}*\nðŸ“ Local: ${r.local}\nðŸ‘¥ ${r.vagas} vagas â€” ${r.status}\nðŸ‘‰ PrÃ©-inscriÃ§Ã£o: ${baseUrl}/pre-inscricao/${r.id}\n`).join("\n");
                return res.json({ reply: lista });
            }

            return res.json({ reply: `NÃ£o entendi ðŸ˜…  \nTente perguntar:\n\nâ€¢ "curso 12"\nâ€¢ "vagas"\nâ€¢ "lista de cursos"\nâ€¢ "quero me inscrever"` });

        } catch (err) {
            return responderErroBanco(res, err, "Erro ao processar mensagem.");
        }
    });
        // ============================================================
    // ESTATÃSTICAS DO PAINEL (VAGAS DISPONÃVEIS E PREENCHIDAS)
    // ============================================================
    app.get("/api/estatisticas", async (req, res) => {
        try {
            // 1. Soma todas as vagas restantes de cursos que estÃ£o 'ativos'
            const [rowsVagas] = await db.query(`SELECT SUM(vagas) AS totais FROM cursos WHERE status = 'ativo'`);
            const vagasHoje = rowsVagas[0].totais || 0;

            // 2. Conta quantas inscriÃ§Ãµes (vagas preenchidas) foram feitas no ano de 2026
            const [rowsInscricoes] = await db.query(`SELECT COUNT(id) AS preenchidas FROM pre_inscricoes WHERE EXTRACT(YEAR FROM criado_em) = 2026`);
            const vagas2026 = rowsInscricoes[0].preenchidas || 0;

            res.json({ vagasHoje, vagas2026 });
        } catch (err) {
            if (eErroTimeoutBanco(err)) {
                console.warn("[db] Falha na conexao do banco ao carregar estatÃ­sticas, servindo fallback estÃ¡tico.");
                return res.json({ vagasHoje: 108, vagas2026: 677 });
            }
            return responderErroBanco(res, err, "Erro ao carregar estatÃ­sticas:");
        }
    });
    // ============================================================
    // CURSOS DETALHES
    // ============================================================
    app.get("/cursos-detalhes/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.query(`
                SELECT 
                    c.id, fcurso.curso AS nome, c.vagas, c.status,
                    TO_CHAR(c.horario_inicio, 'HH24:MI') AS horario_inicio,
                    TO_CHAR(c.horario_termino, 'HH24:MI') AS horario_termino,
                    TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio,
                    TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino,
                    fl.local, fm.modalidade, fc.categoria
                FROM cursos c
                LEFT JOIN filtro_curso fcurso ON fcurso.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                LEFT JOIN filtro_modalidade fm ON fm.id = c.modalidade_id
                LEFT JOIN filtro_categoria fc ON fc.id = c.categoria_id
                WHERE c.id = ?
            `, [id]);

            if (rows.length === 0) return res.status(404).json({ error: "Curso nÃ£o encontrado" });
            res.json(rows[0]);
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao buscar detalhes");
        }
    });

    // ============================================================
    // REGRAS DE INSCRIÃ‡ÃƒO, SUPLÃŠNCIA E PROMOÃ‡ÃƒO DE SUPLENTES
    // ============================================================
    async function promoverProximoSuplente(cursoId, prazoHoras) {
        try {
            // Buscar suplentes chronologically
            const [suplentes] = await db.query(`
                SELECT id, cpf, nome, email, telefone
                FROM pre_inscricoes
                WHERE curso_id = ? AND status_inscricao = 'suplente'
                ORDER BY criado_em ASC
            `, [cursoId]);

            if (suplentes.length === 0) return;

            // Priority: those who never completed any course have priority over those who completed
            const suplentesOrdenados = [];
            for (const s of suplentes) {
                const [conclusoes] = await db.query(`
                    SELECT COUNT(*) as total
                    FROM pre_inscricoes
                    WHERE cpf = ? AND situacao_final = 'concluido'
                `, [s.cpf]);
                
                const jaConcluiu = conclusoes[0].total > 0;
                suplentesOrdenados.push({
                    ...s,
                    jaConcluiu
                });
            }

            suplentesOrdenados.sort((a, b) => {
                if (a.jaConcluiu !== b.jaConcluiu) {
                    return a.jaConcluiu ? 1 : -1;
                }
                return 0; // maintain original chronological order
            });

            const promovido = suplentesOrdenados[0];
            console.log(`[promocao] Promovendo suplente ${promovido.nome} (ID: ${promovido.id}) para titular no curso ID: ${cursoId}`);

            await db.query(`
                UPDATE pre_inscricoes
                SET status_inscricao = 'titular',
                    convocado_em = NOW(),
                    vaga_expira_em = NOW() + INTERVAL '${prazoHoras} hours'
                WHERE id = ?
            `, [promovido.id]);

            const [curso] = await db.query(`
                SELECT COALESCE(fc.curso, 'Curso') AS nome
                FROM cursos c
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                WHERE c.id = ?
            `, [cursoId]);
            const cursoNome = curso.length > 0 ? curso[0].nome : "Curso";

            await enviarEmailPromocaoSuplente({
                nome: promovido.nome,
                email: promovido.email,
                cursoNome,
                prazoHoras
            });
        } catch (err) {
            console.error("Erro ao promover suplente:", err);
        }
    }

    async function processarExpiracoesMatriculas() {
        try {
            const [configRows] = await db.query(`SELECT prazo_confirmacao_horas FROM configuracoes LIMIT 1`);
            const prazoHoras = configRows.length > 0 ? configRows[0].prazo_confirmacao_horas : 48;

            const [expirados] = await db.query(`
                SELECT pi.id, pi.curso_id, pi.nome, pi.email, pi.telefone, pi.cpf, pi.possui_necessidade_especial,
                       COALESCE(fc.curso, 'Curso') AS curso_nome
                FROM pre_inscricoes pi
                LEFT JOIN cursos c ON c.id = pi.curso_id
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                WHERE pi.status_inscricao = 'titular'
                  AND pi.matricula_confirmada = 0
                  AND pi.vaga_expira_em IS NOT NULL
                  AND pi.vaga_expira_em <= NOW()
            `);

            for (const exp of expirados) {
                if (exp.possui_necessidade_especial === 'sim') {
                    console.warn(`[pcd-alerta] Aluno PcD ${exp.nome} (CPF: ${exp.cpf}) nÃ£o confirmou matrÃ­cula no prazo. Vaga mantida.`);
                    continue;
                }

                console.log(`[expiracao] Expirando vaga de ${exp.nome} (ID: ${exp.id}) no curso ID: ${exp.curso_id}`);

                await db.query(`
                    UPDATE pre_inscricoes
                    SET status_inscricao = 'suplente',
                        convocado_em = NULL,
                        vaga_expira_em = NULL
                    WHERE id = ?
                `, [exp.id]);

                await enviarEmailExpiracaoVaga({
                    nome: exp.nome,
                    email: exp.email,
                    cursoNome: exp.curso_nome
                });

                await promoverProximoSuplente(exp.curso_id, prazoHoras);
            }
        } catch (err) {
            console.error("Erro no processamento de expiraÃ§Ãµes de matrÃ­cula:", err);
        }
    }

    // Executa a cada 60s
    setInterval(processarExpiracoesMatriculas, 60000);

    // ============================================================
    // CONFIGURAÃ‡Ã•ES DO SISTEMA (ADMIN)
    // ============================================================
    app.get("/api/admin/configuracoes", exigirAuthAdmin, async (req, res) => {
        try {
            const [rows] = await db.query(`SELECT limite_inscricoes_semestre, prazo_confirmacao_horas FROM configuracoes LIMIT 1`);
            res.json(rows[0] || { limite_inscricoes_semestre: 4, prazo_confirmacao_horas: 48 });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao carregar configuraÃ§Ãµes");
        }
    });

    app.put("/api/admin/configuracoes", exigirAuthAdmin, async (req, res) => {
        try {
            const { limite_inscricoes_semestre, prazo_confirmacao_horas } = req.body;
            await db.query(`
                UPDATE configuracoes
                SET limite_inscricoes_semestre = ?,
                    prazo_confirmacao_horas = ?
            `, [Number(limite_inscricoes_semestre), Number(prazo_confirmacao_horas)]);
            res.json({ ok: true, message: "ConfiguraÃ§Ãµes salvas!" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao salvar configuraÃ§Ãµes");
        }
    });

    // ============================================================
    // FICHA COMPLETA DO ALUNO (ADMIN)
    // ============================================================
    app.get("/api/admin/aluno/completo/:cpf", exigirAuthAdmin, async (req, res) => {
        try {
            const cpfLimpo = normalizarCpf(req.params.cpf);
            const [alunoRows] = await db.query(`
                SELECT * FROM pre_inscricoes WHERE cpf = ? ORDER BY criado_em DESC LIMIT 1
            `, [cpfLimpo]);
            if (alunoRows.length === 0) {
                return res.status(404).json({ error: "Aluno nÃ£o encontrado." });
            }
            const [historicoRows] = await db.query(`
                SELECT pi.*, COALESCE(fc.curso, 'Curso') AS curso_nome, COALESCE(fl.local, 'A definir') AS local_nome
                FROM pre_inscricoes pi
                LEFT JOIN cursos c ON c.id = pi.curso_id
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE pi.cpf = ?
                ORDER BY pi.criado_em DESC
            `, [cpfLimpo]);
            res.json({ aluno: alunoRows[0], historico: historicoRows });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao carregar ficha do aluno");
        }
    });

    // ============================================================
    // PESQUISAS DE SATISFAÃ‡ÃƒO E CONCLUSÃƒO (CERTIFICAÃ‡ÃƒO)
    // ============================================================
    app.post("/api/pre-inscricoes/:id/pesquisa-conclusao", async (req, res) => {
        try {
            const { id } = req.params;
            const { emprego_pos_curso, contribuicao_profissional, recomendaria, beneficio_principal } = req.body;
            await db.query(`
                UPDATE pre_inscricoes
                SET emprego_pos_curso = ?,
                    contribuicao_profissional = ?,
                    recomendaria = ?,
                    beneficio_principal = ?,
                    questionario_conclusao_respondido = 1
                WHERE id = ?
            `, [emprego_pos_curso, Number(contribuicao_profissional), recomendaria, beneficio_principal, id]);
            res.json({ ok: true, message: "Pesquisa de conclusÃ£o registrada!" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao registrar pesquisa de conclusÃ£o");
        }
    });

    app.post("/api/pre-inscricoes/:id/pesquisa-satisfacao", async (req, res) => {
        try {
            const { id } = req.params;
            const { nota_satisfacao_instrutor, nota_satisfacao_estrutura, nota_satisfacao_material, nota_satisfacao_geral, comentario_satisfacao } = req.body;
            await db.query(`
                UPDATE pre_inscricoes
                SET nota_satisfacao_instrutor = ?,
                    nota_satisfacao_estrutura = ?,
                    nota_satisfacao_material = ?,
                    nota_satisfacao_geral = ?,
                    comentario_satisfacao = ?,
                    pesquisa_satisfacao_respondida = 1
                WHERE id = ?
            `, [Number(nota_satisfacao_instrutor), Number(nota_satisfacao_estrutura), Number(nota_satisfacao_material), Number(nota_satisfacao_geral), comentario_satisfacao, id]);
            res.json({ ok: true, message: "Pesquisa de satisfaÃ§Ã£o registrada!" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao registrar pesquisa de satisfaÃ§Ã£o");
        }
    });

    app.post("/api/pre-inscricoes/sugestoes", async (req, res) => {
        try {
            const { cpf, areas_interesse, sugestao_texto } = req.body;
            const areasStr = Array.isArray(areas_interesse) ? areas_interesse.join(", ") : String(areas_interesse || "");
            await db.query(`
                INSERT INTO sugestoes_cursos (cpf, areas_interesse, sugestao_texto)
                VALUES (?, ?, ?)
            `, [normalizarCpf(cpf), areasStr, sugestao_texto]);
            res.json({ ok: true, message: "SugestÃ£o enviada com sucesso!" });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao salvar sugestÃ£o");
        }
    });

    // ============================================================
    // EMISSÃƒO DE CERTIFICADOS
    // ============================================================
    app.get("/certificado/:id", async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await db.query(`
                SELECT pi.*, COALESCE(fc.curso, 'Curso') AS curso_nome, COALESCE(fl.local, 'VitÃ³ria') AS local_nome,
                       TO_CHAR(c.data_inicio, 'DD/MM/YYYY') AS data_inicio_formatada,
                       TO_CHAR(c.data_termino, 'DD/MM/YYYY') AS data_termino_formatada
                FROM pre_inscricoes pi
                LEFT JOIN cursos c ON c.id = pi.curso_id
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
                WHERE pi.id = ?
                LIMIT 1
            `, [id]);

            if (rows.length === 0) {
                return res.status(404).send("<h2>InscriÃ§Ã£o nÃ£o encontrada</h2>");
            }

            const aluno = rows[0];

            if (Number(aluno.questionario_conclusao_respondido) !== 1) {
                return res.redirect(`/questionario-conclusao.html?id=${id}`);
            }

            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Certificado de ConclusÃ£o | ${aluno.nome}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600&display=swap');
                        body {
                            background: #090f1d;
                            color: #f8fafc;
                            font-family: 'Montserrat', sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            padding: 20px;
                        }
                        .certificate-container {
                            border: 12px double #f9c852;
                            background: #111827;
                            padding: 60px 40px;
                            width: 100%;
                            max-width: 800px;
                            text-align: center;
                            position: relative;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                            border-radius: 4px;
                            box-sizing: border-box;
                        }
                        .certificate-container::before {
                            content: "";
                            position: absolute;
                            top: 15px; bottom: 15px; left: 15px; right: 15px;
                            border: 2px solid #f9c852;
                            pointer-events: none;
                        }
                        .header {
                            font-family: 'Cinzel', serif;
                            font-size: 2.2rem;
                            color: #f9c852;
                            margin-top: 0;
                            margin-bottom: 20px;
                            letter-spacing: 2px;
                            text-transform: uppercase;
                        }
                        .subheader {
                            font-size: 0.9rem;
                            text-transform: uppercase;
                            color: #94a3b8;
                            letter-spacing: 3px;
                            margin-bottom: 30px;
                        }
                        .body-text {
                            font-size: 1.1rem;
                            line-height: 1.8;
                            color: #cbd5e1;
                            margin-bottom: 40px;
                            font-weight: 300;
                        }
                        .highlight {
                            color: #f8fafc;
                            font-weight: 600;
                            border-bottom: 1px dashed #64748b;
                            padding-bottom: 2px;
                        }
                        .footer {
                            margin-top: 50px;
                            display: flex;
                            justify-content: space-around;
                            align-items: flex-end;
                        }
                        .signature-block {
                            width: 220px;
                            text-align: center;
                            border-top: 1px solid #64748b;
                            padding-top: 10px;
                            font-size: 0.8rem;
                            color: #94a3b8;
                        }
                        .signature-title {
                            font-weight: 600;
                            color: #cbd5e1;
                            margin-bottom: 4px;
                        }
                        .actions {
                            margin-top: 30px;
                        }
                        .btn {
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            background: #ff8a5a;
                            color: white;
                            text-decoration: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            font-weight: bold;
                            transition: all 0.2s;
                            border: none;
                            cursor: pointer;
                        }
                        .btn:hover {
                            background: #f97316;
                            transform: translateY(-1px);
                        }
                        @media print {
                            body {
                                background: white !important;
                                color: black !important;
                                padding: 0;
                            }
                            .certificate-container {
                                background: white !important;
                                color: black !important;
                                border-color: #333 !important;
                                box-shadow: none !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                height: 100% !important;
                                border-radius: 0 !important;
                            }
                            .certificate-container::before {
                                border-color: #333 !important;
                            }
                            .header, .highlight {
                                color: black !important;
                            }
                            .body-text, .subheader, .signature-block {
                                color: #333 !important;
                            }
                            .actions {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="certificate-container">
                        <div class="header">Certificado de ConclusÃ£o</div>
                        <div class="subheader">Prefeitura de VitÃ³ria â€” VixCursos</div>
                        
                        <p class="body-text">
                            Certificamos que <span class="highlight">${aluno.nome}</span> concluiu com Ãªxito o curso de qualificaÃ§Ã£o profissional em <span class="highlight">${aluno.curso_nome}</span>, ministrado no polo <span class="highlight">${aluno.local_nome}</span>, no perÃ­odo de ${aluno.data_inicio_formatada} a ${aluno.data_termino_formatada}, com carga horÃ¡ria de <span class="highlight">40 horas</span>.
                        </p>
                        
                        <div class="footer">
                            <div class="signature-block">
                                <div class="signature-title">Secretaria de AssistÃªncia Social</div>
                                <div>MunicÃ­pio de VitÃ³ria â€” ES</div>
                            </div>
                            <div class="signature-block">
                                <div class="signature-title">CoordenaÃ§Ã£o VixCursos</div>
                                <div>ValidaÃ§Ã£o Protocolo: ${gerarProtocoloInscricao(aluno.id)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="actions">
                        <button onclick="window.print()" class="btn">ðŸ–¨ï¸ Imprimir / Salvar PDF</button>
                        <a href="/" class="btn" style="background:#475569; margin-left:10px;">Voltar ao Site</a>
                    </div>
                </body>
                </html>
            `);
        } catch (err) {
            console.error("Erro ao gerar certificado:", err);
            res.status(500).send("Erro interno ao gerar certificado");
        }
    });

    // ============================================================
    // EXPORTAR EXCEL MULTI-ABA (ADMIN)
    // ============================================================
    app.get("/api/admin/exportar-excel", exigirAuthAdmin, async (req, res) => {
        try {
            let querySql = `
                SELECT
                    pi.cpf AS "CPF",
                    pi.nome AS "Nome",
                    TO_CHAR(pi.data_nascimento, 'DD/MM/YYYY') AS "Data de nascimento",
                    pi.genero AS "GÃªnero",
                    pi.raca_cor AS "RaÃ§a/cor",
                    pi.bairro AS "Bairro",
                    pi.municipio AS "MunicÃ­pio",
                    pi.cep AS "CEP",
                    pi.possui_necessidade_especial AS "DeficiÃªncia",
                    pi.email AS "E-mail",
                    pi.telefone AS "Telefone",
                    COALESCE(fc.curso, 'Curso') AS "Curso",
                    'Turma ' || pi.curso_id AS "Turma",
                    COALESCE(fl.local, 'VitÃ³ria') AS "Local",
                    TO_CHAR(pi.criado_em, 'DD/MM/YYYY HH24:MI:SS') AS "Data de inscriÃ§Ã£o",
                    CASE WHEN pi.matricula_confirmada = 1 THEN 'Matriculado' ELSE 'Pendente' END AS "Status",
                    pi.status_inscricao AS "ClassificaÃ§Ã£o (titular/suplente)",
                    TO_CHAR(pi.matricula_confirmada_em, 'DD/MM/YYYY HH24:MI:SS') AS "Data de matrÃ­cula",
                    pi.situacao_final AS "SituaÃ§Ã£o final",
                    pi.objetivo AS "Objetivo declarado"
                FROM pre_inscricoes pi
                LEFT JOIN cursos c ON c.id = pi.curso_id
                LEFT JOIN filtro_curso fc ON fc.id = c.curso_id
                LEFT JOIN filtro_local fl ON fl.id = c.local_id
            `;

            const conds = [];
            const params = [];

            if (req.query.curso_id) {
                conds.push("pi.curso_id = ?");
                params.push(req.query.curso_id);
            }
            if (req.query.bairro) {
                conds.push("pi.bairro ILIKE ?");
                params.push(`%${req.query.bairro}%`);
            }
            if (req.query.status_inscricao) {
                conds.push("pi.status_inscricao = ?");
                params.push(req.query.status_inscricao);
            }
            if (req.query.situacao_final) {
                conds.push("pi.situacao_final = ?");
                params.push(req.query.situacao_final);
            }
            if (req.query.data_inicio) {
                conds.push("pi.criado_em >= ?");
                params.push(req.query.data_inicio);
            }
            if (req.query.data_fim) {
                conds.push("pi.criado_em <= ?");
                params.push(req.query.data_fim);
            }

            if (conds.length > 0) {
                querySql += " WHERE " + conds.join(" AND ");
            }
            querySql += " ORDER BY pi.id DESC";

            const [rows] = await db.query(querySql, params);

            const wb = XLSX.utils.book_new();

            const wsInscricoes = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, wsInscricoes, "InscriÃ§Ãµes");

            const rowsConcluidos = rows.filter(r => r["SituaÃ§Ã£o final"] === "concluido");
            const wsConcluidos = XLSX.utils.json_to_sheet(rowsConcluidos);
            XLSX.utils.book_append_sheet(wb, wsConcluidos, "ConcluÃ­dos");

            const rowsSuplentes = rows.filter(r => String(r["ClassificaÃ§Ã£o (titular/suplente)"]).toLowerCase() === "suplente");
            const wsSuplentes = XLSX.utils.json_to_sheet(rowsSuplentes);
            XLSX.utils.book_append_sheet(wb, wsSuplentes, "Suplentes");

            const rowsPcD = rows.filter(r => String(r["DeficiÃªncia"]).toLowerCase() === "sim");
            const wsPcD = XLSX.utils.json_to_sheet(rowsPcD);
            XLSX.utils.book_append_sheet(wb, wsPcD, "PcD");

            const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

            res.setHeader("Content-Disposition", "attachment; filename=relatorio_vixcursos.xlsx");
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return res.send(buffer);
        } catch (err) {
            console.error("Erro ao exportar Excel:", err);
            return res.status(500).json({ error: "Erro ao gerar planilha Excel" });
        }
    });

    // ============================================================
    // RELATÃ“RIOS E PERFIL CRUZADO (ADMIN)
    // ============================================================
    app.get("/api/admin/relatorios-stats", exigirAuthAdmin, async (req, res) => {
        try {
            let whereClause = "";
            const conds = [];
            const params = [];

            if (req.query.curso_id) {
                conds.push("pi.curso_id = ?");
                params.push(req.query.curso_id);
            }
            if (req.query.genero) {
                conds.push("pi.genero = ?");
                params.push(req.query.genero);
            }
            if (req.query.raca_cor) {
                conds.push("pi.raca_cor = ?");
                params.push(req.query.raca_cor);
            }
            if (req.query.bairro) {
                conds.push("pi.bairro = ?");
                params.push(req.query.bairro);
            }
            if (req.query.data_inicio) {
                conds.push("pi.criado_em >= ?");
                params.push(req.query.data_inicio);
            }
            if (req.query.data_fim) {
                conds.push("pi.criado_em <= ?");
                params.push(req.query.data_fim);
            }

            if (conds.length > 0) {
                whereClause = " WHERE " + conds.join(" AND ");
            }

            const [genero, raca_cor, bairro, escolaridade, deficiencia, objetivo, faixa_etaria, kpis] = await Promise.all([
                db.query(`SELECT COALESCE(genero, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY genero`, params).then(r => r[0]),
                db.query(`SELECT COALESCE(raca_cor, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY raca_cor`, params).then(r => r[0]),
                db.query(`SELECT COALESCE(bairro, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY bairro`, params).then(r => r[0]),
                db.query(`SELECT COALESCE(escolaridade, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY escolaridade`, params).then(r => r[0]),
                db.query(`SELECT COALESCE(possui_necessidade_especial, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY possui_necessidade_especial`, params).then(r => r[0]),
                db.query(`SELECT COALESCE(objetivo, 'NÃ£o informado') AS label, COUNT(*) AS total FROM pre_inscricoes pi ${whereClause} GROUP BY objetivo`, params).then(r => r[0]),
                db.query(`
                    SELECT 
                        CASE
                            WHEN data_nascimento IS NULL THEN 'NÃ£o informada'
                            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) < 18 THEN 'Menor de 18 anos'
                            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 18 AND 29 THEN '18 a 29 anos'
                            WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) BETWEEN 30 AND 59 THEN '30 a 59 anos'
                            ELSE '60 anos ou mais'
                        END AS label,
                        COUNT(*) AS total
                    FROM pre_inscricoes pi
                    ${whereClause}
                    GROUP BY label
                `, params).then(r => r[0]),
                db.query(`
                    SELECT
                        COUNT(*) AS total,
                        COALESCE(SUM(CASE WHEN situacao_final = 'concluido' THEN 1 ELSE 0 END), 0) AS concluidos,
                        COALESCE(SUM(CASE WHEN situacao_final = 'evadido' THEN 1 ELSE 0 END), 0) AS evadidos,
                        COALESCE(AVG(nota_satisfacao_geral), 0) AS satisfacao_media
                    FROM pre_inscricoes pi
                    ${whereClause}
                `, params).then(r => r[0])
            ]);

            res.json({
                genero,
                raca_cor,
                bairro,
                escolaridade,
                deficiencia,
                objetivo,
                faixa_etaria,
                kpis: kpis[0] || { total: 0, concluidos: 0, evadidos: 0, satisfacao_media: 0 }
            });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao buscar estatÃ­sticas de relatÃ³rios");
        }
    });

    // ============================================================
    // FAQ ENDPOINTS
    // ============================================================
    app.get("/api/faq", async (req, res) => {
        try {
            const [rows] = await db.query("SELECT * FROM faq ORDER BY ordem ASC, id ASC");
            res.json(rows);
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao carregar FAQ");
        }
    });

    app.post("/api/admin/faq", exigirAuthAdmin, async (req, res) => {
        try {
            const { pergunta, resposta, ordem } = req.body;
            const [result] = await db.query(
                "INSERT INTO faq (pergunta, resposta, ordem) VALUES (?, ?, ?) RETURNING id",
                [pergunta, resposta, Number(ordem || 0)]
            );
            res.json({ ok: true, id: result[0]?.id });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao criar FAQ");
        }
    });

    app.put("/api/admin/faq/:id", exigirAuthAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            const { pergunta, resposta, ordem } = req.body;
            await db.query(
                "UPDATE faq SET pergunta = ?, resposta = ?, ordem = ? WHERE id = ?",
                [pergunta, resposta, Number(ordem || 0), id]
            );
            res.json({ ok: true });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao atualizar FAQ");
        }
    });

    app.delete("/api/admin/faq/:id", exigirAuthAdmin, async (req, res) => {
        try {
            const { id } = req.params;
            await db.query("DELETE FROM faq WHERE id = ?", [id]);
            res.json({ ok: true });
        } catch (err) {
            return responderErroBanco(res, err, "Erro ao deletar FAQ");
        }
    });

    // ============================================================
    // ROTAS DE PÃGINAS (SPA FALLBACK COM REACT)
    // ============================================================
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/public") || req.path.startsWith("/chat") || req.path === "/inscricao") {
            return next();
        }
        if (req.path.startsWith("/admin")) {
            return next();
        }
        res.sendFile(path.join(__dirname, "dist", "index.html"));
    });

    return app;
}

if (require.main === module) {
    createApp()
        .then((app) => {
            baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${SERVER_PORT}`;

            const server = app.listen(SERVER_PORT, () => {
                console.log(`Servidor rodando em http://localhost:${SERVER_PORT}`);
            });

            server.on("error", (err) => {
                console.error("Erro ao iniciar servidor HTTP:", err);
                process.exit(1);
            });
        })
        .catch((err) => {
            console.error("Falha ao iniciar aplicaÃ§Ã£o:", err);
            process.exit(1);
        });
}

module.exports = createApp;
