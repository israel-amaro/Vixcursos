# 🎓 VixCursos — Portal de Qualificação Profissional de Vitória/ES

Portal da Prefeitura Municipal de Vitória para divulgação e pré-inscrição em cursos gratuitos de qualificação profissional.

---

## 📌 Visão Geral e Objetivos do Projeto

O objetivo principal desta reformulação de UX/UI e regras de negócio foi **aumentar a taxa de conversão de visitante em pré-inscrito**, reduzindo a fricção e ambiguidade na jornada do usuário — principalmente no acesso via dispositivo móvel (celular) — enquanto assegura conformidade jurídica com a **LGPD** e com os critérios de **elegibilidade da Prefeitura de Vitória**.

---

## 🚀 Resumo das Atualizações Implementadas

### 1. Remoções e Ajustes de Conteúdo do Hero
- **Carrossel de Imagens de Fundo Profissionais:** Transição suave automática a cada 5 segundos alternando entre 4 imagens de profissões em alta definição (`proficao4`, `proficao2`, `proficao3`, `proficao`), com camada de gradiente de alto contraste para máxima legibilidade.
- **Redução de Altura do Hero em ~30%:** Altura ajustada para `~70vh`, permitindo visualizar categorias e filtros sem rolagem excessiva.
- **Copy Direta e Informativa:**
  - *Título:* `CURSOS GRATUITOS DA PREFEITURA DE VITÓRIA`
  - *Subtítulo:* *"Cursos gratuitos da Prefeitura de Vitória para aumentar suas oportunidades de trabalho. Escolha um curso e faça sua pré-inscrição em poucos minutos."*
  - *Selo de Elegibilidade:* *"Para moradores de Vitória e/ou trabalhadores na cidade de Vitória."*
  - *Respostas Rápidas:* `100% Gratuito` | `Vagas Abertas` | `Com Certificado Oficial`.

### 2. Chamada para Ação (CTA) Única
- Manutenção de **um único botão principal em destaque visual** (`QUERO ME INSCREVER`), evitando indecisão do usuário.
- Ações secundárias rebaixadas para botões *ghost/outline*.

### 3. Painel de Estatísticas Acionável
- Substituição de métricas ambíguas (como *"0 vagas abertas hoje"*) por dados diretos:
  - Cursos com inscrições abertas
  - Vagas restantes no momento
  - Turmas iniciando esta semana

### 4. Simplificação do Layout da Página Inicial
- **Remoção de Seções Redundantes:** As seções de *Categorias de Cursos* e *Passo a Passo (3 Etapas)* foram removidas da página inicial para proporcionar uma navegação mais direta a partir do Banner/Hero direto para os Benefícios e Filtros de Busca.

### 5. Filtros de Busca & Busca Inteligente por IA
- **Busca Semântica por IA:** Mapeamento inteligente de palavras-chave coloquiais para categorias correspondentes:
  - *"cozinheiro"*, *"comida"*, *"bolo"* → Gastronomia / Confeitaria
  - *"barbeiro"*, *"cabelo"*, *"manicure"* → Beleza
  - *"computador"*, *"excel"*, *"pc"* → Informática / Tecnologia
  - *"pedreiro"*, *"obra"*, *"pintor"* → Construção Civil
  - *"fio"*, *"tomada"*, *"luz"* → Elétrica
- **Novos Filtros:**
  - *Faixa Etária:* `14+`, `16+`, `18+`, `60+`.
  - *Turno:* `Manhã`, `Tarde`, `Noite`.
  - *Situação da Vaga:* `Inscrições Abertas`, `Últimas Vagas`, `Início em Breve`.

### 6. Destaques, Etapas e Benefícios do Aluno
- **Barra de Etapas do Processo em 3 Passos ([ProcessSteps.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/ProcessSteps.tsx)):**
  1. *Escolha o curso*
  2. *Faça seu cadastro*
  3. *Aguarde a convocação*
- **Bloco de Benefícios ao Concluir ([BenefitsSection.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/BenefitsSection.tsx)):**
  Destaca Certificado Reconhecido, Formação 100% Gratuita, Professores Especializados, Aulas Presenciais e Inserção no Mercado.
- **Novos Cards de Curso ([ListagemCursos.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/ListagemCursos.tsx)):**
  - **Data de início das aulas** em destaque de topo.
  - Resumo curto do curso e **Média Salarial Estimada no ES** (ex.: R$ 2.200 a R$ 4.500/mês).
  - Tags **"Ideal para:"** (*Primeiro emprego*, *Quem deseja empreender*, *Atualização*).
  - Aba **"Mais Procurados"** e selo **"NOVAS INSCRIÇÕES"**.

### 7. Elegibilidade Rígida por CEP de Vitória
- **Regra da PMV:** Inscrição permitida exclusivamente para moradores ou trabalhadores em Vitória.
- **Validação de CEP:** Integração com a API ViaCEP no formulário de pré-inscrição. CEPs fora do município de Vitória (fora da faixa 29000-000 a 29099-999) acionam um **bloqueio de prosseguimento com mensagem educativa**.

### 8. Fluxo de Pré-Inscrição, Ementa, Termo de Compromisso e LGPD
- **Ementa:** Apresentação do programa do curso e confirmação prévia.
- **Termo de Compromisso Oficial:** Redação exigida pela Prefeitura com checkbox obrigatório.
- **Aviso de Privacidade e LGPD ([PreInscricao.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/pages/PreInscricao.tsx)):**
  - Versão completa no desktop e versão compacta em dispositivos móveis.
  - Especificação do compartilhamento legítimo com parceiros (SENAI/SEBRAE) para certificação.
  - E-mail oficial do DPO/Encarregado: `dpo@vitoria.es.gov.br`.
  - Checkboxes obrigatórias de ciência e concordância para liberação do envio.

### 9. Quiz Vocacional, Chatbot & Pesquisa de Satisfação
- **Quiz Assistente "Não sabe qual curso escolher?" ([CourseQuizModal.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/CourseQuizModal.tsx)):** Pergunta interativa rápida por objetivo profissional (*Emprego, Empreender, Aprender profissão, Complementar renda*).
- **Chatbot Vitoruga ([VitorugaChat.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/VitorugaChat.tsx)):** Dica flutuante e mensagem inicial atualizadas para *"Precisa de ajuda para encontrar um curso?"*.
- **Pesquisa de Satisfação ([SatisfactionSurvey.tsx](file:///c:/Users/Porto/Downloads/Vixcursos-maincopia/src/components/SatisfactionSurvey.tsx)):** Formulário modal com as 15 perguntas de satisfação e usabilidade mobile.

---

## 🛠️ Arquitetura de Componentes

```
src/
├── components/
│   ├── BenefitsSection.tsx       # Bloco de benefícios ao concluir o curso
│   ├── CategoriasCursos.tsx      # Grid/Carousel de áreas com Mascote Vitoruga
│   ├── CourseQuizModal.tsx       # Quiz interativo para recomendação de cursos
│   ├── Depoimentos.tsx           # Depoimentos e provas sociais dos alunos
│   ├── FaqSection.tsx            # Dúvidas frequentes
│   ├── FiltroBusca.tsx           # Filtros avançados + Busca Semântica por IA
│   ├── Footer.tsx                # Rodapé com acionador da Pesquisa de Satisfação
│   ├── Header.tsx                # Cabeçalho transparente/flutuante
│   ├── Hero.tsx                  # Hero compacto (~70vh), CTA único e estatísticas
│   ├── ListagemCursos.tsx        # Grid de cards com data de início, salário e tags
│   ├── ProcessSteps.tsx          # Barra de etapas em 3 passos
│   ├── SatisfactionSurvey.tsx    # Modal de pesquisa de satisfação (15 perguntas)
│   └── VitorugaChat.tsx          # Chatbot assistente com nova mensagem de abertura
├── pages/
│   ├── Detalhes.tsx              # Detalhes do curso com ementa e média salarial
│   ├── Home.tsx                  # Página principal reordenada
│   ├── PreInscricao.tsx          # Formulário de pré-inscrição + Validação CEP + LGPD
│   └── Sobre.tsx                 # Página institucional sobre o portal
├── App.tsx                       # Roteamento e Lenis Smooth Scroll
├── index.css                     # Tailwind CSS / Estilos globais
└── main.tsx                      # Ponto de entrada React
```

---

## 💻 Como Executar e Compilar o Projeto

### Pré-requisitos
- Node.js (v18+)
- npm

### Instalação de Dependências
```bash
npm install
```

### Modo de Desenvolvimento
```bash
npm run dev
```

### Build de Produção
```bash
npm run build
```

---

## ✅ Lista de Critérios de Aceite Atendidos

- [x] Vídeos institucionais de fundo removidos do Hero.
- [x] Banner reduzido em ~30% de altura.
- [x] Apenas 1 CTA principal em destaque (`QUERO ME INSCREVER`).
- [x] Texto de abertura objetivo e informativo.
- [x] Painel de estatísticas revisado sem indicadores confusos.
- [x] Categorias de curso posicionadas logo após o banner principal.
- [x] Mascote Vitoruga estilizado e caracterizado em cada área.
- [x] Filtros por Faixa etária (14+, 16+, 18+, 60+), Turno e Situação da vaga.
- [x] Busca inteligente semântica por palavras-chave/IA.
- [x] Seções *"Mais procurados"* e *"NOVAS INSCRIÇÕES"*.
- [x] Barra de etapas em 3 passos visível.
- [x] Cards de curso com data de início, média salarial e tags *"Ideal para"*.
- [x] Bloco de benefícios ao concluir o curso.
- [x] Elegibilidade (morador/trabalhador em Vitória) validada por CEP com bloqueio de não conformidade.
- [x] Ementa e aceite prévio do curso.
- [x] Termo de compromisso mantido e obrigatório via checkbox.
- [x] Aviso de Privacidade LGPD (desktop e mobile) com e-mail do DPO (`dpo@vitoria.es.gov.br`) e checkbox obrigatório.
- [x] Chatbot com nova mensagem de abertura.
- [x] Módulo *"Não sabe qual curso escolher?"* (Quiz) implementado.
- [x] Pesquisa de satisfação com 15 perguntas objetivas acessível no portal.
- [x] Interface 100% responsiva para dispositivos móveis.
