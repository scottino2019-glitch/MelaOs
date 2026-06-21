import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, CheckCircle, Smartphone, Terminal, Award, 
  ChevronRight, HelpCircle, BookOpen, Layers, Code, Sparkles, 
  ArrowLeft, ArrowRight, CornerDownLeft, FileCode, Check, RefreshCw
} from 'lucide-react';

interface AppSwiftPlaygroundsProps {
  onNotification: (title: string, message: string) => void;
}

interface Level {
  id: number;
  title: string;
  description: string;
  gridSize: number;
  startX: number;
  startY: number;
  gems: { x: number; y: number; collected: boolean }[];
  defaultCode: string;
  solutionKeywords: string[];
  hint: string;
}

const LEVELS: Level[] = [
  {
    id: 1,
    title: "1. Il Primo Passo",
    description: "Aiuta Byte a farsi strada sul sentiero! Muoviti in avanti per raggiungere la gemma rossa brillante e raccoglila.",
    gridSize: 5,
    startX: 0,
    startY: 2,
    gems: [{ x: 3, y: 2, collected: false }],
    defaultCode: `// Benvenuto in Swift Playgrounds!
// Guida Byte sulla gemma usando i comandi.

muoviAvanti()
muoviAvanti()
muoviAvanti()
raccogliGemma()`,
    solutionKeywords: ["muoviAvanti", "raccogliGemma"],
    hint: "Scrivi 'muoviAvanti()' per avanzare di una casella. Ricorda di inserire 'raccogliGemma()' sulla casella della gemma!"
  },
  {
    id: 2,
    title: "2. La Svolta a Destra",
    description: "Byte deve svoltare l'angolo! Cammina in avanti, gira a destra per incanalarti nel sentiero della gemma e raccoglila.",
    gridSize: 5,
    startX: 1,
    startY: 1,
    gems: [{ x: 3, y: 3, collected: false }],
    defaultCode: `// Scrivi il codice qui sotto per far girare Byte.
muoviAvanti()
muoviAvanti()
giraDestra()
muoviAvanti()
muoviAvanti()
raccogliGemma()`,
    solutionKeywords: ["giraDestra", "raccogliGemma"],
    hint: "Avanza di due caselle, usa 'giraDestra()', cammina in avanti di altre due caselle e raccogli la gemma."
  },
  {
    id: 3,
    title: "3. La Sfida dei Cicli For",
    description: "Ci sono ben 3 gemme lungo la strada! Invece di scrivere comandi ripetitivi, usa un ciclo 'for' di Swift per automatizzare la raccolta.",
    gridSize: 6,
    startX: 0,
    startY: 3,
    gems: [
      { x: 1, y: 3, collected: false },
      { x: 2, y: 3, collected: false },
      { x: 3, y: 3, collected: false }
    ],
    defaultCode: `// Ottimizza il codice usando un ciclo For
for i in 1...3 {
    muoviAvanti()
    raccogliGemma()
}`,
    solutionKeywords: ["for", "raccogliGemma"],
    hint: "I cicli 'for i in 1...3 { ... }' eseguono il blocco di codice tra le graffe per 3 volte consecutive. È perfetto per raccogliere tre gemme di fila!"
  }
];

// SwiftUI Elements representation for Playground Sandbox UI
interface SwiftUIWidget {
  type: 'VStack' | 'HStack' | 'Text' | 'Image' | 'Button' | 'Spacer' | 'Circle';
  text?: string;
  iconName?: string;
  color?: string; // Tailwind bg color or text color
  radius?: number;
  padding?: 'none' | 'small' | 'medium' | 'large';
  children?: SwiftUIWidget[];
}

export default function AppSwiftPlaygrounds({ onNotification }: AppSwiftPlaygroundsProps) {
  const [activeTab, setActiveTab] = useState<'puzzles' | 'swiftui_sandbox'>('puzzles');
  
  // Puzzles states
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const currentLevel = LEVELS[currentLevelIdx];
  const [code, setCode] = useState<string>(currentLevel.defaultCode);
  const [mobileView, setMobileView] = useState<'text' | 'output'>('text');
  
  // Simulation states
  const [byteX, setByteX] = useState<number>(currentLevel.startX);
  const [byteY, setByteY] = useState<number>(currentLevel.startY);
  const [byteDirection, setByteDirection] = useState<'N' | 'E' | 'S' | 'W'>('E'); // facing east
  const [gems, setGems] = useState(JSON.parse(JSON.stringify(currentLevel.gems)));
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationIndex, setSimulationIndex] = useState<number>(-1);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(["--- Console Swift pronta ---"]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successConfetti, setSuccessConfetti] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SwiftUI UI Builder states
  const [swiftUISampleTemplate, setSwiftUISampleTemplate] = useState<string>('MioProfilo');
  const [titleText, setTitleText] = useState<string>('Ciao, Mondo Applet!');
  const [appAccentColor, setAppAccentColor] = useState<string>('bg-indigo-600');
  const [showButtonAlert, setShowButtonAlert] = useState<boolean>(false);
  const [btnText, setBtnText] = useState<string>('Fai una Magia 🪄');
  const [alertText, setAlertText] = useState<string>('Eseguito con SwiftUI su iOS!');
  const [shapeRadius, setShapeRadius] = useState<number>(45);

  // Sync code and position when switching levels
  useEffect(() => {
    resetLevel();
  }, [currentLevelIdx]);

  const resetLevel = () => {
    const lvl = LEVELS[currentLevelIdx];
    setCode(lvl.defaultCode);
    setByteX(lvl.startX);
    setByteY(lvl.startY);
    setByteDirection('E');
    setGems(JSON.parse(JSON.stringify(lvl.gems)));
    setIsSimulating(false);
    setSimulationIndex(-1);
    setConsoleLogs(["--- Console Swift resettata ---", `Byte posizionato allo start (${lvl.startX}, ${lvl.startY})`]);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  // Compiler / Simple Code Parser for Playgrounds
  const runSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setErrorMessage(null);
    setConsoleLogs(["⚙️ Avvio del compilatore Swift...", "🚀 Esecuzione in corso..."]);
    
    // Reset positions back to start for fresh run
    const lvl = LEVELS[currentLevelIdx];
    let currX = lvl.startX;
    let currY = lvl.startY;
    let currDir: 'N' | 'E' | 'S' | 'W' = 'E';
    let currGems = JSON.parse(JSON.stringify(lvl.gems));
    
    // Instructions list to feed the animation
    const steps: { type: 'move' | 'turn' | 'collect' | 'error'; x: number; y: number; dir?: 'N' | 'E' | 'S' | 'W'; msg: string }[] = [];
    
    // Parse the code lines
    const lines = code.split('\n');
    let loopLines: string[] = [];
    let inLoop = false;
    let loopCount = 0;

    const executeCommand = (cmd: string, lineNum: number) => {
      const cleanCmd = cmd.trim();
      if (!cleanCmd || cleanCmd.startsWith('//')) return true; // skip comments / blanks
      
      if (cleanCmd.startsWith('for ') && cleanCmd.includes('{')) {
        // Parse simple swift loop statement: for i in 1...X {
        const loopMatch = cleanCmd.match(/for\s+\w+\s+in\s+(\d+)\.\.\.(\d+)/);
        if (loopMatch) {
          const start = parseInt(loopMatch[1]);
          const end = parseInt(loopMatch[2]);
          loopCount = (end - start) + 1;
          loopLines = [];
          inLoop = true;
          return true;
        } else {
          steps.push({ type: 'error', x: currX, y: currY, msg: `Errore linea ${lineNum + 1}: Sintassi del ciclo 'for' non supportata. Esempio: for i in 1...3` });
          return false;
        }
      }
      
      if (inLoop) {
        if (cleanCmd === '}') {
          inLoop = false;
          // Execute loop lines X times
          for (let count = 0; count < loopCount; count++) {
            for (let j = 0; j < loopLines.length; j++) {
              const success = executeCommand(loopLines[j], lineNum - loopLines.length + j);
              if (!success) return false;
            }
          }
          return true;
        } else {
          loopLines.push(cleanCmd);
          return true;
        }
      }

      // Basic movement command executors
      if (cleanCmd === 'muoviAvanti()') {
        let nextX = currX;
        let nextY = currY;
        if (currDir === 'E') nextX += 1;
        else if (currDir === 'W') nextX -= 1;
        else if (currDir === 'S') nextY += 1;
        else if (currDir === 'N') nextY -= 1;
        
        // Boundaries safety
        if (nextX < 0 || nextX >= lvl.gridSize || nextY < 0 || nextY >= lvl.gridSize) {
          steps.push({ type: 'error', x: currX, y: currY, msg: `Uh oh! Byte ha colpito un ostacolo fuori limite alla casella (${nextX}, ${nextY})!` });
          return false;
        } else {
          currX = nextX;
          currY = nextY;
          steps.push({ type: 'move', x: currX, y: currY, dir: currDir, msg: `Byte si sposta in avanti a (${currX}, ${currY})` });
        }
      } else if (cleanCmd === 'giraDestra()') {
        const clockwise: Record<'N'|'E'|'S'|'W', 'N'|'E'|'S'|'W'> = { 'N': 'E', 'E': 'S', 'S': 'W', 'W': 'N' };
        currDir = clockwise[currDir];
        steps.push({ type: 'turn', x: currX, y: currY, dir: currDir, msg: `Byte gira a destra, ora guarda verso ${currDir}` });
      } else if (cleanCmd === 'giraSinistra()') {
        const counterClockwise: Record<'N'|'E'|'S'|'W', 'N'|'E'|'S'|'W'> = { 'N': 'W', 'W': 'S', 'S': 'E', 'E': 'N' };
        currDir = counterClockwise[currDir];
        steps.push({ type: 'turn', x: currX, y: currY, dir: currDir, msg: `Byte gira a sinistra, ora guarda verso ${currDir}` });
      } else if (cleanCmd === 'raccogliGemma()') {
        const gemIdx = currGems.findIndex((g: any) => g.x === currX && g.y === currY && !g.collected);
        if (gemIdx !== -1) {
          currGems[gemIdx].collected = true;
          // create deep clone of target state to pass to animation frame
          const snapshotGems = JSON.parse(JSON.stringify(currGems));
          steps.push({ type: 'collect', x: currX, y: currY, msg: `Gemma raccolta con successo a (${currX}, ${currY})! 🎉`, dir: currDir });
        } else {
          steps.push({ type: 'error', x: currX, y: currY, msg: `Nessuna gemma disponibile da raccogliere alla casella (${currX}, ${currY})!` });
          return false;
        }
      } else {
        steps.push({ type: 'error', x: currX, y: currY, msg: `Errore di compilazione: Il comando '${cleanCmd}' non è supportato in questo livello.` });
        return false;
      }
      return true;
    };

    let compilable = true;
    for (let i = 0; i < lines.length; i++) {
      compilable = executeCommand(lines[i], i);
      if (!compilable) break;
    }

    if (inLoop && compilable) {
      steps.push({ type: 'error', x: currX, y: currY, msg: "Errore di sintassi: Manca la parentesi graffa di chiusura `}` del ciclo for!" });
    }

    // Begin timed simulation frames sequence
    let stepIdx = 0;
    const intervalTime = 700;

    const triggerNextStep = () => {
      if (stepIdx >= steps.length) {
        setIsSimulating(false);
        // Verify win condition when done
        const allSetCollected = currGems.every((g: any) => g.collected);
        if (allSetCollected && steps[steps.length - 1]?.type !== 'error') {
          setConsoleLogs(prev => [...prev, "🌟 COMPILAZIONE RIUSCITA! Livello completato con successo!"]);
          setShowSuccess(true);
          setSuccessConfetti(true);
          onNotification("Traguardo Swift!", `Complimenti! Hai superato "${currentLevel.title}"!`);
          setTimeout(() => setSuccessConfetti(false), 4000);
        } else if (!allSetCollected) {
          setErrorMessage("Non tutte le gemme sono state raccolte. Riprova!");
          setConsoleLogs(prev => [...prev, "❌ Esecuzione terminata: Manca qualche gemma lungo la griglia."]);
        }
        return;
      }

      const activeObj = steps[stepIdx];
      setConsoleLogs(prev => [...prev, `[Swift stdout] ${activeObj.msg}`]);

      if (activeObj.type === 'error') {
        setErrorMessage(activeObj.msg);
        setIsSimulating(false);
        return;
      }

      // Update positions
      setByteX(activeObj.x);
      setByteY(activeObj.y);
      if (activeObj.dir) {
        setByteDirection(activeObj.dir);
      }

      if (activeObj.type === 'collect') {
        setGems((prev: any) => {
          const clone = [...prev];
          const found = clone.find(g => g.x === activeObj.x && g.y === activeObj.y);
          if (found) found.collected = true;
          return clone;
        });
      }

      stepIdx++;
      setTimeout(triggerNextStep, intervalTime);
    };

    if (steps.length > 0) {
      triggerNextStep();
    } else {
      setIsSimulating(false);
      setErrorMessage("Nessun comando inserito nell'editor di testo!");
    }
  };

  const insertSnippet = (snippet: string) => {
    setCode(prev => {
      const cleaned = prev.endsWith('\n') ? prev : prev + '\n';
      return cleaned + snippet;
    });
  };

  return (
    <div id="app-swift-playgrounds" className="flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans rounded-3xl select-none relative">
      
      {/* Dynamic iOS Sub Header Selector */}
      <div className="flex bg-zinc-900/90 border-b border-zinc-800 p-2 shrink-0 z-10 w-full justify-between items-center px-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-semibold tracking-wide">Swift Playgrounds</span>
        </div>

        <div className="flex bg-zinc-950/80 p-0.5 rounded-xl border border-white/5 space-x-1">
          <button
            onClick={() => setActiveTab('puzzles')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeTab === 'puzzles' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🧩 Rompicapo Byte
          </button>
          <button
            onClick={() => setActiveTab('swiftui_sandbox')}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
              activeTab === 'swiftui_sandbox' ? 'bg-orange-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            🎨 Preview SwiftUI
          </button>
        </div>
      </div>

      {/* Render 1: Puzzle Learning Arena with Swift Byte character */}
      {activeTab === 'puzzles' ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          
          {/* Main workspace container split */}
          <div className="flex-[3] flex flex-col border-r border-zinc-900 bg-zinc-950 min-h-0 relative">
            
            {/* Level selection controls header */}
            <div className="p-3 bg-zinc-900/40 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 overflow-x-auto pr-2 shrink-0">
                {LEVELS.map((lvl, index) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      if (!isSimulating) setCurrentLevelIdx(index);
                    }}
                    disabled={isSimulating}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border shrink-0 transition ${
                      currentLevelIdx === index 
                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-400' 
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    M{lvl.id}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={resetLevel}
                  disabled={isSimulating}
                  className="p-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center space-x-1 transition disabled:opacity-50"
                  title="Resetta dati di gioco"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="p-1.5 px-4 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center space-x-1.5 shadow-md active:scale-95 transition disabled:opacity-60"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Esegui Codice</span>
                </button>
              </div>
            </div>

            {/* Switch tabs of code editor vs console outputs on responsive mobile layouts */}
            <div className="flex lg:hidden bg-zinc-900/80 p-1 border-b border-zinc-900 justify-around text-xs font-medium">
              <button
                onClick={() => setMobileView('text')}
                className={`flex-1 text-center py-1.5 rounded-lg ${mobileView === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                📝 Codice Swift
              </button>
              <button
                onClick={() => setMobileView('output')}
                className={`flex-1 text-center py-1.5 rounded-lg ${mobileView === 'output' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                📊 Labirinto & Console
              </button>
            </div>

            {/* Left Main interactive editor */}
            <div className={`flex-1 flex flex-col min-h-0 ${mobileView === 'text' ? 'flex' : 'hidden lg:flex'}`}>
              
              <div className="px-4 py-2.5 bg-zinc-900/20 flex flex-col space-y-1 bg-amber-500/5 border-b border-amber-500/10">
                <div className="flex items-center space-x-1 text-amber-400 font-semibold text-xs uppercase tracking-widest">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Obiettivo Livello</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-light">{currentLevel.description}</p>
              </div>

              {/* Real Editable Textarea styled like MacOS Xcode Playground */}
              <div className="flex-1 flex overflow-hidden relative">
                
                {/* Line markers count strip */}
                <div className="w-10 bg-zinc-950 border-r border-zinc-900/50 flex flex-col items-center py-4 text-right pr-2 text-[10px] font-mono text-zinc-650 shrink-0 select-none">
                  {Array.from({ length: Math.max(12, code.split('\n').length + 3) }).map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                  ))}
                </div>

                <div className="flex-1 relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={isSimulating}
                    spellCheck="false"
                    className="w-full h-full p-4 bg-zinc-950 font-mono text-xs sm:text-sm text-cyan-200 outline-none resize-none leading-6 border-0 focus:ring-0 disabled:text-zinc-400"
                    placeholder="// Digita o inserisci i comandi di Swift qui..."
                  />
                </div>
              </div>

              {/* Drag snippet quick buttons bar at bottom of editor */}
              <div className="p-2.5 bg-zinc-900/60 border-t border-zinc-900 flex flex-wrap gap-1.5 select-none items-center">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1 shrink-0">Inserisci:</span>
                <button
                  onClick={() => insertSnippet('muoviAvanti()')}
                  disabled={isSimulating}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-orange-400 hover:text-orange-350 rounded-lg border border-zinc-700/50 flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>muoviAvanti()</span>
                </button>
                <button
                  onClick={() => insertSnippet('giraDestra()')}
                  disabled={isSimulating}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-orange-400 hover:text-orange-350 rounded-lg border border-zinc-700/50 flex items-center space-x-1"
                >
                  <CornerDownLeft className="w-3 h-3" />
                  <span>giraDestra()</span>
                </button>
                <button
                  onClick={() => insertSnippet('raccogliGemma()')}
                  disabled={isSimulating}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-rose-400 hover:text-rose-350 rounded-lg border border-zinc-700/50 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>raccogliGemma()</span>
                </button>
                <button
                  onClick={() => insertSnippet(`for i in 1...3 {\n    muoviAvanti()\n    raccogliGemma()\n}`)}
                  disabled={isSimulating}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-800 hover:bg-neutral-750 text-blue-400 hover:text-blue-350 rounded-lg border border-neutral-700/50"
                  title="Aggiungi struttura per ripetere i comandi"
                >
                  <span>for_in_range</span>
                </button>
              </div>

            </div>

          </div>

          {/* Right Area Grid Maze map canvas simulation renders */}
          <div className={`flex-[2.5] flex flex-col bg-zinc-900 justify-between min-h-0 ${mobileView === 'output' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Visual game map simulation box */}
            <div className="flex-1 flex flex-col justify-center items-center p-4 relative bg-zinc-950/40 relative">
              
              <div className="text-center mb-2 select-none">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Simulazione Isola di Byte</span>
                <p className="text-xs text-zinc-450 mt-0.5 font-light">Caselle griglia: {currentLevel.gridSize} x {currentLevel.gridSize}</p>
              </div>

              {/* Core SVG Flat Grid Simulator renders crisp and fluidly */}
              <div className="w-full aspect-square max-w-[280px] bg-zinc-900 border border-zinc-800 rounded-2xl relative overflow-hidden shadow-inner p-1">
                
                {/* Simulated cells map */}
                <div 
                  className="grid h-full w-full gap-1"
                  style={{ gridTemplateColumns: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: currentLevel.gridSize * currentLevel.gridSize }).map((_, cellIdx) => {
                    const rowIdx = Math.floor(cellIdx / currentLevel.gridSize);
                    const colIdx = cellIdx % currentLevel.gridSize;
                    
                    const isStart = currentLevel.startX === colIdx && currentLevel.startY === rowIdx;
                    const activeGem = gems.find((g: any) => g.x === colIdx && g.y === rowIdx);
                    const isByteCurrent = byteX === colIdx && byteY === rowIdx;
                    
                    // Facing directions rotational arrows
                    const directionsSymbols = { 'N': '▲', 'E': '►', 'S': '▼', 'W': '◄' };

                    return (
                      <div 
                        key={cellIdx}
                        className={`rounded-lg relative border flex items-center justify-center transition-all ${
                          isByteCurrent 
                            ? 'bg-blue-600/30 border-blue-500/80 text-blue-300 ring-2 ring-blue-500/20' 
                            : isStart 
                              ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-500' 
                              : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-650'
                        }`}
                      >
                        {/* Cell indicators coordinates */}
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-mono text-zinc-600">
                          {colIdx},{rowIdx}
                        </span>

                        {isByteCurrent && (
                          <div className="flex flex-col items-center animate-bounce">
                            <div className="w-5 h-5 rounded-full bg-blue-500 border border-white flex items-center justify-center shadow-lg relative">
                              <span className="text-[10px] text-white font-black">🤖</span>
                              {/* Facings pointer indicator */}
                              <span className="absolute -top-3 text-[7px] text-blue-400 font-bold bg-zinc-900 px-0.5 rounded">
                                {byteDirection}
                              </span>
                            </div>
                            <span className="text-[9px] text-blue-300 font-bold mt-0.5">{directionsSymbols[byteDirection]}</span>
                          </div>
                        )}

                        {activeGem && !isByteCurrent && (
                          <div className={`flex flex-col items-center justify-center ${activeGem.collected ? 'opacity-20 animate-pulse' : 'animate-pulse'}`}>
                            <span className="text-base">💎</span>
                            <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter mt-0.5">
                              {activeGem.collected ? 'RAGGIUNTA' : 'GEMMA'}
                            </span>
                          </div>
                        )}

                        {isStart && !isByteCurrent && !activeGem && (
                          <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-tighter">Start</span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Error prompt message dialog if simulation crashes */}
              {errorMessage && (
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 bg-red-900/90 backdrop-blur border border-red-700 p-3.5 rounded-xl text-center text-xs shadow-xl animate-shake">
                  <p className="font-bold text-red-200">❌ Errore di Esecuzione</p>
                  <p className="text-red-300 mt-1 leading-relaxed">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* Simulated Debug Console */}
            <div className="h-52 border-t border-zinc-950 flex flex-col justify-between shrink-0 bg-zinc-950 font-mono">
              <div className="p-2 border-b border-zinc-900 bg-zinc-900/60 flex items-center justify-between text-zinc-500 font-bold uppercase tracking-widest text-[9px]">
                <div className="flex items-center space-x-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>Log Terminale Swift</span>
                </div>
                <span className="text-[8px] bg-cyan-950 px-1 py-0.5 rounded text-cyan-400 leading-none">Swift 6.1</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 text-[11px] space-y-1.5 scrollbar-thin">
                {consoleLogs.map((log, index) => {
                  const isErr = log.includes('Errore') || log.includes('❌') || log.includes('Uh oh!');
                  const isScc = log.includes('successo') || log.includes('RIUSCITA!') || log.includes('🎉');
                  return (
                    <div 
                      key={index} 
                      className={`leading-relaxed ${
                        isErr ? 'text-red-400' : isScc ? 'text-emerald-400 font-bold' : 'text-zinc-305'
                      }`}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Render 2: SwiftUI Sandbox Preview Layout simulator panel */
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-zinc-900">
          
          {/* Controls Editor side panel */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto border-r border-zinc-950 space-y-4 max-w-md w-full scrollbar-thin">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-zinc-800">
              <FileCode className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-black tracking-wide">SwiftUI Layout Editor</h3>
            </div>

            {/* Live mockup settings parameters selectors */}
            <div className="space-y-3.5">
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Template Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setSwiftUISampleTemplate('MioProfilo');
                      setTitleText("Benvenuti in SwiftUI ⭐");
                      setAppAccentColor("bg-indigo-600");
                      setBtnText("Invia Richiesta 📧");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex flex-col justify-between transition ${
                      swiftUISampleTemplate === 'MioProfilo' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-950/60'
                    }`}
                  >
                    <span>Mio Profilo</span>
                    <span className="text-[9px] text-zinc-550 font-normal mt-1">Avatar & Info</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSwiftUISampleTemplate('DashboardProd');
                      setTitleText("Produttività Giornaliera 📈");
                      setAppAccentColor("bg-amber-600");
                      setBtnText("Sincronizza Dati 🔄");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left flex flex-col justify-between transition ${
                      swiftUISampleTemplate === 'DashboardProd' 
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400' 
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-950/60'
                    }`}
                  >
                    <span>Dashboard</span>
                    <span className="text-[9px] text-zinc-550 font-normal mt-1">Dati & Azioni</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Testo Principale (Text)</label>
                <input 
                  type="text" 
                  value={titleText} 
                  onChange={(e) => setTitleText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="Titolo visualizzato"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Colore di Accento (ForegroundColor)</label>
                <div className="flex space-x-2">
                  {[
                    { style: 'bg-indigo-600', name: 'Indigo' },
                    { style: 'bg-rose-600', name: 'Rose' },
                    { style: 'bg-emerald-600', name: 'Emerald' },
                    { style: 'bg-blue-600', name: 'Blue' },
                    { style: 'bg-amber-600', name: 'Amber' }
                  ].map((colorObj) => (
                    <button
                      key={colorObj.style}
                      onClick={() => setAppAccentColor(colorObj.style)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${colorObj.style} ${
                        appAccentColor === colorObj.style ? 'border-white scale-110 ring-2 ring-orange-500/20' : 'border-transparent hover:scale-105'
                      }`}
                      title={colorObj.name}
                    >
                      {appAccentColor === colorObj.style && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dimensione Forma (Radius: {shapeRadius}px)</label>
                <input 
                  type="range" 
                  min="20" 
                  max="100" 
                  value={shapeRadius} 
                  onChange={(e) => setShapeRadius(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Etichetta Pulsante (Button)</label>
                <input 
                  type="text" 
                  value={btnText} 
                  onChange={(e) => setBtnText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Azione al Click (Alert Message)</label>
                <input 
                  type="text" 
                  value={alertText} 
                  onChange={(e) => setAlertText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

            </div>

            {/* SwiftUI Code Preview Mockup panel */}
            <div className="mt-4 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[10.5px] leading-relaxed text-zinc-400">
              <span className="text-orange-400 font-bold">struct</span> MioLayout: <span className="text-cyan-400 font-semibold">View</span> &#123;
              <div className="pl-4">
                <span className="text-orange-400 font-bold">var</span> body: <span className="text-orange-400 font-bold">some</span> View &#123;
                <div className="pl-4">
                  <span className="text-blue-400 font-semibold">VStack</span>(spacing: 16) &#123;
                  {swiftUISampleTemplate === 'MioProfilo' ? (
                    <div className="pl-4 text-zinc-350">
                      <span className="text-blue-400">Circle</span>()<br/>
                      <span className="pl-4 text-zinc-500">.frame(width: {shapeRadius * 2}, height: {shapeRadius * 2})</span><br/>
                      <span className="pl-4 text-zinc-500">.foregroundColor(.{appAccentColor.split('-')[1]})</span><br/>
                      <span className="text-blue-400">Text</span>(<span className="text-emerald-400">"{titleText}"</span>)<br/>
                      <span className="pl-4 text-zinc-500">.font(.title)</span>
                    </div>
                  ) : (
                    <div className="pl-4 text-zinc-350">
                      <span className="text-blue-400">HStack</span> &#123;<br/>
                      <span className="pl-4 text-blue-400">Image</span>(systemName: <span className="text-emerald-400">"chart.bar.fill"</span>)<br/>
                      <span className="pl-4 text-blue-400">Text</span>(<span className="text-emerald-400">"{titleText}"</span>)<br/>
                      &#125;<br/>
                      <span className="text-blue-400">RoundedRectangle</span>(cornerRadius: 15)<br/>
                      <span className="pl-4 text-zinc-500">.fill(Color.{appAccentColor.split('-')[1]})</span>
                    </div>
                  )}
                  <div className="pl-4 text-zinc-350">
                    <span className="text-blue-400">Button</span>(action: &#123; <span className="text-purple-400">presentAlert</span>() &#125;) &#123;<br/>
                    <span className="pl-4 text-blue-400">Text</span>(<span className="text-emerald-400">"{btnText}"</span>)<br/>
                    &#125;
                  </div>
                  &#125;
                </div>
                &#125;
              </div>
              &#125;
            </div>

          </div>

          {/* Right Preview Interactive Simulator */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 bg-zinc-950/40 relative">
            
            <div className="text-center mb-4 select-none">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-center space-x-1">
                <Smartphone className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                <span>Simulatore iPhone 15 Pro</span>
              </span>
              <p className="text-xs text-zinc-430 mt-0.5 font-light">Dispositivo virtuale SwiftUI in esecuzione live</p>
            </div>

            {/* Mock phone display case */}
            <div className="w-68 h-120 bg-black rounded-[42px] border-4 border-zinc-750 shadow-2xl relative overflow-hidden flex flex-col p-2.5 ring-2 ring-zinc-800">
              
              {/* Dynamic island container */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full z-40 flex items-center justify-center border border-zinc-900 shadow">
                <div className="w-2 h-2 rounded-full bg-zinc-900/80 mr-3"></div>
                <div className="w-1 h-1 rounded-full bg-blue-900/60 ml-3"></div>
              </div>

              {/* iPhone screen canvas overlay */}
              <div className="flex-1 bg-[#1A1A24] rounded-[34px] overflow-hidden flex flex-col relative p-4 pt-10 text-white font-sans select-none">
                
                {swiftUISampleTemplate === 'MioProfilo' ? (
                  // Template view render: Profile Card
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                    
                    {/* Simulated avatar */}
                    <div 
                      className={`rounded-full transition-all duration-300 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 ${appAccentColor}`}
                      style={{ width: `${shapeRadius * 2}px`, height: `${shapeRadius * 2}px` }}
                      title="SwiftUI custom element avatar bubble"
                    >
                      <span className="text-white text-3xl font-extrabold">🍎</span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-lg font-black tracking-tight text-white leading-tight">{titleText}</h4>
                      <p className="text-[11px] text-zinc-450 font-mono tracking-widest uppercase">Developer Apple</p>
                    </div>

                    {/* App mini features widgets row */}
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[180px] bg-white/5 p-2 rounded-2xl border border-white/5">
                      <div className="text-center p-1">
                        <span className="text-sm font-bold text-zinc-200">12</span>
                        <p className="text-[8px] text-zinc-400 uppercase mt-0.5">App Prodotte</p>
                      </div>
                      <div className="text-center p-1">
                        <span className="text-sm font-bold text-zinc-200">92%</span>
                        <p className="text-[8px] text-zinc-400 uppercase mt-0.5">Efficienza</p>
                      </div>
                    </div>

                    {/* Standard Action Button */}
                    <button 
                      onClick={() => setShowButtonAlert(true)}
                      className={`w-full max-w-[180px] py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 text-white ${appAccentColor}`}
                    >
                      {btnText}
                    </button>

                  </div>
                ) : (
                  // Template view render: Interactive Dashboard lists
                  <div className="flex-1 flex flex-col justify-between pt-2">
                    
                    <div className="space-y-4">
                      {/* Top Header info */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${appAccentColor}`}></div>
                          <span className="text-xs font-black tracking-wide text-zinc-100">{titleText}</span>
                        </div>
                        <span className="text-[9px] font-mono p-1 bg-white/5 border border-white/10 rounded-lg text-emerald-400">ONLINE</span>
                      </div>

                      {/* Items loop lists */}
                      <div className="space-y-2">
                        {[
                          { title: 'Ottimizzazione del codice', val: 'Veloce', desc: 'Sviluppato con efficienza nativa.' },
                          { title: 'Compilatore Swift 6.1', val: 'Pronto', desc: 'Nessun bug rilevato.' }
                        ].map((item, id) => (
                          <div key={id} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/10 transition">
                            <div className="text-left">
                              <p className="text-xs font-bold text-zinc-200 leading-tight">{item.title}</p>
                              <p className="text-[9px] text-zinc-400 mt-0.5 leading-none">{item.desc}</p>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-950 rounded border border-white/10 text-cyan-400 font-bold shrink-0">{item.val}</span>
                          </div>
                        ))}
                      </div>

                      {/* Accent highlight graphical bento container */}
                      <div 
                        className={`p-3 rounded-2xl flex items-center justify-between shadow-lg text-white ${appAccentColor}`}
                        style={{ height: `${shapeRadius + 40}px` }}
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold uppercase tracking-widest text-white/70">Prestazioni</p>
                          <p className="text-base font-extrabold mt-1">Superiori 🌟</p>
                        </div>
                        <span className="text-4xl">🚀</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowButtonAlert(true)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-95 text-white ${appAccentColor}`}
                    >
                      {btnText}
                    </button>

                  </div>
                )}

                {/* Simulated popup alert dialog logic */}
                {showButtonAlert && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900 border border-zinc-800 p-4.5 rounded-[22px] text-center max-w-[180px] w-full shadow-2xl animate-scale-up">
                      <span className="text-3xl">🎉</span>
                      <h4 className="text-xs font-black tracking-tight text-white mt-1.5">SwiftUI Alert</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{alertText}</p>
                      <button 
                        onClick={() => setShowButtonAlert(false)}
                        className="w-full mt-3.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-white font-bold text-[10px] border border-zinc-700/50"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

      {/* Success Reward level clear screen */}
      {showSuccess && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-zinc-900 border border-zinc-805/80 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-bounce-subtle">
            <div className="w-16 h-16 rounded-full bg-orange-600/20 border border-orange-500 flex items-center justify-center mx-auto mb-4 relative shadow-lg">
              <Award className="w-9 h-9 text-orange-400" />
              <CheckCircle className="w-5 h-5 text-emerald-400 bg-zinc-950 rounded-full absolute -bottom-1 -right-1" />
            </div>

            <h3 className="text-xl font-black text-white tracking-tight">Livello Completato!</h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Hai completato <span className="font-semibold text-orange-400">"{currentLevel.title}"</span> compilando correttamente i comandi Swift richiamati. Byte ringrazia! 🥳
            </p>

            <div className="mt-5 space-y-2">
              {currentLevelIdx + 1 < LEVELS.length ? (
                <button
                  onClick={() => {
                    setCurrentLevelIdx(prev => prev + 1);
                    setShowSuccess(false);
                  }}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-750 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
                >
                  <span>Prossimo Livello</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-2">
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">🏆 Sei una Leggenda!</p>
                  <p className="text-[11px] text-zinc-350 mt-1 leading-relaxed">Hai superato tutti i rompicapo di Swift Playgrounds dell'ambiete remoto!</p>
                </div>
              )}
              
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl text-xs border border-zinc-700/50"
              >
                Rimani qui
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
