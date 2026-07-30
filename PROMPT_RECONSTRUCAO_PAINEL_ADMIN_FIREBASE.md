# Prompt — Reconstrução do Painel Administrativo Qualifica Vix com Firebase

## Papel

Atue como arquiteto de software, product designer e desenvolvedor full-stack sênior especializado em React, TypeScript, Firebase, sistemas públicos, LGPD, acessibilidade e painéis administrativos orientados a dados.

Analise o projeto existente antes de alterar qualquer arquivo. Reconstrua o painel administrativo do **Qualifica Vix** preservando as regras de negócio úteis do sistema atual, mas sem copiar sua interface visual antiga. O resultado deve ser um painel moderno, responsivo, seguro, acessível, automatizado e integrado visualmente à Home do portal.

Use como referência funcional a gravação do sistema administrativo legado:

`C:\Users\Porto\Videos\Gravações de Tela\Gravação de Tela 2026-07-29 191829.mp4`

O vídeo é uma referência de funcionalidades e processos, não uma referência estética. Não faça uma cópia pixel a pixel do sistema legado.

---

## 1. Contexto do projeto atual

O projeto possui:

- Frontend público em React 19, TypeScript e Vite.
- Estilização com Tailwind CSS.
- API Express concentrada em `server.js`.
- PostgreSQL e um fallback em `local-db.js`.
- Painel administrativo legado em HTML, CSS e JavaScript dentro de `public/admin`.
- Funcionalidades existentes de cursos, turmas, inscrições, suplência, interessados, FAQ, relatórios, certificados e configurações.
- Cadastro central do cidadão na tabela `usuarios`.
- Inscrições armazenadas em `pre_inscricoes`.

Identidade visual atual da Home:

- Marca: **Qualifica Vix**.
- Cor primária: `#004564`.
- Cor secundária: `#1a5874`.
- Cor de destaque: `#ff8a5a`.
- Coral: `#f36c6f`.
- Fundo claro: `#fdfbf9`.
- Texto principal: `#1e293b`.
- Sucesso: `#10b981`.
- Alerta: `#f59e0b`.
- Erro: `#ef4444`.
- Fonte de interface: Inter.
- Fonte de títulos: Poppins.
- Fonte para números e códigos: JetBrains Mono.
- Logo do portal e logo da Prefeitura de Vitória já utilizados na Home.

O painel reconstruído deve parecer parte do mesmo produto da Home, mantendo cores, tipografia, logos, linguagem, espaçamentos, bordas arredondadas e personalidade visual.

---

## 2. Funcionalidades identificadas no sistema legado

O vídeo apresenta as seguintes áreas e processos, que devem orientar a reconstrução:

### 2.1 Gestão de unidades e instituições

- Seleção de unidade responsável.
- Instituição executora.
- Local/polo de realização.
- Servidores e gestores vinculados às unidades.
- Diferentes níveis de acesso por instituição ou unidade.

### 2.2 Cadastro de cursos e turmas

- Categoria.
- Modalidade.
- Nome do curso.
- Faixa etária.
- Local de realização.
- Endereço.
- Instituição executora.
- Observações.
- Pré-requisitos.
- Indicação de turma profissionalizante.
- Indicação de EAD.
- Datas de início e fim da turma.
- Datas de abertura e encerramento da pré-inscrição.
- Quantidade total de vagas.
- Vagas para matrícula.
- Vagas de suplência.
- Horários e dias da semana.
- Instrutores vinculados.
- Histórico de alterações.
- Controle de publicação no portal.

### 2.3 Inscrições e matrículas

- Filtros por ano, mês, curso, turma, modalidade, local e horário.
- Listagem de pré-inscritos.
- CPF.
- Nome.
- Data de nascimento.
- E-mail.
- Telefone.
- Data e hora da inscrição.
- Situação da inscrição.
- Titular, suplente, aguardando matrícula, matriculado ou matrícula sem inscrição.
- Exclusão ou cancelamento controlado.
- Histórico da movimentação.
- Controle de entrada e saída.

### 2.4 Ficha do cidadão/aluno

- Consulta e pré-cadastro.
- Dados pessoais.
- Nome social.
- Data de nascimento.
- Gênero.
- Raça/cor.
- Escolaridade.
- Estado civil.
- Contatos.
- Responsáveis, quando aplicável.
- Endereço.
- Necessidades específicas e adaptações.
- Histórico de cursos, inscrições e matrículas.
- Autorização de uso de imagem.

Nem todo campo exibido pelo sistema legado deve ser mantido automaticamente. Aplique minimização de dados conforme a LGPD e mantenha apenas informações com finalidade administrativa comprovada.

### 2.5 Relatórios

- Movimentação por ano.
- Pré-inscrições.
- Matrículas.
- Frequência por turma.
- Inscrições e matrículas por turma.
- Perfil por curso.
- Perfil por ano.
- Exportação para planilha.
- Impressão.
- Indicadores por sexo/gênero, raça/cor, escolaridade, localidade e bairro.
- Relação nominal com situação de cada participante.

### 2.6 Segurança

- Cadastro de usuários administrativos.
- Alteração de senha.
- Vínculo do usuário a uma unidade.
- Perfis de acesso.

---

## 3. Objetivo da reconstrução

Crie um novo painel administrativo capaz de:

1. Centralizar a gestão do Qualifica Vix.
2. Reduzir tarefas manuais e planilhas paralelas.
3. Automatizar inscrições, matrículas, suplência, frequência e comunicações.
4. Entregar relatórios gerenciais e operacionais melhores.
5. Permitir rastreabilidade completa das alterações.
6. Proteger dados pessoais.
7. Ser simples para operadores não técnicos.
8. Funcionar bem em desktop, tablet e celular.
9. Integrar-se ao frontend público existente.
10. Utilizar Firebase como infraestrutura principal da nova área administrativa.

---

## 4. Direção visual e experiência

### 4.1 Estrutura geral

Crie uma aplicação administrativa React integrada ao projeto, preferencialmente em uma rota como:

`/admin`

Não mantenha o novo painel como páginas HTML isoladas.

Layout:

- Sidebar recolhível no desktop.
- Navegação em drawer no celular.
- Header com breadcrumb, busca global, notificações e perfil do usuário.
- Área principal com largura confortável e boa densidade de informação.
- Cards claros com bordas suaves e sombras discretas.
- Destaques em azul institucional e coral.
- Tabelas modernas com cabeçalho fixo.
- Filtros em painel recolhível.
- Modais e drawers para operações rápidas.
- Skeleton loading.
- Estados vazios explicativos.
- Feedback de sucesso, erro e carregamento.

### 4.2 Identidade

- Exibir o logo Qualifica Vix.
- Exibir o logo da Prefeitura de Vitória de forma secundária.
- Não usar “Vix Cursos” ou “VixCursos” em elementos visíveis.
- Usar os mesmos tokens de cor da Home.
- Usar Poppins em títulos, Inter na interface e JetBrains Mono em protocolos, CPF mascarado e indicadores.
- Manter contraste WCAG AA.
- Evitar excesso de glassmorphism em tabelas e formulários.

### 4.3 Acessibilidade

- Navegação completa por teclado.
- Foco visível.
- Labels associados aos campos.
- Modais com focus trap.
- `aria-live` para feedback.
- Cabeçalhos semânticos.
- Tabelas com caption e cabeçalhos associados.
- Gráficos acompanhados por resumo textual e tabela de dados.
- Não comunicar situações apenas por cores.
- Respeitar `prefers-reduced-motion`.
- Alvos de toque adequados.
- Interface compatível com leitores de tela.

---

## 5. Arquitetura de navegação

Crie os módulos abaixo.

### 5.1 Visão geral

Dashboard inicial com:

- Cursos publicados.
- Turmas abertas.
- Pré-inscrições no período.
- Matrículas confirmadas.
- Vagas disponíveis.
- Pessoas em suplência.
- Taxa de conversão de pré-inscrição para matrícula.
- Taxa de ocupação.
- Evasão.
- Conclusão.
- Certificados emitidos.
- Inscrições por dia.
- Próximas turmas.
- Turmas com início próximo.
- Prazos de matrícula vencendo.
- Alertas operacionais.
- Pendências por instituição.
- Atalhos para cadastrar turma, consultar cidadão, abrir chamada e gerar relatório.

Permita selecionar:

- Período.
- Unidade.
- Instituição.
- Curso.
- Turma.
- Modalidade.

### 5.2 Cursos

Tela de catálogo administrativo com:

- Busca.
- Filtros.
- Status.
- Categoria.
- Modalidade.
- Instituição.
- Data de publicação.
- Visualização no portal.
- Duplicação de curso.
- Arquivamento.
- Histórico.

Cadastro e edição:

- Nome.
- Categoria.
- Descrição curta.
- Descrição completa.
- Ementa.
- Competências.
- Pré-requisitos.
- Carga horária.
- Modalidade.
- Imagem.
- Faixa etária.
- Escolaridade mínima.
- Informações de acessibilidade.
- Certificação.
- Instituição responsável.
- Status de publicação.

Inclua pré-visualização do card e do modal exibidos na Home.

### 5.3 Turmas

Uma turma deve estar vinculada a um curso.

Campos:

- Código interno.
- Curso.
- Unidade.
- Instituição executora.
- Local/polo.
- Endereço.
- Modalidade.
- Instrutores.
- Coordenador.
- Data de início e término.
- Dias da semana.
- Horários.
- Vagas regulares.
- Vagas reservadas, se houver regra formal.
- Limite de suplência.
- Abertura e fechamento das inscrições.
- Prazo para confirmação.
- Observações internas.
- Observações públicas.
- Status.

Status sugeridos:

- Rascunho.
- Programada.
- Inscrições abertas.
- Inscrições encerradas.
- Em convocação.
- Em andamento.
- Concluída.
- Cancelada.
- Arquivada.

Adicione:

- Calendário.
- Lista e visão em cards.
- Validação de conflito de instrutor, local e horário.
- Indicador de ocupação.
- Linha do tempo da turma.
- Histórico de alterações.

### 5.4 Cidadãos

Tela de consulta segura por:

- CPF.
- Nome.
- E-mail.
- Telefone.
- Protocolo.

Mascarar dados na listagem.

Ficha:

- Dados cadastrais necessários.
- Contatos.
- Endereço.
- Dados de acessibilidade.
- Responsável legal, quando necessário.
- Consentimentos.
- Histórico de alterações.
- Cursos e inscrições.
- Matrículas.
- Frequência.
- Conclusões.
- Certificados.
- Comunicações enviadas.

Permitir:

- Atualização controlada.
- Mesclagem de duplicidades por usuário autorizado.
- Registro de correções.
- Exportação individual somente para perfis permitidos.

Não armazenar imagens de CPF ou RG.

### 5.5 Inscrições

Crie uma tabela operacional com:

- Seleção múltipla.
- Filtros salvos.
- Ordenação.
- Paginação.
- Colunas configuráveis.
- Busca.
- Exportação conforme permissões.

Dados:

- Protocolo.
- Cidadão.
- CPF mascarado.
- Curso.
- Turma.
- Data da inscrição.
- Classificação.
- Situação.
- Prazo de resposta.
- Necessidade de acessibilidade.
- Origem da inscrição.

Status:

- Pré-inscrito.
- Em análise.
- Titular.
- Suplente.
- Convocado.
- Aguardando validação.
- Matrícula confirmada.
- Não compareceu.
- Desistente.
- Cancelado.
- Reclassificado.

Toda mudança de status deve:

- Exigir motivo quando necessário.
- Registrar usuário, data, status anterior e status novo.
- Poder disparar uma comunicação.
- Atualizar vagas em transação.

### 5.6 Matrículas e convocações

Inclua:

- Fila de convocação.
- Prazo para resposta.
- Confirmação pela instituição.
- Registro de comparecimento.
- Reclassificação.
- Cancelamento.
- Promoção automática de suplente.
- Pausa manual da automação.
- Confirmação em lote.
- Histórico.

A pré-inscrição não deve virar matrícula apenas pelo envio do formulário público. A matrícula será confirmada somente após contato e validação pela instituição.

Quando o prazo expirar:

- Marcar a convocação como expirada.
- Notificar o operador.
- Aplicar a regra de perda da vaga pré-reservada.
- Convocar o próximo suplente, se a automação estiver habilitada.

### 5.7 Frequência

Crie:

- Diário por turma.
- Calendário de encontros.
- Presença, falta, falta justificada e reposição.
- Lançamento individual ou em lote.
- Percentual automático.
- Alertas de baixa frequência.
- Importação por planilha com validação.
- Histórico de correções.
- Fechamento de frequência.

Somente instrutores e perfis autorizados podem editar a frequência da própria turma.

### 5.8 Conclusão e certificados

- Marcar conclusão ou não conclusão.
- Validar carga horária e frequência mínima.
- Gerar certificado.
- Gerar código de autenticidade.
- Disponibilizar validação pública sem exposição excessiva.
- Permitir reemissão.
- Registrar data, responsável e versão do certificado.

### 5.9 Interessados

- Lista de pessoas interessadas por categoria ou curso.
- Origem do interesse.
- Consentimento para comunicação.
- Segmentação.
- Conversão em inscrição.
- Cancelamento de recebimento.
- Disparo quando nova turma compatível for publicada.

### 5.10 Instituições, unidades e locais

CRUD para:

- Instituições executoras.
- Unidades gestoras.
- Polos.
- Endereços.
- Contatos.
- Responsáveis.
- Cursos atendidos.
- Usuários vinculados.

Um gestor de instituição deve acessar somente dados dentro de seu escopo.

### 5.11 Usuários e permissões

Perfis sugeridos:

- `super_admin`: acesso completo.
- `gestor_municipal`: visão global e gestão.
- `gestor_instituicao`: gerencia sua instituição.
- `operador_matricula`: inscrições, contato e matrícula.
- `coordenador`: turmas sob sua responsabilidade.
- `instrutor`: frequência das turmas vinculadas.
- `analista_relatorios`: relatórios e indicadores permitidos.
- `auditor`: leitura e trilhas de auditoria.

Crie uma matriz clara de permissões por módulo e ação:

- Visualizar.
- Criar.
- Editar.
- Excluir/arquivar.
- Exportar.
- Ver dados sensíveis.
- Executar ações em lote.
- Gerenciar usuários.

---

## 6. Firebase

Use uma arquitetura Firebase segura e preparada para produção.

### 6.1 Serviços

- Firebase Authentication.
- Cloud Firestore.
- Cloud Functions for Firebase.
- Cloud Storage.
- Firebase App Check.
- Firebase Hosting se fizer sentido para o ambiente.
- Firebase Emulator Suite para desenvolvimento e testes.
- Cloud Scheduler para rotinas agendadas.

Analytics e Performance Monitoring podem ser usados, desde que respeitem a política de privacidade e não capturem dados pessoais.

### 6.2 Autenticação

- Login administrativo pelo Firebase Authentication.
- Preferir provedor institucional autorizado.
- Suportar e-mail/senha apenas se necessário.
- Exigir redefinição segura de senha.
- Preparar MFA para perfis privilegiados.
- Bloquear usuários inativos.
- Usar custom claims para papéis globais.
- Manter escopo de instituição/unidade no documento do usuário.
- Revogar sessões após alteração crítica de permissão.

### 6.3 Modelo inicial do Firestore

Crie coleções como:

- `adminUsers`
- `citizens`
- `courses`
- `classes`
- `enrollments`
- `enrollmentEvents`
- `attendanceSessions`
- `attendanceRecords`
- `institutions`
- `units`
- `locations`
- `instructors`
- `interestLeads`
- `notifications`
- `notificationTemplates`
- `consentLogs`
- `certificates`
- `reportJobs`
- `auditLogs`
- `systemSettings`

Use nomes consistentes e documente os campos.

Mantenha coleções operacionais no nível superior quando forem necessárias consultas globais. Evite subcoleções profundas que dificultem relatórios e regras.

Todos os documentos relevantes devem possuir:

- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`
- `status`
- `version`

Use `serverTimestamp()`.

### 6.4 CPF e dados sensíveis

- Nunca use CPF puro como ID público do documento.
- Normalize o CPF somente em ambiente confiável.
- Gere um hash determinístico para buscas controladas.
- Proteja o CPF completo e demais dados sensíveis.
- A busca por CPF deve passar por Cloud Function com autorização.
- Não permita consulta direta de cidadãos pelo cliente.
- Nunca registre CPF completo em logs.
- Mascarar CPF, telefone e e-mail na interface conforme a permissão.
- Separar permissões de consulta operacional e exportação.
- Aplicar minimização e retenção.

### 6.5 Regras do Firestore

As regras devem começar com negação por padrão.

Implementar:

- Acesso somente autenticado.
- Autorização por papel.
- Restrição por instituição/unidade.
- Campos imutáveis quando necessário.
- Proibição de alteração de status crítico diretamente pelo cliente.
- Proibição de leitura direta de logs de auditoria por perfis comuns.
- Proibição de acesso público a PII.
- Validação de tipos e campos essenciais.

Ações críticas devem ocorrer em Cloud Functions, e não por escrita direta do frontend.

### 6.6 Cloud Functions

Implemente funções para:

- Criar e atualizar usuários administrativos.
- Aplicar custom claims.
- Localizar cidadão de forma segura.
- Criar inscrição.
- Alterar status de inscrição.
- Confirmar matrícula.
- Recalcular vagas.
- Promover suplente.
- Processar expiração de convocação.
- Enviar comunicações.
- Gerar relatórios.
- Gerar certificados.
- Registrar auditoria.
- Importar dados.
- Mesclar duplicidades.
- Aplicar retenção/anonymização.

Use transações ou operações atômicas para vagas, matrículas e suplência.

Toda função deve:

- Validar autenticação.
- Validar permissão.
- Validar payload.
- Ser idempotente quando aplicável.
- Retornar erros seguros.
- Gerar correlação para auditoria.

### 6.7 Cloud Storage

Use para:

- Imagens de cursos.
- Logos e materiais institucionais autorizados.
- Relatórios gerados temporariamente.
- Certificados.

Não use para armazenar fotos de CPF ou RG.

Defina regras por pasta, tipo MIME, tamanho e papel do usuário. Relatórios com dados pessoais devem ter URLs temporárias e expiração.

### 6.8 Índices

Planeje índices compostos para:

- Inscrições por turma, status e data.
- Inscrições por cidadão.
- Turmas por instituição e status.
- Turmas por data de início.
- Frequência por turma e encontro.
- Relatórios por período.
- Notificações por status.

Inclua `firestore.indexes.json`.

---

## 7. Migração e convivência com o sistema atual

Não faça uma troca destrutiva imediata.

Crie um plano em fases:

### Fase 1 — Fundação

- Configurar Firebase por variáveis de ambiente.
- Criar autenticação e permissões.
- Criar layout do novo painel.
- Criar Firestore, Rules, Indexes e Emulators.

### Fase 2 — Leitura e migração

- Mapear PostgreSQL para Firestore.
- Criar scripts idempotentes de migração.
- Validar contagens e relacionamentos.
- Preservar IDs legados em `legacyId`.
- Gerar relatório de inconsistências.

### Fase 3 — Operação assistida

- Migrar cursos, turmas, instituições e usuários.
- Migrar cidadãos e inscrições com proteção adequada.
- Rodar conferência entre os dois ambientes.
- Bloquear duplicidade.

### Fase 4 — Firebase como fonte principal

- Direcionar o portal público para as novas funções.
- Ativar automações.
- Manter plano de rollback.
- Congelar gravações no sistema antigo após homologação formal.

Não mantenha PostgreSQL e Firestore aceitando gravações independentes por tempo indefinido. Caso haja período de dupla operação, defina uma única fonte de verdade e uma estratégia explícita de sincronização.

---

## 8. Automações

Implemente automações configuráveis:

### 8.1 Publicação

- Abrir inscrições automaticamente na data definida.
- Encerrar inscrições automaticamente.
- Atualizar status da turma.
- Publicar e retirar curso da Home.

### 8.2 Vagas e suplência

- Calcular ocupação em tempo real.
- Classificar titular ou suplente.
- Convocar próximo suplente após desistência ou prazo expirado.
- Impedir excesso de vagas por condição de corrida.
- Permitir regras específicas somente quando formalmente configuradas.

### 8.3 Comunicações

Templates versionados para:

- Pré-inscrição recebida.
- Convocação.
- Lembrete de prazo.
- Matrícula validada.
- Matrícula não confirmada.
- Promoção de suplente.
- Alteração de turma.
- Cancelamento.
- Lembrete de início.
- Baixa frequência.
- Conclusão.
- Certificado disponível.

Canais:

- E-mail.
- SMS ou WhatsApp, quando houver integração autorizada.
- Notificação dentro do painel.

Registrar:

- Template.
- Canal.
- Destinatário mascarado.
- Data.
- Resultado.
- Tentativas.
- Erro.

### 8.4 Alertas internos

- Turma sem instrutor.
- Turma sem ementa ou requisitos.
- Curso prestes a iniciar com vagas.
- Convocações expirando.
- Falha em notificações.
- Inscrições duplicadas.
- Frequência não lançada.
- Turma pronta para fechamento.
- Relatório com falha.

---

## 9. Relatórios e inteligência

Substitua relatórios estáticos extensos por uma central de relatórios.

### 9.1 Relatórios operacionais

- Inscritos por turma.
- Titulares e suplentes.
- Convocados aguardando retorno.
- Matrículas confirmadas.
- Não comparecimentos.
- Frequência.
- Conclusão.
- Certificados.
- Histórico de movimentação.

### 9.2 Relatórios gerenciais

- Inscrições por período.
- Matrículas por período.
- Conversão por curso e instituição.
- Ocupação.
- Demanda reprimida.
- Taxa de suplência.
- Evasão.
- Conclusão.
- Frequência média.
- Distribuição territorial.
- Perfil demográfico.
- Cursos mais procurados.
- Tempo médio entre inscrição e matrícula.
- Efetividade dos canais de comunicação.

### 9.3 Filtros

- Período.
- Curso.
- Turma.
- Instituição.
- Unidade.
- Local.
- Modalidade.
- Status.
- Bairro.
- Faixa etária.
- Gênero.
- Raça/cor.
- Escolaridade.
- Necessidade de acessibilidade.

Filtros sensíveis devem respeitar finalidade, permissão e quantidade mínima de registros para evitar reidentificação.

### 9.4 Visualizações

Use:

- KPIs.
- Séries temporais.
- Barras.
- Barras empilhadas.
- Funil de conversão.
- Mapa ou distribuição por bairro, se houver base geográfica adequada.
- Tabelas detalhadas.

Não use gráficos 3D.

### 9.5 Exportações

Gerar:

- XLSX.
- CSV.
- PDF formatado.
- Versão para impressão.

Requisitos:

- Título.
- Período e filtros aplicados.
- Data e hora.
- Usuário responsável.
- Paginação.
- Cabeçalho institucional.
- Totais.
- Dados mascarados conforme a permissão.
- Identificador do relatório.
- Registro no log de auditoria.

Relatórios grandes devem ser processados em background:

1. Criar um `reportJob`.
2. Processar por Cloud Function.
3. Armazenar temporariamente.
4. Notificar o usuário.
5. Disponibilizar link com expiração.
6. Excluir após o prazo de retenção.

---

## 10. Busca global

Adicione busca global no header para localizar:

- Curso.
- Turma.
- Cidadão.
- Inscrição.
- Protocolo.
- Instituição.

Respeite permissões. Não mostrar dados sensíveis em sugestões. Use debounce, navegação por teclado e destaque do termo.

---

## 11. Auditoria

Registrar em `auditLogs`:

- Login relevante.
- Falha repetida de login.
- Criação e alteração de curso.
- Alteração de turma.
- Mudança de vagas.
- Alteração de status.
- Matrícula.
- Reclassificação.
- Cancelamento.
- Alteração de frequência.
- Emissão de certificado.
- Visualização excepcional de dado sensível.
- Exportação.
- Alteração de usuário ou permissão.
- Mesclagem de cidadão.

Cada evento deve conter:

- Usuário.
- Papel.
- Instituição/unidade.
- Ação.
- Recurso.
- ID do recurso.
- Data.
- Valores anteriores e novos, com dados sensíveis redigidos.
- Motivo.
- ID de correlação.

Logs de auditoria não podem ser editados pelo cliente.

---

## 12. LGPD e segurança

- Minimizar dados coletados.
- Documentar finalidade de cada campo.
- Separar consentimento de LGPD e uso de imagem.
- Uso de imagem deve ser opcional e nunca presumido como “sim”.
- Registrar versão e data dos termos.
- Implementar revogação.
- Não armazenar imagem de CPF ou RG.
- Não expor cadastro completo apenas com CPF.
- Não colocar PII em URL.
- Não usar `localStorage` para tokens ou fichas completas.
- Aplicar timeout por inatividade no painel.
- Reautenticar antes de ações críticas.
- Aplicar rate limiting nas Functions.
- Usar App Check.
- Aplicar CSP e headers de segurança.
- Evitar fórmulas maliciosas em CSV/XLSX.
- Sanitizar conteúdo.
- Não renderizar HTML não confiável.
- Definir retenção e anonimização.
- Criar fluxo para solicitações do titular.
- Manter backup e recuperação.

---

## 13. Estados e regras de negócio

Centralize regras em serviços e Cloud Functions. Não espalhe regras importantes por componentes.

Crie uma máquina de estados documentada para inscrição e turma.

Exemplos de transições válidas:

- `pre_inscrito -> titular`
- `pre_inscrito -> suplente`
- `titular -> convocado`
- `convocado -> aguardando_validacao`
- `aguardando_validacao -> matriculado`
- `convocado -> nao_compareceu`
- `suplente -> convocado`
- `matriculado -> desistente`
- `matriculado -> concluido`
- `matriculado -> nao_concluido`

Transições inválidas devem ser bloqueadas no servidor.

---

## 14. Qualidade de código

- React e TypeScript estritos.
- Componentes reutilizáveis.
- Rotas protegidas.
- Camada de serviços Firebase.
- Hooks com responsabilidade clara.
- Validação de formulários com schema.
- Sem uso indiscriminado de `any`.
- Sem segredos no frontend.
- Variáveis de ambiente com arquivo de exemplo.
- Tratamento centralizado de erros.
- Internacionalização preparada, mantendo pt-BR como padrão.
- Datas armazenadas em UTC e apresentadas em `America/Sao_Paulo`.
- Valores e percentuais formatados em pt-BR.
- Lazy loading de módulos administrativos.
- Virtualização para tabelas grandes.
- Cache controlado.
- Queries paginadas; não baixar coleções inteiras.

---

## 15. Testes

### 15.1 Unitários

- Máquina de estados.
- Cálculo de vagas.
- Classificação.
- Promoção de suplentes.
- Frequência.
- Conversão.
- Máscaras.
- Permissões.

### 15.2 Integração

Com Firebase Emulator Suite:

- Authentication.
- Firestore Rules.
- Functions.
- Storage Rules.
- Criação de inscrição.
- Matrícula.
- Concorrência de última vaga.
- Suplência.
- Exportação.
- Auditoria.

### 15.3 E2E

- Login.
- Recuperação de acesso.
- Cadastro de curso.
- Criação de turma.
- Publicação.
- Consulta de cidadão.
- Gestão de inscrição.
- Confirmação de matrícula.
- Frequência.
- Relatório.
- Exportação.
- Usuário sem permissão.
- Uso em viewport mobile.

### 15.4 Segurança

- Firestore negando acesso anônimo.
- Isolamento entre instituições.
- Tentativa de elevar o próprio papel.
- Busca indevida por CPF.
- Exportação sem permissão.
- Escrita direta em status crítico.
- Acesso indevido ao Storage.

---

## 16. Critérios de aceite

O trabalho estará concluído quando:

- O novo painel estiver integrado visualmente à Home.
- Toda a interface visível usar “Qualifica Vix”.
- O painel estiver em React e TypeScript.
- Login e autorização estiverem no Firebase Authentication.
- Dados administrativos utilizarem Firestore.
- Regras de segurança estiverem implementadas e testadas.
- Cursos e turmas puderem ser criados, editados, publicados e acompanhados.
- Inscrições, matrículas, suplência e frequência funcionarem.
- A promoção de suplentes for transacional e auditável.
- A ficha do cidadão mostrar histórico consolidado.
- Dados pessoais estiverem protegidos e mascarados.
- Não houver upload de CPF ou RG.
- Os relatórios operacionais e gerenciais puderem ser filtrados.
- XLSX, CSV e PDF forem gerados com segurança.
- Relatórios grandes forem processados em background.
- Exportações e alterações críticas forem auditadas.
- O painel estiver responsivo e acessível.
- Testes de regras, funções e fluxos principais passarem.
- Existir documentação de implantação, migração, permissões e rollback.

---

## 17. Entregáveis

Entregue:

1. Inventário do painel atual.
2. Mapa de navegação do novo painel.
3. Wireframe textual das telas.
4. Matriz de papéis e permissões.
5. Modelo de dados do Firestore.
6. Máquina de estados de turmas e inscrições.
7. Projeto Firebase configurado por variáveis de ambiente.
8. Firestore Rules.
9. Storage Rules.
10. Índices.
11. Cloud Functions.
12. Novo frontend administrativo.
13. Scripts idempotentes de migração.
14. Central de relatórios.
15. Testes.
16. Documentação técnica e operacional.
17. Plano de homologação.
18. Plano de rollback.

---

## 18. Forma de execução

Antes de implementar:

1. Leia todo o repositório.
2. Identifique dados e regras já existentes.
3. Apresente a arquitetura proposta.
4. Liste incompatibilidades entre PostgreSQL e Firestore.
5. Identifique decisões que dependam de regra oficial da Prefeitura.
6. Divida a implementação em fases pequenas e verificáveis.

Durante a implementação:

- Preserve funcionalidades existentes até existir substituição validada.
- Não apague dados.
- Não edite `dist` manualmente.
- Não exponha credenciais Firebase.
- Não invente regras públicas ou critérios de reserva de vagas.
- Use dados fictícios nos testes.
- Registre decisões arquiteturais importantes.

Ao finalizar cada fase, informe:

- O que foi implementado.
- Arquivos alterados.
- Migrações executadas.
- Testes realizados.
- Riscos.
- Pendências.
- Passos para homologação.

Priorize primeiro segurança, integridade dos dados e fluxo operacional. Em seguida, implemente automações, relatórios avançados e otimizações.
