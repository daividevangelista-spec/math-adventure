import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import { authAPI } from '../lib/supabase';
import { Mascot } from './Mascot';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LoginScreen = () => {
  const [mode, setMode] = React.useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const clearFeedback = () => { setError(''); setSuccess(''); };

  const handleGoogle = async () => {
    setLoading(true);
    clearFeedback();
    try {
      const { error } = await authAPI.signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError('Erro ao conectar com Google: ' + err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    clearFeedback();

    if (!email.includes('@')) { setError('Informe um email válido.'); return; }
    if (password.length < 6) { setError('A senha precisa ter ao menos 6 caracteres.'); return; }
    if (mode === 'signup' && name.trim().length < 2) { setError('Informe seu nome completo.'); return; }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await authAPI.signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await authAPI.signUp(email, password, name.trim());
        if (error) throw error;
        setSuccess('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (err) {
      setError(err.message.includes('Invalid login') ? 'Email ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    clearFeedback();
    if (!email.includes('@')) { setError('Informe seu email.'); return; }
    setLoading(true);
    try {
      const { error } = await authAPI.resetPassword(email);
      if (error) throw error;
      setSuccess('Link de recuperação enviado! Verifique seu email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020617] font-sans">
      {/* AAA DYNAMIC BACKGROUND BLOBS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-primary/40 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-accent/40 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-success/30 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* LOGO & MASCOT AREA */}
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4"
          >
             <GraduationCap size={64} className="text-primary drop-shadow-neon" />
          </motion.div>
          <h1 className="game-title text-4xl mb-1 mt-2">Math Adventure<span className="text-primary italic">+</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic opacity-70">SaaS Premium Learning</p>
        </div>

        {/* LOGIN CARD */}
        <div className="glass-card-neon p-8 shadow-aaa backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative z-10 space-y-6"
            >
              {/* HEADER MODE */}
              <div className="text-center">
                <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                  {mode === 'signin' ? 'Bem-vindo de Volta' : mode === 'signup' ? 'Nova Conta' : 'Recuperar Chave'}
                </h2>
              </div>

              {/* GOOGLE BUTTON */}
              {mode !== 'reset' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 font-black uppercase text-xs py-4 rounded-2xl shadow-xl hover:bg-slate-50 transition-all"
                >
                  <GoogleIcon />
                  {loading ? 'CONECTANDO...' : 'Entrar com Google'}
                </motion.button>
              )}

              {mode !== 'reset' && (
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-600 text-[9px] font-black uppercase tracking-widest">ou use seu email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>
              )}

              {/* FORM AI-POWERED */}
              <form onSubmit={mode === 'reset' ? handleReset : handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic ml-1">Nome Completo</label>
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="COMO DEVEMOS TE CHAMAR?"
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-5 py-3.5 font-bold text-xs focus:border-primary/50 focus:outline-none transition-all placeholder:text-slate-700 uppercase"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic ml-1">Email de Acesso</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="EX: SEU@EMAIL.COM"
                      className="w-full bg-[#020617]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 font-bold text-xs focus:border-primary/50 focus:outline-none transition-all placeholder:text-slate-700 uppercase"
                      required
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic ml-1">Senha Secreta</label>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#020617]/50 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 font-bold text-xs focus:border-primary/50 focus:outline-none transition-all placeholder:text-slate-700"
                        required
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* ALERTS FEEDBACK */}
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-error/10 border border-error/20 p-4 rounded-xl">
                      <AlertCircle size={18} className="text-error shrink-0" />
                      <p className="text-error text-[10px] font-black uppercase leading-tight">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 bg-success/10 border border-success/20 p-4 rounded-xl">
                      <CheckCircle size={18} className="text-success shrink-0" />
                      <p className="text-success text-[10px] font-black uppercase leading-tight">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SUBMIT BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="btn-premium btn-primary w-full shadow-neon font-black italic mt-4 h-[60px]"
                >
                  {loading ? (
                     <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        CARREGANDO...
                     </div>
                  ) : mode === 'signin' ? ' ENTRAR NO JOGO →' : mode === 'signup' ? 'CRIAR MEU AVATAR →' : 'ENVIAR LINK →'}
                </motion.button>
              </form>

              {/* FOOTER NAV */}
              <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                {mode === 'signin' ? (
                  <>
                    <button onClick={() => setMode('signup')} className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors tracking-widest italic group">
                      Ainda não é um mestre? <span className="text-primary underline group-hover:text-white transition-colors">Cadastre-se</span>
                    </button>
                    <button onClick={() => setMode('reset')} className="text-[9px] font-bold uppercase text-slate-600 hover:text-slate-400 transition-colors tracking-wider">
                      Esqueceu sua senha?
                    </button>
                  </>
                ) : (
                  <button onClick={() => setMode('signin')} className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors tracking-widest italic">
                    ← Voltar para o Login
                  </button>
                )}
                
                <div className="pt-2 text-center border-t border-white/5 mt-2">
                  <Link to="/privacidade" className="text-[9px] font-black uppercase text-slate-500 hover:text-primary transition-all tracking-[0.2em] italic">
                    Política de Privacidade
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* VERSION BADGE */}
        <div className="mt-8 text-center">
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">AAA PREMIUM ENVIRONMENT v2.1.0</p>
        </div>
      </motion.div>

      {/* FLOATING MASCOT INTERACTION */}
      <div className="fixed bottom-10 right-10 scale-90 md:scale-110 pointer-events-auto">
         <Mascot 
           expression={loading ? 'thinking' : success ? 'excited' : error ? 'sad' : 'happy'} 
           message={loading ? 'Sincronizando...' : success ? 'Sucesso!' : error ? 'Ops...' : 'Pronto para o desafio?'} 
           side="right"
           floating
         />
      </div>
    </div>
  );
};

export default LoginScreen;
