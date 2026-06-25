import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Send, 
  Volume2, 
  VolumeX, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  extractedCourseId?: string | null;
  options?: { texto: string; valor: string }[];
}

interface QuizState {
  active: boolean;
  questionIndex: number;
  scores: Record<string, number>;
  answers: {
    nome?: string;
    whatsapp?: string;
    email?: string;
    regiao?: string;
  };
  step: 'intro' | 'questions' | 'result' | 'ask_register' | 'ask_nome' | 'ask_whatsapp' | 'ask_email' | 'ask_regiao' | 'finished';
}

const perguntasQuiz = [
  {
    pergunta: "1. Como você prefere atuar em suas atividades profissionais diárias?",
    respostas: [
      { texto: "A) Preparando alimentos e elaborando processos gastronômicos.", categoria: "gastronomia" },
      { texto: "B) Utilizando ferramentas para montagem, reparos e operação técnica.", categoria: "manutencao" },
      { texto: "C) Atuando com cuidados pessoais, saúde, estética ou beleza.", categoria: "beleza" },
      { texto: "D) Utilizando recursos tecnológicos para organização, dados e gestão.", categoria: "tecnologia" }
    ]
  },
  {
    pergunta: "2. Se você fosse iniciar um empreendimento autônomo hoje, qual seria o setor?",
    respostas: [
      { texto: "A) Comércio de alimentos, confeitaria ou serviços de buffet.", categoria: "gastronomia" },
      { texto: "B) Centro de estética, salão de beleza ou serviços voltados ao bem-estar.", categoria: "beleza" },
      { texto: "C) Empresa de prestação de serviços técnicos, reparos ou oficina.", categoria: "manutencao" },
      { texto: "D) Consultoria administrativa, serviços digitais ou suporte em TI.", categoria: "tecnologia" }
    ]
  },
  {
    pergunta: "3. Com qual conjunto de equipamentos você possui maior afinidade?",
    respostas: [
      { texto: "A) Equipamentos de cozinha industriais e utensílios culinários.", categoria: "gastronomia" },
      { texto: "B) Sistemas operacionais, planilhas e softwares de gestão.", categoria: "tecnologia" },
      { texto: "C) Instrumentos de estética, cosméticos e cuidados corporais/capilares.", categoria: "beleza" },
      { texto: "D) Equipamentos de elétrica, maquinário e ferramentas manuais.", categoria: "manutencao" }
    ]
  },
  {
    pergunta: "4. Em um ambiente de trabalho focado, você prefere desenvolver:",
    respostas: [
      { texto: "A) Atividades dinâmicas focadas na produção manual de consumo.", categoria: "gastronomia" },
      { texto: "B) Interação direta com o público com foco em atendimento e imagem.", categoria: "beleza" },
      { texto: "C) Concentração na análise técnica e resolução de problemas físicos.", categoria: "manutencao" },
      { texto: "D) Trabalho analítico, processos organizacionais e operação de sistemas.", categoria: "tecnologia" }
    ]
  },
  {
    pergunta: "5. Em uma situação de necessidade técnica de terceiros, qual demanda você atenderia melhor?",
    respostas: [
      { texto: "A) Solução de problemas em redes e formatação de computadores.", categoria: "tecnologia" },
      { texto: "B) Reparo em painéis elétricos ou diagnóstico de equipamentos defeituosos.", categoria: "manutencao" },
      { texto: "C) Auxílio na preparação visual e orientação de estética.", categoria: "beleza" },
      { texto: "D) Organização, planejamento e execução de cardápios para eventos.", categoria: "gastronomia" }
    ]
  },
  {
    pergunta: "6. Qual é o seu principal objetivo estratégico ao buscar qualificação profissional?",
    respostas: [
      { texto: "A) Produzir, inovar e comercializar produtos do setor alimentício.", categoria: "gastronomia" },
      { texto: "B) Ingressar no mercado corporativo ou consolidar-se no setor administrativo.", categoria: "tecnologia" },
      { texto: "C) Prestar serviços técnicos especializados, seja de forma autônoma ou industrial.", categoria: "manutencao" },
      { texto: "D) Desenvolver uma carteira de clientes no mercado de estética e cuidados pessoais.", categoria: "beleza" }
    ]
  },
  {
    pergunta: "7. Qual infraestrutura de aprendizado está mais alinhada às suas expectativas?",
    respostas: [
      { texto: "A) Laboratório de informática e infraestrutura voltada à gestão.", categoria: "tecnologia" },
      { texto: "B) Estrutura equipada com bancadas e instrumentos para procedimentos estéticos.", categoria: "beleza" },
      { texto: "C) Cozinha industrial equipada com fornos, fogões e maquinário de panificação.", categoria: "gastronomia" },
      { texto: "D) Oficina laboratorial contendo painéis de comandos elétricos e motores.", categoria: "manutencao" }
    ]
  }
];

const resultDetails: Record<string, { titulo: string; texto: string; link: string }> = {
  gastronomia: { 
    titulo: "Gastronomia e Alimentação", 
    texto: "Sua avaliação indica forte aderência às atividades de produção alimentícia. A área oferece excelentes perspectivas tanto para empreendedorismo quanto para atuação em cozinhas industriais e estabelecimentos comerciais.",
    link: "https://www.es.sebrae.com.br/"
  },
  beleza: { 
    titulo: "Estética e Cuidados Pessoais", 
    texto: "Sua análise demonstra grande capacidade analítica para cuidados interpessoais. Trata-se de um mercado em constante expansão, ideal para profissionais dedicados e com perfil autônomo ou de liderança em centros de estética.",
    link: "https://www.es.sebrae.com.br/"
  },
  manutencao: { 
    titulo: "Manutenção Técnica e Reparos", 
    texto: "O resultado aponta para um perfil altamente prático e resolutivo. O setor industrial e de serviços demanda de forma contínua profissionais qualificados em áreas como elétrica, refrigeração e mecânica.",
    link: "https://www.es.sebrae.com.br/"
  },
  tecnologia: { 
    titulo: "Tecnologia e Gestão Administrativa", 
    texto: "Identificamos uma forte compatibilidade com o ambiente corporativo e sistemas digitais. Áreas administrativas, análise de dados e suporte tecnológico são setores com altos índices de empregabilidade para o seu perfil.",
    link: "https://www.es.sebrae.com.br/"
  }
};

const mapaPerfis: Record<string, string[]> = {
  gastronomia: ['gastronomia', 'panificação / confeitaria', 'eventos', 'turismo / hotelaria'],
  beleza: ['beleza', 'estética', 'moda', 'confecção', 'artesanato'],
  manutencao: ['manutenção', 'mecânica', 'eletricista / energia', 'eletrônica', 'automação industrial', 'soldagem', 'construção civil / serviço', 'segurança do trabalho', 'meio ambiente'],
  tecnologia: ['informática / tecnologia', 'programação / ti', 'redes / telecom', 'administração', 'gestão', 'comércio / gestão empresarial', 'recursos humanos', 'logística', 'vendas / marketing']
};

export default function VitorugaChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mascotOutfit, setMascotOutfit] = useState('/imagem/vitorugaoficial.png');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Drag state for movable chatbot
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizState>({
    active: false,
    questionIndex: 0,
    scores: { gastronomia: 0, beleza: 0, manutencao: 0, tecnologia: 0 },
    answers: {},
    step: 'intro'
  });

  // Lookup / History State
  const [lookup, setLookup] = useState<{ active: boolean; step: 'ask_cpf' | 'finished' }>({
    active: false,
    step: 'ask_cpf'
  });

  // Suggestion State
  const [suggestion, setSuggestion] = useState<{
    active: boolean;
    step: 'ask_cpf' | 'ask_areas' | 'ask_texto' | 'finished';
    answers: {
      cpf?: string;
      areas?: string[];
      texto?: string;
    };
  }>({
    active: false,
    step: 'ask_cpf',
    answers: {}
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    }
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const newX = clientX - dragOffset.current.x;
      const newY = clientY - dragOffset.current.y;
      const maxX = window.innerWidth - 64;
      const maxY = window.innerHeight - 64;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  // Listen to Global Quiz Event
  useEffect(() => {
    const handleOpenQuiz = () => {
      setIsOpen(true);
      setShowTooltip(false);
      startQuizFlow();
    };
    window.addEventListener('abrir-chat-quiz', handleOpenQuiz);
    return () => window.removeEventListener('abrir-chat-quiz', handleOpenQuiz);
  }, []);

  // Initialize Speech Synthesis
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

  // Text-to-Speech reader
  const speakText = (text: string) => {
    if (!speechEnabled || !synthRef.current) return;
    synthRef.current.cancel();

    let cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/\*+/g, '')
      .replace(/https?:\/\/\S+/g, 'link');
      
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    const voices = synthRef.current.getVoices();
    const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    synthRef.current.speak(utterance);
  };

  // Autoscroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greet = async () => {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, 1000));
        setIsTyping(false);
        
        const welcomeText = "Olá! 🐢 Eu sou o **Vitoruga**, o assistente virtual da VIX Cursos. Estou aqui para tirar suas dúvidas!\n\nVocê também pode fazer o nosso **Quiz Vocacional** para descobrir o curso ideal para o seu perfil.\n\nPergunte-me sobre:\n• **'vagas'**\n• **'lista de cursos'**\n• **'como me inscrever'**";
        
        setMessages([
          {
            id: 'welcome',
            sender: 'bot',
            text: welcomeText,
            options: [
              { texto: "Fazer Quiz Vocacional 🎯", valor: "iniciar_quiz" },
              { texto: "Consultar Histórico 📂", valor: "consultar_historico" },
              { texto: "Sugerir Cursos Futuros 💡", valor: "sugerir_cursos" }
            ]
          }
        ]);
        speakText(welcomeText);
      };
      greet();
    }
  }, [isOpen]);

  const updateMascotOutfit = (text: string) => {
    const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (/\b(gastronomia|cozinha|culinaria|padaria|confeitei|confeita|doce|bolo|chefe|chef|alimento|comida)\b/.test(cleanText)) {
      setMascotOutfit('/imagem/Vitoruga_chef.png');
    } else if (/\b(tecnologia|informatica|excel|computador|ti|programac|rede|software|hardware|site|sistemas|dados)\b/.test(cleanText)) {
      setMascotOutfit('/imagem/Vitoruga_coder.png');
    } else if (/\b(solda|eletricista|mecanic|energia|civil|construc|obra|ferramenta|trabalho|soldador|pedreiro|industrial)\b/.test(cleanText)) {
      setMascotOutfit('/imagem/Vitoruga_worker.png');
    } else if (/\b(beleza|estetica|barbeiro|cabelo|manicure|moda|corte|costura|artesanato|maquiagem|unha|esteticista)\b/.test(cleanText)) {
      setMascotOutfit('/imagem/Vitoruga_beauty.png');
    } else {
      setMascotOutfit('/imagem/vitorugaoficial.png');
    }
  };

  const parseResponseLinks = (text: string) => {
    const matchId = text.match(/pre_inscricao\.html\?id=(\d+)/i) || text.match(/id\s*=\s*(\d+)/i) || text.match(/\/pre-inscricao\/(\d+)/i);
    return matchId ? matchId[1] : null;
  };

  // Conversational Quiz Handlers
  const startQuizFlow = () => {
    setQuiz({
      active: true,
      questionIndex: 0,
      scores: { gastronomia: 0, beleza: 0, manutencao: 0, tecnologia: 0 },
      answers: {},
      step: 'questions'
    });
    
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-quiz-start-${Date.now()}`,
        sender: 'bot',
        text: "🎯 **Iniciando o Quiz Vocacional do Vitoruga!**\n\nResponda as 7 perguntas abaixo e descobriremos sua área profissional ideal. Vamos lá!\n\n**" + perguntasQuiz[0].pergunta + "**",
        options: perguntasQuiz[0].respostas.map((r, i) => ({ texto: r.texto, valor: `ans-${i}-${r.categoria}` }))
      }
    ]);
    speakText("Iniciando o Quiz Vocacional do Vitoruga! Responda as perguntas abaixo.");
  };

  const handleQuizAnswer = async (valor: string, texto: string) => {
    const parts = valor.split('-');
    const categoria = parts[2];

    // Add user response to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: texto
      }
    ]);

    // Update scores
    const newScores = { ...quiz.scores, [categoria]: (quiz.scores[categoria] || 0) + 1 };
    const nextIdx = quiz.questionIndex + 1;

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTyping(false);

    if (nextIdx < perguntasQuiz.length) {
      setQuiz({
        ...quiz,
        questionIndex: nextIdx,
        scores: newScores,
        step: 'questions'
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `**${perguntasQuiz[nextIdx].pergunta}**`,
          options: perguntasQuiz[nextIdx].respostas.map((r, i) => ({ texto: r.texto, valor: `ans-${i}-${r.categoria}` }))
        }
      ]);
      speakText(perguntasQuiz[nextIdx].pergunta);
    } else {
      // Calculate Winner
      const winner = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
      const winnerDetails = resultDetails[winner];

      setQuiz({
        ...quiz,
        scores: newScores,
        step: 'ask_register'
      });

      const resultText = `🎉 **Quiz concluído!**\n\nSeu perfil profissional ideal é: **${winnerDetails.titulo}**!\n\n_${winnerDetails.texto}_\n\nGostaria de se cadastrar para receber avisos sobre novas vagas e turmas de ${winnerDetails.titulo}?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-result-${Date.now()}`,
          sender: 'bot',
          text: resultText,
          options: [
            { texto: "Sim, quero me cadastrar! 📝", valor: "cadastrar_sim" },
            { texto: "Não, obrigado. 🐢", valor: "cadastrar_nao" }
          ]
        }
      ]);
      speakText(resultText);
    }
  };

  const handleRegisterChoice = async (choice: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: choice === 'cadastrar_sim' ? "Sim, quero me cadastrar!" : "Não, obrigado."
      }
    ]);

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 650));
    setIsTyping(false);

    if (choice === 'cadastrar_sim') {
      setQuiz({ ...quiz, step: 'ask_nome' });
      const promptName = "Ótimo! Digite seu **Nome Completo** para começarmos o cadastro:";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: promptName
        }
      ]);
      speakText(promptName);
    } else {
      // Find matching courses to present anyway
      const winner = Object.keys(quiz.scores).reduce((a, b) => quiz.scores[a] > quiz.scores[b] ? a : b);
      await finishQuizFlow(winner);
    }
  };

  const submitQuizLead = async (answers: QuizState['answers'], winner: string) => {
    try {
      await fetch('/api/interessados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: answers.nome,
          whatsapp: answers.whatsapp,
          email: answers.email,
          regiao: answers.regiao,
          perfil: winner
        })
      });
    } catch (err) {
      console.warn("Erro ao salvar interessado do quiz:", err);
    }
  };

  const finishQuizFlow = async (winner: string) => {
    setIsTyping(true);
    
    // Fetch active courses to recommend
    let courseRecommendations = "";
    try {
      const res = await fetch('/api/cursos-public');
      if (res.ok) {
        const activeCourses = await res.json();
        const cats = mapaPerfis[winner] || [winner];
        const match = activeCourses.filter((c: any) => 
          cats.some((cat: string) => c.categoria.toLowerCase().includes(cat) || c.nome.toLowerCase().includes(cat))
        );

        if (match.length > 0) {
          courseRecommendations = `\n\n📚 **Cursos abertos recomendados para seu perfil:**\n` + 
            match.slice(0, 3).map((c: any) => `• **${c.nome}** (${c.local}) — [Fazer Inscrição](/pre-inscricao/${c.id})`).join('\n');
        } else {
          courseRecommendations = `\n\nNo momento não temos turmas com inscrições abertas especificamente para o seu perfil. Mas fique tranquilo(a), avisaremos você assim que abrirem!`;
        }
      }
    } catch (err) {
      console.warn("Erro ao buscar recomendações do quiz:", err);
    }

    await new Promise((r) => setTimeout(r, 800));
    setIsTyping(false);

    const endText = `Perfeito! Perfil de **${resultDetails[winner].titulo}** registrado com sucesso. 🚀${courseRecommendations}\n\n🐢 Se quiser empreender, confira o portal do [Sebrae-ES](${resultDetails[winner].link}) para obter dicas gratuitas!`;

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-finished-${Date.now()}`,
        sender: 'bot',
        text: endText
      }
    ]);
    speakText("Cadastro concluído com sucesso! Veja as recomendações no chat.");

    setQuiz({
      active: false,
      questionIndex: 0,
      scores: { gastronomia: 0, beleza: 0, manutencao: 0, tecnologia: 0 },
      answers: {},
      step: 'finished'
    });
  };

  const handleLookupTextSubmit = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text
      }
    ]);
    setInputValue('');
    setIsTyping(true);

    const cpfLimpo = text.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      await new Promise((r) => setTimeout(r, 500));
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-lookup-err-${Date.now()}`,
          sender: 'bot',
          text: "CPF inválido. Por favor, digite o CPF completo com 11 dígitos:"
        }
      ]);
      speakText("CPF inválido. Por favor, digite o CPF completo.");
      return;
    }

    try {
      const res = await fetch(`/api/pre-inscricoes/por-cpf/${cpfLimpo}`);
      setIsTyping(false);
      if (res.status === 404) {
        const reply = "Não encontrei nenhuma inscrição vinculada a este CPF. 🐢";
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-lookup-res-${Date.now()}`,
            sender: 'bot',
            text: reply,
            options: [
              { texto: "Fazer Quiz Vocacional 🎯", valor: "iniciar_quiz" },
              { texto: "Consultar Histórico 📂", valor: "consultar_historico" },
              { texto: "Sugerir Cursos Futuros 💡", valor: "sugerir_cursos" }
            ]
          }
        ]);
        speakText(reply);
        setLookup({ active: false, step: 'finished' });
        return;
      }

      const data = await res.json();
      
      let reply = `Encontrei seu cadastro! Olá, **${data.data.nome}**.\n\nAqui está o histórico das suas inscrições:\n\n`;
      if (data.historico && data.historico.length > 0) {
        data.historico.forEach((h: any) => {
          const classif = String(h.status_inscricao).toLowerCase() === 'suplente' ? 'Suplente' : 'Titular';
          const matriculado = Number(h.matricula_confirmada) === 1 ? 'Matriculado' : 'Pendente';
          reply += `• **${h.curso_nome}** (${h.local_nome})\n  - Classificação: **${classif}**\n  - Matrícula: **${matriculado}**\n`;
          if (h.situacao_final === 'concluido') {
            reply += `  - 🎓 **Concluído** — [Baixar Certificado](/certificado/${h.id})\n`;
          } else if (h.situacao_final) {
            reply += `  - Situação: **${h.situacao_final}**\n`;
          }
          reply += `\n`;
        });
      } else {
        reply += "Nenhuma turma cadastrada no histórico.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-lookup-res-${Date.now()}`,
          sender: 'bot',
          text: reply,
          options: [
            { texto: "Fazer Quiz Vocacional 🎯", valor: "iniciar_quiz" },
            { texto: "Sugerir Cursos Futuros 💡", valor: "sugerir_cursos" }
          ]
        }
      ]);
      speakText("Histórico localizado com sucesso.");
      setLookup({ active: false, step: 'finished' });
    } catch (err) {
      setIsTyping(false);
      const reply = "Ops! Ocorreu um erro ao consultar o histórico no servidor.";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-lookup-res-${Date.now()}`,
          sender: 'bot',
          text: reply
        }
      ]);
      setLookup({ active: false, step: 'finished' });
    }
  };

  const handleSuggestionAreaChoice = async (area: string, texto: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: texto
      }
    ]);

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTyping(false);

    setSuggestion(prev => ({
      ...prev,
      step: 'ask_texto',
      answers: { ...prev.answers, areas: [area] }
    }));

    const textPrompt = `Entendido, ${area}! Agora, digite um texto descrevendo qual curso específico você gostaria que fosse oferecido (ou 'nenhum' se preferir):`;
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-sug-text-${Date.now()}`,
        sender: 'bot',
        text: textPrompt
      }
    ]);
    speakText(textPrompt);
  };

  const handleSuggestionTextSubmit = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text
      }
    ]);
    setInputValue('');
    setIsTyping(true);

    if (suggestion.step === 'ask_cpf') {
      const cpfLimpo = text.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        await new Promise((r) => setTimeout(r, 500));
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-sug-err-${Date.now()}`,
            sender: 'bot',
            text: "CPF inválido. Por favor, digite o CPF completo com 11 dígitos:"
          }
        ]);
        speakText("CPF inválido. Por favor, digite o CPF completo.");
        return;
      }

      setIsTyping(false);
      setSuggestion(prev => ({
        ...prev,
        step: 'ask_areas',
        answers: { ...prev.answers, cpf: cpfLimpo }
      }));

      const nextPrompt = "Ótimo. Selecione a **Área de Interesse** do curso sugerido:";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-sug-areas-${Date.now()}`,
          sender: 'bot',
          text: nextPrompt,
          options: [
            { texto: "Beleza 💅", valor: "sugarea-Beleza" },
            { texto: "Confecção 🧵", valor: "sugarea-Confecção" },
            { texto: "Gastronomia 🍳", valor: "sugarea-Gastronomia" },
            { texto: "Humanas 📚", valor: "sugarea-Humanas" },
            { texto: "Veículos 🚗", valor: "sugarea-Veículos" },
            { texto: "Outra 💡", valor: "sugarea-Outra" }
          ]
        }
      ]);
      speakText(nextPrompt);
    } else if (suggestion.step === 'ask_texto') {
      const updatedAnswers = { ...suggestion.answers, texto: text };
      
      try {
        await fetch('/api/pre-inscricoes/sugestoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpf: updatedAnswers.cpf,
            areas_interesse: updatedAnswers.areas,
            sugestao_texto: updatedAnswers.texto
          })
        });

        setIsTyping(false);
        const reply = "Obrigado! Sua sugestão de curso foi recebida com sucesso e enviada ao setor de planejamento do VixCursos. 🐢💡";
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-sug-done-${Date.now()}`,
            sender: 'bot',
            text: reply,
            options: [
              { texto: "Fazer Quiz Vocacional 🎯", valor: "iniciar_quiz" },
              { texto: "Consultar Histórico 📂", valor: "consultar_historico" }
            ]
          }
        ]);
        speakText(reply);
      } catch (err) {
        setIsTyping(false);
        const reply = "Ops! Tive um probleminha para salvar sua sugestão. Pode tentar de novo mais tarde?";
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-sug-err-${Date.now()}`,
            sender: 'bot',
            text: reply
          }
        ]);
      }

      setSuggestion({
        active: false,
        step: 'finished',
        answers: {}
      });
    }
  };

  const handleRegisterTextSubmit = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text
      }
    ]);
    setInputValue('');

    setIsTyping(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsTyping(false);

    const currentStep = quiz.step;
    const winner = Object.keys(quiz.scores).reduce((a, b) => quiz.scores[a] > quiz.scores[b] ? a : b);

    if (currentStep === 'ask_nome') {
      const updatedAnswers = { ...quiz.answers, nome: text };
      setQuiz({
        ...quiz,
        answers: updatedAnswers,
        step: 'ask_whatsapp'
      });
      const promptWhats = `Prazer, ${text.split(' ')[0]}! Agora informe seu número de **WhatsApp** (com DDD):`;
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: promptWhats
        }
      ]);
      speakText(promptWhats);
    } else if (currentStep === 'ask_whatsapp') {
      const updatedAnswers = { ...quiz.answers, whatsapp: text };
      setQuiz({
        ...quiz,
        answers: updatedAnswers,
        step: 'ask_email'
      });
      const promptEmail = "Perfeito. Qual o seu **E-mail** principal?";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: promptEmail
        }
      ]);
      speakText(promptEmail);
    } else if (currentStep === 'ask_email') {
      const updatedAnswers = { ...quiz.answers, email: text };
      setQuiz({
        ...quiz,
        answers: updatedAnswers,
        step: 'ask_regiao'
      });
      const promptRegion = "Para finalizarmos, selecione ou digite a sua **Região / Bairro** de residência em Vitória:";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: promptRegion,
          options: [
            { texto: "Bento Ferreira", valor: "reg-Bento Ferreira" },
            { texto: "Centro", valor: "reg-Centro" },
            { texto: "Jardim Camburi", valor: "reg-Jardim Camburi" },
            { texto: "Jardim da Penha", valor: "reg-Jardim da Penha" },
            { texto: "Maruípe", valor: "reg-Maruípe" },
            { texto: "São Pedro", valor: "reg-São Pedro" }
          ]
        }
      ]);
      speakText(promptRegion);
    } else if (currentStep === 'ask_regiao') {
      const regValue = text.startsWith('reg-') ? text.slice(4) : text;
      const updatedAnswers = { ...quiz.answers, regiao: regValue };
      
      setQuiz({
        ...quiz,
        answers: updatedAnswers,
        step: 'finished'
      });

      // Submit lead to backend
      await submitQuizLead(updatedAnswers, winner);
      await finishQuizFlow(winner);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    if (quiz.active) {
      handleRegisterTextSubmit(text);
      return;
    }

    if (lookup.active) {
      handleLookupTextSubmit(text);
      return;
    }

    if (suggestion.active) {
      handleSuggestionTextSubmit(text);
      return;
    }

    // Standard Chatbot flow
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text,
      }
    ]);
    setInputValue('');
    updateMascotOutfit(text);
    setIsTyping(true);

    try {
      // Check for help/FAQ requests
      const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Conversational responses for Módulo 6.1 (FAQ Flows)
      let customReply = "";
      if (cleanText.includes("como fazer inscricao") || cleanText.includes("como me inscrever") || cleanText.includes("quero me inscrever")) {
        customReply = "Para fazer sua inscrição, basta navegar pelas turmas do catálogo principal na nossa página inicial e clicar em **Pré-inscrição**. O Vitoruga te guiará no chat de inscrição! 🐢";
      } else if (cleanText.includes("status da inscricao") || cleanText.includes("status")) {
        customReply = "Você pode consultar o status da sua inscrição digitando o seu **CPF** no início do fluxo de inscrição do curso desejado. O sistema recuperará o seu histórico completo de titular, suplente ou concluído! 📂";
      } else if (cleanText.includes("documento") || cleanText.includes("documentos para matricula")) {
        customReply = "Os documentos necessários para confirmação da matrícula presencial são:\n• **CPF** e **RG** (original e cópia)\n• **Comprovante de residência** em Vitória\n• Menores de 18 anos devem levar os documentos do responsável legal.";
      } else if (cleanText.includes("localizacao") || cleanText.includes("onde e o curso") || cleanText.includes("polo")) {
        customReply = "Os cursos são ministrados em diversos polos parceiros da PMV, incluindo o **Senac Bento Ferreira**, o **Senai** na Av. Mascarenhas de Moraes, e carretas móveis. A localização exata está destacada no catálogo e na confirmação da sua pré-inscrição!";
      } else if (cleanText.includes("certificado") || cleanText.includes("emissao de certificado")) {
        customReply = "Para emitir o seu certificado do VixCursos, você deve comparecer à área do aluno no site, informar seu CPF, responder o questionário rápido pós-curso (Módulo 5) e fazer o download do PDF. Prático e rápido! 🎓";
      } else if (cleanText.includes("deficiencia") || cleanText.includes("adaptacao") || cleanText.includes("pcd")) {
        customReply = "Candidatos com deficiência têm reserva de vaga garantida e prioritária no VixCursos! Durante a pré-inscrição, declare a sua necessidade especial para que a gestão providencie os recursos e adaptações assistivas necessárias.";
      } else if (cleanText.includes("contato") || cleanText.includes("semcid") || cleanText.includes("falar com atendente") || cleanText.includes("humano")) {
        customReply = "Você pode entrar em contato com a equipe de suporte da Semcid pelo e-mail **crassenaitcc@gmail.com** ou pelo telefone de atendimento municipal 156. Se desejar, posso encaminhar sua mensagem para um atendente humano! 📞";
      }

      if (customReply) {
        await new Promise((r) => setTimeout(r, 600));
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: customReply,
          }
        ]);
        speakText(customReply);
        return;
      }

      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      await new Promise((r) => setTimeout(r, 700));
      setIsTyping(false);

      const botReply = data.reply || "Desculpe, tive um probleminha para me comunicar com a central. 😅";
      updateMascotOutfit(botReply);

      const extractedCourseId = parseResponseLinks(botReply);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          extractedCourseId,
        }
      ]);
      speakText(botReply);
    } catch (err) {
      console.error('Erro no chatbot:', err);
      setIsTyping(false);
      const errReply = "Ops! Estou com dificuldade em conectar com meu servidor de Vitória. Pode tentar de novo? 🐢";
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: errReply,
        }
      ]);
      speakText(errReply);
    }
  };

  const handleOptionClick = (valor: string, texto: string) => {
    if (valor === 'iniciar_quiz') {
      startQuizFlow();
    } else if (valor.startsWith('ans-')) {
      handleQuizAnswer(valor, texto);
    } else if (valor.startsWith('cadastrar_')) {
      handleRegisterChoice(valor);
    } else if (valor.startsWith('reg-')) {
      handleRegisterTextSubmit(valor);
    } else if (valor === 'consultar_historico') {
      setLookup({ active: true, step: 'ask_cpf' });
      setQuiz(q => ({ ...q, active: false }));
      setSuggestion(s => ({ ...s, active: false }));
      setMessages(prev => [
        ...prev,
        {
          id: `bot-lookup-${Date.now()}`,
          sender: 'bot',
          text: "📂 **Consulta de Histórico e Certificados**\n\nPor favor, digite seu **CPF** (apenas números ou formatado) para buscarmos seu cadastro e certificados no VixCursos:"
        }
      ]);
    } else if (valor === 'sugerir_cursos') {
      setSuggestion({ active: true, step: 'ask_cpf', answers: {} });
      setQuiz(q => ({ ...q, active: false }));
      setLookup(l => ({ ...l, active: false }));
      setMessages(prev => [
        ...prev,
        {
          id: `bot-sug-${Date.now()}`,
          sender: 'bot',
          text: "💡 **Pesquisa de Interesse em Cursos Futuros**\n\nQueremos saber o que você gostaria de ver por aqui! Primeiro, digite seu **CPF** para vincularmos ao seu perfil:"
        }
      ]);
    } else if (valor.startsWith('sugarea-')) {
      handleSuggestionAreaChoice(valor.slice(8), texto);
    }
  };

  const formatMessageText = (text: string) => {
    // Replace markdown link: [text](url) -> anchor tag
    let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-accent font-bold" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Replace **bold** with strong
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace *bullet* with custom bullet points
    formatted = formatted.replace(/•\s(.*)/g, '• $1');
    
    // Convert new lines to breaks
    return formatted.split('\n').map((line, i) => (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {i < formatted.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const activeOptions = messages[messages.length - 1]?.options;

  return (
    <>
      {/* Mascot Trigger Button - Draggable */}
      <div
        ref={buttonRef}
        className="fixed z-[999] flex flex-col items-start select-none"
        style={position
          ? { left: position.x, top: position.y }
          : { bottom: '5rem', right: '1.5rem' }
        }
      >
        {/* Hover/Intro Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-black/35 backdrop-blur-md border border-white/10 text-white rounded-2xl py-2.5 px-4 shadow-2xl mb-3 ml-2 max-w-[200px] text-xs font-semibold relative text-left"
            >
              <span>Dúvidas sobre as vagas? Fale comigo! 🐢</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="absolute -top-1.5 -right-1.5 bg-slate-800 border border-white/10 rounded-full p-0.5 text-white/60 hover:text-white"
                aria-label="Fechar dica"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Arrow adjusted to left side */}
              <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-black/35 border-r border-b border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Draggable Handle + Bouncing Mascot Button */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
          className="relative"
          title="Arraste para reposicionar"
        >
          {/* Drag indicator */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-[3px] pointer-events-none">
            <span className="w-0.5 h-3 rounded-full bg-white/25" />
            <span className="w-0.5 h-3 rounded-full bg-white/25" />
            <span className="w-0.5 h-3 rounded-full bg-white/25" />
          </div>
          <motion.button
            onClick={() => {
              if (!isDragging) {
                setIsOpen(!isOpen);
                setShowTooltip(false);
              }
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] border transition-all ${
              isOpen 
                ? 'bg-slate-950 border-white/10' 
                : 'bg-gradient-to-r from-coral to-accent border-accent/25 glow-accent'
            }`}
            aria-label={isOpen ? "Fechar chatbot" : "Abrir chatbot do Vitoruga"}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="w-full h-full p-[2px] flex items-center justify-center relative">
                <img
                  src={mascotOutfit}
                  alt="Vitoruga Mascot"
                  className="w-[90%] h-[90%] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/imagem/vitorugaoficial.png';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-slate-900" />
              </div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Chat Box Drawer - Positioned relative to button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed w-96 max-w-[calc(100vw-2rem)] h-[540px] rounded-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col z-[999] overflow-hidden"
            style={position
              ? {
                  left: Math.min(position.x, window.innerWidth - 400),
                  top: position.y > window.innerHeight / 2
                    ? Math.max(0, position.y - 550)
                    : position.y + 72,
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(12px)',
                }
              : {
                  bottom: '9rem',
                  right: '1.5rem',
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(12px)',
                }
            }
          >
            {/* Header */}
            <header className="px-4 py-3 flex items-center justify-between border-b border-white/5 shadow-sm bg-transparent">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={mascotOutfit}
                    alt="Vitoruga"
                    className="w-10 h-10 rounded-full border border-accent/40 p-[1px] bg-slate-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/imagem/vitorugaoficial.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border border-slate-900" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-white text-xs tracking-wider">Vitoruga</h2>
                  <p className="text-[10px] text-success font-semibold">Online</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice toggle */}
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  title={speechEnabled ? 'Mutar Vitoruga' : 'Ativar voz'}
                  className={`p-2 rounded-full border transition-all ${
                    speechEnabled 
                      ? 'bg-accent/20 border-accent text-accent' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}
                >
                  {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col gap-1.5">
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                      msg.sender === 'bot'
                        ? 'bg-slate-800/90 text-white border border-white/5 self-start rounded-tl-sm'
                        : 'bg-gradient-to-r from-coral to-accent text-white self-end rounded-tr-sm shadow-accent/5'
                    }`}
                  >
                    {formatMessageText(msg.text)}
                  </div>
                  
                  {/* Inscription redirect button */}
                  {msg.sender === 'bot' && msg.extractedCourseId && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="self-start pl-2 mt-0.5"
                    >
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/pre-inscricao/${msg.extractedCourseId}`);
                        }}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent/95 text-white font-bold text-[10px] tracking-wider uppercase py-2 px-3 rounded-lg shadow-md cursor-pointer transition-all hover:scale-102"
                      >
                        <BookOpen className="w-3 h-3" /> Fazer Pré-Inscrição Agora
                      </button>
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Bot thinking bubble */}
              {isTyping && (
                <div className="bg-slate-800/90 text-white border border-white/5 self-start rounded-2xl rounded-tl-sm px-4 py-3.5 flex gap-1 items-center w-14">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.16s]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both_-0.32s]" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Interactive Options Buttons */}
            {activeOptions && activeOptions.length > 0 && (
              <div className="px-3 py-2 bg-transparent border-t border-white/5 flex flex-wrap gap-1.5 justify-start max-h-48 overflow-y-auto">
                {activeOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOptionClick(opt.valor, opt.texto)}
                    className="bg-slate-800 hover:bg-accent border border-white/10 text-white hover:text-white text-[10px] font-bold py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1 max-w-full text-left"
                  >
                    {opt.texto} <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSendMessage} className="bg-transparent border-t border-white/5 p-3 flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  quiz.active 
                    ? (quiz.step === 'ask_regiao' ? "Selecione o bairro acima..." : "Digite sua resposta...") 
                    : suggestion.active
                      ? (suggestion.step === 'ask_areas' ? "Selecione a área acima..." : "Digite sua sugestão...")
                      : lookup.active
                        ? "Digite seu CPF..."
                        : "Pergunte sobre vagas ou cursos..."
                }
                disabled={
                  (quiz.active && ['questions', 'ask_register', 'ask_regiao'].includes(quiz.step)) ||
                  (suggestion.active && suggestion.step === 'ask_areas')
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-full py-2.5 px-4 text-xs text-white focus:outline-none focus:border-accent focus:bg-slate-900/60 placeholder-white/30 transition-all font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={
                  (quiz.active && ['questions', 'ask_register', 'ask_regiao'].includes(quiz.step)) ||
                  (suggestion.active && suggestion.step === 'ask_areas')
                }
                aria-label="Enviar mensagem"
                className="bg-gradient-to-r from-coral to-accent text-white p-2.5 rounded-full hover:scale-105 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-accent/15 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
