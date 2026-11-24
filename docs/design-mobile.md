# Design do Qualifica Vix — mobile first

Data: 23/11/2026. Direção combinada a partir de:
- análise de referências (Coursera, Nubank, padrões da Apple, Alura e Senac);
- opinião do Codex (diretor de design, só leitura);
- auditoria de UX de 19/11.

## Princípios
1. **Uma ideia por seção, uma ação por tela.** No topo há um botão só: "Encontrar meu curso".
2. **Foto real é a protagonista.** Fotos das turmas do próprio programa, sem véu branco por cima. O texto fica protegido só por um degradê na parte de baixo.
3. **Pouco texto, letra grande.** Título com 40 px no celular, texto com 16–18 px e nada abaixo de 14 px. Frases curtas, sem caixa alta.
4. **O card responde: o quê, quando, onde.** Foto, nome, início, turno/horário, local e um botão. O resto fica em "Ver detalhes do curso".
5. **A ajuda fica num lugar só.** Quiz, Vitoruga, aviso de novos cursos e telefone ficam juntos em "Precisa de ajuda?".
6. **Nada bloqueia a entrada.** O vídeo de abertura saiu da home e foi para "Sobre", como vídeo opcional.

## Estrutura da home
| # | Seção | Conteúdo |
|---|---|---|
| 1 | Cabeçalho | Logo + "Menu" (celular) / links + "Encontrar curso" (desktop) |
| 2 | Hero | Foto da Escola Móvel, "N cursos com vagas abertas", "Seu próximo curso é gratuito.", um botão |
| 3 | Cursos | "O que você quer aprender?", busca com sinônimos, chips das áreas existentes, botão de filtros (turno, local, idade, só com vagas), cards, "Mostrar mais" |
| 4 | Como funciona | 3 passos + aviso "pré-inscrição não garante a vaga" |
| 5 | Ajuda | Quiz · Vitoruga · Avisar quando abrir · Ligar (27) 3135-1000 |
| 6 | Rodapé | Logos, Sobre, Avaliar, VIVAcidade, telefone, redes sociais |

O que saiu da home: o vídeo de abertura, o carrossel de fotos, o painel de estatísticas, a faixa do VIVAcidade no topo, as abas "Mais procurados/Novas", "Ordenar", "Ideal para", os pré-requisitos e a descrição no card, o mascote sobre a foto, os depoimentos (foram para "Sobre") e o botão "voltar ao topo".

## Sistema visual (`src/index.css`)
- Cores: `--ink #14213d` nos títulos, `--ink-soft #4a5672` no texto de apoio, `--brand #2e64bd` na ação principal, `--open #146844` para vagas abertas, `--wait #9a4b00` para lista de espera, `--canvas #f5f7fb` no fundo alternado.
- Fonte: Inter em tudo. Títulos em 800 com tracking negativo.
- Raios: 20 px nos cards, 14 px nos botões, chips em pílula. Sombra leve (`--shadow-card`).
- Classes: `.btn-primary` (52 px de altura), `.btn-quiet`, `.chip` (44 px, `aria-pressed`), `.sheet` (folha inferior de filtros).

## Fotos
- As originais ficam em `public/imagem/proficao/`. O script `node scripts/fotos-cursos.cjs` gera as versões WebP de 640 e 1200 px em `public/imagem/cursos/`.
- `src/lib/courseImages.ts` escolhe a foto pelo nome ou pela área do curso. Áreas sem foto própria (informática, construção) ainda usam foto do Unsplash. **Para trocar, basta adicionar a foto real e uma linha no script e no mapa.**

## Medições (celular 375×812, dados reais de produção)
- Primeira visita: **725 KB**. Eram 9,9 MB em 19/11 e 1,8 MB depois da fase 1.
- Texto da home: cerca de 280 palavras. Altura da página: 5.976 px (era 7.754 px).
- 0 textos abaixo de 14 px, 0 alvos de toque abaixo de 44 px, sem rolagem horizontal.

## Direção Heat — revisão de 24/11/2026

Referência explicitamente escolhida pelo usuário — https://heat-fitness-template.vercel.app/.

A home foi adaptada com duas fotografias lado a lado, títulos condensados em Barlow Condensed, contraste preto/branco, destaque terracota e botões arredondados. As imagens reutilizam os arquivos WebP do projeto. A direção visual foi aplicada à home e ao catálogo.

A revisão também corrige o estado de erro do catálogo, o espaço mínimo da busca em telas estreitas, a combinação de filtros ao receber uma recomendação do quiz, o texto de vaga única e o foco visível dos controles. A administração da FAQ passa a buscar dados sem cache para refletir criação, edição e exclusão imediatamente.

A validação usa o servidor local de testes com dados fictícios e notificações desabilitadas. Inclui capturas em 390 e 1440 pixels e testes de catálogo em 320 pixels. As integrações externas reais dependem de suas credenciais e ambiente.
