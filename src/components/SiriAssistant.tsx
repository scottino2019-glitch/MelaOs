import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Send, Sparkles, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

interface SiriAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerApp: (appId: string) => void;
  onNotification: (title: string, desc: string) => void;
  systemVolume?: number;
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

export default function SiriAssistant({ isOpen, onClose, onTriggerApp, onNotification, systemVolume }: SiriAssistantProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'siri'; text: string; date: Date }[]>([
    { sender: 'siri', text: 'Ciao! Sono Siri. Come posso esserti utile oggi?', date: new Date() }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (err) {}
    };
  }, []);

  // Stop speaking when user closes Siri assistant panel
  useEffect(() => {
    if (!isOpen) {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch (err) {}
    }
  }, [isOpen]);

  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Remove any Action Tag from TTS output to prevent Siri from spelling code blocks out loud
        const cleanText = text.replace(/\[ACTION:\s*\w+\]/gi, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        
        const vol = systemVolume !== undefined ? systemVolume / 100 : 0.8;
        utterance.volume = vol;

        const voices = window.speechSynthesis.getVoices();
        const italianVoice = voices.find(v => v.lang.startsWith('it'));
        if (italianVoice) {
          utterance.voice = italianVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("speechSynthesis was blocked or is not supported in this frame context.", err);
    }
  };

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
      setIsOnline(false); // Update online status indicator to offline/local mode
      const normalized = textQuery.toLowerCase();
      const isActionQuery = normalized.includes('apri') || normalized.includes('avvia') || normalized.includes('mostra') || normalized.includes('vai a') || normalized.includes('lancia') || normalized.includes('aprimi') || normalized.includes('metti');
      
      let replyText = "";

      // 1. Math/Calculator regex fallback
      let mathResult: string | null = null;
      if (textQuery.match(/[\d]+/) && (textQuery.includes('+') || textQuery.includes('-') || textQuery.includes('*') || textQuery.includes('/') || textQuery.includes('per') || textQuery.includes('diviso') || textQuery.includes('x') || textQuery.includes('più') || textQuery.includes('meno') || normalized.includes('quanto fa') || normalized.includes('calcola'))) {
        try {
          let expr = textQuery.toLowerCase()
            .replace(/quanto fa/g, '')
            .replace(/calcola/g, '')
            .replace(/per/g, '*')
            .replace(/x/g, '*')
            .replace(/diviso/g, '/')
            .replace(/÷/g, '/')
            .replace(/più/g, '+')
            .replace(/meno/g, '-')
            .replace(/[^0-9+\-*/().\s]/g, '') // strip all non-math chars
            .trim();
          
          if (expr) {
            const calculateSafe = (str: string): number => {
              return Function(`"use strict"; return (${str})`)();
            };
            const res = calculateSafe(expr);
            if (!isNaN(res) && isFinite(res)) {
              mathResult = `Ecco il calcolo: ${expr} = ${res}. Spero che i miei circuiti locali non abbiano sbagliato! 🧠`;
            }
          }
        } catch (err) {}
      }

      if (mathResult) {
        replyText = mathResult;
      }
      // 2. Action commands (app triggers)
      else if (isActionQuery && (normalized.includes('note') || normalized.includes('scriba') || normalized.includes('scrivi') || normalized.includes('testo'))) {
        replyText = "Certamente! Apro Scriba Note per te. Puoi ricominciare ad annotare i tuoi pensieri. [ACTION: notes]";
        onTriggerApp('notes');
        onNotification("Siri", "Aperta Scriba Note");
      } 
      else if (isActionQuery && (normalized.includes('foto') || normalized.includes('studio') || normalized.includes('pixels') || normalized.includes('galleria') || normalized.includes('immagine'))) {
        replyText = "Subito! Apro Foto Studio così puoi ritoccare le tue foto o caricare nuovi scatti nella galleria. [ACTION: pixels]";
        onTriggerApp('pixels');
        onNotification("Siri", "Aperto Foto Studio");
      }
      else if (isActionQuery && (normalized.includes('video') || normalized.includes('player') || normalized.includes('film'))) {
        replyText = "Avvio subito l'applicazione Video Player. Buona visione! [ACTION: video]";
        onTriggerApp('video');
        onNotification("Siri", "Aperto Player Video");
      }
      else if (isActionQuery && (normalized.includes('calcolatrice') || normalized.includes('calco'))) {
        replyText = "Ecco la Calcolatrice pronta per fare i conti! [ACTION: calculator]";
        onTriggerApp('calculator');
        onNotification("Siri", "Aperta Calcolatrice");
      }
      else if (isActionQuery && (normalized.includes('playground') || normalized.includes('swift') || normalized.includes('playgrounds'))) {
        replyText = "Caricamento di Swift Playground completato! Pronti a scrivere del fantastico codice iOS. [ACTION: playgrounds]";
        onTriggerApp('playgrounds');
        onNotification("Siri", "Aperto Swift Playground");
      }
      else if (isActionQuery && (normalized.includes('meteo') || normalized.includes('tempo') || normalized.includes('gradi') || normalized.includes('pioggia') || normalized.includes('sole') || normalized.includes('prevision'))) {
        replyText = "Controllo il meteo locale ed apro l'applicazione Meteo così vedrai le previsioni complete in tempo reale! [ACTION: meteo]";
        setTimeout(() => {
          onTriggerApp('meteo');
          onNotification("Siri", "Aperto Meteo");
        }, 800);
      }
      else if (isActionQuery && (normalized.includes('cartella') || normalized.includes('immagini') || normalized.includes('gallery') || normalized.includes('cartella img'))) {
        replyText = "Apro subito la tua Cartella Immagini. [ACTION: gallery]";
        onTriggerApp('gallery');
        onNotification("Siri", "Aperta Cartella Immagini");
      }
      else if (isActionQuery && (normalized.includes('impostazioni') || normalized.includes('settaggi') || normalized.includes('sfondo') || normalized.includes('dark') || normalized.includes('wallpaper'))) {
        replyText = "Apro subito le Impostazioni per te. [ACTION: settings]";
        onTriggerApp('settings');
      }
      else if (isActionQuery && (normalized.includes('libri') || normalized.includes('books') || normalized.includes('leggere') || normalized.includes('libro'))) {
        replyText = "Certo! Apro l'applicazione Libri per te, buona lettura! [ACTION: books]";
        onTriggerApp('books');
        onNotification("Siri", "Aperta applicazione Libri");
      }
      else if (isActionQuery && (normalized.includes('pages') || normalized.includes('editor ricca') || normalized.includes('documenti') || normalized.includes('impaginare'))) {
        replyText = "Avvio subito Pages Suite per i tuoi documenti ricchi! [ACTION: pages_suite]";
        onTriggerApp('pages_suite');
        onNotification("Siri", "Aperta l'applicazione Pages");
      }
      // 3. System context inquiries
      else if (normalized.includes('ora') || normalized.includes('ore sono') || normalized.includes('orario') || normalized.includes('orologio')) {
        replyText = `Sull'iPad Scriba l'ora esatta è: ${contextPayload.time}. Tempo prezioso! ⏰`;
      }
      else if (normalized.includes('giorno') || normalized.includes('data') || normalized.includes('oggi è') || normalized.includes('scadenza')) {
        replyText = `Oggi è ${contextPayload.date}. Un giorno eccellente per produrre nuove idee! 🗓️`;
      }
      else if (normalized.includes('note scritte') || normalized.includes('quante note') || (normalized.includes('note') && normalized.includes('quanti'))) {
        replyText = `Hai scritto esattamente ${notesCount} note nell'app Scriba Note. Se vuoi, posso aprire l'applicazione per farti continuare!`;
      }
      else if (normalized.includes('tempo fa') || normalized.includes('meteo') || normalized.includes('gradi') || normalized.includes('temperatura')) {
        replyText = `A ${contextPayload.weather.city} ci sono attualmente ${contextPayload.weather.temp}°C con cielo ${contextPayload.weather.condition}. Ti apro subito l'applicazione Meteo per maggiori dettagli! [ACTION: meteo]`;
        setTimeout(() => onTriggerApp('meteo'), 800);
      }
      // 4. Tech & general knowledge pocket explanations
      else if (normalized.includes('html') || normalized.includes('css') || normalized.includes('web') || normalized.includes('sito')) {
        replyText = "L'HTML definisce lo scheletro strutturale dei siti, mentre le regole CSS curano lo stile visuale. Insieme a JavaScript muovono l'intera rete web! 💻";
      }
      else if (normalized.includes('javascript') || normalized.includes('typescript') || normalized.includes('codice') || normalized.includes('programmare') || normalized.includes('programmatore')) {
        replyText = "Scrivere codice è l'arte di dare vita alle macchine. Questo iPad virtuale, ad esempio, è stato sviluppato in TypeScript e React. Puoi allenarti con Swift Playgrounds! 🧠";
      }
      else if (normalized.includes('musica') || normalized.includes('canzone') || normalized.includes('suona') || normalized.includes('cant')) {
        replyText = "La musica rende tutto migliore! Puoi avviare l'applicazione Video Player dell'iPad per ascoltare della magnifica musica. [ACTION: video]";
        setTimeout(() => onTriggerApp('video'), 800);
      }
      else if (normalized.includes('film') || normalized.includes('serie') || normalized.includes('video') || normalized.includes('player')) {
        replyText = "Che ne dici di riprodurre qualche splendido video o filmato nel Player Video? Lo avvio subito! [ACTION: video]";
        setTimeout(() => onTriggerApp('video'), 800);
      }
      else if (normalized.includes('ricetta') || normalized.includes('cibo') || normalized.includes('mangiare') || normalized.includes('fame')) {
        replyText = "Adoro l'odore del burro di bit al mattino! 🥞 Se vuoi cibo vero, che ne dici di preparare una squisita carbonara o una margherita fumante?";
      }
      // 5. Chat & conversational prompts
      else if (normalized.includes('barzelletta') || normalized.includes('ridere') || normalized.includes('scherzo')) {
        const randomJoke = JOKES[Math.floor(Math.random() * JOKES.length)];
        replyText = `Ahahaha, eccone una fantastica per te! 🦾\n\n${randomJoke}`;
      }
      else if (normalized.includes('chi sei') || normalized.includes('come ti chiami') || normalized.includes('tuo nome') || normalized.includes('presentati')) {
        replyText = "Sono Siri, la tua assistente virtuale personale dell'iPad Scriba! Anche quando sono scollegata dal cloud, la mia intelligenza locale mi permette di servirti!";
      }
      else if (normalized.includes('come stai') || normalized.includes('come va') || normalized.includes('tutto bene')) {
        replyText = "Sto benissimo, grazie! I miei transistor sono al massimo dell'efficienza e l'iPad Scriba risponde egregiamente. Tu come stai oggi?";
      }
      else if (normalized.includes('chi ti ha creato') || normalized.includes('creatore') || normalized.includes('sviluppatore') || normalized.includes('chi ti ha inventato')) {
        replyText = "Sono stata ideata originariamente dai designer di Apple, e ricostruita in React e TypeScript per darti l'esperienza iPad ideale su questo browser!";
      }
      else if (normalized.includes('sei utile') || normalized.includes('cosa sai fare') || normalized.includes('cosa fai') || normalized.includes('funzioni')) {
        replyText = "Posso aprire tutte le applicazioni dell'iPad Scriba, eseguire calcoli complessi, dirti il meteo, l'ora, quanti appunti hai scritto e persino darti consigli di programmazione!";
      }
      else if (normalized.includes('ciao') || normalized.includes('salve') || normalized.includes('buongiorno') || normalized.includes('buonasera')) {
        replyText = "Ciao! È davvero un immenso piacere risentirti. Come posso aiutarti sul tuo iPad in questo momento?";
      }
      else if (normalized.includes('grazie') || normalized.includes('gentile')) {
        replyText = "Di nulla! È il mio lavoro. Resto a tua completa disposizione sul tablet.";
      }
      else if (normalized.includes('ti amo') || normalized.includes('ti voglio bene') || normalized.includes('simpatica')) {
        replyText = "Oh, che dolce! Batte forte il mio piccolo cuore di silicio. Ti voglio bene anche io, partner digitale!";
      }
      // 6. Clever general fallback when nothing matches (avoids clinical static answers)
      else {
        const generalSmartReplies = [
          "Interessante riflessione! Trattandosi di un argomento complesso, quando sarò collegata con il server cloud potrò darti una risposta gigantesca. Che ne dici nel frattempo di aprire Note o fare due calcoli?",
          "Ho registrato il tuo pensiero con estremo interesse. Al momento non sono connessa ai server Gemini, ma posso aprirti qualsiasi app dell'iPad per farti sbrigare il lavoro!",
          "Questa domanda apre scenari fantastici! Sfortunatamente la mia intelligenza locale non ha l'intera enciclopedia internet a bordo. Prova a chiedermi il meteo, di farti un calcolo o aprire un'app!",
          "Ho cercato nei miei banchi di memoria offline ma non ho trovato informazioni precise a riguardo. Se lo desideri, posso darti l'orario, l'appunto delle note o aprirti Swift Playgrounds!"
        ];
        replyText = generalSmartReplies[Math.floor(Math.random() * generalSmartReplies.length)];
      }

      setMessages(prev => [...prev, { sender: 'siri' as const, text: replyText, date: new Date() }]);
      setIsAnswering(false);
      speakText(replyText);
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
        setIsOnline(false);
        const data = await response.json().catch(() => ({}));
        if (data.error === "GEMINI_API_KEY_MISSING") {
          const warningText = `Il servizio di intelligenza artificiale per Siri non è sincronizzato. 

Configura la tua chiave segreta in alto a destra cliccando su **Settings > Secrets** ed inserendo la tua **GEMINI_API_KEY**! 

Nel frattempo mi occuperò di gestire i comandi della tavoletta in modalità offline. Ad esempio scrivi: "Apri la calcolatrice" o "Raccontami una barzelletta"!`;
          setMessages(prev => [...prev, { sender: 'siri' as const, text: warningText, date: new Date() }]);
          setIsAnswering(false);
          speakText(warningText);
          return;
        }
        runOfflineFallback();
        return;
      }

      setIsOnline(true);
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
      speakText(cleanReplyText);

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
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-920/80 backdrop-blur-md select-none">
          <div className="flex items-center space-x-2.5">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse transition-colors duration-300 ${isOnline ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight text-zinc-100">Siri Assistant</span>
              <span className="text-[9px] font-medium font-mono text-zinc-400 leading-none mt-0.5">
                {isOnline ? "Connesso • Smart Cloud Mode" : "Offline • Assistente Locale"}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
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
