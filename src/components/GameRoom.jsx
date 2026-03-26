import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Send, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/audioManager';
import { Mascot } from './Mascot';

const GameRoom = ({ user, xp, level, streak, grade, mode, settings, addXp, onBack, stats, tabuadaBase, setTabuadaBase, modoProva }) => {
  const [question, setQuestion] = React.useState({ a: 0, b: 0, op: '', answer: 0, text: '', voiceText: '' });
  const [options, setOptions] = React.useState([]);
  const [userInput, setUserInput] = React.useState('');
  const [feedback, setFeedback] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(settings?.timerSeconds || 15);
  const timerRef = React.useRef(null);
  const mainInputRef = React.useRef(null);
  const [isShaking, setIsShaking] = React.useState(false);
  const [isZooming, setIsZooming] = React.useState(false);
  const [flashColor, setFlashColor] = React.useState(null); // 'success' or 'error'
  const [earnedXp, setEarnedXp] = React.useState(null);
  
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const successPhrases = ['BRILHANTE!', 'DEMAIS!', 'INCRÍVEL!', 'VOCÊ É FERA!', 'SENSACIONAL!', 'MUITO BEM!', 'FANTÁSTICO!', 'GÊNIO!', 'EXCELENTE!'];
  const errorPhrases = ['TENTE DE NOVO!', 'QUASE LÁ!', 'VOCÊ CONSEGUE!', 'FOCO TOTAL!', 'NÃO DESISTA!', 'RECALCULANDO...'];
  const [mascotMsg, setMascotMsg] = React.useState('VAMOS LÁ!');

  // Exam flow state (if modoProva is provided)
  const [examState, setExamState] = React.useState(() => {
    if (modoProva) {
      return {
        correct: 0,
        total: 0,
        startTime: Date.now(),
        examTimeLeft: modoProva.prova?.tempo_limite ? modoProva.prova.tempo_limite : null,
      };
    }
    return { correct: 0, total: 0 };
  });

  // Update exam timer if examTimeLeft is set
  React.useEffect(() => {
    if (examState && examState.examTimeLeft != null) {
      const interval = setInterval(() => {
        setExamState(prev => {
          if (!prev) return prev;
          const newLeft = prev.examTimeLeft - 1;
          if (newLeft <= 0) {
            // Time's up – finish exam
            clearInterval(interval);
            const duration = (Date.now() - prev.startTime) / 1000;
            if (modoProva?.onConcluir) {
              modoProva.onConcluir(prev.correct, prev.total, duration);
            }
            return { ...prev, examTimeLeft: 0 };
          }
          return { ...prev, examTimeLeft: newLeft };
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [examState?.examTimeLeft]);

  // Áudio é gerenciado globalmente agora pelo audioManager

  const speakQuestion = (text) => {
    if (!settings?.voiceEnabled) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const [seqIndex, setSeqIndex] = React.useState(1);
  const [tabuAnswers, setTabuAnswers] = React.useState(Array(11).fill(''));
  const [tabuFeedback, setTabuFeedback] = React.useState(Array(11).fill(null));
  const [cardSuccess, setCardSuccess] = React.useState(false);
  const inputRefs = React.useRef([]);

  const generateQuestion = () => {
    let currentMode = mode;
    if (mode === 'mixed') {
       const gradeModules = {
          '3º': ['soma', 'subtracao', 'multiplicacao', 'divisao'],
          '4º': ['soma', 'subtracao', 'multiplicacao', 'divisao'],
          '5º': ['soma', 'subtracao', 'multiplicacao', 'divisao'],
          '7º': ['soma', 'subtracao', 'multiplicacao', 'divisao', 'fracoes', 'decimais'],
          '8º': ['soma', 'subtracao', 'multiplicacao', 'divisao', 'fracoes', 'decimais', 'porcentagem', 'perimetro'],
          '9º': ['soma', 'subtracao', 'multiplicacao', 'divisao', 'fracoes', 'decimais', 'porcentagem', 'perimetro', 'area']
      };
      const availableModules = gradeModules[grade] || gradeModules['3º'];
      currentMode = availableModules[Math.floor(Math.random() * availableModules.length)];
    }

    if (settings?.timerEnabled) {
      const seconds = currentMode === 'tabuada_pro' ? 60 : (settings.timerSeconds || 15);
      setTimeLeft(seconds);
    }

    if (currentMode === 'tabuada_pro') return;

    let a, b, ans, text = '', voiceText = '';
    const gradeVal = parseInt(grade) || 3;
    let range = 20;
    if (grade === '3º' || grade === '4º') range = 50;
    else if (grade === '5º') range = 200;
    else if (grade === '7º' || grade === '8º') range = 1000;
    else if (grade === '9º') range = 2000;

    const factorRange = gradeVal >= 7 ? 15 : gradeVal >= 5 ? 12 : 10;

    switch (currentMode) {
      case 'porcentagem':
        a = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
        b = (Math.floor(Math.random() * 10) + 1) * 100;
        ans = (a / 100) * b;
        text = `${a}% de ${b}`;
        voiceText = `${a} por cento de ${b}`;
        break;
      case 'area':
        a = Math.floor(Math.random() * 9) + 2;
        b = Math.floor(Math.random() * 5) + 2;
        ans = a * b;
        text = `Área: ${a}x${b}`;
        break;
      case 'fracoes':
        const denF = [2,3,4,5][Math.floor(Math.random()*4)];
        ans = (1/denF)*100;
        const symF = denF === 2 ? '½' : denF === 3 ? '⅓' : denF === 4 ? '¼' : '⅕';
        text = `${symF} de 100?`;
        break;
      case 'decimais':
        const dec1 = (Math.random() * 5).toFixed(1);
        const dec2 = (Math.random() * 5).toFixed(1);
        ans = parseFloat((parseFloat(dec1) + parseFloat(dec2)).toFixed(1));
        text = `${dec1.replace('.', ',')} + ${dec2.replace('.', ',')}`;
        break;
      case 'divisao':
        const n8 = Math.floor(Math.random() * 9) + 1;
        const n7 = n8 * (Math.floor(Math.random() * 10));
        a = n7; b = n8;
        ans = n7 / n8;
        text = `${n7} / ${n8}`;
        break;
      case 'multiplicacao':
        const n5 = Math.floor(Math.random() * factorRange);
        const n6 = Math.floor(Math.random() * factorRange);
        a = n5; b = n6;
        ans = n5 * n6;
        text = `${n5} * ${n6}`;
        break;
      case 'subtracao':
        const n3 = Math.floor(Math.random() * range) + (range / 2);
        const n4 = Math.floor(Math.random() * n3);
        a = n3; b = n4;
        ans = n3 - n4;
        text = `${n3} - ${n4}`;
        break;
      case 'soma':
      default:
        a = Math.floor(Math.random() * range) + 1;
        b = Math.floor(Math.random() * range) + 1;
        ans = a + b;
        text = `${a} + ${b}`;
    }

    setQuestion({ a, b, answer: ans, text, voiceText: voiceText || text });
    speakQuestion(voiceText || text);
    
    // Determine if multiple choice (SaaS behavior: respect exam format)
    const isMultipleChoice = modoProva?.prova?.formato === 'multipla_escolha' || 
                            (!modoProva && settings?.isMultipleChoice);

    if (isMultipleChoice) {
      const opts = [ans];
      while (opts.length < 3) {
        let offset = Math.round(Math.random() * 4 - 2) || 1;
        const dist = mode === 'decimais' ? (parseFloat(ans) + offset).toFixed(1) : Number(ans) + offset;
        if (!opts.includes(dist) && dist >= 0) opts.push(dist);
      }
      setOptions(opts.sort(() => Math.random() - 0.5));
    }
    
    setUserInput('');
    setFeedback(null);
  };

  React.useEffect(() => {
    generateQuestion();
  }, [mode]);

  React.useEffect(() => {
    if (settings?.timerEnabled && !feedback) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { handleWrong(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [feedback, question, settings?.timerEnabled, settings?.timerSeconds, mode]);

  const handleWrong = () => {
    if (feedback) return;
    setFeedback('wrong');
    addXp(2, false, mode);
    if (settings?.soundEnabled) playSound.error();
    
    setIsShaking(true);
    setFlashColor('error');
    setMascotMsg(errorPhrases[Math.floor(Math.random() * errorPhrases.length)]);
    setTimeout(() => { setIsShaking(false); setFlashColor(null); }, 500);

    // Update exam counters if in exam mode
    if (modoProva) {
      setExamState(prev => ({ ...prev, total: prev.total + 1 }));
    }

    if (mode === 'tabuada_pro') {
       setTimeout(() => {
          setTabuAnswers(Array(11).fill(''));
          setTabuFeedback(Array(11).fill(null));
          setFeedback(null);
          setTimeLeft(settings?.timerSeconds === 15 ? 45 : settings?.timerSeconds || 15);
       }, 2000);
    } else {
       setTimeout(generateQuestion, 2000);
    }
  };

  const handleAction = (val) => {
    if (feedback) return;
    setUserInput(val.toString());
    
    if (val.toString().toLowerCase() === question.answer.toString().toLowerCase()) {
      setFeedback('correct');
      if (settings?.soundEnabled) playSound.success();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#5eead4', '#3b82f6', '#fcd34d'], disableForReducedMotion: true });
      addXp(10, true, mode);
      
      setIsZooming(true);
      setFlashColor('success');
      setEarnedXp(10);
      setMascotMsg(successPhrases[Math.floor(Math.random() * successPhrases.length)]);
      setTimeout(() => { setIsZooming(false); setFlashColor(null); setEarnedXp(null); }, 1500);

      // Update exam counters if in exam mode
      if (modoProva) {
        setExamState(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      }
      setTimeout(generateQuestion, 1500);
    } else {
      handleWrong();
    }
  };

  // Check for exam completion by answering all questions
  React.useEffect(() => {
    if (modoProva && examState.total >= (modoProva.prova?.quantidade_questoes || 0) && examState.total > 0) {
      // If startTime not set, compute now
      const start = examState.startTime || Date.now();
      const duration = (Date.now() - start) / 1000;
      modoProva.onConcluir(examState.correct, examState.total, duration);
    }
  }, [examState.total, modoProva]);

  const handleTabuInput = (idx, val) => {
    setTabuAnswers(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });

    const expected = tabuadaBase * idx;
    if (val !== '' && Number(val) === expected) {
      setTabuFeedback(prev => {
        const next = [...prev];
        next[idx] = 'correct';
        return next;
      });
      if (settings?.soundEnabled) playSound.success();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 }, colors: ['#5eead4', '#3b82f6'] });
      addXp(2, true, 'multiplicacao');
      setEarnedXp(2);
      setTimeout(() => setEarnedXp(null), 1500);
      setTimeout(() => {
        // Find FIRST available input that isn't correct yet
        const nextIdx = [...Array(11).keys()]
          .map(i => (i + idx + 1) % 11) // start from next, wrap around
          .find(i => inputRefs.current[i] && !inputRefs.current[i].disabled);
        
        if (nextIdx !== undefined && inputRefs.current[nextIdx]) {
          inputRefs.current[nextIdx].focus();
        }
      }, 50);
    } else if (val.length >= expected.toString().length) {
       setTabuFeedback(prev => {
        const next = [...prev];
        next[idx] = 'wrong';
        return next;
      });
      if (settings?.soundEnabled) playSound.error();
      setIsShaking(true);
      setMascotMsg(errorPhrases[Math.floor(Math.random() * errorPhrases.length)]);
      setTimeout(() => setIsShaking(false), 400);
    }
  };

  const nextTabuada = () => {
    if (tabuadaBase < 10) {
      setTabuadaBase(b => b + 1);
      setTabuAnswers(Array(11).fill(''));
      setTabuFeedback(Array(11).fill(null));
      setCardSuccess(false);
    } else {
      alert("🏆 MESTRE!");
      onBack();
    }
  };

  React.useEffect(() => {
    if (tabuFeedback.every(f => f === 'correct') && !cardSuccess) {
      setCardSuccess(true);
      if (settings?.soundEnabled) playSound.levelUp();
      confetti({ particleCount: 300, spread: 100, origin: { y: 0.4 } });
      const tm = setTimeout(() => {
         // Auto advance after 1.5 seconds
         nextTabuada();
      }, 1500);
      return () => clearTimeout(tm);
    }
  }, [tabuFeedback, cardSuccess]);
 
  // Determine if multiple choice (SaaS behavior: respect exam format)
  const isMC = modoProva?.prova?.formato === 'multipla_escolha' || 
               (!modoProva && settings?.isMultipleChoice);

  // Auto-focus logic
  React.useEffect(() => {
    if (mode === 'tabuada_pro') {
      // Focus first empty input
      const firstEmpty = tabuAnswers.findIndex((ans, i) => tabuFeedback[i] !== 'correct');
      if (firstEmpty !== -1 && inputRefs.current[firstEmpty]) {
        inputRefs.current[firstEmpty].focus();
      }
    } else if (!isMC && mainInputRef.current) {
      mainInputRef.current.focus();
    }
  }, [question, mode, isMC]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_70%)] opacity-50 pointer-events-none" />
      
      <AnimatePresence>
        {flashColor && (
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 0.3 }} 
             exit={{ opacity: 0 }} 
             transition={{ duration: 0.3 }}
             className={`absolute inset-0 z-0 pointer-events-none ${flashColor === 'success' ? 'bg-success' : 'bg-error'}`} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          x: isShaking ? [-10, 10, -10, 10, -5, 5, 0] : 0, 
          scale: isZooming ? [1, 1.05, 1] : 1 
        }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col relative z-10"
      >
        {/* AAA TOP BAR */}
        <div className="flex justify-between items-center mb-12 pt-2 relative z-20">
          <motion.button 
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack} 
            className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-slate-300 hover:text-white transition-all shadow-aaa backdrop-blur-md"
          >
            <ArrowLeft size={24} />
          </motion.button>

          <div className="flex items-center gap-6">
            {/* AAA TIMER/EXAM STATUS */}
            {modoProva ? (
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={examState?.examTimeLeft < 30 ? { scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`hud-card flex items-center gap-3 px-6 py-3 border-2 transition-all shadow-aaa ${examState?.examTimeLeft < 30 ? 'bg-error/20 border-error text-error shadow-neon-error' : 'bg-[#0f172a]/80 border-primary/20 text-primary shadow-neon'}`}
                >
                  <Clock size={22} className={examState?.examTimeLeft < 30 ? 'animate-pulse' : ''} /> 
                  <span className="font-mono font-black text-3xl tracking-tighter">{formatTime(examState?.examTimeLeft)}</span>
                </motion.div>
                <div className="hud-progress-bg w-32 h-2.5 p-[1px]">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${((examState?.examTimeLeft || 0) / (modoProva.prova?.tempo_limite || 1)) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className={`h-full rounded-full relative overflow-hidden ${examState?.examTimeLeft < 30 ? 'bg-red-500 shadow-neon-error' : 'bg-primary shadow-neon'}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>
            ) : (settings?.timerEnabled && (
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                   animate={timeLeft < 5 ? { scale: [1, 1.1, 1], y: [0, -2, 0] } : {}}
                   transition={{ duration: 0.3, repeat: Infinity }}
                   className={`hud-card flex items-center gap-3 px-6 py-3 border-2 transition-all shadow-aaa ${timeLeft < 5 ? 'bg-error/20 border-error text-error shadow-neon-error' : 'bg-[#0f172a]/80 border-primary/20 text-primary shadow-neon'}`}
                >
                  <Clock size={22} className={timeLeft < 5 ? 'animate-pulse' : ''} /> 
                  <span className="font-mono font-black text-3xl tracking-tighter">{formatTime(timeLeft)}</span>
                </motion.div>
                <div className="hud-progress-bg w-32 h-2.5 p-[1px]">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / (settings.timerSeconds || 15)) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className={`h-full rounded-full relative overflow-hidden ${timeLeft < 5 ? 'bg-red-500 shadow-neon-error' : 'bg-primary shadow-neon'}`}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                  </motion.div>
                </div>
              </div>
            ))}

            {/* AAA QUICK STATS */}
            <div className="hud-card flex items-center gap-4 bg-[#0f172a]/90 p-2 pr-6 border-white/10 shadow-aaa backdrop-blur-xl">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-black text-3xl text-slate-900 shadow-neon border-2 border-[#020617] relative overflow-hidden"
              >
                 <span className="relative z-10">{user.avatar || '👦'}</span>
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
              <div className="text-left relative">
                <div className="flex justify-between items-end mb-1.5 w-full gap-5">
                  <span className="font-black italic text-[10px] text-primary text-neon tracking-[0.2em] uppercase">Mestre Lvl {level}</span>
                </div>
                <div className="hud-progress-bg w-28 h-3 p-[1px]">
                  <motion.div 
                     className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-neon relative overflow-hidden"
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(100, xp % 100)}%` }}
                     transition={{ type: "spring", stiffness: 40, damping: 10 }}
                  >
                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] animate-[shimmer_4s_infinite]" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {earnedXp && (
                     <motion.div
                       initial={{ opacity: 0, y: 0, scale: 0.5 }}
                       animate={{ opacity: 1, y: -60, scale: 2 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       className="absolute -top-4 right-0 font-black text-accent text-3xl italic drop-shadow-neon select-none"
                     >
                       +{earnedXp} XP
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* AAA MAIN GAME AREA */}
        {mode === 'tabuada_pro' ? (
          <div className="flex-1 flex flex-col items-center py-2 space-y-6 overflow-y-auto custom-scrollbar relative z-10 w-full">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="game-title text-4xl text-center italic tracking-tighter leading-none"
            >
              DOMÍNIO DA<br/>
              <span className="text-gradient-gold drop-shadow-neon-accent uppercase text-5xl">TABUADA DO {tabuadaBase}</span>
            </motion.h1>
            
            <div className="glass-card w-full max-w-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-white/10 shadow-aaa backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-30 pointer-events-none" />
              {Array.from({ length: 11 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between gap-4 p-1.5 rounded-xl hover:bg-white/[0.03] transition-all group/item border border-white/5"
                >
                  <span className="text-2xl font-black italic text-slate-300 drop-shadow-sm group-hover/item:text-white transition-colors">
                    {tabuadaBase} <span className="text-primary mx-0.5">×</span> {i} <span className="text-slate-600">=</span>
                  </span>
                  <input 
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    value={tabuAnswers[i]}
                    onChange={(e) => handleTabuInput(i, e.target.value)}
                    disabled={tabuFeedback[i] === 'correct'}
                    className={`w-24 bg-[#020617]/80 border-2 rounded-xl py-2 px-3 text-2xl text-center font-black italic focus:outline-none transition-all shadow-input ${
                      tabuFeedback[i] === 'correct' ? 'border-success bg-success/10 text-success shadow-neon-success scale-105' :
                      tabuFeedback[i] === 'wrong' ? 'border-error bg-error/5 text-error animate-shake shadow-neon-error' : 'border-white/10 focus:border-primary/50'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {cardSuccess && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-full max-w-sm"
                >
                  <button 
                    onClick={nextTabuada} 
                    className="btn-premium btn-primary w-full p-8 text-3xl animate-pulse shadow-neon group"
                  >
                    <span className="group-hover:translate-x-2 transition-transform inline-block">PRÓXIMO NÍVEL →</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => { if(confirm("Deseja voltar para a Tabuada do 0?")) setTabuadaBase(0); }} 
              className="text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] mt-12 transition-all hover:scale-110 pb-16 italic opacity-50 hover:opacity-100"
            >
               ↺ REINICIAR JORNADA COMPLETA
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-16 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={question.text} 
                initial={{ y: 50, opacity: 0, rotate: -2 }} 
                animate={{ y: 0, opacity: 1, rotate: 0 }} 
                exit={{ y: -50, opacity: 0, rotate: 2 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center gap-3">
                   <div className="h-px w-12 bg-primary/30" />
                   <p className="text-[10px] font-black uppercase text-primary/60 tracking-[0.6em] italic">Desafio Arcaico</p>
                   <div className="h-px w-12 bg-primary/30" />
                </div>
                <h1 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white drop-shadow-aaa leading-none filter">
                  {question.text.split(' ').map((part, idx) => (
                    <motion.span 
                      key={idx} 
                      animate={feedback === 'correct' ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                      className={part === '+' || part === '-' || part === '*' || part === '/' || part === 'x' ? 'text-gradient-gold mx-6 drop-shadow-neon' : ''}
                    >
                      {part}
                    </motion.span>
                  ))}
                </h1>
              </motion.div>
            </AnimatePresence>

            <div className="w-full max-w-lg space-y-8 relative">
              {isMC ? (
                <div className="grid grid-cols-1 gap-4">
                  {options.map((opt, i) => (
                    <motion.button 
                      key={i} 
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(opt)} 
                      className={`glass-card p-6 text-4xl font-black italic border-2 transition-all group overflow-hidden relative shadow-aaa ${
                        feedback === 'correct' && opt === question.answer ? '!border-success bg-success/20 shadow-neon-success' :
                        feedback === 'wrong' && opt.toString() === userInput ? '!border-error bg-error/10 animate-shake shadow-neon-error' : 'border-white/10 hover:border-primary/50'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10">{opt}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="relative group">
                  <input 
                    ref={mainInputRef}
                    type="text" inputMode="numeric" value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAction(userInput)}
                    className={`w-full bg-[#020617]/90 border-[4px] rounded-[40px] p-10 text-6xl text-center font-black italic focus:outline-none transition-all placeholder:text-slate-800 shadow-aaa ${
                      feedback === 'correct' ? '!border-success bg-success/10 text-success shadow-neon-success scale-105' :
                      feedback === 'wrong' ? '!border-error bg-error/5 text-error animate-shake shadow-neon-error' : 'border-white/10 focus:border-primary shadow-glass'
                    }`}
                    placeholder="?" autoFocus
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAction(userInput)} 
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 bg-primary text-slate-900 rounded-[25px] shadow-neon flex items-center justify-center hover:bg-accent transition-all z-20"
                  >
                    <Send size={32} fill="currentColor" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXAM MINI PROGRESS */}
        {modoProva && (
          <div className="mt-8 mb-12">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Progresso da Prova</span>
              <span className="text-[10px] font-black text-primary italic uppercase">{examState.total} / {modoProva.prova?.quantidade_questoes} Questões</span>
            </div>
            <div className="w-full h-2.5 bg-[#020617] rounded-full overflow-hidden border border-white/5 p-[1px] shadow-inner">
               <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(examState.total / (modoProva.prova?.quantidade_questoes || 1)) * 100}%` }}
                  className="h-full bg-accent rounded-full shadow-neon-accent"
               />
            </div>
          </div>
        )}
      </motion.div>

      {/* MASCOT FEEDBACK OVERLAY (Static but polished) */}
      <AnimatePresence>
        {feedback && (
          <div className="fixed bottom-10 right-10 pointer-events-none z-[100] scale-90 md:scale-110">
            <motion.div
              initial={{ y: 100, opacity: 0, rotate: 20 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 50, opacity: 0, scale: 0.8 }}
              className="drop-shadow-neon"
            >
              <Mascot 
                expression={feedback === 'correct' ? 'excited' : 'sad'} 
                message={mascotMsg} 
                side="right"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameRoom;
