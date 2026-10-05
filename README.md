# 🎓 Qualifica Vix — Portal de Qualificação Profissional de Vitória/ES

Portal da Prefeitura Municipal de Vitória para divulgação e pré-inscrição em cursos gratuitos de qualificação profissional.

Configuração do Firebase, recuperação do cadastro e mascotes: [guia da atualização](docs/qualifica-vix.md).

---

## 📌 Visão Geral da Arquitetura

O projeto é composto por:
* **Frontend**: Aplicação React 19 + TypeScript + Vite + TailwindCSS v4 + Framer Motion.
* **Backend**: Node.js + Express com Firebase Realtime Database, acesso privado via Admin SDK, autenticação JWT administrativa e recuperação de cadastro por código enviado via SMTP. PostgreSQL permanece como alternativa; o modo local usa dados de demonstração em memória.
* **Painel Administrativo**: Interface HTML/JS estática servida em `/admin` para gestão de vagas, inscritos, FAQs e relatórios.

---

## 📁 Estrutura de Diretórios

```text
├── api/
│   └── index.js                      # Entrypoint serverless para Vercel
├── migrations/
│   ├── 001_add_ementa_to_cursos.sql  # Migrações pontuais do banco
│   ├── banco.sql                     # Esquema SQL das tabelas
│   └── seed.sql                      # Script consolidado de criação e população inicial
├── public/
│   ├── admin/                        # Painel administrativo estático (/admin)
│   └── imagem/                       # Logotipos, mascot Vitoruga e imagens institucionais
├── server/
│   ├── local-db.js                   # Banco de dados em memória para dev offline (DB_DISABLED=true)
│   └── server.js                     # Servidor Express, APIs REST e autenticação
├── src/
│   ├── components/                   # Componentes React ativos e reutilizáveis
│   │   ├── CourseModal.tsx
│   │   ├── CourseQuizModal.tsx
│   │   ├── CpfVerificationModal.tsx
│   │   ├── Depoimentos.tsx
│   │   ├── FiltroBusca.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── ListagemCursos.tsx
│   │   ├── SatisfactionSurvey.tsx
│   │   └── VitorugaChat.tsx
│   ├── pages/                        # Páginas da aplicação
│   │   ├── Detalhes.tsx
│   │   ├── Home.tsx
│   │   ├── PreInscricao.tsx
│   │   └── Sobre.tsx
│   ├── App.tsx                       # Roteador React Router + Smooth Scroll + Navegação
│   ├── index.css                     # Configuração de temas e utilitários Tailwind
│   └── main.tsx                      # Ponto de entrada React
├── .env.example                      # Modelo de variáveis de ambiente
├── package.json                      # Scripts e dependências do projeto
├── tsconfig.json                     # Configuração do TypeScript
└── vite.config.ts                    # Configuração de build do Vite
```

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- Node.js 22 ou superior
- npm

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 3. Modo de Desenvolvimento
Inicia concorrentemente o servidor backend Express (porta 3000) e o servidor Vite HMR (porta 5173):
```bash
npm run dev
```

### 4. Build de Produção
Compila a aplicação TypeScript e gera os arquivos otimizados em `dist/`:
```bash
npm run build
```

### 5. Iniciar Servidor de Produção
```bash
npm run start
```

---

## 🛡️ Funcionalidades Principais

- **Busca Semântica por IA**: Mapeamento inteligente de palavras-chave para categorias de cursos.
- **Verificação de endereço**: ViaCEP, com opção de corrigir o CEP. Quem mora fora de Vitória precisa declarar que trabalha na cidade; sem esse vínculo, a pré-inscrição é bloqueada com um aviso amigável.
- **Pré-inscrição**: termo de ciência, aviso de privacidade, autorização facultativa de imagem e voz, informações de acessibilidade e dados do responsável por menores. Sem anexos de CPF/RG.
- **Fila de Suplência Automática**: Controle de limite de inscrições e vagas por semestre.
- **Painel Administrativo Integrado**: Gestão de inscritos, emissão de relatórios em Excel (.xlsx) e controle de turmas.
