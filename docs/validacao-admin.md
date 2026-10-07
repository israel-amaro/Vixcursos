# Validação do painel administrativo

As alterações foram verificadas em 7 de outubro de 2026. Nenhum cadastro fictício foi inserido na área usada pelo público. Os testes do navegador usam um servidor local separado; os testes de persistência criam uma área temporária em `qualificaVix/testing` e a removem ao terminar.

Resultado: 43 testes de API, regras de datas e persistência passaram, incluindo o Firebase real; 22 testes no Chromium passaram. O build de produção também passou. Após o ajuste final da largura das colunas, os cinco testes afetados de lista, ficha, situação e tela pequena foram executados novamente e passaram.

## Fluxos verificados

- Entrada por `/admin`, login, bloqueio de páginas e APIs privadas, sessão expirada e saída.
- Dashboard: indicadores, cadastro e edição de turmas, publicação imediata, publicação agendada, arquivamento e esgotamento.
- Publicação agendada: horário de Brasília, persistência da data ao editar, curso oculto antes do horário e visível automaticamente a partir do horário; inscrição e interesse bloqueados antes da publicação.
- Menu lateral compartilhado pelas seis páginas: mesmos itens, ícones, ordem, posição e destino. Regras de Negócio acessível em todas as páginas, com identificação da seção atual.
- Inscritos: cada link do dashboard abre diretamente os alunos da turma indicada, incluindo turmas sem alunos. A entrada pelo menu apresenta todas as inscrições, com identificação e filtro de turma. Atualização da página, retorno à lista geral, ficha completa, busca por CPF, alteração de situação, cancelamento de ações, remoção da inscrição e atualização das vagas.
- Datas ISO e brasileiras preservam o dia cadastrado; datas inexistentes são rejeitadas. Cursos cujo término passou aparecem como encerrados, saem do catálogo de oportunidades e bloqueiam novas inscrições, mantendo os registros no painel. Dashboard, inscritos, monitoramento e detalhes públicos exibem o mesmo período e situação.
- A última data do curso inclui o dia inteiro em Brasília. Filtros de relatório também usam o dia de Brasília, incluindo inscrições feitas perto da meia-noite UTC.
- Matrículas: confirmação idempotente, bloqueio de suplentes sem vaga e preservação do histórico.
- Monitoramento: total de inscrições, quantidade de vagas ocupadas e porcentagem de ocupação apresentados separadamente. Os totais de inscrições concordam com o dashboard; vagas abertas excluem cursos encerrados ou agendados. Atualização periódica.
- Interesse enviado pelo formulário público aparece em Interessados e no indicador do dashboard. Busca, situação e gráficos usam os registros cadastrados.
- Pré-inscrição preenchida no navegador aparece na turma, no dashboard e no relatório, mesmo sem SMTP.
- Sessão do cidadão preservada na mesma aba durante 15 minutos após o cadastro, permitindo reutilizar os próprios dados sem envio de e-mail.
- Relatórios: filtros, indicadores, datas de nascimento nos formatos ISO e brasileiro, gráficos, tabelas com percentuais, Excel e impressão/PDF A4. O documento de teste foi renderizado e conferido visualmente.
- FAQ: criação, edição, ordenação e exclusão com confirmação.
- Navegação e ficha do aluno em tela de 390 px; nomes com aspas e conteúdo HTML exibidos como texto. A turma é identificada no cabeçalho da lista específica, e na coluna da lista geral.
- Informações ausentes não recebem valores fictícios de datas, horários ou carga horária. Faixas salariais fixas sem fonte de cadastro foram removidas.

## Executar novamente

```powershell
npx playwright install chromium
npm run test:admin
```

Para incluir os testes no Firebase real, com as credenciais locais já configuradas:

```powershell
$env:TEST_FIREBASE = 'true'
$env:EMAIL_USER = ''
$env:EMAIL_PASS = ''
$env:EMAIL_FROM = ''
npm run test:admin
```

O resultado visual dos testes fica em `playwright-report/`; falhas preservam captura de tela e rastreamento em `test-results/`. Esses diretórios não entram no Git.

## Limites da validação

Os testes de login no navegador simulam a resposta de credenciais inválidas. As regras de autorização e de sessão são testadas pela API com um serviço de autenticação isolado. O banco Firebase é exercitado de verdade em uma área temporária. Não houve envio de e-mails nem SMS.

A recuperação de um cadastro em outro navegador ou após expirar a sessão ainda usa o código de acesso por e-mail. Sem SMTP, esse fluxo de recuperação permanece indisponível; o cadastro inicial e o gerenciamento administrativo funcionam sem ele.

Esta validação verifica o projeto local e o build. Não representa uma publicação ou uma execução contra o endereço de produção.
