# Atualização Qualifica Vix

O projeto está na branch `codex/qualifica-vix`. A configuração local fica em `.env.local`, ignorada pelo Git. A conta de serviço permanece fora do projeto, referenciada por `GOOGLE_APPLICATION_CREDENTIALS`.

## Executar e configurar

- `npm run dev`: frontend Vite e servidor Express.
- `npm run build`: checagem completa do TypeScript e build do frontend.
- `npm start`: aplicação completa em http://localhost:3000.
- `npm test`: testes locais de reserva, consentimentos, perfil, OTP, cadastro de curso, mascotes e relatórios.
- No PowerShell, `$env:TEST_FIREBASE='true'; npm test` também testa o Firebase real em um caminho temporário `qualificaVix/testing/<uuid>` e remove apenas esse caminho ao terminar. O catálogo real não é alterado.

`DB_PROVIDER=firebase` utiliza Realtime Database com Admin SDK. `DB_PROVIDER=local` oferece os cinco cursos de demonstração do repositório em memória. Para uma prévia local independente, use `$env:DB_PROVIDER='local'; $env:PORT='3100'; npm start`. O modo local perde seus cadastros quando o servidor é reiniciado.

O Firebase foi conectado e suas regras de acesso direto foram bloqueadas. A pedido do usuário, os cinco cursos existentes na prévia foram importados para o catálogo real: Beleza, Confecção, Gastronomia, Informática/Tecnologia e Enfermagem/Saúde. As datas e informações originais foram preservadas e podem ser corrigidas no painel. `node scripts/import-existing-courses.js` repete essa importação sem duplicar nem sobrescrever os cursos existentes. O painel usa Firebase Authentication com e-mail e senha. O UID autorizado está em `server/admin-access.json`; não existe senha administrativa local.

## Recuperação da ficha

O CPF identifica a ficha, e um código de seis dígitos enviado ao e-mail cadastrado autoriza sua recuperação. O código expira em cinco minutos, admite três tentativas e só pode ser usado uma vez. Reenvios têm intervalo mínimo de um minuto. A sessão dura quinze minutos; tanto os códigos quanto as sessões são armazenados com hashes no Firebase, permitindo múltiplas instâncias do servidor.

Após a confirmação, a pessoa pode reutilizar os dados em outro curso, revisar e atualizar os campos ou somente atualizar a ficha, sem criar uma inscrição. CPF e documentos anexados não podem ser substituídos pelo formulário. A instituição continua responsável por validar os requisitos e confirmar a matrícula. As reservas não são expiradas automaticamente antes do contato institucional.

Para enviar os códigos, configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` e `EMAIL_FROM` em `.env.local`, e reinicie o servidor. O SMTP permanece desativado até essa configuração. O serviço informa uma falha se não puder enviar o código; ele não devolve o código ao navegador nem o imprime em logs.

## Cursos e mascotes

O catálogo exibe pré-requisitos e um pop-up com descrição, ementa, competências, carga horária, local, período e horário. O painel permite criar e editar título, área, local, modalidade, vagas, idades, período, horário, conteúdo e situação do curso, além de escolher um Vitoruga em uma galeria com prévia. Site e painel consultam o mesmo catálogo no Firebase. Cursos arquivados ficam fora do site, mas permanecem no painel. As listas atualizam a cada 30 segundos enquanto visíveis; o site também atualiza ao recuperar o foco. Sem uma escolha explícita de mascote, o site usa a profissão correspondente à categoria.

## Pessoas interessadas

O botão “Quero receber avisos de cursos”, a opção “Tenho interesse” nos detalhes e o quiz do chat salvam contatos no mesmo Firebase, com autorização explícita para contato. O formulário recebe nome, telefone ou e-mail, área e cidade/bairro opcional; o interesse em uma turma também registra o curso. Interesse não reserva vaga nem substitui a pré-inscrição. Reenvios com o mesmo contato, área e curso atualizam o registro existente.

Em `/admin/interessados.html`, o administrador pode pesquisar os contatos, filtrar e atualizar a situação, consultar a origem e o curso, visualizar a demanda por área e exportar Excel. Essas consultas e alterações exigem sessão administrativa. Atualizar uma situação não envia mensagens automaticamente; o SMTP ainda depende da configuração do responsável.

O cidadão pode escolher o ícone do assistente no chat e na pré-inscrição. A preferência fica no navegador e também na ficha salva. A opção “Automático” acompanha a área do curso ou da conversa.

São oito opções: Vitoruga, chef, tecnologia, construção, beleza, saúde, moda e gestão. Todas as ilustrações dos banners têm fundo transparente, sem círculo branco no componente. O catálogo está em `public/mascotes.json`, e os prompts em `public/imagem/mascotes/PROMPTS.md`. A marca visível foi atualizada para `public/imagem/qualifica-vix.svg`.

## Elegibilidade e correção do CEP

O formulário consulta o CEP de residência. Para endereços fora de Vitória/ES, pergunta se o cidadão trabalha em Vitória. Somente a resposta afirmativa permite avançar; a declaração fica salva na ficha e na inscrição para validação pela instituição. Quem não mora nem trabalha na cidade recebe um aviso amigável e pode corrigir o CEP ou voltar à página inicial. A API também rejeita inscrições e atualizações sem esse vínculo, mesmo que seja enviada a confirmação genérica antiga de endereço fora de Vitória. Ao reutilizar uma ficha, o CEP e o vínculo são confirmados novamente.

## Persistência e acesso

Na Vercel, `/admin` e `/admin/` redirecionam ao login, que encaminha sessões já autenticadas ao dashboard. As páginas HTML, CSS e JavaScript do painel são servidas como arquivos estáticos; os dados administrativos exigem autenticação nas APIs. As rotas `/api`, `/public`, `/cursos`, `/inscritos`, `/inscricao`, `/chat` e `/certificado` passam pela função Express antes do fallback React. A conta de serviço do Firebase precisa ser configurada também nas variáveis de ambiente da Vercel; o `.env.local` pertence somente ao computador local.

O backend grava cursos, fichas, inscrições, consentimentos, preferências, FAQs e interessados sob `qualificaVix/data`. Cadastro, atualização da ficha e reserva de vaga são transações, evitando titularidade acima da capacidade e alteração de fichas sem autenticação. As regras em `firebase/database.rules.json` negam leitura e gravação direta pelo cliente; as APIs públicas retornam somente o catálogo e informações permitidas.

O painel tem rotas nativas para cursos, fichas, inscrições, configurações, indicadores, relatórios e exportação Excel. As demais consultas herdadas têm uma camada de compatibilidade explícita; consultas sem implementação falham, em vez de apresentar um resultado vazio como se fosse real. As transações atuais operam sobre o conjunto do portal, adequado ao início do projeto; para um grande volume de inscrições, convém particionar as reservas por turma e os perfis por cidadão.

Cada gravação mantém o valor carregado do Firebase disponível durante a transação e libera o observador ao terminar. Isso evita tratar um curso existente como ausente quando o cache está vazio. Os erros de validação preservam seus códigos HTTP; falhas operacionais retornam uma mensagem genérica sem dados da credencial.

Configuração baseada na [documentação do Admin SDK](https://firebase.google.com/docs/admin/setup), nas [transações do Realtime Database](https://firebase.google.com/docs/database/admin/save-data) e nas [regras de segurança](https://firebase.google.com/docs/database/security).

## Validação realizada

### Uso em celular

O portal recebeu ajustes de layout para celular: navegação compacta até a faixa de tablet, textos e áreas de toque maiores, filtros em uma coluna abaixo de 360 px e duas colunas nos celulares maiores, abas sem sobreposição e informações do local sem truncamento nos cards. O chat abre em uma janela que acompanha a área visível. A pré-inscrição ocupa a tela inteira e não mostra um segundo assistente flutuante. Pop-ups têm rolagem interna, e campos numéricos usam teclado adequado. As áreas de chat e inscrição acompanham `visualViewport` e as margens de segurança do dispositivo; a rolagem nativa fica ativa em celulares e tablets.

Conferência no navegador em larguras efetivas de 320, 390, 430, 768, 1024 e 1037 px, sem rolagem lateral; também foi testada altura de 390 px para conferir o encaixe do chat e formulário. Menu, acesso aos cursos, ementa e pré-inscrição foram conferidos. A simulação de altura reduzida não substitui um teste em aparelhos físicos com seus teclados. Build TypeScript/Vite e testes locais aprovados após os ajustes.

Build completo de TypeScript/Vite aprovado. Testes locais e testes com Firebase real aprovados, incluindo disputa pela última vaga, ausência de anexos, consentimento de imagem opcional, CPF existente, código incorreto, limite de reenvio, código de uso único, recuperação autenticada, atualização da ficha, nova inscrição, sessão expirada, curso com ementa/mascote e relatórios.

A leitura sem autenticação do Firebase retornou HTTP 401 após a aplicação das regras. Testes reais foram executados em área isolada e removidos; nenhuma ficha de cidadão real foi criada.

A integração de catálogo e interessados também foi testada no Firebase real em área isolada: importação sem duplicação, edição refletida no site, proteção dos contatos, consentimento, atualização de situação e exportação. Os onze testes passaram. Após a publicação, o login administrativo e as duas listas retornaram HTTP 200; site e painel exibiram os mesmos cinco cursos e mascotes.

## Login administrativo com Firebase Authentication

1. No console do projeto `vixcursos`, ative Authentication → Sign-in method → E-mail/Senha e crie o usuário administrativo.
2. O UID `iGk2qpWxw6T1qv9PlOMuuEJnVk23` já está autorizado no servidor. Outros usuários precisam constar em `FIREBASE_ADMIN_UIDS` ou receber a claim `admin: true` via Admin SDK. Uma conta autenticada comum não acessa as fichas.
3. Na Vercel, configure `FIREBASE_SERVICE_ACCOUNT_JSON` com o conteúdo da conta de serviço como segredo **somente do servidor**, `FIREBASE_PROJECT_ID=vixcursos` e `FIREBASE_DATABASE_URL=https://vixcursos-default-rtdb.firebaseio.com`. Não use prefixo `VITE_` para a conta de serviço. O caminho `GOOGLE_APPLICATION_CREDENTIALS` de um arquivo do computador não funciona na Vercel.
4. Faça novo deploy após alterar as variáveis. Acesse `/admin` e entre com o e-mail e a senha desse usuário Firebase.

Na Vercel, o campo **Name** é `FIREBASE_SERVICE_ACCOUNT_JSON` e o campo **Value** contém o JSON completo. O servidor também aceita `FIREBASE_SERVICE_ACCOUNT_JSON={...}` quando a atribuição inteira é colada no valor. Falhas de configuração, chave e permissão exibem uma orientação e um código seguro no login; o conteúdo da credencial nunca é incluído no erro nem nos Logs.

O projeto usa Node.js 24. A dependência `jose` de `jwks-rsa` está restrita à versão 5, com suporte a CommonJS, para evitar `ERR_REQUIRE_ESM` ao carregar Firebase Authentication no ambiente serverless. O teste de configuração carrega o SDK com `--no-experimental-require-module` para reproduzir essa condição de produção.

O frontend usa o SDK Firebase instalado e passa um ID token ao servidor. O Admin SDK verifica o token, a autorização e o acesso recente, e cria uma sessão de oito horas em cookie HttpOnly, SameSite e Secure em produção. Sessões expiradas, revogadas ou de contas desativadas não dão acesso. A senha não é enviada ao backend do portal nem fica salva no navegador. O login tem tempo limite e permite tentar novamente quando há falha.

O backend conecta o Realtime Database apenas quando precisa dos dados; a consulta de sessão não depende dessa conexão. Produção sempre usa Firebase, inclusive se existirem variáveis antigas de banco externo. `DB_PROVIDER=local` é permitido somente para demonstração fora de produção. A integração anterior com banco externo e o script de mock foram removidos.

## Ficha administrativa e ações dos inscritos

Em Alunos Inscritos, o botão “Ver ficha” abre diretamente o cadastro completo. O menu dos três pontinhos flutua fora da tabela, adapta a posição à tela e oferece ficha, WhatsApp e exclusão, com navegação por teclado e fechamento por Escape. A ficha organiza identificação, contatos, necessidades, responsável legal, objetivos, consentimentos e histórico; cabeçalho e botões ficam visíveis durante a rolagem. No celular, os dados usam uma coluna. Impressão/PDF inclui o mesmo conteúdo completo da tela.

A API privada combina o perfil atual com os consentimentos e pesquisas da inscrição mais recente, ordena o histórico por data e também aceita registros antigos que só existem nas inscrições. A leitura não altera o cadastro. A ausência de anexos de RG/CPF não impede abrir a ficha. Foram conferidos abertura pelo botão e pelo menu, retorno de foco, rolagem até o histórico e encaixe em 391 × 844 px, usando dados fictícios; testes da ficha passaram no banco local e no Firebase real em área isolada.

## Identidade visual e abertura

A logo fornecida está em `public/imagem/logo.png`, compartilhada pelo portal, login e páginas administrativas, pesquisas e certificado. A interface combina branco com superfícies em azul acinzentado claro, azul nos textos e ações e roxo e verde nos detalhes, seguindo a marca. A logo da Prefeitura usa a versão com nome preto e fundo transparente, sem cápsula azul. Formulários, chat, tabelas, gráficos e modais acompanham a mesma paleta.

A home reproduz a abertura enviada pelo Cloudinary com vídeo silencioso e inline em uma área de tela inteira. O vídeo mantém a proporção original e aparece completo, sem cortar as laterais no celular; a área acompanha a altura visível do navegador. A abertura aparece uma vez por sessão da aba, não tem opção de pular e se dissolve com desfoque e opacidade durante 1,3 segundo ao terminar ou falhar. Um limite de 15 segundos evita bloquear o acesso quando a conexão é lenta. Quem prefere movimento reduzido acessa diretamente o portal. A antiga animação de logos foi removida. O aviso de elegibilidade marcado na home foi removido; a validação de residência ou trabalho em Vitória continua na pré-inscrição. As fotos do hero têm menos sobreposição branca, mantendo contraste sob os textos.

O título da home não usa hífen entre “Cursos de qualificação profissional” e “Prefeitura de Vitória”. No desktop, mantém o tamanho e a disposição anteriores. No celular, o nome da Prefeitura aparece em uma linha menor, a descrição é curta, o botão de inscrição tem mais destaque e o painel de estatísticas dá lugar a um resumo compacto de cursos e vagas, com espaço para o chat. Foram conferidos celulares de aproximadamente 320, 390 e 430 px e a abertura em orientação horizontal; o build TypeScript/Vite passou.
