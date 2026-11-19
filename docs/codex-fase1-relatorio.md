# Relatório da fase 1

Data: 19/11/2026. Branch: `melhorias/auditoria-2026-11`. Sem commit ou push.

## Backend

| Item | Implementação e arquivos principais |
| --- | --- |
| B1 | `server/survey-certificate-router.js` usa `readState`/`mutate`, links HMAC com inscrição e expiração de sete dias, ou sessão Bearer vinculada ao CPF. Certificado exige conclusão ou status `certificado_emitido`; os dados do HTML passam por `escapeHtml`. Endpoint administrativo autenticado gera os links. Integração em `public/admin/adminjs/inscritos.js`, `public/questionario-conclusao.html` e `public/pesquisa-satisfacao.html`. `CERT_LINK_SECRET` documentado em `.env.example`. Sugestões exigem sessão e usam o CPF da sessão. |
| B2 | Rota GET por CPF removida. `localizar` retorna somente `localizou` e `email_mascarado` (nulo quando não localizado). `VitorugaChat`, `PreInscricao` e `CpfVerificationModal` ajustados para o contrato reduzido. |
| B3 | `server/rate-limit.js`: contadores persistentes em `state.rateLimits`, transação pelo adaptador Firebase, janela fixa, hash de IP e rota, limpeza de expirados, primeiro IP de `x-forwarded-for` na Vercel e resposta 429 amigável. Limites: localizar 10/min, enviar código 5/10 min, validar código 10/10 min, inscrição e interessados 5/10 min, chat 30/min. |
| B6 | Removidos os handlers SQL duplicados, stores em memória, funções e listas mortas de `server/server.js`. Chat e estatísticas usam `readState`, catálogo público e vagas restantes. `/public/:tipo` preservado. Corrigidos textos corrompidos em servidor, componentes e arquivos públicos. |
| B7 | `enroll` não grava mais `esgotado` automaticamente. Ocupação e cancelamento passam a refletir a disponibilidade calculada por `getPublicCourses`/`courseState`; status manual continua valendo. Sem mudança nas regras de classificação ou convocação. |
| B10/B11 | Bodies limitados a 100kb, CORS limitado à origem pública e localhost em desenvolvimento. Cache público de 30 segundos com stale de 120 segundos nas rotas pedidas. CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy e frame-ancestors em `vercel.json`, incluindo os serviços usados e jsDelivr do painel. |
| B14 | `tests/fase1.test.js`: rotas removidas, acesso negado sem autenticação, expiração e vínculo do token, certificado antes/depois da conclusão, escape de HTML, pesquisas protegidas, limites, limpeza de expirados, última reserva e devolução da vaga. Testes existentes ajustados exclusivamente para os novos contratos de privacidade e cache. |

## Interface pública

| Item | Implementação e arquivos principais |
| --- | --- |
| U1 | Helper `cloudinary(url, width)` e srcsets em `src/lib/images.ts`; Hero com 480/800/1200/1600, sizes e prioridade alta somente no primeiro slide. Imagens Unsplash responsivas nos cards e em Sobre. PNGs locais usados pelo site convertidos para WebP até 512 px; referências atualizadas, inclusive catálogo de mascotes. Script reproduzível `scripts/otimizar-imagens.cjs`, sharp somente em devDependencies. Favicon 32 px, apple icon 180 px e ícones do manifest. Rotas Detalhes/PreInscricao/Sobre, chat e quiz usam lazy/Suspense; quiz só monta ao abrir. |
| U2 | `IntroVideo`: botão Pular abertura de 48 px desde o início, foco no botão, Esc e timeout de quatro segundos. Abertura omitida com movimento reduzido, economia de dados e conexão 2g/3g. |
| U3 | Revisão dos textos de 10/11/12 px e text-xs em componentes públicos, mínimo de 14 px nos textos secundários, corpo em 16 px no celular e redução do espaçamento de rótulos e selos. Ajustes em `src/index.css` e componentes/páginas. |
| U5 | `FiltroBusca`: celular apresenta busca, categorias horizontais e Filtrar com contagem. Demais filtros em dialog nativo modal, uma coluna, foco contido, Esc e botão Ver N cursos. Home recebe a contagem da listagem. Desktop preserva os filtros visíveis. |
| U7 | Rótulo clicável de vagas com área ampliada; links de rodapé e redes sociais com mínimo de 44 px. |
| U8 | Reserva inferior na página, bolha móvel de 56 px, botão de topo em outra altura e dica do Vitoruga limitada à sessão. |
| U9 | Textos explicativos para limite de inscrições e vagas livres; lista de espera e o que você vai aprender substituem termos internos na apresentação. Helper `startLabel` avisa quando as aulas começaram. Campos internos da API mantêm seus nomes. |
| U10 | Números públicos usam Inter e tabular-nums; removida a importação de JetBrains Mono. |
| U11 | Título solicitado, tags Open Graph/Twitter, imagem JPG 1200×630 otimizada, manifest e botão Compartilhar no detalhe com Web Share e alternativa WhatsApp. |

## Adaptações e limites de verificação

- As URLs de pesquisas e certificado foram preservadas com handlers novos e protegidos; portanto elas retornam 401/403 sem acesso válido, em vez de 404. As URLs efetivamente retiradas, como a consulta GET por CPF e o detalhe SQL antigo, retornam 404.
- O certificado é HTML imprimível, com opção de salvar em PDF pelo navegador. Não inclui biblioteca adicional de PDF.
- Para ativar links assinados em produção, configurar `CERT_LINK_SECRET` no ambiente do servidor. Não foi criado segredo real no repositório. A imagem de compartilhamento usa o domínio público já existente.
- Quatro testes de integração Firebase real foram ignorados pela configuração disponível. O contador utiliza o mesmo adaptador transacional persistente; o Firebase de produção não foi alterado nem usado para testes.
- A meta de transferência menor que 1,5 MB não foi medida em produção. Imagens remotas, SMTP, Firebase Auth, VLibras e CSP no ambiente Vercel requerem homologação após deploy. Não foi feito deploy.
- PNGs originais foram preservados para compatibilidade; o site público referencia as versões WebP. O cache local do npm é ignorado em `.gitignore`.
- Nenhum item excluído da fase foi implementado: formulário em etapas, SMS/e-mail opcional, separação de nós Firebase, recuperação de CPF ou novas regras de negócio.

## Verificações

- `npm test`: **passou**, 34 testes, 30 aprovados, 4 ignorados, zero falhas.
- `npm run build`: **passou**, TypeScript e Vite sem erros, chunks separados para rotas, chat e quiz.
- `git diff --check`: **passou**.
- Checagem adicional com Playwright usando Chrome instalado: viewport 375×812, dialog com largura/scroll de 375 px, foco dentro do modal, fechamento por Esc e pelo botão Ver N cursos, ausência de overflow horizontal, filtros visíveis em 1280 px e somente uma imagem Hero com prioridade alta. Nenhum erro JavaScript observado nesse fluxo. Chromium gerenciado do Playwright não estava instalado; utilizado `channel: 'chrome'`.
- Busca pelos padrões de mojibake da tarefa em `server/`, `src/` e `public/`: sem ocorrências.

## Arquivos alterados

O inventário abaixo inclui código, configuração e recursos criados para a fase. Os três documentos de entrada já estavam presentes como arquivos não rastreados e foram preservados.

- `.env.example`
- `.gitignore`
- `docs/codex-fase1-relatorio.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `public/admin/adminjs/inscritos.js`
- `public/admin/adminjs/menu.js`
- `public/admin/adminjs/session.js`
- `public/admin/css_adm/admin.css`
- `public/admin/cursos.html`
- `public/admin/faq.html`
- `public/admin/inscritos.html`
- `public/admin/interessados.html`
- `public/admin/menu.html`
- `public/admin/relatorios.html`
- `public/apple-touch-icon.png`
- `public/compartilhar.jpg`
- `public/favicon-32.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/imagem/VIxcursos.webp`
- `public/imagem/Vitoruga.webp`
- `public/imagem/Vitoruga_beauty.webp`
- `public/imagem/Vitoruga_chef.webp`
- `public/imagem/Vitoruga_coder.webp`
- `public/imagem/Vitoruga_worker.webp`
- `public/imagem/caretaalimento.webp`
- `public/imagem/carretaqualifica.webp`
- `public/imagem/logo.webp`
- `public/imagem/mascotes/vitoruga-gestao.webp`
- `public/imagem/mascotes/vitoruga-moda.webp`
- `public/imagem/mascotes/vitoruga-saude.webp`
- `public/imagem/palacioanchieta.webp`
- `public/imagem/pracadopapa.webp`
- `public/imagem/prefeitura-preto-transparente.webp`
- `public/imagem/prefeitura.webp`
- `public/imagem/proficao/enfermagem.webp`
- `public/imagem/proficao/proficao.webp`
- `public/imagem/proficao/proficao2.webp`
- `public/imagem/proficao/proficao3.webp`
- `public/imagem/proficao/proficao4.webp`
- `public/imagem/santuario.webp`
- `public/imagem/senac.webp`
- `public/imagem/senai.webp`
- `public/imagem/terceira_ponte.webp`
- `public/imagem/vitorugaoficial.webp`
- `public/manifest.webmanifest`
- `public/mascotes.json`
- `public/pesquisa-satisfacao.html`
- `public/questionario-conclusao.html`
- `scripts/otimizar-imagens.cjs`
- `server/citizen-service.js`
- `server/rate-limit.js`
- `server/server.js`
- `server/state-admin-router.js`
- `server/survey-certificate-router.js`
- `src/App.tsx`
- `src/components/BrandLogo.tsx`
- `src/components/CourseModal.tsx`
- `src/components/CourseQuizModal.tsx`
- `src/components/CpfVerificationModal.tsx`
- `src/components/Depoimentos.tsx`
- `src/components/FiltroBusca.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/Hero.tsx`
- `src/components/InterestModal.tsx`
- `src/components/IntroVideo.tsx`
- `src/components/ListagemCursos.tsx`
- `src/components/MascotPicker.tsx`
- `src/components/SatisfactionSurvey.tsx`
- `src/components/VitorugaChat.tsx`
- `src/index.css`
- `src/lib/images.ts`
- `src/pages/Detalhes.tsx`
- `src/pages/Home.tsx`
- `src/pages/PreInscricao.tsx`
- `src/pages/Sobre.tsx`
- `tests/catalog-interest.test.js`
- `tests/citizen-service.test.js`
- `tests/fase1.test.js`
- `vercel.json`

## Inventário de arquivos alterados ou criados

- `.env.example`
- `.gitignore`
- `docs/codex-fase1-relatorio.md`
- `index.html`
- `package-lock.json`
- `package.json`
- `public/admin/adminjs/inscritos.js`
- `public/admin/adminjs/menu.js`
- `public/admin/adminjs/session.js`
- `public/admin/css_adm/admin.css`
- `public/admin/cursos.html`
- `public/admin/faq.html`
- `public/admin/inscritos.html`
- `public/admin/interessados.html`
- `public/admin/menu.html`
- `public/admin/relatorios.html`
- `public/apple-touch-icon.png`
- `public/compartilhar.jpg`
- `public/favicon-32.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/imagem/VIxcursos.webp`
- `public/imagem/Vitoruga.webp`
- `public/imagem/Vitoruga_beauty.webp`
- `public/imagem/Vitoruga_chef.webp`
- `public/imagem/Vitoruga_coder.webp`
- `public/imagem/Vitoruga_worker.webp`
- `public/imagem/caretaalimento.webp`
- `public/imagem/carretaqualifica.webp`
- `public/imagem/logo.webp`
- `public/imagem/mascotes/vitoruga-gestao.webp`
- `public/imagem/mascotes/vitoruga-moda.webp`
- `public/imagem/mascotes/vitoruga-saude.webp`
- `public/imagem/palacioanchieta.webp`
- `public/imagem/pracadopapa.webp`
- `public/imagem/prefeitura-preto-transparente.webp`
- `public/imagem/prefeitura.webp`
- `public/imagem/proficao/enfermagem.webp`
- `public/imagem/proficao/proficao.webp`
- `public/imagem/proficao/proficao2.webp`
- `public/imagem/proficao/proficao3.webp`
- `public/imagem/proficao/proficao4.webp`
- `public/imagem/santuario.webp`
- `public/imagem/senac.webp`
- `public/imagem/senai.webp`
- `public/imagem/terceira_ponte.webp`
- `public/imagem/vitorugaoficial.webp`
- `public/manifest.webmanifest`
- `public/mascotes.json`
- `public/pesquisa-satisfacao.html`
- `public/questionario-conclusao.html`
- `scripts/otimizar-imagens.cjs`
- `server/citizen-service.js`
- `server/rate-limit.js`
- `server/server.js`
- `server/state-admin-router.js`
- `server/survey-certificate-router.js`
- `src/App.tsx`
- `src/components/BrandLogo.tsx`
- `src/components/CourseModal.tsx`
- `src/components/CourseQuizModal.tsx`
- `src/components/CpfVerificationModal.tsx`
- `src/components/Depoimentos.tsx`
- `src/components/FiltroBusca.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/Hero.tsx`
- `src/components/InterestModal.tsx`
- `src/components/IntroVideo.tsx`
- `src/components/ListagemCursos.tsx`
- `src/components/MascotPicker.tsx`
- `src/components/SatisfactionSurvey.tsx`
- `src/components/VitorugaChat.tsx`
- `src/index.css`
- `src/lib/images.ts`
- `src/pages/Detalhes.tsx`
- `src/pages/Home.tsx`
- `src/pages/PreInscricao.tsx`
- `src/pages/Sobre.tsx`
- `tests/catalog-interest.test.js`
- `tests/citizen-service.test.js`
- `tests/fase1.test.js`
- `vercel.json`

## Ajustes pós-revisão (Claude)

- **Rate limit compatível com CRAS/telecentros**: limite por IP elevado (ex.: `/inscricao` 60/10 min) e novo limite por CPF (ex.: `/inscricao` 5/10 min) em `server/rate-limit.js`, para que vários cidadãos atrás do mesmo IP público não sejam bloqueados.
- **Chat do Vitoruga**: `/chat` voltou a entender "curso N", nome/área do curso, "quero me inscrever", "vagas" e "onde", e devolve links `/pre-inscricao/<id>`, que o widget transforma em botão de inscrição (`chatReply` em `server/server.js`).
- Testes novos em `tests/fase1.test.js`. `npm test`: 32 aprovados, 4 ignorados, 0 falhas. `npm run build`: ok.
