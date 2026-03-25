import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, Lock, Globe } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* AAA DYNAMIC BACKGROUND BLOBS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card max-w-2xl w-full p-8 md:p-12 shadow-aaa relative z-10 border border-white/10"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 font-black uppercase text-xs tracking-widest italic group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Voltar
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-neon">
            <ShieldCheck size={36} />
          </div>
          <h1 className="game-title text-3xl md:text-4xl text-white">Política de Privacidade</h1>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed font-medium">
          <section className="flex gap-4">
            <div className="mt-1 text-primary"><Lock size={20} /></div>
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-2">Coleta de Dados</h3>
              <p className="text-sm">Coletamos informações básicas como nome, avatar e e-mail apenas para garantir o funcionamento personalizado da plataforma e o salvamento do seu progresso.</p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="mt-1 text-primary"><Globe size={20} /></div>
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-2">Uso Educacional</h3>
              <p className="text-sm">Seus dados são utilizados exclusivamente para fins didáticos: registro de XP, subida de nível e participação no ranking da sua turma.</p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="mt-1 text-primary"><ShieldCheck size={20} /></div>
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-2">Segurança Máxima</h3>
              <p className="text-sm">Utilizamos infraestrutura de ponta via Supabase para garantir que suas informações estejam protegidas contra acessos não autorizados.</p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="mt-1 text-primary"><Mail size={20} /></div>
            <div>
              <h3 className="text-white font-black uppercase text-xs tracking-wider mb-2">Contato</h3>
              <p className="text-sm">Dúvidas ou solicitações? Entre em contato com nossa equipe:<br />
              <span className="text-primary italic font-black">daivid.evangelista@edu.mt.gov.br</span></p>
            </div>
          </section> section
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black italic">Math Adventure+ &copy; 2026 - Premium Learning Experience</p>
        </div>
      </motion.div>
    </div>
  );
}