import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, Sun, Moon, Sparkles, MessageSquare, BatteryWarning, HeartPulse } from 'lucide-react';
import { SystemSettings, AppNotification } from '../types';

interface LockScreenProps {
  key?: string;
  settings: SystemSettings;
  notifications: AppNotification[];
  onUnlock: () => void;
}

export default function LockScreen({ settings, notifications, onUnlock }: LockScreenProps) {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Time format (HH:MM)
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);

      // Date format in Italian (es: "Domenica, 21 Giugno")
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      };
      const formattedDate = now.toLocaleDateString('it-IT', options);
      // Capitalize first letter of each word
      setDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <motion.div
      id="ios-lock-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 0.6, ease: [0.32, 0.94, 0.6, 1] }}
      className="absolute inset-0 w-full h-full flex flex-col justify-between p-8 pt-20 pb-12 select-none z-45"
      style={{ background: settings.wallpaper }}
    >
      {/* Blurred background overlay for lock screen depth */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/20 via-black/5 to-transparent pointer-events-none" />

      {/* Top Lock Indicator */}
      <div className="flex flex-col items-center mt-2">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="bg-black/20 backdrop-blur-md p-2.5 rounded-full border border-white/10"
        >
          <Lock className="w-4 h-4 text-white/90" />
        </motion.div>
        <span className="text-[11px] text-white/75 mt-1 font-medium tracking-wider uppercase">Bloccato</span>
      </div>

      {/* Date & Time display */}
      <div className="flex flex-col items-center mt-4">
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white/90 text-sm font-medium tracking-wide drop-shadow-md"
        >
          {date}
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white text-7xl font-medium tracking-tighter drop-shadow-lg font-sans mt-1"
        >
          {time}
        </motion.h1>

        {/* Lockscreen Quick Widgets */}
        <div className="flex items-center space-x-3 mt-4 bg-white/10 backdrop-blur-2xl px-4.5 py-1.5 rounded-full border border-white/20 text-[11px] text-white/90 shadow-md">
          <div className="flex items-center space-x-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="font-medium">7.200 passi</span>
          </div>
          <span className="text-white/30">|</span>
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-medium">100% Focus</span>
          </div>
        </div>
      </div>

      {/* Middle Center: Notifications alerts */}
      <div className="flex-1 my-6 flex flex-col justify-start space-y-3 overflow-y-auto max-h-[320px] scrollbar-none px-2 z-10">
        {unreadNotifications.length > 0 ? (
          unreadNotifications.slice(0, 3).map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white/20 dark:bg-black/40 backdrop-blur-3xl border border-white/30 dark:border-white/10 p-4 rounded-[24px] shadow-xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white/25 dark:bg-white/10 rounded-md flex items-center justify-center text-[10px] uppercase font-bold text-white">
                    {notif.appName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold tracking-wide text-white/90">{notif.appName}</span>
                </div>
                <span className="text-[10px] text-white/60 font-mono font-medium">{notif.time}</span>
              </div>
              <h4 className="text-xs font-bold leading-tight">{notif.title}</h4>
              <p className="text-xs text-white/90 mt-1 leading-relaxed">{notif.message}</p>
            </motion.div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-white/50 py-10">
            <MessageSquare className="w-6 h-6 mb-2 opacity-40 text-white" />
            <span className="text-xs">Nessuna notifica recente</span>
          </div>
        )}
      </div>

      {/* Bottom Unlock Button & Advice */}
      <div className="flex flex-col items-center space-y-6">
        {/* Flashlight and Camera Quick Actions */}
        <div className="flex justify-between w-full max-w-[280px] px-2 z-20">
          <button 
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              settings.flashlight ? 'bg-amber-400 text-black' : 'bg-black/30 backdrop-blur-md text-white border border-white/10'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              // In App.tsx we should toggle, here we can alert or just show positive toggle.
            }}
          >
            <Sun className="w-5 h-5" />
          </button>
          
          <button 
            className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onUnlock();
            }}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Home swipe simulator bar */}
        <motion.div
          onClick={onUnlock}
          className="w-full max-w-xs bg-white/10 hover:bg-white/20 hover:scale-102 flex flex-col items-center justify-center py-4 rounded-3xl border border-white/10 cursor-pointer backdrop-blur-lg group transition-all"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-2 text-white">
            <Unlock className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce" />
            <span className="text-[13px] font-medium tracking-wide">Tocca per sbloccare</span>
          </div>
          <div className="w-32 h-1 bg-white/70 rounded-full mt-3 animate-pulse" />
        </motion.div>
      </div>
    </motion.div>
  );
}
