import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Smartphone, Terminal, Award, 
  Code, RefreshCw, Sparkles, Trash2,
  Edit3, CheckCircle2, ChevronRight, RotateCcw,
  Plus, Layers, Eye, Layout, Monitor, Music,
  ShoppingBag, Heart, MessageCircle, Share2,
  ChevronLeft, FastForward, Rewind, Volume2,
  Check, AlertTriangle, Lightbulb, Sparkle, ArrowRight, Copy
} from 'lucide-react';

interface AppSwiftPlaygroundsProps {
  onNotification: (title: string, message: string) => void;
}

// Preset SwiftUI Apps with rich, realistic interactive behavior
interface CodePreset {
  id: string;
  name: string;
  category: 'SwiftUI' | 'Basics' | 'Game';
  description: string;
  icon: string;
  code: string;
}

const PRESETS: CodePreset[] = [
  {
    id: 'pizza_app',
    name: '🍕 Pizza Gourmet iOS',
    category: 'SwiftUI',
    description: 'App di ordinazione pizze con carrello, selettore quantita, sconti e cassa.',
    icon: '🍕',
    code: `import SwiftUI

struct PizzeriaBellaNapoli: View {
    @State var margherita = 1
    @State var diavola = 0
    @State var quattroFormaggi = 0
    
    var body: some View {
        VStack(spacing: 16) {
            Text("🍕 Bella Napoli Gourmet")
                .font(.title)
                .foregroundColor(.orange)
            
            Text("Ordina le tue pizze preferite")
                .font(.subheadline)
            
            VStack(spacing: 12) {
                // Margherita Card
                HStack {
                    Text("🍕 Margherita (8€)")
                    Spacer()
                    Button("-") { if margherita > 0 { margherita -= 1 } }
                    Text("\\(margherita)")
                    Button("+") { margherita += 1 }
                }
                
                // Diavola Card
                HStack {
                    Text("🌶️ Diavola (10€)")
                    Spacer()
                    Button("-") { if diavola > 0 { diavola -= 1 } }
                    Text("\\(diavola)")
                    Button("+") { diavola += 1 }
                }
                
                // Quattro Formaggi
                HStack {
                    Text("🧀 4 Formaggi (11€)")
                    Spacer()
                    Button("-") { if quattroFormaggi > 0 { quattroFormaggi -= 1 } }
                    Text("\\(quattroFormaggi)")
                    Button("+") { quattroFormaggi += 1 }
                }
            }
            
            Button("Svuota Carrello") {
                margherita = 0
                diavola = 0
                quattroFormaggi = 0
                print("Carrello azzerato")
            }
        }
    }
}`
  },
  {
    id: 'music_player',
    name: '🎵 Music Player iOS',
    category: 'SwiftUI',
    description: 'Lettore musicale con riproduzione, brani, mi piace e controlli.',
    icon: '🎵',
    code: `import SwiftUI

struct MusicPlayerView: View {
    @State var isPlaying = false
    @State var isLiked = false
    @State var songIndex = 0
    
    let brani = ["Midnights Rain - Taylor", "Starboy - The Weeknd", "Blinding Lights - The Weeknd"]
    
    var body: some View {
        VStack(spacing: 18) {
            Text("🎵 Music Player iOS")
                .font(.headline)
            
            Text(brani[songIndex])
                .font(.title)
                .foregroundColor(.cyan)
            
            HStack(spacing: 24) {
                Button("⏮️ Brano Prec") {
                    if songIndex > 0 { songIndex -= 1 }
                    print("Brano precedente")
                }
                
                Button(isPlaying ? "⏸️ Pausa" : "▶️ Play") {
                    isPlaying = !isPlaying
                    print("Riproduzione: \\(isPlaying)")
                }
                
                Button("⏭️ Prossimo") {
                    songIndex = (songIndex + 1) % 3
                    print("Nuovo brano")
                }
            }
            
            Button(isLiked ? "❤️ Nei Preferiti" : "🤍 Aggiungi ai Preferiti") {
                isLiked = !isLiked
                print("Preferito: \\(isLiked)")
            }
        }
    }
}`
  },
  {
    id: 'social_feed',
    name: '📸 InstaSwift Feed',
    category: 'SwiftUI',
    description: 'Social network con post, mi piace, commenti e segui.',
    icon: '📸',
    code: `import SwiftUI

struct InstaSwiftPost: View {
    @State var likes = 142
    @State var isLiked = false
    @State var commentsCount = 18
    @State var isFollowing = false
    
    var body: some View {
        VStack(spacing: 14) {
            HStack {
                Text("👤 marco_rossi_ios")
                    .font(.headline)
                
                Button(isFollowing ? "Seguito" : "+ Segui") {
                    isFollowing = !isFollowing
                    print("Stato follow: \\(isFollowing)")
                }
            }
            
            Text("🖼️ Tramonto mozzafiato a Costiera Amalfitana! 🌅 #swiftui #ios")
                .font(.body)
            
            HStack(spacing: 20) {
                Button(isLiked ? "❤️ \\(likes) Mi Piace" : "🤍 \\(likes) Mi Piace") {
                    if isLiked {
                        likes -= 1
                    } else {
                        likes += 1
                    }
                    isLiked = !isLiked
                    print("Likes: \\(likes)")
                }
                
                Button("💬 \\(commentsCount) Commenti") {
                    commentsCount += 1
                    print("Nuovo commento inserito!")
                }
            }
        }
    }
}`
  },
  {
    id: 'scratch',
    name: '✍️ Scrivi da Zero (App Libera)',
    category: 'SwiftUI',
    description: 'Crea da zero la tua app scrivendo liberamente codice Swift e SwiftUI.',
    icon: '✍️',
    code: `import SwiftUI

struct MiaAppCustom: View {
    @State var titolo = "La Mia Nuova App iOS"
    @State var messaggio = "Scrivi il tuo codice Swift e SwiftUI!"
    
    var body: some View {
        VStack(spacing: 16) {
            Text(titolo)
                .font(.title)
                .foregroundColor(.orange)
            
            Text(messaggio)
                .font(.body)
            
            Button("🚀 Clicca Qui") {
                messaggio = "Hai premuto il pulsante nell'iPhone!"
                print("Pulsante premuto con successo!")
            }
        }
    }
}`
  }
];

// Puzzle Level Data for Byte
interface Level {
  id: number;
  title: string;
  description: string;
  gridSize: number;
  startX: number;
  startY: number;
  gems: { x: number; y: number; collected: boolean }[];
  defaultCode: string;
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: "Livello 1: Raccogli la Prima Gemma 💎",
    description: "Aiuta Byte a muoversi avanti di 3 caselle e raccogliere la gemma con raccogliGemma().",
    gridSize: 5,
    startX: 0,
    startY: 2,
    gems: [{ x: 3, y: 2, collected: false }],
    defaultCode: `// Codice Swift per guidare Byte
muoviAvanti()
muoviAvanti()
muoviAvanti()
raccogliGemma()`
  },
  {
    id: 2,
    title: "Livello 2: La Svolta a Destra 🔄",
    description: "Fai avanzare Byte, poi fallo girare a destra verso la gemma lucente.",
    gridSize: 5,
    startX: 1,
    startY: 1,
    gems: [{ x: 3, y: 3, collected: false }],
    defaultCode: `muoviAvanti()
muoviAvanti()
giraDestra()
muoviAvanti()
muoviAvanti()
raccogliGemma()`
  },
  {
    id: 3,
    title: "Livello 3: Ciclo For in Swift 🔁",
    description: "Usa un ciclo 'for' in Swift per raccogliere 3 gemme consecutive!",
    gridSize: 5,
    startX: 0,
    startY: 2,
    gems: [
      { x: 1, y: 2, collected: false },
      { x: 2, y: 2, collected: false },
      { x: 3, y: 2, collected: false }
    ],
    defaultCode: `for i in 1...3 {
    muoviAvanti()
    raccogliGemma()
}`
  }
];

export default function AppSwiftPlaygrounds({ onNotification }: AppSwiftPlaygroundsProps) {
  // Main Tab Navigation: 'code' (Editor Codice Swift), 'preview' (Simulatore iPhone), 'puzzles' (Gioco Byte)
  const [mainTab, setMainTab] = useState<'code' | 'preview' | 'puzzles'>('code');

  // Layout mode in Editor tab: 'full' (Solo Editor Maxi) or 'split' (Editor + iPhone affiancati)
  const [editorLayout, setEditorLayout] = useState<'full' | 'split'>('full');

  // Sub-view in Byte Tab on Mobile: 'island' (Campo Gioco), 'code' (Editor Istruzioni), 'split' (Affiancati)
  const [byteSubTab, setByteSubTab] = useState<'island' | 'code' | 'split'>('code');

  // FREEFORM SWIFT EDITOR STATES
  const [editorCode, setEditorCode] = useState<string>(PRESETS[0].code);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const [editorStdout, setEditorStdout] = useState<string[]>(["// Compilatore Swift 6.1 pronto.", "// Clicca '▶️ ESEGUI' per testare ed aggiornare l'iPhone."]);
  const [isExecutingEditor, setIsExecutingEditor] = useState<boolean>(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Dynamic Parsed SwiftUI State
  const [parsedStateVars, setParsedStateVars] = useState<Record<string, any>>({
    margherita: 1,
    diavola: 0,
    quattroFormaggi: 0
  });
  const [parsedViewTitle, setParsedViewTitle] = useState<string>('PizzeriaBellaNapoli');

  // PUZZLE GAME STATES
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const currentLevel = LEVELS[currentLevelIdx];
  const [puzzleCode, setPuzzleCode] = useState<string>(currentLevel.defaultCode);
  const [byteX, setByteX] = useState<number>(currentLevel.startX);
  const [byteY, setByteY] = useState<number>(currentLevel.startY);
  const [byteDirection, setByteDirection] = useState<'N' | 'E' | 'S' | 'W'>('E');
  const [gems, setGems] = useState(JSON.parse(JSON.stringify(currentLevel.gems)));
  const [isPuzzleSimulating, setIsPuzzleSimulating] = useState<boolean>(false);
  const [puzzleConsole, setPuzzleConsole] = useState<string[]>(["Istruzioni trasmesse a Byte."]);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  // Load Preset Code
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setEditorCode(preset.code);
    setEditorError(null);
    setEditorStdout([`// Caricato template: ${preset.name}`, "// Clicca '▶️ ESEGUI' per testare l'app nell'iPhone."]);
  };

  const handleWriteFromScratch = () => {
    setSelectedPresetId('scratch');
    setEditorCode(`import SwiftUI

struct MiaAppCustom: View {
    @State var titolo = "La Mia Nuova App iOS"
    @State var messaggio = "Scrivi il tuo codice Swift e SwiftUI!"
    
    var body: some View {
        VStack(spacing: 16) {
            Text(titolo)
                .font(.title)
                .foregroundColor(.orange)
            
            Text(messaggio)
                .font(.body)
            
            Button("🚀 Clicca Qui") {
                messaggio = "Hai premuto il pulsante nell'iPhone!"
                print("Pulsante premuto con successo!")
            }
        }
    }
}`);
    setEditorError(null);
    setEditorStdout(["// ✍️ Scrivi da Zero attivato!", "// Modifica il codice qui sotto e clicca '▶️ ESEGUI'."]);
  };

  // Quick Snippet Insert in Main Editor
  const insertMainSnippet = (snippet: string) => {
    setEditorCode(prev => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
  };

  // ----------------------------------------------------
  // SWIFT CODE INTERPRETER & DYNAMIC UI PARSER
  // ----------------------------------------------------
  const runFreeformSwiftCode = () => {
    setIsExecutingEditor(true);
    setEditorError(null);
    const logs: string[] = ["🚀 Esecuzione codice Swift 6.1..."];

    try {
      const envVariables: Record<string, any> = {};
      const lines = editorCode.split('\n');
      const initialState: Record<string, any> = {};
      let extractedTitle = 'AppSwiftUI';

      // Pass 1: Parse struct name and @State variables
      lines.forEach(line => {
        const trimmed = line.trim();
        
        // Struct Title
        const structMatch = trimmed.match(/struct\s+(\w+)\s*:\s*View/);
        if (structMatch) extractedTitle = structMatch[1];

        // @State Variables
        const stateMatch = trimmed.match(/@State\s+var\s+(\w+)\s*=\s*(.+)/);
        if (stateMatch) {
          const vName = stateMatch[1];
          let rawVal = stateMatch[2].trim();
          if (rawVal === 'true') initialState[vName] = true;
          else if (rawVal === 'false') initialState[vName] = false;
          else if (!isNaN(Number(rawVal))) initialState[vName] = Number(rawVal);
          else if (rawVal.startsWith('"') && rawVal.endsWith('"')) initialState[vName] = rawVal.slice(1, -1);
          else initialState[vName] = rawVal;
        }
      });

      // Expression Evaluator Helper
      const evalExpr = (expr: string, context: Record<string, any>): any => {
        let clean = expr.trim();
        if (clean.includes('\\(')) {
          clean = clean.replace(/\\\((\w+)\)/g, (_, v) => {
            return context[v] !== undefined ? String(context[v]) : (initialState[v] !== undefined ? String(initialState[v]) : `\\(${v})`);
          });
        }
        if (clean.startsWith('"') && clean.endsWith('"')) return clean.slice(1, -1);
        if (!isNaN(Number(clean))) return Number(clean);
        if (clean === 'true') return true;
        if (clean === 'false') return false;
        if (context[clean] !== undefined) return context[clean];
        if (initialState[clean] !== undefined) return initialState[clean];
        return clean;
      };

      // Pass 2: Execute non-UI Swift script lines
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('//') || line.startsWith('import ')) continue;

        if (line.startsWith('print(') && line.endsWith(')')) {
          const inner = line.slice(6, -1);
          logs.push(`[stdout] ${evalExpr(inner, envVariables)}`);
          continue;
        }

        const varMatch = line.match(/(let|var)\s+(\w+)\s*=\s*(.+)/);
        if (varMatch) {
          envVariables[varMatch[2]] = evalExpr(varMatch[3], envVariables);
          continue;
        }

        // Variable Mutations
        const mutMatch = line.match(/(\w+)\s*(\+=|-=|=)\s*(.+)/);
        if (mutMatch && !line.startsWith('let ') && !line.startsWith('var ') && !line.startsWith('@State')) {
          const vn = mutMatch[1];
          const op = mutMatch[2];
          const rhs = evalExpr(mutMatch[3], envVariables);
          if (op === '=') envVariables[vn] = rhs;
          else if (op === '+=') envVariables[vn] = (envVariables[vn] || 0) + Number(rhs);
          else if (op === '-=') envVariables[vn] = (envVariables[vn] || 0) - Number(rhs);
          continue;
        }

        // For Loops
        const forMatch = line.match(/for\s+(\w+)\s+in\s+(\d+)\.\.\.(\d+)\s*\{/);
        if (forMatch) {
          const iterVar = forMatch[1];
          const startNum = parseInt(forMatch[2]);
          const endNum = parseInt(forMatch[3]);
          const loopBody: string[] = [];
          let j = i + 1;
          while (j < lines.length && lines[j].trim() !== '}') {
            loopBody.push(lines[j].trim());
            j++;
          }
          i = j;

          for (let val = startNum; val <= endNum; val++) {
            envVariables[iterVar] = val;
            loopBody.forEach(bLine => {
              if (bLine.startsWith('print(') && bLine.endsWith(')')) {
                logs.push(`[stdout] ${evalExpr(bLine.slice(6, -1), envVariables)}`);
              }
            });
          }
          continue;
        }
      }

      logs.push("✅ Codice eseguito! Vai al Simulatore iPhone per testare l'App.");
      setEditorStdout(logs);
      setParsedStateVars(initialState);
      setParsedViewTitle(extractedTitle);

    } catch (err: any) {
      setEditorError(`Errore Swift: ${err?.message || 'Verifica il codice'}`);
      setEditorStdout(prev => [...prev, `❌ [Errore] ${err?.message}`]);
    } finally {
      setIsExecutingEditor(false);
    }
  };

  useEffect(() => {
    runFreeformSwiftCode();
  }, [selectedPresetId]);

  // State Action Handler for Interactive iPhone Simulator
  const updateStateVar = (key: string, valueOrFn: any) => {
    setParsedStateVars(prev => {
      const next = { ...prev };
      if (typeof valueOrFn === 'function') {
        next[key] = valueOrFn(next[key]);
      } else {
        next[key] = valueOrFn;
      }
      setEditorStdout(logs => [...logs, `[iPhone Touch] State update ➔ ${key} = ${JSON.stringify(next[key])}`]);
      return next;
    });
  };

  // PUZZLE GAME RESET & RUN
  const resetPuzzle = () => {
    const lvl = LEVELS[currentLevelIdx];
    setPuzzleCode(lvl.defaultCode);
    setByteX(lvl.startX);
    setByteY(lvl.startY);
    setByteDirection('E');
    setGems(JSON.parse(JSON.stringify(lvl.gems)));
    setIsPuzzleSimulating(false);
    setPuzzleConsole(["Pronto ad eseguire. Usa i comandi per far avanzare Byte!"]);
    setPuzzleError(null);
  };

  useEffect(() => {
    resetPuzzle();
  }, [currentLevelIdx]);

  const insertByteCmd = (cmd: string) => {
    setPuzzleCode(prev => prev + (prev.endsWith('\n') ? '' : '\n') + cmd);
  };

  const runPuzzle = () => {
    if (isPuzzleSimulating) return;
    setIsPuzzleSimulating(true);
    setPuzzleError(null);
    setPuzzleConsole(["⚙️ Avvio esecuzione comandi Byte..."]);

    const lvl = LEVELS[currentLevelIdx];
    let cx = lvl.startX;
    let cy = lvl.startY;
    let cdir: 'N'|'E'|'S'|'W' = 'E';
    let cGems = JSON.parse(JSON.stringify(lvl.gems));
    const steps: { x: number; y: number; dir?: 'N'|'E'|'S'|'W'; msg: string; err?: boolean; collect?: boolean }[] = [];

    const cmds = puzzleCode.split('\n');
    for (const rawCmd of cmds) {
      const c = rawCmd.trim();
      if (!c || c.startsWith('//')) continue;

      if (c === 'muoviAvanti()') {
        if (cdir === 'E') cx++;
        else if (cdir === 'W') cx--;
        else if (cdir === 'S') cy++;
        else if (cdir === 'N') cy--;

        if (cx < 0 || cx >= lvl.gridSize || cy < 0 || cy >= lvl.gridSize) {
          steps.push({ x: cx, y: cy, msg: '⚠️ Byte ha urtato il bordo dell\'isola!', err: true });
          break;
        }
        steps.push({ x: cx, y: cy, dir: cdir, msg: `Spostamento avanti a (${cx}, ${cy})` });
      } else if (c === 'giraDestra()') {
        const turnMap: Record<'N'|'E'|'S'|'W', 'N'|'E'|'S'|'W'> = { 'N':'E', 'E':'S', 'S':'W', 'W':'N' };
        cdir = turnMap[cdir];
        steps.push({ x: cx, y: cy, dir: cdir, msg: `Byte gira a destra verso ${cdir}` });
      } else if (c === 'giraSinistra()') {
        const turnMap: Record<'N'|'E'|'S'|'W', 'N'|'E'|'S'|'W'> = { 'N':'W', 'W':'S', 'S':'E', 'E':'N' };
        cdir = turnMap[cdir];
        steps.push({ x: cx, y: cy, dir: cdir, msg: `Byte gira a sinistra verso ${cdir}` });
      } else if (c === 'raccogliGemma()') {
        const found = cGems.find((g: any) => g.x === cx && g.y === cy && !g.collected);
        if (found) {
          found.collected = true;
          steps.push({ x: cx, y: cy, dir: cdir, msg: '✨ Gemma RAGGIUNTA e RACCOLTA!', collect: true });
        } else {
          steps.push({ x: cx, y: cy, msg: '⚠️ Nessuna gemma da raccogliere in questa casella!', err: true });
          break;
        }
      }
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        setIsPuzzleSimulating(false);
        const win = cGems.every((g: any) => g.collected);
        if (win) {
          setPuzzleConsole(prev => [...prev, '🎉 FANTASTICO! LIVELLO SUPERATO CON SUCCESSO!']);
          onNotification("Vittoria Swift!", `Hai superato "${currentLevel.title}"!`);
        } else {
          setPuzzleError("Devi raccogliere tutte le gemme per finire il livello!");
        }
        return;
      }

      const st = steps[i];
      setByteX(st.x);
      setByteY(st.y);
      if (st.dir) setByteDirection(st.dir);
      if (st.collect) {
        setGems((prev: any) => {
          const next = [...prev];
          const g = next.find(item => item.x === st.x && item.y === st.y);
          if (g) g.collected = true;
          return next;
        });
      }
      setPuzzleConsole(prev => [...prev, st.msg]);

      if (st.err) {
        clearInterval(interval);
        setIsPuzzleSimulating(false);
        setPuzzleError(st.msg);
        return;
      }
      i++;
    }, 500);
  };

  // REALISTIC IPHONE APP SIMULATOR COMPONENT
  const renderIPhoneSimulator = () => {
    const isPizza = selectedPresetId === 'pizza_app';
    const isMusic = selectedPresetId === 'music_player';
    const isSocial = selectedPresetId === 'social_feed';

    return (
      <div className="flex flex-col items-center justify-center p-2 sm:p-3 h-full w-full bg-zinc-900/90 overflow-y-auto">
        <div className="text-center mb-1.5 sm:mb-2">
          <span className="text-[11px] sm:text-xs font-black text-orange-400 uppercase tracking-wider flex items-center justify-center space-x-1">
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Simulatore iPhone 16 Pro</span>
          </span>
          <p className="text-[10px] sm:text-[11px] text-zinc-400">Tocca i pulsanti dell'app iOS per testarla!</p>
        </div>

        {/* iPhone Shell Frame - Fluid for small mobile screens */}
        <div className="w-full max-w-[290px] sm:max-w-[340px] bg-black rounded-[32px] sm:rounded-[42px] border-4 border-zinc-700 p-2.5 sm:p-3.5 shadow-2xl relative flex flex-col h-[420px] sm:h-[510px] shrink-0 my-auto">
          
          {/* Dynamic Island Notch */}
          <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-zinc-900 rounded-full mx-auto mb-1.5 sm:mb-2 border border-zinc-800 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-zinc-800"></div>
          </div>

          {/* iPhone Screen Content */}
          <div className="flex-1 bg-[#121218] rounded-[22px] sm:rounded-[28px] p-2.5 sm:p-3.5 flex flex-col items-center justify-between text-white border border-white/10 overflow-y-auto min-h-0">
            
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-1.5 shrink-0">
              <span className="text-[9px] sm:text-[10px] text-orange-400 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 truncate max-w-[150px]">
                struct {parsedViewTitle}
              </span>
              <span className="text-[8px] sm:text-[9px] text-emerald-400 font-bold flex items-center space-x-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>iOS Active</span>
              </span>
            </div>

            {/* APP CONTENT AREA */}
            <div className="w-full flex-1 flex flex-col items-center justify-center space-y-3 py-2 my-auto">
              
              {/* APP 1: PIZZERIA GOURMET */}
              {isPizza ? (
                <div className="w-full space-y-2.5 text-left">
                  <div className="text-center">
                    <h3 className="text-xs sm:text-sm font-extrabold text-orange-400">🍕 Pizzeria Bella Napoli</h3>
                    <p className="text-[10px] text-zinc-400">Menu & Cassa SwiftUI</p>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1.5">
                    {/* Margherita */}
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-white">Margherita (8€)</p>
                        <p className="text-[10px] text-zinc-400">Quantità: {parsedStateVars.margherita || 0}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateStateVar('margherita', (v: number) => Math.max(0, (v || 0) - 1))}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStateVar('margherita', (v: number) => (v || 0) + 1)}
                          className="w-6 h-6 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Diavola */}
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-white">🌶️ Diavola (10€)</p>
                        <p className="text-[10px] text-zinc-400">Quantità: {parsedStateVars.diavola || 0}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateStateVar('diavola', (v: number) => Math.max(0, (v || 0) - 1))}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStateVar('diavola', (v: number) => (v || 0) + 1)}
                          className="w-6 h-6 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Quattro Formaggi */}
                    <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[11px] sm:text-xs font-bold text-white">🧀 4 Formaggi (11€)</p>
                        <p className="text-[10px] text-zinc-400">Quantità: {parsedStateVars.quattroFormaggi || 0}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateStateVar('quattroFormaggi', (v: number) => Math.max(0, (v || 0) - 1))}
                          className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateStateVar('quattroFormaggi', (v: number) => (v || 0) + 1)}
                          className="w-6 h-6 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="bg-orange-500/10 border border-orange-500/30 p-2 rounded-xl text-center">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase">Totale Calcolato</span>
                    <p className="text-lg sm:text-xl font-black text-amber-300">
                      {(parsedStateVars.margherita || 0) * 8 + (parsedStateVars.diavola || 0) * 10 + (parsedStateVars.quattroFormaggi || 0) * 11} €
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      updateStateVar('margherita', 0);
                      updateStateVar('diavola', 0);
                      updateStateVar('quattroFormaggi', 0);
                    }}
                    className="w-full py-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold rounded-xl border border-red-800"
                  >
                    Svuota Carrello
                  </button>
                </div>
              ) : isMusic ? (
                /* APP 2: MUSIC PLAYER */
                <div className="w-full space-y-3 text-center">
                  {/* Album Cover Art */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-1 shadow-lg flex items-center justify-center">
                    <Music className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white truncate px-2">
                      {['Midnights Rain', 'Starboy', 'Blinding Lights'][(parsedStateVars.songIndex || 0) % 3]}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-zinc-400">The Weeknd & Taylor</p>
                  </div>

                  {/* Play Controls */}
                  <div className="flex items-center justify-center space-x-3 pt-1">
                    <button
                      onClick={() => updateStateVar('songIndex', (v: number) => Math.max(0, (v || 0) - 1))}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white"
                    >
                      <Rewind className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => updateStateVar('isPlaying', (v: boolean) => !v)}
                      className="p-3 bg-cyan-500 hover:bg-cyan-400 rounded-full text-black font-bold shadow-lg"
                    >
                      {parsedStateVars.isPlaying ? <PauseIcon className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    <button
                      onClick={() => updateStateVar('songIndex', (v: number) => ((v || 0) + 1) % 3)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white"
                    >
                      <FastForward className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => updateStateVar('isLiked', (v: boolean) => !v)}
                    className={`w-full py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition ${
                      parsedStateVars.isLiked 
                        ? 'bg-rose-600/20 border-rose-500 text-rose-300' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {parsedStateVars.isLiked ? '❤️ Preferito' : '🤍 Aggiungi ai Preferiti'}
                  </button>
                </div>
              ) : isSocial ? (
                /* APP 3: INSTASWIFT SOCIAL */
                <div className="w-full space-y-2.5 text-left">
                  {/* User Bar */}
                  <div className="flex items-center justify-between bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold">
                        👤
                      </div>
                      <span className="text-[11px] font-bold text-white truncate max-w-[110px]">marco_rossi</span>
                    </div>

                    <button
                      onClick={() => updateStateVar('isFollowing', (v: boolean) => !v)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                        parsedStateVars.isFollowing ? 'bg-zinc-800 text-zinc-300' : 'bg-orange-600 text-white'
                      }`}
                    >
                      {parsedStateVars.isFollowing ? 'Seguito' : '+ Segui'}
                    </button>
                  </div>

                  {/* Post Image Placeholder */}
                  <div className="h-28 sm:h-32 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 p-2.5 flex flex-col justify-end text-white shadow">
                    <span className="text-[11px] font-bold">🌅 Tramonto a Capri</span>
                    <span className="text-[9px] text-amber-200">Scattato da iPhone 16 Pro</span>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      onClick={() => {
                        const currentLiked = parsedStateVars.isLiked;
                        updateStateVar('isLiked', !currentLiked);
                        updateStateVar('likes', (l: number) => currentLiked ? (l || 142) - 1 : (l || 142) + 1);
                      }}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] font-bold text-rose-400 flex items-center space-x-1"
                    >
                      <span>{parsedStateVars.isLiked ? '❤️' : '🤍'}</span>
                      <span>{parsedStateVars.likes || 142}</span>
                    </button>

                    <button
                      onClick={() => updateStateVar('commentsCount', (c: number) => (c || 18) + 1)}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] font-bold text-cyan-400"
                    >
                      💬 {parsedStateVars.commentsCount || 18} Commenti
                    </button>
                  </div>
                </div>
              ) : (
                /* APP 4: SCRATCH / DYNAMIC SWIFTUI APP */
                (() => {
                  const textList: string[] = [];
                  const buttonList: string[] = [];

                  const codeLines = editorCode.split('\n');
                  codeLines.forEach(l => {
                    const lineStr = l.trim();
                    
                    const tm = lineStr.match(/Text\s*\(\s*"([^"]+)"\s*\)/) || lineStr.match(/Text\s*\(\s*([a-zA-Z0-9_]+)\s*\)/);
                    if (tm) {
                      let raw = tm[1];
                      raw = raw.replace(/\\\((\w+)\)/g, (_, vName) => {
                        return parsedStateVars[vName] !== undefined ? String(parsedStateVars[vName]) : `\\(${vName})`;
                      });
                      if (parsedStateVars[raw] !== undefined) {
                        raw = String(parsedStateVars[raw]);
                      }
                      textList.push(raw);
                    }

                    const bm = lineStr.match(/Button\s*\(\s*"([^"]+)"\s*\)/);
                    if (bm) {
                      let btnLabel = bm[1];
                      btnLabel = btnLabel.replace(/\\\((\w+)\)/g, (_, vName) => {
                        return parsedStateVars[vName] !== undefined ? String(parsedStateVars[vName]) : `\\(${vName})`;
                      });
                      buttonList.push(btnLabel);
                    }
                  });

                  return (
                    <div className="w-full space-y-2.5 text-center">
                      {textList.length > 0 ? (
                        <div className="space-y-1.5 bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800 shadow">
                          {textList.map((tVal, idx) => (
                            <div 
                              key={idx} 
                              className={idx === 0 ? "text-sm sm:text-base font-extrabold text-orange-400" : "text-xs text-zinc-200 font-medium"}
                            >
                              {tVal}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400">
                          📱 Scrivi `Text("...")` o `Button("...")` nell'editor per vedere la tua UI.
                        </div>
                      )}

                      {buttonList.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {buttonList.map((bLabel, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                Object.keys(parsedStateVars).forEach(vKey => {
                                  const val = parsedStateVars[vKey];
                                  if (typeof val === 'number') {
                                    if (editorCode.includes(`${vKey} -= 1`)) updateStateVar(vKey, (v: number) => v - 1);
                                    else updateStateVar(vKey, (v: number) => v + 1);
                                  } else if (typeof val === 'boolean') {
                                    updateStateVar(vKey, (v: boolean) => !v);
                                  } else if (typeof val === 'string') {
                                    updateStateVar(vKey, "Azione eseguita nell'iPhone! 🚀");
                                  }
                                });
                                setEditorStdout(prev => [...prev, `[iPhone Touch] Premuto pulsante '${bLabel}'`]);
                              }}
                              className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 border border-orange-400/30"
                            >
                              {bLabel}
                            </button>
                          ))}
                        </div>
                      )}

                      {Object.keys(parsedStateVars).length > 0 && (
                        <div className="mt-2 p-2 bg-zinc-950 border border-zinc-800/80 rounded-xl text-left">
                          <span className="text-[9px] uppercase font-bold text-orange-400 tracking-wider block mb-1">
                            @State Variables:
                          </span>
                          <div className="space-y-1">
                            {Object.entries(parsedStateVars).map(([vKey, vVal]) => (
                              <div key={vKey} className="flex items-center justify-between text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                <span className="font-mono text-zinc-400">{vKey}:</span>
                                <span className="font-bold text-amber-300 truncate max-w-[120px]">{String(vVal)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

            </div>

            <div className="w-24 sm:w-28 h-1 bg-zinc-600 rounded-full mx-auto mt-1 shrink-0"></div>

          </div>

        </div>
      </div>
    );
  };

  return (
    <div id="app-swift-playgrounds" className="flex flex-col h-full w-full min-h-0 bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      
      {/* TOP BAR */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-2 sm:px-3 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-1.5 z-10">
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-400 font-bold shrink-0">
              <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wide text-white">Swift Playgrounds</h2>
              <p className="text-[9px] sm:text-[10px] text-zinc-400">Compilatore Swift 6.1 & SwiftUI</p>
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto bg-zinc-950 p-1 rounded-xl border border-zinc-800 space-x-1 text-[11px] sm:text-xs overflow-x-auto no-scrollbar shrink-0 justify-center">
          <button
            onClick={() => setMainTab('code')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-extrabold flex items-center space-x-1 shrink-0 transition ${
              mainTab === 'code' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>💻 Codice Swift</span>
          </button>

          <button
            onClick={() => setMainTab('preview')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-extrabold flex items-center space-x-1 shrink-0 transition ${
              mainTab === 'preview' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Simulatore iPhone</span>
          </button>

          <button
            onClick={() => setMainTab('puzzles')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-extrabold flex items-center space-x-1 shrink-0 transition ${
              mainTab === 'puzzles' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>🎮 Gioco Byte</span>
          </button>
        </div>
      </header>

      {/* TAB 1: SWIFT CODE EDITOR */}
      {mainTab === 'code' && (
        <div className="flex-1 min-h-0 flex flex-col bg-zinc-950 overflow-hidden">
          
          <div className="p-2 sm:p-2.5 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
            <div className="flex items-center justify-between sm:justify-start space-x-1.5 sm:space-x-2 w-full sm:w-auto">
              <span className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-wider shrink-0">App:</span>
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="bg-zinc-950 border border-orange-500/40 text-orange-300 text-[11px] sm:text-xs font-bold rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 outline-none cursor-pointer hover:border-orange-500 flex-1 sm:flex-initial truncate"
              >
                {PRESETS.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900 text-white font-semibold">
                    {p.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleWriteFromScratch}
                className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center space-x-1 transition shadow shrink-0 active:scale-95"
              >
                <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>✍️ Scrivi da Zero</span>
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
              <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] sm:text-[11px] font-bold">
                <button
                  onClick={() => setEditorLayout('full')}
                  className={`px-2 py-1 rounded-md flex items-center space-x-1 ${
                    editorLayout === 'full' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Editor Soltanto"
                >
                  <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Editor Maxi</span>
                </button>
                <button
                  onClick={() => setEditorLayout('split')}
                  className={`px-2 py-1 rounded-md flex items-center space-x-1 ${
                    editorLayout === 'split' ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Editor + iPhone"
                >
                  <Layout className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Schermo Diviso</span>
                </button>
              </div>

              <button
                onClick={runFreeformSwiftCode}
                disabled={isExecutingEditor}
                className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white flex items-center space-x-1 sm:space-x-1.5 shadow-lg active:scale-95 transition disabled:opacity-50 shrink-0"
              >
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                <span>▶️ ESEGUI CODICE</span>
              </button>
            </div>
          </div>

          {/* QUICK SWIFT SNIPPET TOOLBAR */}
          <div className="bg-zinc-900/90 border-b border-zinc-800 px-2 py-1.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 text-[10px] sm:text-xs font-mono">
            <span className="text-zinc-400 font-sans font-bold text-[10px] shrink-0 uppercase">Snippet Rapidi:</span>
            <button
              onClick={() => insertMainSnippet('@State var contatore = 0')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + @State var
            </button>
            <button
              onClick={() => insertMainSnippet('Text("Nuovo Testo")')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + Text()
            </button>
            <button
              onClick={() => insertMainSnippet('Button("Clicca Qui") {\n    print("Pulsante premuto")\n}')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + Button()
            </button>
            <button
              onClick={() => insertMainSnippet('VStack(spacing: 12) {\n    \n}')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-orange-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + VStack
            </button>
            <button
              onClick={() => insertMainSnippet('HStack {\n    \n}')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-purple-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + HStack
            </button>
            <button
              onClick={() => insertMainSnippet('print("Valore aggiornato")')}
              className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-rose-300 rounded border border-zinc-700 shrink-0 font-bold"
            >
              + print()
            </button>
          </div>

          {/* 🔍 PANNELLO CONTROLLO SINTASSI IN TEMPO REALE (SEMPRE VISIBILE) */}
          {(() => {
            const warnings = (() => {
              const list: string[] = [];
              const openBraces = (editorCode.match(/\{/g) || []).length;
              const closeBraces = (editorCode.match(/\}/g) || []).length;
              if (openBraces > closeBraces) list.push(`⚠️ Manca ${openBraces - closeBraces} parentesi graffa di chiusura '}'`);
              else if (closeBraces > openBraces) list.push(`⚠️ C'è ${closeBraces - openBraces} parentesi graffa '}' in più`);
              
              const openParens = (editorCode.match(/\(/g) || []).length;
              const closeParens = (editorCode.match(/\)/g) || []).length;
              if (openParens !== closeParens) list.push(`⚠️ Le parentesi tonde '(' e ')' non sono bilanciate`);

              if (editorCode.includes('struct') && !editorCode.includes('var body: some View')) {
                list.push(`💡 Manca la proprietà obbligatoria 'var body: some View'`);
              }
              if (editorCode.includes('state ') && !editorCode.includes('@State')) {
                list.push(`💡 Hai scritto 'state' in minuscolo, usa '@State'`);
              }
              return list;
            })();

            if (warnings.length === 0) return null;

            return (
              <div className="mx-2 my-1.5 p-2 bg-amber-950/90 border border-amber-600/60 rounded-xl text-amber-200 text-xs font-mono shrink-0 space-y-1 shadow-lg">
                <span className="font-bold text-amber-300">🔍 Controllo Sintassi Swift:</span>
                {warnings.map((w, i) => (
                  <div key={i} className="text-[11px]">{w}</div>
                ))}
              </div>
            );
          })()}

          {/* MAIN BODY: CODE TEXTAREA */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-zinc-950">
            <div className={`flex-1 min-h-0 flex flex-col p-1.5 sm:p-2 bg-zinc-950 overflow-hidden ${
              editorLayout === 'split' ? 'w-full md:w-3/5' : 'w-full'
            }`}>
              <div className="w-full h-full flex-1 min-h-0 flex rounded-2xl border-2 border-orange-500/50 focus-within:border-orange-400 bg-zinc-950 overflow-hidden shadow-2xl relative">
                
                <div className="w-10 sm:w-11 bg-zinc-900/90 border-r border-zinc-800 flex flex-col items-center py-3 text-right pr-2 text-xs font-mono text-orange-400 font-bold shrink-0 select-none overflow-hidden">
                  {Array.from({ length: Math.max(50, editorCode.split('\n').length + 10) }).map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>

                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  spellCheck="false"
                  className="w-full h-full p-3 bg-transparent font-mono text-sm sm:text-base text-emerald-300 font-medium outline-none resize-none leading-6 border-0 focus:ring-0 selection:bg-orange-500/40 whitespace-pre overflow-x-auto"
                  placeholder="// Scrivi qui il tuo codice Swift o SwiftUI liberamente..."
                />
              </div>
            </div>

            {editorLayout === 'split' && (
              <div className="hidden md:flex w-2/5 min-h-0 border-l border-zinc-800 bg-zinc-900/60 overflow-hidden">
                {renderIPhoneSimulator()}
              </div>
            )}
          </div>

          {editorError && (
            <div className="mx-2 mb-1 p-2 bg-red-950 border border-red-800 text-red-200 text-xs flex items-center justify-between font-mono rounded-xl shrink-0">
              <span>❌ {editorError}</span>
              <button onClick={() => setEditorError(null)} className="text-red-400 font-bold ml-2">Chiudi</button>
            </div>
          )}

          <div className="h-24 sm:h-28 border-t border-zinc-800 bg-zinc-900/90 p-2 flex flex-col font-mono text-xs shrink-0">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-bold mb-1">
              <span className="flex items-center space-x-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Console Output Swift (stdout):</span>
              </span>
              <span className="text-orange-400 font-bold">Terminale Swift Attivo</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
              {editorStdout.map((log, idx) => (
                <div 
                  key={idx}
                  className={
                    log.includes('❌') ? 'text-red-400 font-bold' :
                    log.includes('[iPhone Touch]') ? 'text-amber-400 font-semibold' :
                    log.includes('successo') ? 'text-emerald-400 font-bold' : 'text-zinc-300'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PREVIEW */}
      {mainTab === 'preview' && (
        <div className="flex-1 min-h-0 flex bg-zinc-900 overflow-hidden">
          {renderIPhoneSimulator()}
        </div>
      )}

      {/* TAB 3: PUZZLES */}
      {mainTab === 'puzzles' && (
        <div className="flex-1 min-h-0 flex flex-col bg-zinc-950 overflow-hidden">
          <div className="p-2 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              {LEVELS.map((lvl, index) => (
                <button
                  key={lvl.id}
                  onClick={() => setCurrentLevelIdx(index)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border shrink-0 ${
                    currentLevelIdx === index
                      ? 'bg-orange-600 text-white border-orange-400 shadow'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Livello {lvl.id}
                </button>
              ))}
            </div>

            <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-[10px] sm:text-xs font-bold">
              <button
                onClick={() => setByteSubTab('code')}
                className={`px-2.5 py-1 rounded-md flex items-center space-x-1 ${
                  byteSubTab === 'code' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>📝 Codice Byte</span>
              </button>
              <button
                onClick={() => setByteSubTab('island')}
                className={`px-2.5 py-1 rounded-md flex items-center space-x-1 ${
                  byteSubTab === 'island' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Award className="w-3 h-3" />
                <span>🎮 Isola</span>
              </button>
              <button
                onClick={() => setByteSubTab('split')}
                className={`hidden md:flex px-2.5 py-1 rounded-md items-center space-x-1 ${
                  byteSubTab === 'split' ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layout className="w-3 h-3" />
                <span>Schermo Diviso</span>
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 text-center shrink-0">
            <h4 className="text-xs font-bold text-orange-400">{currentLevel.title}</h4>
            <p className="text-[11px] text-zinc-300 mt-0.5">{currentLevel.description}</p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {(byteSubTab === 'island' || byteSubTab === 'split') && (
              <div className="flex-1 p-3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 overflow-y-auto min-h-0">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-gradient-to-b from-emerald-950/40 to-zinc-900 p-2.5 sm:p-3.5 rounded-2xl border border-emerald-800/40 shadow-2xl my-auto">
                  {Array.from({ length: 25 }).map((_, idx) => {
                    const gx = idx % 5;
                    const gy = Math.floor(idx / 5);
                    const isByteHere = byteX === gx && byteY === gy;
                    const gem = gems.find((g: any) => g.x === gx && g.y === gy);

                    return (
                      <div
                        key={idx}
                        className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-center relative text-base sm:text-lg font-bold shadow-inner"
                      >
                        {isByteHere && (
                          <span className="animate-bounce text-xl sm:text-2xl">
                            {byteDirection === 'E' ? '👾➔' : byteDirection === 'S' ? '👾👇' : byteDirection === 'W' ? '👈👾' : '👾👆'}
                          </span>
                        )}
                        {gem && !gem.collected && !isByteHere && (
                          <span className="animate-pulse text-xl sm:text-2xl">💎</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {puzzleError && (
                  <div className="mt-2 p-2 bg-red-950 text-red-200 text-xs rounded-xl border border-red-800 font-bold text-center">
                    ⚠️ {puzzleError}
                  </div>
                )}
              </div>
            )}

            {(byteSubTab === 'code' || byteSubTab === 'split') && (
              <div className="flex-1 p-3 bg-zinc-900 flex flex-col space-y-2 min-h-0 overflow-y-auto">
                <div className="flex items-center justify-between shrink-0">
                  <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider">
                    📝 Codice Istruzioni Swift Byte:
                  </h4>

                  <button
                    onClick={resetPuzzle}
                    className="text-xs font-bold text-zinc-400 hover:text-white flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ripristina</span>
                  </button>
                </div>

                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1 shrink-0">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Inserisci Comandi Rapidi:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => insertByteCmd('muoviAvanti()')}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-mono rounded-lg border border-zinc-700 font-bold"
                    >
                      + muoviAvanti()
                    </button>
                    <button
                      onClick={() => insertByteCmd('giraDestra()')}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-mono rounded-lg border border-zinc-700 font-bold"
                    >
                      + giraDestra()
                    </button>
                    <button
                      onClick={() => insertByteCmd('giraSinistra()')}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-purple-300 text-xs font-mono rounded-lg border border-zinc-700 font-bold"
                    >
                      + giraSinistra()
                    </button>
                    <button
                      onClick={() => insertByteCmd('raccogliGemma()')}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 text-xs font-mono rounded-lg border border-zinc-700 font-bold"
                    >
                      + raccogliGemma()
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[160px] flex rounded-xl border-2 border-orange-500/40 bg-zinc-950 overflow-hidden shadow-lg shrink-0">
                  <div className="w-9 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-2.5 text-right pr-1.5 text-xs font-mono text-orange-400 font-bold shrink-0 select-none">
                    {Array.from({ length: Math.max(15, puzzleCode.split('\n').length + 3) }).map((_, i) => (
                      <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={puzzleCode}
                    onChange={(e) => setPuzzleCode(e.target.value)}
                    spellCheck="false"
                    className="w-full h-full p-2.5 bg-transparent font-mono text-xs sm:text-sm text-emerald-300 font-bold outline-none leading-6 resize-none whitespace-pre overflow-x-auto"
                    placeholder="// Scrivi qui i comandi per Byte..."
                  />
                </div>

                <button
                  onClick={() => {
                    setByteSubTab('island');
                    runPuzzle();
                  }}
                  disabled={isPuzzleSimulating}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 text-white font-black text-xs rounded-xl shadow-lg active:scale-98 transition shrink-0"
                >
                  ▶️ ESEGUI CODICE BYTE
                </button>

                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-400 overflow-y-auto space-y-1 h-20 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Log Byte:</span>
                  {puzzleConsole.map((c, i) => (
                    <div key={i} className="text-zinc-300">{c}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
