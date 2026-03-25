import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Mascot = ({ expression = 'happy', size = 'normal', message, side = 'left', floating = false }) => {
  // Configuração de Tamanhos
  const w = size === 'large' ? 'w-32' : size === 'small' ? 'w-16' : 'w-24';
  const h = size === 'large' ? 'h-32' : size === 'small' ? 'h-16' : 'h-24';
  
  // Animações Constantes baseadas na emoção
  const eyeVariants = {
    happy: { scaleY: [1, 0.2, 1], transition: { duration: 0.1, repeat: Infinity, repeatDelay: 3 } },
    sad: { rotate: [-15, 15], y: [-2, 2], transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' } },
    excited: { scale: [1, 1.3, 1], rotate: [0, 5, -5, 0], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'], transition: { duration: 0.4, repeat: Infinity } },
    loading: { rotate: 360, transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } }
  };

  const containerClasses = floating 
    ? "fixed bottom-8 right-8 z-[1000] cursor-grab active:cursor-grabbing"
    : `relative flex ${side === 'right' ? 'flex-row-reverse' : 'flex-row'} items-center justify-center gap-6`;

  return (
    <motion.div 
      className={containerClasses}
      drag={floating}
      dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
       {/* Mascot Body & Floating Physics */}
       <motion.div 
         animate={{ y: [0, -10, 0] }} 
         transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
         className={`relative ${w} ${h} bg-slate-900 rounded-[2rem] border-4 border-primary shadow-neon flex flex-col items-center justify-start pt-3 z-10`}
       >
         {/* Antena */}
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full z-0 ${expression === 'loading' ? 'bg-accent animate-ping' : expression === 'sad' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-accent shadow-neon-accent'}`} />
            <div className="w-1.5 h-4 bg-slate-500 rounded-t-full -mt-0.5 z-10" />
         </div>

         {/* Screen Face */}
         <div className="w-[85%] h-[55%] bg-[#020617] rounded-[1rem] border-2 border-primary/20 flex flex-col items-center justify-center overflow-hidden relative shadow-inner mt-1">
            <div className="absolute inset-0 bg-primary/5 opacity-50 bg-[radial-gradient(circle_at_center,_white/10,_transparent)]" />
            <div className="flex gap-3 z-10">
               <motion.div animate={eyeVariants[expression]} className={`w-3 h-5 rounded-full shadow-[0_0_15px_currentColor] ${expression === 'sad' ? 'text-rose-400 bg-current' : 'text-accent bg-current'}`} />
               <motion.div animate={eyeVariants[expression]} className={`w-3 h-5 rounded-full shadow-[0_0_15px_currentColor] ${expression === 'sad' ? 'text-rose-400 bg-current' : 'text-accent bg-current'}`} />
            </div>
            {expression === 'happy' && <div className="mt-2 w-4 h-1 border-b-2 border-accent/50 rounded-full" />}
            {expression === 'sad' && <div className="mt-2 w-4 h-1 border-t-2 border-rose-400/50 rounded-full" />}
            {expression === 'excited' && <div className="mt-2 w-4 h-2 bg-accent/30 rounded-b-full shadow-[0_0_10px_rgba(157,80,187,0.3)]" />}
         </div>

         {/* Chest Speaker */}
         <div className="flex gap-1 mt-3 opacity-20">
            {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 rounded-full bg-white" />)}
         </div>
       </motion.div>

       {/* Speech Bubble */}
       <AnimatePresence>
         {message && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: floating ? -20 : (side === 'left' ? -20 : 20) }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.8, x: floating ? -20 : (side === 'left' ? -20 : 20) }}
               className={`relative font-black italic tracking-tighter px-5 py-3 rounded-2xl shadow-neon shadow-slate-900/50 max-w-[220px] text-left leading-tight ${expression === 'sad' ? 'bg-rose-500 text-white' : 'bg-white text-slate-900 border-b-4 border-slate-300'}`}
             >
               {message}
               <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rotate-45 ${expression === 'sad' ? 'bg-rose-500' : 'bg-white border-l border-b border-slate-300'} ${floating ? 'left-[-8px]' : (side === 'left' ? '-left-1.5' : '-right-1.5 border-t border-r')}`} />
             </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
};
