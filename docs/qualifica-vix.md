# Atualização Qualifica Vix

O projeto está na branch `codex/qualifica-vix`. A configuração local fica em `.env.local`, ignorada pelo Git. A conta de serviço permanece fora do projeto, referenciada por `GOOGLE_APPLICATION_CREDENTIALS`.

## Executar e configurar

- `npm run dev`: frontend Vite e servidor Express.
- `npm run build`: checagem completa do TypeScript e build do frontend.
- `npm start`: aplicação completa em http://localhost:3000.
- `npm test`: testes locais de reserva, consentimentos, perfil, OTP, cadastro de curso, mascotes e relatórios.
- No PowerShell, `$env:TEST_FIREBASE='true'; npm test` também testa o Firebase real em um caminho temporário `qualificaVix/testing/<uuid>` e remove apenas esse caminho ao terminar. O catálogo real não é alterado.

`DB_PROVIDER=firebase` utiliza Realtime Database com Admin SDK. `DB_PROVIDER=local` oferece os cinco cursos de demonstração do repositório em memória. Para uma prévia local independente, use `$env:DB_PROVIDER='local'; $env:PORT='3100'; npm start`. O modo local perde seus cadastros quando o servidor é reiniciado.

O Firebase foi conectado e suas regras de acesso direto foram bloqueadas. O catálogo real está vazio: publique os cursos pelo painel `/admin/menu.html`. Os dados de demonstração não são importados automaticamente. O painel usa Firebase Authentication com e-mail e senha. O UID autorizado está em `server/admin-access.json`; não existe senha administrativa local.

## Recuperação da ficha

O CPF identifica a ficha, e um código de seis dígitos enviado ao e-mail cadastrado autoriza sua recuperação. O código expira em cinco minutos, admite três tentativas e só pode ser usado uma vez. Reenvios têm intervalo mínimo de um minuto. A sessão dura quinze minutos; tanto os códigos quanto as sessões são armazenados com hashes no Firebase, permitindo múltiplas instâncias do servidor.

Após a confirmação, a pessoa pode reutilizar os dados em outro curso, revisar e atualizar os campos ou somente atualizar a ficha, sem criar uma inscrição. CPF e documentos anexados não podem ser substituídos pelo formulário. A instituição continua responsável por validar os requisitos e confirmar a matrícula. As reservas não são expiradas automaticamente antes do contato institucional.

Para enviar os códigos, configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` e `EMAIL_FROM` em `.env.local`, e reinicie o servidor. O SMTP permanece desativado até essa configuração. O serviço informa uma falha se não puder enviar o código; ele não devolve o código ao navegador nem o imprime em logs.

## Cursos e mascotes

O catálogo exibe pré-requisitos e um pop-up com descrição, ementa, competências, carga horária, local, período e horário. Ao criar um curso, o administrador escolhe um Vitoruga para o banner, com prévia. Sem uma escolha explícita, o site usa a profissão correspondente à categoria.

O cidadão pode escolher o ícone do assistente no chat e na pré-inscrição. A preferência fica no navegador e também na ficha salva. A opção “Automático” acompanha a área do curso ou da conversa.

São oito opções: Vitoruga, chef, tecnologia, construção, beleza, saúde, moda e gestão. Todas as ilustrações dos banners têm fundo transparente, sem círculo branco no componente. O catálogo está em `public/mascotes.json`, e os prompts em `public/imagem/mascotes/PROMPTS.md`. A marca visível foi atualizada para `public/imagem/qualifica-vix.svg`.

## Elegibilidade e correção do CEP

O formulário consulta o CEP de residência. Para endereços fora de Vitória/ES, pergunta se o cidadão trabalha em Vitória. Somente a resposta afirmativa permite avançar; a declaração fica salva na ficha e na inscrição para validação pela instituição. Quem não mora nem trabalha na cidade recebe um aviso amigável e pode corrigir o CEP ou voltar à página inicial. A API também rejeita inscrições e atualizações sem esse vínculo, mesmo que seja enviada a confirmação genérica antiga de endereço fora de Vitória. Ao reutilizar uma ficha, o CEP e o vínculo são confirmados novamente.

## Persistência e acesso

Na Vercel, `/admin` e `/admin/` redirecionam ao login, que encaminha sessões já autenticadas ao dashboard. As páginas HTML, CSS e JavaScript do painel são servidas como arquivos estáticos; os dados administrativos exigem autenticação nas APIs. As rotas `/api`, `/public`, `/cursos`, `/inscritos`, `/inscricao`, `/chat` e `/certificado` passam pela função Express antes do fallback React. A conta de serviço do Firebase precisa ser configurada também nas variáveis de ambiente da Vercel; o `.env.local` pertence somente ao computador local.

O backend grava cursos, fichas, inscrições, consentimentos, preferências, FAQs e interessados sob `qualificaVix/data`. Cadastro, atualização da ficha e reserva de vaga são transações, evitando titularidade acima da capacidade e alteração de fichas sem autenticação. As regras em `firebase/database.rules.json` negam leitura e gravação direta pelo cliente; as APIs públicas retornam somente o catálogo e informações permitidas.

O painel tem rotas nativas para cursos, fichas, inscrições, configurações, indicadores, relatórios e exportação Excel. As demais consultas herdadas têm uma camada de compatibilidade explícita; consultas sem implementação falham, em vez de apresentar um resultado vazio como se fosse real. As transações atuais operam sobre o conjunto do portal, adequado ao início do projeto; para um grande volume de inscrições, convém particionar as reservas por turma e os perfis por cidadão.

Configuração baseada na [documentação do Admin SDK](https://firebase.google.com/docs/admin/setup), nas [transações do Realtime Database](https://firebase.google.com/docs/database/admin/save-data) e nas [regras de segurança](https://firebase.google.com/docs/database/security).

## Validação realizada

### Uso em celular

O portal recebeu ajustes de layout para celular: navegação compacta até a faixa de tablet, textos e áreas de toque maiores, filtros em uma coluna abaixo de 360 px e duas colunas nos celulares maiores, abas sem sobreposição e informações do local sem truncamento nos cards. O chat abre em uma janela que acompanha a área visível. A pré-inscrição ocupa a tela inteira e não mostra um segundo assistente flutuante. Pop-ups têm rolagem interna, e campos numéricos usam teclado adequado. As áreas de chat e inscrição acompanham `visualViewport` e as margens de segurança do dispositivo; a rolagem nativa fica ativa em celulares e tablets.

Conferência no navegador em larguras efetivas de 320, 390, 430, 768, 1024 e 1037 px, sem rolagem lateral; também foi testada altura de 390 px para conferir o encaixe do chat e formulário. Menu, acesso aos cursos, ementa e pré-inscrição foram conferidos. A simulação de altura reduzida não substitui um teste em aparelhos físicos com seus teclados. Build TypeScript/Vite e testes locais aprovados após os ajustes.

Build completo de TypeScript/Vite aprovado. Testes locais e testes com Firebase real aprovados, incluindo disputa pela última vaga, ausência de anexos, consentimento de imagem opcional, CPF existente, código incorreto, limite de reenvio, código de uso único, recuperação autenticada, atualização da ficha, nova inscrição, sessão expirada, curso com ementa/mascote e relatórios.

A leitura sem autenticação do Firebase retornou HTTP 401 após a aplicação das regras. Testes reais foram executados em área isolada e removidos; nenhuma ficha de cidadão real foi criada.

## Login administrativo com Firebase Authentication

1. No console do projeto `vixcursos`, ative Authentication → Sign-in method → E-mail/Senha e crie o usuário administrativo.
2. O UID `iGk2qpWxw6T1qv9PlOMuuEJnVk23` já está autorizado no servidor. Outros usuários precisam constar em `FIREBASE_ADMIN_UIDS` ou receber a claim `admin: true` via Admin SDK. Uma conta autenticada comum não acessa as fichas.
3. Na Vercel, configure `FIREBASE_SERVICE_ACCOUNT_JSON` com o conteúdo da conta de serviço como segredo **somente do servidor**, `FIREBASE_PROJECT_ID=vixcursos` e `FIREBASE_DATABASE_URL=https://vixcursos-default-rtdb.firebaseio.com`. Não use prefixo `VITE_` para a conta de serviço. O caminho `GOOGLE_APPLICATION_CREDENTIALS` de um arquivo do computador não funciona na Vercel.
4. Faça novo deploy após alterar as variáveis. Acesse `/admin` e entre com o e-mail e a senha desse usuário Firebase.

Na Vercel, o campo **Name** é `FIREBASE_SERVICE_ACCOUNT_JSON` e o campo **Value** contém o JSON completo. O servidor também aceita `FIREBASE_SERVICE_ACCOUNT_JSON={...}` quando a atribuição inteira é colada no valor. Falhas de configuração, chave e permissão exibem uma orientação e um código seguro no login; o conteúdo da credencial nunca é incluído no erro nem nos Logs.

O frontend usa o SDK Firebase instalado e passa um ID token ao servidor. O Admin SDK verifica o token, a autorização e o acesso recente, e cria uma sessão de oito horas em cookie HttpOnly, SameSite e Secure em produção. Sessões expiradas, revogadas ou de contas desativadas não dão acesso. A senha não é enviada ao backend do portal nem fica salva no navegador. O login tem tempo limite e permite tentar novamente quando há falha.

O backend conecta o Realtime Database apenas quando precisa dos dados; a consulta de sessão não depende dessa conexão. Produção sempre usa Firebase, inclusive se existirem variáveis antigas de banco externo. `DB_PROVIDER=local` é permitido somente para demonstração fora de produção. A integração anterior com banco externo e o script de mock foram removidos.
