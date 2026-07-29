-- ==========================================
-- VIXCURSOS — SEEDING DATABASE SCRIPT
-- ==========================================

-- 0. Clean database
DROP TABLE IF EXISTS sugestoes_cursos CASCADE;
DROP TABLE IF EXISTS pesquisa_satisfacao CASCADE;
DROP TABLE IF EXISTS questionario_conclusao CASCADE;
DROP TABLE IF EXISTS pre_inscricoes CASCADE;
DROP TABLE IF EXISTS interessados CASCADE;
DROP TABLE IF EXISTS cursos CASCADE;
DROP TABLE IF EXISTS filtro_curso CASCADE;
DROP TABLE IF EXISTS filtro_categoria CASCADE;
DROP TABLE IF EXISTS filtro_modalidade CASCADE;
DROP TABLE IF EXISTS filtro_local CASCADE;
DROP TABLE IF EXISTS filtro_idade CASCADE;
DROP TABLE IF EXISTS faq CASCADE;
DROP TABLE IF EXISTS configuracoes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Catalog Tables
CREATE TABLE filtro_idade (
    id SERIAL PRIMARY KEY,
    idade INT NOT NULL
);

CREATE TABLE filtro_categoria (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL
);

CREATE TABLE filtro_modalidade (
    id SERIAL PRIMARY KEY,
    modalidade VARCHAR(100) NOT NULL,
    categoria_id INT NULL
);

CREATE TABLE filtro_local (
    id SERIAL PRIMARY KEY,
    local VARCHAR(150) NOT NULL
);

CREATE TABLE filtro_curso (
    id SERIAL PRIMARY KEY,
    curso VARCHAR(120) NOT NULL
);

CREATE TABLE configuracoes (
    id SERIAL PRIMARY KEY,
    limite_inscricoes_semestre INT DEFAULT 4,
    prazo_confirmacao_horas INT DEFAULT 48
);

CREATE TABLE faq (
    id SERIAL PRIMARY KEY,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    ordem INT DEFAULT 0
);

-- 2. Cursos & Turmas Table
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    curso_id INT NOT NULL REFERENCES filtro_curso(id) ON DELETE CASCADE,
    vagas INT DEFAULT 0,
    vagas_pcd INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo',
    publicado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inscricoes_abertas_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    inscricoes_fecham_em TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    categoria_id INT NULL REFERENCES filtro_categoria(id) ON DELETE SET NULL,
    modalidade_id INT NULL REFERENCES filtro_modalidade(id) ON DELETE SET NULL,
    local_id INT NULL REFERENCES filtro_local(id) ON DELETE SET NULL,
    idade_min INT NULL,
    idade_max INT NULL,
    data_inicio DATE NULL,
    data_termino DATE NULL,
    horario_inicio TIME NULL,
    horario_termino TIME NULL,
    descricao TEXT NULL,
    competencias TEXT NULL,
    pre_requisitos TEXT NULL,
    carga_horaria INT NULL,
    nivel_empregabilidade VARCHAR(50) NULL,
    video_url VARCHAR(255) NULL,
    faixa_salarial VARCHAR(100) NULL,
    areas_atuacao TEXT NULL,
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_abertura_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_encerramento_inscricao TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    acessos_contador INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Central Citizens Table
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    telefone_alternativo VARCHAR(20) NULL,
    data_nascimento DATE NULL,
    rg VARCHAR(20) NULL,
    genero VARCHAR(30) NULL,
    raca_cor VARCHAR(30) NULL,
    escolaridade VARCHAR(80) NULL,
    cep VARCHAR(12) NULL,
    numero VARCHAR(20) NULL,
    rua VARCHAR(150) NULL,
    bairro VARCHAR(120) NULL,
    municipio VARCHAR(120) NULL,
    uf VARCHAR(2) NULL,
    mora_vitoria VARCHAR(3) DEFAULT 'sim',
    possui_deficiencia VARCHAR(3) DEFAULT 'não',
    tipo_deficiencia VARCHAR(120) NULL,
    deficiencia_adaptacoes TEXT NULL,
    deficiencia_recursos TEXT NULL,
    responsavel_nome VARCHAR(120) NULL,
    responsavel_cpf VARCHAR(14) NULL,
    responsavel_parentesco VARCHAR(50) NULL,
    responsavel_telefone VARCHAR(20) NULL,
    responsavel_email VARCHAR(120) NULL,
    responsavel_autorizacao VARCHAR(3) NULL,
    autoriza_uso_imagem VARCHAR(3) DEFAULT 'sim',
    objetivo VARCHAR(200) NULL,
    cpf_documento TEXT NULL,
    rg_documento TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Pre-inscricoes Table
CREATE TABLE pre_inscricoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    curso_id INT NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NULL,
    rg VARCHAR(20) NULL,
    data_nascimento DATE NULL,
    genero VARCHAR(30) NULL,
    raca_cor VARCHAR(30) NULL,
    escolaridade VARCHAR(80) NULL,
    cep VARCHAR(12) NULL,
    numero VARCHAR(20) NULL,
    rua VARCHAR(150) NULL,
    bairro VARCHAR(120) NULL,
    municipio VARCHAR(120) NULL,
    uf VARCHAR(2) NULL,
    mora_vitoria VARCHAR(3) DEFAULT 'sim',
    possui_necessidade_especial VARCHAR(3) DEFAULT 'nao',
    tipo_necessidade_especial VARCHAR(120) NULL,
    status_inscricao VARCHAR(20) DEFAULT 'titular',
    status VARCHAR(30) DEFAULT 'inscrito',
    posicao_fila INT NULL,
    convocado_em TIMESTAMP NULL,
    vaga_expira_em TIMESTAMP NULL,
    matricula_confirmada SMALLINT DEFAULT 0,
    matricula_confirmada_em TIMESTAMP NULL,
    situacao_final VARCHAR(30) DEFAULT 'inscrito',
    objetivo VARCHAR(200) NULL,
    autoriza_lgpd VARCHAR(3) DEFAULT 'sim',
    autoriza_uso_imagem VARCHAR(3) DEFAULT 'sim',
    telefone_alternativo VARCHAR(20) NULL,
    responsavel_nome VARCHAR(120) NULL,
    responsavel_cpf VARCHAR(14) NULL,
    responsavel_parentesco VARCHAR(50) NULL,
    responsavel_telefone VARCHAR(20) NULL,
    responsavel_email VARCHAR(120) NULL,
    responsavel_autorizacao VARCHAR(3) NULL,
    deficiencia_adaptacoes TEXT NULL,
    deficiencia_recursos TEXT NULL,
    cpf_documento TEXT NULL,
    rg_documento TEXT NULL,
    documento_confirmacao TEXT NULL,
    nota_satisfacao_instrutor INT NULL,
    nota_satisfacao_estrutura INT NULL,
    nota_satisfacao_material INT NULL,
    nota_satisfacao_geral INT NULL,
    comentario_satisfacao TEXT NULL,
    emprego_pos_curso VARCHAR(15) NULL,
    contribuicao_profissional INT NULL,
    recomendaria VARCHAR(3) NULL,
    beneficio_principal TEXT NULL,
    pesquisa_satisfacao_respondida SMALLINT DEFAULT 0,
    questionario_conclusao_respondido SMALLINT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_pre_inscricoes_curso_cpf ON pre_inscricoes (curso_id, cpf);

-- 5. Quiz Vocacional / Leads Table
CREATE TABLE interessados (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NULL,
    whatsapp VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    regiao VARCHAR(50) NULL,
    perfil_curso VARCHAR(50) NULL,
    status VARCHAR(20) DEFAULT 'aguardando',
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sugestoes de Cursos Table
CREATE TABLE sugestoes_cursos (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL,
    areas_interesse TEXT NULL,
    sugestao_texto TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA POPULATION
-- ==========================================

-- Populate Idades
INSERT INTO filtro_idade (idade) SELECT generate_series(10, 85);

-- Populate Categorias
INSERT INTO filtro_categoria (categoria) VALUES
('Administração'), ('Artesanato'), ('AUTOMAÇÃO INDUSTRIAL'), ('Beleza'), ('Cinema'),
('Comércio / Gestão Empresarial'), ('Confecção'), ('Construção Civil / Serviço'),
('Cultura'), ('Dança'), ('Dança e Teatro'), ('Educação'), ('Eletrônica'),
('Eletricista / Energia'), ('Enfermagem / Saúde'), ('Estética'), ('Eventos'),
('Fotografia'), ('Gastronomia'), ('Gestão'), ('Idiomas'), ('Informática / Tecnologia'),
('Logística'), ('Manutenção'), ('Mecânica'), ('Meio Ambiente'), ('Moda'), ('Música'),
('Panificação / Confeitaria'), ('Produção Cultural'), ('Programação / TI'),
('Recursos Humanos'), ('Redes / Telecom'), ('Segurança do Trabalho'),
('Serviço Social'), ('Soldagem'), ('Turismo / Hotelaria'), ('Vendas / Marketing');

-- Populate Modalidades
INSERT INTO filtro_modalidade (modalidade, categoria_id) VALUES
('Presencial', NULL), ('Híbrido', NULL), ('Online', NULL);

-- Populate Locais
INSERT INTO filtro_local (local) VALUES
('Administração Regional da Praia do Canto'),
('Academia Popular de Santa Martha'),
('Andorinhas'),
('Área de Lazer e Eventos de Jardim Camburi'),
('Bairro da Penha'),
('Bento Ferreira'),
('Bonfim'),
('Caratoíra'),
('Centro de Formação Profissional do Senac Vitória'),
('Centro de Referência da Assistência Social (CRAS) Jucutuquara'),
('Centro de Referência da Assistência Social (CRAS) São Pedro V'),
('Centro de Referência para a Juventude (CRJ) Andorinhas'),
('Horto de Maruípe'),
('Ilha de Santa Maria'),
('Jardim Camburi'),
('Jardim da Penha'),
('Mata da Praia'),
('Mário Cypreste'),
('Parque Moscoso'),
('Praça do Hi-Fi'),
('SENAI Cícero Freire'),
('SENAI Porto de Santana'),
('Santa Martha'),
('Santos Dumont'),
('São Benedito');

-- Populate Curso Names
INSERT INTO filtro_curso (curso) VALUES
('Administração'), ('Artesanato'), ('AUTOMAÇÃO INDUSTRIAL'), ('Cabeleireiro Profissional'), ('Cinema'),
('Comércio / Gestão Empresarial'), ('Confecção de Roupas'), ('Construção Civil / Serviço'),
('Cultura'), ('Dança'), ('Dança e Teatro'), ('Educação'), ('Eletrônica'),
('Eletricista / Energia'), ('Primeiros Socorros'), ('Estética'), ('Eventos'),
('Fotografia'), ('Culinária Básica'), ('Gestão'), ('Idiomas'), ('Informática / Tecnologia'),
('Logística'), ('Manutenção'), ('Mecânica'), ('Meio Ambiente'), ('Moda'), ('Música'),
('Confeitaria Profissional'), ('Produção Cultural'), ('Programação Web'),
('Recursos Humanos'), ('Redes / Telecom'), ('Segurança do Trabalho'),
('Serviço Social'), ('Soldagem'), ('Turismo / Hotelaria'), ('Marketing Digital');

-- Seed FAQs
INSERT INTO faq (pergunta, resposta, ordem) VALUES
('Quem pode se inscrever?', 'Os cursos do VixCursos são destinados exclusivamente a moradores de Vitória - ES que atendam aos pré-requisitos de idade e escolaridade do curso pretendido.', 0),
('Como funciona a confirmação de matrícula?', 'Após a pré-inscrição online, o aluno titular recebe uma notificação por e-mail/SMS com prazo de 48 horas para confirmar sua matrícula.', 1),
('O que acontece se eu for suplente?', 'Caso as vagas imediatas estejam preenchidas, você entrará na fila de suplência automática. Se um candidato titular desistir, o próximo suplente da fila é convocado.', 2),
('Qual o limite de cursos por semestre?', 'Cada cidadão pode se inscrever em até 4 cursos por semestre. A partir da 3ª inscrição simultânea, a inscrição entra automaticamente como suplente.', 3),
('Os cursos são gratuitos?', 'Sim, todos os cursos oferecidos pelo portal VixCursos são 100% gratuitos.', 4);

-- Seed Configs
INSERT INTO configuracoes (limite_inscricoes_semestre, prazo_confirmacao_horas) VALUES (4, 48);

-- Seed Courses / Turmas
INSERT INTO cursos (
    curso_id, vagas, vagas_pcd, status, categoria_id, modalidade_id, local_id,
    idade_min, idade_max, data_inicio, data_termino, horario_inicio, horario_termino,
    descricao, competencias, pre_requisitos, carga_horaria, nivel_empregabilidade,
    faixa_salarial, areas_atuacao
) VALUES
-- Cabeleireiro Profissional (ID: 1, filtro_curso: 4)
(4, 20, 2, 'ativo', 4, 1, 9, 16, 80, '2026-08-01', '2026-10-15', '13:30:00', '17:30:00',
 'Curso completo de técnicas de cabeleireiro profissional, cortes modernos, escovação e tratamentos.',
 'Corte feminino/masculino, hidratação avançada, colorimetria básica',
 'Ensino Fundamental II completo e idade mínima de 16 anos', 80, 'alta', 'R$ 1.500,00 a R$ 4.000,00',
 'Salões de beleza, clínicas de estética, freelancer ou empreendedor autônomo.'),

-- Confeitaria Profissional (ID: 2, filtro_curso: 29)
(29, 15, 2, 'ativo', 29, 1, 9, 16, 80, '2026-08-05', '2026-09-20', '08:00:00', '12:00:00',
 'Aprenda fabricação de bolos finos, tortas decoradas, salgados e doces de padaria.',
 'Panificação básica, técnicas de confeitar com bicos, manipulação de alimentos',
 'Ensino Fundamental completo e idade mínima de 16 anos', 120, 'alta', 'R$ 1.800,00 a R$ 3.500,00',
 'Padarias, confeitarias, buffets, restaurantes ou produção própria em casa.'),

-- Programação Web (ID: 3, filtro_curso: 31)
(31, 25, 3, 'ativo', 31, 2, 21, 14, 80, '2026-08-10', '2026-11-30', '19:00:00', '22:00:00',
 'Curso de desenvolvimento web front-end utilizando HTML5, CSS3, Javascript moderno e bancos de dados.',
 'Lógica de programação, estilização responsiva, APIs Rest e banco de dados',
 'Ensino Médio incompleto e idade mínima de 14 anos', 160, 'alta', 'R$ 2.500,00 a R$ 7.000,00',
 'Empresas de tecnologia, agências de marketing, startups ou desenvolvedor freelancer.'),

-- Corte e Costura (ID: 4, filtro_curso: 7)
(7, 10, 1, 'esgotado', 7, 1, 12, 16, 80, '2026-08-12', '2026-10-05', '14:00:00', '17:00:00',
 'Aprenda a operar máquinas de costura industriais, fazer modelagens planas e criar vestuários do zero.',
 'Modelagem plana, acabamento de costuras, regulagem de máquinas overloque e reta',
 'Ensino Fundamental completo e idade mínima de 16 anos', 100, 'media', 'R$ 1.400,00 a R$ 2.800,00',
 'Ateliês de costura, fábricas de confecção, reforma de roupas ou marca própria.'),

-- Primeiros Socorros (ID: 5, filtro_curso: 15)
(15, 30, 4, 'ativo', 15, 1, 10, 18, 80, '2026-09-01', '2026-09-15', '08:00:00', '12:00:00',
 'Capacitação rápida em técnicas essenciais de suporte básico à vida e condutas de emergência médica.',
 'Reanimação cardiopulmonar (RCP), imobilização temporária, estancamento de hemorragias',
 'Ensino Médio completo e idade mínima de 18 anos', 40, 'media', 'R$ 1.500,00 a R$ 2.500,00',
 'Profissionais de escolas, academias, eventos, cuidadores ou brigadistas civis.');


-- Seed Fictional Citizens (usuarios Table)
-- We need 10 citizens of varying gender, race/cor, neighborhood in Vitória, schooling, age.
INSERT INTO usuarios (
    cpf, nome, email, telefone, data_nascimento, rg, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_deficiencia,
    tipo_deficiencia, autoriza_uso_imagem, objetivo, cpf_documento, rg_documento
) VALUES
-- 1. Mariana - Female, Branca, Jardim Camburi, Concluinte
('11111111111', 'Mariana Santos Silva', 'mariana.silva@example.com', '(27) 99888-1111', '1995-05-15', '1111111-ES', 'Feminino', 'Branca', 'Ensino Médio Completo',
 '29060-010', '123', 'Avenida Dante Michelini', 'Jardim Camburi', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Qualificação profissional / Conseguir emprego', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 2. João - Male, Preta, São Pedro, Concluinte
('22222222222', 'João Victor Souza de Oliveira', 'joao.oliveira@example.com', '(27) 99777-2222', '1988-10-22', '2222222-ES', 'Masculino', 'Preta', 'Ensino Fundamental Completo',
 '29030-020', '45', 'Rua São José', 'São Pedro', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Mudar de área', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 3. Ana Paula - Female, Parda, Jardim da Penha, PcD, Titular
('33333333333', 'Ana Paula Nascimento', 'ana.nascimento@example.com', '(27) 99666-3333', '1990-03-08', '3333333-ES', 'Feminino', 'Parda', 'Ensino Superior Completo',
 '29060-150', '350', 'Rua Arthur Cezar Siqueira', 'Jardim da Penha', 'Vitória', 'ES', 'sim', 'sim',
 'Física - Cadeirante', 'sim', 'Empreender', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 4. Lucas - Male, Amarela, Centro, Menor (16 anos), Suplente
('44444444444', 'Lucas Kenji Sato', 'lucas.sato@example.com', '(27) 99555-4444', '2010-06-12', '4444444-ES', 'Masculino', 'Amarela', 'Ensino Médio Incompleto',
 '29010-050', '88', 'Rua Jerônimo Monteiro', 'Centro', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Aprimorar habilidades', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 5. Beatriz - Female, Branca, Jardim Camburi, Titular
('55555555555', 'Beatriz Costa Ramos', 'beatriz.ramos@example.com', '(27) 99444-5555', '2001-12-05', '5555555-ES', 'Feminino', 'Branca', 'Ensino Médio Completo',
 '29060-030', '101', 'Rua José Celso Cláudio', 'Jardim Camburi', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Conseguir emprego', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 6. Carlos - Male, Preta, Andorinhas, Titular
('66666666666', 'Carlos Augusto Pereira', 'carlos.pereira@example.com', '(27) 99333-6666', '1982-08-18', '6666666-ES', 'Masculino', 'Preta', 'Ensino Fundamental Incompleto',
 '29045-010', '500', 'Rua da Embaúba', 'Andorinhas', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Complementar formação', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 7. Clara - Female, Indígena, Bairro da Penha, Titular
('77777777777', 'Clara Tupinambá dos Santos', 'clara.tupi@example.com', '(27) 99222-7777', '1997-01-25', '7777777-ES', 'Feminino', 'Indígena', 'Ensino Médio Completo',
 '29047-020', '12', 'Beco das Flores', 'Bairro da Penha', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Interesse pessoal', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 8. Roberto - Male, Parda, Bento Ferreira, PcD, Suplente
('88888888888', 'Roberto Alves de Freitas', 'roberto.freitas@example.com', '(27) 99111-8888', '1975-07-30', '8888888-ES', 'Masculino', 'Parda', 'Ensino Médio Completo',
 '29050-010', '321', 'Avenida Cezar Hilal', 'Bento Ferreira', 'Vitória', 'ES', 'sim', 'sim',
 'Auditiva - Parcial', 'sim', 'Mudar de área', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 9. Juliana - Female, Branca, Jardim da Penha, Menor (17 anos), Titular
('99999999999', 'Juliana Rocha Vasconcellos', 'juliana.vasc@example.com', '(27) 99000-9999', '2009-11-02', '9999999-ES', 'Feminino', 'Branca', 'Ensino Médio Incompleto',
 '29060-200', '15', 'Rua Francisco Generoso', 'Jardim da Penha', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Conseguir emprego', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...'),

-- 10. Gabriel - Male, Preta, São Pedro, Titular
('10101010101', 'Gabriel Lima dos Anjos', 'gabriel.anjos@example.com', '(27) 98877-1010', '2003-09-14', '1010101-ES', 'Masculino', 'Preta', 'Ensino Superior Completo',
 '29030-050', '9', 'Beco São Pedro', 'São Pedro', 'Vitória', 'ES', 'sim', 'não',
 NULL, 'sim', 'Empreender', 'data:image/png;base64,mock...', 'data:image/png;base64,mock...');


-- Update under-age parents details in usuarios
UPDATE usuarios SET
    responsavel_nome = 'Helena Satiko Sato',
    responsavel_cpf = '44444444455',
    responsavel_parentesco = 'Mãe',
    responsavel_telefone = '(27) 99555-5555',
    responsavel_email = 'helena.sato@example.com',
    responsavel_autorizacao = 'sim'
WHERE cpf = '44444444444';

UPDATE usuarios SET
    responsavel_nome = 'Rodrigo Rocha Vasconcellos',
    responsavel_cpf = '99999999988',
    responsavel_parentesco = 'Pai',
    responsavel_telefone = '(27) 99000-8888',
    responsavel_email = 'rodrigo.vasc@example.com',
    responsavel_autorizacao = 'sim'
WHERE cpf = '99999999999';


-- Seed Inscriptions (pre_inscricoes Table)
-- We map these inscriptions to show different statuses in our reports and admin panels

-- 1. Mariana completed Cabeleireiro Profissional (Course 1)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo,
    pesquisa_satisfacao_respondida, questionario_conclusao_respondido,
    nota_satisfacao_instrutor, nota_satisfacao_estrutura, nota_satisfacao_material, nota_satisfacao_geral, comentario_satisfacao,
    emprego_pos_curso, contribuicao_profissional, recomendaria, beneficio_principal
) VALUES
(1, 1, 'Mariana Santos Silva', 'mariana.silva@example.com', '(27) 99888-1111', '11111111111', '1111111-ES', '1995-05-15', 'Feminino', 'Branca', 'Ensino Médio Completo',
 '29060-010', '123', 'Avenida Dante Michelini', 'Jardim Camburi', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'concluido', 1, '2026-06-01 10:00:00', 'concluido', 'Qualificação profissional / Conseguir emprego',
 1, 1, 5, 4, 5, 9, 'Excelente didática da instrutora.', 'sim', 5, 'sim', 'Aprendi novas técnicas e fui indicada para um salão parceiro.');

-- 2. João completed Cabeleireiro Profissional (Course 1)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo,
    pesquisa_satisfacao_respondida, questionario_conclusao_respondido,
    nota_satisfacao_instrutor, nota_satisfacao_estrutura, nota_satisfacao_material, nota_satisfacao_geral, comentario_satisfacao,
    emprego_pos_curso, contribuicao_profissional, recomendaria, beneficio_principal
) VALUES
(2, 1, 'João Victor Souza de Oliveira', 'joao.oliveira@example.com', '(27) 99777-2222', '22222222222', '2222222-ES', '1988-10-22', 'Masculino', 'Preta', 'Ensino Fundamental Completo',
 '29030-020', '45', 'Rua São José', 'São Pedro', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'concluido', 1, '2026-06-01 10:15:00', 'concluido', 'Mudar de área',
 1, 1, 4, 4, 4, 8, 'Ótimo curso!', 'processo', 4, 'sim', 'Muito bom, abriu minha mente para novas ideias de barbearia.');

-- 3. Ana Paula (PcD) - Currently enrolled/matriculado in Cabeleireiro Profissional (Course 1)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial, tipo_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo,
    deficiencia_adaptacoes, deficiencia_recursos
) VALUES
(3, 1, 'Ana Paula Nascimento', 'ana.nascimento@example.com', '(27) 99666-3333', '33333333333', '3333333-ES', '1990-03-08', 'Feminino', 'Parda', 'Ensino Superior Completo',
 '29060-150', '350', 'Rua Arthur Cezar Siqueira', 'Jardim da Penha', 'Vitória', 'ES', 'sim', 'sim', 'Física - Cadeirante',
 'titular', 'matriculado', 1, '2026-06-20 14:30:00', 'matriculado', 'Empreender',
 'Necessita de rampa e bancada em altura acessível', 'Cadeira adaptada na aula prática');

-- 4. Lucas (Menor) - Waitlisted/suplente in Corte e Costura (Course 4) due to sold out status
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, situacao_final, objetivo,
    responsavel_nome, responsavel_cpf, responsavel_parentesco, responsavel_telefone, responsavel_email, responsavel_autorizacao
) VALUES
(4, 4, 'Lucas Kenji Sato', 'lucas.sato@example.com', '(27) 99555-4444', '44444444444', '4444444-ES', '2010-06-12', 'Masculino', 'Amarela', 'Ensino Médio Incompleto',
 '29010-050', '88', 'Rua Jerônimo Monteiro', 'Centro', 'Vitória', 'ES', 'sim', 'nao',
 'suplente', 'inscrito', 0, 'inscrito', 'Aprimorar habilidades',
 'Helena Satiko Sato', '44444444455', 'Mãe', '(27) 99555-5555', 'helena.sato@example.com', 'sim');

-- 5. Beatriz - Enrolled in Programação Web (Course 3)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo
) VALUES
(5, 3, 'Beatriz Costa Ramos', 'beatriz.ramos@example.com', '(27) 99444-5555', '55555555555', '5555555-ES', '2001-12-05', 'Feminino', 'Branca', 'Ensino Médio Completo',
 '29060-030', '101', 'Rua José Celso Cláudio', 'Jardim Camburi', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-21 09:20:00', 'matriculado', 'Conseguir emprego');

-- 6. Carlos - Enrolled in Programação Web (Course 3)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo
) VALUES
(6, 3, 'Carlos Augusto Pereira', 'carlos.pereira@example.com', '(27) 99333-6666', '66666666666', '6666666-ES', '1982-08-18', 'Masculino', 'Preta', 'Ensino Fundamental Incompleto',
 '29045-010', '500', 'Rua da Embaúba', 'Andorinhas', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-21 11:35:00', 'matriculado', 'Complementar formação');

-- 7. Clara - Enrolled in Corte e Costura (Course 4)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo
) VALUES
(7, 4, 'Clara Tupinambá dos Santos', 'clara.tupi@example.com', '(27) 99222-7777', '77777777777', '7777777-ES', '1997-01-25', 'Feminino', 'Indígena', 'Ensino Médio Completo',
 '29047-020', '12', 'Beco das Flores', 'Bairro da Penha', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-22 14:15:00', 'matriculado', 'Interesse pessoal');

-- 8. Roberto (PcD) - Waitlisted/suplente in Corte e Costura (Course 4)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial, tipo_necessidade_especial,
    status_inscricao, status, matricula_confirmada, situacao_final, objetivo,
    deficiencia_adaptacoes, deficiencia_recursos
) VALUES
(8, 4, 'Roberto Alves de Freitas', 'roberto.freitas@example.com', '(27) 99111-8888', '88888888888', '8888888-ES', '1975-07-30', 'Masculino', 'Parda', 'Ensino Médio Completo',
 '29050-010', '321', 'Avenida Cezar Hilal', 'Bento Ferreira', 'Vitória', 'ES', 'sim', 'sim', 'Auditiva - Parcial',
 'suplente', 'inscrito', 0, 'inscrito', 'Mudar de área',
 'Aulas com apoio visual extra', 'Nenhum');

-- 9. Juliana (Menor) - Enrolled/titular in Cabeleireiro Profissional (Course 1)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo,
    responsavel_nome, responsavel_cpf, responsavel_parentesco, responsavel_telefone, responsavel_email, responsavel_autorizacao
) VALUES
(9, 1, 'Juliana Rocha Vasconcellos', 'juliana.vasc@example.com', '(27) 99000-9999', '99999999999', '9999999-ES', '2009-11-02', 'Feminino', 'Branca', 'Ensino Médio Incompleto',
 '29060-200', '15', 'Rua Francisco Generoso', 'Jardim da Penha', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-23 10:45:00', 'matriculado', 'Conseguir emprego',
 'Rodrigo Rocha Vasconcellos', '99999999988', 'Pai', '(27) 99000-8888', 'rodrigo.vasc@example.com', 'sim');

-- 10. Gabriel - Enrolled/titular in Primeiros Socorros (Course 5)
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo
) VALUES
(10, 5, 'Gabriel Lima dos Anjos', 'gabriel.anjos@example.com', '(27) 98877-1010', '10101010101', '1010101-ES', '2003-09-14', 'Masculino', 'Preta', 'Ensino Superior Completo',
 '29030-050', '9', 'Beco São Pedro', 'São Pedro', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-24 16:30:00', 'matriculado', 'Empreender');

-- 11. Mariana has another enrollment in Confeitaria Profissional (Course 2) - Enrolled
INSERT INTO pre_inscricoes (
    usuario_id, curso_id, nome, email, telefone, cpf, rg, data_nascimento, genero, raca_cor, escolaridade,
    cep, numero, rua, bairro, municipio, uf, mora_vitoria, possui_necessidade_especial,
    status_inscricao, status, matricula_confirmada, matricula_confirmada_em, situacao_final, objetivo
) VALUES
(1, 2, 'Mariana Santos Silva', 'mariana.silva@example.com', '(27) 99888-1111', '11111111111', '1111111-ES', '1995-05-15', 'Feminino', 'Branca', 'Ensino Médio Completo',
 '29060-010', '123', 'Avenida Dante Michelini', 'Jardim Camburi', 'Vitória', 'ES', 'sim', 'nao',
 'titular', 'matriculado', 1, '2026-06-25 11:00:00', 'matriculado', 'Qualificação profissional / Conseguir emprego');
