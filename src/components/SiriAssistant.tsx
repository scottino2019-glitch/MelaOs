import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Send, Sparkles, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface SiriAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerApp: (appId: string) => void;
  onNotification: (title: string, desc: string) => void;
}

const SIRI_SUGGESTIONS = [
  { text: 'Apri Scriba Note', query: 'apri note' },
  { text: 'Che tempo fa oggi?', query: 'che tempo fa' },
  { text: 'Avvia Swift Playground', query: 'apri playgrounds' },
  { text: 'Raccontami una barzelletta 🤖', query: 'barzelletta' },
  { text: 'Apro Foto Studio?', query: 'apri foto' }
];

const JOKES = [
  "Perché i programmatori preferiscono l'oscurità (il dark mode)? Perché la luce attira sempre i bug! 🐛",
  "Ci sono 10 tipi di persone al mondo: quelle che capiscono il binario, e quelle che non lo capiscono! 🤓",
  "Cosa fa un programmatore davanti a una tazza di caffè bollente? Un debug del vapore! ☕️",
  "Quanti programmatori ci vogliono per cambiare una lampadina? Nessuno, è un problema hardware! 🔌",
  "Perché l'HTML ha litigato con il CSS? Perché diceva che era troppo superficiale e pensava solo allo stile! 💅"
];

export default function SiriAssistant({ isOpen, onClose, onTriggerApp, onNotification }: SiriAssistantProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'siri'; text: string; date: Date }[]>([
    { sender: 'siri', text: 'Ciao! Sono Siri. Come posso esserti utile oggi?', date: new Date() }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAnswering]);

  const handleSendQuery = async (textQuery: string) => {
    if (!textQuery.trim()) return;

    // Add user query
    const userMsg = { sender: 'user' as const, text: textQuery.trim(), date: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsAnswering(true);

    // Collect iPad context for Siri
    let notesCount = 0;
    try {
      const savedNotes = localStorage.getItem('ios_notes_v1');
      if (savedNotes) {
        notesCount = JSON.parse(savedNotes).length;
      }
    } catch (e) {}

    let wallpaper = 'Predefinito';
    try {
      const savedSettings = localStorage.getItem('ios_settings_v1');
      if (savedSettings) {
        wallpaper = JSON.parse(savedSettings).wallpaper || 'Predefinito';
      }
    } catch (e) {}

    let weatherData = { city: 'Roma', temp: 22, condition: 'Sereno' };
    try {
      const savedWeather = localStorage.getItem('scriba_current_weather_v1');
      if (savedWeather) {
        weatherData = JSON.parse(savedWeather);
      }
    } catch (e) {}

    // Formulate previous history (omitting the first greeting message at index 0)
    const historyPayload = messages.slice(1).map(m => ({
      role: m.sender === 'user' ? 'user' : 'siri',
      text: m.text
    }));

    const contextPayload = {
      time: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      notesCount,
      wallpaper,
      weather: weatherData
    };

    const runOfflineFallback = () => {
      const normalized = textQuery.toLowerCase();
      const isActionQuery = normalized.includes('apri') || normalized.includes('avvia') || normalized.includes('mostra') || normalized.includes('vai a') || normalized.includes('lancia') || normalized.includes('aprimi') || normalized.includes('metti');
      let replyText = "Non sono sicura di aver capito la richiesta. Prova ad ordinarmi di aprire un'app (es. 'Apri Note' o 'Meteo') o chiedermi una barzelletta!";
      
      if (isActionQuery && (normalized.includes('note') || normalized.includes('scriba') || normalized.includes('scrivi'))) {
        replyText = "Certamente! Apro Scriba Note per te. Puoi ricominciare ad annotare i tuoi pensieri.";
        onTriggerApp('notes');
        onNotification("Siri", "Aperta Scriba Note");
      } 
      else if (isActionQuery && (normalized.includes('foto') || normalized.includes('studio') || normalized.includes('pixels') || normalized.includes('galleria') || normalized.includes('immagine'))) {
        replyText = "Subito! Apro Foto Studio così puoi ritoccare le tue foto o caricare nuovi scatti nella galleria.";
        onTriggerApp('pixels');
        onNotification("Siri", "Aperto Foto Studio");
      }
      else if (isActionQuery && (normalized.includes('video') || normalized.includes('player') || normalized.includes('film'))) {
        replyText = "Avvio subito l'applicazione Video Player. Buona visione!";
        onTriggerApp('video');
        onNotification("Siri", "Aperto Player Video");
      }
      else if (isActionQuery && (normalized.includes('calcolatrice') || normalized.includes('calco'))) {
        replyText = "Ecco la Calcolatrice pronta per fare i conti!";
        onTriggerApp('calculator');
        onNotification("Siri", "Aperta Calcolatrice");
      }
      else if (isActionQuery && (normalized.includes('playground') || normalized.includes('swift') || normalized.includes('playgrounds'))) {
        replyText = "Caricamento di Swift Playground completato! Pronti a scrivere del fantastico codice iOS.";
        onTriggerApp('playgrounds');
        onNotification("Siri", "Aperto Swift Playground");
      }
      else if (isActionQuery && (normalized.includes('meteo') || normalized.includes('tempo') || normalized.includes('gradi') || normalized.includes('pioggia') || normalized.includes('sole') || normalized.includes('prevision'))) {
        replyText = "Controllo il meteo locale ed apro l'applicazione Meteo così vedrai le previsioni complete in tempo reale!";
        setTimeout(() => {
          onTriggerApp('meteo');
          onNotification("Siri", "Aperto Meteo");
        }, 1000);
      }
      else if (isActionQuery && (normalized.includes('cartella') || normalized.includes('immagini') || normalized.includes('gallery') || normalized.includes('cartella img'))) {
        replyText = "Apro subito la tua Cartella Immagini.";
        onTriggerApp('gallery');
        onNotification("Siri", "Aperta Cartella Immagini");
      }
      else if (isActionQuery && (normalized.includes('impostazioni') || normalized.includes('settaggi') || normalized.includes('sfondo') || normalized.includes('dark') || normalized.includes('wallpaper'))) {
        replyText = "Apro subito le Impostazioni per te.";
        onTriggerApp('settings');
      }
      else if (normalized.includes('barzelletta') || normalized.includes('ridere') || normalized.includes('scherzo')) {
        const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
        replyText = `Ahahah, ecco una barzelletta tech per te! 🦾\n\n${randomJoke}`;
      }
      else if (normalized.includes('ciao') || normalized.includes('salve')) {
        replyText = "Ciao! Spero tu stia trascorrendo una fantastica giornata sul tuo iPad virtuale.";
      }
      else if (normalized.includes('grazie')) {
        replyText = "Prego! Resto sempre a tua disposizione per automatizzare i tuoi compiti.";
      }

      setMessages(prev => [...prev, { sender: 'siri' as const, text: replyText, date: new Date() }]);
      setIsAnswering(false);
    };

    try {
      const response = await fetch("/api/siri/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textQuery,
          context: contextPayload,
          chatHistory: historyPayload
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "GEMINI_API_KEY_MISSING") {
          const warningText = `Il servizio di intelligenza artificiale per Siri non è sincronizzato. 

Configura la tua chiave segreta in alto a destra cliccando su **Settings > Secrets** ed inserendo la tua **GEMINI_API_KEY**! 

Nel frattempo mi occuperò di gestire i comandi della tavoletta in modalità offline. Ad esempio scrivi: "Apri la calcolatrice" o "Raccontami una barzelletta"!`;
          setMessages(prev => [...prev, { sender: 'siri' as const, text: warningText, date: new Date() }]);
          setIsAnswering(false);
          return;
        }
        runOfflineFallback();
        return;
      }

      const data = await response.json();
      const siriReply = data.text || "Siri non ha risposto. Riprova tra un istante.";

      // Scan Siri's response for explicit modern Action Tags (e.g. [ACTION: calculator])
      let cleanReplyText = siriReply;
      let targetAppId: string | null = null;

      const actionRegex = /\[ACTION:\s*(\w+)\]/i;
      const actionMatch = siriReply.match(actionRegex);
      if (actionMatch) {
        targetAppId = actionMatch[1].toLowerCase();
        cleanReplyText = siriReply.replace(actionRegex, '').trim();
      }

      if (targetAppId) {
        const delay = 1000;
        if (targetAppId === 'calculator') {
          setTimeout(() => {
            onTriggerApp('calculator');
            onNotification("Siri", "Aperta Calcolatrice");
          }, delay);
        } else if (targetAppId === 'notes') {
          setTimeout(() => {
            onTriggerApp('notes');
            onNotification("Siri", "Aperta Scriba Note");
          }, delay);
        } else if (targetAppId === 'pixels') {
          setTimeout(() => {
            onTriggerApp('pixels');
            onNotification("Siri", "Aperto Foto Studio");
          }, delay);
        } else if (targetAppId === 'gallery') {
          setTimeout(() => {
            onTriggerApp('gallery');
            onNotification("Siri", "Aperta Cartella Immagini");
          }, delay);
        } else if (targetAppId === 'video') {
          setTimeout(() => {
            onTriggerApp('video');
            onNotification("Siri", "Aperto Player Video");
          }, delay);
        } else if (targetAppId === 'playgrounds') {
          setTimeout(() => {
            onTriggerApp('playgrounds');
            onNotification("Siri", "Aperto Swift Playground");
          }, delay);
        } else if (targetAppId === 'meteo') {
          setTimeout(() => {
            onTriggerApp('meteo');
            onNotification("Siri", "Aperto Meteo");
          }, delay);
        } else if (targetAppId === 'settings') {
          setTimeout(() => {
            onTriggerApp('settings');
          }, delay);
        }
      }

      setMessages(prev => [...prev, { sender: 'siri' as const, text: cleanReplyText, date: new Date() }]);
      setIsAnswering(false);

    } catch (err) {
      console.error("Errore fetch Siri API:", err);
      runOfflineFallback();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end justify-center pointer-events-auto p-4 sm:p-6 select-none font-sans">
      
      {/* Siri Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-xl rounded-t-[32px] rounded-b-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[85vh] text-zinc-100"
      >
        {/* Head header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-920/80 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-black tracking-tight text-zinc-200">Siri Assistant</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[45vh] bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[85%] text-xs py-3 px-4 rounded-2xl leading-relaxed whitespace-pre-wrap shadow-md ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-zinc-800 text-zinc-100 border border-white/5 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[8px] text-zinc-500 font-semibold mt-1 px-1">
                {m.date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}

          {/* Siri typing active thinking mode */}
          {isAnswering && (
            <div className="flex flex-col items-start">
              <div className="bg-zinc-800/60 border border-white/5 text-zinc-300 py-3 px-4 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                <span className="text-xs font-semibold">Siri sta riflettendo</span>
                <span className="flex space-x-1 items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Cards */}
        {messages.length === 1 && !isAnswering && (
          <div className="p-4 border-t border-white/5 bg-zinc-950/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Comandi veloci suggeriti:</span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 pr-2 select-none no-scrollbar">
              {SIRI_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(item.query)}
                  className="flex-shrink-0 bg-zinc-900 border border-white/5 hover:border-zinc-700 hover:bg-zinc-805/85 py-2 px-3.5 rounded-2xl text-xs font-semibold text-zinc-300 transition duration-150 flex items-center space-x-1 select-none cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400 text-xs flex-shrink-0" />
                  <span className="truncate">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Area: Glowing pulsating wave + Input section */}
        <div className="p-4 bg-zinc-950 border-t border-white/5 space-y-4">
          
          {/* Pulsating colorful Siri orb element */}
          <div className="flex justify-center flex-col items-center py-2 space-y-1.5">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Outer colored glowing halos simulating iOS siri waves */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 rounded-full blur-md opacity-70 animate-pulse" />
              <div className="absolute inset-2 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 rounded-full blur-sm opacity-90 animate-spin duration-3000" />
              <div className="absolute inset-3 bg-zinc-950 rounded-full" />
              <Mic className="absolute w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 animate-pulse">Parla o digita per comandare l'iPad</span>
          </div>

          {/* Form write panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                handleSendQuery(query);
              }
            }} 
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="Chiedi a Siri o dai un comando..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-zinc-900 border border-white/5 text-xs rounded-2xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl text-xs font-bold font-sans hover:scale-103 flex items-center justify-center active:scale-97 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </motion.div>
    </div>
  );
}
