# Auditoria 2 — Design, UI/UX (celular, todos os públicos)

Data: 19/11/2026 · Testado em https://qualificavix.vercel.app num viewport de 375×812 (celular comum).
Público-alvo: toda a população de Vitória, incluindo idosos, pessoas com baixa escolaridade, jovens e quem usa plano de dados pré-pago.

Prioridade: **P0** = barreira de acesso · **P1** = atrito alto · **P2** = refinamento.

## P0 — Barreiras

### U1. Página pesada demais: cerca de 10 MB na primeira visita
Medido no celular, o carregamento da home baixa 31 arquivos, somando 9,9 MB.
- As 4 imagens do carrossel do topo são PNGs do Cloudinary **sem transformação**: 3,2 MB, 2,5 MB, 2,3 MB e 1,8 MB.
- `logo.png` (favicon) tem 1,37 MB, e os mascotes `Vitoruga_*.png` têm de 0,8 a 1,3 MB cada.
- Todo o JavaScript vai num único bundle de cerca de 560 KB.

**Correção:** aplicar `f_auto,q_auto,w_800` (celular) e `w_1600` (desktop) nas URLs do Cloudinary, com `srcset`. Converter os PNGs locais para WebP/AVIF em tamanhos adequados e usar um favicon de 32/180 px. Carregar só o 1º slide de imediato e o resto sob demanda. Dividir o código com `React.lazy` (chat, pré-inscrição, quiz). **Meta: menos de 1,5 MB na primeira visita.**

### U2. Vídeo de abertura bloqueia o site por até 15 s
`IntroVideo.tsx` cobre a tela inteira, prende o foco e só libera quando o vídeo termina ou depois de 15 s, **sem botão "Pular"**. Em 3G, a pessoa vê uma tela branca com o logo e pode achar que o site travou.
**Correção:** botão "Pular" grande e visível desde o 1º segundo. Duração máxima de 3 s. Não exibir quando `navigator.connection.saveData` estiver ativo, quando a conexão for 2G/3G ou com `prefers-reduced-motion`.

### U3. Textos pequenos demais
Na home, **90 elementos de texto têm menos de 14 px**: 27 com 10 px (selos "Inscrições Abertas", "Ideal para", etiquetas, rodapé) e 54 com 12 px (rótulos dos filtros, selos do topo, "Não sabe qual escolher?"). Muitos ainda estão em CAIXA ALTA espaçada, que é mais difícil de ler.
**Correção:** corpo do texto com no mínimo 16 px, informação secundária com no mínimo 14 px e nada abaixo de 13 px. Reduzir o uso de caixa alta. Linhas com altura de 1,5.

### U4. A inscrição exige e-mail
O e-mail e a confirmação dele são obrigatórios, e o código de acesso só vai por e-mail. Isso exclui uma parte grande do público (idosos, pessoas de baixa renda).
**Correção:** pedir o celular/WhatsApp como contato principal e deixar o e-mail opcional. O código vai pelo canal disponível (depende de B9 no backend).

## P1 — Atrito alto

### U5. Os cursos aparecem só depois de cerca de 2 telas de filtros
Antes da lista vêm: a busca, 5 caixas de seleção, um checkbox, o botão Buscar, o banner de avisos, as abas e "Ordenar". As caixas de seleção ficam cortadas no celular ("Todas as idade", "Todos os turno", "Todas as situaç", "Todas as categ"). A página tem 7.750 px de altura.
**Correção:** deixar acima da dobra só a busca e chips de categoria (com ícone e rolagem horizontal). Os demais filtros vão para um botão "Filtrar (2)" que abre uma folha inferior (bottom sheet) e mostra a contagem de resultados. Remover as abas duplicadas, ou trocá-las por um único seletor "Ordenar".

### U6. O formulário de inscrição em formato de chat é longo e não deixa corrigir respostas
`PreInscricao.tsx` faz de 16 a 25 perguntas, uma por vez, em balões de chat:
- não mostra o progresso ("passo 3 de 6");
- não deixa voltar e corrigir uma resposta anterior;
- perde tudo se a página recarregar;
- a sessão dura só 15 min.

Idosos e pessoas com pouca familiaridade digital abandonam esse tipo de fluxo.
**Correção:** um assistente em etapas (1 Você · 2 Contato · 3 Endereço · 4 Perfil · 5 Revisar e enviar), com barra de progresso e campos grandes com rótulo fixo acima. A tela de revisão deve ter "Alterar" em cada bloco. Guardar o rascunho em `sessionStorage` (sem CPF em `localStorage`). O Vitoruga pode continuar como ajudante ao lado, sem ser o formulário.

### U7. Alvos de toque pequenos
Checkbox "Exibir somente turmas com vagas" (16×16 px), ícones de redes sociais (32×32 px) e links do rodapé (20 px de altura).
**Correção:** no mínimo 44×44 px, com rótulo clicável.

### U8. Botões flutuantes sobrepõem o conteúdo
A bolha do Vitoruga e o botão "voltar ao topo" cobrem o texto e os botões dos cards no celular.
**Correção:** reservar `padding-bottom` no fim da página e reduzir a bolha a um ícone de 56 px. A dica "Precisa de ajuda?" deve aparecer só uma vez.

### U9. Informações confusas
- "Inscrições: 0/4" no topo da inscrição: trocar por "Você pode se inscrever em até 4 cursos".
- "Vagas disponíveis 30 / 30": trocar por "30 vagas livres (de 30)".
- "Início das aulas: 13/10/2026" com "Inscrições abertas" em 19/11: trocar por "Aulas já começaram", ou encerrar (ver B8).
- Termos internos ("suplente", "titular", "ementa", "modalidade"): trocar por "lista de espera", "vaga garantida", "o que você vai aprender" e "presencial/online".

### U10. Números em fonte monoespaçada
"5 cursos", "107 vagas", "30 / 30" usam JetBrains Mono, que é menos legível.
**Correção:** usar Inter com `font-variant-numeric: tabular-nums`.

## P2 — Refinamento e alcance

- U11. **Compartilhamento por WhatsApp**: adicionar Open Graph (`og:title`, `og:image`, `og:description`) e um botão "Compartilhar este curso" no detalhe. Hoje o título da página está em minúsculas ("prefeitura de vitória"). Usar "Qualifica Vix — Cursos gratuitos da Prefeitura de Vitória".
- U12. **Acessibilidade**: o VLibras já existe (ótimo). Adicionar um controle "A+ / A−" e alto contraste persistentes, foco visível em todos os controles e um botão sem rótulo acessível (encontrado 1). Respeitar `prefers-reduced-motion` também nos carrosséis e no framer-motion.
- U13. **Instalação (PWA)**: manifest e ícones para "Adicionar à tela inicial".
- U14. **Estados de erro e de carregamento**: mensagem amigável com "Tentar de novo" quando a API falhar, e skeleton nos cards em vez de tela vazia.
- U15. **Card de curso enxuto no celular**: nome, quando (dias/horário), onde (bairro), vagas e um botão grande "Quero me inscrever". O resto fica em "Ver detalhes".

## Não avaliado
- O painel administrativo no celular (é usado pela equipe, então tem prioridade menor).
- Teste com leitor de tela real (TalkBack/VoiceOver), recomendado antes do lançamento.

## O que está bom
- Sem rolagem horizontal, viewport correto, zoom permitido.
- VLibras, `alt` em todas as imagens, `lang="pt-BR"`, teclado numérico no CPF, CEP e telefone.
- Botão principal "Quero me inscrever" claro e com bom contraste. Linguagem acolhedora.
