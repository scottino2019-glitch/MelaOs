import React, { useState } from 'react';
import { 
  User, Moon, Sun, Smartphone, Bell, Eye, Compass, RotateCw, Trash2, 
  ChevronRight, Battery, Settings, Database, Code, Info, Sparkles, Check
} from 'lucide-react';
import { SystemSettings, Note } from '../types';

interface AppSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => void;
  notesCount: number;
  onResetSystem: () => void;
  onNotification: (title: string, msg: string) => void;
}

const WALLPAPER_PRESETS = [
  { name: 'Bento Sunset 🌅', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', isDark: true },
  { name: 'Midnight Violet', value: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', isDark: true },
  { name: 'Emerald Forest', value: 'linear-gradient(135deg, #022c22 0%, #064e3b 100%)', isDark: true },
  { name: 'Carbon Black', value: 'linear-gradient(135deg, #111827 0%, #030712 100%)', isDark: true },
  { name: 'Aura Sunset', value: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', isDark: false },
  { name: 'Polar Aurora', value: 'linear-gradient(135deg, #1e1b4b 0%, #0ea5e9 100%)', isDark: true }
];

export default function AppSettings({ settings, onUpdateSettings, notesCount, onResetSystem, onNotification }: AppSettingsProps) {
  const [activeSection, setActiveSection] = useState<'general' | 'wallpaper' | 'storage'>('general');
  const [profileName, setProfileName] = useState(settings.userName);

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    onUpdateSettings({ userName: profileName.trim() });
    onNotification("Settings", `Profilo aggiornato! Ciao, ${profileName.trim()}`);
  };

  const handleSelectWallpaper = (val: string, name: string) => {
    onUpdateSettings({ wallpaper: val });
    onNotification("Sfondo", `Sfondo cambiato in "${name}"`);
  };

  return (
    <div id="app-settings" className="flex flex-col md:flex-row h-full w-full bg-[#f2f2f7] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans rounded-3xl select-none text-sm">
      
      {/* Sidebar with settings groups */}
      <div className="w-full md:w-72 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 flex flex-col justify-between h-1/3 md:h-full">
        <div className="p-4 flex flex-col space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-650 dark:text-zinc-300">
              <Settings className="w-4.5 h-4.5 animate-spin-slow" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Impostazioni</h1>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setActiveSection('general')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between font-semibold transition ${
                activeSection === 'general' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <User className="w-4 h-4" />
                <span>Generale</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('wallpaper')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between font-semibold transition ${
                activeSection === 'wallpaper' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Compass className="w-4 h-4" />
                <span>Sfondo iOS</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('storage')}
              className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between font-semibold transition ${
                activeSection === 'storage' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4" />
                <span>Spazio di Archiviazione</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Brand credit */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] text-zinc-400 font-semibold space-y-1">
          <p>Designed by Apple Inc.</p>
          <p className="font-mono">OS Version: iOS 19.x Mock</p>
        </div>
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        
        {/* Section: GENERAL DETAILS */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1">Informazioni Profilo</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Modifica il nome utente visualizzato sulla schermata di blocco o sulla home screen.</p>
            </div>

            {/* Profile Name update form */}
            <form onSubmit={handleUpdateName} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row items-end gap-4 shadow-sm">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-bold text-zinc-400">Nome dell'utente</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none text-xs"
                    placeholder="Esempio: Mario Rossi"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 hover:scale-103 text-white font-bold text-xs py-2 px-5.5 rounded-xl transition"
              >
                Salva Profilo
              </button>
            </form>

            {/* Toggle Modes box */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">System Options</h3>
              <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-3xl border border-zinc-200 dark:border-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                
                {/* Dark mode switch */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs leading-none">Tema di Notte (Dark Mode)</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Imposta un aspetto scuro confortevole.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                      settings.darkMode ? 'bg-emerald-500 text-right' : 'bg-zinc-200 text-left'
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform" style={{ transform: settings.darkMode ? 'translateX(22px)' : 'translateX(0)' }} />
                  </button>
                </div>

                {/* Battery health detail row */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Battery className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs leading-none">Stato della Batteria</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Efficienza massima e carica attiva.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-500">100% (Nuova)</span>
                </div>

                {/* Airplane mode switch */}
                <div className="flex items-center justify-between p-4.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs leading-none">Modalità Concentrazione</h4>
                      <p className="text-[10px] text-zinc-400 mt-1">Disattiva notifiche in entrata velocemente.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ airplaneMode: !settings.airplaneMode })}
                    className={`w-12 h-6.5 rounded-full p-1 transition-all ${
                      settings.airplaneMode ? 'bg-emerald-500' : 'bg-zinc-200'
                    }`}
                  >
                    <div className="w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform" style={{ transform: settings.airplaneMode ? 'translateX(22px)' : 'translateX(0)' }} />
                  </button>
                </div>

              </div>
            </div>

            {/* Danger Zone: Factory Reset */}
            <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/20 p-5 rounded-3xl space-y-2">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <Trash2 className="w-4 h-4" />
                <span>Zona di Ripristino (Factory Reset)</span>
              </h3>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80">L'operazione cancellerà definitivamente tutte le note salvate in locale, ripristinando lo stato iniziale.</p>
              <button
                onClick={onResetSystem}
                className="bg-rose-600 hover:bg-rose-700 hover:scale-102 font-bold text-xs text-white py-2 px-4 rounded-xl mt-2 transition"
              >
                Ripristina Dati Iniziali
              </button>
            </div>
          </div>
        )}

        {/* Section: WALLPAPER SELECTION */}
        {activeSection === 'wallpaper' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1">Sfondo Schermata Principale</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Scegli tra sfumature liquide astratte ispirate alle versioni ufficiali delle release iOS.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {WALLPAPER_PRESETS.map((wp) => {
                const isActive = settings.wallpaper === wp.value;
                return (
                  <button
                    key={wp.name}
                    onClick={() => handleSelectWallpaper(wp.value, wp.name)}
                    className={`aspect-[9/16] rounded-3xl relative overflow-hidden transition-all duration-350 scale-100 p-3.5 flex flex-col justify-between text-left group ${
                      isActive ? 'ring-4 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950 scale-102 cursor-default' : 'hover:scale-101 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300'
                    }`}
                    style={{ background: wp.value }}
                  >
                    {/* Tiny visual elements to represent dynamic clock mock */}
                    <div className="space-y-1 select-none pointer-events-none self-center text-center mt-2">
                      <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto" />
                      <span className="text-[14px] font-light tracking-tighter text-white drop-shadow-md">09:41</span>
                    </div>

                    <div className="flex items-center justify-between text-white drop-shadow-md">
                      <span className="text-[10px] font-bold truncate pr-2">{wp.name}</span>
                      {isActive && (
                        <div className="p-1 bg-blue-600 rounded-full shadow-md">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: SYSTEM STORAGE INFORMATION */}
        {activeSection === 'storage' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1">Archiviazione del Dispositivo</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Verifica la capacità totale utilizzata dai dati preinstallati in memoria.</p>
            </div>

            {/* Storage Progress bar block */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-900 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Capacità Totale: 128 GB</span>
                <span className="text-blue-500 font-bold text-xs">
                  {Math.round(24 + notesCount * 0.1)} GB utilizzati
                </span>
              </div>
              
              <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-950 rounded-full overflow-hidden flex">
                <div className="bg-amber-450 h-full" style={{ width: '12%' }} title="Note" />
                <div className="bg-emerald-505 h-full" style={{ width: '8%' }} title="Foto" />
                <div className="bg-indigo-505 h-full" style={{ width: '30%' }} title="Video" />
                <div className="bg-zinc-350 h-full" style={{ width: '20%' }} title="System" />
              </div>

              {/* Legend row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                  <span>Scriba Note: {notesCount} file</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                  <span>Editor Foto</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                  <span>Player Video</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 bg-zinc-400 rounded-full" />
                  <span>Sistema & App predefinitive</span>
                </div>
              </div>
            </div>

            {/* Information note */}
            <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/20 p-4.5 rounded-3xl flex items-start space-x-3 text-blue-800 dark:text-blue-200 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Modello di calcolo automatico:</strong> Ciascuna risorsa salvata viene ottimizzata localmente ed inserita in locale all'interno della Sandbox del browser per un'esecuzione rapida e senza latenze.
              </span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
