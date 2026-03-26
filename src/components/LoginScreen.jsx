import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authAPI } from "../lib/supabase";

// Animated floating particle for the left panel
const Orb = ({ style }) => (
  <motion.div
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
    transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
    className="absolute rounded-full bg-white/10 backdrop-blur-sm border border-white/10"
    style={style}
  />
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return setError("Preencha todos os campos");
    setLoading(true); setError(""); setMessage("");
    const { error } = await authAPI.signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };
  const handleSignup = async () => {
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
    <div className="split-layout bg-[#020617] text-white overflow-hidden">

      {/* ═══════════════════════════════════════════
          LEFT PANEL — Hero / Brand
      ═══════════════════════════════════════════ */}
      <div className="split-left relative flex flex-col items-center justify-center overflow-hidden bg-[#020617]">
        {/* Animated gradient atmosphere */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="glow-bg top-[-100px] left-[-100px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="glow-bg bottom-[-100px] right-[-50px]"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent)' }}
        />

        {/* Floating orbs */}
        <Orb style={{ width: 80, height: 80, top: '15%', left: '10%' }} />
        <Orb style={{ width: 50, height: 50, top: '60%', left: '20%' }} />
        <Orb style={{ width: 100, height: 100, top: '30%', right: '8%' }} />
        <Orb style={{ width: 40, height: 40, bottom: '20%', right: '20%' }} />

        {/* Particle grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:36px_36px]" />

        {/* Hero content */}
        <div className="relative z-10 px-12 text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 rounded-[22px] bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.5)] mb-2"
          >
            <span className="text-3xl font-black italic text-white">M+</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl xl:text-5xl font-black leading-tight tracking-tight"
          >
            Domine a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Matemática
            </span>{" "}
            de Forma{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              Divertida
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/60 max-w-sm leading-relaxed"
          >
            Aprenda jogando e evolua todos os dias. Missões, XP e ranking esperando por você.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-2"
          >
            {[
              { icon: "🏆", text: "Ranking Global" },
              { icon: "⭐", text: "Tabuada 0–10" },
              { icon: "🚀", text: "XP & Níveis" },
              { icon: "🎯", text: "Missões Diárias" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-semibold text-white/80">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Login Form
      ═══════════════════════════════════════════ */}
      <div className="split-right relative flex flex-col items-center justify-center bg-[#080d1e] px-6 py-10 overflow-hidden">
        {/* Subtle right-side glow (desktop) */}
        <div className="glow-bg top-[-200px] right-[-200px]" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12), transparent)' }} />
        {/* Mobile floating glow animation */}
        <div className="bg-animation top-[-80px] left-[-80px]" />
        <div className="bg-animation bottom-[-80px] right-[-80px]" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent)', animationDelay: '3s' }} />

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="login-card-mobile relative z-10 w-full max-w-sm"
        >
          {/* Card header — logo larger on mobile via logo-mobile class */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="logo-mobile w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(147,51,234,0.4)] mb-4">
              <span className="text-2xl font-black italic text-white">M+</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {mode === 'login' ? 'Entrar na conta' : mode === 'signup' ? 'Criar conta' : 'Recuperar senha'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === 'login' ? 'Bem-vindo de volta, aventureiro!' : mode === 'signup' ? 'Comece sua jornada agora' : 'Te mandamos um link por email'}
            </p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 text-xs font-bold text-center p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20"
              >{error}</motion.div>
            )}
            {message && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-5 text-xs font-bold text-center p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              >{message}</motion.div>
            )}
          </AnimatePresence>

          {/* Google Button */}
          {mode !== 'forgot' && (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleGoogle}
                disabled={loading}
                className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.25)] transition-all duration-300 disabled:opacity-50 mb-5"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continuar com Google
              </motion.button>
              <div className="relative flex items-center justify-center mb-5">
                <div className="absolute w-full h-px bg-white/10" />
                <span className="relative bg-[#080d1e] px-4 text-xs font-medium text-gray-500 uppercase tracking-widest">ou email</span>
              </div>
            </>
          )}

          {/* Email Input */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-premium w-full px-5 py-4"
            />
          </div>

          {/* Password Input */}
          {mode !== 'forgot' && (
            <div className="mb-6">
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
                className="input-premium w-full px-5 py-4"
              />
            </div>
          )}
          {mode === 'forgot' && <div className="mb-6" />}

          {/* Main CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot}
            disabled={loading}
            className="btn-main w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center disabled:opacity-50 mb-5"
          >
            {loading ? "Aguarde..." : mode === 'login' ? "Entrar" : mode === 'signup' ? "Criar Conta" : "Enviar Link"}
          </motion.button>

          {/* Secondary Actions */}
          <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="hover:text-cyan-400 transition text-sm">
                  Esqueceu a senha?
                </button>
                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="hover:text-cyan-400 transition text-sm">
                  Não tem conta? <span className="text-cyan-400 font-bold">Criar agora</span>
                </button>
              </>
            )}
            {(mode === 'signup' || mode === 'forgot') && (
              <button onClick={() => { setMode('login'); setError(''); setMessage(''); }} className="hover:text-cyan-400 transition text-sm">
                ← Voltar ao login
              </button>
            )}
            <div className="flex gap-3 text-[11px] mt-3 text-gray-600">
              <a onClick={() => window.open('/privacidade', '_blank')} className="hover:text-gray-400 cursor-pointer transition">Privacidade</a>
              <span>·</span>
              <a onClick={() => window.open('/privacidade', '_blank')} className="hover:text-gray-400 cursor-pointer transition">Termos de Uso</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
