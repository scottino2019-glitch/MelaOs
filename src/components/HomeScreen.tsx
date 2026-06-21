import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { AppConfig, SystemSettings } from '../types';

interface HomeScreenProps {
  apps: AppConfig[];
  settings: SystemSettings;
  notesCount: number;
  onOpenApp: (appId: string) => void;
}

// Map of string icons, because you can't dynamically import Lucide components easily without this mapping
const IconMap: Record<string, React.ComponentType<any>> = {
  FileText: LucideIcons.FileText,
  Camera: LucideIcons.Camera,
  Play: LucideIcons.Play,
  Calculator: LucideIcons.Calculator,
  Terminal: LucideIcons.Terminal,
  Settings: LucideIcons.Settings,
  Sun: LucideIcons.Sun,
  FolderOpen: LucideIcons.FolderOpen,
  Mic: LucideIcons.Mic
};

export default function HomeScreen({ apps, settings, notesCount, onOpenApp }: HomeScreenProps) {
  // Separate standard grid apps from docked quick launchers
  const dockApps = apps.filter(app => app.isDockApp);
  const gridApps = apps.filter(app => !app.isDockApp);

  const [dateStr, setDateStr] = React.useState('');
  const [timeStr, setTimeStr] = React.useState('');

  const [weatherWidget, setWeatherWidget] = React.useState(() => {
    const saved = localStorage.getItem('scriba_current_weather_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { temp: 22, condition: 'Sereno', city: 'Roma', code: 0 };
  });

  React.useEffect(() => {
    const handleStorageUpdate = () => {
      const saved = localStorage.getItem('scriba_current_weather_v1');
      if (saved) {
        try {
          setWeatherWidget(JSON.parse(saved));
        } catch (e) {}
      }
    };
    
    window.addEventListener('storage', handleStorageUpdate);
    // Also listen to a custom event we dispatched
    window.addEventListener('storage_custom_update', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('storage_custom_update', handleStorageUpdate);
    };
  }, []);

  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
      setDateStr(now.toLocaleDateString('it-IT', options).toUpperCase());
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIconEmoji = (code: number) => {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '🌤️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '⛅';
  };

  return (
    <div id="ios-home-screen" className="flex-1 flex flex-col justify-between p-6 pb-4 select-none relative z-30 pointer-events-auto overflow-hidden">
      
      {/* Top Bento Widgets Area (Dynamic iOS styles) */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        
        {/* Widget 1: Beautiful clock and date widget */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => onOpenApp('meteo')}
          className="bg-black/25 dark:bg-black/40 backdrop-blur-2xl border border-white/15 p-4.5 rounded-[28px] flex flex-col justify-between h-36 text-white shadow-xl hover:bg-black/35 transition-colors cursor-pointer select-none active:scale-95"
          id="home-widget-clock"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">{dateStr}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-450 animate-ping" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-semibold tracking-tighter leading-none">{timeStr}</span>
            <span className="text-[11px] text-white/80 mt-1.5 font-medium flex items-center gap-1">
              <span>{weatherWidget.city}</span>
              <span className="text-white/40">•</span>
              <span className="text-amber-300 font-semibold">{weatherWidget.temp}°C {getWeatherIconEmoji(weatherWidget.code)}</span>
            </span>
          </div>
        </motion.div>

        {/* Widget 2: Notes bento summary info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => onOpenApp('notes')}
          className="bg-amber-500/10 dark:bg-amber-500/15 backdrop-blur-2xl border border-amber-500/25 p-4.5 rounded-[28px] flex flex-col justify-between h-36 text-amber-500 dark:text-amber-300 shadow-xl hover:bg-amber-500/20 transition-all cursor-pointer active:scale-95 decoration-none select-none"
          id="home-widget-notes"
        >
          <div className="flex items-center justify-between">
            <LucideIcons.Edit3 className="w-4 h-4 text-amber-500 dark:text-amber-300" />
            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-200">Memo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3.5xl font-bold tracking-tight leading-none">{notesCount}</span>
            <span className="text-[11px] text-amber-600/90 dark:text-amber-400 mt-2 font-semibold">Note registrate</span>
          </div>
        </motion.div>

      </div>

      {/* Grid Apps list */}
      <div className="flex-1 my-6 flex flex-col justify-start">
        <div id="ios-app-grid" className="grid grid-cols-4 gap-y-7 gap-x-4 px-2">
          {gridApps.map((app, idx) => {
            const IconComponent = IconMap[app.icon] || LucideIcons.HelpCircle;
            
            // Generate standard beautiful squircle backgrounds
            const appBgClass = 
              app.id === 'calculator' ? 'bg-gradient-to-br from-neutral-800 to-black text-orange-400 shadow-neutral-900/40' :
              app.id === 'notes' ? 'bg-gradient-to-br from-[#F5D547] to-[#B08913] text-white shadow-[#B08913]/30' :
              app.id === 'pixels' ? 'bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-rose-500/35' :
              app.id === 'gallery' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/30' :
              app.id === 'siri' ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 text-white shadow-cyan-500/30' :
              app.id === 'playgrounds' ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-orange-500/25' :
              app.id === 'meteo' ? 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-sky-505/30' :
              app.id === 'settings' ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-zinc-900 shadow-zinc-500/30' :
              'bg-gradient-to-br from-blue-500 to-indigo-600 text-white';

            return (
              <motion.div
                key={app.id}
                id={`app-icon-${app.id}`}
                onClick={() => onOpenApp(app.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* Squircle container App icon */}
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition shadow-lg ${appBgClass}`}>
                  <IconComponent className="w-7 h-7 stroke-[2.2]" />

                  {/* Red bubble Notification badge */}
                  {app.badge && app.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-550 border border-white dark:border-zinc-950 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {app.badge}
                    </span>
                  ) : null}
                </div>
                
                {/* Word name underneath */}
                <span className="text-[10px] text-white/95 mt-2 font-medium tracking-wide drop-shadow-sm truncate w-14 text-center">
                  {app.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dock Shelf (Frosted overlay bar containing prioritized tools) */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 180, delay: 0.2 }}
        id="ios-dock"
        className="bg-white/20 dark:bg-black/30 backdrop-blur-3xl border border-white/25 dark:border-white/10 p-3.5 px-6 rounded-[34px] flex justify-around items-center w-full max-w-[340px] mx-auto shadow-2xl"
      >
        {dockApps.map((app) => {
          const IconComponent = IconMap[app.icon] || LucideIcons.HelpCircle;
          
          const appBgClass = 
            app.id === 'calculator' ? 'bg-gradient-to-br from-neutral-800 to-black text-orange-400' :
            app.id === 'notes' ? 'bg-gradient-to-br from-[#F5D547] to-[#B08913] text-white shadow-yellow-500/10' :
            app.id === 'pixels' ? 'bg-gradient-to-br from-[#ee0979] to-[#ff6a00] text-white' :
            app.id === 'video' ? 'bg-gradient-to-br from-[#100c08] to-[#1e1b4b] text-blue-400' :
            app.id === 'settings' ? 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-zinc-900' :
            'bg-gradient-to-br from-blue-500 to-indigo-650 text-white';

          return (
            <motion.div
              key={app.id}
              id={`dock-icon-${app.id}`}
              onClick={() => onOpenApp(app.id)}
              whileHover={{ scale: 1.13, y: -4 }}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center cursor-pointer group"
              title={app.name}
            >
              <div className={`relative w-13 h-13 rounded-2xl flex items-center justify-center transition shadow-lg ${appBgClass}`}>
                <IconComponent className="w-6.5 h-6.5 stroke-[2.2]" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </div>
  );
}
