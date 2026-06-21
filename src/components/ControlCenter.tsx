import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, WifiOff, Plane, Bluetooth, Sun, Volume2, VolumeX, Moon, 
  Lightbulb, Shield, Eye, BatteryCharging, Play, Pause, ChevronDown, Check
} from 'lucide-react';
import { SystemSettings } from '../types';

interface ControlCenterProps {
  key?: string;
  isOpen: boolean;
  settings: SystemSettings;
  onUpdateSettings: (settings: Partial<SystemSettings>) => void;
  onClose: () => void;
  currentMedia?: {
    title: string;
    isPlaying: boolean;
    onTogglePlay: () => void;
  };
}

export default function ControlCenter({ isOpen, settings, onUpdateSettings, onClose, currentMedia }: ControlCenterProps) {
  if (!isOpen) return null;

  return (
    <div id="ios-control-center-overlay" className="absolute inset-0 w-full h-full z-50 overflow-hidden pointer-events-none">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Control panel slide down */}
      <motion.div
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="absolute top-0 right-4 left-4 md:right-8 md:left-auto md:w-96 bg-zinc-900/90 backdrop-blur-3xl border border-white/10 p-6 rounded-b-[40px] shadow-2xl text-white pointer-events-auto z-50 flex flex-col space-y-5"
      >
        {/* Notch alignment spacer */}
        <div className="h-5" />

        {/* Header with Close indicator */}
        <div className="flex items-center justify-between border-b border-white/15 pb-2">
          <span className="text-sm font-bold tracking-wide">Centro di Controllo</span>
          <button 
            onClick={onClose}
            className="w-7 h-7 bg-white/10 hover:bg-white/15 active:scale-95 rounded-full flex items-center justify-center transition-all"
          >
            <ChevronDown className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Control Grid block */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Connectivity Box (iOS typical style) */}
          <div className="bg-white/10 border border-white/5 p-3.5 rounded-[28px] grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onUpdateSettings({ 
                  airplaneMode: !settings.airplaneMode,
                  ...( (!settings.airplaneMode) ? { wifiEnabled: false, bluetoothEnabled: false } : { wifiEnabled: true, bluetoothEnabled: true } )
                });
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                settings.airplaneMode ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
              title="Uso in aereo"
            >
              <Plane className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (settings.airplaneMode) return;
                onUpdateSettings({ wifiEnabled: !settings.wifiEnabled });
              }}
              disabled={settings.airplaneMode}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                settings.wifiEnabled ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15 disabled:opacity-30'
              }`}
              title="Wi-Fi"
            >
              {settings.wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                if (settings.airplaneMode) return;
                onUpdateSettings({ bluetoothEnabled: !settings.bluetoothEnabled });
              }}
              disabled={settings.airplaneMode}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                settings.bluetoothEnabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/15 disabled:opacity-30'
              }`}
              title="Bluetooth"
            >
              <Bluetooth className="w-5 h-5" />
            </button>

            <button
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                settings.darkMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
              title="Tema Scuro / Chiaro"
            >
              <Moon className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status details box */}
          <div className="bg-white/10 border border-white/5 p-3.5 rounded-[28px] flex flex-col justify-between text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Batteria</span>
              {settings.isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="font-semibold text-emerald-400">{settings.batteryLevel}%</span>
              )}
            </div>
            
            <span className="text-[10px] leading-tight text-white/70">
              {settings.isCharging ? 'In carica...' : 'Scarica prevista: ~14 ore'}
            </span>

            <div className="flex space-x-1.5 mt-2">
              <button
                onClick={() => onUpdateSettings({ flashlight: !settings.flashlight })}
                className={`flex-1 py-1 px-2 rounded-xl text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  settings.flashlight ? 'bg-amber-400 text-black font-bold' : 'bg-white/10 text-white'
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                <span>Torcia: {settings.flashlight ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sliders Block */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Slider Volume */}
          <div className="bg-white/10 border border-white/5 p-4 rounded-[28px] flex flex-col items-center justify-between space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-zinc-400">Volume</span>
              <button
                onClick={() => onUpdateSettings({ volume: settings.volume > 0 ? 0 : 50 })}
                className="hover:text-blue-400 transition"
              >
                {settings.volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative w-full flex items-center h-24">
              <input 
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
                className="absolute inset-x-0 w-full accent-blue-500 bg-white/15 h-2 rounded-lg cursor-pointer outline-none"
              />
              {/* Vertical look can be simulated by custom bars or just horizontal input that fits */}
            </div>
            <span className="text-[10px] font-mono text-zinc-300">{settings.volume}%</span>
          </div>

          {/* Slider Brightness */}
          <div className="bg-white/10 border border-white/5 p-4 rounded-[28px] flex flex-col items-center justify-between space-y-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-zinc-400">Luminosità</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="relative w-full flex items-center h-24">
              <input 
                type="range"
                min="10"
                max="100"
                value={settings.brightness}
                onChange={(e) => onUpdateSettings({ brightness: Number(e.target.value) })}
                className="absolute inset-x-0 w-full accent-amber-400 bg-white/15 h-2 rounded-lg cursor-pointer outline-none"
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-300">{settings.brightness}%</span>
          </div>

        </div>

        {/* Media Control Widget */}
        <div className="bg-white/10 border border-white/5 p-4 rounded-[28px]">
          <div className="text-[10px] text-zinc-450 uppercase font-bold tracking-wider mb-2">In Riproduzione</div>
          {currentMedia ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-3">
                <p className="text-xs font-semibold truncate text-white">{currentMedia.title}</p>
                <p className="text-[10px] text-zinc-400">Lettore Video iOS</p>
              </div>
              <button
                onClick={currentMedia.onTogglePlay}
                className="w-10 h-10 bg-white hover:bg-zinc-200 active:scale-95 text-black rounded-full flex items-center justify-center transition-all"
              >
                {currentMedia.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-1 italic">Nessun video in riproduzione</div>
          )}
        </div>

        {/* Touch Bar Home feedback indicator */}
        <div 
          onClick={onClose}
          className="w-24 h-1.5 bg-white/30 hover:bg-white/50 rounded-full mx-auto cursor-pointer mt-2" 
        />
      </motion.div>
    </div>
  );
}
