import DOMPurify from 'dompurify';
import { readCitizenSession, saveCitizenSession } from '../lib/citizenSession';
import MascotPicker from '../components/MascotPicker';
import { getMascot, useMascotPreference, saveMascotPreference } from '../lib/mascots';
import { useSmallScreen } from '../lib/useSmallScreen';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Check,
  X,
  Volume2,
  VolumeX,
  FileText,
  MapPin,
  Loader2,
  ExternalLink
} from 'lucide-react';
import CpfVerificationModal from '../components/CpfVerificationModal';

interface Question {
  pergunta: string;
  tipo: 'texto' | 'botoes';
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
  const smallScreen = useSmallScreen();
  const { id: cursoId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cursoNome, setCursoNome] = useState('o curso selecionado');
  const { preference } = useMascotPreference();
  const [courseMascot, setCourseMascot] = useState('vitoruga');
  const mascot = getMascot(preference === 'auto' ? courseMascot : preference);
  const [cursoLocal, setCursoLocal] = useState('');
  const [vagasVerificadas, setVagasVerificadas] = useState(false);
  const [cursoDisponivel, setCursoDisponivel] = useState(true);
  const [, setVagasInfo] = useState<{ inscritos: number; totais: number } | null>(null);
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
  const [profileOnly, setProfileOnly] = useState(false);
  const [fastEnrollment, setFastEnrollment] = useState(false);
  const [aguardandoEscolhaCpf, setAguardandoEscolhaCpf] = useState(false);
  const [dadosSalvosExito, setDadosSalvosExito] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');

  // Validation checks
  const [enderecoValido, setEnderecoValido] = useState<boolean | null>(null);
  const [dadosSalvos, setDadosSalvos] = useState<any>(null);
  const [limiteInscricoes, setLimiteInscricoes] = useState(4);
  const [inscricoesAtivas, setInscricoesAtivas] = useState(0);
  const [objetivo1, setObjetivo1] = useState<string | null>(null);
  const [aguardandoObjetivo2, setAguardandoObjetivo2] = useState(false);

  // Mandatory Legal & Privacy Agreements State
  const [aceitouTermosCompromisso, setAceitouTermosCompromisso] = useState(false);
  const [aceitouAvisoLgpd, setAceitouAvisoLgpd] = useState(false);
  const [autorizaUsoImagem, setAutorizaUsoImagem] = useState(false);
  const [mostrarAvisoLgpdCompleto, setMostrarAvisoLgpdCompleto] = useState(false);

  // Non-Vitória CEP prompt state
  const [aguardandoConfirmacaoCepForaVitoria, setAguardandoConfirmacaoCepForaVitoria] = useState(false);
  const [semVinculoVitoria, setSemVinculoVitoria] = useState(false);
  const [dadosCepForaVitoria, setDadosCepForaVitoria] = useState<{ localidade: string; uf: string; cep: string; logradouro: string; bairro: string } | null>(null);

  // Secure OTP Authentication State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [maskedIdentity, setMaskedIdentity] = useState<{ nome: string; email: string; telefone: string } | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const responseInFlight = useRef(false);

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
    trabalha_vitoria: '',
    escolaridade: '',
    cep: '',
    numero: '',
    rua: '',
    bairro: '',
    municipio: '',
    uf: 'ES',
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
      pergunta: `Olá! 🐢 Eu sou o Vitoruga, assistente virtual do Qualifica Vix. Que legal que você quer se inscrever para <strong>{CURSO_NOME}</strong>! <br/><br/>Para começar, digite seu <strong>CPF</strong> no campo abaixo, só os números.`,
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
        pergunta: 'Você possui alguma <strong>necessidade de acessibilidade</strong> para as aulas? Se sim, descreva (ou clique em Pular).',
        tipo: 'texto',
        chave: 'deficiencia_adaptacoes'
      });
      list.push({
        pergunta: 'Você possui alguma <strong>necessidade de acompanhante</strong> ou outra observação importante? Se sim, descreva (ou clique em Pular).',
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
        pergunta: 'Você autoriza a participação do menor nos cursos oferecidos pelo Qualifica Vix, conforme regulamento?',
        tipo: 'botoes',
        chave: 'responsavel_autorizacao',
        opcoes: [
          { texto: 'Sim, autorizo!', valor: 'sim' },
          { texto: 'Não autorizo', valor: 'nao' }
        ]
      });
    }

    list.push({
      pergunta: 'Você autoriza a divulgação do seu nome em listas públicas de classificados e suplentes do Qualifica Vix, conforme a LGPD? (Caso não autorize, seu nome aparecerá parcialmente oculto nas listas públicas).',
      tipo: 'botoes',
      chave: 'autoriza_lgpd',
      opcoes: [
        { texto: 'Sim, autorizo', valor: 'sim' },
        { texto: 'Não autorizo', valor: 'nao' }
      ]
    });

    // 16. Confirmação Final
    list.push({
      pergunta: 'Atenção: A apresentação dos documentos originais (CPF e RG) será exigida no momento da validação presencial da matrícula junto à instituição. <strong>Você confirma todos os dados informados para prosseguir com o aceite dos termos?</strong>',
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
        setCourseMascot(getMascot(dadosCurso.mascote_id, dadosCurso.categoria).id);
        setCursoNome(dadosCurso.nome);
        setCursoLocal(dadosCurso.local);

        const resVagas = await fetch(`/api/cursos-public/${cursoId}/vagas`);
        if (!resVagas.ok) throw new Error('Não foi possível consultar a disponibilidade.');
        const dadosVagas = await resVagas.json();

        setVagasInfo({
          inscritos: dadosVagas.inscritos,
          totais: dadosVagas.vagas_totais
        });
        // Permitir inscrição como suplente se o curso estiver esgotado ou ativo.
        // Bloquear apenas se estiver 'encerrado', 'oculto' ou 'rascunho'.
        const isClosed = dadosVagas.aceita_inscricoes === false || ['encerrado', 'oculto', 'rascunho'].includes(dadosVagas.status);
        setCursoDisponivel(!isClosed);
        setVagasVerificadas(true);

        // Fetch general configs for enrollment limit
        try {
          const resConf = await fetch('/api/configuracoes-public');
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
  }, [vagasVerificadas, cursoDisponivel, cursoNome]);

  // Autoscroll to bottom
  useEffect(() => {
    const messageList = chatEndRef.current?.parentElement;
    messageList?.scrollTo({ top: messageList.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, aguardandoObjetivo2]);

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

  // CEP Lookup ViaCEP com Fluxo Amigável para Munícipes Fora de Vitória
  const buscarCep = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, '');
    if (clean.length !== 8) return false;

    try {
      const res = await fetch(`/api/cep/${clean}`);
      if (!res.ok) throw new Error('Consulta de CEP indisponível');
      const data = await res.json();

      if (!data.erro) {
        const localidade = (data.localidade || '').trim();
        const uf = (data.uf || '').trim().toUpperCase();
        const ehVitoria = (localidade.toLowerCase() === 'vitória' || localidade.toLowerCase() === 'vitoria') && uf === 'ES';

        if (!ehVitoria) {
          setEnderecoValido(false);
          setSemVinculoVitoria(false);
          setRespostasUsuario(prev => ({ ...prev, mora_vitoria: 'nao', trabalha_vitoria: '' }));
          setDadosCepForaVitoria({
            localidade: localidade || 'Outro município',
            uf: uf || 'ES',
            cep: cepValue,
            logradouro: data.logradouro || '',
            bairro: data.bairro || ''
          });
          setAguardandoConfirmacaoCepForaVitoria(true);
          await addBotMessage(
            `🐢 Seu CEP fica em <strong>${localidade}/${uf}</strong>. Os cursos do Qualifica Vix são destinados a quem <strong>mora ou trabalha em Vitória</strong>.<br/><br/>Se digitou o CEP por engano, pode corrigi-lo abaixo. Se este é o seu endereço de residência, precisamos confirmar:<br/><br/><strong>Você trabalha em Vitória?</strong> A instituição validará esse vínculo antes de confirmar a matrícula.`,
            600
          );
          return false;
        }

        setEnderecoValido(true);
        setRespostasUsuario((prev) => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          municipio: localidade || 'Vitória',
          uf: uf || 'ES',
          mora_vitoria: 'sim',
          trabalha_vitoria: ''
        }));

        await addBotMessage(
          `Endereço localizado com sucesso: <strong>${data.logradouro || 'Rua cadastrada'}</strong>, Bairro <strong>${data.bairro || 'Bairro'}</strong> — ${localidade}/${uf}! ✅`,
          800
        );
        return true;
      } else {
        await addBotMessage(
          `⚠️ <strong>CEP não encontrado:</strong> O CEP <strong>${cepValue}</strong> não foi localizado no sistema postal. Por favor, verifique os números e digite novamente.`,
          600
        );
        return false;
      }
    } catch (e) {
      console.error('Erro na busca de CEP', e);
      await addBotMessage(
        `⚠️ <strong>Consulta de endereço temporariamente indisponível.</strong> Seus dados continuam nesta tela. Tente enviar o CEP novamente em alguns instantes.`,
        800
      );
      setEnderecoValido(null);
      return false;
    }
  };

  // Form Submission
  const enviarInscricaoAoBanco = async (dadosFinais: any) => {
    await addBotMessage('Processando sua pré-inscrição junto à Prefeitura... ⏳', 1500);

    const payloadEnviado = {
      ...dadosFinais,
      aceitou_termos_ciencia: aceitouTermosCompromisso,
      aceitou_aviso_lgpd: aceitouAvisoLgpd,
      autoriza_uso_imagem: autorizaUsoImagem ? 'sim' : 'nao',
      versao_termos: '2.0',
      mascote_preferido: preference,
      timestamp_aceite_lgpd: new Date().toISOString()
    };

    try {
      const res = await fetch(profileOnly ? '/api/cidadaos/me' : '/inscricao', {
        method: profileOnly ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}) },
        body: JSON.stringify(payloadEnviado),
      });

      const responseData = await res.json();

      if (res.ok && !responseData.error) {
        if (profileOnly) {
          setDadosSalvosExito(true);
          await addBotMessage('✅ Sua ficha foi atualizada. Os dados estarão disponíveis para suas próximas inscrições.', 600);
          return;
        }
        setProtocoloGerado(responseData.protocolo);
        if (responseData.sessionToken) {
          setSessionToken(responseData.sessionToken);
          saveCitizenSession(responseData.sessionToken, responseData.expiresAt);
        }
        setDadosSalvosExito(true);

        const statusLabel = responseData.status_inscricao === 'suplente' ? 'SUPLENTE (Lista de espera)' : 'TITULAR';
        await addBotMessage(
          `🎉 <strong>INSCRIÇÃO REALIZADA!</strong><br/><br/>Seu número de protocolo é: <strong>${responseData.protocolo}</strong>.<br/>Classificação: <strong>${statusLabel}</strong>.<br/><br/>Sua pré-inscrição está registrada. A matrícula será confirmada após a validação pela instituição.`,
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
        setEtapaAtual(roteiro.findIndex(q => q.chave === 'confirmacao_final'));
      }
    } catch (err) {
      console.error('Erro ao enviar inscrição:', err);
      await addBotMessage('❌ Falha na conexão com o servidor. Verifique sua conexão com a internet e tente novamente.', 1000);
      setEtapaAtual(roteiro.findIndex(q => q.chave === 'confirmacao_final'));
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
        'cep', 'numero', 'rua', 'bairro', 'municipio', 'data_nascimento', 'genero', 'raca_cor',
        'uf', 'responsavel_nome', 'responsavel_cpf', 'responsavel_parentesco',
        'responsavel_telefone', 'responsavel_email', 'responsavel_autorizacao'
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
    if (responseInFlight.current || isTyping) return;
    responseInFlight.current = true;
    try { await processarEtapa(valor, labelExibida); }
    finally { responseInFlight.current = false; }
  };

  const processarEtapa = async (valor: string, labelExibida?: string) => {
    if (isTyping) return;
    const qAtual = roteiro[etapaAtual];

    // 1. Handle CPF auto-fill prompt
    if (aguardandoEscolhaCpf) {
      const confirmou = valor === 'auto';
      addUserMessage(labelExibida || (confirmou ? 'Auto-preencher' : 'Quero mudar algo'));
      setAguardandoEscolhaCpf(false);

      if (confirmou) {
        aplicarDadosAutopreenchimento(dadosSalvos);
        await addBotMessage(
          'Perfeito! Reativei seus dados de cadastro para acelerar sua inscrição. ⚡',
          800
        );
        setFastEnrollment(true);
        const indexCep = roteiro.findIndex((x) => x.chave === 'cep');
        setEtapaAtual(indexCep);
        return;
      } else {
        aplicarDadosAutopreenchimento(dadosSalvos);
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

      // Query database securely via masked localization endpoint
      try {
        setIsTyping(true);
        const savedToken = readCitizenSession();
        if (savedToken) {
          const profileResponse = await fetch('/api/cidadaos/me', { headers: { Authorization: `Bearer ${savedToken}` }, signal: AbortSignal.timeout(15000) });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            if (String(profile.data?.cpf || '').replace(/\D/g, '') === valorNormalizado) {
              setSessionToken(savedToken);
              setDadosSalvos(profile.data);
              aplicarDadosAutopreenchimento(profile.data);
              setInscricoesAtivas((profile.historico || []).filter((h: any) => !['concluido', 'cancelado', 'evadido', 'desistente', 'desistencia', 'nao_compareceu', 'nao_concluido'].includes(h.situacao_final)).length);
              setAguardandoEscolhaCpf(true);
              setIsTyping(false);
              await addBotMessage('Seus dados já estão disponíveis nesta sessão. Confira as informações para continuar.', 600);
              return;
            }
          }
        }
        const response = await fetch('/api/cidadaos/localizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: valorNormalizado })
        });
        setIsTyping(false);

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.localizou && resJson.id_mascarado) {
            setMaskedIdentity(resJson.id_mascarado);
            setIsOtpModalOpen(true);
            return; // pauses chat flow until OTP verification or skip
          }
        }
      } catch (err) {
        console.error('Erro ao consultar CPF via API segura:', err);
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
          targetIndex = roteiro.findIndex(x => x.chave === 'autoriza_lgpd');
        }
        setEtapaAtual(targetIndex);
        return;
      }
    }

    if (qAtual.chave === 'deficiencia_recursos') {
      // Special needs details complete, check age branches
      const eMenor = verificarIdadeMenor(respostasUsuario.data_nascimento);
      if (!eMenor) {
        const indexLgpd = roteiro.findIndex(x => x.chave === 'autoriza_lgpd');
        setEtapaAtual(indexLgpd);
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

    if (qAtual.chave === 'numero' && fastEnrollment) {
      setEtapaAtual(roteiro.findIndex(q => q.chave === 'autoriza_lgpd'));
      return;
    }

    // Advance to next step
    const prox = etapaAtual + 1;
    setEtapaAtual(prox);
  };

  // Trigger bot reaction on step update
  useEffect(() => {
    if (etapaAtual > 0 && etapaAtual < roteiro.length) {
      const q = roteiro[etapaAtual];
      if (q.tipo === 'texto') {
        setInputValue(respostasUsuario[q.chave] || '');
      } else {
        setInputValue('');
      }

      const askQuestion = async () => {
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

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping) return;
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-primary px-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="font-display font-medium text-lg">Carregando dados da matrícula...</p>
      </div>
    );
  }

  // Course sold out/closed view
  if (!cursoDisponivel && vagasVerificadas) {
    return (
      <div className="min-h-screen bg-[linear-gradient(120deg,rgba(248,250,254,0.96),rgba(255,255,255,0.95),rgba(255,255,255,0.98)),url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=2000')] bg-center bg-cover bg-no-repeat flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-dark rounded-3xl p-8 border border-danger/20 text-center shadow-2xl animate-float">
          <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-danger">
            <X className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-primary mb-2">Inscrições Encerradas</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            As inscrições para o curso <strong>{cursoNome}</strong> estão encerradas ou temporariamente indisponíveis.
          </p>
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
    <div className="registration-page min-h-screen bg-[linear-gradient(120deg,rgba(248,250,254,0.96),rgba(255,255,255,0.95),rgba(255,255,255,0.98)),url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=2000')] bg-center bg-cover bg-no-repeat flex items-center justify-center p-4 md:p-8 select-none relative overflow-hidden">

      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-coral/10 blur-[120px] pointer-events-none" />

      <div className="registration-shell w-full max-w-lg h-[88vh] md:max-h-[820px] glass-dark rounded-3xl flex flex-col overflow-hidden shadow-[0_25px_50px_-12px_rgba(40,62,105,0.12)] border border-slate-200 relative z-10">

        {/* Chat Header */}
        <header className="bg-white/95 px-4 sm:px-6 py-3 sm:py-4 shrink-0 flex items-center justify-between gap-2 border-b border-slate-200 shadow-md">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              to="/"
              aria-label="Voltar para página inicial"
              className="text-slate-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="relative shrink-0">
              <img
                src={mascot.imagem}
                alt="Vitoruga"
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-accent p-[2px] bg-white object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/imagem/Vitoruga.png';
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-primary text-sm tracking-wide">Vitoruga</h1>
              <p className="text-[11px] text-success font-semibold flex items-center gap-1">
                Assistente virtual do Qualifica Vix
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
                : 'bg-primary/5 border-slate-200 text-slate-600 hover:text-primary'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </header>

        {/* Info Strip */}
        <div className="bg-primary/20 px-4 sm:px-6 py-2 shrink-0 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-600 text-xs">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="line-clamp-2 break-words">
              Turma: <strong className="text-primary">{cursoNome}</strong> no {cursoLocal || 'Senai'}
            </span>
          </div>
          <span className="text-[10px] bg-primary/5 border border-slate-200 px-2 py-0.5 rounded-full font-mono font-bold text-accent">
            Inscrições: {inscricoesAtivas}/{limiteInscricoes}
          </span>
        </div>

        {/* Message Board */}
        <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[94%] sm:max-w-[85%] break-words rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-lg transition-all animate-[popIn_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)] ${
                msg.sender === 'bot'
                  ? 'bg-blue-50 text-primary border border-slate-200 self-start rounded-tl-sm'
                  : 'bg-gradient-to-r from-coral to-accent text-white self-end rounded-tr-sm shadow-accent/10'
              }`}
            >
              {msg.isDocument ? (
                <div className="flex items-center gap-2 font-semibold">
                  <FileText className="w-5 h-5 flex-shrink-0 text-primary" />
                  <span className="truncate">{msg.docName}</span>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="bg-blue-50 text-primary border border-slate-200 self-start rounded-2xl rounded-tl-sm px-4 py-4 flex gap-1.5 items-center w-16">
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.16s]" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.32s]" />
            </div>
          )}

          {/* Success Banner context links */}
          {dadosSalvosExito && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 text-center">
              <h3 className="font-bold text-primary text-base mb-2">{profileOnly ? 'Ficha atualizada' : 'Comprovante de Pré-Inscrição'}</h3>
              <p className="text-slate-600 text-xs mb-4">{profileOnly ? 'Seus dados foram salvos para facilitar as próximas inscrições.' : <>Sua pré-inscrição foi recebida. A instituição entrará em contato para validar a matrícula. Protocolo: <strong>{protocoloGerado}</strong>.</>}</p>

              {/* SINE Link */}
              {(respostasUsuario.objetivo?.includes('conseguir emprego') || respostasUsuario.objetivo?.includes('mudar de área')) && (
                <div className="bg-accent/15 border border-accent/30 rounded-xl p-4 mb-4 text-left">
                  <h4 className="font-bold text-accent text-sm mb-1">Encaminhamento ao SINE Vitória</h4>
                  <p className="text-slate-600 text-xs mb-3">Encontramos vagas alinhadas com o seu curso de qualificação! Acesse o portal SINE Vitória para candidatar-se.</p>
                  <a href="https://trabalha.vitoria.es.gov.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-accent text-white font-bold text-xs px-3 py-2 rounded-lg hover:scale-102 transition-all">
                    Ver Vagas no SINE <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Sebrae Link */}
              {respostasUsuario.objetivo?.includes('empreender') && (
                <div className="bg-success/15 border border-success/30 rounded-xl p-4 mb-4 text-left">
                  <h4 className="font-bold text-success text-sm mb-1">Deseja Empreender? Parceria Sebrae-ES</h4>
                  <p className="text-slate-600 text-xs mb-3">Quer montar seu próprio negócio e formalizar como MEI? O Sebrae-ES oferece cursos e consultorias gratuitas.</p>
                  <a href="https://www.es.sebrae.com.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-success text-white font-bold text-xs px-3 py-2 rounded-lg hover:scale-102 transition-all">
                    Acessar Sebrae-ES <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 bg-primary/5 border border-slate-200 hover:border-accent/40 rounded-xl text-xs font-bold uppercase tracking-wider text-primary hover:bg-blue-50 transition-all cursor-pointer"
              >
                Voltar à página inicial
              </Link>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="shrink-0 max-h-[25%] overflow-y-auto overscroll-contain px-4"><MascotPicker /></div>
        {/* Form Controls / Inputs */}
        <footer data-lenis-prevent className="registration-controls shrink-0 overflow-y-auto overscroll-contain bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex flex-col gap-3">

          {/* CEP fora de Vitoria prompt buttons */}
          {aguardandoConfirmacaoCepForaVitoria && !dadosSalvosExito && (
            <div className="registration-options flex flex-wrap gap-2 justify-end">
              {!semVinculoVitoria && <button type="button" disabled={isTyping} className="bg-accent text-white rounded-xl py-2.5 px-4 text-xs font-bold disabled:opacity-50" onClick={() => {
                if (!dadosCepForaVitoria) return;
                setRespostasUsuario(prev => ({ ...prev, cep: dadosCepForaVitoria.cep, rua: dadosCepForaVitoria.logradouro, bairro: dadosCepForaVitoria.bairro, municipio: dadosCepForaVitoria.localidade, uf: dadosCepForaVitoria.uf, mora_vitoria: 'nao', trabalha_vitoria: 'sim' }));
                setEnderecoValido(true);
                setAguardandoConfirmacaoCepForaVitoria(false);
                addUserMessage('Sim, trabalho em Vitória');
                setEtapaAtual(roteiro.findIndex(q => q.chave === 'numero'));
              }}>Sim, trabalho em Vitória</button>}
              {!semVinculoVitoria && <button type="button" disabled={isTyping} className="border border-slate-200 text-primary rounded-xl py-2.5 px-4 text-xs font-bold disabled:opacity-50" onClick={async () => {
                setSemVinculoVitoria(true);
                setRespostasUsuario(prev => ({ ...prev, mora_vitoria: 'nao', trabalha_vitoria: 'nao' }));
                addUserMessage('Não trabalho em Vitória');
                await addBotMessage('🐢 Obrigada pelo seu interesse! Neste momento, os cursos do Qualifica Vix atendem pessoas que <strong>moram ou trabalham em Vitória</strong>. Como você não possui esse vínculo, não podemos continuar com a pré-inscrição.<br/><br/>Se o CEP foi digitado por engano, escolha <strong>Corrigir o CEP</strong>. Você pode continuar conhecendo os cursos pela página inicial.', 600);
              }}>Não trabalho em Vitória</button>}
              <button
                type="button"
                disabled={isTyping}
                onClick={async () => {
                  setAguardandoConfirmacaoCepForaVitoria(false);
                  setSemVinculoVitoria(false);
                  setDadosCepForaVitoria(null);
                  setEnderecoValido(null);
                  setInputValue('');
                  setRespostasUsuario((prev) => ({ ...prev, cep: '', rua: '', bairro: '', municipio: '', uf: '', mora_vitoria: '', trabalha_vitoria: '' }));
                  addUserMessage('Corrigir o CEP');
                  await addBotMessage('Tudo bem! Digite novamente o CEP do seu endereço de residência.', 600);
                }}
                className="bg-accent text-white hover:bg-accent/90 font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                Corrigir o CEP
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/');
                }}
                className="bg-white border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                Sair do Formulário
              </button>
            </div>
          )}

          {/* CARD OBRIGATÓRIO DE TERMOS E LGPD (Requisitos 7 e 8) */}
          {roteiro[etapaAtual]?.chave === 'confirmacao_final' && !dadosSalvosExito && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-2 flex flex-col gap-4 text-left shadow-xl">

              {/* TERMO DE CIÊNCIA E VALIDAÇÃO DE MATRÍCULA (Item 7) */}
              <div className="bg-primary/40 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-accent text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-accent" /> Termo de Ciência e Validação de Matrícula
                </h4>
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aceitouTermosCompromisso}
                    onChange={(e) => setAceitouTermosCompromisso(e.target.checked)}
                    className="w-4 h-4 rounded text-accent accent-accent mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-600 leading-relaxed">
                    “Confirmação da matricula no formulário somente após a instituição entrar em contato e validar as informações, não comparecendo a matricula perde a vaga pré reservada” <span className="text-accent font-bold">* (obrigatório)</span>
                  </span>
                </label>
              </div>

              {/* AVISO DE PRIVACIDADE E DUAL CONSENTIMENTO LGPD (Item 8) */}
              <div className="bg-primary/40 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Consentimentos e Privacidade (LGPD)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setMostrarAvisoLgpdCompleto(!mostrarAvisoLgpdCompleto)}
                    className="text-[11px] text-accent underline cursor-pointer font-semibold"
                  >
                    {mostrarAvisoLgpdCompleto ? 'Ocultar Detalhes' : 'Leia o aviso completo'}
                  </button>
                </div>

                <div className="text-slate-600 text-xs leading-relaxed">
                  {mostrarAvisoLgpdCompleto ? (
                    <div className="space-y-2">
                      <p>
                        A Prefeitura de Vitória informa que a coleta de seus dados pessoais é necessária para a inscrição e execução dos cursos públicos ofertados.
                      </p>
                      <p>Ao preencher este formulário, você declara estar ciente de que seus dados serão tratados para:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li><strong>Inscrição e Matrícula:</strong> efetivar sua participação no curso escolhido;</li>
                        <li><strong>Compartilhamento Legítimo:</strong> os dados poderão ser compartilhados com outras secretarias municipais e órgãos parceiros realizadores dos cursos (como SENAI e SEBRAE), estritamente para emissão de certificados, controle de frequência e gestão das turmas;</li>
                        <li><strong>Estatísticas Públicas:</strong> monitorar o perfil dos alunos e planejar novas políticas públicas (dados anonimizados).</li>
                      </ul>
                      <p>
                        Encarregado pelo tratamento de dados pessoais (DPO): <strong className="text-accent">dpo@vitoria.es.gov.br</strong>.
                      </p>
                    </div>
                  ) : (
                    <p>
                      Informações do Encarregado de Proteção de Dados (DPO): <strong className="text-accent">dpo@vitoria.es.gov.br</strong>.
                    </p>
                  )}
                </div>

                {/* Consentimento 1 - Obrigatório */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={aceitouAvisoLgpd}
                    onChange={(e) => setAceitouAvisoLgpd(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-400 accent-emerald-400 mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-600 leading-snug">
                    Aviso de Privacidade e tratamento de dados pessoais necessários para a gestão do curso <span className="text-accent font-bold">* (obrigatório para concluir o cadastro)</span>
                  </span>
                </label>

                {/* Consentimento 2 - Opcional / Facultativo */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    checked={autorizaUsoImagem}
                    onChange={(e) => setAutorizaUsoImagem(e.target.checked)}
                    className="w-4 h-4 rounded text-accent accent-accent mt-0.5"
                  />
                  <span className="text-xs font-semibold text-slate-600 leading-snug">
                    Autorização de uso de imagem e voz para divulgação institucional dos projetos da prefeitura <span className="text-emerald-400 font-bold">(opcional e facultativo - a recusa não impede a sua pré-inscrição)</span>
                  </span>
                </label>
              </div>

              {/* Botão de envio condicionado às duas checkboxes obrigatórias */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={!aceitouTermosCompromisso || !aceitouAvisoLgpd || isTyping}
                  onClick={() => prosseguirEtapa('sim', 'Sim, quero finalizar!')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {profileOnly ? 'Salvar atualização da ficha' : 'Finalizar Pré-Inscrição'}
                </button>
              </div>
            </div>
          )}

          {/* Options mode (Buttons) */}
          {roteiro[etapaAtual]?.tipo === 'botoes' && roteiro[etapaAtual]?.chave !== 'confirmacao_final' && !aguardandoEscolhaCpf && !isOtpModalOpen && !aguardandoConfirmacaoCepForaVitoria && !aguardandoObjetivo2 && !dadosSalvosExito && (
            <div className="registration-options flex flex-wrap gap-2 justify-end">
              {roteiro[etapaAtual].opcoes?.map((opt) => (
                <button
                  key={opt.valor}
                  disabled={isTyping}
                  onClick={() => prosseguirEtapa(opt.valor, opt.texto)}
                  className="bg-white border border-accent/40 text-accent hover:bg-accent hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  {opt.texto}
                </button>
              ))}
            </div>
          )}

          {aguardandoEscolhaCpf && sessionToken && <button type="button" className="text-accent text-xs underline" onClick={() => { setProfileOnly(true); setAguardandoEscolhaCpf(false); setEtapaAtual(roteiro.findIndex(q => q.chave === 'cep')); }}>Apenas atualizar minha ficha, sem inscrição neste curso</button>}
          {/* CPF Prompt (Auto fill options) */}
          {aguardandoEscolhaCpf && !dadosSalvosExito && (
            <div className="registration-options flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => prosseguirEtapa('auto', 'Auto-preencher')}
                className="bg-accent text-white hover:bg-accent/90 font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Auto-preencher
              </button>
              <button
                onClick={() => prosseguirEtapa('editar', 'Quero mudar algo')}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-primary/5 font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Revisar e atualizar dados
              </button>
            </div>
          )}

          {/* Double objective picker confirm buttons */}
          {aguardandoObjetivo2 && !dadosSalvosExito && (
            <div className="registration-options flex flex-wrap gap-2 justify-end">
              {roteiro.find(x => x.chave === 'objetivo')?.opcoes
                ?.filter(o => o.valor !== objetivo1)
                ?.map((opt) => (
                  <button
                    key={opt.valor}
                  disabled={isTyping}
                    onClick={() => prosseguirEtapa(opt.valor, opt.texto)}
                    className="bg-white border border-accent/40 text-accent hover:bg-accent hover:text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    + Adicionar: {opt.texto}
                  </button>
                ))
              }
              <button
                onClick={() => prosseguirEtapa('prosseguir', 'Apenas esta')}
                disabled={isTyping}
                className="bg-accent text-white hover:bg-accent/90 font-bold text-xs py-2.5 px-5 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                Confirmar (Somente 1)
              </button>
            </div>
          )}

          {/* Text Input Layout */}
          {roteiro[etapaAtual]?.tipo === 'texto' && !aguardandoEscolhaCpf && !isOtpModalOpen && !aguardandoConfirmacaoCepForaVitoria && !aguardandoObjetivo2 && !dadosSalvosExito && (
            <form onSubmit={handleTextSubmit} className="flex gap-3 items-center">
              <input
                type={roteiro[etapaAtual].chave === 'email' || roteiro[etapaAtual].chave === 'confirmacao_email' ? 'email' : 'text'}
                aria-label={roteiro[etapaAtual].chave === 'cep' ? 'CEP de residência' : roteiro[etapaAtual].chave === 'cpf' ? 'CPF' : 'Sua resposta'}
                inputMode={['cpf', 'cep', 'numero', 'data_nascimento'].includes(roteiro[etapaAtual].chave) ? 'numeric' : roteiro[etapaAtual].chave.startsWith('telefone') ? 'tel' : roteiro[etapaAtual].chave.includes('email') ? 'email' : 'text'}
                value={inputValue}
                onChange={handleInputChange}
                disabled={enderecoValido === false || isTyping}
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
                autoFocus={!smallScreen}
                className="flex-1 min-w-0 bg-primary/5 border border-slate-200 rounded-full py-3 px-4 sm:px-5 text-base sm:text-sm text-primary focus:outline-none focus:border-accent focus:bg-slate-50 focus:ring-4 focus:ring-accent/10 placeholder-slate-400 transition-all font-sans disabled:opacity-50"
              />
              {roteiro[etapaAtual].chave === 'telefone_alternativo' && (
                <button
                  type="button"
                  onClick={() => prosseguirEtapa('', 'Pular')}
                  disabled={isTyping}
                  className="bg-blue-50 text-primary border border-slate-200 px-4 py-3 rounded-full hover:bg-primary/10 transition-all font-bold text-xs"
                >
                  Pular
                </button>
              )}
              <button
                type="submit"
                aria-label="Enviar resposta"
                disabled={enderecoValido === false || isTyping}
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

      {/* Secure OTP Verification Modal */}
      {isOtpModalOpen && maskedIdentity && (
        <CpfVerificationModal
          cpf={respostasUsuario.cpf || ''}
          maskedIdentity={maskedIdentity}
          isOpen={isOtpModalOpen}
          onClose={() => { setIsOtpModalOpen(false); setEtapaAtual(1); }}
          onVerified={async (authenticatedProfile, token) => {
            setIsOtpModalOpen(false);
            setSessionToken(token);
            saveCitizenSession(token);
            if (authenticatedProfile.data?.mascote_preferido) saveMascotPreference(authenticatedProfile.data.mascote_preferido);

            if (authenticatedProfile && authenticatedProfile.data) {
              setDadosSalvos(authenticatedProfile.data);
              setInscricoesAtivas((authenticatedProfile.historico || []).filter((h: any) => !['concluido', 'cancelado', 'evadido'].includes(h.situacao_final)).length);
              aplicarDadosAutopreenchimento(authenticatedProfile.data);

              let histText = '';
              if (authenticatedProfile.historico && authenticatedProfile.historico.length > 0) {
                histText = '<strong>Seu Histórico de Inscrições:</strong><br/>';
                authenticatedProfile.historico.forEach((h: any) => {
                  const classifStatus = h.status_inscricao === 'suplente' ? 'Suplente' : 'Titular';
                  histText += `• <strong>${h.curso_nome}</strong> (${h.local_nome}) — ${classifStatus}<br/>`;
                });
              }

              await addBotMessage(
                `🔒 <strong>Identidade Autenticada com Sucesso!</strong><br/><br/>Seus dados cadastrais foram pré-preenchidos com segurança.<br/>${histText}<br/>Confira os dados e avance para concluir.`,
                800
              );

              setAguardandoEscolhaCpf(true);
            }
          }}
          onStartFromScratch={async () => {
            setIsOtpModalOpen(false);
            await addBotMessage('Tudo bem! Vamos preencher seu cadastro passo a passo do zero. ✏️', 600);
            const indexCep = roteiro.findIndex((x) => x.chave === 'cep');
            setEtapaAtual(indexCep !== -1 ? indexCep : 1);
          }}
        />
      )}
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

    // Keep one accessibility widget for the portal, including route changes.
    // Reinitializing the SDK leaves duplicate floating controls in the page.
  }, []);

  return null;
}
