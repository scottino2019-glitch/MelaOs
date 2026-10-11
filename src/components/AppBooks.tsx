import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
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
  Maximize2,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { savePdfToStorage, getPdfFromStorage, deletePdfFromStorage } from '../utils/pdfStorage';

// Configure the PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
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

interface PdfCanvasViewerProps {
  bookId?: string;
  pdfUrl?: string;
  bookTitle?: string;
  showToast: (msg: string) => void;
}

export function PdfCanvasViewer({ bookId, pdfUrl, bookTitle, showToast }: PdfCanvasViewerProps) {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawPdfBlobUrl, setRawPdfBlobUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'canvas' | 'native'>('canvas');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let active = true;

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);

        // 1. Try to load from local IndexedDB if bookId is available
        if (bookId) {
          const stored = await getPdfFromStorage(bookId);
          if (stored) {
            let bytes: Uint8Array;
            if (stored instanceof Uint8Array) {
              bytes = stored;
            } else if (typeof stored === 'string' && stored.startsWith('data:')) {
              bytes = dataUrlToUint8Array(stored);
            } else {
              bytes = new Uint8Array(0);
            }

            if (bytes.length > 0) {
              const blob = new Blob([bytes], { type: 'application/pdf' });
              const blobUrl = URL.createObjectURL(blob);
              if (active) setRawPdfBlobUrl(blobUrl);

              const loadingTask = pdfjsLib.getDocument({
                data: bytes,
                cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
                cMapPacked: true,
              });
              const loadedPdf = await loadingTask.promise;
              if (!active) return;
              setPdf(loadedPdf);
              setTotalPages(loadedPdf.numPages);
              setCurrentPage(1);
              setIsLoading(false);
              return;
            }
          }
        }

        if (!pdfUrl) {
          throw new Error("Nessuna sorgente PDF disponibile per questo documento.");
        }

        // 2. Data URL
        if (pdfUrl.startsWith('data:')) {
          const bytes = dataUrlToUint8Array(pdfUrl);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          if (active) setRawPdfBlobUrl(blobUrl);

          const loadingTask = pdfjsLib.getDocument({
            data: bytes,
          });
          const loadedPdf = await loadingTask.promise;
          if (!active) return;
          setPdf(loadedPdf);
          setTotalPages(loadedPdf.numPages);
          setCurrentPage(1);
          setIsLoading(false);
          return;
        }

        // 3. Static local public or remote URL
        let fetchTarget = pdfUrl;
        if (pdfUrl.startsWith('http') && !pdfUrl.includes(window.location.host)) {
          fetchTarget = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;
        }

        // Fetch ArrayBuffer directly in main thread to bypass any worker CORS/CSP restrictions
        const response = await fetch(fetchTarget);
        if (!response.ok) {
          throw new Error(`Impossibile caricare il PDF: errore di rete HTTP ${response.status} (${response.statusText})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        if (active) setRawPdfBlobUrl(blobUrl);

        const loadingTask = pdfjsLib.getDocument({
          data: bytes,
        });

        const loadedPdf = await loadingTask.promise;
        if (!active) return;
        setPdf(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.error("PDF load error:", err);
        if (active) {
          setErrorMsg(err?.message || "Errore durante il caricamento del file PDF.");
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

  // Render Page on Canvas
  useEffect(() => {
    if (!pdf || viewMode !== 'canvas') return;
    let active = true;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Cancel running task if any
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // ignore
          }
        }

        // Crisp rendering on Retina/High DPI screens
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({ scale: scale * dpr });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
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
    setScale(prev => Math.max(0.5, +(prev - 0.2).toFixed(2)));
  };

  const handleResetZoom = () => {
    setScale(1.1);
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
    showToast('Download del PDF avviato');
  };

  const openInNewTab = () => {
    const url = rawPdfBlobUrl || pdfUrl;
    if (!url) return;
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-neutral-900 border-t border-neutral-800 text-stone-100 overflow-hidden relative select-none">
      {/* Top action toolbar within reader */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs shadow-sm z-20">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center text-stone-200"
            title="Pagina precedente (Freccia Sinistra)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800 text-[11px] font-mono text-stone-300">
            <span>Pag.</span>
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
              className="w-8 text-center bg-transparent border-b border-orange-500/50 text-white font-bold focus:outline-none"
            />
            <span>/ {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition flex items-center justify-center text-stone-200"
            title="Pagina successiva (Freccia Destra)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5">
          {viewMode === 'canvas' && (
            <>
              <button
                onClick={handleZoomOut}
                disabled={isLoading || scale <= 0.5}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-30 transition"
                title="Zoom indietro"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="font-mono text-[10px] text-stone-300 px-1.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
                title="Reimposta zoom al 100%"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={isLoading || scale >= 2.5}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-30 transition"
                title="Zoom avanti"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Toggle Native vs Canvas View */}
          <button
            onClick={() => setViewMode(prev => prev === 'canvas' ? 'native' : 'canvas')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              viewMode === 'native'
                ? 'bg-orange-500 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-stone-300'
            }`}
            title="Passa da visualizzazione Canvas a vista nativa Browser"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">{viewMode === 'canvas' ? 'Vista Nativa' : 'Vista Canvas'}</span>
          </button>

          {/* Download button */}
          <button
            onClick={downloadPdf}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-stone-300 hover:text-white transition"
            title="Scarica file PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Open original in new window */}
          <button
            onClick={openInNewTab}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-orange-400 hover:text-orange-300 transition"
            title="Apri in una nuova scheda"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main viewport zone */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3 sm:p-5 bg-neutral-900/90 scrollbar-thin relative">
        {isLoading ? (
          <div className="m-auto flex flex-col items-center gap-3 py-16 text-center">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-stone-300 font-semibold">
              Elaborazione e rendering vettoriale del PDF...
            </p>
            <p className="text-[10px] text-stone-500 max-w-xs">
              Preparazione pagine ad alta definizione con il motore integrato Scriba.
            </p>
          </div>
        ) : errorMsg ? (
          <div className="m-auto text-center space-y-4 p-6 max-w-md bg-neutral-950/80 border border-neutral-800 rounded-2xl shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-red-400">Impossibile aprire il file PDF</h3>
              <p className="text-[11px] text-stone-400 leading-relaxed">{errorMsg}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <button
                onClick={() => setViewMode('native')}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold rounded-lg transition"
              >
                Prova con Vista Nativa Browser
              </button>
              <button
                onClick={openInNewTab}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-stone-200 text-[11px] font-bold rounded-lg transition"
              >
                Apri collegamento esterno
              </button>
            </div>
          </div>
        ) : viewMode === 'native' ? (
          /* NATIVE BROWSER PDF VIEW (via iframe/embed) */
          <div className="w-full h-full min-h-[500px] bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-xl flex flex-col">
            <iframe
              src={rawPdfBlobUrl || pdfUrl}
              className="w-full flex-1 border-0 rounded-xl bg-white"
              title={bookTitle || "Documento PDF"}
            />
          </div>
        ) : (
          /* VECTORS CANVAS HIGH DEFINITION RENDER */
          <div className="relative border border-neutral-700/80 bg-white rounded-lg shadow-2xl overflow-hidden max-w-full my-auto transition-transform">
            <canvas 
              ref={canvasRef} 
              className="max-w-full h-auto block select-none bg-white"
              style={{ minHeight: '120px' }}
            />
          </div>
        )}
      </div>

      {/* Swipe touch lateral navigation hints for canvas mode */}
      {!isLoading && !errorMsg && viewMode === 'canvas' && (
        <>
          <div 
            onClick={handlePrevPage}
            className={`absolute left-0 top-12 bottom-0 w-10 bg-transparent hover:bg-white/5 active:bg-orange-500/10 transition cursor-pointer flex items-center justify-center text-white/10 hover:text-white/40 text-xl font-bold ${currentPage <= 1 ? 'pointer-events-none opacity-0' : ''}`}
            title="Pagina precedente"
          >
            ‹
          </div>
          <div 
            onClick={handleNextPage}
            className={`absolute right-0 top-12 bottom-0 w-10 bg-transparent hover:bg-white/5 active:bg-orange-500/10 transition cursor-pointer flex items-center justify-center text-white/10 hover:text-white/40 text-xl font-bold ${currentPage >= totalPages ? 'pointer-events-none opacity-0' : ''}`}
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
  // Built-in iOS library with standard classics and official public PDF guides
  const [books, setBooks] = useState<BookItem[]>(() => {
    const saved = localStorage.getItem('apple_books_suite_library');
    if (saved) {
      try {
        const parsed: BookItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Clean up old stale dummy URLs or dead blob URLs
          return parsed.map(b => {
            if (b.pdfUrl && b.pdfUrl.includes('w3.org')) {
              return {
                ...b,
                title: 'Manuale Utente iPad Scriba',
                pdfUrl: '/manuale_ipad.pdf',
              };
            }
            return b;
          });
        }
      } catch (e) {
        // ignore
      }
    }

    return [
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
            content: `Quel ramo del lago di Como, che volge a mezzogiorno, tra due catene ininterrotte di monti, tutto a seni e a golfi, a seconda dello sporgere e del rientrare di quelli, vien, quasi a un tratto, a ristringersi, e a prender corso e figura di fiume, tra un promontorio a destra, e un’ampia costiera dall’altra parte;`
          }
        ]
      }
    ];
  });

  // Reader States
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentTextScale, setCurrentTextScale] = useState<number>(100);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'gray' | 'dark'>('sepia');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  
  // Public directory discovery state
  const [publicPdfs, setPublicPdfs] = useState<{ filename: string; url: string; size: number }[]>([]);
  const [publicFileName, setPublicFileName] = useState('');
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

  useEffect(() => {
    // Only save minimal metadata to avoid exceeding localStorage limits with large base64 strings
    try {
      const sanitized = books.map(b => ({
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
      localStorage.setItem('apple_books_suite_library', JSON.stringify(sanitized));
    } catch (e) {
      console.warn("Storage quota warning:", e);
    }
  }, [books]);

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

        setBooks(prev => [newBook, ...prev]);
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
        setBooks(prev => [newBook, ...prev]);
        setActiveBookId(newBook.id);
        setCurrentChapterIndex(0);
        showToast(`✓ Documento "${titleClean}" importato con successo!`);
      };
      reader.readAsText(file);
    }

    // Reset file input value so user can upload the same file again if desired
    e.target.value = '';
  };

  // Function to load specifically files from the project PUBLIC folder
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

    setBooks(prev => [newBook, ...prev]);
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

    setBooks(prev => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    showToast(`✓ Aperto ${filename}`);
  };

  const deleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletePdfFromStorage(bookId);
    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (activeBookId === bookId) {
      setActiveBookId(null);
    }
    showToast('Libro rimosso dalla libreria');
  };

  return (
    <div 
      id="apple-books-root"
      className={`flex flex-col bg-[#F9F9F9] text-[#1C1C1E] font-sans h-full overflow-hidden transition-all duration-300 relative ${
        theme === 'dark' ? 'bg-[#1C1C1E] text-[#F2F2F7]' : 
        theme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4033]' : 
        theme === 'gray' ? 'bg-[#E5E5EA] text-[#3A3A3C]' : 'bg-[#FFFFFF] text-[#1C1C1E]'
      } w-full h-full`}
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
          
          {/* Header styled for Apple suite */}
          <div className={`${isEmbedded ? 'px-3 py-2.5' : 'px-5 pt-4 pb-3'} bg-white dark:bg-neutral-950 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none shadow-xs`}>
            <div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest block font-sans">iBooks Suite</span>
              <h1 className={`${isEmbedded ? 'text-sm' : 'text-xl'} font-black tracking-tight text-neutral-950 dark:text-neutral-50 flex items-center gap-2`}>
                <BookOpen className="text-orange-500" size={isEmbedded ? 16 : 20} />
                Libreria & PDF Reader
              </h1>
            </div>

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

          {/* Book Shelf Content List */}
          <div className={`flex-1 overflow-y-auto ${isEmbedded ? 'px-3 py-3 space-y-3' : 'px-5 py-4 space-y-4'}`}>
            
            {/* Interactive public directory discovery tool */}
            <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-600 dark:text-orange-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <FolderOpen size={14} />
                  Cartella /public/
                </span>
                <span className="text-[10px] text-neutral-400">PDF nativi garantiti</span>
              </div>

              {/* Detected PDF Badges */}
              {publicPdfs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block">
                    File PDF trovati in public (tocca per aprire):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {publicPdfs.map(p => (
                      <button
                        key={p.filename}
                        type="button"
                        onClick={() => handleOpenDiscoveredPublicPdf(p.url, p.filename)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 text-orange-700 dark:text-orange-300 border border-orange-500/25 transition shadow-2xs"
                      >
                        <FileText size={12} className="text-orange-500" />
                        <span>{p.filename}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual input form */}
              <form onSubmit={handleLoadFromPublicFolder} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Oppure inserisci nome file (es: manuale_ipad.pdf)"
                  value={publicFileName}
                  onChange={(e) => setPublicFileName(e.target.value)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-900 border border-stone-200/50 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Link2 size={13} />
                  <span>Apri</span>
                </button>
              </form>
            </div>

            {/* Books and PDFs Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 block select-none">
                  I tuoi Volumi & Documenti
                </span>
                <span className="text-[10px] text-neutral-400 italic">
                  {books.length} {books.length === 1 ? 'elemento' : 'elementi'}
                </span>
              </div>
              
              <div id="shelf-row-list" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {books.map(book => (
                  <div
                    key={book.id}
                    id={`shelf-item-${book.id}`}
                    onClick={() => {
                      setActiveBookId(book.id);
                      setCurrentChapterIndex(0);
                      setBookmarks([]);
                    }}
                    className="flex flex-col text-left group bg-white dark:bg-neutral-950 p-3 rounded-2xl border border-stone-200/80 dark:border-neutral-800/80 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer relative"
                  >
                    {/* Floating Delete button */}
                    <button
                      onClick={(e) => deleteBook(book.id, e)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition z-10 shadow-sm"
                      title="Elimina"
                    >
                      <Trash2 size={11} />
                    </button>

                    {/* Book Sleeve Cover */}
                    <div className={`w-full aspect-[3/4] rounded-xl flex flex-col justify-between p-3 text-white shadow-inner relative overflow-hidden ${book.coverColor}`}>
                      <div className="space-y-1">
                        <span className="block text-[8px] uppercase font-bold text-white/60 tracking-wider">
                          {book.category}
                        </span>
                        <span className="block font-serif font-black text-xs sm:text-sm tracking-tight leading-snug pt-1 break-words line-clamp-3">
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
            </div>
          </div>
        </div>
      ) : (
        /* IMMERSIVE BOOK READER VIEW */
        <div id="book-reader-view" className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Header Controls Navigation */}
          <div className="px-3.5 py-2.5 bg-stone-50 dark:bg-neutral-950 border-b border-stone-200/60 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none shadow-xs">
            <button
              id="btn-back-to-shelf"
              onClick={() => setActiveBookId(null)}
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-500 active:scale-95 focus:outline-none transition"
            >
              <ChevronLeft size={18} />
              <span>Libreria</span>
            </button>

            {/* Title display */}
            <span className="text-xs font-bold font-serif max-w-[200px] truncate text-center text-stone-900 dark:text-white">
              {activeBook.title}
            </span>

            {/* Reader options */}
            <div className="flex items-center gap-2">
              {!activeBook.isPdf && (
                <>
                  <button
                    id="btn-bookmark-canto"
                    onClick={() => toggleBookmark(activeBook.chapters[currentChapterIndex]?.title)}
                    className="p-1 focus:outline-none transition"
                    title="Segnalibro"
                  >
                    {bookmarks.includes(activeBook.chapters[currentChapterIndex]?.title) ? (
                      <BookmarkCheck size={18} className="text-orange-500" />
                    ) : (
                      <Bookmark size={18} className="opacity-60" />
                    )}
                  </button>
                  
                  <button
                    id="btn-settings-display"
                    onClick={() => setShowOptions(!showOptions)}
                    className={`p-1 rounded transition focus:outline-none ${showOptions ? 'text-orange-500' : 'opacity-70'}`}
                    title="Impostazioni testo"
                  >
                    <Sliders size={18} />
                  </button>
                </>
              )}
              {activeBook.isPdf && (
                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/20">
                  PDF
                </span>
              )}
            </div>
          </div>

          {/* Quick Style controls slider menu */}
          {showOptions && !activeBook.isPdf && (
            <div className="absolute top-12 left-4 right-4 bg-white dark:bg-neutral-900 border border-stone-200/50 dark:border-neutral-800 p-4 rounded-2xl shadow-xl z-50 text-xs space-y-4 text-stone-850 dark:text-stone-200">
              <div className="flex justify-between items-center bg-stone-100 dark:bg-neutral-800 px-3 py-2 rounded-xl">
                <button 
                  onClick={() => setCurrentTextScale(p => Math.max(70, p - 10))}
                  className="font-semibold text-lg hover:text-orange-500 p-1 focus:outline-none"
                >
                  a
                </button>
                <span className="font-bold text-center">{currentTextScale}% grandezza caratteri</span>
                <button 
                  onClick={() => setCurrentTextScale(p => Math.min(160, p + 10))}
                  className="font-semibold text-xl hover:text-orange-500 p-1 focus:outline-none"
                >
                  A
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => setTheme('light')}
                  className={`border py-1.5 rounded-lg text-center font-bold text-stone-900 bg-white ${theme === 'light' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200'}`}
                >
                  Bianco
                </button>
                <button 
                  onClick={() => setTheme('sepia')}
                  className={`border py-1.5 rounded-lg text-center font-bold text-[#5C4033] bg-[#F4ECD8] ${theme === 'sepia' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200'}`}
                >
                  Sepia
                </button>
                <button 
                  onClick={() => setTheme('gray')}
                  className={`border py-1.5 rounded-lg text-center font-bold text-stone-700 bg-[#E5E5EA] ${theme === 'gray' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200'}`}
                >
                  Grigio
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`border py-1.5 rounded-lg text-center font-bold text-stone-100 bg-neutral-900 ${theme === 'dark' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-stone-200'}`}
                >
                  Notte
                </button>
              </div>
            </div>
          )}

          {/* Core Content Zone (PDF or Text) */}
          <div id="chapter-reader-canvas" className="flex-1 flex flex-col bg-stone-50 dark:bg-neutral-950 overflow-hidden">
            {activeBook.isPdf ? (
              <PdfCanvasViewer 
                bookId={activeBook.id}
                pdfUrl={activeBook.pdfUrl || ''} 
                bookTitle={activeBook.title}
                showToast={showToast} 
              />
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-6">
                {activeBook.chapters[currentChapterIndex] ? (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <h2 className="text-center font-serif text-lg font-black tracking-tight leading-relaxed select-none border-b border-stone-200/40 pb-3 mb-3">
                      {activeBook.chapters[currentChapterIndex].title}
                    </h2>

                    <p 
                      className={`leading-relaxed whitespace-pre-wrap select-text selection:bg-orange-500/30 ${
                        fontFamily === 'serif' ? 'font-serif' : 
                        fontFamily === 'mono' ? 'font-mono text-xs' : 'font-sans'
                      }`}
                      style={{ fontSize: `${14 * (currentTextScale / 100)}px` }}
                    >
                      {activeBook.chapters[currentChapterIndex].content}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-stone-400 py-10 text-xs select-none">
                    Nessun contenuto disponibile per questo libro.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Text navigation footer */}
          {!activeBook.isPdf && (
            <div className="border-t border-stone-200/40 p-2.5 bg-stone-50 dark:bg-neutral-950 flex justify-between items-center shrink-0 text-xs select-none text-stone-600 dark:text-neutral-400">
              <button
                id="btn-goto-prev"
                onClick={() => setCurrentChapterIndex(p => Math.max(0, p - 1))}
                disabled={currentChapterIndex === 0}
                className={`p-1 px-3 rounded-lg border border-stone-200/60 dark:border-neutral-800 focus:outline-none flex items-center gap-1 ${
                  currentChapterIndex === 0 ? 'opacity-30 pointer-events-none' : 'hover:transform -translate-x-0.5'
                }`}
              >
                <ArrowLeft size={13} />
                <span>Precedente</span>
              </button>

              <span className="font-semibold text-[11px]">
                Pagina {currentChapterIndex + 1} di {activeBook.chapters.length || 1}
              </span>

              <button
                id="btn-goto-next"
                onClick={() => setCurrentChapterIndex(p => Math.min(activeBook.chapters.length - 1, p + 1))}
                disabled={currentChapterIndex >= activeBook.chapters.length - 1}
                className={`p-1 px-3 rounded-lg border border-stone-200/60 dark:border-neutral-800 focus:outline-none flex items-center gap-1 ${
                  currentChapterIndex >= activeBook.chapters.length - 1 ? 'opacity-30 pointer-events-none' : 'hover:transform translate-x-0.5'
                }`}
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
