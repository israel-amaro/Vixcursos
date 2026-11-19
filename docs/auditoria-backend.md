# Auditoria 1 — Funcionalidades e Backend

Data: 19/11/2026 · Base: commit `d02190c` (main) · Site: https://qualificavix.vercel.app

Prioridade: **P0** = corrigir antes de divulgar · **P1** = próximo ciclo · **P2** = melhoria.

## P0 — Segurança e LGPD

### B1. Rotas antigas sem autenticação alteram dados e emitem certificados
`server/server.js` ainda registra rotas da era SQL que **funcionam em produção** (o emulador `local-db.js` aceita essas consultas no Firebase):

- `POST /api/pre-inscricoes/:id/pesquisa-conclusao` e `/pesquisa-satisfacao` (server.js:2442, 2461): qualquer pessoa altera as respostas de **qualquer** inscrição apenas trocando o `id`, que é sequencial.
- `GET /certificado/:id` (server.js:2498): emite um certificado para qualquer inscrição. A rota só checa `questionario_conclusao_respondido`, que a rota acima deixa qualquer um marcar, e **não verifica** se o aluno concluiu o curso. O resultado é que dá para gerar um certificado para qualquer pessoa, com o nome completo dela.
- O nome do aluno entra no HTML do certificado sem escape (`${aluno.nome}`). Como o próprio cidadão digita o nome, isso abre **XSS armazenado**.

**Correção:** reescrever as pesquisas e o certificado num router novo. O acesso deve exigir um link assinado (HMAC com expiração) ou a sessão do cidadão. O certificado só deve sair com `situacao_final === 'concluido'`, e todo texto deve passar por escape de HTML.

### B2. Enumeração de CPF
`POST /api/cidadaos/localizar` e a rota antiga `GET /api/pre-inscricoes/por-cpf/:cpf` (usada em `VitorugaChat.tsx:573`) dizem se um CPF tem cadastro e devolvem as iniciais do nome, o e-mail mascarado e os 4 últimos dígitos do telefone. Não há nenhum limite de tentativas.
**Correção:** remover a rota antiga, aplicar limite de requisições e devolver apenas o e-mail mascarado necessário para o código.

### B3. Nenhum limite de requisições (rate limit)
Não há limite em `enviar-codigo`, `/inscricao`, `/api/interessados` ou `/chat`. Um robô consegue lotar turmas com CPFs válidos gerados e encher a lista de interessados.
**Correção:** limitar por IP + rota. Como o servidor roda na Vercel (serverless), o contador precisa ficar no Firebase ou num KV, porque memória local não basta. Opcionalmente, adicionar um anti-robô invisível (Cloudflare Turnstile) só na inscrição.

### B4. "Sequestro" de CPF
Qualquer pessoa pode cadastrar o CPF de outra com o próprio e-mail. Depois disso, o dono real não consegue se inscrever, porque o código vai para o e-mail do invasor.
**Correção:** criar no painel uma ação "redefinir contato" com registro de auditoria e mostrar ao cidadão a orientação "procure o atendimento".

## P1 — Confiabilidade e escala

### B5. O banco inteiro é um único JSON
O caminho `qualificaVix/data` guarda cursos, usuários, inscrições, sessões e códigos. Isso causa três problemas:
- Toda rota pública (`/api/cursos-public`, `/api/faq`, `/api/configuracoes-public`) baixa **todos os dados pessoais de todos os cidadãos** para a função, só para listar cursos.
- Toda escrita é uma transação na raiz. No pico de inscrições (dia de lançamento), as transações colidem, o Firebase repete as tentativas e o timeout de 10 s estoura.

**Correção:** separar os nós (`cursos`, `usuarios/{hashCpf}`, `preInscricoes/{id}`, `vagas/{cursoId}`, `sessions`, `otp`) e usar transações só no contador da turma. A curto prazo, colocar `Cache-Control: s-maxage=30, stale-while-revalidate=120` nas rotas públicas.

### B6. Cerca de 2.800 linhas de código morto, com texto corrompido
A maior parte do `server.js` são rotas antigas, e muitas delas ficam escondidas pelos routers novos. Também há um `otpStore` em memória que não é usado e textos com encoding quebrado (`SaÃºde`, `ðŸ“˜`).
- A rota `/chat` continua ativa (`VitorugaChat.tsx:959`) e **devolve ao usuário acentos e emojis corrompidos**. Além disso, ela soma o total de vagas em vez das vagas restantes e lista cursos arquivados.

**Correção:** apagar as rotas antigas, reescrever o `/chat` em cima do `readState` e manter só os routers modulares.

### B7. A vaga não volta quando alguém cancela (bug)
`enroll()` marca o curso como `esgotado` quando a última vaga é ocupada (`citizen-service.js`). Cancelar ou mudar a situação **nunca desfaz isso**, então a turma continua aparecendo como "Lista de espera" mesmo com vaga livre. Também não existe convocação do suplente.
**Correção:** calcular "esgotado" a partir da ocupação, em vez de gravar no status, ou reverter o status no cancelamento. Avisar a equipe sobre o próximo suplente.

### B8. Regras de negócio escondidas ou ambíguas
- O "limite por semestre" conta **todas** as inscrições ativas, de qualquer época.
- A partir da 3ª inscrição ativa, o cidadão vira sempre `suplente` (`active.length >= 2`), e isso não aparece para ele.
- Cursos com aulas já iniciadas (ex.: início em 13/10/2026) continuam "Inscrições abertas" em 19/11/2026.

**Ação:** confirmar as regras com a gestão, documentar e exibir para o cidadão. Encerrar as inscrições automaticamente no início das aulas, a menos que a turma esteja configurada de outro jeito.

### B9. O código de acesso só vai por e-mail
Muitos idosos e pessoas de baixa renda não usam e-mail. A integração com o Twilio existe no código, mas não é usada no fluxo novo.
**Correção:** oferecer o código por SMS/WhatsApp e tornar o e-mail opcional.

## P2 — Endurecimento

- B10. Limite do `express.json` de 15 MB: reduzir para 100 KB. `cors()` aberto: restringir à origem do site.
- B11. Sem cabeçalhos de segurança: adicionar CSP, HSTS, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` e `Permissions-Policy` em `vercel.json`.
- B12. Sessões e códigos expirados só são limpos quando alguém valida um código, então o nó cresce sem parar. Limpar em toda mutação ou por TTL.
- B13. Não há registro de auditoria quando a equipe consulta a ficha completa ou exporta para o Excel. Registrar quem, quando e o quê (LGPD, art. 37).
- B14. Os testes não cobrem as rotas antigas nem a volta da vaga. Adicionar testes para B1, B2, B7.

## O que está bom
- Login do admin com cookie de sessão do Firebase, HttpOnly, Secure, SameSite=Lax, checagem de `auth_time` e de origem.
- Código de acesso com hash, tentativas limitadas, intervalo mínimo entre envios e sessão curta (15 min) com token guardado em hash.
- Validação de CPF, idade, responsável legal de menores e vínculo com Vitória.
- Erros genéricos, que não vazam detalhes do Firebase.
