import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../lib/supabase";
import { Mail, Lock, Chrome, ArrowRight, Star, Users, CheckCircle } from "lucide-react";

// Animated floating particle for the left panel
const Orb = ({ className, delay = 0 }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      y: [0, -30, 0], 
      x: [0, 15, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1]
    }}
    transition={{ 
      duration: 6 + Math.random() * 4, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: delay 
    }}
    className={`absolute rounded-full bg-gradient-to-tr from-cyan-400/20 to-purple-600/20 backdrop-blur-xl border border-white/10 ${className}`}
  />
);

const FeatureChip = ({ icon: Icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group"
  >
    <Icon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{text}</span>
  </motion.div>
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [message, setMessage] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return setError("Preencha todos os campos");
    setLoading(true); setError(""); setMessage("");
    const { error } = await authAPI.signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!acceptedTerms) return setError("🤝 Você precisa aceitar os Termos e Privacidade.");
    if (!email || !password) return setError("Preencha todos os campos");
    setLoading(true); setError(""); setMessage("");
    const { error } = await authAPI.signUp(email, password);
    if (error) setError(error.message);
    else setMessage("✅ Conta criada! Verifique seu email.");
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!email) return setError("Digite seu email");
    setLoading(true); setError(""); setMessage("");
    const { error } = await authAPI.resetPassword(email);
    if (error) setError(error.message);
    else setMessage("✅ Link enviado! Verifique sua caixa de entrada.");
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError("");
    const { error } = await authAPI.signInWithGoogle();
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="split-layout text-white">
      
      {/* ═══════════════════════════════════════════
          LEFT SIDE (MARKETING / IMPACTO)
      ═══════════════════════════════════════════ */}
      <div className="split-left hidden md:flex">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[#020617] overflow-hidden">
          <Orb className="w-64 h-64 -top-20 -left-20" delay={0} />
          <Orb className="w-96 h-96 -bottom-32 -right-32" delay={2} />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 max-w-xl px-12 space-y-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.3)] mb-8"
          >
            <span className="text-3xl font-black italic text-white">M+</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              className="text-6xl font-black leading-[1.1] tracking-tighter"
            >
              Domine a <br />
              <span className="text-cyan-400 underline decoration-cyan-400/30">Matemática</span> <br />
              de Forma <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Divertida</span>
            </motion.h1>

            <motion.p
              className="text-xl text-slate-400 leading-relaxed font-medium"
            >
              Aprenda jogando, evolua todos os dias e desafie seus alunos com um sistema gamificado de última geração.
            </motion.p>
          </div>

          {/* Social Proof Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {['👦','👧','👨','👩'][i-1]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-black uppercase text-white tracking-widest">+ 12.000 Alunos Ativos</p>
                <div className="flex gap-0.5 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <span className="ml-2 text-white/60 text-[10px] font-bold">4.9/5 AVALIAÇÃO</span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-300 italic text-sm leading-relaxed border-l-2 border-cyan-400/50 pl-4 py-1">
              "Meus alunos evoluíram em semanas! O sistema de XP realmente motiva o aprendizado constante."
              <span className="block not-italic font-bold text-xs text-cyan-400 mt-1 uppercase tracking-widest">— Professora Ana, 5º Ano</span>
            </p>
          </motion.div>

          {/* Features Pills */}
          <div className="grid grid-cols-2 gap-3">
            <FeatureChip icon={Users} text="Ranking Global" delay={0.8} />
            <FeatureChip icon={CheckCircle} text="Tabuada 0–10" delay={0.9} />
            <FeatureChip icon={ArrowRight} text="XP e Níveis" delay={1.0} />
            <FeatureChip icon={Star} text="Missões Diárias" delay={1.1} />
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT SIDE (LOGIN FORM)
      ═══════════════════════════════════════════ */}
      <div className="split-right flex-1 flex flex-col items-center justify-center">
        {/* Mobile Background Elements */}
        <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none">
          <div className="bg-mobile" />
          <div className="glow-bg -top-20 -left-20 opacity-40" />
          <div className="glow-bg -bottom-40 -right-20 opacity-30" style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.3), transparent)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md space-y-8 px-6 relative z-30"
        >
          {/* Header Mobile Only */}
          <div className="text-center md:hidden mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)] mx-auto mb-6">
               <span className="text-4xl font-black italic text-white">M+</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Math Adventure+</h2>
            <p className="text-slate-400 font-medium">Sua jornada matemática começa aqui</p>
          </div>

          <div className="glass p-8 md:p-10 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                {mode === 'login' ? 'Entrar na conta' : mode === "signup" ? 'Criar nova conta' : 'Recuperar acesso'}
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                {mode === 'login' ? 'Bem-vindo de volta ao universo matemático!' : mode === 'signup' ? 'Cadastre-se para começar a subir de nível.' : 'Insira seu e-mail para receber as instruções.'}
              </p>
            </div>

            {/* ERROR / MESSAGE ALERTS */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-cyan-400 text-xs font-bold text-center"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              {/* Google Button */}
              {mode !== 'forgot' && (
                <>
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="google-btn w-full h-14 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5" />
                    Continuar com Google
                  </button>

                  <div className="relative flex items-center justify-center py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <span className="relative z-10 bg-[#020617] px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">ou email</span>
                  </div>
                </>
              )}

              {/* Form Inputs */}
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="E-mail de acesso"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium w-full h-14 pl-12 pr-6 outline-none"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="password"
                      placeholder="Sua senha secreta"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                      className="input-premium w-full h-14 pl-12 pr-6 outline-none"
                    />
                  </div>
                )}
              </div>
              {/* Privacy Terms Notice (Frictionless login, Mandatory signup) */}
              {mode === 'signup' && (
                <div className="terms-container">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                    />
                    <span className="text-[10px] font-bold text-slate-400">
                      CONCORDO COM OS <button type="button" onClick={() => setShowPolicy(true)} className="link-alt">TERMOS</button> E <button type="button" onClick={() => setShowPolicy(true)} className="link-alt">PRIVACIDADE</button>
                    </span>
                  </label>
                </div>
              )}
              
              {mode === 'login' && (
                <div className="text-center py-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Ao entrar, você concorda com nossos <br />
                    <button type="button" onClick={() => setShowPolicy(true)} className="link-alt">Termos de Uso</button> e <button type="button" onClick={() => setShowPolicy(true)} className="link-alt">Privacidade</button>
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}
                disabled={loading}
                className="btn-main w-full h-16 rounded-2xl text-white font-black italic uppercase text-lg shadow-neon group"
              >
                {loading ? 'Sincronizando...' : (
                  <>
                    {mode === 'login' ? 'Começar Agora 🚀' : mode === 'signup' ? 'Criar Conta Grátis 🛡️' : 'Enviar Link de Resgate'}
                  </>
                )}
              </button>

              <p className="login-proof">
                🔥 Mais de 12.000 alunos já estão evoluindo todos os dias
              </p>

              {/* Secondary Actions */}
              <div className="flex flex-col items-center gap-4 pt-4">
                {mode === 'login' && (
                  <>
                    <button onClick={() => setMode('forgot')} className="text-xs font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                      Esqueceu a senha? <span className="text-cyan-400 ml-1">Clique aqui</span>
                    </button>
                    <button onClick={() => setMode('signup')} className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors">
                       Não tem conta? <span className="text-cyan-400 border-b-2 border-cyan-400/30">Criar uma agora</span>
                    </button>
                  </>
                )}
                {(mode === 'signup' || mode === 'forgot') && (
                  <button onClick={() => setMode('login')} className="text-xs font-bold text-cyan-400 uppercase tracking-widest hover:brightness-125 transition-all">
                    ← Voltar para entrar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
               © {new Date().getFullYear()} Math Adventure Plus • <button onClick={() => setShowPolicy(true)} className="hover:text-slate-400 transition-colors">Privacidade</button> • <button onClick={() => setShowPolicy(true)} className="hover:text-slate-400 transition-colors">Termos</button>
             </p>
          </div>
        </motion.div>
      </div>

      {/* Policy Modal */}
      <AnimatePresence>
        {showPolicy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="policy-modal"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="policy-content"
            >
              <h2>Termos e Privacidade</h2>
              
              <p>
                Bem-vindo ao <strong>Math Adventure Plus</strong>. Nossa plataforma tem como objetivo oferecer aprendizado gamificado de matemática para alunos e ferramentas de gestão para professores.
              </p>

              <div className="highlight">
                🚀 IMPORTANTE: Atualmente a plataforma oferece recursos gratuitos. No futuro, poderemos incluir planos pagos, assinaturas premium ou funcionalidades exclusivas para garantir a continuidade e evolução do sistema.
              </div>

              <p className="mt-4">
                <strong>Uso de Dados:</strong> Seus dados (nome, e-mail, progresso) são utilizados exclusivamente para o funcionamento do jogo, ranking e relatórios pedagógicos. Não vendemos suas informações para terceiros.
              </p>

              <p>
                <strong>Conduta:</strong> Ao utilizar o sistema, você concorda em não realizar engenharia reversa, abusar de bugs ou utilizar ferramentas de automação para ganhar XP de forma desonesta.
              </p>

              <p>
                <strong>Cookies:</strong> Utilizamos cookies e armazenamento local (como o salvamento do seu aceite destes termos) para manter sua sessão ativa e melhorar a velocidade do app.
              </p>

              <button 
                onClick={() => setShowPolicy(false)}
                className="policy-close-btn"
              >
                Entendi e Aceito
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
