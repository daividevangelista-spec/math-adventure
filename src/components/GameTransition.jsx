import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Trophy } from 'lucide-react';

export const GameTransition = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-[#020617] overflow-hidden"
        >
          {/* Background Warp Effect */}
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_40%)] opacity-20 blur-[100px] animate-pulse" />
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          </div>

          {/* Central Logo & Speed Lines */}
          <div className="relative z-10 flex flex-col items-center">
             <motion.div
               initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
               animate={{ scale: [0.5, 1.2, 1], rotate: 0, opacity: 1 }}
               transition={{ duration: 0.6, ease: "backOut" }}
               className="relative mb-8"
             >
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-[2.5rem] flex items-center justify-center shadow-aaa border-4 border-white/20 relative">
                   <Zap size={64} fill="currentColor" className="text-slate-900 drop-shadow-lg" />
                   <motion.div 
                     animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                     transition={{ duration: 0.8, repeat: Infinity }}
                     className="absolute inset-0 rounded-[2.5rem] border-4 border-primary"
                   />
                </div>
             </motion.div>

             <motion.h1
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="game-title text-5xl text-white drop-shadow-neon tracking-tighter uppercase italic"
             >
                Iniciando<span className="text-primary">...</span>
             </motion.h1>
             
             <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 0.5 }}
               transition={{ delay: 0.5 }}
               className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400 mt-4"
             >
                Prepare-se para o Desafio AAA
             </motion.p>
          </div>

          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               initial={{ 
                 x: Math.random() * window.innerWidth, 
                 y: Math.random() * window.innerHeight,
                 scale: 0,
                 opacity: 0
               }}
               animate={{ 
                 y: [null, -100],
                 opacity: [0, 1, 0],
                 scale: [0, 1, 0]
               }}
               transition={{ 
                 duration: 1 + Math.random() * 2, 
                 repeat: Infinity,
                 delay: Math.random() * 1
               }}
               className="absolute w-1 h-1 bg-primary rounded-full blur-[1px]"
             />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
