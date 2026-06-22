import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, Signal, Battery, Sliders, Bell, Sparkles, AlertCircle, 
  Settings, Volume2, Power, RotateCcw, VolumeX, MessageSquare, Heart 
} from 'lucide-react';

import { Note, SystemSettings, AppConfig, AppState, AppNotification } from './types';
import StatusBar from './components/StatusBar';
import LockScreen from './components/LockScreen';
import ControlCenter from './components/ControlCenter';
import HomeScreen from './components/HomeScreen';
import AppWrapper from './components/AppWrapper';

// Apps imports
import AppTextEditor from './components/AppTextEditor';
import AppPhotoEditor from './components/AppPhotoEditor';
import AppVideoPlayer from './components/AppVideoPlayer';
import AppCalculator from './components/AppCalculator';
import AppSettings from './components/AppSettings';
import AppSwiftPlaygrounds from './components/AppSwiftPlaygrounds';
import AppMeteo from './components/AppMeteo';
import SiriAssistant from './components/SiriAssistant';
import AppCartellaImmagini from './components/AppCartellaImmagini';

// Default notes seed data
const DEFAULT_NOTES_SEED: Note[] = [
  {
    id: 'note_1',
    title: 'Benvenuto su iOS Workspace 🚀',
    content: `Benvenuto nel tuo nuovo ambiente di lavoro ispirato all'iPhone!

Questa applicazione è dotata di funzionalità interattive e persistenza locale per lavorare in totale comodità:

1. 💼 Scrivi e organizza i tuoi appunti nell'Editor delle Note.
2. 🎨 Applica filtri professionali, ritaglia, ruota o disegna e aggiungi stickers alle tue immagini con il Photo Editor.
3. 📺 Guarda ed annota i momenti salienti dei video associando commenti ai timestamp nel Player Video.
4. ⚙️ Cambia sfondi o attiva la Dark Mode nelle Impostazioni.

Sentiti libero di modificare questa nota o di crearne di nuove! Buon lavoro.`,
    date: '21 Giu, 17:30',
    category: 'Lavoro',
    isFavorite: true
  },
  {
    id: 'note_2',
    title: '💡 Idee per lo sviluppo dell\'applet',
    content: `Ecco alcune idee ed espansioni future da considerare:
- Collegare i servizi Cloud Firestore per sincornizzazione multi-dispositivo.
- Includere la bussola ed il widget Meteo tramite API di geolocazione.
- Integrare l'assistente Siri con risposte AI intelligenti tramite Google Gemini.`,
    date: '20 Giu, 11:15',
    category: 'Idee',
    isFavorite: false
  },
  {
    id: 'note_3',
    title: '🛒 Lista della spesa',
    content: `- Pane integrale 🍞
- Pomodorini freschi 🍅
- Caffè in grani ☕
- Candele profumate 🕯️
- Quaderno da disegno 🎨`,
    date: '19 Giu, 09:40',
    category: 'Personale',
    isFavorite: false
  }
];

// Available default systems apps definitions
const DEFAULT_APPS: AppConfig[] = [
  { id: 'notes', name: 'Scriba Note', icon: 'FileText', isDockApp: true, badge: 1 },
  { id: 'pixels', name: 'Foto Studio', icon: 'Camera', isDockApp: true },
  { id: 'video', name: 'Player Video', icon: 'Play', isDockApp: true },
  { id: 'gallery', name: 'Cartella Img', icon: 'FolderOpen', isDockApp: false },
  { id: 'siri', name: 'Siri', icon: 'Mic', isDockApp: false },
  { id: 'calculator', name: 'Calcolatrice', icon: 'Calculator', isDockApp: false },
  { id: 'meteo', name: 'Meteo', icon: 'Sun', isDockApp: false },
  { id: 'playgrounds', name: 'Swift Playground', icon: 'Terminal', isDockApp: false },
  { id: 'settings', name: 'Impostazioni', icon: 'Settings', isDockApp: true }
];

export default function App() {
  // Determine if it should seed initial localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('ios_notes_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_NOTES_SEED; }
    }
    return DEFAULT_NOTES_SEED;
  });

  // System general environmental state
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('ios_settings_v1');
    if (saved) {
       try {
         const parsed = JSON.parse(saved);
         if (parsed.wallpaper === 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)') {
           parsed.wallpaper = 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)';
         }
         return parsed;
       } catch(e) {}
    }
    return {
      userName: 'Dipendente Apple',
      wallpaper: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)', // Bento Sunset
      darkMode: true,
      fontSize: 'medium',
      airplaneMode: false,
      wifiEnabled: true,
      bluetoothEnabled: true,
      flashlight: false,
      volume: 80,
      brightness: 100,
      batteryLevel: 98,
      isCharging: false
    };
  });

  // System Navigation State
  const [appState, setAppState] = useState<AppState>({
    openApps: [],
    activeApp: null,
    isLocked: true,
    isControlCenterOpen: false,
    notifications: [
      {
        id: 'notif_init',
        appId: 'system',
        appName: 'Workspace',
        title: 'Benvenuto',
        message: 'Workspace iOS avviato. Fai doppio click sugli sticker o esplora i controlli!',
        time: 'Adesso',
        read: false
      }
    ]
  });

  const [isSiriOpen, setIsSiriOpen] = useState(false);

  // Keep track of active media player widgets from the video player
  const [currentMedia, setCurrentMedia] = useState<{ title: string; isPlaying: boolean; onTogglePlay: () => void } | undefined>(undefined);

  const handleMediaStateChange = useCallback((title: string, playing: boolean, triggerToggle: () => void) => {
    setCurrentMedia(prev => {
      if (prev && prev.title === title && prev.isPlaying === playing) {
        return prev;
      }
      return { title, isPlaying: playing, onTogglePlay: triggerToggle };
    });
  }, []);

  // Auto increase notification badge counts if notes are saved
  const [notesBadgeCount, setNotesBadgeCount] = useState(1);

  // Save changes to notes state
  useEffect(() => {
    localStorage.setItem('ios_notes_v1', JSON.stringify(notes));
  }, [notes]);

  // Save settings state changes
  useEffect(() => {
    localStorage.setItem('ios_settings_v1', JSON.stringify(settings));
    // Apply layout fonts / night themes onto html root for unified visual matching
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Volume Change Indicator (HUD) & Keyboard listeners (Alt + ArrowUp / Alt + ArrowDown)
  const [showVolumeHud, setShowVolumeHud] = useState(false);
  const lastVolume = useRef(settings.volume);

  useEffect(() => {
    if (settings.volume !== lastVolume.current) {
      setShowVolumeHud(true);
      lastVolume.current = settings.volume;
      const t = setTimeout(() => {
        setShowVolumeHud(false);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [settings.volume]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return; // Skip when user is active inside form fields / notes
      }
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        setSettings(prev => ({ ...prev, volume: Math.min(100, prev.volume + 5) }));
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        setSettings(prev => ({ ...prev, volume: Math.max(0, prev.volume - 5) }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle battery drain simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSettings(prev => {
        let nextLvl = prev.batteryLevel;
        if (prev.isCharging) {
          nextLvl = Math.min(100, prev.batteryLevel + 1);
        } else {
          nextLvl = Math.max(1, prev.batteryLevel - 1);
        }
        return {
          ...prev,
          batteryLevel: nextLvl,
          isCharging: nextLvl === 100 ? false : prev.isCharging
        };
      });
    }, 45000); // drain/charge speed
    return () => clearInterval(interval);
  }, []);

  // Set up click audio simulated toggles
  const handleTriggerNotify = (appName: string, title: string, message: string) => {
    const newNotif: AppNotification = {
      id: 'notif_' + Date.now(),
      appId: appName.toLowerCase().replace(/\s+/g, '_'),
      appName,
      title,
      message,
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setAppState(prev => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications]
    }));
  };

  const handleUpdateSettings = (updated: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updated }));
  };

  const handleOpenApp = (id: string) => {
    if (id === 'siri') {
      setIsSiriOpen(true);
      return;
    }
    // Hide notifications or control panel
    setAppState(prev => {
      const open = prev.openApps.includes(id) ? prev.openApps : [...prev.openApps, id];
      return {
        ...prev,
        openApps: open,
        activeApp: id,
        isControlCenterOpen: false
      };
    });
    // Remove individual badges if opening specific apps
    if (id === 'notes') {
      setNotesBadgeCount(0);
    }
  };

  const handleCloseApp = (id: string) => {
    setAppState(prev => {
      const open = prev.openApps.filter(app => app !== id);
      const active = prev.activeApp === id ? (open.length > 0 ? open[open.length - 1] : null) : prev.activeApp;
      return {
        ...prev,
        openApps: open,
        activeApp: active
      };
    });
  };

  // Factory reset back default seeds
  const handleReset = () => {
    if (window.confirm("Sei sicuro di voler ripristinare i dati iniziali di fabbrica di questo iOS Workspace? Questa operazione rimpiazzerà tutte le note.")) {
      localStorage.removeItem('ios_notes_v1');
      localStorage.removeItem('ios_settings_v1');
      setNotes(DEFAULT_NOTES_SEED);
      setSettings({
        userName: 'Dipendente Apple',
        wallpaper: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        darkMode: true,
        fontSize: 'medium',
        airplaneMode: false,
        wifiEnabled: true,
        bluetoothEnabled: true,
        flashlight: false,
        volume: 80,
        brightness: 100,
        batteryLevel: 98,
        isCharging: false
      });
      setAppState(prev => ({
        ...prev,
        openApps: [],
        activeApp: null,
        isLocked: true,
        isControlCenterOpen: false
      }));
      handleTriggerNotify("Sistema", "Ripristino Completato", "L'ambiente di lavoro è stato ripristinato con successo.");
    }
  };

  // Save/modify elements notes
  const handleSaveNote = (savedNote: Note) => {
    setNotes(prev => {
      const exists = prev.some(n => n.id === savedNote.id);
      if (exists) {
        return prev.map(n => n.id === savedNote.id ? savedNote : n);
      }
      return [savedNote, ...prev];
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Construct final apps list inject dynamically badge counts
  const appsWithBadges = DEFAULT_APPS.map(app => {
    if (app.id === 'notes') {
      return { ...app, badge: notesBadgeCount };
    }
    return app;
  });

  return (
    <div 
      className="min-h-screen w-full bg-[#121214] flex flex-col items-center justify-center p-0 md:p-8 overflow-hidden font-sans relative"
      style={{
        backgroundImage: 'radial-gradient(circle at top right, #1f1f2e 0%, #0d0d11 100%)'
      }}
    >
      
      {/* Absolute decorative ambient background blur spheres to add premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Central console box simulating high-fidelity iPhone frame on desktop */}
      <div 
        id="phone-frame-container"
        className={`relative w-full h-screen md:w-[410px] md:h-[840px] md:rounded-[56px] md:border-[11px] md:border-zinc-900 bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 md:ring-[1px] md:ring-white/10 ${settings.darkMode ? 'dark' : ''}`}
        style={{
          opacity: settings.brightness / 100
        }}
      >
        {/* Absolute flashlight beam projection animation */}
        {settings.flashlight && (
          <div className="absolute top-0 right-10 w-28 h-28 bg-amber-400/15 rounded-full blur-xl animate-pulse pointer-events-none z-50" />
        )}

        {/* Physical hardware buttons mock on side with expanded interactive hover bounds */}
        <div className="hidden md:block absolute -left-2 top-36 w-2 h-14 bg-zinc-800 rounded-l-md border-l border-white/10 shadow-md" />
        
        <div className="hidden md:block absolute -left-3 top-52 w-4 h-14 flex items-center justify-start group cursor-pointer z-50 select-none"
             onClick={() => handleUpdateSettings({ volume: Math.min(100, settings.volume + 10) })}
             title="Alza volume (Alt + freccia su)"
        >
          <div className="w-1.5 h-12 bg-zinc-800 group-hover:bg-zinc-700 rounded-l border-l border-white/15 shadow-md group-active:scale-x-75 origin-right transition-all duration-150" />
        </div>
        
        <div className="hidden md:block absolute -left-3 top-68 w-4 h-14 flex items-center justify-start group cursor-pointer z-50 select-none"
             onClick={() => handleUpdateSettings({ volume: Math.max(0, settings.volume - 10) })}
             title="Abbassa volume (Alt + freccia giù)"
        >
          <div className="w-1.5 h-12 bg-zinc-800 group-hover:bg-zinc-700 rounded-l border-l border-white/15 shadow-md group-active:scale-x-75 origin-right transition-all duration-150" />
        </div>

        <div className="hidden md:block absolute -right-3 top-44 w-4 h-18 flex items-center justify-end group cursor-pointer z-50 select-none"
             onClick={() => setAppState(prev => ({ ...prev, isLocked: !prev.isLocked }))}
             title="Tasto di accensione / Sblocca"
        >
          <div className="w-1.5 h-16 bg-zinc-800 group-hover:bg-zinc-700 rounded-r border-r border-white/15 shadow-md group-active:scale-x-75 origin-left transition-all duration-150" />
        </div>

        {/* Elegant iPadOS-style Screen Volume HUD capsule */}
        <AnimatePresence>
          {showVolumeHud && (
            <motion.div
              initial={{ opacity: 0, x: -12, scaleY: 0.9 }}
              animate={{ opacity: 1, x: 0, scaleY: 1 }}
              exit={{ opacity: 0, x: -12, transition: { duration: 0.25 } }}
              className="absolute left-3.5 top-56 w-3 h-28 bg-black/80 backdrop-blur-md rounded-full overflow-hidden flex flex-col justify-end border border-white/20 z-50 shadow-2xl"
            >
              <div 
                className="bg-white/95 rounded-full transition-all duration-100"
                style={{ height: `${settings.volume || 1}%` }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* iOS Native Global Status Bar */}
        <StatusBar 
          settings={settings} 
          onOpenControlCenter={() => setAppState(prev => ({ ...prev, isControlCenterOpen: true }))} 
          onOpenSiri={() => setIsSiriOpen(true)}
        />

        {/* Outer background wallpaper matching selected gradients */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover transition-all duration-500 z-10"
          style={{ background: settings.wallpaper }}
        >
          {/* Main system states rendering */}
          <AnimatePresence>
            
            {/* 1. LOCK SCREEN PANEL */}
            {appState.isLocked ? (
              <LockScreen
                key="lockscreen"
                settings={settings}
                notifications={appState.notifications}
                onUnlock={() => {
                  setAppState(prev => ({ ...prev, isLocked: false }));
                  handleTriggerNotify("Dispositivo", "Sbloccato", `Benvenuto, ${settings.userName}!`);
                }}
              />
            ) : (
              
              /* 2. INNER OS ENVIRONMENT (Unlocked) */
              <motion.div
                key="activesystem"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 w-full h-full z-20 flex flex-col justify-between"
              >
                {/* Dynamic Screen active display container */}
                <HomeScreen 
                  apps={appsWithBadges}
                  settings={settings}
                  notesCount={notes.length}
                  onOpenApp={handleOpenApp}
                />

                {/* Sub-Apps active states rendering floating overlays */}
                <AnimatePresence>
                  {appState.openApps.map((id) => {
                    const appName = appsWithBadges.find(a => a.id === id)?.name || 'Applicazione';
                    
                    return (
                      <AppWrapper
                        key={id}
                        appId={id}
                        appName={appName}
                        onClose={() => handleCloseApp(id)}
                      >
                        {id === 'notes' && (
                          <AppTextEditor 
                            notes={notes}
                            onSaveNote={handleSaveNote}
                            onDeleteNote={handleDeleteNote}
                            onNotification={(title, text) => handleTriggerNotify("Scriba Note", title, text)}
                          />
                        )}
                        {id === 'pixels' && (
                          <AppPhotoEditor 
                            onNotification={(title, text) => handleTriggerNotify("Foto Studio", title, text)}
                          />
                        )}
                        {id === 'video' && (
                          <AppVideoPlayer 
                            onNotification={(title, text) => handleTriggerNotify("Player Video", title, text)}
                            onMediaStateChange={handleMediaStateChange}
                            systemVolume={settings.volume}
                            onSystemVolumeChange={(vol) => handleUpdateSettings({ volume: vol })}
                          />
                        )}
                        {id === 'calculator' && (
                          <AppCalculator />
                        )}
                        {id === 'playgrounds' && (
                          <AppSwiftPlaygrounds 
                            onNotification={(title, text) => handleTriggerNotify("Swift Playground", title, text)}
                          />
                        )}
                        {id === 'meteo' && (
                          <AppMeteo />
                        )}
                        {id === 'gallery' && (
                          <AppCartellaImmagini 
                            onNotification={(title, text) => handleTriggerNotify("Cartella Img", title, text)}
                            onSetWallpaper={(imageUrl) => handleUpdateSettings({ wallpaper: `url(${imageUrl})` })}
                          />
                        )}
                        {id === 'settings' && (
                          <AppSettings 
                            settings={settings}
                            onUpdateSettings={handleUpdateSettings}
                            notesCount={notes.length}
                            onResetSystem={handleReset}
                            onNotification={(title, text) => handleTriggerNotify("Impostazioni", title, text)}
                          />
                        )}
                      </AppWrapper>
                    );
                  })}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>

          {/* 3. INTERACTIVE SLIDE-DOWN CONTROL CENTER */}
          <AnimatePresence>
            {appState.isControlCenterOpen && (
              <ControlCenter
                key="controlcenter"
                isOpen={appState.isControlCenterOpen}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onClose={() => setAppState(prev => ({ ...prev, isControlCenterOpen: false }))}
                currentMedia={currentMedia}
              />
            )}
          </AnimatePresence>

          {/* Swipe handle at the top-right to indicate Control Center openable area */}
          {!appState.isLocked && !appState.isControlCenterOpen && (
            <div 
              onClick={() => setAppState(prev => ({ ...prev, isControlCenterOpen: true }))}
              className="absolute top-2 right-4 w-12 h-6 bg-white/5 active:bg-white/20 hover:scale-105 rounded-full flex items-center justify-center z-45 cursor-pointer border border-white/5 shadow-md text-white font-bold"
              style={{ fontSize: '7px' }}
              title="Apri Control Center"
            >
              CC ▽
            </div>
          )}

          {/* Interactive banner visual toasts system notifications slipping from notch of active screens */}
          <div className="absolute top-14 inset-x-4 pointer-events-none z-55 flex flex-col space-y-2">
            <AnimatePresence>
              {appState.notifications.filter(n => !n.read).slice(0, 1).map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ y: -80, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -100, opacity: 0, scale: 0.95 }}
                  className="bg-black/85 backdrop-blur-3xl border border-zinc-800 p-3 rounded-2xl flex items-center justify-between shadow-xl text-white pointer-events-auto cursor-pointer"
                  onClick={() => {
                    setAppState(prev => ({
                      ...prev,
                      notifications: prev.notifications.map(n => n.id === notif.id ? { ...notif, read: true } : n)
                    }));
                  }}
                >
                  <div className="flex items-start space-x-2.5 min-w-0 pr-3">
                    <div className="p-1 px-2 bg-blue-600/35 border border-blue-500/10 text-blue-400 rounded-lg text-[9px] font-bold uppercase shrink-0">
                      {notif.appName}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold tracking-tight">{notif.title}</h4>
                      <p className="text-[10px] text-zinc-300 truncate mt-0.5 max-w-[200px]">{notif.message}</p>
                    </div>
                  </div>
                  
                  <span className="text-[9px] text-zinc-400 font-mono shrink-0 font-medium">Chiudi</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* iOS Siri Assistant Interaction Shell */}
          <AnimatePresence>
            {isSiriOpen && (
              <SiriAssistant
                isOpen={isSiriOpen}
                onClose={() => setIsSiriOpen(false)}
                onTriggerApp={(appId) => {
                  handleOpenApp(appId);
                  setIsSiriOpen(false);
                }}
                onNotification={(title, text) => handleTriggerNotify("Siri", title, text)}
                systemVolume={settings.volume}
              />
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Desktop instructional widget overlay detailing rich tools on bottom side */}
      <div className="hidden lg:flex flex-col items-center mt-6 text-zinc-400 text-xs space-y-2">
        <p className="flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Fai click sul pulsante <strong>"CC ▽"</strong> in alto a destra per aprire il <strong>Centro di Controllo</strong></span>
        </p>
        <p className="flex items-center space-x-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Usa i tasti fisici sul bordo (volume a sinistra, blocco a destra) o la scorciatoia tastiera <strong>Alt + ↑ / ↓</strong> per regolare l'audio!</span>
        </p>
      </div>

    </div>
  );
}
