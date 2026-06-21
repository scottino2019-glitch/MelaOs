import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, BatteryCharging, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../types';

interface StatusBarProps {
  settings: SystemSettings;
  onOpenControlCenter: () => void;
  onOpenSiri?: () => void;
}

export default function StatusBar({ settings, onOpenControlCenter, onOpenSiri }: StatusBarProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      id="ios-status-bar"
      className="absolute top-0 left-0 right-0 h-12 px-6 flex items-center justify-between text-xs font-semibold select-none z-50 text-white drop-shadow-sm pointer-events-auto"
      onClick={onOpenControlCenter}
      title="Clicca per aprire il Centro di Controllo"
    >
      {/* Time & Siri */}
      <div className="flex items-center space-x-2.5">
        <span className="cursor-pointer">{time}</span>
        {onOpenSiri && (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Stop opening control center
              onOpenSiri();
            }}
            className="flex items-center justify-center p-[1px] bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 rounded-full hover:scale-108 active:scale-95 transition-all shadow-md relative group cursor-pointer border border-white/10"
            title="Chiedi a Siri"
          >
            <div className="bg-zinc-950 p-1 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
          </button>
        )}
      </div>

      {/* Notch indicator for iPhone style */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-36 h-7 bg-black rounded-b-2xl flex items-center justify-center pointer-events-none shadow-inner border-b border-zinc-800/10">
        <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full ml-12"></div>
        <div className="w-8 h-1 bg-zinc-900 rounded-full ml-3"></div>
      </div>

      {/* Status Icons */}
      <div className="flex items-center space-x-2.5 cursor-pointer">
        {settings.airplaneMode ? (
          <span className="text-[10px] tracking-widest uppercase text-amber-400">Airplane</span>
        ) : (
          <>
            <Signal className="w-3.5 h-3.5" />
            {settings.wifiEnabled ? (
              <Wifi className="w-3.5 h-3.5 text-white" />
            ) : (
              <span className="text-[10px] font-bold text-zinc-300">LTE</span>
            )}
          </>
        )}
        
        {settings.bluetoothEnabled && (
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="Bluetooth Attivo" />
        )}

        <div className="flex items-center space-x-1">
          <span className="text-[10px]">{settings.batteryLevel}%</span>
          <div className="relative flex items-center">
            {settings.isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (
              <Battery className={`w-4 h-4 ${settings.batteryLevel <= 20 ? 'text-rose-500 animate-pulse' : 'text-white'}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
