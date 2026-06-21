import React from 'react';
import { motion } from 'motion/react';
import { X, Minimize2, Maximize2 } from 'lucide-react';

interface AppWrapperProps {
  key?: string | number;
  appId: string;
  appName: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function AppWrapper({ appId, appName, onClose, children }: AppWrapperProps) {
  return (
    <motion.div
      id={`window-${appId}`}
      initial={{ opacity: 0, scale: 0.9, y: 150 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 300, transition: { duration: 0.35, ease: [0.32, 0.94, 0.6, 1] } }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="absolute top-[52px] bottom-[15px] left-[15px] right-[15px] md:top-[54px] md:bottom-[18px] md:left-[18px] md:right-[18px] rounded-[30px] overflow-hidden bg-white/85 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border border-white/30 dark:border-white/10 flex flex-col z-[41] pointer-events-auto select-none"
    >
      {/* Top native header representing the window standard iOS bar */}
      <div className="h-12 px-5 bg-white/40 dark:bg-black/10 border-b border-black/5 dark:border-white/5 flex items-center justify-between select-none shrink-0 z-40">
        <div className="flex items-center space-x-2">
          {/* iOS close button mimic */}
          <button
            onClick={onClose}
            id={`btn-close-${appId}`}
            className="w-3.5 h-3.5 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center border border-red-550/10 font-bold group"
          >
            <X className="w-2.5 h-2.5 text-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full border border-yellow-500/10" />
          <div className="w-3.5 h-3.5 bg-green-400 rounded-full border border-green-500/10" />
        </div>

        {/* Application Name title */}
        <span className="text-xs font-bold tracking-widest text-slate-800 dark:text-white/80 uppercase">{appName}</span>

        {/* Dedicated tactile close button on the right for effortless mobile/touch usability */}
        <button
          onClick={onClose}
          id={`btn-header-close-${appId}`}
          className="w-10 h-10 -mr-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Chiudi"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main app viewport content */}
      <div className="flex-1 min-h-0 relative bg-transparent">
        {children}
      </div>

      {/* iOS styled Bottom Home gesture indicator pill */}
      <div 
        onClick={onClose} 
        id={`home-indicator-${appId}`}
        className="h-7 shrink-0 flex items-center justify-center bg-transparent cursor-pointer relative pb-1 pt-0.5 group"
        title="Torna alla Home Screen"
      >
        <div className="w-36 h-1.5 bg-black/20 group-hover:bg-black/35 rounded-full transition-all" />
      </div>
    </motion.div>
  );
}
