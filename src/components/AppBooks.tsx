import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Sliders, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  FolderOpen, 
  FileText, 
  Upload, 
  Link2, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Download, 
  ExternalLink,
  AlertCircle,
  X,
  FileCheck2,
  BookMarked,
  Sun,
  Moon,
  Type,
  AlignLeft,
  AlignJustify,
  Palette
} from 'lucide-react';
import { savePdfToStorage, getPdfFromStorage, deletePdfFromStorage } from '../utils/pdfStorage';

// Polyfill Promise.withResolvers for older browser engines / WebViews
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// Import robust legacy build of PDF.js AND embedded worker
import * as pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Setup worker in main thread via globalThis.pdfjsWorker to guarantee 100% reliability in iframes
if (typeof globalThis !== 'undefined') {
  (globalThis as any).pdfjsWorker = pdfjsWorker;
}
if (typeof window !== 'undefined') {
  (window as any).pdfjsWorker = pdfjsWorker;
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  } catch (e) {
    // ignore
  }
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(',');
  const base64 = parts[1] || parts[0];
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export type ReaderTheme = 'cream' | 'sepia' | 'gray' | 'night';

export interface ThemeConfig {
  id: ReaderTheme;
  name: string;
  subtitle: string;
  dotColor: string;
  bgApp: string;
  bgFolio: string;
  borderFolio: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  toolbarBg: string;
  toolbarBorder: string;
  toolbarText: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  pillBg: string;
  divider: string;
  pdfBackdrop: string;
}

export const READER_THEMES: Record<ReaderTheme, ThemeConfig> = {
  cream: {
    id: 'cream',
    name: 'Avorio Naturale',
    subtitle: 'Carta calda anti-affaticamento (consigliato)',
    dotColor: '#F5EFEB',
    bgApp: '#F3EFE6',
    bgFolio: '#FAF6EF',
    borderFolio: '#E5DDCF',
    textPrimary: '#2D251D',
    textSecondary: '#6E5F52',
    textMuted: '#9B8C7E',
    accent: '#C45B28',
    toolbarBg: '#F7F3EB',
    toolbarBorder: '#E6DFD2',
    toolbarText: '#382F26',
    buttonBg: '#EDE6D9',
    buttonHover: '#E2D9C9',
    buttonText: '#382F26',
    pillBg: '#F0E9DC',
    divider: '#E6DDD0',
    pdfBackdrop: '#ECE6DB'
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia Caldo',
    subtitle: 'Tonalità pergamena classica riposante',
    dotColor: '#F4ECD8',
    bgApp: '#E8DCBF',
    bgFolio: '#F3E7CE',
    borderFolio: '#D8C5A2',
    textPrimary: '#3B2A1C',
    textSecondary: '#705338',
    textMuted: '#98795A',
    accent: '#B2501E',
    toolbarBg: '#EDE1C7',
    toolbarBorder: '#DAC8A7',
    toolbarText: '#433020',
    buttonBg: '#DFD0B1',
    buttonHover: '#D2C19E',
    buttonText: '#433020',
    pillBg: '#E3D5B7',
    divider: '#D8C5A2',
    pdfBackdrop: '#DFD2B4'
  },
  gray: {
    id: 'gray',
    name: 'Grigio E-Ink',
    subtitle: 'Luce morbida e neutra per il giorno',
    dotColor: '#E5E5EA',
    bgApp: '#DEE0E4',
    bgFolio: '#EAECEF',
    borderFolio: '#CAD0D8',
    textPrimary: '#242831',
    textSecondary: '#5B6370',
    textMuted: '#828B99',
    accent: '#395D8B',
    toolbarBg: '#E4E6EA',
    toolbarBorder: '#CCD1D9',
    toolbarText: '#2B303A',
    buttonBg: '#D4D8DF',
    buttonHover: '#C6CBD4',
    buttonText: '#2B303A',
    pillBg: '#DADEE5',
    divider: '#CAD0D8',
    pdfBackdrop: '#D5D8DC'
  },
  night: {
    id: 'night',
    name: 'Notte Riposante',
    subtitle: 'Ardesia vellutata (no nero profondo / no bianco accecante)',
    dotColor: '#282A30',
    bgApp: '#191B1F',
    bgFolio: '#24262C',
    borderFolio: '#363942',
    textPrimary: '#D6D2C8',
    textSecondary: '#9A968D',
    textMuted: '#706E67',
    accent: '#D97938',
    toolbarBg: '#202227',
    toolbarBorder: '#31343C',
    toolbarText: '#DCD8CE',
    buttonBg: '#2C2E35',
    buttonHover: '#373A43',
    buttonText: '#DCD8CE',
    pillBg: '#27292F',
    divider: '#333640',
    pdfBackdrop: '#18191D'
  }
};

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  progress: number;
  category: string;
  isPdf?: boolean;
  pdfUrl?: string;
  hasStoredData?: boolean;
  chapters: { title: string; content: string }[];
}

const DEFAULT_SAMPLE_BOOKS: BookItem[] = [
  {
    id: 'pdf-manuale-ipad',
    title: 'Manuale Utente iPad Scriba',
    author: 'Guida Ufficiale Scriba',
    coverColor: 'bg-orange-950',
    progress: 0,
    category: 'Guide PDF',
    isPdf: true,
    pdfUrl: '/manuale_ipad.pdf',
    chapters: []
  },
  {
    id: 'pdf-guida-scriba',
    title: 'Guida Scriba OS & Strumenti',
    author: 'Scriba System',
    coverColor: 'bg-blue-950',
    progress: 0,
    category: 'Guide PDF',
    isPdf: true,
    pdfUrl: '/guida_scriba.pdf',
    chapters: []
  },
  {
    id: 'book-1',
    title: 'La Divina Commedia',
    author: 'Dante Alighieri',
    coverColor: 'bg-rose-900',
    progress: 35,
    category: 'Classici',
    isPdf: false,
    chapters: [
      {
        title: 'Inferno - Canto I',
        content: `Nel mezzo del cammin di nostra vita\nmi ritrovai per una selva oscura,\nché la diritta via era smarrita.\n\nAhi quanto a dir qual era è cosa dura\nesta selva selvaggia e aspra e forte\nche nel pensier rinova la paura!\n\nTant’ è amara che poco è più morte;\nma per trattar del ben ch’i’ vi trovai,\ndirò de l’altre cose ch’i’ v’ho scorte.\n\nIo non so ben ridir com’ i’ v’intrai,\ntant’ era pien di sonno a quel punto\nche la verace via abbandonai.\n\nMa poi ch’i’ fui al piè d’un colle giunto,\nlà dove terminava quella valle\nche m’avea di paura il cor compunto,\n\nguardai in alto e vidi le sue spalle\nvestite già de’ raggi del pianeta\nche mena dritto altrui per ogne calle.`
      }
    ]
  },
  {
    id: 'book-2',
    title: 'I Promessi Sposi',
    author: 'Alessandro Manzoni',
    coverColor: 'bg-emerald-950',
    progress: 12,
    category: 'Letteratura',
    isPdf: false,
    chapters: [
      {
        title: 'Capitolo I',
        content: `Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene ininterrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi, e a prender corso e figura di fiume, tra un promontorio a destra, e un’ampia costiera dall’altra parte; e il ponte, che ivi congiunge le due rive, par che renda ancor più sensibile all’occhio questa trasformazione, e segni il punto dove cessa il lago, e ricomincia l’Adda...`
      }
    ]
  }
];

interface PdfCanvasViewerProps {
  bookId?: string;
  pdfUrl?: string;
  bookTitle?: string;
  showToast: (msg: string) => void;
  theme?: ReaderTheme;
  onThemeChange?: (theme: ReaderTheme) => void;
}

export function PdfCanvasViewer({ bookId, pdfUrl, bookTitle, showToast, theme = 'cream', onThemeChange }: PdfCanvasViewerProps) {
  const currentTheme = READER_THEMES[theme] || READER_THEMES.cream;
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.35);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>("Inizializzazione documento...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawPdfBlobUrl, setRawPdfBlobUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'native' | 'text'>('canvas');
  const [pageText, setPageText] = useState<string>('');
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);
  const [eyeComfort, setEyeComfort] = useState<boolean>(true); // Eye comfort filter enabled by default
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let active = true;

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        setLoadingStep("Recupero dati PDF...");

        let pdfBytes: Uint8Array | null = null;

        // 1. Try to load from storage if bookId is available
        if (bookId) {
          try {
            const stored = await getPdfFromStorage(bookId);
            if (stored) {
              if (stored instanceof Uint8Array && stored.length > 0) {
                pdfBytes = stored;
              } else if (typeof stored === 'string' && stored.startsWith('data:')) {
                pdfBytes = dataUrlToUint8Array(stored);
              }
            }
          } catch (e) {
            console.warn("Storage lookup warning:", e);
          }
        }

        // 2. Data URL direct
        if (!pdfBytes && pdfUrl && pdfUrl.startsWith('data:')) {
          pdfBytes = dataUrlToUint8Array(pdfUrl);
        }

        // 3. Static local or remote URL
        if (!pdfBytes && pdfUrl) {
          let fetchTarget = pdfUrl;
          if (pdfUrl.startsWith('http') && !pdfUrl.includes(window.location.host)) {
            fetchTarget = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
          }

          setLoadingStep("Download documento dal server...");
          const response = await fetch(fetchTarget);
          if (!response.ok) {
            throw new Error(`Errore HTTP ${response.status}: ${response.statusText} (${fetchTarget})`);
          }

          const arrayBuffer = await response.arrayBuffer();
          pdfBytes = new Uint8Array(arrayBuffer);
        }

        if (!pdfBytes || pdfBytes.length === 0) {
          throw new Error("Il file PDF è vuoto o non contiene dati validi.");
        }

        // Generate reliable Blob URL for native view & download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        if (active) setRawPdfBlobUrl(blobUrl);

        setLoadingStep("Decodifica pagine con il motore vettoriale...");

        // Ensure global in-thread worker is initialized
        if (typeof globalThis !== 'undefined') {
          (globalThis as any).pdfjsWorker = pdfjsWorker;
        }
        if (typeof window !== 'undefined') {
          (window as any).pdfjsWorker = pdfjsWorker;
        }

        const originUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
        const fontDataUrl = originUrl
          ? `${originUrl}/pdfjs/standard_fonts/`
          : '/pdfjs/standard_fonts/';
        const cmapUrl = originUrl
          ? `${originUrl}/pdfjs/cmaps/`
          : '/pdfjs/cmaps/';

        // Load via PDF.js with standard fonts and cMaps
        let loadedPdf: any = null;
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: pdfBytes,
            cMapUrl: cmapUrl,
            cMapPacked: true,
            standardFontDataUrl: fontDataUrl,
            useWorkerFetch: false,
            useSystemFonts: true,
          } as any);
          loadedPdf = await loadingTask.promise;
        } catch (workerError: any) {
          console.warn("Primary PDF loading attempt warning, retrying with fallback...", workerError);
          setLoadingStep("Avvio modalità compatibile diretta...");
          try {
            if (typeof globalThis !== 'undefined') (globalThis as any).pdfjsWorker = pdfjsWorker;
            if (typeof window !== 'undefined') (window as any).pdfjsWorker = pdfjsWorker;
            const fallbackTask = pdfjsLib.getDocument({
              data: pdfBytes,
              cMapPacked: true,
              useWorkerFetch: false,
              useSystemFonts: true
            });
            loadedPdf = await fallbackTask.promise;
          } catch (fallbackError: any) {
            throw new Error(fallbackError?.message || workerError?.message || "Impossibile decodificare il PDF.");
          }
        }

        if (!active) return;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.error("PDF load fatal error:", err);
        if (active) {
          setErrorMsg(err?.message || "Errore sconosciuto durante il caricamento del PDF.");
          setIsLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      active = false;
    };
  }, [bookId, pdfUrl]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (rawPdfBlobUrl) {
        URL.revokeObjectURL(rawPdfBlobUrl);
      }
    };
  }, [rawPdfBlobUrl]);

  // Render Page on Canvas with Razor-Sharp Integer Supersampling
  useEffect(() => {
    if (!pdf || viewMode !== 'canvas') return;
    let active = true;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        // Cancel running task if any
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // ignore
          }
        }

        // Clean integer supersampling ratio (2 or 3) eliminates all subpixel bilinear blur
        const deviceDpr = window.devicePixelRatio || 1;
        const supersample = deviceDpr >= 2.5 ? 3 : 2;

        const cssViewport = page.getViewport({ scale });
        const cssWidth = Math.round(cssViewport.width);
        const cssHeight = Math.round(cssViewport.height);

        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;

        canvas.width = cssWidth * supersample;
        canvas.height = cssHeight * supersample;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        const renderViewport = page.getViewport({ scale: scale * supersample });

        const renderContext = {
          canvasContext: context,
          viewport: renderViewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error("Page render error:", err);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [pdf, currentPage, scale, viewMode]);

  // Auto-fit to width on initial document load
  useEffect(() => {
    if (!pdf) return;
    const autoFitInitial = async () => {
      try {
        const page = await pdf.getPage(1);
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const parentWidth = canvasRef.current?.parentElement?.parentElement?.clientWidth || window.innerWidth;
        const targetWidth = Math.max(parentWidth - 48, 340);
        const fitScale = Math.min(2.0, Math.max(0.75, +(targetWidth / unscaledViewport.width).toFixed(2)));
        setScale(fitScale);
      } catch (e) {
        setScale(1.25);
      }
    };
    autoFitInitial();
  }, [pdf]);

  // Extract page text when Text view mode is active
  useEffect(() => {
    if (!pdf || viewMode !== 'text') return;
    let active = true;

    const extractText = async () => {
      try {
        setIsExtractingText(true);
        const page = await pdf.getPage(currentPage);
        const textContent = await page.getTextContent();
        if (!active) return;
        const text = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        setPageText(text.trim() || "Nessun testo selezionabile estratto da questa pagina (potrebbe contenere solo grafica o scansioni).");
        setIsExtractingText(false);
      } catch (e) {
        if (active) {
          setPageText("Impossibile estrarre il testo da questa pagina.");
          setIsExtractingText(false);
        }
      }
    };

    extractText();

    return () => {
      active = false;
    };
  }, [pdf, currentPage, viewMode]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(2.5, +(prev + 0.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.6, +(prev - 0.2).toFixed(2)));
  };

  const handleFitWidth = async () => {
    if (!pdf) {
      setScale(1.35);
      return;
    }
    try {
      const page = await pdf.getPage(currentPage);
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const parentWidth = canvasRef.current?.parentElement?.parentElement?.clientWidth || window.innerWidth;
      const targetWidth = Math.max(parentWidth - 48, 360);
      const fitScale = Math.min(2.5, Math.max(0.6, +(targetWidth / unscaledViewport.width).toFixed(2)));
      setScale(fitScale);
      showToast(`Adattato alla larghezza (${Math.round(fitScale * 100)}%)`);
    } catch (e) {
      setScale(1.35);
    }
  };

  const downloadPdf = () => {
    const url = rawPdfBlobUrl || pdfUrl;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(bookTitle || 'documento').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download avviato!');
  };

  const openInNewTab = () => {
    const url = rawPdfBlobUrl || pdfUrl;
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <div 
      className="flex-1 flex flex-col overflow-hidden relative select-none transition-colors duration-200"
      style={{ backgroundColor: currentTheme.pdfBackdrop }}
    >
      
      {/* Top action toolbar within reader - Styled with Eye-Comfort Theme */}
      <div 
        className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs shadow-xs z-20 border-b transition-colors duration-200"
        style={{
          backgroundColor: currentTheme.toolbarBg,
          borderColor: currentTheme.toolbarBorder,
          color: currentTheme.toolbarText
        }}
      >
        
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center border"
            style={{
              backgroundColor: currentTheme.buttonBg,
              borderColor: currentTheme.toolbarBorder,
              color: currentTheme.buttonText
            }}
            title="Pagina precedente"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div 
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono shadow-2xs"
            style={{
              backgroundColor: currentTheme.bgFolio,
              borderColor: currentTheme.borderFolio,
              color: currentTheme.textPrimary
            }}
          >
            <span style={{ color: currentTheme.textSecondary }}>Pag.</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-8 text-center bg-transparent border-b font-bold focus:outline-none"
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textPrimary
              }}
            />
            <span style={{ color: currentTheme.textSecondary }}>/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center border"
            style={{
              backgroundColor: currentTheme.buttonBg,
              borderColor: currentTheme.toolbarBorder,
              color: currentTheme.buttonText
            }}
            title="Pagina successiva"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode switcher */}
        <div 
          className="flex items-center p-0.5 rounded-xl border text-[10px]"
          style={{
            backgroundColor: currentTheme.pillBg,
            borderColor: currentTheme.toolbarBorder
          }}
        >
          <button
            onClick={() => setViewMode('canvas')}
            className="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
            style={{
              backgroundColor: viewMode === 'canvas' ? currentTheme.accent : 'transparent',
              color: viewMode === 'canvas' ? '#ffffff' : currentTheme.textSecondary
            }}
          >
            <Eye className="w-3 h-3" />
            <span>Canvas HD</span>
          </button>
          <button
            onClick={() => setViewMode('native')}
            className="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
            style={{
              backgroundColor: viewMode === 'native' ? currentTheme.accent : 'transparent',
              color: viewMode === 'native' ? '#ffffff' : currentTheme.textSecondary
            }}
          >
            <FileText className="w-3 h-3" />
            <span>Nativa</span>
          </button>
          <button
            onClick={() => setViewMode('text')}
            className="px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-2xs"
            style={{
              backgroundColor: viewMode === 'text' ? currentTheme.accent : 'transparent',
              color: viewMode === 'text' ? '#ffffff' : currentTheme.textSecondary
            }}
          >
            <BookMarked className="w-3 h-3" />
            <span>Testo</span>
          </button>
        </div>

        {/* Eye Comfort Filter Toggle + Theme Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Eye comfort filter toggle */}
          <button
            onClick={() => {
              const nextVal = !eyeComfort;
              setEyeComfort(nextVal);
              showToast(nextVal ? "Filtro riposo visivo attivo (carta calda)" : "Filtro riposo visivo disattivato (colori originali)");
            }}
            className="px-2 py-1 rounded-lg border font-semibold text-[10px] flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
            style={{
              backgroundColor: eyeComfort ? currentTheme.accent : currentTheme.buttonBg,
              color: eyeComfort ? '#ffffff' : currentTheme.buttonText,
              borderColor: currentTheme.toolbarBorder
            }}
            title="Attiva/Disattiva tonalità carta calda per non affaticare la vista"
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">Riposo Vista</span>
            <span className="text-[9px] opacity-80">{eyeComfort ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick theme dots */}
          {onThemeChange && (
            <div 
              className="flex items-center gap-1 px-1.5 py-1 rounded-xl border"
              style={{
                backgroundColor: currentTheme.pillBg,
                borderColor: currentTheme.toolbarBorder
              }}
              title="Cambia tema cromatico di lettura"
            >
              {(['cream', 'sepia', 'gray', 'night'] as ReaderTheme[]).map((tKey) => {
                const tObj = READER_THEMES[tKey];
                const isCurrent = theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => onThemeChange(tKey)}
                    className={`w-4 h-4 rounded-full transition-transform active:scale-90 border flex items-center justify-center ${
                      isCurrent ? 'ring-2 ring-orange-500 ring-offset-1 scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: tObj.dotColor,
                      borderColor: tObj.borderFolio
                    }}
                    title={tObj.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          {viewMode === 'canvas' && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={isLoading || scale <= 0.5}
                className="p-1.5 rounded-lg active:scale-95 disabled:opacity-30 transition border"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
                title="Zoom indietro"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFitWidth}
                className="font-mono text-[10px] px-2 py-1 rounded border active:scale-95 transition"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
                title="Adatta alla larghezza dello schermo"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={isLoading || scale >= 2.5}
                className="p-1.5 rounded-lg active:scale-95 disabled:opacity-30 transition border"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
                title="Zoom avanti"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Download button */}
          <button
            onClick={downloadPdf}
            className="p-1.5 rounded-lg active:scale-95 transition flex items-center gap-1 border"
            style={{
              backgroundColor: currentTheme.buttonBg,
              borderColor: currentTheme.toolbarBorder,
              color: currentTheme.buttonText
            }}
            title="Scarica file PDF originale"
          >
            <Download className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
            <span className="hidden md:inline text-[11px] font-semibold">Scarica</span>
          </button>

          {/* Open in new tab */}
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-lg active:scale-95 transition border"
            style={{
              backgroundColor: currentTheme.buttonBg,
              borderColor: currentTheme.toolbarBorder,
              color: currentTheme.buttonText
            }}
            title="Apri in una nuova scheda del browser"
          >
            <ExternalLink className="w-3.5 h-3.5" style={{ color: currentTheme.accent }} />
          </button>
        </div>
      </div>

      {/* Main viewport zone */}
      <div 
        className="flex-1 overflow-auto flex items-start justify-center p-3 sm:p-5 scrollbar-thin relative transition-colors duration-200"
        style={{ backgroundColor: currentTheme.pdfBackdrop }}
      >
        {isLoading ? (
          <div className="m-auto flex flex-col items-center gap-3 py-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: currentTheme.accent }} />
            <p className="text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
              {loadingStep}
            </p>
            <p className="text-[11px] max-w-xs" style={{ color: currentTheme.textSecondary }}>
              Rendering vettoriale ad alta definizione con il motore PDF Scriba.
            </p>
          </div>
        ) : errorMsg ? (
          <div 
            className="m-auto text-center space-y-4 p-6 max-w-md rounded-2xl shadow-xl border"
            style={{
              backgroundColor: currentTheme.bgFolio,
              borderColor: currentTheme.borderFolio,
              color: currentTheme.textPrimary
            }}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-500">Impossibile visualizzare in Canvas</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: currentTheme.textSecondary }}>{errorMsg}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => setViewMode('native')}
                className="px-3 py-1.5 text-white text-[11px] font-bold rounded-lg transition"
                style={{ backgroundColor: currentTheme.accent }}
              >
                Passa a Vista Nativa
              </button>
              <button
                onClick={() => setViewMode('text')}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition border"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
              >
                Modalità Lettura Testo
              </button>
              <button
                onClick={downloadPdf}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg transition border"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
              >
                Scarica PDF
              </button>
            </div>
          </div>
        ) : viewMode === 'native' ? (
          /* NATIVE BROWSER PDF VIEW (via iframe/embed) */
          <div 
            className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-xl flex flex-col border"
            style={{
              backgroundColor: currentTheme.bgFolio,
              borderColor: currentTheme.borderFolio
            }}
          >
            <iframe
              src={rawPdfBlobUrl || pdfUrl}
              className="w-full flex-1 border-0 rounded-xl bg-white"
              title={bookTitle || "Documento PDF"}
            />
          </div>
        ) : viewMode === 'text' ? (
          /* PURE TEXT EXTRACTED READER - USING THE CURRENT EYE-COMFORT THEME */
          <div 
            className="w-full max-w-2xl rounded-2xl p-6 sm:p-8 shadow-md space-y-4 my-auto border transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.bgFolio,
              borderColor: currentTheme.borderFolio,
              color: currentTheme.textPrimary
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: currentTheme.divider }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentTheme.accent }}>
                Testo estratto • Pagina {currentPage} di {totalPages}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pageText);
                  showToast("Testo copiato negli appunti!");
                }}
                className="text-[11px] underline font-semibold hover:opacity-80 transition"
                style={{ color: currentTheme.textSecondary }}
              >
                Copia testo
              </button>
            </div>
            {isExtractingText ? (
              <div className="py-8 text-center text-xs flex items-center justify-center gap-2" style={{ color: currentTheme.textMuted }}>
                <RefreshCw className="w-4 h-4 animate-spin" style={{ color: currentTheme.accent }} />
                <span>Estrazione del testo in corso...</span>
              </div>
            ) : (
              <p 
                className="text-sm leading-[1.85] font-serif whitespace-pre-wrap select-text selection:bg-orange-500/25"
                style={{ color: currentTheme.textPrimary }}
              >
                {pageText}
              </p>
            )}
          </div>
        ) : (
          /* VECTORS CANVAS HIGH DEFINITION RENDER WITH EYE-COMFORT PAPER FILTER */
          <div 
            className="relative rounded-lg overflow-hidden my-auto transition-all flex items-center justify-center border"
            style={{
              borderColor: currentTheme.borderFolio,
              backgroundColor: '#ffffff',
              filter: eyeComfort ? 'sepia(0.22) brightness(0.97) contrast(0.96)' : 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}
          >
            <canvas 
              ref={canvasRef} 
              className="block select-none mx-auto"
              style={{ 
                minHeight: '120px'
              }}
            />
          </div>
        )}
      </div>

      {/* Swipe touch lateral navigation hints for canvas mode */}
      {!isLoading && !errorMsg && viewMode === 'canvas' && (
        <>
          <div 
            onClick={handlePrevPage}
            className={`absolute left-0 top-12 bottom-0 w-10 bg-transparent hover:bg-black/5 active:bg-orange-500/10 transition cursor-pointer flex items-center justify-center text-2xl font-bold select-none opacity-40 hover:opacity-90 ${currentPage <= 1 ? 'pointer-events-none opacity-0' : ''}`}
            style={{ color: currentTheme.textSecondary }}
            title="Pagina precedente"
          >
            ‹
          </div>
          <div 
            onClick={handleNextPage}
            className={`absolute right-0 top-12 bottom-0 w-10 bg-transparent hover:bg-black/5 active:bg-orange-500/10 transition cursor-pointer flex items-center justify-center text-2xl font-bold select-none opacity-40 hover:opacity-90 ${currentPage >= totalPages ? 'pointer-events-none opacity-0' : ''}`}
            style={{ color: currentTheme.textSecondary }}
            title="Pagina successiva"
          >
            ›
          </div>
        </>
      )}
    </div>
  );
}

interface AppleBooksProps {
  isEmbedded?: boolean;
  onNotification?: (title: string, message: string) => void;
}

export default function AppleBooks({ isEmbedded = false, onNotification }: AppleBooksProps) {
  // Library list with persistent user edits and no resurrection of deleted items
  const [books, setBooks] = useState<BookItem[]>(() => {
    const isInitialized = localStorage.getItem('apple_books_initialized_v3');
    const saved = localStorage.getItem('apple_books_suite_library_v3');
    if (isInitialized) {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    }

    // First time initialization: seed defaults and mark initialized
    localStorage.setItem('apple_books_initialized_v3', 'true');
    localStorage.setItem('apple_books_suite_library_v3', JSON.stringify(DEFAULT_SAMPLE_BOOKS));
    return DEFAULT_SAMPLE_BOOKS;
  });

  // Reader States
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentTextScale, setCurrentTextScale] = useState<number>(100);
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    const saved = localStorage.getItem('apple_books_theme_v4');
    if (saved && (saved === 'cream' || saved === 'sepia' || saved === 'gray' || saved === 'night')) {
      return saved as ReaderTheme;
    }
    return 'cream'; // Default to warm eye-friendly cream
  });
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'accessible'>('serif');
  const [lineSpacing, setLineSpacing] = useState<'compact' | 'normal' | 'loose'>('normal');
  const [textAlignment, setTextAlignment] = useState<'justify' | 'left'>('justify');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme);
    localStorage.setItem('apple_books_theme_v4', newTheme);
  };
  
  // Public directory discovery state
  const [publicPdfs, setPublicPdfs] = useState<{ filename: string; url: string; size: number }[]>([]);
  const [publicFileName, setPublicFileName] = useState('');
  const [hidePublicSection, setHidePublicSection] = useState<boolean>(() => {
    return localStorage.getItem('scriba_hide_public_section') === 'true';
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch detected public PDFs on mount
  useEffect(() => {
    fetch('/api/public-pdfs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPublicPdfs(data);
        }
      })
      .catch(err => {
        console.warn('Could not list public PDFs:', err);
      });
  }, []);

  // Save books persistently whenever changed
  const saveBooksToStorage = (updatedBooks: BookItem[]) => {
    try {
      localStorage.setItem('apple_books_initialized_v3', 'true');
      const sanitized = updatedBooks.map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        coverColor: b.coverColor,
        progress: b.progress,
        category: b.category,
        isPdf: b.isPdf,
        pdfUrl: b.pdfUrl?.startsWith('blob:') ? '' : b.pdfUrl,
        hasStoredData: b.hasStoredData,
        chapters: b.chapters
      }));
      localStorage.setItem('apple_books_suite_library_v3', JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Storage quota warning:", e);
    }
  };

  const activeBook = books.find(b => b.id === activeBookId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onNotification) {
      onNotification("Libri", msg);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleBookmark = (chapterTitle: string) => {
    if (bookmarks.includes(chapterTitle)) {
      setBookmarks(prev => prev.filter(b => b !== chapterTitle));
    } else {
      setBookmarks(prev => [...prev, chapterTitle]);
    }
  };

  // Upload local PDF, TXT or MD files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const titleClean = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isFilePdf) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        const uint8Array = new Uint8Array(arrayBuffer);
        const bookId = 'pdf-user-' + Date.now().toString();

        // Save into IndexedDB for persistent offline loading
        await savePdfToStorage(bookId, uint8Array);

        const newBook: BookItem = {
          id: bookId,
          title: titleClean,
          author: 'Documento Caricato',
          coverColor: 'bg-red-950',
          progress: 0,
          category: 'I Miei PDF',
          isPdf: true,
          hasStoredData: true,
          chapters: []
        };

        const updated = [newBook, ...books];
        setBooks(updated);
        saveBooksToStorage(updated);
        setActiveBookId(newBook.id);
        showToast(`✓ PDF "${titleClean}" caricato con successo!`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newBook: BookItem = {
          id: 'imported-' + Date.now().toString(),
          title: titleClean,
          author: 'Documento Testo',
          coverColor: 'bg-[#513c75]',
          progress: 0,
          category: 'Documenti Importati',
          isPdf: false,
          chapters: [
            {
              title: 'Testo Completo',
              content: text || 'Nessun testo leggibile trovato.'
            }
          ]
        };
        const updated = [newBook, ...books];
        setBooks(updated);
        saveBooksToStorage(updated);
        setActiveBookId(newBook.id);
        setCurrentChapterIndex(0);
        showToast(`✓ Documento "${titleClean}" importato con successo!`);
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  // Open file from the project public folder
  const handleLoadFromPublicFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicFileName.trim()) return;

    let filename = publicFileName.trim();
    if (!filename.startsWith('/')) {
      filename = '/' + filename;
    }

    const titleClean = filename.substring(filename.lastIndexOf('/') + 1).replace('.pdf', '') || filename;
    const isFilePdf = filename.toLowerCase().endsWith('.pdf');

    const newBook: BookItem = {
      id: 'public-' + Date.now().toString(),
      title: titleClean,
      author: 'Cartella Public',
      coverColor: isFilePdf ? 'bg-indigo-950' : 'bg-orange-950',
      progress: 0,
      category: isFilePdf ? 'PDF Public' : 'Testo Public',
      isPdf: isFilePdf,
      pdfUrl: filename,
      chapters: isFilePdf ? [] : [
        {
          title: 'Introduzione',
          content: `Caricato file statico da public: ${filename}.`
        }
      ]
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    saveBooksToStorage(updated);
    setActiveBookId(newBook.id);
    setPublicFileName('');
    showToast(`✓ File aperto da public: ${titleClean}`);
  };

  // Add one of the discovered public PDFs directly
  const handleOpenDiscoveredPublicPdf = (url: string, filename: string) => {
    const titleClean = filename.replace('.pdf', '').replace(/_/g, ' ');
    const existing = books.find(b => b.pdfUrl === url || b.title.toLowerCase() === titleClean.toLowerCase());
    if (existing) {
      setActiveBookId(existing.id);
      showToast(`Apertura ${existing.title}...`);
      return;
    }

    const newBook: BookItem = {
      id: 'public-' + Date.now().toString(),
      title: titleClean,
      author: 'Cartella Public',
      coverColor: 'bg-blue-950',
      progress: 0,
      category: 'PDF Public',
      isPdf: true,
      pdfUrl: url,
      chapters: []
    };

    const updated = [newBook, ...books];
    setBooks(updated);
    saveBooksToStorage(updated);
    setActiveBookId(newBook.id);
    showToast(`✓ Aperto ${filename}`);
  };

  // Delete ANY book permanently (never resurrected)
  const deleteBook = async (bookId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    await deletePdfFromStorage(bookId);
    const updated = books.filter(b => b.id !== bookId);
    setBooks(updated);
    saveBooksToStorage(updated);
    if (activeBookId === bookId) {
      setActiveBookId(null);
    }
    showToast('Documento rimosso dalla libreria');
  };

  // Clear all books
  const handleClearLibrary = () => {
    setBooks([]);
    saveBooksToStorage([]);
    setActiveBookId(null);
    showToast('Libreria svuotata completamente');
  };

  // Restore sample books
  const handleRestoreSampleBooks = () => {
    setBooks(DEFAULT_SAMPLE_BOOKS);
    saveBooksToStorage(DEFAULT_SAMPLE_BOOKS);
    showToast('Volumi di esempio ripristinati');
  };

  // Toggle hiding public suggestion box
  const handleToggleHidePublic = () => {
    const nextVal = !hidePublicSection;
    setHidePublicSection(nextVal);
    localStorage.setItem('scriba_hide_public_section', String(nextVal));
  };

  const currentTheme = READER_THEMES[theme] || READER_THEMES.cream;

  // Keyboard navigation for text chapters
  useEffect(() => {
    if (!activeBook || activeBook.isPdf) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentChapterIndex(p => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentChapterIndex(p => Math.min((activeBook.chapters?.length || 1) - 1, p + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBook, currentChapterIndex]);

  return (
    <div 
      id="apple-books-root"
      className="flex flex-col font-sans h-full overflow-hidden transition-colors duration-200 relative w-full"
      style={{
        backgroundColor: activeBook ? currentTheme.bgApp : '#F2F2F7',
        color: activeBook ? currentTheme.textPrimary : '#1C1C1E'
      }}
    >
      {/* Toast Alert overlay notifications */}
      {toastMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur text-white font-medium text-xs px-4 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2 border border-white/10 animate-fade-in">
          <Sparkles className="text-orange-400 w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {!activeBook ? (
        /* LIBRARY SHELF VIEW */
        <div id="books-shelf-view" className="flex-1 flex flex-col overflow-hidden bg-[#F2F2F7] dark:bg-neutral-900 text-stone-900 dark:text-stone-100">
          
          {/* Header */}
          <div className={`${isEmbedded ? 'px-3 py-2.5' : 'px-5 pt-4 pb-3'} bg-white dark:bg-neutral-950 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none shadow-xs`}>
            <div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest block font-sans">iBooks Suite</span>
              <h1 className={`${isEmbedded ? 'text-sm' : 'text-xl'} font-black tracking-tight text-neutral-950 dark:text-neutral-50 flex items-center gap-2`}>
                <BookOpen className="text-orange-500" size={isEmbedded ? 16 : 20} />
                Libreria & PDF Reader
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {books.length > 0 ? (
                <button
                  type="button"
                  onClick={handleClearLibrary}
                  className="bg-neutral-100 dark:bg-neutral-900 hover:bg-red-500/10 text-stone-500 hover:text-red-500 border border-stone-200 dark:border-neutral-800 text-xs px-2.5 py-2 font-bold rounded-xl transition flex items-center gap-1 active:scale-95"
                  title="Elimina tutti i volumi presenti"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">Svuota</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestoreSampleBooks}
                  className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs px-2.5 py-2 font-bold rounded-xl transition flex items-center gap-1 active:scale-95"
                >
                  <span>+ Esempi</span>
                </button>
              )}

              {/* File Upload Button */}
              <label className={`flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white ${isEmbedded ? 'text-xs px-2.5 py-1.5' : 'text-xs px-3.5 py-2'} font-bold rounded-xl cursor-pointer shadow-md transition-all`}>
                <Upload size={14} />
                <span>Carica PDF</span>
                <input 
                  type="file" 
                  accept=".pdf,application/pdf,.txt,.html,.md" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {/* Book Shelf Content List */}
          <div className={`flex-1 overflow-y-auto ${isEmbedded ? 'px-3 py-3 space-y-3' : 'px-5 py-4 space-y-4'}`}>
            
            {/* Books and PDFs Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 block select-none">
                  I tuoi Volumi & Documenti ({books.length})
                </span>
                {books.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLibrary}
                    className="text-[10px] text-red-500 hover:underline font-semibold"
                  >
                    Elimina tutti
                  </button>
                )}
              </div>
              
              {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-neutral-950 rounded-2xl border border-stone-200 dark:border-neutral-800 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-stone-300 dark:text-neutral-700" />
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Libreria vuota</h3>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm">
                      Nessun documento o libro presente. Tocca "Carica PDF" in alto per aggiungere documenti reali dal tuo computer o dispositivo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreSampleBooks}
                    className="text-xs font-bold text-orange-500 hover:underline pt-1"
                  >
                    Ripristina guide predefinite Scriba
                  </button>
                </div>
              ) : (
                <div id="shelf-row-list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {books.map((book, idx) => (
                    <div
                      key={`${book.id || 'shelf_book'}_${idx}`}
                      id={`shelf-item-${book.id}`}
                      onClick={() => {
                        setActiveBookId(book.id);
                        setCurrentChapterIndex(0);
                        setBookmarks([]);
                      }}
                      className="flex flex-col text-left group bg-white dark:bg-neutral-950 p-3 rounded-2xl border border-stone-200/80 dark:border-neutral-800/80 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer relative"
                    >
                      {/* TOUCH-FRIENDLY DELETE BUTTON */}
                      <button
                        type="button"
                        onClick={(e) => deleteBook(book.id, e)}
                        className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 active:scale-90 text-white p-2 rounded-full z-20 shadow-md transition"
                        title="Elimina definitivamente questo volume"
                      >
                        <Trash2 size={13} className="text-white" />
                      </button>

                      {/* Book Sleeve Cover */}
                      <div className={`w-full aspect-[3/4] rounded-xl flex flex-col justify-between p-3 text-white shadow-inner relative overflow-hidden ${book.coverColor}`}>
                        <div className="space-y-1">
                          <span className="block text-[8px] uppercase font-bold text-white/60 tracking-wider">
                            {book.category}
                          </span>
                          <span className="block font-serif font-black text-xs sm:text-sm tracking-tight leading-snug pt-1 break-words line-clamp-3 pr-5">
                            {book.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-medium text-white/80">
                          <span className="truncate max-w-[85px]">{book.author}</span>
                          {book.isPdf && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest shadow-2xs">
                              PDF
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metadata below cover */}
                      <span className="block font-bold mt-2 text-stone-900 dark:text-neutral-100 text-xs truncate select-none">
                        {book.title}
                      </span>
                      <span className="block text-[10px] text-stone-500 truncate select-none">
                        {book.author}
                      </span>
                      
                      {/* Progress Bar indicator */}
                      <div className="w-full h-1 bg-stone-100 dark:bg-neutral-850 rounded-full overflow-hidden mt-2 relative">
                        <div 
                          className="h-full bg-orange-500 rounded-full transition-all" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* IMMERSIVE EYE-COMFORT BOOK READER VIEW */
        <div 
          id="book-reader-view" 
          className="flex-1 flex flex-col overflow-hidden relative transition-colors duration-200"
          style={{
            backgroundColor: currentTheme.bgApp,
            color: currentTheme.textPrimary
          }}
        >
          
          {/* Header Controls Navigation */}
          <div 
            className="px-3.5 py-2.5 border-b flex items-center justify-between shrink-0 select-none shadow-xs z-30 transition-colors duration-200"
            style={{
              backgroundColor: currentTheme.toolbarBg,
              borderColor: currentTheme.toolbarBorder,
              color: currentTheme.toolbarText
            }}
          >
            <button
              id="btn-back-to-shelf"
              onClick={() => setActiveBookId(null)}
              className="flex items-center gap-1 text-xs font-bold active:scale-95 focus:outline-none transition"
              style={{ color: currentTheme.accent }}
            >
              <ChevronLeft size={18} />
              <span>Libreria</span>
            </button>

            {/* Title display */}
            <div className="text-center px-2 truncate max-w-[220px] sm:max-w-md">
              <span className="text-xs font-bold font-serif block truncate" style={{ color: currentTheme.textPrimary }}>
                {activeBook.title}
              </span>
              <span className="text-[10px] block truncate" style={{ color: currentTheme.textSecondary }}>
                {activeBook.author}
              </span>
            </div>

            {/* Reader toolbar options */}
            <div className="flex items-center gap-2">
              
              {/* Quick direct theme dots */}
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-xl border shadow-2xs"
                style={{
                  backgroundColor: currentTheme.pillBg,
                  borderColor: currentTheme.toolbarBorder
                }}
                title="Cambia tonalità carta anti-affaticamento"
              >
                {(['cream', 'sepia', 'gray', 'night'] as ReaderTheme[]).map((tKey) => {
                  const tObj = READER_THEMES[tKey];
                  const isCurrent = theme === tKey;
                  return (
                    <button
                      key={tKey}
                      onClick={() => handleThemeChange(tKey)}
                      className={`w-4 h-4 rounded-full transition-transform active:scale-90 border flex items-center justify-center ${
                        isCurrent ? 'ring-2 ring-orange-500 ring-offset-1 scale-110 shadow-2xs' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: tObj.dotColor,
                        borderColor: tObj.borderFolio
                      }}
                      title={tObj.name}
                    />
                  );
                })}
              </div>

              {!activeBook.isPdf && (
                <>
                  {/* Quick font scale controls */}
                  <div 
                    className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-xl border text-[11px] font-bold"
                    style={{
                      backgroundColor: currentTheme.pillBg,
                      borderColor: currentTheme.toolbarBorder,
                      color: currentTheme.buttonText
                    }}
                  >
                    <button
                      onClick={() => setCurrentTextScale(p => Math.max(70, p - 10))}
                      className="px-1.5 py-0.5 rounded hover:opacity-80 active:scale-95 transition"
                      title="Riduci caratteri"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-mono opacity-70 px-0.5">{currentTextScale}%</span>
                    <button
                      onClick={() => setCurrentTextScale(p => Math.min(160, p + 10))}
                      className="px-1.5 py-0.5 rounded hover:opacity-80 active:scale-95 transition"
                      title="Ingrandisci caratteri"
                    >
                      A+
                    </button>
                  </div>

                  {/* Bookmark button */}
                  <button
                    id="btn-bookmark-canto"
                    onClick={() => toggleBookmark(activeBook.chapters[currentChapterIndex]?.title)}
                    className="p-1.5 rounded-lg border transition active:scale-95"
                    style={{
                      backgroundColor: currentTheme.buttonBg,
                      borderColor: currentTheme.toolbarBorder,
                      color: bookmarks.includes(activeBook.chapters[currentChapterIndex]?.title) ? currentTheme.accent : currentTheme.buttonText
                    }}
                    title="Segnalibro capitolo"
                  >
                    {bookmarks.includes(activeBook.chapters[currentChapterIndex]?.title) ? (
                      <BookmarkCheck size={16} style={{ color: currentTheme.accent }} />
                    ) : (
                      <Bookmark size={16} className="opacity-70" />
                    )}
                  </button>
                  
                  {/* Typography settings menu toggle */}
                  <button
                    id="btn-settings-display"
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-1.5 rounded-lg border transition active:scale-95 flex items-center gap-1 font-bold text-xs"
                    style={{
                      backgroundColor: showOptions ? currentTheme.accent : currentTheme.buttonBg,
                      borderColor: currentTheme.toolbarBorder,
                      color: showOptions ? '#ffffff' : currentTheme.buttonText
                    }}
                    title="Impostazioni di lettura anti-affaticamento"
                  >
                    <Type size={15} />
                    <span className="text-[11px] hidden md:inline">Testo</span>
                  </button>
                </>
              )}

              <div className="flex items-center gap-1.5">
                {activeBook.isPdf && (
                  <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/20">
                    PDF
                  </span>
                )}
                <button
                  onClick={(e) => deleteBook(activeBook.id, e)}
                  className="p-1 px-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition flex items-center gap-1 active:scale-95"
                  title="Elimina questo volume"
                >
                  <Trash2 size={15} className="text-red-400" />
                  <span className="text-[11px] font-bold text-red-400 hidden sm:inline">Elimina</span>
                </button>
              </div>
            </div>
          </div>

          {/* Eye-Comfort Style & Typography Controls Drawer */}
          {showOptions && !activeBook.isPdf && (
            <div 
              className="absolute top-12 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 border p-5 rounded-2xl shadow-2xl z-50 text-xs space-y-4 animate-fade-in"
              style={{
                backgroundColor: currentTheme.bgFolio,
                borderColor: currentTheme.borderFolio,
                color: currentTheme.textPrimary
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: currentTheme.divider }}>
                <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: currentTheme.textPrimary }}>
                  <Sliders size={14} style={{ color: currentTheme.accent }} />
                  <span>Impostazioni di Lettura Riposante</span>
                </span>
                <button
                  onClick={() => setShowOptions(false)}
                  className="p-1 rounded-full hover:opacity-70 text-xs"
                  style={{ color: currentTheme.textSecondary }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Theme Palettes Selection with Clear Anti-Fatigue Cards */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.textSecondary }}>
                  Tonalità Carta Anti-Affaticamento
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(['cream', 'sepia', 'gray', 'night'] as ReaderTheme[]).map((tKey) => {
                    const tObj = READER_THEMES[tKey];
                    const isSelected = theme === tKey;
                    return (
                      <button
                        key={tKey}
                        onClick={() => handleThemeChange(tKey)}
                        className={`p-2.5 rounded-xl border text-left transition active:scale-95 flex flex-col gap-1 ${
                          isSelected ? 'ring-2 ring-orange-500 shadow-xs' : 'opacity-85 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: tObj.bgFolio,
                          borderColor: isSelected ? currentTheme.accent : tObj.borderFolio,
                          color: tObj.textPrimary
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{tObj.name}</span>
                          <span 
                            className="w-3.5 h-3.5 rounded-full border shadow-2xs" 
                            style={{ backgroundColor: tObj.dotColor, borderColor: tObj.borderFolio }}
                          />
                        </div>
                        <span className="text-[10px] opacity-75 leading-tight">{tObj.subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size Adjuster */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.textSecondary }}>
                  Dimensione Caratteri ({currentTextScale}%)
                </span>
                <div 
                  className="flex justify-between items-center px-3 py-2 rounded-xl border"
                  style={{
                    backgroundColor: currentTheme.pillBg,
                    borderColor: currentTheme.borderFolio
                  }}
                >
                  <button 
                    onClick={() => setCurrentTextScale(p => Math.max(70, p - 10))}
                    className="font-semibold text-base hover:opacity-80 p-1 focus:outline-none"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    A-
                  </button>
                  <div className="flex-1 mx-4">
                    <input
                      type="range"
                      min={70}
                      max={160}
                      step={5}
                      value={currentTextScale}
                      onChange={(e) => setCurrentTextScale(parseInt(e.target.value, 10))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>
                  <button 
                    onClick={() => setCurrentTextScale(p => Math.min(160, p + 10))}
                    className="font-bold text-xl hover:opacity-80 p-1 focus:outline-none"
                    style={{ color: currentTheme.textPrimary }}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.textSecondary }}>
                  Tipo di Carattere
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setFontFamily('serif')}
                    className={`py-1.5 px-2 rounded-lg text-center font-serif font-bold text-xs border transition ${
                      fontFamily === 'serif' ? 'ring-2 ring-orange-500' : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: currentTheme.pillBg,
                      borderColor: currentTheme.borderFolio,
                      color: currentTheme.textPrimary
                    }}
                  >
                    Serif Classico
                  </button>
                  <button
                    onClick={() => setFontFamily('sans')}
                    className={`py-1.5 px-2 rounded-lg text-center font-sans font-bold text-xs border transition ${
                      fontFamily === 'sans' ? 'ring-2 ring-orange-500' : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: currentTheme.pillBg,
                      borderColor: currentTheme.borderFolio,
                      color: currentTheme.textPrimary
                    }}
                  >
                    Sans Moderno
                  </button>
                  <button
                    onClick={() => setFontFamily('accessible')}
                    className={`py-1.5 px-2 rounded-lg text-center font-sans font-medium text-xs border transition ${
                      fontFamily === 'accessible' ? 'ring-2 ring-orange-500' : 'opacity-80'
                    }`}
                    style={{
                      backgroundColor: currentTheme.pillBg,
                      borderColor: currentTheme.borderFolio,
                      color: currentTheme.textPrimary
                    }}
                  >
                    Alta Leggibilità
                  </button>
                </div>
              </div>

              {/* Line Spacing & Text Alignment */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.textSecondary }}>
                    Interlinea
                  </span>
                  <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: currentTheme.borderFolio }}>
                    {(['compact', 'normal', 'loose'] as const).map((sp) => (
                      <button
                        key={sp}
                        onClick={() => setLineSpacing(sp)}
                        className={`flex-1 py-1 text-[10px] font-bold transition ${lineSpacing === sp ? 'bg-orange-500 text-white' : ''}`}
                        style={{
                          backgroundColor: lineSpacing === sp ? currentTheme.accent : currentTheme.pillBg,
                          color: lineSpacing === sp ? '#ffffff' : currentTheme.textSecondary
                        }}
                      >
                        {sp === 'compact' ? 'Stretta' : sp === 'normal' ? 'Normale' : 'Ampia'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: currentTheme.textSecondary }}>
                    Allineamento
                  </span>
                  <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: currentTheme.borderFolio }}>
                    <button
                      onClick={() => setTextAlignment('justify')}
                      className="flex-1 py-1 flex items-center justify-center transition"
                      style={{
                        backgroundColor: textAlignment === 'justify' ? currentTheme.accent : currentTheme.pillBg,
                        color: textAlignment === 'justify' ? '#ffffff' : currentTheme.textSecondary
                      }}
                      title="Giustificato (stile libro stampato)"
                    >
                      <AlignJustify size={14} />
                    </button>
                    <button
                      onClick={() => setTextAlignment('left')}
                      className="flex-1 py-1 flex items-center justify-center transition"
                      style={{
                        backgroundColor: textAlignment === 'left' ? currentTheme.accent : currentTheme.pillBg,
                        color: textAlignment === 'left' ? '#ffffff' : currentTheme.textSecondary
                      }}
                      title="Allineato a sinistra"
                    >
                      <AlignLeft size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Core Content Zone (PDF or Eye-Comfort Book Folio Card) */}
          <div 
            id="chapter-reader-canvas" 
            className="flex-1 flex flex-col overflow-hidden transition-colors duration-200"
            style={{ backgroundColor: currentTheme.bgApp }}
          >
            {activeBook.isPdf ? (
              <PdfCanvasViewer 
                bookId={activeBook.id}
                pdfUrl={activeBook.pdfUrl || ''} 
                bookTitle={activeBook.title}
                showToast={showToast} 
                theme={theme}
                onThemeChange={handleThemeChange}
              />
            ) : (
              /* Centered Paper Folio Card with Soft Tactile Margin */
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 flex justify-center items-start scrollbar-thin">
                {activeBook.chapters[currentChapterIndex] ? (
                  <div 
                    className="w-full max-w-2xl rounded-2xl p-6 sm:p-10 shadow-md transition-all duration-300 relative border my-auto select-text"
                    style={{
                      backgroundColor: currentTheme.bgFolio,
                      borderColor: currentTheme.borderFolio,
                      color: currentTheme.textPrimary,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
                    }}
                  >
                    {/* Running Book Header */}
                    <div 
                      className="flex items-center justify-between pb-4 mb-4 border-b text-[10px] uppercase font-bold tracking-widest select-none"
                      style={{ borderColor: currentTheme.divider, color: currentTheme.textSecondary }}
                    >
                      <span className="truncate max-w-[200px]">{activeBook.title}</span>
                      <span className="truncate max-w-[180px]">{activeBook.chapters[currentChapterIndex].title}</span>
                    </div>

                    {/* Chapter Title */}
                    <h2 
                      className="text-center font-serif text-xl sm:text-2xl font-black tracking-tight leading-snug pb-2 pt-1 select-none"
                      style={{ color: currentTheme.textPrimary }}
                    >
                      {activeBook.chapters[currentChapterIndex].title}
                    </h2>

                    {/* Chapter Ornamental Divider */}
                    <div 
                      className="flex items-center justify-center my-3 text-sm select-none opacity-60"
                      style={{ color: currentTheme.accent }}
                    >
                      <span>❦</span>
                    </div>

                    {/* Reading Chapter Body Content */}
                    <div 
                      className={`whitespace-pre-wrap selection:bg-orange-500/25 ${
                        fontFamily === 'serif' ? 'font-serif' : 
                        fontFamily === 'sans' ? 'font-sans' : 'font-sans font-medium'
                      }`}
                      style={{ 
                        fontSize: `${15 * (currentTextScale / 100)}px`,
                        lineHeight: lineSpacing === 'compact' ? 1.62 : lineSpacing === 'loose' ? 2.15 : 1.88,
                        textAlign: textAlignment === 'justify' ? 'justify' : 'left',
                        color: currentTheme.textPrimary
                      }}
                    >
                      {activeBook.chapters[currentChapterIndex].content}
                    </div>

                    {/* Running Book Footer */}
                    <div 
                      className="flex items-center justify-between pt-6 mt-6 border-t text-[11px] select-none"
                      style={{ borderColor: currentTheme.divider, color: currentTheme.textMuted }}
                    >
                      <span className="truncate">{activeBook.author}</span>
                      <span className="font-mono">Pagina {currentChapterIndex + 1} di {activeBook.chapters.length || 1}</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-center p-8 rounded-2xl border max-w-md mx-auto my-12"
                    style={{
                      backgroundColor: currentTheme.bgFolio,
                      borderColor: currentTheme.borderFolio,
                      color: currentTheme.textSecondary
                    }}
                  >
                    Nessun contenuto disponibile per questo libro.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text navigation footer */}
          {!activeBook.isPdf && (
            <div 
              className="border-t p-2.5 px-4 flex justify-between items-center shrink-0 text-xs select-none shadow-xs transition-colors duration-200"
              style={{
                backgroundColor: currentTheme.toolbarBg,
                borderColor: currentTheme.toolbarBorder,
                color: currentTheme.toolbarText
              }}
            >
              <button
                id="btn-goto-prev"
                onClick={() => setCurrentChapterIndex(p => Math.max(0, p - 1))}
                disabled={currentChapterIndex === 0}
                className="py-1 px-3.5 rounded-lg border focus:outline-none flex items-center gap-1.5 font-bold transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
              >
                <ArrowLeft size={13} />
                <span>Precedente</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: currentTheme.textSecondary }}>
                <span>Capitolo {currentChapterIndex + 1} di {activeBook.chapters.length || 1}</span>
                <span className="hidden sm:inline opacity-60">• Usa le frecce della tastiera per sfogliare</span>
              </div>

              <button
                id="btn-goto-next"
                onClick={() => setCurrentChapterIndex(p => Math.min(activeBook.chapters.length - 1, p + 1))}
                disabled={currentChapterIndex >= activeBook.chapters.length - 1}
                className="py-1 px-3.5 rounded-lg border focus:outline-none flex items-center gap-1.5 font-bold transition active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                style={{
                  backgroundColor: currentTheme.buttonBg,
                  borderColor: currentTheme.toolbarBorder,
                  color: currentTheme.buttonText
                }}
              >
                <span>Successiva</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
