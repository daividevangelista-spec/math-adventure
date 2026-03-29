import * as React from 'react';
import { rankingAPI, authAPI, supabase } from '../lib/supabase';
import { NotificationService } from '../lib/notifications';

// Global guard to prevent parallel syncs across React re-mounts
let globalLoginSyncing = false;

export const useGameState = () => {
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [xp, setXp] = React.useState(0);
  const [level, setLevel] = React.useState(1);
  const [streak, setStreak] = React.useState(0);
  const [grade, setGrade] = React.useState('3º');
  const [tabuadaBase, setTabuadaBase] = React.useState(0);
  const [isPremium, setIsPremium] = React.useState(false);
  const [turma, setTurma] = React.useState(null);
  const [lastLogin, setLastLogin] = React.useState(null);
  const [badges, setBadges] = React.useState([]);
  const [role, setRole] = React.useState('student');
  const [plan, setPlan] = React.useState('free');
  const [claimedDaily, setClaimedDaily] = React.useState(false);
  const [settings, setSettings] = React.useState({
    timerEnabled: true,
    timerSeconds: 15,
    soundEnabled: true,
    voiceEnabled: true,
    musicEnabled: true,
    isMultipleChoice: false
  });
  const [stats, setStats] = React.useState({
    errors: {},
    totalQuestions: 0,
    correctQuestions: 0,
    history: []
  });
  const [missions, setMissions] = React.useState([
    { id: 1, desc: 'Acertar 10 questões', prog: 0, target: 10, reward: 50, done: false },
    { id: 2, desc: 'Fazer 5 tabuadas', prog: 0, target: 5, reward: 100, done: false },
    { id: 3, desc: 'Chegar ao streak 5', prog: 0, target: 5, reward: 80, done: false }
  ]);

  // Load from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('math_adventure_v2');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.user) {
          setUser(data.user);
          setXp(data.xp || 0);
          setLevel(data.level || 1);
          setStreak(data.streak || 0);
          setGrade(data.grade || '3º');
          setTabuadaBase(data.tabuadaBase || 0);
          setIsPremium(data.isPremium || false);
          setTurma(data.turma || null);
          setLastLogin(data.lastLogin || null);
          setBadges(data.badges || []);
          setClaimedDaily(data.claimedDaily || false);
          setSettings(data.settings || { timerEnabled: true, timerSeconds: 15, isMultipleChoice: true, soundEnabled: true, voiceEnabled: false });
          setStats(data.stats || { errors: {}, totalQuestions: 0, correctQuestions: 0, history: [] });
          setMissions(data.missions || []);
          setRole(data.role || 'student');
          setPlan(data.plan || 'free');
        } else {
           setSettings({ timerEnabled: true, timerSeconds: 15, isMultipleChoice: true, soundEnabled: true, voiceEnabled: false });
        }
      } else {
         setSettings({ timerEnabled: true, timerSeconds: 15, isMultipleChoice: true, soundEnabled: true, voiceEnabled: false });
      }
    } catch (e) {
      console.error("Failed to load state", e);
      localStorage.removeItem('math_adventure_v2');
    }
  }, []);

  // Save to localStorage keyed by user id
  React.useEffect(() => {
    if (user) {
      const key = `math_adventure_${user.id}`;
      const data = { user, xp, level, streak, grade, stats, missions, tabuadaBase, isPremium, turma, lastLogin, badges, settings, claimedDaily, role, plan };
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem('math_adventure_v2', JSON.stringify(data));
    }
  }, [user, xp, level, streak, grade, stats, missions, tabuadaBase, isPremium, turma, lastLogin, badges, settings, claimedDaily, role, plan]);

  React.useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      const last = lastLogin; // lastLogin is already in state from localStorage
      
      if (last === today) return;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (last === yesterdayStr) {
        setStreak(s => s + 1);
      } else if (last) {
        setStreak(1);
      } else {
        setStreak(1);
      }

      setLastLogin(today);
      setClaimedDaily(false);
      setXp(x => x + 50);
      NotificationService.notify("Bônus de Streak! 🔥", "Você ganhou +50 XP por voltar hoje!");
    }
  }, [user]); // Run once when user is loaded

  // Sync Realtime com Supabase Turma (Sincronização passiva para ranking)
  React.useEffect(() => {
    if (user && turma && turma.status === 'accepted') {
      const sub = rankingAPI.subscribeToTurma(turma.id, (payload) => {
        // Opcional: Re-fetch ou atualizar estado local se necessário
      });
      return () => { if(sub) supabase.removeChannel(sub); };
    }
  }, [user, turma]);

  const joinTurma = async (codigo) => {
    const { data, error } = await rankingAPI.getTurma(codigo);
    if (data) {
      setTurma(data);
      return { success: true };
    }
    return { success: false, error };
  };

  const loginWithSession = async (session) => {
    if (!session || globalLoginSyncing) {
      if (globalLoginSyncing) console.log("⏳ Sync já em progresso, ignorando chamada duplicada.");
      return;
    }
    globalLoginSyncing = true;
    
    try {
      const uid = session.user.id;
      const meta = session.user.user_metadata || {};
      
      console.log("🚀 Iniciando loginWithSession para:", uid);
      
      const profile = await authAPI.getOrCreateProfile(session.user);
      
      // Admin Override & Fallback Logic
      const adminEmails = [
        'daivid.evangelista@edu.mt.gov.br',
        'francislaine.conrado@edu.mt.gov.br'
      ];
      const userEmail = session.user.email?.toLowerCase();
      const isAdminEmail = userEmail?.includes('admin') || adminEmails.includes(userEmail);
      
      const role = (isAdminEmail || profile?.role === 'teacher') ? 'teacher' : (profile?.role || 'student');
      const plan = (isAdminEmail || profile?.plan === 'premium' || meta.isPremium) ? 'premium' : 'free';
      const name = profile?.name || meta.name || session.user.email?.split('@')[0] || 'Usuário';
      const avatar = profile?.avatar_url || meta.avatar || '👦';
      const schoolGrade = profile?.grade || meta.grade || '3º';
      const premiumFlag = plan === 'premium';

      // Load persisted game state for this user
      const key = `math_adventure_${uid}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          const highestXp = Math.max(data.xp || 0, profile?.xp || 0);
          const highestLevel = Math.max(data.level || 1, profile?.level || 1);
          setXp(highestXp);
          setLevel(highestLevel);
          setStreak(data.streak || 0);
          setTabuadaBase(data.tabuadaBase || 0);
          setTurma(data.turma || null);
          setBadges(data.badges || []);
          setClaimedDaily(data.claimedDaily || false);
          setMissions(data.missions || missions);
          setStats(data.stats || { errors: {}, totalQuestions: 0, correctQuestions: 0, history: [] });
          setSettings(data.settings || { timerEnabled: true, timerSeconds: 15, isMultipleChoice: true, soundEnabled: true, voiceEnabled: false });
        }
      } catch (e) { /* ignore */ }

      setUser({ id: uid, name, avatar, role, plan });
      setGrade(schoolGrade);
      setRole(role);
      setPlan(plan);
      setIsPremium(premiumFlag);

      // Refresh Turma Status from DB (SaaS flow)
      if (uid) {
        try {
          const { data: membership, error: memberError } = await supabase
            .from('stats_turma')
            .select('turma_id, status')
            .eq('aluno_id', uid)
            .maybeSingle();
          
          if (membership && !memberError) {
            const { data: turmaInfo } = await supabase
              .from('turmas')
              .select('nome_turma, codigo')
              .eq('id', membership.turma_id)
              .maybeSingle();

            if (turmaInfo) {
              setTurma({
                id: membership.turma_id,
                nome_turma: turmaInfo.nome_turma,
                codigo: turmaInfo.codigo,
                status: membership.status
              });
            }
          }
        } catch (err) {
          console.warn("⚠️ Falha ao sincronizar dados da turma:", err.message);
        }
      }
    } catch (err) {
      console.error("🔥 Erro inesperado no loginWithSession:", err);
    } finally {
      globalLoginSyncing = false;
      setAuthLoading(false);
      console.log("🏁 Finalizado loginWithSession");
    }
  };

  const login = (name, schoolGrade = '3º', avatar = '👦') => {
    const newUser = { id: 'user_' + Date.now(), name, avatar };
    setUser(newUser);
    setGrade(schoolGrade);
  };

  const setupProfile = async (name, schoolGrade, avatar = '👦', chosenRole = 'student') => {
    const { error } = await authAPI.updateProfile({ 
      name, 
      grade: schoolGrade, 
      avatar, 
      isPremium: chosenRole === 'teacher', 
      role: chosenRole, 
      plan: 'free' 
    });
    if (!error) {
      setRole(chosenRole);
      setPlan('free');
      if (chosenRole === 'teacher') setIsPremium(true);
      setUser(prev => ({ ...prev, name, avatar, role: chosenRole, plan: 'free' }));
      setGrade(schoolGrade);
    }
  };

  const setAvatar = (newAvatar) => {
    setUser(prev => ({ 
      ...prev, 
      avatar: newAvatar, 
      lastAvatarChange: Date.now() 
    }));
  };

  const addXp = (amount, isCorrect = true, operation = 'soma') => {
    let bonus = streak >= 5 ? 5 : 0;
    const gained = amount + (isCorrect ? bonus : 0);
    const totalXp = xp + gained;
    
    setStats(prev => {
      const newErrors = { ...prev.errors };
      if (!isCorrect) newErrors[operation] = (newErrors[operation] || 0) + 1;
      return {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        correctQuestions: prev.correctQuestions + (isCorrect ? 1 : 0),
        errors: newErrors,
        history: [{ op: operation, correct: isCorrect, time: Date.now() }, ...prev.history].slice(0, 50)
      };
    });

    setMissions(prev => prev.map(m => {
      if (m.done) return m;
      let newProg = m.prog;
      if (m.id === 1 && isCorrect) newProg++;
      if (m.id === 2 && isCorrect && (operation === 'multiplicacao' || operation === 'tabuada_pro')) newProg++;
      if (m.id === 3 && streak >= 5) newProg = 5;
      return { ...m, prog: newProg, done: newProg >= m.target };
    }));

    if (isCorrect) setStreak(s => s + 1);
    else setStreak(0);

    let newXp = totalXp;
    let newLevel = level;
    let hasLeveledUp = false;

    // Check multiple level ups if enough XP is gained (e.g. from a big mission)
    while (newXp >= newLevel * 100) {
      newXp -= newLevel * 100;
      newLevel += 1;
      hasLeveledUp = true;
    }

    setXp(newXp);
    
    // Sincronização Atômica com Supabase
    if (user?.id) {
        rankingAPI.incrementStats(user.id, gained, isCorrect ? 1 : 0, 1, turma?.id);
        
        // Log de Atividade (apenas eventos relevantes para não floodar)
        if (isCorrect && gained >= 10) {
            rankingAPI.logActivity(user.id, user.name, turma?.id, 'xp_gain', `Ganhou ${gained} XP em ${operation}`, { amount: gained, op: operation });
        }
    }

    if (hasLeveledUp) {
      if (user?.id) {
          rankingAPI.logActivity(user.id, user.name, turma?.id, 'level_up', `Subiu para o Nível ${newLevel}!`, { level: newLevel });
      }
      setLevel(newLevel);
      return { leveledUp: true, newLevel };
    }
    return { leveledUp: false };
  };

  const resetProgress = () => {
    localStorage.removeItem('math_adventure_v2');
    window.location.reload();
  };

  return {
    user, authLoading, setAuthLoading, xp, level, streak, grade, stats, missions, tabuadaBase, isPremium, turma, settings, claimedDaily,
    role, plan, setRole, setPlan,
    login, loginWithSession, setupProfile,
    logout: async () => { 
      try { 
        setAuthLoading(true);
        await authAPI.signOut();
      } catch (e) { 
        console.error("Erro no signOut:", e); 
      }
      setUser(null); 
      setTurma(null);
      localStorage.clear(); 
      sessionStorage.clear();
    },
    addXp, setAvatar,
    resetProgress, setGrade, setTabuadaBase, joinTurma, setIsPremium, setSettings, setClaimedDaily
  };
};
