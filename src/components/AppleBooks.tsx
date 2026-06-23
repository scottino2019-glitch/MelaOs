import React, { useState, useEffect } from 'react';
import { 
  Book, 
  ChevronLeft, 
  Sliders, 
  Bookmark, 
  BookmarkCheck, 
  List, 
  Search, 
  Check, 
  Plus, 
  Moon, 
  Sun, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  FolderOpen,
  FileText,
  Upload,
  Link2,
  Trash2
} from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  progress: number; // percentage
  category: string;
  isPdf?: boolean;
  pdfUrl?: string;
  chapters: { title: string; content: string }[];
}

interface AppleBooksProps {
  isEmbedded?: boolean;
  onNotification?: (title: string, message: string) => void;
}

export default function AppleBooks({ isEmbedded = false, onNotification }: AppleBooksProps) {
  // Built-in iOS library loaded dynamically with full text contents & simulated PDF support
  const [books, setBooks] = useState<BookItem[]>(() => {
    const saved = localStorage.getItem('apple_books_suite_library');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
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
      },
      {
        id: 'pdf-sample',
        title: 'Manuale PDF d\'Esempio',
        author: 'Apple Guide',
        coverColor: 'bg-indigo-950',
        progress: 0,
        category: 'Guide PDF',
        isPdf: true,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        chapters: []
      }
    ];
  });

  // Reader States
  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentTextScale, setCurrentTextScale] = useState<number>(100); // percentage
  const [theme, setTheme] = useState<'light' | 'sepia' | 'gray' | 'dark'>('sepia');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>([]); // chapter index as bookmarked
  const [showOptions, setShowOptions] = useState(false);
  
  // Custom public folder loader tool
  const [publicFileName, setPublicFileName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('apple_books_suite_library', JSON.stringify(books));
  }, [books]);

  const activeBook = books.find(b => b.id === activeBookId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (onNotification) {
      onNotification("Libri", msg);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleBookmark = (chapterTitle: string) => {
    if (bookmarks.includes(chapterTitle)) {
      setBookmarks(prev => prev.filter(b => b !== chapterTitle));
    } else {
      setBookmarks(prev => [...prev, chapterTitle]);
    }
  };

  // Upload raw files (HTML, TXT, MD or *.PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const titleClean = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const isFilePdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isFilePdf) {
      // PDF File read as ObjectURL to display inside iframe / embed element cleanly offline & client-side
      const pdfUrl = URL.createObjectURL(file);
      const newBook: BookItem = {
        id: 'pdf-' + Date.now().toString(),
        title: titleClean,
        author: 'File PDF Locale',
        coverColor: 'bg-red-900',
        progress: 0,
        category: 'I Miei PDF',
        isPdf: true,
        pdfUrl: pdfUrl,
        chapters: []
      };
      setBooks(prev => [newBook, ...prev]);
      setActiveBookId(newBook.id);
      showToast('✓ PDF caricato ed integrato con successo!');
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
        showToast('✓ Testo importato correttamente!');
      };
      reader.readAsText(file);
    }
  };

  // Function to pull specifically files put in the PUBLIC folder
  const handleLoadFromPublicFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicFileName.trim()) return;

    // Build the correct URL referencing the static public path
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
      coverColor: isFilePdf ? 'bg-indigo-900' : 'bg-orange-900',
      progress: 0,
      category: isFilePdf ? 'PDF Public' : 'Testo Public',
      isPdf: isFilePdf,
      pdfUrl: filename, // will target static asset directly
      chapters: isFilePdf ? [] : [
        {
          title: 'Introduzione',
          content: `Caricato file statico da public: ${filename}. Se è un file di testo semplice inserisci la sua estensione corretta.`
        }
      ]
    };

    setBooks(prev => [newBook, ...prev]);
    setActiveBookId(newBook.id);
    setPublicFileName('');
    showToast(`Libro importato da public: ${titleClean}`);
  };

  const deleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBooks(prev => prev.filter(b => b.id !== bookId));
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
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur text-white font-semibold text-[11px] px-3.5 py-2 rounded-full shadow-lg z-50 flex items-center gap-1.5 border border-white/10">
          <Sparkles className="text-orange-400" size={12} />
          <span>{toastMessage}</span>
        </div>
      )}

      {!activeBook ? (
        /* LIBRARY SHELF VIEW */
        <div id="books-shelf-view" className="flex-1 flex flex-col overflow-hidden bg-[#F2F2F7] dark:bg-neutral-900 text-stone-900 dark:text-stone-100">
          
          {/* Header styled for Apple suite */}
          <div className={`${isEmbedded ? 'px-3 py-2' : 'px-4 pt-4 pb-3'} bg-white dark:bg-neutral-950 border-b border-stone-200 dark:border-neutral-800 flex items-center justify-between shrink-0 select-none`}>
            <div>
              <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest block font-sans">iBooks Suite</span>
              <h1 className={`${isEmbedded ? 'text-sm' : 'text-lg'} font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50 flex items-center gap-1.5`}>
                <BookOpen className="text-orange-500" size={isEmbedded ? 14 : 18} />
                Libreria
              </h1>
            </div>

            {/* Premium Multi Format Finder Trigger File Upload Button */}
            <label className={`flex items-center gap-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white ${isEmbedded ? 'text-[10px] px-2 py-1.5' : 'text-[11px] px-3 py-2'} font-bold rounded-full cursor-pointer shadow-sm transition-all`}>
              <Upload size={12} />
              <span>Sfoglia</span>
              <input 
                type="file" 
                accept=".pdf,.txt,.html,.md" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Book Shelf Content List */}
          <div className={`flex-1 overflow-y-auto ${isEmbedded ? 'px-2.5 py-2.5 space-y-3' : 'px-4 py-4 space-y-4'}`}>
            
            {/* Quick Interactive public directory caller */}
            <form 
              onSubmit={handleLoadFromPublicFolder}
              className={`bg-white dark:bg-neutral-950 p-2.5 rounded-2xl border border-stone-200 dark:border-neutral-800 shadow-xs text-xs space-y-1 block`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-600 dark:text-white text-[10px] uppercase tracking-wide flex items-center gap-1">
                  <FolderOpen size={12} className="text-orange-500" />
                  Carica da /public/
                </span>
                {!isEmbedded && <span className="text-[9px] text-neutral-400">PDF o Testo</span>}
              </div>
              {!isEmbedded && (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  Piazza i tuoi file PDF nella cartella <b>public/</b> del progetto e digitali qui per leggerli.
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Es: libro.pdf"
                  value={publicFileName}
                  onChange={(e) => setPublicFileName(e.target.value)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 focus:ring-1 focus:ring-orange-500/50"
                />
                <button
                  type="submit"
                  className="bg-neutral-900 hover:bg-neutral-850 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                >
                  <Link2 size={12} />
                  <span>Carica</span>
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 block select-none">I tuoi Volumi</span>
                <span className="text-[9px] text-neutral-400 italic">Supporta PDF nativi</span>
              </div>
              
              <div id="shelf-row-list" className="grid grid-cols-2 gap-3.5">
                {books.map(book => (
                  <div
                    key={book.id}
                    id={`shelf-item-${book.id}`}
                    onClick={() => {
                      setActiveBookId(book.id);
                      setCurrentChapterIndex(0);
                      setBookmarks([]);
                    }}
                    className="flex flex-col text-left group bg-white dark:bg-neutral-950 p-2.5 rounded-2xl border border-stone-200/60 dark:border-neutral-800/80 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer relative"
                  >
                    {/* Floating Delete button */}
                    <button
                      onClick={(e) => deleteBook(book.id, e)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                      title="Elimina"
                    >
                      <Trash2 size={10} />
                    </button>

                    {/* Simulated Book Sleeve Cover */}
                    <div className={`w-full aspect-[3/4] rounded-xl flex flex-col justify-between p-2.5 text-white shadow-xs relative overflow-hidden ${book.coverColor}`}>
                      <div className="space-y-0.5">
                        <span className="block text-[8px] uppercase font-bold text-white/50 tracking-wide">{book.category}</span>
                        <span className="block font-serif font-black text-xs tracking-tight leading-tight pt-1 break-words line-clamp-3">{book.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-medium text-white/75">
                        <span className="truncate max-w-[80px]">{book.author}</span>
                        {book.isPdf && (
                          <span className="bg-red-600/90 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest">PDF</span>
                        )}
                      </div>
                    </div>

                    {/* Meta progress */}
                    <span className="block font-bold mt-1.5 text-stone-850 dark:text-neutral-200 text-xs truncate select-none">{book.title}</span>
                    <span className="block text-[10px] text-stone-500 truncate select-none">{book.author}</span>
                    
                    {/* Progress Bar indicator */}
                    <div className="w-full h-1 bg-stone-100 dark:bg-neutral-850 rounded-full overflow-hidden mt-1.5 relative">
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
        /* IMMERSIVE BOOK READER VIEW (with built-in PDF viewport) */
        <div id="book-reader-view" className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Header Controls Navigation */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-neutral-950 border-b border-stone-200/40 flex items-center justify-between shrink-0 select-none">
            <button
              id="btn-back-to-shelf"
              onClick={() => setActiveBookId(null)}
              className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-500 focus:outline-none transition"
            >
              <ChevronLeft size={16} />
              <span>Indietro</span>
            </button>

            {/* Title display */}
            <span className="text-xs font-bold font-serif max-w-[150px] truncate">
              {activeBook.title}
            </span>

            {/* Quick Styling buttons */}
            <div className="flex items-center gap-2">
              {!activeBook.isPdf && (
                <>
                  <button
                    id="btn-bookmark-canto"
                    onClick={() => toggleBookmark(activeBook.chapters[currentChapterIndex]?.title)}
                    className="p-1 focus:outline-none transition-all"
                  >
                    {bookmarks.includes(activeBook.chapters[currentChapterIndex]?.title) ? (
                      <BookmarkCheck size={16} className="text-orange-500" />
                    ) : (
                      <Bookmark size={16} className="opacity-60" />
                    )}
                  </button>
                  
                  <button
                    id="btn-settings-display"
                    onClick={() => setShowOptions(!showOptions)}
                    className={`p-1 rounded transition focus:outline-none ${showOptions ? 'text-orange-500' : 'opacity-70'}`}
                  >
                    <Sliders size={16} />
                  </button>
                </>
              )}
              {activeBook.isPdf && (
                <span className="bg-red-500/10 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">PDF Mode</span>
              )}
            </div>
          </div>

          {/* Quick Style controls slider menu */}
          {showOptions && !activeBook.isPdf && (
            <div className="absolute top-12 left-4 right-4 bg-white dark:bg-neutral-900 border border-stone-200/50 dark:border-neutral-800 p-4 rounded-2xl shadow-xl z-50 text-xs space-y-4 text-stone-800 dark:text-stone-200">
              
              {/* Font scaling control */}
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

              {/* Theme switching buttons selection */}
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

          {/* Book Content rendering core zone (TXT or native embedded PDF) */}
          <div id="chapter-reader-canvas" className="flex-1 flex flex-col bg-stone-50 dark:bg-neutral-950 overflow-hidden">
            {activeBook.isPdf ? (
              /* REAL PDF VIEWER OBJECT EMULATOR */
              <div className="flex-1 w-full h-full bg-neutral-800 relative flex flex-col">
                <iframe
                  id="pdf-frame-visualizer"
                  src={`${activeBook.pdfUrl}#toolbar=0&navpanes=0`}
                  title={activeBook.title}
                  className="w-full h-full border-none bg-neutral-900"
                  type="application/pdf"
                />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur text-[10px] text-white/90 px-3 py-1 rounded-full shadow-md text-center pointer-events-none">
                  Trascina o scorri sul PDF per navigare
                </div>
              </div>
            ) : (
              /* TEXT CONTENT COMPANION RENDERING */
              <div className="flex-1 overflow-y-auto px-5 py-5">
                {activeBook.chapters[currentChapterIndex] ? (
                  <div className="max-w-2xl mx-auto space-y-4">
                    <h2 className="text-center font-serif text-md font-black tracking-tight leading-relaxed select-none border-b border-stone-200/20 pb-3 mb-3">
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

          {/* Table of contents footer indicator */}
          {!activeBook.isPdf && (
            <div className="border-t border-stone-200/20 p-2.5 bg-stone-50 dark:bg-neutral-950 flex justify-between items-center shrink-0 text-[11px] select-none text-stone-600 dark:text-neutral-400">
              <button
                id="btn-goto-prev"
                onClick={() => setCurrentChapterIndex(p => Math.max(0, p - 1))}
                disabled={currentChapterIndex === 0}
                className={`p-1 px-2.5 rounded-lg border border-stone-200/40 dark:border-neutral-800 focus:outline-none flex items-center gap-1 ${
                  currentChapterIndex === 0 ? 'opacity-30' : 'hover:transform -translate-x-0.5'
                }`}
              >
                <ArrowLeft size={12} />
                <span>Preced.</span>
              </button>

              <span className="font-semibold">
                Pagina {currentChapterIndex + 1} di {activeBook.chapters.length || 1}
              </span>

              <button
                id="btn-goto-next"
                onClick={() => setCurrentChapterIndex(p => Math.min(activeBook.chapters.length - 1, p + 1))}
                disabled={currentChapterIndex >= activeBook.chapters.length - 1}
                className={`p-1 px-2.5 rounded-lg border border-stone-200/40 dark:border-neutral-800 focus:outline-none flex items-center gap-1 ${
                  currentChapterIndex >= activeBook.chapters.length - 1 ? 'opacity-35' : 'hover:transform translate-x-0.5'
                }`}
              >
                <span>Succ.</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
