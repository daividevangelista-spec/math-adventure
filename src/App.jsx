import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Privacy from "./Privacy";
import * as React from 'react';
import useMusicPlayer from './hooks/useMusicPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Settings as SettingsIcon, BarChart2, Play, 
  User, Award, Menu as MenuIcon, X, Plus, LogOut, 
  ChevronRight, Star, Target, Crown, Users, Globe, Download, ArrowLeft, GraduationCap,
  Trash2, Edit3, UserMinus, TrendingUp, Zap, HelpCircle, Copy,
  Search, Eye, EyeOff, Clock, Layout, Activity, Volume2, VolumeX
} from 'lucide-react';
import { useGameState } from './hooks/useGameState';
import LoginScreen from './components/LoginScreen';
import GameRoom from './components/GameRoom';
import { Mascot } from './components/Mascot';
import { rankingAPI, authAPI, supabase } from './lib/supabase';
import { GameTransition } from './components/GameTransition';
import ParticleBackground from './components/ParticleBackground';

import { playSound } from './utils/audioManager';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, ChartTooltip, Legend
);

// --- GLOBAL SERVICES ---
const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-blob" />
    <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
    <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[150px] animate-blob animation-delay-4000" />
  </div>
);

const AppLogo = ({ onClick, className = "" }) => (
  <div onClick={onClick} className={`cursor-pointer group flex items-center gap-2 ${className}`}>
     <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-slate-900 shadow-neon group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
        <Play size={20} fill="currentColor" />
     </div>
     <div className="flex flex-col leading-none">
       <span className="game-title text-lg tracking-tighter">MATH ADVENTURE<span className="text-primary text-neon">+</span></span>
       <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-primary transition-all">Premium AAA Experience</span>
     </div>
  </div>
);


const NotificationService = {
  notify: (title, message, type = 'success') => {
    // Para um SaaS profissional, poderíamos usar react-hot-toast ou similar.
    // Como estamos no App.jsx puro, usaremos um alert estilizado ou o nativo por enquanto, 
    // mas centralizado para facilitar o upgrade.
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    alert(`${title}\n${message}`);
  }
};

// --- UI COMPONENTS ---

const Tooltip = ({ text, children, delay = 0.5, exitDelay = 0.2 }) => {
  const [show, setShow] = React.useState(false);
  const timerRef = React.useRef(null);

  const handleEnter = () => {
    if(timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShow(true), delay * 1000);
  };

  const handleLeave = () => {
    if(timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  return (
    <div className="relative group/tooltip" onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter} onTouchEnd={handleLeave}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: exitDelay } }}
            className="absolute z-[100] bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-primary/30 p-3 rounded-xl shadow-2xl min-w-[140px] text-center">
              <p className="text-[10px] font-black italic uppercase text-primary tracking-widest">{text}</p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-primary/30 rotate-45 -translate-y-1.5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LevelUpCelebration = ({ level, onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.5, y: 50, rotate: -5 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
        className="glass-card-neon p-12 max-w-sm w-full text-center space-y-8 border-accent/40 shadow-neon-accent"
      >
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="text-8xl drop-shadow-[0_0_20px_rgba(157,80,187,0.5)]"
        >
          🏆
        </motion.div>
        <div>
          <h2 className="game-title text-5xl">Level Up!</h2>
          <p className="text-accent-light font-black text-2xl italic uppercase tracking-tighter mt-2">Você atingiu o Nível {level}</p>
        </div>
        <div className="py-2">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Sua jornada matemática está apenas começando! Continue explorando novas operações e desbloqueie conquistas épicas.</p>
        </div>
        <button 
          onClick={onComplete}
          className="btn-premium btn-accent w-full text-xl shadow-neon-accent"
        >
          Continuar Jornada →
        </button>
      </motion.div>
    </motion.div>
  );
};

const PREMIUM_AVATARS = [
  { id: 'avatar1', url: '/avatars/avatar1.png', minLevel: 0 },
  { id: 'avatar2', url: '/avatars/avatar2.png', minLevel: 5 },
  { id: 'avatar3', url: '/avatars/avatar3.png', minLevel: 10 },
  { id: 'avatar4', url: '/avatars/avatar4.png', minLevel: 15 },
  { id: 'avatar5', url: '/avatars/avatar5.png', minLevel: 25 },
];

const getGamingTitle = (level) => {
  if (level >= 100) return "Lenda da Matemática";
  if (level >= 50) return "Elite do Cálculo";
  if (level >= 30) return "Mestre Matemático";
  if (level >= 20) return "Estudioso";
  if (level >= 10) return "Aprendiz";
  return "Novato";
};



function Header({ title, streak = 0, onBack }) {
  return (
    <div className="flex justify-between items-center mb-8 px-2 relative z-10">
      <div className="flex items-center gap-4">
        {onBack && (
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }} 
            whileTap={{ scale: 0.9 }} 
            onClick={onBack} 
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-aaa"
          >
            <ArrowLeft size={18} />
          </motion.button>
        )}
        <div className="flex flex-col">
          <h2 className="game-title text-2xl tracking-tighter text-neon">{title}</h2>
          <div className="h-0.5 w-1/2 bg-gradient-to-r from-primary to-transparent opacity-50" />
        </div>
      </div>
      <div className="flex items-center gap-2">
         {streak > 0 && (
           <div className="streak-badge animate-bounce-subtle">
             🔥 {streak}
           </div>
         )}
         <div className="hud-card flex items-center gap-3 px-4 py-2 border-primary/20 bg-[#0f172a]/80 shadow-neon animate-pulse-glow">
            <Zap className="text-primary" size={16} />
            <span className="font-black italic text-sm text-primary tracking-tighter">PREMIUM</span>
         </div>
      </div>
    </div>
  );
}

const OnboardingScreen = ({ onComplete, initialGrade }) => {
  const avatars = [
    '👦','👧','🧒','🧑','👨','👩','👱','🧔','🦁','🐯',
    '🐸','🐼','🦊','🐨','🐙','🦖','🚀','⭐','🎮','🤖'
  ];
  const [selectedAvatar, setSelectedAvatar] = React.useState(avatars[0]);
  const [selectedGrade, setSelectedGrade] = React.useState(initialGrade || '3º');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 bg-gradient-to-b from-[#020617] to-primary/20">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
        <Crown size={80} className="text-accent mx-auto animate-bounce" />
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Configure seu Perfil</h1>
      </motion.div>

      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Escolha seu Avatar</p>
          <div className="grid grid-cols-5 gap-2 p-3 glass-card shadow-glass">
            {avatars.map(a => (
              <button 
                key={a} 
                onClick={() => setSelectedAvatar(a)} 
                className={`text-2xl p-2 rounded-lg transition-all ${selectedAvatar === a ? 'bg-primary/30 scale-110 border-2 border-primary' : 'hover:bg-white/5'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Seu Ano Escolar</p>
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black italic uppercase tracking-tighter appearance-none focus:ring-2 focus:ring-primary/50 transition-all shadow-glass"
            >
              {['3º', '4º', '5º', '7º', '8º', '9º'].map(g => (
                <option key={g} value={g} className="bg-[#020617]">{g} ANO</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4 pt-4">
        <button onClick={() => onComplete(false, selectedAvatar, selectedGrade)} className="btn-outline w-full p-6 text-xl uppercase font-black italic">
          CRIAR CONTA GRÁTIS
        </button>
        <button onClick={() => onComplete(true, selectedAvatar, selectedGrade)} className="btn-primary w-full p-6 text-xl flex flex-col gap-0 border-2 border-accent/30 shadow-neon">
          <span className="uppercase font-black italic tracking-tighter">ASSINAR PREMIUM</span>
          <span className="text-[10px] font-normal opacity-80 italic lowercase tracking-wide">R$ 9,90/mês - Turmas e Séries Ilimitadas</span>
        </button>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-50">100% Mobile & Offline Support</p>
      </div>
    </div>
  );
};

const RankingView = ({ user, xp, level, streak, stats, turma, joinTurma, onBack }) => {
  const [activeTab, setActiveTab] = React.useState('local');
  const [globalList, setGlobalList] = React.useState([]);
  const [turmaList, setTurmaList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [turmaCode, setTurmaCode] = React.useState('');

  React.useEffect(() => {
    if (activeTab === 'global') {
      setLoading(true);
      rankingAPI.getGlobalRanking().then(({ data, error }) => {
        if (error) console.error("Global ranking error:", error);
        setGlobalList(data || []);
        setLoading(false);
      });
    }
    if (activeTab === 'turma' && turma) {
      setLoading(true);
      rankingAPI.getTurma(turma.codigo).then(({ data, error }) => {
        if (error) console.error("Turma ranking error:", error);
        setTurmaList(data?.stats_turma || []);
        setLoading(false);
      });
    }
  }, [activeTab, turma]);

  const handleJoin = async () => {
    if (!turmaCode) return;
    try {
      const res = await joinTurma(turmaCode);
      if (!res.success) alert("❌ Erro: Verifique se o código está correto ou se a tabela no Supabase foi criada.");
      else alert("✅ Você entrou na turma com sucesso!");
    } catch (e) {
      alert("❌ Falha de conexão. O Supabase foi configurado?");
    }
  };

  const calculateScore = (uXp, uStr) => (uXp || 0) + ((uStr || 0) * 20);

  const localRanking = [
    { name: user.name, xp: xp, level: level, streak: streak, score: calculateScore(xp, streak), isMe: true },
    ...(stats.history.length > 0 ? [
      { name: 'Desafiante 1', xp: xp > 50 ? xp - 50 : 10, level: level, streak: 2, score: calculateScore(xp - 50, 2) },
      { name: 'Desafiante 2', xp: xp > 120 ? xp - 120 : 5, level: level > 1 ? level - 1 : 1, streak: 0, score: calculateScore(xp - 120, 0) }
    ] : [])
  ].sort((a,b) => b.score - a.score).map((r, i) => ({ ...r, pos: i + 1 }));

  const lists = {
    local: localRanking,
    turma: turmaList.sort((a,b) => b.xp - a.xp).map((r, i) => ({ name: r.nome_aluno || 'Aluno', xp: r.xp, pos: i + 1, isMe: r.aluno_id === user.id })),
    global: globalList.map((r, i) => ({ name: r.name || 'Herói Anônimo', xp: r.xp, level: r.level, pos: i + 1, isMe: r.id === user.id }))
  };

  return (
    <div className="max-w-md mx-auto p-2">
      <Header title="Rankings" streak={streak} onBack={onBack} />
      
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-6 font-black italic text-[10px] uppercase">
        {['local', 'turma', 'global'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-3 rounded-xl transition-all ${activeTab === t ? 'bg-primary text-slate-900 shadow-lg' : 'text-slate-400'}`}>
            {t === 'local' ? 'Local' : t === 'turma' ? 'Minha Turma' : 'Global (BR)'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {activeTab === 'turma' && !turma && (
            <div className="glass-card p-6 text-center space-y-4 border-dashed border-primary/30">
               <Users size={40} className="mx-auto text-primary opacity-50" />
               <p className="font-bold uppercase text-xs tracking-widest text-slate-400">Entre em uma Turma</p>
               <div className="flex gap-2">
                 <input value={turmaCode} onChange={e => setTurmaCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full text-center font-bold" />
                 <Tooltip text="Entrar na turma">
                   <button onClick={handleJoin} className="btn-primary p-2"><Plus /></button>
                 </Tooltip>
               </div>
               <p className="text-[10px] text-slate-500 uppercase font-black italic">PEÇA O CÓDIGO AO SEU PROFESSOR</p>
            </div>
          )}

          {loading ? (
             <div className="flex justify-center py-12 scale-75 opacity-80"><Mascot expression="loading" message="Carregando..." /></div>
          ) : (
            lists[activeTab].map((r) => (
              <motion.div key={`${activeTab}-${r.name}-${r.pos}`} whileHover={{ x: 5 }} className={`glass-card p-4 flex items-center justify-between border-2 ${
                r.pos === 1 ? 'tier-gold' : 
                r.pos === 2 ? 'tier-silver' : 
                r.pos === 3 ? 'border-orange-400/50' : 'border-white/5'
              } ${r.isMe ? 'bg-primary/10' : ''}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl ${
                     r.pos === 1 ? 'bg-accent text-slate-900' : 
                     r.pos === 2 ? 'bg-slate-300 text-slate-900' :
                     r.pos === 3 ? 'bg-orange-400 text-slate-900' : 'bg-white/10 text-slate-400'
                   }`}>
                     {r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : r.pos === 3 ? '🥉' : r.pos}
                   </div>
                   <div>
                      <p className={`font-black uppercase ${r.isMe ? 'text-primary' : ''}`}>{r.name} {r.isMe ? '(VOCÊ)' : ''}</p>
                      <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                        {r.score} Pontos ({r.xp} XP • {r.streak || 0}🔥)
                      </p>
                    </div>
                </div>
                {r.pos === 1 && <Award className="text-accent animate-pulse" />}
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PaywallModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md animate-in fade-in">
       <div className="glass-card max-w-sm w-full p-8 border-accent/50 shadow-[0_0_50px_rgba(20,184,166,0.3)] text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 blur-3xl rounded-full" />
          <div className="w-20 h-20 bg-gradient-to-tr from-accent to-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg rotate-3">
             <Crown size={40} className="text-slate-900" />
          </div>
          <h2 className="text-2xl font-black italic uppercase text-accent mb-2 tracking-tighter">Upgrade para Premium</h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            {message || "Desbloqueie todos os recursos, turmas ilimitadas e relatórios avançados."}
          </p>
          <button 
            onClick={() => alert("💎 Redirecionando para o Checkout (Futuro Stripe/MercadoPago)...")}
            className="w-full btn-accent py-4 font-black italic uppercase shadow-neon mb-3"
          >
            Assinar Agora
          </button>
          <button onClick={onClose} className="text-slate-500 text-[10px] uppercase font-black tracking-widest hover:text-white transition-all">
            Talvez depois
          </button>
       </div>
    </div>
  );
};

const TeacherDashboard = ({ user, plan, isPremium, streak, onBack, selectedTurma, setSelectedTurma, lastTurmaId }) => {
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('alunos');
  const [nomeTurma, setNomeTurma] = React.useState('');
  const [isFetching, setIsFetching] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState(null);
  const [myTurmas, setMyTurmas] = React.useState([]);
  const [newStudentName, setNewStudentName] = React.useState('');
  const [filterText, setFilterText] = React.useState('');
  const [suggestedStudents, setSuggestedStudents] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  // Provas state
  const [provas, setProvas] = React.useState([]);
  const [selectedProva, setSelectedProva] = React.useState(null);
  const [selectedProvaToEdit, setSelectedProvaToEdit] = React.useState(null);
  const [resultadosProva, setResultadosProva] = React.useState([]);
  const [novaProva, setNovaProva] = React.useState({ 
    titulo: '', 
    tipo: 'soma', 
    quantidade: 10, 
    tempo: 300, 
    dificuldade: '3º', 
    formato: 'multipla_escolha', 
    allow_retry: true 
  });
  const [criarProvaMode, setCriarProvaMode] = React.useState(false);
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    const fetchSuggestion = async () => {
      const query = newStudentName.trim();
      if (query.length >= 2) {
        setIsSearching(true);
        const { data } = await rankingAPI.searchProfiles(query);
        setSuggestedStudents(data || []);
        setIsSearching(false);
      } else {
        setSuggestedStudents([]);
      }
    };
    const timer = setTimeout(fetchSuggestion, 300);
    return () => clearTimeout(timer);
  }, [newStudentName]);

  const fetchTurmas = React.useCallback(async () => {
    if (!user?.id) return;
    setIsFetching(true);
    setFetchError(null);
    
    // Usar um Ref para acompanhar o estado real dentro do timeout (evitar stale closure)
    const activeRef = { current: true };
    const timeout = setTimeout(() => {
      if (activeRef.current) {
        setIsFetching(false);
        setFetchError("A conexão com o banco demorou muito (30s). Verifique sua internet ou se o projeto Supabase está ativo.");
      }
    }, 30000);

    try {
      const { data, error } = await rankingAPI.listMyTurmas(user.id).catch(e => ({ error: e }));
      activeRef.current = false;
      clearTimeout(timeout);
      if (error) throw error;
      if (data) {
        setMyTurmas(data);
        localStorage.setItem('math_adventure_offline_turmas', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Erro ao sincronizar turmas:", err);
      setFetchError(err.message || "Erro de conexão (406)");
    } finally {
      activeRef.current = false;
      clearTimeout(timeout);
      setIsFetching(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  // Restauração de Turma Selecionada (Persistência)
  React.useEffect(() => {
    if (lastTurmaId && myTurmas.length > 0 && !selectedTurma) {
      const found = myTurmas.find(t => t.id === lastTurmaId);
      if (found) setSelectedTurma(found);
    }
  }, [lastTurmaId, myTurmas, selectedTurma]);

  const handleCreate = async () => {
    if (!nomeTurma) return;
    if (plan === 'free' && myTurmas.length >= 1) {
       setShowPaywall(true);
       return;
    }
    setActionLoading(true);
    try {
      const { data, error } = await rankingAPI.createTurma(nomeTurma, user.id);
      if (data) {
         setNomeTurma('');
         await fetchTurmas();
         NotificationService.notify("Sucesso!", "Turma criada com sucesso!");
      } else if (error) {
         alert("Erro ao criar turma: " + error.message);
      }
    } catch (e) {
      alert("Falha na rede ao criar turma.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    const { error } = await rankingAPI.approveStudent(selectedTurma.id, studentId);
    if (!error) {
       setSelectedTurma(prev => ({
         ...prev,
         stats_turma: prev.stats_turma.map(s => s.aluno_id === studentId ? { ...s, status: 'accepted' } : s)
       }));
       NotificationService.notify("Sucesso!", "Aluno aprovado com sucesso.");
    }
  };

  const handleKick = async (studentId) => {
    if(!confirm("Deseja realmente remover este aluno?")) return;
    const { error } = await rankingAPI.kickStudent(selectedTurma.id, studentId);
    if (!error) {
       setSelectedTurma(prev => ({
         ...prev,
         stats_turma: prev.stats_turma.filter(s => s.aluno_id !== studentId)
       }));
       NotificationService.notify("Removido", "O aluno foi removido da turma.");
    }
  };

  const handleAddStudent = async (overrideId = null, overrideName = null) => {
    const input = (overrideName || newStudentName).trim();
    if (!input && !overrideId) return;
    
    let newId = overrideId;
    let nameToSave = input;
    
    setActionLoading(true);
    if (!newId) {
       if (input.length > 20) { // Provável UUID
          newId = input;
          const { data } = await supabase.from('profiles').select('name').eq('id', newId).single();
          if (data && data.name) {
             nameToSave = data.name;
          } else {
             const manualName = prompt("Aluno não encontrado na base global. Qual o nome deste aluno?");
             if (!manualName) { setActionLoading(false); return; }
             nameToSave = manualName.trim();
          }
       } else {
          const isCode = input.match(/^[0-9]+$/);
          newId = isCode ? `code_${input}` : `manual_${Date.now()}`;
          nameToSave = input;
       }
    }
    
    const { error } = await rankingAPI.updateStudentStats(selectedTurma.id, newId, nameToSave, 0, 0, 0, 'accepted');
    if (!error) {
       setNewStudentName('');
       setSuggestedStudents([]);
       // Em vez de refetchTurmas completo, atualizamos o estado da turma selecionada
       const newMember = { aluno_id: newId, nome_aluno: nameToSave, xp: 0, acertos_ops: 0, total_ops: 0, status: 'accepted' };
       setSelectedTurma(prev => ({
         ...prev,
         stats_turma: [newMember, ...(prev.stats_turma || [])]
       }));
       fetchTurmas(); 
    } else {
       console.error("Erro ao vincular aluno:", error);
       alert(`❌ Erro ao vincular aluno: ${error.message}\n\nNota: Verifique se você executou o script SQL completo no painel do Supabase.`);
    }
    setActionLoading(false);
  };

  const handleRename = async () => {
     const newName = prompt("Novo nome da turma:", selectedTurma.nome_turma);
     if (newName) {
        const { data } = await rankingAPI.updateTurma(selectedTurma.id, { nome_turma: newName });
        if (data) {
           setSelectedTurma(prev => ({ ...prev, nome_turma: newName }));
           fetchTurmas();
        }
     }
  };

  const handleDelete = async () => {
    if(!confirm("PERIGO: Deletar a turma removerá todos os dados permanentemente!")) return;
    const { error } = await rankingAPI.deleteTurma(selectedTurma.id);
    if (!error) {
       setSelectedTurma(null);
       fetchTurmas();
    }
  };

  const exportPDF = (turma) => {
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString('pt-BR');
      const safeTurmaName = (turma.nome_turma || 'Turma').normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
      
      doc.setFontSize(22);
      doc.text(`Relatorio VIP: ${turma.nome_turma || ''}`, 20, 25);
      doc.setFontSize(12);
      doc.text(`Codigo: ${turma.codigo || ''} | Data: ${timestamp}`, 20, 35);
      
      let y = 55;
      doc.setFont(undefined, 'bold');
      doc.text("ALUNO", 20, y);
      doc.text("XP", 100, y);
      doc.text("ACERTOS", 130, y);
      doc.text("% APROVEIT.", 160, y);
      
      doc.setFont(undefined, 'normal');
      (turma.stats_turma || []).sort((a,b) => b.xp - a.xp).forEach(s => {
        y += 10;
        // Paging fix: If y is too low, add a new page
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(String(s.nome_aluno || 'N/A'), 20, y);
        doc.text(String(s.xp || 0), 100, y);
        doc.text(String(s.acertos_ops || 0), 130, y);
        const media = s.total_ops > 0 ? ((s.acertos_ops / s.total_ops) * 100).toFixed(1) + "%" : "0%";
        doc.text(media, 160, y);
      });
      
      doc.save(`Relatorio_${safeTurmaName}_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("❌ Houve um erro ao gerar o PDF. Verifique os dados da turma.");
    }
  };

  const renderMinhasTurmas = () => (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-4 shadow-glass border-primary/20 bg-primary/5">
        <h3 className="text-xl font-black italic flex items-center gap-2 uppercase tracking-tighter"><Plus size={24} className="text-primary" /> Criar Turma</h3>
        <div className="flex gap-2">
           <input value={nomeTurma} onChange={e => setNomeTurma(e.target.value)} placeholder="NOME DA TURMA" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full font-bold uppercase text-sm" />
           <Tooltip text="Criar nova turma no seu perfil">
             <button onClick={handleCreate} disabled={actionLoading || !nomeTurma} className="btn-primary p-2 px-6 uppercase font-black italic shadow-neon">{actionLoading ? '...' : 'CRIAR'}</button>
           </Tooltip>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-black italic text-slate-400 text-[10px] uppercase tracking-[0.2em] ml-2">Suas Turmas</h3>
        {fetchError && (
          <div className="glass-card p-4 border-rose-500/50 bg-rose-500/10 text-center space-y-3">
             <p className="text-rose-400 text-[10px] font-black uppercase">⚠️ {fetchError}</p>
             <div className="flex gap-2">
                <button onClick={fetchTurmas} className="flex-1 py-2 bg-rose-500/20 rounded-xl font-black text-[10px] uppercase">Tentar De Novo</button>
                <button onClick={() => { setFetchError(null); setMyTurmas(JSON.parse(localStorage.getItem('math_adventure_offline_turmas') || '[]')); }} className="flex-1 py-2 bg-white/5 rounded-xl font-black text-[10px] uppercase border border-white/10">Pular Sync</button>
             </div>
          </div>
        )}

        {(isFetching && myTurmas.length === 0) ? (
          <div className="text-center py-10 space-y-4">
             <div className="animate-pulse text-primary font-black uppercase italic">Sincronizando...</div>
             <button onClick={() => { setIsFetching(false); setMyTurmas(JSON.parse(localStorage.getItem('math_adventure_offline_turmas') || '[]')); }} className="mx-auto block py-2 px-6 bg-white/5 rounded-xl font-black text-[10px] uppercase border border-white/10 opacity-50 hover:opacity-100 transition-all">Pular / Modo Cache</button>
          </div>
        ) : (
          <>
            {myTurmas.length === 0 && !isFetching && !fetchError ? (
              <div className="text-center py-10 glass-card bg-white/[0.02]">
                 <Users size={32} className="mx-auto text-slate-600 mb-3" />
                 <p className="text-slate-500 font-bold uppercase text-[10px] italic">Você ainda não criou nenhuma turma</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTurmas.map(t => (
                  <motion.div key={t.id} whileHover={{ y: -2 }} onClick={() => setSelectedTurma(t)} className="glass-card p-4 flex items-center justify-between group cursor-pointer transition-all border-white/5 hover:border-primary/30">
                    <div>
                        <p className="font-black text-lg uppercase italic">{t.nome_turma}</p>
                        <p className="text-primary font-mono tracking-widest text-xs">{t.codigo}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(t.stats_turma?.length || 0)} ALUNOS</p>
                        <p className="text-xs font-black text-accent">{parseFloat(t.media_acerto || t.media_turma || 0).toFixed(0)}% Acerto</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {isFetching && myTurmas.length > 0 && (
              <p className="text-center text-[8px] font-black uppercase text-primary/40 animate-pulse">Sincronização em segundo plano...</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderAlunos = () => {
    if (!selectedTurma) return null;
    
    const pendingAlunos = (selectedTurma.stats_turma || []).filter(s => s.status === 'pending');
    const acceptedAlunos = (selectedTurma.stats_turma || []).filter(s => s.status === 'accepted').filter(s => {
      const nome = s.nome_aluno || '';
      const id = s.aluno_id || '';
      return nome.toLowerCase().includes(filterText.toLowerCase()) || 
             id.toLowerCase().includes(filterText.toLowerCase());
    });

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 shadow-glass">
           <div>
             <h3 className="font-black uppercase tracking-tighter italic text-xl">{selectedTurma.nome_turma}</h3>
             <p className="text-[10px] text-primary font-mono tracking-[0.2em]">{selectedTurma.codigo}</p>
           </div>
           <div className="flex gap-2">
             <button onClick={handleRename} className="p-2.5 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all border border-white/5"><Edit3 size={18} /></button>
             <button onClick={handleDelete} className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/10"><Trash2 size={18} /></button>
           </div>
        </div>

        {/* BARRAS DE BUSCA E ADIÇÃO */}
        <div className="space-y-3">
          <div className="relative group">
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 focus-within:border-primary/50 transition-all">
              <input 
                value={newStudentName} 
                onChange={e => setNewStudentName(e.target.value)} 
                placeholder="BUSCAR ALUNO PARA ADICIONAR..." 
                className="bg-transparent px-4 py-2 w-full font-black uppercase text-[11px] focus:outline-none placeholder:text-slate-600" 
                onKeyPress={e => e.key === 'Enter' && handleAddStudent()}
              />
              <button disabled={actionLoading || !newStudentName} onClick={() => handleAddStudent()} className="bg-primary text-slate-900 p-2.5 rounded-xl shadow-neon hover:scale-105 active:scale-95 transition-all"><Plus size={18} /></button>
            </div>

            {isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card p-4 text-center">
                <p className="text-[10px] font-black uppercase italic text-primary animate-pulse">Sincronizando base de alunos...</p>
              </div>
            )}

            {!isSearching && suggestedStudents.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card overflow-hidden shadow-2xl border-primary/20 max-h-60 overflow-y-auto">
                {suggestedStudents.map(student => (
                  <motion.div 
                    key={student.id} 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                    className="p-4 border-b border-white/5 last:border-b-0 flex justify-between items-center hover:bg-primary/10 cursor-pointer transition-all"
                    onClick={() => handleAddStudent(student.id, student.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                        {student.avatar_url || '👤'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-white">{student.name}</span>
                        <span className="text-[9px] font-mono tracking-tighter text-slate-500 uppercase">{student.id}</span>
                      </div>
                    </div>
                    <div className="text-[9px] font-black uppercase italic text-primary bg-primary/10 px-2 py-1 rounded-md">Vincular</div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SOLICITAÇÕES PENDENTES */}
        {pendingAlunos.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-black italic text-accent text-[10px] uppercase tracking-[0.2em] ml-2">
              <Clock size={12} /> Solicitações Pendentes ({pendingAlunos.length})
            </h4>
            {pendingAlunos.map(s => (
              <motion.div key={s.aluno_id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-card p-4 flex items-center justify-between border-accent/30 bg-accent/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">⏳</div>
                  <div>
                    <p className="font-black uppercase text-sm">{s.nome_aluno}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{s.aluno_id}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleApprove(s.aluno_id)} className="bg-accent text-slate-900 font-black uppercase text-[10px] py-2 px-4 rounded-lg shadow-lg hover:scale-105 transition-all">Aceitar</button>
                   <button onClick={() => handleKick(s.aluno_id)} className="bg-white/5 text-rose-500 font-black uppercase text-[10px] py-2 px-3 rounded-lg hover:bg-rose-500/10 transition-all border border-rose-500/20">Recusar</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* LISTA DE MEMBROS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center ml-2">
            <h4 className="font-black italic text-slate-400 text-[10px] uppercase tracking-[0.2em]">Membros da Turma</h4>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
               <Search size={10} className="text-slate-500" />
               <input value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="FILTRAR..." className="bg-transparent font-black uppercase text-[9px] focus:outline-none w-20" />
            </div>
          </div>

          {acceptedAlunos.length === 0 ? (
             <div className="text-center py-10 glass-card bg-white/[0.02] border-dashed border-white/10">
                <Users size={32} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-600 font-bold uppercase text-[9px] italic">Nenhum aluno ativo nesta turma</p>
             </div>
          ) : acceptedAlunos.map(s => (
             <div key={s.aluno_id} className="glass-card p-4 flex items-center justify-between group border-white/5 hover:border-primary/20 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">👤</div>
                  <div>
                    <p className="font-black uppercase text-sm group-hover:text-primary transition-all">{s.nome_aluno}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[9px] font-mono tracking-tighter text-slate-500">{s.aluno_id}</p>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      <span className="text-primary">{s.xp} XP</span> • {s.total_ops > 0 ? ((s.acertos_ops/s.total_ops)*100).toFixed(0) : 0}% Acerto
                    </p>
                  </div>
               </div>
               <Tooltip text="Remover da Turma">
                 <button onClick={() => handleKick(s.aluno_id)} className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all border border-rose-500/10"><UserMinus size={18} /></button>
               </Tooltip>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRanking = () => {
    if (!selectedTurma) return null;
    const chartData = {
      labels: selectedTurma.stats_turma?.map(s => s.nome_aluno.split(' ')[0]) || [],
      datasets: [{
        label: 'XP Total',
        data: selectedTurma.stats_turma?.map(s => s.xp) || [],
        backgroundColor: '#4facfe',
        borderRadius: 4,
      }]
    };

    return (
      <div className="space-y-6">
        <div className="glass-card p-4 bg-white/5 border border-white/10 shadow-glass">
          <p className="font-black uppercase text-[10px] text-slate-400 tracking-widest mb-4">Evolução da Turma (XP)</p>
          <Bar data={chartData} options={{ scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} />
        </div>
        <div className="space-y-2">
          {selectedTurma.stats_turma && [...selectedTurma.stats_turma].sort((a,b) => b.xp - a.xp).map((s, i) => (
             <div key={s.id} className={`glass-card p-3 flex justify-between items-center ${i===0 ? 'border-accent bg-accent/10' : 'border-white/5'}`}>
               <span className="font-black uppercase text-xs">{i+1}º {s.nome_aluno}</span>
               <span className="font-black text-primary text-sm">{s.xp} XP</span>
             </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRelatorios = () => {
    if (!selectedTurma) return null;
    return (
      <div className="space-y-4">
        <div className="glass-card p-6 text-center space-y-4 shadow-glass">
          <Download size={40} className="mx-auto text-primary" />
          <div>
            <h3 className="font-black italic uppercase text-xl">Exportar Dados</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">PDF Completo com Notas e XP</p>
          </div>
          <button onClick={() => exportPDF(selectedTurma)} className="btn-primary w-full p-4 font-black italic uppercase text-xs">Baixar PDF</button>
          <button className="btn-outline w-full p-4 font-black italic uppercase text-xs opacity-50 cursor-not-allowed">Exportar Excel (CSV) - Em Breve</button>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!selectedTurma) return null;
    const bestStudent = selectedTurma.stats_turma ? [...selectedTurma.stats_turma].sort((a,b) => b.xp - a.xp)[0] : null;
    const mostAccurate = selectedTurma.stats_turma ? [...selectedTurma.stats_turma].sort((a,b) => (b.acertos_ops/b.total_ops || 0) - (a.acertos_ops/a.total_ops || 0))[0] : null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 bg-primary/5 border-primary/20 text-center">
            <Zap className="text-primary mx-auto mb-2" size={24} />
            <p className="text-[10px] font-black uppercase text-slate-500 italic">Média da Turma</p>
            <p className="text-2xl font-black text-primary">{parseFloat(selectedTurma.media_acerto || 0).toFixed(1)}%</p>
          </div>
          <div className="glass-card p-4 bg-accent/5 border-accent/20 text-center">
             <Crown className="text-accent mx-auto mb-2" size={24} />
            <p className="text-[10px] font-black uppercase text-slate-500 italic">Melhor Aluno</p>
            <p className="text-sm font-black text-slate-100 uppercase truncate">{bestStudent?.nome_aluno || '---'}</p>
          </div>
        </div>
        <div className="glass-card p-5 border-white/10 shadow-glass">
           <h4 className="font-black italic uppercase text-xs tracking-widest text-primary mb-4 flex items-center gap-2">
             <Activity size={14} /> Atividade Recente (Tempo Real)
           </h4>
           <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {activities.length === 0 ? (
                <p className="text-[10px] text-slate-600 uppercase font-bold text-center py-4">Aguardando atividades...</p>
              ) : activities.map(act => (
                <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={act.id} className="flex gap-3 items-start border-l-2 border-primary/20 pl-3 py-1">
                   <div className="text-sm">{act.tipo === 'xp_gain' ? '⚡' : act.tipo === 'level_up' ? '🆙' : '📝'}</div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-200">
                        {act.nome_aluno} <span className="text-slate-500 font-normal ml-1">às {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                      <p className="text-[9px] text-primary font-bold uppercase italic">{act.descricao}</p>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        <div className="glass-card p-5 border-white/10 shadow-glass">
           <h4 className="font-black italic uppercase text-xs tracking-widest text-slate-400 mb-4">Métricas de Engajamento</h4>
           <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[10px] uppercase font-bold text-slate-500">Mais Preciso (%)</span>
                 <span className="font-black text-xs">{mostAccurate?.nome_aluno || '---'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[10px] uppercase font-bold text-slate-500">Taxa de Abandono</span>
                 <span className="font-black text-xs text-success">Muito Baixa (&lt;5%)</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] uppercase font-bold text-slate-500">Operação Favorita</span>
                 <span className="font-black text-xs text-secondary">Soma Clássica</span>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const fetchProvas = async () => {
    if (!selectedTurma) return;
    const { data } = await rankingAPI.getProvasTurma(selectedTurma.id);
    if (data) setProvas(data);
  };

  React.useEffect(() => { fetchProvas(); }, [selectedTurma]);

  React.useEffect(() => {
    if (!selectedTurma) return;
    
    // Busca inicial de atividades
    rankingAPI.getRecentActivity(selectedTurma.id).then(({ data }) => {
      if (data) setActivities(data);
    });

    // Subscrição Realtime para novas atividades
    const sub = rankingAPI.subscribeToActivity(selectedTurma.id, (payload) => {
      setActivities(prev => [payload.new, ...prev].slice(0, 20));
      // Feedback visual opcional: NotificationService.notify("Novo Progresso", `${payload.new.nome_aluno}: ${payload.new.descricao}`);
    });

    return () => { if (sub) supabase.removeChannel(sub); };
  }, [selectedTurma]);

  // Sincronização em Tempo Real para Ranking e Lista de Alunos (Fase 3)
  React.useEffect(() => {
    if (!selectedTurma) return;
    
    // Subscrção via rankingAPI que já configuramos
    const sub = rankingAPI.subscribeToTurma(selectedTurma.id, (payload) => {
      // Atualizamos tanto a lista geral quanto a turma selecionada
      const updateStats = (prev) => {
        if (!prev) return prev;
        const newStats = [...(prev.stats_turma || [])];
        const index = newStats.findIndex(s => s.aluno_id === payload.new.aluno_id);
        
        if (index !== -1) {
          newStats[index] = { ...newStats[index], ...payload.new };
        } else {
          newStats.push(payload.new);
        }
        return { ...prev, stats_turma: newStats };
      };

      setSelectedTurma(updateStats);
      setMyTurmas(prevList => prevList.map(t => t.id === selectedTurma.id ? updateStats(t) : t));
    });

    return () => { if (sub) supabase.removeChannel(sub); };
  }, [selectedTurma?.id]);

  const handleCreateProva = async () => {
    if (!selectedTurma) return alert("Erro: Nenhuma turma selecionada.");
    if (!novaProva.titulo) return;
    setActionLoading(true);

    if (selectedProvaToEdit) {
      const { error } = await rankingAPI.updateProva(selectedProvaToEdit.id, {
        titulo: novaProva.titulo,
        tipo: novaProva.tipo,
        quantidade_questoes: parseInt(novaProva.quantidade),
        tempo_limite: parseInt(novaProva.tempo),
        dificuldade: novaProva.dificuldade,
        formato: novaProva.formato,
        allow_retry: novaProva.allow_retry
      });
      if (!error) {
        NotificationService.notify("Sucesso", "Prova atualizada com sucesso!");
        setSelectedProvaToEdit(null);
        setCriarProvaMode(false);
        fetchProvas();
      } else {
        alert("Erro ao atualizar prova: " + error.message);
      }
    } else {
      const { error } = await rankingAPI.createProva(
        selectedTurma.id,
        novaProva.titulo,
        novaProva.tipo,
        parseInt(novaProva.quantidade),
        parseInt(novaProva.tempo),
        novaProva.dificuldade,
        novaProva.formato,
        novaProva.allow_retry
      );
      if (!error) {
        NotificationService.notify("Sucesso", "Prova publicada com sucesso!");
        setNovaProva({ 
          titulo: '', tipo: 'soma', quantidade: 10, tempo: 300, 
          dificuldade: '3º', formato: 'multipla_escolha', allow_retry: true 
        });
        setCriarProvaMode(false);
        fetchProvas();
      } else {
        alert('Erro ao criar prova: ' + error.message);
      }
    }
    setActionLoading(false);
  };

  const handleViewResultados = async (prova) => {
    setSelectedProva(prova);
    const { data } = await rankingAPI.getResultadosProva(prova.id);
    setResultadosProva(data || []);
  };

  const handleUpdateProva = async (provaId, updates) => {
    const { error } = await rankingAPI.updateProva(provaId, updates);
    if (!error) {
      setProvas(prev => prev.map(p => p.id === provaId ? { ...p, ...updates } : p));
      if (selectedProva && selectedProva.id === provaId) {
        setSelectedProva(prev => ({ ...prev, ...updates }));
      }
      NotificationService.notify("Atualizado", "Configurações da prova salvas.");
    }
  };

  const handleDeleteProva = async (provaId) => {
    if (!confirm("⚠️ Deletar esta prova removerá todos os resultados dos alunos. Deseja continuar?")) return;
    const { error } = await rankingAPI.deleteProva(provaId);
    if (!error) {
      setProvas(prev => prev.map(p => p.id === provaId ? { ...p, deleted: true } : p).filter(p => !p.deleted));
      setSelectedProva(null);
      NotificationService.notify("Excluído", "A prova foi removida com sucesso.");
    }
  };

  const renderProvas = () => {
    if (!selectedTurma) return null;

    if (selectedProva) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <button onClick={() => setSelectedProva(null)} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase transition-all">
              <ArrowLeft size={14} /> Voltar às Provas
            </button>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateProva(selectedProva.id, { is_active: !selectedProva.is_active }); }}
                className={`p-2 rounded-lg border transition-all ${selectedProva.is_active ? 'border-primary/20 text-primary bg-primary/5' : 'border-rose-500/20 text-rose-500 bg-rose-500/5'}`}
              >
                {selectedProva.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteProva(selectedProva.id); }} className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 hover:bg-rose-500/20"><Trash2 size={16} /></button>
            </div>
          </div>
          
          <div className="glass-card p-5 border-primary/30 bg-primary/5 shadow-glass">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black uppercase text-lg text-white">{selectedProva.titulo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${selectedProva.is_active ? 'bg-success/20 text-success' : 'bg-rose-500/20 text-rose-500'}`}>
                    {selectedProva.is_active ? 'Ativa' : 'Pausada'}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {selectedProva.tipo.toUpperCase()} • {selectedProva.quantidade_questoes}Q • {selectedProva.tempo_limite / 60} min
                  </p>
                </div>
              </div>
            </div>
          </div>
          <h4 className="font-black italic text-[10px] uppercase text-slate-400 tracking-widest">Resultados dos Alunos</h4>
          {resultadosProva.length === 0 ? (
            <p className="text-center py-10 glass-card text-slate-500 text-[10px] font-bold uppercase">Nenhum aluno finalizou esta prova ainda.</p>
          ) : resultadosProva.map((r, i) => (
            <div key={r.id} className={`glass-card p-4 flex items-center justify-between transition-all hover:scale-[1.01] ${i === 0 ? 'border-accent/40 bg-accent/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/5'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-accent text-slate-900 shadow-neon' : i === 1 ? 'bg-slate-300 text-slate-900' : i === 2 ? 'bg-orange-400 text-slate-900' : 'bg-white/5 text-slate-500'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </div>
                <div>
                  <p className="font-black uppercase text-sm tracking-tight">{r.nome_aluno}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">⏱️ {Math.floor(r.tempo_gasto / 60)}:{String(r.tempo_gasto % 60).padStart(2, '0')}</p>
                </div>
              </div>
              <div className={`text-2xl font-black italic ${r.nota >= 70 ? 'text-success drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]' : r.nota >= 50 ? 'text-accent' : 'text-rose-400'}`}>
                {r.nota.toFixed(0)}
                <span className="text-[10px] text-slate-500 ml-1">/100</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (criarProvaMode) {
      const tipoOps = ['soma', 'subtracao', 'multiplicacao', 'divisao', 'mixed'];
      return (
        <div className="space-y-4">
          <button onClick={() => setCriarProvaMode(false)} className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-black uppercase">← Voltar</button>
          <div className="glass-card p-6 space-y-4 border-primary/20 bg-primary/5">
            <h3 className="font-black italic uppercase text-xl">📝 Nova Prova</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Título da Prova</label>
                <input value={novaProva.titulo} onChange={e => setNovaProva(p => ({ ...p, titulo: e.target.value }))} placeholder="Ex: Avaliação de Soma – Bimestre 2" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full font-bold text-sm mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Operação</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {tipoOps.map(op => (
                    <button key={op} onClick={() => setNovaProva(p => ({ ...p, tipo: op }))} className={`py-2 rounded-xl font-black uppercase text-[10px] transition-all ${novaProva.tipo === op ? 'bg-primary text-slate-900 shadow-neon' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                      {op === 'soma' ? '➕ Soma' : op === 'subtracao' ? '➖ Subtração' : op === 'multiplicacao' ? '✖️ Mult' : op === 'divisao' ? '➗ Div' : '🔀 Mix'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nº de Questões</label>
                  <select value={novaProva.quantidade} onChange={e => setNovaProva(p => ({ ...p, quantidade: e.target.value }))} className="bg-[#020617] border border-white/10 text-white rounded-xl px-4 py-2 w-full font-bold text-sm mt-1 focus:outline-none">
                    {[5, 10, 15, 20, 25, 30, 40, 50].map(n => <option key={n} value={n} className="bg-[#020617] text-white">{n} questões</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tempo Limite</label>
                  <select value={novaProva.tempo} onChange={e => setNovaProva(p => ({ ...p, tempo: e.target.value }))} className="bg-[#020617] border border-white/10 text-white rounded-xl px-4 py-2 w-full font-bold text-sm mt-1 focus:outline-none">
                    <option value={180} className="bg-[#020617] text-white">3 minutos</option>
                    <option value={300} className="bg-[#020617] text-white">5 minutos</option>
                    <option value={600} className="bg-[#020617] text-white">10 minutos</option>
                    <option value={900} className="bg-[#020617] text-white">15 minutos</option>
                    <option value={1800} className="bg-[#020617] text-white">30 minutos</option>
                    <option value={2700} className="bg-[#020617] text-white">45 minutos</option>
                    <option value={3600} className="bg-[#020617] text-white">1 hora</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Série/Dificuldade</label>
                  <select value={novaProva.dificuldade} onChange={e => setNovaProva(p => ({ ...p, dificuldade: e.target.value }))} className="bg-[#020617] border border-white/10 text-white rounded-xl px-4 py-2 w-full font-bold text-sm mt-1 focus:outline-none">
                    {['3º', '4º', '5º', '6º', '7º', '8º', '9º'].map(g => <option key={g} value={g} className="bg-[#020617] text-white">{g} ANO</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Formato da Prova</label>
                  <select value={novaProva.formato} onChange={e => setNovaProva(p => ({ ...p, formato: e.target.value }))} className="bg-[#020617] border border-white/10 text-white rounded-xl px-4 py-2 w-full font-bold text-sm mt-1 focus:outline-none">
                    <option value="multipla_escolha" className="bg-[#020617] text-white">🔘 Múltipla Escolha</option>
                    <option value="escrita" className="bg-[#020617] text-white">✍️ Escrita (Digitar)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 mt-1 cursor-pointer hover:bg-white/10 transition-all" onClick={() => setNovaProva(p => ({ ...p, allow_retry: !p.allow_retry }))}>
                <div className={`w-10 h-6 rounded-full transition-all relative ${novaProva.allow_retry ? 'bg-primary' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${novaProva.allow_retry ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Permitir Refazer a Prova</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreateProva} disabled={actionLoading || !novaProva.titulo} className="btn-primary flex-1 py-3 font-black italic uppercase">{actionLoading ? 'Processando...' : (selectedProvaToEdit ? '💾 Salvar Mudanças' : '🎓 Publicar Prova')}</button>
              {selectedProvaToEdit && (
                <button onClick={() => { setSelectedProvaToEdit(null); setCriarProvaMode(false); setNovaProva({ titulo: '', tipo: 'soma', quantidade: 10, tempo: 300, dificuldade: '3º', formato: 'multipla_escolha', allow_retry: true }); }} className="bg-white/5 px-6 rounded-2xl border border-white/10 font-black uppercase text-[10px]">Cancelar</button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button onClick={() => setCriarProvaMode(true)} className="btn-primary w-full py-4 font-black italic uppercase flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Layout size={18} /> Criar Nova Prova
        </button>
        {provas.length === 0 ? (
          <div className="text-center py-12 glass-card bg-white/[0.02] border-dashed border-white/10">
            <span className="text-4xl filter grayscale">📝</span>
            <p className="text-slate-500 font-bold uppercase text-[9px] italic mt-3 tracking-widest">Nenhuma prova publicada ainda.</p>
          </div>
        ) : provas.map(p => (
          <motion.div 
            key={p.id} 
            whileHover={{ y: -2, borderLeftColor: '#4facfe' }} 
            className="glass-card p-4 flex items-center justify-between cursor-pointer border-white/5 border-l-4 hover:border-primary/30 transition-all bg-white/[0.01]"
            onClick={() => handleViewResultados(p)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${p.is_active ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                {p.tipo === 'mixed' ? '🔀' : '📝'}
              </div>
              <div>
                <p className={`font-black uppercase text-sm ${!p.is_active && 'text-slate-500 line-through'}`}>{p.titulo}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.is_active ? 'bg-success/10 text-success border border-success/20' : 'bg-slate-800 text-slate-500'}`}>
                    {p.is_active ? 'Disponível' : 'Arquivada'}
                  </span>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.tipo.toUpperCase()} • {p.quantidade_questoes}Q • {p.tempo_limite / 60} min</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button 
                  onClick={(e) => { e.stopPropagation(); handleUpdateProva(p.id, { is_active: !p.is_active }); }}
                  className={`p-2 rounded-lg transition-all ${p.is_active ? 'text-primary hover:bg-primary/10' : 'text-slate-600 hover:bg-slate-700'}`}
                >
                  {p.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
               <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedProvaToEdit(p);
                    setNovaProva({
                      titulo: p.titulo,
                      tipo: p.tipo,
                      quantidade: p.quantidade_questoes,
                      tempo: p.tempo_limite,
                      dificuldade: p.dificuldade || '3º',
                      formato: p.formato || 'multipla_escolha',
                      allow_retry: p.allow_retry ?? true
                    });
                    setCriarProvaMode(true);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Edit3 size={16} />
                </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteProva(p.id); }}
                  className="p-2 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
               <ChevronRight className="text-slate-600" size={18} />
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'alunos', icon: <User size={16} />, label: 'Alunos' },
    { id: 'ranking', icon: <Trophy size={16} />, label: 'Ranking' },
    { id: 'relatorios', icon: <Download size={16} />, label: 'Data' },
    { id: 'analytics', icon: <TrendingUp size={16} />, label: 'Análise' },
    { id: 'provas', icon: <span className="text-sm">🎓</span>, label: 'Provas' },
  ];

  return (
    <div className="max-w-md mx-auto p-2 pb-12">
      <Header title="Professor VIP" streak={streak} onBack={selectedTurma ? () => { setSelectedTurma(null); setActiveTab('alunos'); } : onBack} />
      
      {!selectedTurma ? renderMinhasTurmas() : (
        <>
          <div className="flex justify-between bg-white/[0.02] border border-white/10 rounded-2xl p-1 mb-6 shadow-glass relative">
             {tabs.map(tab => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all relative z-10 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 hover:text-white'}`}
                >
                  {activeTab === tab.id && <motion.div layoutId="teacherTab" className="absolute inset-0 bg-primary rounded-xl shadow-neon -z-10" />}
                  {tab.icon}
                  <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{tab.label}</span>
                </button>
             ))}
          </div>

          <AnimatePresence mode="wait">
             <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeTab === 'alunos' && renderAlunos()}
                {activeTab === 'ranking' && renderRanking()}
                {activeTab === 'relatorios' && renderRelatorios()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'provas' && renderProvas()}
             </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

const StatsView = ({ stats, streak, onBack }) => {
  const [showPaywall, setShowPaywall] = React.useState(false);
  const operations = ['soma', 'subtracao', 'multiplicacao', 'divisao'];
  const bgColors = ['#4facfe', '#f50057', '#f9ce34', '#00e676'];

  const totalQ = stats.totalQuestions || 0;
  const correctQ = stats.correctQuestions || 0;
  const accuracy = totalQ > 0 ? (correctQ / totalQ) * 100 : 0;

  const badges = [
    { title: "Primeiro Passo", icon: "🌱", desc: "Responda sua primeira questão", condition: totalQ > 0 },
    { title: "Aquecimento", icon: "🔥", desc: "Responda 50 questões no total", condition: totalQ >= 50 },
    { title: "Foco Total", icon: "🎯", desc: "Atinja 90% de precisão (mín de 50 qtdes)", condition: totalQ >= 50 && accuracy >= 90 },
    { title: "Mestre", icon: "👑", desc: "Faça mais de 200 questões!", condition: totalQ >= 200 },
    { title: "Matemágico", icon: "✨", desc: "Alcance incríveis 1000 acertos", condition: correctQ >= 1000 },
    { title: "Invencível", icon: "💎", desc: "Termine 10 provas com sucesso (Em breve)", condition: false }
  ];

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      <Header title="Registro do Jogador" streak={streak} onBack={onBack} />
      
      <div className="glass-card p-6 text-center space-y-4 shadow-glass border-primary/20 bg-primary/5 relative overflow-hidden">
        {/* Enfeite fundo radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5 relative z-10">
          <div className="text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <p className="text-4xl font-black text-primary drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">{correctQ}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-widest mt-1">Acertos</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <p className="text-4xl font-black text-slate-300">{totalQ}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-widest mt-1">Total Tents</p>
          </div>
        </div>

        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] italic pt-2">Taxa de Erros por Categoria</p>
        <div className="h-40 flex items-center justify-center relative z-10">
           <div className="flex items-end gap-5 h-24">
             {operations.map((op, i) => (
               <Tooltip key={op} text={`${op.toUpperCase()}: ${stats.errors[op] || 0} erros`}>
                 <div className="flex flex-col items-center gap-2 group cursor-pointer">
                   <div 
                     className="w-8 rounded-xl transition-all shadow-lg group-hover:scale-110 group-hover:brightness-125 duration-300" 
                     style={{ height: `${Math.min(100, (stats.errors[op] || 0) * 8 + 15)}%`, backgroundColor: bgColors[i] }} 
                   />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter opacity-70 group-hover:opacity-100">{op === 'subtracao' ? 'SUB' : op.slice(0,4)}</span>
                 </div>
               </Tooltip>
             ))}
           </div>
        </div>
      </div>

      <div className="glass-card p-5 space-y-4 border-accent/20 bg-accent/[0.02]">
         <div className="flex items-center gap-2 mb-2">
            <Award className="text-accent" size={18} />
            <h3 className="font-black italic text-slate-300 text-sm uppercase tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Galeria de Conquistas</h3>
         </div>
         
         <div className="grid grid-cols-3 gap-3">
           {badges.map((b, idx) => (
              <Tooltip key={idx} text={b.desc}>
                <div className={`aspect-square p-2 rounded-2xl flex flex-col items-center justify-center gap-1.5 relative overflow-hidden transition-all duration-500 ${b.condition ? 'bg-gradient-to-tr from-amber-500/10 to-yellow-300/10 border-2 border-yellow-400/30 hover:border-yellow-400/60 shadow-[0_0_15px_rgba(250,204,21,0.1)] hover:-translate-y-1' : 'bg-slate-900/50 border border-white/5 grayscale opacity-50'}`}>
                   {b.condition ? (
                     <div className="absolute inset-0 bg-white/5 pattern-scanlines pointer-events-none opacity-50" />
                   ) : (
                     <div className="absolute inset-0 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center bg-slate-950/40">
                       <span className="text-xl opacity-40 mix-blend-overlay">🔒</span>
                     </div>
                   )}
                   <div className={`text-4xl relative z-10 ${b.condition ? 'drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse' : ''} transition-transform`}>
                     {b.icon}
                   </div>
                   <span className={`text-[8px] font-black uppercase text-center leading-[1.1] relative z-10 tracking-widest px-1 ${b.condition ? 'text-yellow-400' : 'text-slate-600'}`}>
                     {b.title}
                   </span>
                </div>
              </Tooltip>
           ))}
         </div>
      </div>
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};
const SettingsView = ({ user, level, isPremium, setIsPremium, setAvatar, streak, settings, setSettings, grade, setGrade, onBack, resetProgress, logout, setAuthLoading }) => {
  const avatars = [
    '👦','👧','🧒','🧑','👨','👩','👱','🧔','🦁','🐯',
    '🐸','🐼','🦊','🐨','🐙','REX','🚀','⭐','🎮','🤖'
  ];
  
  const isAvatarUnlocked = (a) => {
    const premium = PREMIUM_AVATARS.find(p => p.url === a);
    if (!premium) return true; // Emojis sempre liberados
    return (level || 1) >= premium.minLevel;
  };

  const handleAvatarSelect = (a) => {
    if (a === user.avatar) return;
    if (!isAvatarUnlocked(a)) {
      const premium = PREMIUM_AVATARS.find(p => p.url === a);
      alert(`🔐 Bloqueado: Este avatar requer Nível ${premium.minLevel}. Continue jogando para desbloquear!`);
      return;
    }
    setAvatar(a);
    alert("✅ Avatar atualizado!");
  };

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      <Header title="Ajustes" streak={streak} onBack={onBack} />

      <div className="glass-card p-6 space-y-6 shadow-glass">
        {/* AVATAR SELECTOR */}
        <div className="space-y-3 pb-4 border-b border-white/5">
          <div className="flex justify-between items-center mb-2">
            <p className="font-black text-sm uppercase italic">Seu Avatar</p>
          </div>
          <div className={`grid grid-cols-5 gap-3 p-3 rounded-2xl shadow-inner border border-white/5 bg-white/[0.02]`}>
            {/* FIRST: PREMIUM AVATARS */}
            {PREMIUM_AVATARS.map(p => {
              const unlocked = isAvatarUnlocked(p.url);
              return (
                <button 
                  key={p.id} 
                  onClick={() => handleAvatarSelect(p.url)} 
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${user.avatar === p.url ? 'ring-2 ring-primary scale-110 z-10 shadow-neon' : 'hover:scale-105'} ${!unlocked ? 'opacity-40 grayscale' : ''}`}
                >
                  <img src={p.url} className="w-full h-full object-cover" alt="Avatar" />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <span className="text-[8px] font-black text-white">LV {p.minLevel}</span>
                    </div>
                  )}
                </button>
              );
            })}
            
            {/* THEN: CLASSIC EMOJIS */}
            {avatars.map(a => (
              <button 
                key={a} 
                onClick={() => handleAvatarSelect(a)} 
                className={`text-2xl p-2 rounded-xl transition-all ${user.avatar === a ? 'bg-primary/20 ring-2 ring-primary scale-110 z-10 shadow-neon' : 'hover:bg-white/5'}`}
              >
                {a}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic tracking-tight text-center">Desbloqueie novos avatares subindo de nível!</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-black text-sm uppercase italic">Série / Ano</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic tracking-tight">Muda a dificuldade</p>
            </div>
            <Tooltip text="Ajusta o nível dos exercícios (3º ao 9º ano)">
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)} 
                className="bg-[#020617] border border-white/10 text-white rounded-xl px-3 py-1.5 font-black uppercase text-xs shadow-glass focus:outline-none"
              >
                {['3º', '4º', '5º', '7º', '8º', '9º'].map(g => (
                  <option key={g} value={g} className="bg-[#020617] text-white">{g} ANO</option>
                ))}
              </select>
            </Tooltip>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-black text-sm uppercase italic">Cronômetro</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic tracking-tight">Tempo por questão</p>
            </div>
            <button onClick={() => toggle('timerEnabled')} className={`w-12 h-6 rounded-full transition-all relative ${settings?.timerEnabled ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.timerEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-black text-sm uppercase italic">Música de Fundo</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic tracking-tight">Clima agradável</p>
            </div>
            <button onClick={() => toggle('musicEnabled')} className={`w-12 h-6 rounded-full transition-all relative ${settings?.musicEnabled ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.musicEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          {settings?.timerEnabled && (
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[10px] font-black text-primary uppercase italic tracking-widest">
                <span>Duração</span>
                <span>{settings.timerSeconds} Segundos</span>
              </div>
              <input 
                type="range" min="5" max="30" step="5" 
                value={settings.timerSeconds} 
                onChange={(e) => setSettings(s => ({ ...s, timerSeconds: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
              />
            </div>
          )}
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-black text-sm uppercase italic tracking-tight">Múltipla Escolha</p>
            <button onClick={() => toggle('isMultipleChoice')} className={`w-12 h-6 rounded-full transition-all relative ${settings?.isMultipleChoice ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.isMultipleChoice ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-black text-sm uppercase italic tracking-tight">Efeitos Sonoros</p>
            <button onClick={() => toggle('soundEnabled')} className={`w-12 h-6 rounded-full transition-all relative ${settings?.soundEnabled ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.soundEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-black text-sm uppercase italic tracking-tight">Voz Sintetizada</p>
            <button onClick={() => toggle('voiceEnabled')} className={`w-12 h-6 rounded-full transition-all relative ${settings?.voiceEnabled ? 'bg-primary' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings?.voiceEnabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="border-t border-rose-500/30 pt-6 space-y-4">
          <p className="font-black text-xs uppercase italic tracking-widest text-rose-500">Área do Desenvolvedor</p>
          <div className="flex justify-between items-center bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
            <div>
              <p className="font-black text-sm uppercase italic tracking-tight text-rose-500">{isPremium ? '👑 Modo Admin/Premium Ativo' : '👤 Modo Usuário Comum'}</p>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest italic">Teste o app com privilégios de professor</p>
            </div>
            <button onClick={() => setIsPremium(!isPremium)} className={`w-12 h-6 rounded-full transition-all relative ${isPremium ? 'bg-rose-500' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPremium ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <button 
          onClick={async () => {
             const { data, error } = await supabase.from('turmas').select('*').limit(1);
             if (error) alert("❌ Erro Supabase: " + error.message);
             else alert("✅ Supabase Conectado! " + (data.length > 0 ? "Dados encontrados." : "Tabela vazia."));
          }}
          className="w-full p-4 bg-primary/10 border border-primary/30 text-primary font-black italic uppercase text-[10px] rounded-xl hover:bg-primary/20 transition-all tracking-widest"
        >
          Testar Conexão Supabase
        </button>

        <button onClick={async () => { 
          if(confirm("Deseja realmente sair e LIMPAR todos os dados de sessão local? (Isso resolve 99% dos erros de sincronização)")) { 
            onBack(); 
            setAuthLoading(true);
            localStorage.clear();
            sessionStorage.clear();
            await logout(); 
            window.location.href = window.location.origin;
          } 
        }} className="w-full p-4 border border-rose-500/30 text-rose-500 font-black italic uppercase text-xs rounded-xl hover:bg-rose-500/10 transition-all tracking-[0.1em]">
          Sair e Limpar Cache (Fix Sync)
        </button>

        <button onClick={() => { if(confirm("Deseja resetar todo seu progresso?")) resetProgress(); }} className="w-full p-4 border border-rose-500/30 text-rose-500 font-black italic uppercase text-xs rounded-xl hover:bg-rose-500/10 transition-all tracking-[0.1em]">
          Resetar Todo Progresso
        </button>
      </div>
    </div>
  );
};


// --- MAIN APP ---

// Module-level guard to prevent duplicate auth event processing
let globalSessionId = null;

const AppContent = () => {
  const {
    user, authLoading, setAuthLoading, xp, level, streak, grade, stats, missions, tabuadaBase, isPremium, turma, settings, claimedDaily,
    role, plan, setRole, setPlan,
    login, loginWithSession, setupProfile, logout, addXp, setAvatar, resetProgress, setGrade, setTabuadaBase, joinTurma, setIsPremium, setSettings, setClaimedDaily
  } = useGameState();

  const { toggleMusic, isPlaying: musicPlaying } = useMusicPlayer();

  const [view, setView] = React.useState(() => {
    // Busca inicial síncrona para evitar "flicker" de tela inicial
    return localStorage.getItem('math_adventure_last_view') || 'menu';
  });
  const [selectedModule, setSelectedModule] = React.useState(null);
  const [showSetup, setShowSetup] = React.useState(false);
  const [pendingSession, setPendingSession] = React.useState(null);
  const [showLevelUp, setShowLevelUp] = React.useState(false);
  const [prevLevel, setPrevLevel] = React.useState(level);

  // Level Up Watcher
  React.useEffect(() => {
    if (level > prevLevel && prevLevel > 0) {
      setShowLevelUp(true);
      if (settings?.soundEnabled) playSound.levelUp();
    }
    setPrevLevel(level);
  }, [level, prevLevel, settings?.soundEnabled]);


  // --- MOVED HOOKS (Ensuring they are called before any early returns) ---
  const [setupName, setSetupName] = React.useState('');
  const [setupGrade, setSetupGrade] = React.useState('3º');


  // Unlock AudioContext on first interaction
  React.useEffect(() => {
    const unlockAudio = () => {
      playSound.click(); 
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);
  const [setupRole, setSetupRole] = React.useState('student');
  const [selectedTurma, setSelectedTurma] = React.useState(null);
  const [setupAvatar, setSetupAvatar] = React.useState('👦');
  const [provaAtiva, setProvaAtiva] = React.useState(null);
  const [celebrationLevel, setCelebrationLevel] = React.useState(1);
  const [mascotMsg, setMascotMsg] = React.useState('Calculando...');
  const [isStarting, setIsStarting] = React.useState(false);

  React.useEffect(() => {
    const mottos = [
      'Você é fera!', 'Vamos bater o recorde?', 'Matemática é poder!', 
      'Rumo ao topo!', 'Pronto para o desafio?', 'O Robô confia em você!',
      'Hora de brilhar!', 'Level Up à vista!', 'Mentalidade de Mestre!'
    ];
    setMascotMsg(mottos[Math.floor(Math.random() * mottos.length)]);
    const interval = setInterval(() => {
      setMascotMsg(mottos[Math.floor(Math.random() * mottos.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Check for pending exam when turma is set
  React.useEffect(() => {
    if (turma && user && user.id) {
      rankingAPI.getProvasTurma(turma.id).then(({ data, error }) => {
        if (error) {
          console.error('Erro ao buscar provas:', error);
          return;
        }
        if (data && data.length > 0) {
          // Check if user already completed the latest prova
          rankingAPI.getResultadosProva(data[0].id).then(({ data: resultados, error: err }) => {
            if (err) {
              console.error('Erro ao buscar resultados da prova:', err);
              return;
            }
            const jaConcluiu = resultados?.some(r => r.aluno_id === user.id);
            if (!jaConcluiu) setProvaAtiva(data[0]);
          });
        }
      });
    }
  }, [turma, user?.id]);
  
  // --- PERSISTENCE LOGIC (Keep view on refresh) ---
  const [lastTurmaId, setLastTurmaId] = React.useState(null);

  React.useEffect(() => {
    if (user && !authLoading) {
      const savedView = localStorage.getItem(`math_adventure_view_${user.id}`);
      if (savedView && savedView !== view) {
        setView(savedView);
      }
      const savedTurmaId = localStorage.getItem(`math_adventure_turma_${user.id}`);
      if (savedTurmaId) {
        setLastTurmaId(savedTurmaId);
      }
    }
  }, [user?.id, authLoading]);

  // SAFE ROLE GUARD: Move state logic into useEffect to prevent render loops
  React.useEffect(() => {
    if (user?.role === 'student' && view === 'teacher') {
       setView('menu');
    }
  }, [user?.role, view]);

  React.useEffect(() => {
    if (view) {
      localStorage.setItem('math_adventure_last_view', view);
    }
    if (user && view && !authLoading && view !== 'setup') {
      localStorage.setItem(`math_adventure_view_${user.id}`, view);
    }
    if (user && selectedTurma) {
      localStorage.setItem(`math_adventure_turma_${user.id}`, selectedTurma.id);
    } else if (user && !selectedTurma && view === 'teacher') {
      localStorage.removeItem(`math_adventure_turma_${user.id}`);
    }
  }, [view, selectedTurma, user?.id, authLoading]);


  // Check for existing session on mount (handles OAuth redirect back)
  React.useEffect(() => {
    // Timeout de segurança (15s)
    const authTimeout = setTimeout(() => {
      setAuthLoading(false);
      console.warn("⚠️ Auth check timed out");
    }, 15000);

    const checkSession = async () => {
      const res = await authAPI.getSession();
      const session = res?.data?.session;
      if (session) {
        console.log("⚡ Sessão inicial encontrada:", session.user.id);
        if (window.location.hash) {
          window.history.replaceState(null, null, window.location.pathname);
        }
        await loginWithSession(session);
        setAuthLoading(false);
      } else {
        // Se não houver sessão imediata, o onAuthStateChange cuidará disso
        // mas damos um pequeno delay para o authLoading
        setTimeout(() => setAuthLoading(false), 1500);
      }
    };

    checkSession();

    const resAuth = authAPI.onAuthStateChange(async (event, session) => {
      console.log(`🔔 Evento Auth: ${event}`);

      if (event === 'SIGNED_IN' && session) {
        if (window.location.hash) {
          window.history.replaceState(null, null, window.location.pathname);
        }
        const meta = session.user.user_metadata || {};
        if (!meta.name) {
          setPendingSession(session);
          setShowSetup(true);
          setAuthLoading(false);
        } else {
          // Utiliza setTimeout para tirar do event loop do auth e prevenir deadlock do gotrue-js
          setTimeout(async () => {
            await loginWithSession(session);
            setAuthLoading(false);
            clearTimeout(authTimeout);
          }, 0);
        }
      } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
        console.log("👋 Usuário sem sessão");
        globalSessionId = null;
        setAuthLoading(false);
        clearTimeout(authTimeout);
        if (event === 'SIGNED_OUT') {
           setView('menu');
           setSelectedModule(null);
        }
      }
    });

    return () => {
       console.log("🧹 Limpando listeners de Autenticação");
       clearTimeout(authTimeout);
       if (resAuth?.data?.subscription) {
         resAuth.data.subscription.unsubscribe();
       }
    };
  }, []);

  // Realtime Kick Logic (Fase 4 - Auto-Boot)
  React.useEffect(() => {
    if (user && turma && view !== 'teacher') {
      const sub = rankingAPI.subscribeToTurma(turma.id, (payload) => {
        // Se o registro do aluno for deletado (Kicked)
        if (payload.eventType === 'DELETE' && payload.old.aluno_id === user.id) {
          alert("🚪 Você foi removido da turma pelo professor.");
          setTurma(null);
          setView('menu');
        }
      });
      return () => { if (sub) supabase.removeChannel(sub); };
    }
  }, [user?.id, turma?.id, view]);

  const handleSetupComplete = async (name, grade, avatar, chosenRole) => {
    if (pendingSession) {
      await setupProfile(name, grade, avatar, chosenRole);
      setPendingSession(null);
      if (chosenRole === 'teacher') setView('teacher');
    }
    setShowSetup(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Mascot expression="excited" message="Carregando o Universo..." />
      </div>
    );
  }

  const handleStartGame = (module = 'mixed') => {
    setSelectedModule(module);
    setIsStarting(true);
    setTimeout(() => {
      setView('play');
      setIsStarting(false);
    }, 2000);
  };

  if (!user && !showSetup) return <LoginScreen onLogin={(session) => loginWithSession(session)} />;

  // First-time OAuth setup (no name in metadata yet)
  if (showSetup) {
    const avatars = ['\ud83d\udc66','\ud83d\udc67','\ud83e\uddd2','\ud83e\uddd1','\ud83d\udc68','\ud83d\udc69','\ud83e\udd81','\ud83d\udc3c','\ud83e\udd8a','\ud83d\udc38','\ud83d\ude80','\u2b50','\ud83c\udfae','\ud83e\udd96'];
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 60% 0%, #1a1059 0%, #0a0a1a 60%)' }}>
        <div className="glass-card p-8 max-w-sm w-full space-y-6">
          <div className="text-center">
            <p className="text-4xl mb-2">{setupAvatar}</p>
            <h2 className="text-2xl font-black italic uppercase">Configure seu Perfil</h2>
            <p className="text-slate-400 text-xs">Conta Google conectada com sucesso!</p>
          </div>
          <input value={setupName} onChange={e => setSetupName(e.target.value)} placeholder="Seu nome completo" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full font-bold" />
          
          <div className="space-y-2">
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest text-center">Quem é você?</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSetupRole('student')}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${setupRole === 'student' ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
              >
                🧑‍🎓 ALUNO
              </button>
              <button 
                onClick={() => setSetupRole('teacher')}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${setupRole === 'teacher' ? 'border-accent bg-accent/10 text-accent' : 'border-white/5 text-slate-500 hover:border-white/20'}`}
              >
                👨‍🏫 PROFESSOR
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {avatars.map(a => <button key={a} onClick={() => setSetupAvatar(a)} className={`text-2xl p-1 rounded-xl ${setupAvatar === a ? 'bg-primary/30 border-2 border-primary' : 'hover:bg-white/5'}`}>{a}</button>)}
          </div>
          
          {setupRole === 'student' && (
            <div className="grid grid-cols-6 gap-1 animate-in fade-in slide-in-from-top-2">
              {['3º','4º','5º','7º','8º','9º'].map(g => <button key={g} onClick={() => setSetupGrade(g)} className={`py-2 text-xs rounded-xl font-black ${setupGrade === g ? 'bg-primary text-slate-900' : 'bg-white/5 text-slate-400'}`}>{g}</button>)}
            </div>
          )}

          <button disabled={setupName.length < 2} onClick={() => handleSetupComplete(setupName, setupGrade, setupAvatar, setupRole)} className="btn-primary w-full py-4 font-black italic uppercase text-lg shadow-neon">
            Começar Aventura →
          </button>
          <button onClick={async () => { await authAPI.signOut(); setShowSetup(false); setPendingSession(null); window.location.reload(); }} className="w-full mt-2 p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold uppercase tracking-widest text-[10px] rounded-xl border border-rose-500/20 transition-all">
            Sair e Usar Outra Conta
          </button>
        </div>
      </div>
    );
  }

  const handleClaimDaily = () => {
    if (claimedDaily) return;
    addXp(50);
    setClaimedDaily(true);
    alert("✨ Você ganhou o Bônus Diário de +50 XP!");
  };

  if (view === 'prova' && provaAtiva) {
    return <GameRoom
      user={user} xp={xp} level={level} streak={streak} 
      grade={provaAtiva.dificuldade || grade}
      mode={provaAtiva.tipo} settings={settings}
      addXp={() => {}} onBack={() => setView('menu')}
      stats={stats} tabuadaBase={tabuadaBase} setTabuadaBase={setTabuadaBase}
      modoProva={{ prova: provaAtiva, onConcluir: async (acertos, total, tempoGasto) => {
        const nota = total > 0 ? (acertos / total) * 100 : 0;
        await rankingAPI.submitResultadoProva(provaAtiva.id, user.id, user.name, nota, tempoGasto);
        setProvaAtiva(null);
        setView('menu');
        alert(`✅ Prova concluída! Sua nota: ${nota.toFixed(0)}/100`);
      }}}
    />;
  }
  const modules = [
    { id: 'soma', name: 'Soma (+)', tooltip: 'Soma básica até 100', icon: <Plus />, color: 'from-blue-500 to-indigo-600', grades: ['3º','4º','5º','7º','8º','9º'] },
    { id: 'subtracao', name: 'Subtração (-)', tooltip: 'Subtração e lógica negativa', icon: <ChevronRight />, color: 'from-rose-500 to-pink-600', grades: ['3º','4º','5º','7º','8º','9º'] },
    { id: 'multiplicacao', name: 'Multiplicação (*)', tooltip: 'Fatores avançados e tabuada rápida', icon: <Target />, color: 'from-amber-500 to-orange-600', grades: ['3º','4º','5º','7º','8º','9º'] },
    { id: 'divisao', name: 'Divisão (/)', tooltip: 'Divisões exatas e quocientes', icon: <ChevronRight />, color: 'from-emerald-500 to-teal-600', grades: ['3º','4º','5º','7º','8º','9º'] },
    { id: 'tabuada_pro', name: 'Tabuada 0-10', tooltip: 'Domine a tabuada de todos os números', icon: <Crown />, color: 'from-violet-500 to-purple-700', grades: ['3º','4º','5º','7º','8º','9º'] },
    { id: 'mixed', name: 'Mixed Adventure', tooltip: 'Todas as operações misturadas!', icon: <Star />, color: 'from-indigo-500 to-violet-600', grades: ['5º','7º','8º','9º'] },
    { id: 'porcentagem', name: 'Porcentagem (%)', tooltip: 'Cálculos de juros e descontos', icon: <Target />, color: 'from-cyan-500 to-blue-600', grades: ['8º', '9º'] },
    { id: 'area', name: 'Área (📐)', tooltip: 'Cálculo de superfícies e geometria', icon: <Globe />, color: 'from-orange-500 to-red-600', grades: ['9º'] },
    { id: 'fracoes', name: 'Frações (½)', tooltip: 'Operações com numeradores e denominadores', icon: <ChevronRight />, color: 'from-green-500 to-emerald-600', grades: ['7º', '8º', '9º'] },
    { id: 'decimais', name: 'Decimais (0,1)', tooltip: 'Números com vírgula e precisão', icon: <ChevronRight />, color: 'from-purple-500 to-fuchsia-600', grades: ['7º', '8º', '9º'] }
  ];

  if (view === 'play') {
    return <GameRoom 
      key={`play-${selectedModule}-${selectedModule === 'tabuada_pro' ? tabuadaBase : 0}`}
      user={user} xp={xp} level={level} streak={streak} grade={grade} 
      mode={selectedModule} settings={settings} 
      addXp={(amount, isCorrect, op) => {
        const result = addXp(amount, isCorrect, op);
        return result;
      }} 
      onBack={() => setView('menu')} 
      stats={stats} tabuadaBase={tabuadaBase} setTabuadaBase={setTabuadaBase} 
    />;
  }
  
  const isGameOrProva = view === 'play' || view === 'prova';

  return (
    <>
      <ParticleBackground />

      <AnimatePresence>
        {showLevelUp && (
          <LevelUpCelebration 
            level={level} 
            onComplete={() => setShowLevelUp(false)} 
          />
        )}
      </AnimatePresence>

      {/* Roteamento Principal */}
      <AnimatePresence mode="wait">
        {(() => {
          if (view === 'menu') return (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard 
                user={user} level={level} xp={xp} 
                regularCards={[
                  { name: "Soma (+)",       id: "soma",          emoji: "➕" },
                  { name: "Subtração (-)", id: "subtracao",     emoji: "➖" },
                  { name: "Multiplicação", id: "multiplicacao",  emoji: "✖️" },
                  { name: "Divisão (/)",   id: "divisao",       emoji: "➗" },
                  { name: "Porcentagem",    id: "porcentagem",    emoji: "📊" },
                  { name: "Frações",       id: "fracoes",       emoji: "🍕" },
                  { name: "Decimais",       id: "decimais",      emoji: "📐" },
                  { name: "Área",           id: "area",          emoji: "📏" },
                ]}
                handleStartGame={handleStartGame}
              />
              <BottomNav 
                view="menu" setView={setView} isPremium={isPremium} 
                settings={settings} setSettings={setSettings} logout={logout}
                toggleMusic={toggleMusic} musicPlaying={musicPlaying}
              />
            </motion.div>
          );
          
          if (view === 'ranking') return <motion.div key="ranking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020617] text-white overflow-y-auto pb-28"><RankingView user={user} xp={xp} level={level} stats={stats} turma={turma} joinTurma={joinTurma} streak={streak} onBack={() => { setView('menu'); setSelectedModule(null); }} /><BottomNav view="ranking" setView={setView} isPremium={isPremium} settings={settings} setSettings={setSettings} logout={logout} toggleMusic={toggleMusic} musicPlaying={musicPlaying} /></motion.div>;
          
          if (view === 'teacher') return <motion.div key="teacher" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020617] text-white overflow-y-auto pb-28"><TeacherDashboard user={user} plan={plan} isPremium={isPremium} streak={streak} onBack={() => { setView('menu'); setSelectedModule(null); }} selectedTurma={selectedTurma} setSelectedTurma={setSelectedTurma} lastTurmaId={lastTurmaId} /><BottomNav view="teacher" setView={setView} isPremium={isPremium} settings={settings} setSettings={setSettings} logout={logout} toggleMusic={toggleMusic} musicPlaying={musicPlaying} /></motion.div>;
          
          if (view === 'stats') return <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020617] text-white overflow-y-auto pb-28"><StatsView stats={stats} streak={streak} onBack={() => { setView('menu'); setSelectedModule(null); }} /><BottomNav view="stats" setView={setView} isPremium={isPremium} settings={settings} setSettings={setSettings} logout={logout} toggleMusic={toggleMusic} musicPlaying={musicPlaying} /></motion.div>;
          
          if (view === 'settings') return <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#020617] text-white overflow-y-auto pb-28"><SettingsView user={user} level={level} isPremium={isPremium} setIsPremium={setIsPremium} setAvatar={setAvatar} streak={streak} settings={settings} setSettings={setSettings} grade={grade} setGrade={setGrade} onBack={() => { setView('menu'); setSelectedModule(null); }} resetProgress={resetProgress} logout={logout} setAuthLoading={setAuthLoading} /><BottomNav view="settings" setView={setView} isPremium={isPremium} settings={settings} setSettings={setSettings} logout={logout} toggleMusic={toggleMusic} musicPlaying={musicPlaying} /></motion.div>;
          return null;
        })()}
      </AnimatePresence>


      <div className={`${isGameOrProva ? '' : 'hidden md:block'}`}>
         <Mascot floating expression="happy" message={mascotMsg} size="small" />
      </div>
    </>
  );
};

// --- GLOBAL SUB-COMPONENTS ---

const Dashboard = ({ user, level, xp, regularCards, handleStartGame }) => {
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", `${x}%`);
    e.currentTarget.style.setProperty("--y", `${y}%`);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-[#020617] text-white relative overflow-hidden pb-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1),transparent_50%)] pointer-events-none" />
      
      <main className="flex-1 w-full max-w-xl mx-auto p-6 relative z-10 flex flex-col items-center">
        {/* TOPO: AVATAR */}
        <div className="flex flex-col items-center mb-12 w-full mt-4">
          <div className="level-card-impact">
            <div className="level-card-inner" />
            
            <div className="flex items-center justify-between w-full mb-6">
               <div className="relative">
                <div 
                  className="avatar-container"
                  onMouseMove={handleMouseMove}
                >
                  <div className="avatar-ring">
                    <div className="avatar-inner">
                       {user?.avatar?.includes('.png') ? (
                         <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                       ) : (
                         <span className="text-9xl">{user?.avatar || '😁'}</span>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Nível Atual</span>
                <span className="text-level-giant">{level}</span>
              </div>
            </div>

            <div className="w-full mb-4">
              <div className="user-name mb-0.5">
                {user?.name || "Jogador"} <span className="status-dot"></span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md border border-cyan-400/20">
                    {getGamingTitle(level)}
                 </span>
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-end mb-1.5 px-0.5">
                <div className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
                  <TrendingUp size={12} className="text-cyan-400" />
                  Progresso de Nível
                </div>
                <div className="text-[10px] font-black text-cyan-400">
                  {Math.floor((xp / (level * 100)) * 100)}%
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5 border border-white/5 relative overflow-hidden shadow-inner p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((xp / (level * 100)) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-cyan-400 via-primary to-purple-600 rounded-full xp-shimmer"
                />
              </div>
              <div className="text-[9px] text-white/30 font-bold uppercase mt-2 tracking-widest text-right">
                {Math.floor(xp)} / {level * 100} XP total
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => handleStartGame('mixed')}
          className="w-full max-w-md cta-main mb-10 py-7 rounded-[28px] text-white flex flex-col items-center justify-center gap-1 border border-white/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-5xl drop-shadow-md mb-1">🚀</span>
          <span className="text-3xl font-black italic tracking-wide drop-shadow-lg">JOGAR AGORA</span>
        </motion.button>

        {/* MISSÕES */}
        <div className="w-full mb-8">
          <h3 className="text-xl font-extrabold text-white tracking-tight mb-5 px-1">Missões Mágicas</h3>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
            onClick={() => handleStartGame('tabuada_pro')}
            className="card-game highlight-card mb-4 p-6 flex flex-row items-center justify-between cursor-pointer w-full bg-gradient-to-br from-amber-400 to-orange-600 text-white border-2 border-yellow-300/60 ring-2 ring-yellow-300/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl -mr-14 -mt-14 pointer-events-none" />
            <div className="flex flex-col gap-1">
              <div className="bg-black/20 text-yellow-100 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest w-fit mb-1">⭐ Modo Destaque</div>
              <span className="text-3xl font-black italic drop-shadow-lg">Tabuada 0–10</span>
              <span className="text-sm opacity-80 font-medium">Multiplicação organizada, passo a passo</span>
            </div>
            <span className="text-6xl drop-shadow-md">⭐</span>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {regularCards.map((item, i) => {
              const opClass = item.id === 'soma' ? 'card-soma' : 
                            item.id === 'subtracao' ? 'card-subtracao' :
                            item.id === 'multiplicacao' ? 'card-multiplicacao' :
                            item.id === 'divisao' ? 'card-divisao' : '';
              
              return (
                <motion.div
                  key={item.id + i}
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: (i + 1) * 0.05 }}
                  onClick={() => handleStartGame(item.id)}
                  className={`card-game p-5 flex flex-col justify-between cursor-pointer min-h-[130px] ${opClass} text-white relative border-white/5 shadow-neon-soft`}
                >
                  <div className="text-3xl mb-2 drop-shadow-lg">{item.emoji}</div>
                  <span className="font-extrabold text-base leading-tight tracking-tight drop-shadow-md uppercase italic">{item.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

const BottomNav = ({ view: activeView, setView, isPremium, settings, setSettings, logout, toggleMusic, musicPlaying }) => {
  const nav = [
    { id: 'menu',    icon: '🏠', label: 'Início',   active: activeView === 'menu' },
    { id: 'ranking', icon: '🏆', label: 'Ranking',  active: activeView === 'ranking' },
    ...(isPremium ? [{ id: 'teacher', icon: '👑', label: 'Professor', active: activeView === 'teacher', gold: true }] : []),
    { id: 'settings',icon: '⚙️', label: 'Perfil',   active: activeView === 'settings' },
  ];
  return (
    <div className="fixed bottom-0 left-0 w-full glass rounded-t-3xl pt-2 pb-4 px-4 flex justify-around items-center z-50">
      {nav.map(n => (
        <button
          key={n.id}
          onClick={() => { if (settings?.soundEnabled) playSound.click(); setView(n.id); }}
          className={`flex flex-col items-center p-2 transition transform hover:scale-110 ${
            n.active ? 'text-cyan-400' : n.gold ? 'text-amber-500 hover:text-amber-300' : 'text-gray-400 hover:text-white'
          }`}
        >
          <span className="text-2xl mb-1">{n.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide">{n.label}</span>
        </button>
      ))}
      <button
        onClick={toggleMusic}
        className={`flex flex-col items-center p-2 transition transform hover:scale-110 music-btn ${musicPlaying ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
      >
        <span className="text-2xl mb-1">{musicPlaying ? '🔊' : '🔇'}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide">Música</span>
      </button>
      <button
        onClick={() => logout()}
        className="flex flex-col items-center p-2 text-red-400 hover:text-red-300 transition transform hover:scale-110"
      >
        <span className="text-2xl mb-1">🚪</span>
        <span className="text-[10px] font-bold uppercase tracking-wide">Sair</span>
      </button>
    </div>
  );
};


// --- MAIN APP ENTRY ---

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/privacidade" element={<Privacy />} />
        <Route path="*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
