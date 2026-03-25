import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jxfgzufxnwnzoceeyaou.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4Zmd6dWZ4bnduem9jZWV5YW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTM5NzQsImV4cCI6MjA4OTU4OTk3NH0.fjoClcVyb4jGYg_dYLvfPfADBJF1eC0B0YIcSD0SSKM'

console.log("🛠️ Configuração Supabase: Hardcoded (Final Fix)");

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ranking & Turma Helpers
export const rankingAPI = {
  // Turmas
  getTurma: async (codigo) => {
    const { data, error } = await supabase
      .from('turmas')
      .select('*, stats_turma(*)')
      .eq('codigo', codigo)
      .single();
    return { data, error };
  },

  listMyTurmas: async (profId) => {
    const { data, error } = await supabase
      .from('turmas')
      .select('*, stats_turma(*)')
      .eq('prof_id', profId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createTurma: async (nome, profId) => {
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from('turmas')
      .insert([{ codigo, nome_turma: nome, prof_id: profId, media_turma: 0 }])
      .select()
      .single();
    return { data, error };
  },

  updateTurma: async (id, updates) => {
    const { data, error } = await supabase
      .from('turmas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  deleteTurma: async (id) => {
    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Student Management
  kickStudent: async (turmaId, studentId) => {
    const { error } = await supabase
      .from('stats_turma')
      .delete()
      .eq('turma_id', turmaId)
      .eq('aluno_id', studentId);
    return { error };
  },

  updateStudentStats: async (turmaId, studentId, studentName, xp, acertos, totalOps = 0, status = 'accepted') => {
    const { error } = await supabase
      .from('stats_turma')
      .upsert({ 
        turma_id: turmaId, 
        aluno_id: studentId, 
        nome_aluno: studentName,
        status, // 'pending' ou 'accepted'
        xp, 
        acertos_ops: acertos,
        total_ops: totalOps,
        last_update: new Date().toISOString()
      }, { onConflict: 'turma_id,aluno_id' });
    return { error };
  },

  approveStudent: async (turmaId, studentId) => {
    const { error } = await supabase
      .from('stats_turma')
      .update({ status: 'accepted' })
      .eq('turma_id', turmaId)
      .eq('aluno_id', studentId);
    return { error };
  },

  // Busca Inteligente de Perfis
  searchProfiles: async (query) => {
    if (!query) return { data: [] };
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .or(`name.ilike.%${query}%,id.eq.${query.length > 30 ? query : '00000000-0000-0000-0000-000000000000'}`)
      .limit(10);
    return { data, error };
  },

  // Realtime Subscription
  subscribeToTurma: (turmaId, callback) => {
    return supabase
      .channel(`turma-${turmaId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stats_turma',
        filter: `turma_id=eq.${turmaId}`
      }, callback)
      .subscribe();
  },

  // XP e Ranking
  getGlobalRanking: async () => {
    // Fetch directly from profiles for the real-time global ladder
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, xp, level, avatar_url')
      .order('xp', { ascending: false })
      .limit(20);
    return { data, error };
  },

  incrementStats: async (alunoId, xp, correct, total, turmaId = null) => {
    const { error } = await supabase.rpc('increment_student_stats', {
      aluno_id_in: alunoId,
      xp_to_add: xp,
      correct_to_add: correct,
      total_to_add: total,
      turma_id_in: turmaId
    });
    return { error };
  },

  logActivity: async (alunoId, nomeAluno, turmaId, tipo, descricao, valor = {}) => {
    const { error } = await supabase
      .from('student_activity')
      .insert([{
        aluno_id: alunoId,
        nome_aluno: nomeAluno,
        turma_id: turmaId,
        tipo,
        descricao,
        valor
      }]);
    return { error };
  },

  getRecentActivity: async (turmaId, limit = 20) => {
    const { data, error } = await supabase
      .from('student_activity')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  subscribeToActivity: (turmaId, callback) => {
    return supabase
      .channel(`activity-${turmaId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'student_activity',
        filter: `turma_id=eq.${turmaId}`
      }, callback)
      .subscribe();
  },

  // Provas (Exams)
  createProva: async (turmaId, titulo, tipo, qtdQuestoes, tempoLimite, dificuldade = '3º', formato = 'multipla_escolha', allowRetry = true) => {
    const { data, error } = await supabase
      .from('provas')
      .insert([{ 
        turma_id: turmaId, 
        titulo, 
        tipo, 
        quantidade_questoes: qtdQuestoes, 
        tempo_limite: tempoLimite,
        dificuldade,
        formato,
        allow_retry: allowRetry,
        is_active: true
      }])
      .select()
      .single();
    return { data, error };
  },

  updateProva: async (provaId, updates) => {
    const { data, error } = await supabase
      .from('provas')
      .update(updates)
      .eq('id', provaId)
      .select()
      .single();
    return { data, error };
  },

  getProvasTurma: async (turmaId) => {
    const { data, error } = await supabase
      .from('provas')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  deleteProva: async (id) => {
    const { error } = await supabase
      .from('provas')
      .delete()
      .eq('id', id);
    return { error };
  },

  deleteProva: async (id) => {
    const { error } = await supabase
      .from('provas')
      .delete()
      .eq('id', id);
    return { error };
  },

  submitResultadoProva: async (provaId, alunoId, nomeAluno, nota, tempoGasto) => {
    const { error } = await supabase
      .from('resultados_prova')
      .upsert({
        prova_id: provaId,
        aluno_id: alunoId,
        nome_aluno: nomeAluno,
        nota,
        tempo_gasto: tempoGasto
      }, { onConflict: 'prova_id,aluno_id' });
    return { error };
  },

  getResultadosProva: async (provaId) => {
    const { data, error } = await supabase
      .from('resultados_prova')
      .select('*')
      .eq('prova_id', provaId)
      .order('nota', { ascending: false })
      .order('tempo_gasto', { ascending: true });
    return { data, error };
  }
};

// Auth API
export const authAPI = {
  signUp: async (email, password, name, grade = '3º') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, grade, avatar: '👦', isPremium: false }
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    console.log("🔐 Tentativa de login iniciada...");
    const start = Date.now();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const end = Date.now();
    console.log(`⏱️ Tempo de resposta do login: ${end - start}ms`);
    return { data, error };
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: import.meta.env.VITE_APP_URL,
        queryParams: { prompt: 'select_account' }
      }
    });
    return { data, error };
  },

  signInWithMicrosoft: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: window.location.origin }
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  updateProfile: async (updates) => {
     // 1. Atualiza metadados de Auth
     const { data, error: authError } = await supabase.auth.updateUser({ data: updates });
     if (authError) return { error: authError };

     // 2. Atualiza tabela Profiles para persistência e RLS
     const { data: { user } } = await supabase.auth.getUser();
     if (user) {
       await supabase.from('profiles').upsert({
         id: user.id,
         name: updates.name,
         grade: updates.grade,
         avatar: updates.avatar,
         role: updates.role,
         plan: updates.plan,
         is_premium: updates.isPremium
       });
     }
     return { data, error: null };
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    return { error };
  },

  getOrCreateProfile: async (user, retries = 2) => {
    // Detecção aprimorada de Admin (Email, Metadata ou ID específico)
    const isAdmin = 
      user.email?.toLowerCase().includes('admin') || 
      user.user_metadata?.role === 'admin' ||
      user.id === 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691';
    console.log(`🔍 SYNC: ${user.id} (Admin: ${isAdmin})`);
    
    for (let i = 0; i <= retries; i++) {
        // ... (resto do loop)
      try {
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

        if (error) throw error;
        if (profile) return profile;

        // Criar perfil se não existir
        const newProfile = {
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          role: user.user_metadata?.role || (isAdmin ? 'teacher' : 'student'),
          plan: user.user_metadata?.plan || (isAdmin ? 'premium' : 'free')
        };

        await supabase.from('profiles').upsert(newProfile);
        return newProfile;

      } catch (err) {
        console.warn(`⚠️ Falha ${i+1}/3: ${err.message}`);
        // Se for admin e falhou a primeira vez, já retorna fallback pra não travar
        if (isAdmin || i === retries) {
          return { 
            id: user.id, 
            name: isAdmin ? 'Daivid Evang' : 'Usuário (Modo Seguro)', 
            role: isAdmin ? 'teacher' : 'student', 
            plan: isAdmin ? 'premium' : 'free', 
            isOffline: true 
          };
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
};
