import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Upload, 
  Check, 
  X, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Smile, 
  FileText, 
  MapPin, 
  Loader2,
  ExternalLink
} from 'lucide-react';

interface Question {
  pergunta: string;
  tipo: 'texto' | 'botoes' | 'arquivo';
  chave: string;
  mascara?: 'cpf' | 'telefone' | 'cep' | 'data';
  opcoes?: { texto: string; valor: string }[];
  buscaCep?: boolean;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  isDocument?: boolean;
  docName?: string;
}

export default function PreInscricao() {
  const { id: cursoId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cursoNome, setCursoNome] = useState('o curso selecionado');
  const [cursoLocal, setCursoLocal] = useState('');
  const [vagasVerificadas, setVagasVerificadas] = useState(false);
  const [cursoDisponivel, setCursoDisponivel] = useState(true);
  const [vagasInfo, setVagasInfo] = useState<{ inscritos: number; totais: number } | null>(null);
  const [loadingCurso, setLoadingCurso] = useState(true);

  // Voice synthesis settings
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Conversational state
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Specific flow stages
  const [aguardandoEscolhaCpf, setAguardandoEscolhaCpf] = useState(false);
  const [aguardandoConfirmacaoFoto, setAguardandoConfirmacaoFoto] = useState(false);
  const [dadosSalvosExito, setDadosSalvosExito] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');
  const [modoAutoPreenchimento, setModoAutoPreenchimento] = useState(false);
  const [documentoPendente, setDocumentoPendente] = useState<{ dataUrl: string; nome: string; tipo: string } | null>(null);
  
  // Validation checks
  const [enderecoValido, setEnderecoValido] = useState<boolean | null>(null);
  const [dadosSalvos, setDadosSalvos] = useState<any>(null);
  const [historicoCpf, setHistoricoCpf] = useState<any[]>([]);
  const [limiteInscricoes, setLimiteInscricoes] = useState(4);
  const [inscricoesAtivas, setInscricoesAtivas] = useState(0);
  const [objetivo1, setObjetivo1] = useState<string | null>(null);
  const [aguardandoObjetivo2, setAguardandoObjetivo2] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form payload
  const [respostasUsuario, setRespostasUsuario] = useState<Record<string, any>>({
    curso_id: cursoId,
    possui_necessidade_especial: 'nao',
    tipo_necessidade_especial: '',
    deficiencia_adaptacoes: '',
    deficiencia_recursos: '',
    nome: '',
    email: '',
    confirmacao_email: '',
    telefone: '',
    telefone_alternativo: '',
    cpf: '',
    rg: '',
    mora_vitoria: '',
    escolaridade: '',
    cep: '',
    numero: '',
    rua: '',
    bairro: '',
    municipio: '',
    data_nascimento: '',
    genero: '',
    raca_cor: '',
    responsavel_nome: '',
    responsavel_cpf: '',
    responsavel_parentesco: '',
    responsavel_telefone: '',
    responsavel_email: '',
    responsavel_autorizacao: '',
    autoriza_lgpd: 'sim',
    objetivo: '',
    cpf_documento: '',
    rg_documento: '',
  });

  const verificarIdadeMenor = (dataNasc: string) => {
    if (!dataNasc) return false;
    let partes = dataNasc.split('/');
    let data: Date;
    if (partes.length === 3) {
      const dia = parseInt(partes[0]);
      const mes = parseInt(partes[1]) - 1;
      const ano = parseInt(partes[2]);
      data = new Date(ano, mes, dia);
    } else {
      partes = dataNasc.split('-');
      if (partes.length !== 3) return false;
      const dia = parseInt(partes[2]);
      const mes = parseInt(partes[1]) - 1;
      const ano = parseInt(partes[0]);
      data = new Date(ano, mes, dia);
    }
    if (Number.isNaN(data.getTime())) return false;
    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const m = hoje.getMonth() - data.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) {
      idade--;
    }
    return idade < 18;
  };

  const obterRoteiroAtivo = (): Question[] => {
    const list: Question[] = [];
    
    // 1. CPF
    list.push({
      pergunta: `Olá! 🐢 Eu sou o Vitoruga, assistente virtual da Vix Cursos. Que legal que você quer se inscrever para <strong>{CURSO_NOME}</strong>! <br/><br/>Para começar, digite seu <strong>CPF</strong> no campo abaixo, só os números.`,
      tipo: 'texto',
      chave: 'cpf',
      mascara: 'cpf',
    });
    
    // 2. CEP
    list.push({
      pergunta: 'Perfeito. Agora me informe o seu <strong>CEP</strong> de residência para validar se você mora em Vitória.',
      tipo: 'texto',
      chave: 'cep',
      mascara: 'cep',
      buscaCep: true,
    });
    
    // 3. Número da residência
    list.push({
      pergunta: 'Qual é o <strong>Número</strong> da sua residência?',
      tipo: 'texto',
      chave: 'numero',
    });
    
    // 4. Nome Completo
    list.push({
      pergunta: 'Qual é o seu <strong>Nome Completo</strong>?',
      tipo: 'texto',
      chave: 'nome',
    });
    
    // 5. RG
    list.push({
      pergunta: 'Informe o número do seu <strong>RG</strong>.',
      tipo: 'texto',
      chave: 'rg',
    });

    // 6. E-mail
    list.push({
      pergunta: 'Qual é o seu <strong>E-mail</strong> principal?',
      tipo: 'texto',
      chave: 'email',
    });

    // 7. Confirmar E-mail
    list.push({
      pergunta: 'Por favor, <strong>Confirme seu E-mail</strong> digitando-o novamente.',
      tipo: 'texto',
      chave: 'confirmacao_email',
    });

    // 8. Telefone Principal
    list.push({
      pergunta: 'Qual é o seu <strong>WhatsApp/Celular Principal</strong> com DDD?',
      tipo: 'texto',
      chave: 'telefone',
      mascara: 'telefone',
    });

    // 9. Telefone Alternativo
    list.push({
      pergunta: 'Deseja informar um <strong>Telefone Alternativo</strong>? (Opcional — digite o número ou clique em Pular abaixo)',
      tipo: 'texto',
      chave: 'telefone_alternativo',
      mascara: 'telefone',
    });

    // 10. Data de Nascimento
    list.push({
      pergunta: 'Qual é a sua <strong>Data de Nascimento</strong>? (Formato: DD/MM/AAAA)',
      tipo: 'texto',
      chave: 'data_nascimento',
      mascara: 'data',
    });

    // 11. Gênero
    list.push({
      pergunta: 'Com qual <strong>Gênero</strong> você se identifica?',
      tipo: 'botoes',
      chave: 'genero',
      opcoes: [
        { texto: 'Masculino', valor: 'Masculino' },
        { texto: 'Feminino', valor: 'Feminino' },
        { texto: 'Outro', valor: 'Outro' },
        { texto: 'Prefiro não declarar', valor: 'Não declarado' },
      ]
    });

    // 12. Raça/Cor
    list.push({
      pergunta: 'Como você autodeclara sua <strong>Raça/Cor</strong> (classificação oficial do IBGE)?',
      tipo: 'botoes',
      chave: 'raca_cor',
      opcoes: [
        { texto: 'Branca', valor: 'Branca' },
        { texto: 'Preta', valor: 'Preta' },
        { texto: 'Parda', valor: 'Parda' },
        { texto: 'Amarela', valor: 'Amarela' },
        { texto: 'Indígena', valor: 'Indígena' },
        { texto: 'Não declarada', valor: 'Não declarada' },
      ]
    });

    // 13. Escolaridade
    list.push({
      pergunta: 'Qual é o seu <strong>Grau de Escolaridade</strong> atual?',
      tipo: 'botoes',
      chave: 'escolaridade',
      opcoes: [
        { texto: 'Ensino Fundamental Incompleto', valor: 'Ensino Fundamental Incompleto' },
        { texto: 'Ensino Fundamental Completo', valor: 'Ensino Fundamental Completo' },
        { texto: 'Ensino Médio Incompleto', valor: 'Ensino Médio Incompleto' },
        { texto: 'Ensino Médio Completo', valor: 'Ensino Médio Completo' },
        { texto: 'Ensino Superior Completo', valor: 'Ensino Superior Completo' },
      ],
    });

    // 14. Objetivo
    list.push({
      pergunta: 'Qual é o seu <strong>principal objetivo</strong> ao fazer este curso? (Escolha até 2 opções)',
      tipo: 'botoes',
      chave: 'objetivo',
      opcoes: [
        { texto: 'Conseguir emprego', valor: 'conseguir emprego' },
        { texto: 'Mudar de área', valor: 'mudar de área' },
        { texto: 'Aprimorar habilidades', valor: 'aprimorar habilidades' },
        { texto: 'Empreender', valor: 'empreender' },
        { texto: 'Complementar formação', valor: 'complementar formação' },
        { texto: 'Interesse pessoal', valor: 'interesse pessoal' }
      ]
    });

    // 15. Deficiência Sim/Não
    list.push({
      pergunta: 'Você possui alguma <strong>deficiência ou necessidade especial</strong>?',
      tipo: 'botoes',
      chave: 'possui_necessidade_especial',
      opcoes: [
        { texto: 'Não', valor: 'nao' },
        { texto: 'Sim', valor: 'sim' },
      ]
    });

    // Condicional: Deficiência detalhes
    if (respostasUsuario.possui_necessidade_especial === 'sim') {
      list.push({
        pergunta: 'Qual o <strong>tipo de deficiência</strong> ou necessidade especial?',
        tipo: 'texto',
        chave: 'tipo_necessidade_especial'
      });
      list.push({
        pergunta: 'Você necessita de alguma <strong>adaptação</strong> ou atendimento especializado para realizar as aulas? Se sim, descreva.',
        tipo: 'texto',
        chave: 'deficiencia_adaptacoes'
      });
      list.push({
        pergunta: 'Necessita de algum <strong>recurso assistivo</strong>? Se sim, descreva.',
        tipo: 'texto',
        chave: 'deficiencia_recursos'
      });
    }

    // Condicional: Responsável Legal se menor de 18 anos
    const eMenor = verificarIdadeMenor(respostasUsuario.data_nascimento);
    if (eMenor) {
      list.push({
        pergunta: 'Identificamos que você é menor de 18 anos. Informe o <strong>Nome Completo do seu Responsável Legal</strong>.',
        tipo: 'texto',
        chave: 'responsavel_nome'
      });
      list.push({
        pergunta: 'Qual o <strong>CPF do Responsável Legal</strong>?',
        tipo: 'texto',
        chave: 'responsavel_cpf',
        mascara: 'cpf'
      });
      list.push({
        pergunta: 'Qual o <strong>Grau de Parentesco</strong> com o responsável?',
        tipo: 'texto',
        chave: 'responsavel_parentesco'
      });
      list.push({
        pergunta: 'Qual o <strong>Telefone do Responsável</strong>?',
        tipo: 'texto',
        chave: 'responsavel_telefone',
        mascara: 'telefone'
      });
      list.push({
        pergunta: 'Qual o <strong>E-mail do Responsável</strong>?',
        tipo: 'texto',
        chave: 'responsavel_email'
      });
      list.push({
        pergunta: 'Você autoriza a participação do menor nos cursos oferecidos pelo VixCursos, conforme regulamento?',
        tipo: 'botoes',
        chave: 'responsavel_autorizacao',
        opcoes: [
          { texto: 'Sim, autorizo!', valor: 'sim' },
          { texto: 'Não autorizo', valor: 'nao' }
        ]
      });
    }

    // 16. Documentos
    list.push({
      pergunta: 'Agora envie uma foto legível do seu <strong>CPF (Frente)</strong> para validação de dados.',
      tipo: 'arquivo',
      chave: 'cpf_documento',
    });
    list.push({
      pergunta: 'Envie uma foto legível do seu <strong>RG (Frente e Verso)</strong>.',
      tipo: 'arquivo',
      chave: 'rg_documento',
    });

    // 17. Autorização LGPD
    list.push({
      pergunta: 'Você autoriza a divulgação do seu nome em listas públicas de classificados e suplentes do VixCursos, conforme a LGPD? (Caso não autorize, seu nome aparecerá parcialmente oculto nas listas públicas).',
      tipo: 'botoes',
      chave: 'autoriza_lgpd',
      opcoes: [
        { texto: 'Sim, autorizo', valor: 'sim' },
        { texto: 'Não autorizo', valor: 'nao' }
      ]
    });

    // 18. Confirmação Final
    list.push({
      pergunta: 'Atenção: A matrícula definitiva exige a entrega presencial dos documentos. <strong>Você confirma todos os dados informados para finalizar sua inscrição?</strong>',
      tipo: 'botoes',
      chave: 'confirmacao_final',
      opcoes: [
        { texto: 'Sim, quero finalizar!', valor: 'sim' },
        { texto: 'Não, cancelar inscrição.', valor: 'nao' }
      ]
    });

    return list;
  };

  const roteiro = obterRoteiroAtivo();

  // Speech synthesis setup
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (!speechEnabled || !synthRef.current) return;
    synthRef.current.cancel();

    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    
    const voices = synthRef.current.getVoices();
    const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    synthRef.current.speak(utterance);
  };

  // Check course validation and vacancies
  useEffect(() => {
    if (!cursoId) {
      alert('⚠️ Atenção: Você precisa selecionar um curso primeiro!');
      navigate('/');
      return;
    }

    const carregarDadosCurso = async () => {
      try {
        setLoadingCurso(true);
        const resCurso = await fetch(`/api/cursos-public/${cursoId}`);
        if (!resCurso.ok) {
          throw new Error('Curso não encontrado');
        }
        const dadosCurso = await resCurso.json();
        setCursoNome(dadosCurso.nome);
        setCursoLocal(dadosCurso.local);

        const resVagas = await fetch(`/api/cursos-public/${cursoId}/vagas`);
        const dadosVagas = await resVagas.json();
        
        setVagasInfo({
          inscritos: dadosVagas.inscritos,
          totais: dadosVagas.vagas_totais
        });
        setCursoDisponivel(dadosVagas.disponivel);
        setVagasVerificadas(true);

        // Fetch general configs for enrollment limit
        try {
          const resConf = await fetch('/api/admin/configuracoes');
          if (resConf.ok) {
            const confData = await resConf.json();
            if (confData.limite_inscricoes_semestre) {
              setLimiteInscricoes(confData.limite_inscricoes_semestre);
            }
          }
        } catch (e) {
          console.warn('Falha ao carregar configurações', e);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do curso:', err);
        setCursoDisponivel(false);
      } finally {
        setLoadingCurso(false);
      }
    };

    carregarDadosCurso();
  }, [cursoId, navigate]);

  // Initial trigger for the first question
  useEffect(() => {
    if (vagasVerificadas && cursoDisponivel) {
      const startChat = async () => {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 1200));
        setIsTyping(false);

        const firstQuestionText = roteiro[0].pergunta.replace('{CURSO_NOME}', cursoNome);
        const systemMessage: Message = {
          id: 'msg-0',
          sender: 'bot',
          text: firstQuestionText,
        };
        setMessages([systemMessage]);
        speakText(firstQuestionText);
      };
      startChat();
    }
  }, [vagasVerificadas, cursoDisponivel, cursoNome, speechEnabled]);

  // Autoscroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, documentoPendente, aguardandoObjetivo2]);

  const addBotMessage = async (text: string, delay = 1000) => {
    setIsTyping(true);
    await new Promise((r) => setTimeout(r, delay));
    setIsTyping(false);
    
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: 'bot',
        text,
      },
    ]);

    speakText(text);
  };

  const addUserMessage = (text: string, isDoc = false, docName?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random()}`,
        sender: 'user',
        text,
        isDocument: isDoc,
        docName,
      },
    ]);
  };

  // Helper validation functions
  const validarCpf = (c: string) => {
    const clean = c.replace(/\D/g, '');
    if (clean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(clean)) return false;

    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(clean.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(clean.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.substring(10, 11))) return false;

    return true;
  };

  const validarEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const normalizarCpf = (v: string) => {
    return v.replace(/\D/g, '').slice(0, 11);
  };

  const normalizarRg = (v: string) => {
    return v.trim().toUpperCase().replace(/\s+/g, ' ').slice(0, 20);
  };

  const formatarCpf = (v: string) => {
    const raw = normalizarCpf(v);
    return raw
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  // CEP Lookup ViaCEP
  const buscarCep = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, '');
    if (clean.length !== 8) return false;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        if (data.localidade.trim().toLowerCase() !== 'vitória' || data.uf.trim().toUpperCase() !== 'ES') {
          setEnderecoValido(false);
          await addBotMessage(
            `❌ <strong>Acesso bloqueado:</strong> Os cursos do VixCursos são destinados exclusivamente a moradores de Vitória - ES. Seu endereço (${data.localidade} - ${data.uf}) não está dentro do município.`,
            600
          );
          return false;
        }

        setEnderecoValido(true);
        setRespostasUsuario((prev) => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          municipio: data.localidade || 'Vitória',
          mora_vitoria: 'sim'
        }));
        
        await addBotMessage(
          `Achei! Rua <strong>${data.logradouro}</strong>, Bairro <strong>${data.bairro}</strong>. Endereço validado para Vitória/ES! ✅`,
          800
        );
        return true;
      } else {
        await addBotMessage('❌ CEP não encontrado. Por favor, verifique o CEP informado.', 600);
      }
    } catch (e) {
      console.error('Erro na busca de CEP', e);
      await addBotMessage('❌ Falha na consulta de CEP. Verifique sua conexão e tente novamente.', 600);
    }
    return false;
  };

  // Form Submission
  const enviarInscricaoAoBanco = async (dadosFinais: any) => {
    await addBotMessage('Processando sua pré-inscrição junto à Prefeitura... ⏳', 1500);

    try {
      const res = await fetch('/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosFinais),
      });

      const responseData = await res.json();

      if (res.ok && !responseData.error) {
        setProtocoloGerado(responseData.protocolo);
        setDadosSalvosExito(true);

        const statusLabel = responseData.status_inscricao === 'suplente' ? 'SUPLENTE (Lista de espera)' : 'TITULAR';
        await addBotMessage(
          `🎉 <strong>INSCRIÇÃO REALIZADA!</strong><br/><br/>Seu número de protocolo é: <strong>${responseData.protocolo}</strong>.<br/>Classificação: <strong>${statusLabel}</strong>.<br/><br/>Daremos o retorno no seu e-mail e celular assim que as vagas forem validadas.`,
          1500
        );
        
        if (responseData.notificacoes?.canal === 'sms') {
          await addBotMessage(
            'ℹ️ Enviamos o comprovante por <strong>SMS</strong>. Caso seu telefone tenha WhatsApp, certifique-se de que nossa central está habilitada.',
            1000
          );
        }
      } else {
        await addBotMessage(
          `❌ <strong>Falha na inscrição:</strong> ${responseData.error || 'Vagas esgotadas'}.<br/><br/>Tente novamente ou selecione outra turma.`,
          1200
        );
        setTimeout(() => {
          window.location.reload();
        }, 4000);
      }
    } catch (err) {
      console.error('Erro ao enviar inscrição:', err);
      await addBotMessage('❌ Falha na conexão com o servidor. Verifique sua conexão com a internet e tente novamente.', 1000);
    }
  };

  // Auto-fill logic
  const aplicarDadosAutopreenchimento = (dados: any) => {
    setRespostasUsuario((prev) => {
      const novo = { ...prev };
      [
        'nome', 'email', 'telefone', 'telefone_alternativo', 'rg', 'mora_vitoria', 
        'escolaridade', 'possui_necessidade_especial', 
        'tipo_necessidade_especial', 'deficiencia_adaptacoes', 'deficiencia_recursos',
        'cep', 'numero', 'rua', 'bairro', 'municipio', 'data_nascimento', 'genero', 'raca_cor'
      ].forEach((campo) => {
        if (dados[campo] !== undefined && dados[campo] !== null) {
          novo[campo] = dados[campo];
        }
      });
      novo.confirmacao_email = dados.email || '';
      return novo;
    });
  };

  // Main flow controller
  const prosseguirEtapa = async (valor: string, labelExibida?: string) => {
    const qAtual = roteiro[etapaAtual];

    // 1. Handle CPF auto-fill prompt
    if (aguardandoEscolhaCpf) {
      const confirmou = valor === 'auto';
      addUserMessage(labelExibida || (confirmou ? 'Auto-preencher' : 'Quero mudar algo'));
      setAguardandoEscolhaCpf(false);
      setModoAutoPreenchimento(confirmou);

      if (confirmou) {
        aplicarDadosAutopreenchimento(dadosSalvos);
        await addBotMessage(
          'Perfeito! Vou reaproveitar os dados de cadastro e histórico e avançar direto para as fotos dos documentos. 📂',
          800
        );
        // Skip directly to document collection (cpf_documento)
        const indexDoc = roteiro.findIndex((x) => x.chave === 'cpf_documento');
        setEtapaAtual(indexDoc);
        return;
      } else {
        await addBotMessage(
          'Entendido. Vamos preencher o restante passo a passo e você poderá alterar o que quiser. ✏️',
          800
        );
        // Go to CEP (step 2)
        const indexCep = roteiro.findIndex((x) => x.chave === 'cep');
        setEtapaAtual(indexCep);
        return;
      }
    }

    // 2. Handle Document photo confirmation
    if (aguardandoConfirmacaoFoto) {
      const confirmou = valor === 'confirmar_foto';
      addUserMessage(labelExibida || (confirmou ? 'Usar esta foto' : 'Trocar foto'));
      setAguardandoConfirmacaoFoto(false);
      
      const configDoc = obterConfigDocumento();

      if (!confirmou) {
        setDocumentoPendente(null);
        if (configDoc.chave) {
          setRespostasUsuario((prev) => ({
            ...prev,
            [configDoc.chave]: '',
          }));
        }
        await addBotMessage(`Sem problemas! Envie outra foto ou arquivo do seu ${configDoc.nome}.`, 600);
        return;
      }

      // Save file to payload
      if (documentoPendente && configDoc.chave) {
        setRespostasUsuario((prev) => ({
          ...prev,
          [configDoc.chave]: documentoPendente.dataUrl,
        }));
      }

      setDocumentoPendente(null);

      // Advance stage
      const proxEtapa = etapaAtual + 1;
      
      // If we are auto-filling and finished both documents, skip straight to LGPD / confirmation
      if (modoAutoPreenchimento && roteiro[proxEtapa]?.chave === 'autoriza_lgpd') {
        const indexLgpd = roteiro.findIndex((x) => x.chave === 'autoriza_lgpd');
        setEtapaAtual(indexLgpd);
      } else {
        setEtapaAtual(proxEtapa);
      }
      return;
    }

    // 3. Handle double objectives check
    if (aguardandoObjetivo2) {
      setAguardandoObjetivo2(false);
      addUserMessage(labelExibida || valor);

      let finalObj = objetivo1 || '';
      if (valor !== 'prosseguir') {
        finalObj += `, ${valor}`;
      }

      setRespostasUsuario((prev) => ({
        ...prev,
        objetivo: finalObj,
      }));

      // Go to next step after objetivo
      const idxObj = roteiro.findIndex((x) => x.chave === 'objetivo');
      setEtapaAtual(idxObj + 1);
      return;
    }

    // 4. Standard flow logic
    addUserMessage(labelExibida || valor);
    setInputValue('');

    // Update responses
    let valorNormalizado = valor;
    if (qAtual.chave === 'cpf') {
      valorNormalizado = normalizarCpf(valor);
    } else if (qAtual.chave === 'rg') {
      valorNormalizado = normalizarRg(valor);
    }

    setRespostasUsuario((prev) => ({
      ...prev,
      [qAtual.chave]: valorNormalizado,
    }));

    // Specific field validations & branches
    if (qAtual.chave === 'cpf') {
      if (!validarCpf(valor)) {
        await addBotMessage('❌ CPF inválido. Digite os 11 números corretos para prosseguir.', 600);
        return;
      }

      // Query database for existing registration and active count
      try {
        setIsTyping(true);
        const response = await fetch(`/api/pre-inscricoes/por-cpf/${valorNormalizado}`);
        setIsTyping(false);
        if (response.ok) {
          const resJson = await response.json();
          setInscricoesAtivas(resJson.historico?.length || 0);
          
          if (resJson.found) {
            setDadosSalvos(resJson.data);
            setHistoricoCpf(resJson.historico || []);
            
            let histText = '<strong>Histórico de Inscrições:</strong><br/>';
            resJson.historico.forEach((h: any) => {
              const matriculaStatus = h.matricula_confirmada === 1 ? 'Confirmada' : 'Pendente';
              const classifStatus = h.status_inscricao === 'suplente' ? 'Suplente' : 'Titular';
              histText += `• <strong>${h.curso_nome}</strong> (${h.local_nome}) — ${classifStatus} — Matrícula: ${matriculaStatus}<br/>`;
            });

            await addBotMessage(
              `Encontrei seus dados em nosso sistema!<br/><br/>${histText}<br/>Deseja aproveitar os dados de cadastro e histórico para a nova inscrição?`,
              800
            );
            setAguardandoEscolhaCpf(true);
            return;
          }
        }
      } catch (err) {
        console.error('Erro ao validar CPF na API', err);
      }
    }

    if (qAtual.chave === 'cep') {
      const ok = await buscarCep(valor);
      if (!ok) return; // stays on CEP question
    }

    if (qAtual.chave === 'email') {
      if (!validarEmail(valor)) {
        await addBotMessage('❌ E-mail inválido. Por favor, insira um e-mail no formato correto (exemplo@gmail.com).', 600);
        return;
      }
    }

    if (qAtual.chave === 'confirmacao_email') {
      if (valor.trim().toLowerCase() !== respostasUsuario.email.trim().toLowerCase()) {
        await addBotMessage('❌ Os e-mails informados não coincidem. Por favor, redigite o e-mail de confirmação.', 600);
        // Reset the value in inputs
        setInputValue('');
        return;
      }
    }

    if (qAtual.chave === 'objetivo') {
      setObjetivo1(valor);
      setAguardandoObjetivo2(true);
      await addBotMessage('Deseja selecionar uma segunda opção de objetivo ou quer prosseguir?', 600);
      return;
    }

    if (qAtual.chave === 'possui_necessidade_especial') {
      if (valor === 'nao') {
        // Skip special needs detail questions
        const indexNext = roteiro.findIndex(x => x.chave === 'possui_necessidade_especial');
        const eMenor = verificarIdadeMenor(respostasUsuario.data_nascimento);
        let targetIndex = indexNext + 1;
        if (eMenor) {
          targetIndex = roteiro.findIndex(x => x.chave === 'responsavel_nome');
        } else {
          targetIndex = roteiro.findIndex(x => x.chave === 'cpf_documento');
        }
        setEtapaAtual(targetIndex);
        return;
      }
    }

    if (qAtual.chave === 'deficiencia_recursos') {
      // Special needs details complete, check age branches
      const eMenor = verificarIdadeMenor(respostasUsuario.data_nascimento);
      if (!eMenor) {
        const indexDoc = roteiro.findIndex(x => x.chave === 'cpf_documento');
        setEtapaAtual(indexDoc);
        return;
      }
    }

    if (qAtual.chave === 'data_nascimento') {
      // check format
      const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!regexData.test(valor)) {
        await addBotMessage('❌ Data inválida. Use o formato DD/MM/AAAA (ex: 20/05/1995).', 600);
        return;
      }
    }

    if (qAtual.chave === 'responsavel_cpf') {
      if (!validarCpf(valor)) {
        await addBotMessage('❌ CPF do responsável inválido. Digite os 11 números corretos para prosseguir.', 600);
        return;
      }
    }

    if (qAtual.chave === 'responsavel_email') {
      if (!validarEmail(valor)) {
        await addBotMessage('❌ E-mail do responsável inválido. Por favor, insira um e-mail correto.', 600);
        return;
      }
    }

    if (qAtual.chave === 'responsavel_autorizacao' && valor === 'nao') {
      await addBotMessage('❌ Inscrição bloqueada: A autorização do responsável legal é obrigatória para a participação do menor.', 600);
      return;
    }

    // Advance to next step
    const prox = etapaAtual + 1;
    setEtapaAtual(prox);
  };

  // Trigger bot reaction on step update
  useEffect(() => {
    if (etapaAtual > 0 && etapaAtual < roteiro.length) {
      const askQuestion = async () => {
        const q = roteiro[etapaAtual];
        const rawText = q.pergunta.replace('{CURSO_NOME}', cursoNome);
        
        // Custom warning message on 2nd and 3rd active enrollments
        if (q.chave === 'nome' && inscricoesAtivas > 0) {
          if (inscricoesAtivas === 1) {
            await addBotMessage('⚠️ <strong>Atenção:</strong> Você já possui 1 inscrição ativa. Esta segunda inscrição simultânea concorrerá ao mesmo tempo no período.', 500);
          } else if (inscricoesAtivas >= 2) {
            await addBotMessage(`⚠️ <strong>Aviso:</strong> Você já possui ${inscricoesAtivas} inscrições ativas. Esta nova inscrição entrará na fila de suplência automaticamente.`, 500);
          }
        }

        await addBotMessage(rawText, 1000);
      };
      askQuestion();
    } else if (etapaAtual >= roteiro.length && vagasVerificadas && cursoDisponivel) {
      if (respostasUsuario.confirmacao_final === 'nao') {
        addBotMessage('Pré-inscrição cancelada. Redirecionando para a página principal...', 1000);
        setTimeout(() => navigate('/'), 3000);
      } else {
        enviarInscricaoAoBanco(respostasUsuario);
      }
    }
  }, [etapaAtual]);

  const obterConfigDocumento = () => {
    const q = roteiro[etapaAtual];
    if (!q || q.tipo !== 'arquivo') {
      return { nome: 'Documento', artigo: 'o', chave: '' };
    }
    return q.chave === 'cpf_documento'
      ? { nome: 'CPF (Frente)', artigo: 'o', chave: 'cpf_documento' }
      : { nome: 'RG (Frente/Verso)', artigo: 'o', chave: 'rg_documento' };
  };

  // Handle file uploads
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsTyping(true);
    const configDoc = obterConfigDocumento();

    try {
      const isPdf = file.type.toLowerCase() === 'application/pdf';
      let finalDataUrl = '';

      if (isPdf) {
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const img = new Image();
            img.onload = () => {
              let { width, height } = img;
              const maxLado = 1280;
              if (width > height && width > maxLado) {
                height = Math.round((height * maxLado) / width);
                width = maxLado;
              } else if (height >= width && height > maxLado) {
                width = Math.round((width * maxLado) / height);
                height = maxLado;
              }

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Canvas error'));
                return;
              }
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = () => reject(new Error('Image load error'));
            img.src = reader.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setDocumentoPendente({
        dataUrl: finalDataUrl,
        nome: file.name,
        tipo: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
      });
      setIsTyping(false);

      addUserMessage(`📎 ${configDoc.nome}: ${file.name}`, true, file.name);

      await addBotMessage(
        isPdf
          ? `Recebi o PDF do seu ${configDoc.nome}. Gostaria de confirmar e usar este arquivo ou quer trocar por outro?`
          : `Recebi a imagem do seu ${configDoc.nome}. Gostaria de usar esta foto ou quer tirar outra?`,
        800
      );
      setAguardandoConfirmacaoFoto(true);
    } catch (err) {
      setIsTyping(false);
      await addBotMessage('❌ Não consegui processar esse arquivo. Tente enviar uma foto JPG/PNG comum ou um PDF legível.', 600);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    prosseguirEtapa(val);
  };

  // Format inputs according to active masks
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = roteiro[etapaAtual];
    let val = e.target.value;

    if (q && q.mascara) {
      const digitos = val.replace(/\D/g, '');
      if (q.mascara === 'cpf') {
        val = formatarCpf(digitos);
        if (val.length > 14) val = val.substring(0, 14);
      } else if (q.mascara === 'telefone') {
        let fmt = digitos;
        if (digitos.length > 2) {
          fmt = `(${digitos.substring(0, 2)}) ${digitos.substring(2)}`;
        }
        if (digitos.length > 7) {
          fmt = `(${digitos.substring(0, 2)}) ${digitos.substring(2, 7)}-${digitos.substring(7)}`;
        }
        val = fmt.substring(0, 15);
      } else if (q.mascara === 'cep') {
        let fmt = digitos;
        if (digitos.length > 5) {
          fmt = `${digitos.substring(0, 5)}-${digitos.substring(5)}`;
        }
        val = fmt.substring(0, 9);
      } else if (q.mascara === 'data') {
        let fmt = digitos;
        if (digitos.length > 2) {
          fmt = `${digitos.substring(0, 2)}/${digitos.substring(2)}`;
        }
        if (digitos.length > 4) {
          fmt = `${digitos.substring(0, 2)}/${digitos.substring(2, 4)}/${digitos.substring(4)}`;
        }
        val = fmt.substring(0, 10);
      }
    }
    setInputValue(val);
  };

  if (loadingCurso) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="font-display font-medium text-lg">Carregando dados da matrícula...</p>
      </div>
    );
  }

  // Course sold out view
  if (!cursoDisponivel && vagasVerificadas) {
    return (
      <div className="min-h-screen bg-[linear-gradient(120deg,rgba(4,8,22,0.92),rgba(7,17,31,0.85),rgba(11,23,48,0.9)),url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=2000')] bg-center bg-cover bg-no-repeat flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-dark rounded-3xl p-8 border border-danger/20 text-center shadow-2xl animate-float">
          <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-danger">
            <X className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Turma Esgotada</h2>
          <p className="text-white/60 mb-6 leading-relaxed">
            Infelizmente, as vagas disponíveis para o curso <strong>{cursoNome}</strong> foram preenchidas.
          </p>
          {vagasInfo && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-white/70 text-sm font-mono">
                Total de vagas: <span className="text-white font-bold">{vagasInfo.totais}</span>
              </p>
              <p className="text-white/70 text-sm font-mono mt-1">
                Matrículas realizadas: <span className="text-danger font-bold">{vagasInfo.inscritos}</span>
              </p>
            </div>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-bold uppercase text-xs tracking-wider transition-all hover:scale-105 hover:bg-primary/95 shadow-lg shadow-primary/20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,rgba(4,8,22,0.94),rgba(7,17,31,0.85),rgba(11,23,48,0.92)),url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=2000')] bg-center bg-cover bg-no-repeat flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-coral/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg h-[88vh] md:max-h-[820px] glass-dark rounded-3xl flex flex-col overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/10 relative z-10">
        
        {/* Chat Header */}
        <header className="bg-black/40 px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-md">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              aria-label="Voltar para página inicial"
              className="text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative">
              <img 
                src="/imagem/vitorugaoficial.png" 
                alt="Vitoruga" 
                className="w-11 h-11 rounded-full border-2 border-accent p-[2px] bg-slate-900 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/imagem/Vitoruga.png';
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-sm tracking-wide">Vitoruga</h1>
              <p className="text-[11px] text-success font-semibold flex items-center gap-1">
                Assistente de Matrícula
              </p>
            </div>
          </div>

          {/* Voice toggle */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            title={speechEnabled ? 'Mutar leitura' : 'Ativar leitura por voz'}
            aria-label={speechEnabled ? 'Mutar Vitoruga' : 'Ativar voz do Vitoruga'}
            className={`p-2.5 rounded-full border transition-all ${
              speechEnabled 
                ? 'bg-accent/20 border-accent text-accent glow-accent' 
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </header>

        {/* Info Strip */}
        <div className="bg-primary/20 px-6 py-2 border-b border-white/5 flex items-center justify-between text-white/70 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="truncate">
              Turma: <strong className="text-white">{cursoNome}</strong> no {cursoLocal || 'Senai'}
            </span>
          </div>
          <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono font-bold text-accent">
            Inscrições: {inscricoesAtivas}/{limiteInscricoes}
          </span>
        </div>

        {/* Message Board */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-lg transition-all animate-[popIn_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)] ${
                msg.sender === 'bot'
                  ? 'bg-slate-800/90 text-white border border-white/5 self-start rounded-tl-sm'
                  : 'bg-gradient-to-r from-coral to-accent text-white self-end rounded-tr-sm shadow-accent/10'
              }`}
            >
              {msg.isDocument ? (
                <div className="flex items-center gap-2 font-semibold">
                  <FileText className="w-5 h-5 flex-shrink-0 text-white" />
                  <span className="truncate">{msg.docName}</span>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="bg-slate-800/90 text-white border border-white/5 self-start rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center w-16">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.16s]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.32s]" />
            </div>
          )}

          {/* Success Banner context links */}
          {dadosSalvosExito && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mt-4 text-center">
              <h3 className="font-bold text-white text-base mb-2">Comprovante de Pré-Inscrição</h3>
              <p className="text-white/60 text-xs mb-4">Sua inscrição foi confirmada no sistema. Você pode acompanhar pelo código: <strong>{protocoloGerado}</strong>.</p>
              
              {/* SINE Link */}
              {(respostasUsuario.objetivo?.includes('conseguir emprego') || respostasUsuario.objetivo?.includes('mudar de área')) && (
                <div className="bg-accent/15 border border-accent/30 rounded-xl p-4 mb-4 text-left">
                  <h4 className="font-bold text-accent text-sm mb-1">Encaminhamento ao SINE Vitória</h4>
                  <p className="text-white/70 text-xs mb-3">Encontramos vagas alinhadas com o seu curso de qualificação! Acesse o portal SINE Vitória para candidatar-se.</p>
                  <a href="https://trabalha.vitoria.es.gov.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-accent text-white font-bold text-xs px-3 py-2 rounded-lg hover:scale-102 transition-all">
                    Ver Vagas no SINE <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Sebrae Link */}
              {respostasUsuario.objetivo?.includes('empreender') && (
                <div className="bg-success/15 border border-success/30 rounded-xl p-4 mb-4 text-left">
                  <h4 className="font-bold text-success text-sm mb-1">Deseja Empreender? Parceria Sebrae-ES</h4>
                  <p className="text-white/70 text-xs mb-3">Quer montar seu próprio negócio e formalizar como MEI? O Sebrae-ES oferece cursos e consultorias gratuitas.</p>
                  <a href="https://www.es.sebrae.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-success text-white font-bold text-xs px-3 py-2 rounded-lg hover:scale-102 transition-all">
                    Acessar Sebrae-ES <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-white/5 border border-white/10 hover:border-accent/40 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Voltar à página inicial
              </Link>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Form Controls / Inputs */}
        <footer className="bg-black/20 border-t border-white/5 p-4 flex flex-col gap-3">
          
          {/* Options mode (Buttons) */}
          {roteiro[etapaAtual]?.tipo === 'botoes' && !aguardandoConfirmacaoFoto && !aguardandoEscolhaCpf && !aguardandoObjetivo2 && !dadosSalvosExito && (
            <div className="flex flex-wrap gap-2 justify-end">
              {roteiro[etapaAtual].opcoes?.map((opt) => (
                <button
                  key={opt.valor}
                  onClick={() => prosseguirEtapa(opt.valor, opt.texto)}
                  className="bg-slate-900 border border-accent/40 text-accent hover:bg-accent hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {opt.texto}
                </button>
              ))}
            </div>
          )}

          {/* CPF Prompt (Auto fill options) */}
          {aguardandoEscolhaCpf && !dadosSalvosExito && (
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => prosseguirEtapa('auto', 'Auto-preencher')}
                className="bg-accent text-white hover:bg-accent/90 font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Auto-preencher
              </button>
              <button
                onClick={() => prosseguirEtapa('editar', 'Quero mudar algo')}
                className="bg-slate-900 border border-white/20 text-white/80 hover:bg-white/10 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Digitar do zero
              </button>
            </div>
          )}

          {/* Double objective picker confirm buttons */}
          {aguardandoObjetivo2 && !dadosSalvosExito && (
            <div className="flex flex-wrap gap-2 justify-end">
              {roteiro.find(x => x.chave === 'objetivo')?.opcoes
                ?.filter(o => o.valor !== objetivo1)
                ?.map((opt) => (
                  <button
                    key={opt.valor}
                    onClick={() => prosseguirEtapa(opt.valor, opt.texto)}
                    className="bg-slate-900 border border-accent/40 text-accent hover:bg-accent hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    + Adicionar: {opt.texto}
                  </button>
                ))
              }
              <button
                onClick={() => prosseguirEtapa('prosseguir', 'Apenas esta')}
                className="bg-accent text-white hover:bg-accent/90 font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Confirmar (Somente 1)
              </button>
            </div>
          )}

          {/* Document Upload Interface */}
          {roteiro[etapaAtual]?.tipo === 'arquivo' && !aguardandoConfirmacaoFoto && !dadosSalvosExito && (
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-xs leading-relaxed">
                Tamanho máximo de imagem: 15MB. Aceitamos JPG, PNG ou PDF.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-coral to-accent text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg hover:-translate-y-0.5 select-none text-xs uppercase tracking-wider cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Anexar {obterConfigDocumento().nome}
              </button>
            </div>
          )}

          {/* Photo Confirmation Controls */}
          {aguardandoConfirmacaoFoto && !dadosSalvosExito && (
            <div className="flex flex-col gap-2">
              {documentoPendente && (
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white/90 text-xs flex items-center justify-between mb-1">
                  <span className="truncate max-w-[80%] font-mono">{documentoPendente.nome}</span>
                  <FileText className="w-4 h-4 text-accent" />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => prosseguirEtapa('confirmar_foto', 'Usar esta foto')}
                  className="bg-success text-white hover:bg-success/95 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-success/10 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Usar este arquivo
                </button>
                <button
                  onClick={() => prosseguirEtapa('trocar_foto', 'Trocar foto')}
                  className="bg-slate-900 border border-white/20 text-white/80 hover:bg-white/10 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <X className="w-4 h-4" /> Trocar
                </button>
              </div>
            </div>
          )}

          {/* Text Input Layout */}
          {roteiro[etapaAtual]?.tipo === 'texto' && !aguardandoConfirmacaoFoto && !aguardandoEscolhaCpf && !aguardandoObjetivo2 && !dadosSalvosExito && (
            <form onSubmit={handleTextSubmit} className="flex gap-3 items-center">
              <input
                type={roteiro[etapaAtual].chave === 'email' || roteiro[etapaAtual].chave === 'confirmacao_email' ? 'email' : 'text'}
                value={inputValue}
                onChange={handleInputChange}
                disabled={enderecoValido === false}
                placeholder={
                  roteiro[etapaAtual].chave === 'cpf' 
                    ? '000.000.000-00' 
                    : roteiro[etapaAtual].chave === 'telefone' || roteiro[etapaAtual].chave === 'telefone_alternativo'
                    ? '(27) 99999-9999'
                    : roteiro[etapaAtual].chave === 'cep'
                    ? '29000-000'
                    : roteiro[etapaAtual].chave === 'data_nascimento'
                    ? 'DD/MM/AAAA'
                    : 'Digite sua resposta...'
                }
                autoFocus
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-accent focus:bg-slate-900/60 focus:ring-4 focus:ring-accent/10 placeholder-white/30 transition-all font-sans disabled:opacity-50"
              />
              {roteiro[etapaAtual].chave === 'telefone_alternativo' && (
                <button
                  type="button"
                  onClick={() => prosseguirEtapa('', 'Pular')}
                  className="bg-slate-800 text-white border border-white/10 px-4 py-3 rounded-full hover:bg-slate-700 transition-all font-bold text-xs"
                >
                  Pular
                </button>
              )}
              <button
                type="submit"
                aria-label="Enviar resposta"
                disabled={enderecoValido === false}
                className="bg-gradient-to-r from-coral to-accent text-white p-3 rounded-full hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-accent/15 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </footer>
      </div>
 
      {/* VLibras Accessibility Integration */}
      <VLibrasWidget />
    </div>
  );
}

// Inline component to load and initialize VLibras widget for accessibility
function VLibrasWidget() {
  useEffect(() => {
    if (document.getElementById('vlibras-script')) return;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('vw', '');
    wrapper.className = 'enabled';
    wrapper.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.VLibras) {
        // @ts-ignore
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
      wrapper.remove();
    };
  }, []);

  return null;
}
