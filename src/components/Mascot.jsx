import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Mascot = ({ expression = 'happy', size = 'normal', message, side = 'left', floating = false, id = 'global' }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const closedState = localStorage.getItem(`math_adventure_mascot_closed_${id}`);
    if (closedState === 'true') {
      setIsVisible(false);
    }
  }, [id]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(`math_adventure_mascot_closed_${id}`, 'true');
  };

  if (!isVisible) return null;

  // Configuração de Tamanhos
  const w = size === 'large' ? 'w-32' : size === 'small' ? 'w-16' : 'w-20 md:w-24';
  const h = size === 'large' ? 'h-32' : size === 'small' ? 'h-16' : 'h-20 md:h-24';
  
  // Animações Constantes baseadas na emoção
  const eyeVariants = {
    happy: { scaleY: [1, 0.2, 1], transition: { duration: 0.1, repeat: Infinity, repeatDelay: 3 } },
    sad: { rotate: [-15, 15], y: [-2, 2], transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' } },
    excited: { scale: [1, 1.3, 1], rotate: [0, 5, -5, 0], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'], transition: { duration: 0.4, repeat: Infinity } },
    loading: { rotate: 360, transition: { duration: 1.5, repeat: Infinity, ease: 'linear' } }
  };

  // On Mobile: hide speech bubble if it's too much, shrink mascot.
  const containerClasses = floating 
    ? "fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] cursor-grab active:cursor-grabbing flex flex-col items-center" 
    : `relative flex ${side === 'right' ? 'flex-row-reverse' : 'flex-row'} items-center justify-center gap-4 md:gap-6`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 50 }}
      className={containerClasses}
      drag={floating}
      dragConstraints={{ left: -window.innerWidth + 100, right: 0, top: -window.innerHeight + 100, bottom: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
       {/* Close Button if floating */}
       {floating && (
         <button 
           onClick={(e) => { e.stopPropagation(); handleClose(); }}
           className="absolute -top-3 -right-3 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500 transition-colors z-50 border border-slate-700 shadow-lg"
         >
           <X size={12} strokeWidth={3} />
         </button>
       )}

       {/* Mascot Body & Floating Physics */}
       <motion.div 
         animate={{ y: [0, -6, 0] }} 
         transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
         className={`relative ${w} ${h} bg-[#0f172a] rounded-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start pt-3 z-10 overflow-hidden`}
         style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5)' }}
       >
         {/* Antena */}
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full z-0 ${expression === 'loading' ? 'bg-cyan-400 animate-ping' : expression === 'sad' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-cyan-400 shadow-[0_0_15px_#22d3ee]'}`} />
            <div className="w-1.5 h-4 bg-slate-600 rounded-t-full -mt-0.5 z-10" />
         </div>

         {/* Screen Face */}
         <div className="w-[85%] h-[55%] bg-[#020617] rounded-2xl flex flex-col items-center justify-center overflow-hidden relative shadow-inner mt-1 border border-white/5">
            <div className="absolute inset-0 bg-cyan-500/5 bg-[radial-gradient(circle_at_center,_white/5,_transparent)]" />
            <div className="flex gap-2.5 z-10">
               <motion.div animate={eyeVariants[expression]} className={`w-2.5 h-4 rounded-full shadow-[0_0_10px_currentColor] ${expression === 'sad' ? 'text-rose-400 bg-current' : 'text-cyan-400 bg-current'}`} />
               <motion.div animate={eyeVariants[expression]} className={`w-2.5 h-4 rounded-full shadow-[0_0_10px_currentColor] ${expression === 'sad' ? 'text-rose-400 bg-current' : 'text-cyan-400 bg-current'}`} />
            </div>
            {expression === 'happy' && <div className="mt-1.5 w-3 h-1 border-b-2 border-cyan-400/50 rounded-full" />}
            {expression === 'sad' && <div className="mt-1.5 w-3 h-1 border-t-2 border-rose-400/50 rounded-full" />}
            {expression === 'excited' && <div className="mt-1.5 w-3 h-1.5 bg-cyan-400/30 rounded-b-full shadow-[0_0_10px_rgba(34,211,238,0.3)]" />}
         </div>

         {/* Chest Speaker */}
         <div className="flex gap-1 mt-2.5 opacity-20">
            {[1,2,3].map(i => <div key={i} className="w-1 h-2 rounded-full bg-white" />)}
         </div>
       </motion.div>

       {/* Speech Bubble - hide on very small screens if floating to save space */}
       <AnimatePresence>
         {message && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.8, x: floating ? -10 : (side === 'left' ? -10 : 10) }}
               animate={{ opacity: 1, scale: 1, x: 0 }}
               exit={{ opacity: 0, scale: 0.8 }}
               className={`relative font-semibold text-xs md:text-sm tracking-tight px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-xl max-w-[180px] md:max-w-[220px] text-left leading-snug ${expression === 'sad' ? 'bg-rose-500 text-white border border-rose-400' : 'bg-slate-800 text-white border border-white/10'} ${floating ? 'hidden sm:block' : 'block'}`}
               style={{ backdropFilter: 'blur(10px)' }}
             >
               {message}
               <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 ${expression === 'sad' ? 'bg-rose-500' : 'bg-slate-800 border-l border-b border-white/10'} ${floating ? 'left-[-6px]' : (side === 'left' ? '-left-1.5' : '-right-1.5 border-t border-r')}`} />
             </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
};
