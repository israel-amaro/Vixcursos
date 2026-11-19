# Tarefa para o Codex — Fase 1 das melhorias da auditoria

Leia `docs/auditoria-backend.md` e `docs/auditoria-ux-mobile.md`. Implemente **somente** os itens abaixo, nesta branch (`melhorias/auditoria-2026-11`). **Não faça commit nem push.** O código e os textos ficam em português do Brasil, seguindo o estilo do projeto.

## Backend
1. **B1**: remover de `server/server.js` as rotas antigas `/api/pre-inscricoes/:id/pesquisa-conclusao`, `/pesquisa-satisfacao`, `/api/pre-inscricoes/sugestoes` e `/certificado/:id`, e recriá-las num router novo (`server/survey-certificate-router.js`) baseado em `db.readState`/`db.mutate`:
   - pesquisas e certificado exigem um token HMAC (`CERT_LINK_SECRET` no env, documentado em `.env.example`) que contém o id da inscrição e uma validade; incluir um helper para gerar o link (usado pelo admin em `inscritos.js`) ou, como alternativa, a sessão do cidadão (`Authorization: Bearer`);
   - o certificado só sai se `situacao_final` for `concluido` (ou o status for `certificado_emitido`);
   - todo dado interpolado em HTML passa por uma função `escapeHtml`;
   - ajustar `public/questionario-conclusao.html`, `public/pesquisa-satisfacao.html` e o link do certificado em `public/admin/adminjs/inscritos.js` para usar o token.
2. **B2**: remover `GET /api/pre-inscricoes/por-cpf/:cpf` e fazer o `VitorugaChat.tsx` usar `POST /api/cidadaos/localizar`. Em `localizar`, devolver apenas `{ localizou, email_mascarado }`, sem nome e sem telefone, e ajustar o frontend que usava esses campos.
3. **B3**: rate limit persistente no Firebase (`state.rateLimits`, janela fixa por hash de IP + rota, limpeza dos expirados). Limites: `localizar` 10/min, `enviar-codigo` 5/10 min, `validar-codigo` 10/10 min, `/inscricao` 5/10 min, `/api/interessados` 5/10 min, `/chat` 30/min. Resposta 429 com mensagem amigável. Usar `x-forwarded-for` (1º IP) na Vercel.
4. **B6**: apagar as rotas e o código mortos de `server/server.js` (rotas já cobertas pelos routers modulares, `otpStore`/`sessionStore` em memória, funções `mascarar*` sem uso, listas de cursos fixas no código) e reescrever o `/chat` sobre `readState` com textos UTF-8 corretos, vagas **restantes** e só cursos públicos. Manter `/public/:tipo` e `/api/estatisticas` funcionando (portar se necessário). Nenhum texto com mojibake (`Ã`, `ðŸ`) pode restar em `server/`, `src/` ou `public/`.
5. **B7**: a vaga volta ao cancelar. Remover a gravação automática de `status = 'esgotado'` em `enroll()`; "esgotado" passa a ser calculado pela ocupação (o status `esgotado` manual definido pelo admin continua valendo). Garantir que `courseState` e `getPublicCourses` reflitam as vagas livres depois do cancelamento.
6. **B10/B11**: `express.json`/`urlencoded` com limite de 100kb; CORS restrito a `PUBLIC_BASE_URL` + localhost em desenvolvimento; cabeçalhos de segurança em `vercel.json` (CSP compatível com Firebase Auth, Cloudinary, Unsplash, Google Fonts, VLibras e vídeo; HSTS; `X-Content-Type-Options`; `Referrer-Policy`; `frame-ancestors 'none'`; `Permissions-Policy`). `Cache-Control: public, s-maxage=30, stale-while-revalidate=120` em `/api/cursos-public*`, `/api/faq`, `/api/configuracoes-public` e `/public/:tipo`.
7. **B14**: testes em `tests/` (node:test) para: rotas antigas removidas (404), certificado negado sem token, negado para curso não concluído e com escape de HTML no nome, rate limit devolvendo 429 e a vaga voltando depois do cancelamento.

## Frontend (celular primeiro; o público inclui idosos)
8. **U1**: helper `cloudinary(url, width)` que insere `f_auto,q_auto,w_<n>` nas URLs `res.cloudinary.com/.../upload/`, com `srcset` (480/800/1200/1600) e `sizes` no carrossel do Hero e onde mais houver imagens do Cloudinary. Só o 1º slide com `fetchpriority="high"`, os demais com `loading="lazy"`. Unsplash com `w=600` no celular via srcset. Gerar versões WebP otimizadas dos PNGs locais grandes que o site usa (logo, mascotes `Vitoruga_*`, `mascotes/*`) com no máximo 512 px (ou o tamanho de exibição ×2) e trocar as referências; favicon PNG de 32 px + apple-touch-icon de 180 px. Se precisar de ferramenta, usar `sharp` só como devDependency, num script em `scripts/`. Usar `React.lazy` + `Suspense` nas rotas de pré-inscrição, detalhes e sobre, no VitorugaChat e no CourseQuizModal.
9. **U2**: no `IntroVideo`, adicionar um botão "Pular abertura" grande (≥ 48 px, alto contraste) visível desde o início; timeout máximo de 4 s; não exibir com `prefers-reduced-motion`, `navigator.connection.saveData` ou `effectiveType` 2g/3g. O Tab deve conseguir chegar ao botão.
10. **U3**: nenhum texto do site público abaixo de 13 px; informação secundária com ≥ 14 px; corpo com ≥ 16 px no celular. Diminuir a caixa alta com letter-spacing nos rótulos dos filtros e nos selos. Revisar os `text-[10px]`, `text-[11px]` e `text-xs` em `src/`.
11. **U5**: no celular (< 640 px), a seção de filtros mostra só a busca + chips de categoria com rolagem horizontal + um botão "Filtrar" com a contagem de filtros ativos, que abre uma folha inferior acessível (role dialog, foco preso, fecha com Esc e pelo botão "Ver N cursos") com os demais filtros em uma coluna e rótulos completos, sem texto cortado. No desktop o layout atual continua.
12. **U7**: alvos de toque ≥ 44×44 px (checkbox de vagas com rótulo clicável, ícones de redes sociais, links do rodapé).
13. **U8**: a bolha do Vitoruga e o botão "voltar ao topo" não cobrem conteúdo (padding-bottom na página, posições que não se sobrepõem); a dica "Precisa de ajuda?" aparece no máximo uma vez por sessão.
14. **U9**: "Inscrições: X/4" vira "Você pode se inscrever em até 4 cursos (já tem X)"; "Vagas disponíveis 30 / 30" vira "30 vagas livres de 30". Na interface pública, "suplente" vira "lista de espera" e "ementa" vira "o que você vai aprender". Quando a data de início já passou, mostrar "Aulas já começaram em DD/MM".
15. **U10**: trocar JetBrains Mono por Inter com `tabular-nums` nos números públicos.
16. **U11**: em `index.html`, o título vira "Qualifica Vix — Cursos gratuitos da Prefeitura de Vitória"; adicionar as tags Open Graph/Twitter com uma imagem de compartilhamento (1200×630, WebP/JPG otimizado) e um `manifest.webmanifest` simples. No detalhe do curso, um botão "Compartilhar" (Web Share API, com WhatsApp como alternativa).

## Fora do escopo (não fazer)
O formulário em etapas (U6), o e-mail opcional/SMS (U4/B9), a separação dos nós do Firebase (B5), o sequestro de CPF (B4) e as regras de negócio (B8). Esses itens dependem de decisão da gestão.

## Verificação obrigatória antes de terminar
- `npm test` passando (os testes existentes continuam passando).
- `npm run build` sem erros.
- No final, escrever em `docs/codex-fase1-relatorio.md`: o que foi feito em cada item, os arquivos alterados, o que ficou pendente ou foi adaptado e os comandos de verificação com o resultado.
