import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Save,
  Menu,
  FileDown,
  Sparkles,
  RefreshCw,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Layout,
  BookOpen,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string; // Will store HTML string for rich layout
  wordCount: number;
  charCount: number;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
}

export default function AppleTextEditor({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('apple_text_editor_docs_rich_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'pages-template-lettera',
        title: 'Lettera Formale Proposta',
        templateName: 'Lettera',
        content: `
          <div style="font-family: 'Inter', sans-serif;">
            <p style="text-align: right; color: #888; font-size: 11px;">Roma, 22 Giugno 2026</p>
            <h1 style="font-size: 18px; font-weight: bold; color: #111; margin-bottom: 2px;">PROPOSTA COLLABORAZIONE</h1>
            <p style="font-size: 13px; font-weight: 500; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">Lettera d'Intenti Aziendali</p>
            <div style="border-left: 2px solid #f59e0b; padding-left: 10px; margin-bottom: 15px; font-style: italic; color: #555; font-size: 12px;">
              Gentile Partner,<br>siamo lieti di proporre questa bozza creata interamente tramite la nuova Pages Suite.
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #333;">
              Il nostro team ha completato la sintesi dell'architettura iOS. In Pages troverai tutti i moduli necessari per completare e impaginare il resoconto con stili d'autore e liste di controllo.
            </p>
            <p style="font-size: 12px; margin-top: 15px; font-weight: bold;">Cordiali Saluti,<br><span style="color: #f59e0b;">Pages Suite Design Team</span></p>
          </div>
        `,
        wordCount: 82,
        charCount: 618,
        createdAt: '22 Giu 2026, 14:00',
        updatedAt: '22 Giu 2026, 14:45'
      },
      {
        id: 'pages-template-ricetta',
        title: 'Ricetta Lasagna Classica 🍝',
        templateName: 'Ricetta',
        content: `
          <div style="font-family: 'Georgia', serif;">
            <h1 style="font-size: 20px; font-weight: 900; color: #b91c1c; text-align: center; margin-bottom: 4px;">Lasagne alla Bolognese</h1>
            <p style="text-align: center; color: #6b7280; font-size: 11px; font-style: italic; margin-top: 0;">Ricettario Tradizionale di Famiglia</p>
            <hr style="border: 0; border-[0.5px] solid #fecaca; margin: 10px 0;">
            <h3 style="font-size: 13px; font-weight: bold; color: #b91c1c;">Ingredienti Necessari:</h3>
            <ul style="font-size: 12px; line-height: 1.5; color: #451a03; list-style-type: square; padding-left: 15px;">
              <li>Fogli di pasta fresca (all'uovo)</li>
              <li>Ragù classico bolognese cotto a fuoco lento 🥩</li>
              <li>Besciamella fresca fatta in casa</li>
              <li>Parmigiano Reggiano grattugiato d.o.p.</li>
            </ul>
            <h3 style="font-size: 13px; font-weight: bold; color: #b91c1c; margin-top: 12px;">Preparazione:</h3>
            <ol style="font-size: 12px; line-height: 1.5; color: #451a03; padding-left: 15px;">
              <li>Preriscalda il forno statico a 180°C.</li>
              <li>Stendi un velo leggero di besciamella sul fondo della teglia.</li>
              <li>Alterna strati di sfoglia di pasta, ragù saporito, besciamella e abbondante parmigiano grattugiato.</li>
            </ol>
          </div>
        `,
        wordCount: 95,
        charCount: 780,
        createdAt: '22 Giu 2026, 11:30',
        updatedAt: '22 Giu 2026, 11:55'
      }
    ];
  });

  const [activeDocId, setActiveDocId] = useState<string>('pages-template-lettera');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Selection/Template Sheets state
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Toolbar state
  const [textColor, setTextColor] = useState('#111111');
  const [fontSize, setFontSize] = useState('3'); // 1-7 web format
  const [paperTheme, setPaperTheme] = useState<'white' | 'sepia' | 'dark' | 'noble'>('white');
  const [fontFamily, setFontFamily] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-sans');

  const editorRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('apple_text_editor_docs_rich_v2', JSON.stringify(documents));
  }, [documents]);

  // Handle active doc content loading without breaking cursor focus
  useEffect(() => {
    const activeDoc = documents.find(d => d.id === activeDocId);
    if (activeDoc && editorRef.current && !isEditingRef.current) {
      editorRef.current.innerHTML = activeDoc.content;
    }
  }, [activeDocId]);

  const activeDoc = documents.find(d => d.id === activeDocId) || documents[0];

  const handleContentInput = () => {
    if (!editorRef.current) return;
    isEditingRef.current = true;
    const htmlContent = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText || '';
    
    const words = plainText.trim() === '' ? 0 : plainText.trim().split(/\s+/).length;
    const chars = plainText.length;

    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeDocId) {
        return {
          ...doc,
          content: htmlContent,
          wordCount: words,
          charCount: chars,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
      return doc;
    }));
    
    setTimeout(() => {
      isEditingRef.current = false;
    }, 0);
  };

  // Execute formatting command safely
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setDocuments(prev => prev.map(doc => {
      if (doc.id === activeDocId) {
        return { ...doc, title: title || 'Senza titolo' };
      }
      return doc;
    }));
  };

  const createDocumentFromTemplate = (templateType: 'vuoto' | 'lettera' | 'ricetta' | 'diario') => {
    let title = '';
    let content = '';
    let templateName = '';

    if (templateType === 'vuoto') {
      title = 'Nuovo Documento';
      templateName = 'Pagina';
      content = '<div>Inizia a scrivere la tua pagina in Pages... Seleziona parole per applicare grassetti o colori!</div>';
    } else if (templateType === 'lettera') {
      title = 'Lettera Intestata';
      templateName = 'Lettera';
      content = `
        <div style="font-family: 'Inter', sans-serif;">
          <p style="text-align: right; color: #777; font-size: 11px;">[Data Offline]</p>
          <h2 style="font-size: 16px; font-weight: bold; color: #111;">OGGETTO: Lettera d'Intenti Formale</h2>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 12px 0;">
          <p style="font-size: 12px; leading-height: 1.6;">Gentile Direttore,<br><br>Scrivo questa nota per riassumere i risultati degli accordi presi durante la nostra passata discussione sulle applicazioni Apple Pages.</p>
        </div>
      `;
    } else if (templateType === 'ricetta') {
      title = 'Pasta con Zucca e Noci 🍲';
      templateName = 'Ricetta';
      content = `
        <div style="font-family: 'Georgia', serif;">
          <h1 style="font-size: 20px; font-weight: bold; text-align: center; color: #b45309;">Pasta Zucca e Speck</h1>
          <p style="text-align: center; font-size: 11px; font-style: italic; color: #6b7280;">Preparazione: 25 min</p>
          <hr style="border:0; border-bottom: 2px dashed #f59e0b; margin: 15px 0;">
          <h3 style="font-size: 13px; color: #9a3412;">Ingredienti:</h3>
          <ul style="font-size: 12px; line-height: 1.6;">
            <li>Rigatoni o Tortiglioni (320g)</li>
            <li>Polpa di zucca cotta a dadini (400g)</li>
            <li>Filetti di speck croccante</li>
          </ul>
        </div>
      `;
    } else {
      title = 'Pensiero del Giorno 📖';
      templateName = 'Diario';
      content = `
        <div style="font-family: 'Georgia', serif; font-style: italic; color: #1e3a8a;">
          <p style="text-align: right; font-size: 11px; font-weight: bold;">Lunedì Sera</p>
          <p style="font-size: 13px; line-height: 1.7; text-align: justify;">"Oggi ho riflettuto sul design dell'interfaccia. L'eleganza non risiede nell'aggiungere decorazioni inutili, ma nel semplificare ogni interazione e renderla piacevole al tocco..."</p>
        </div>
      `;
    }

    const newDoc: Document = {
      id: 'pages-' + Date.now().toString(),
      title,
      templateName,
      content,
      wordCount: content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length,
      charCount: content.replace(/<[^>]*>/g, '').length,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString([], { day: '2-digit', month: 'short' })
    };

    setDocuments(prev => [newDoc, ...prev]);
    setActiveDocId(newDoc.id);
    setShowTemplatePicker(false);
    setSidebarOpen(false);
    showToast('✓ Nuovo Documento Pages Creato!');
  };

  const handleDeleteActiveDoc = () => {
    if (documents.length <= 1) {
      showToast("Impossibile eliminare l'unico documento rimasto.");
      return;
    }
    const filtered = documents.filter(d => d.id !== activeDocId);
    setDocuments(filtered);
    setActiveDocId(filtered[0].id);
    showToast('Documento eliminato');
  };

  const handleCopyText = () => {
    if (!editorRef.current) return;
    const plainText = editorRef.current.innerText || '';
    navigator.clipboard.writeText(plainText);
    showToast('Testo semplice copiato negli appunti!');
  };

  const handleDownloadDoc = (type: 'txt' | 'html') => {
    if (!activeDoc || !editorRef.current) return;
    let content = '';
    let filename = `${activeDoc.title || 'documento'}.${type}`;
    let mime = 'text/plain';

    if (type === 'html') {
      mime = 'text/html';
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${activeDoc.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 45px; color: #111; line-height: 1.6; max-width: 800px; margin: 0 auto; background: #fff; }
            h1 { font-weight: 800; border-bottom: 1px solid #eee; padding-bottom: 8px; color: #111; }
            .content { font-size: 15px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>${activeDoc.title}</h1>
          <div class="content">${editorRef.current.innerHTML}</div>
        </body>
        </html>
      `;
    } else {
      content = editorRef.current.innerText || '';
    }

    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ File .${type.toUpperCase()} esportato!`);
  };

  const executeFindReplace = (replaceAll: boolean = false) => {
    if (!findText || !activeDoc || !editorRef.current) return;
    
    let html = editorRef.current.innerHTML;
    if (replaceAll) {
      const escaped = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      html = html.replace(regex, replaceText);
    } else {
      html = html.replace(findText, replaceText);
    }

    editorRef.current.innerHTML = html;
    handleContentInput();
    showToast('Testo sostituito con successo');
  };

  return (
    <div 
      id="apple-text-editor-container"
      className="flex flex-col bg-neutral-100 text-neutral-900 font-sans h-full overflow-hidden relative select-none w-full h-full"
    >
      {/* Toast Alert overlay notifications */}
      {toastMessage && (
        <div id="editor-popup-toast" className="absolute top-16 left-1/2 -translate-x-1/2 bg-neutral-900/95 backdrop-blur text-white font-bold text-[11px] px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center gap-2 border border-white/10 animate-fade-in-down">
          <Sparkles className="text-amber-400 animate-pulse" size={13} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Pages Premium Navigation Bar inside mobile chassis */}
      <div 
        id="text-editor-top-actions" 
        className="flex items-center justify-between border-b border-stone-200 bg-white px-3 py-2 shrink-0 select-none shadow-xs z-20"
      >
        <div className="flex items-center gap-1.5 font-bold text-stone-700">
          <button 
            id="btn-toggle-editor-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg text-neutral-600 hover:text-amber-600 hover:bg-stone-50 transition-colors focus:outline-none ${sidebarOpen ? 'bg-amber-50 text-amber-600' : ''}`}
            title="Gestisci Documenti"
          >
            <Menu size={16} />
          </button>
          <span className="text-[10px] bg-amber-500/10 text-amber-700 uppercase tracking-widest px-2 py-0.5 rounded-md hidden xs:inline">Pages</span>
        </div>

        {/* Dynamic Title Input */}
        <div className="flex-1 px-1 max-w-[130px] mx-auto text-center">
          <input
            id="active-document-title-input"
            type="text"
            value={activeDoc.title}
            onChange={handleTitleChange}
            placeholder="Senza nome"
            className="text-center font-bold text-xs bg-transparent border-none text-neutral-900 focus:outline-none focus:ring-1 focus:ring-amber-500/20 px-1 py-0.5 rounded w-full truncate"
          />
        </div>

        {/* iOS Styled Actions triggers */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="btn-manual-save"
            onClick={() => {
              localStorage.setItem('apple_text_editor_docs_rich_v2', JSON.stringify(documents));
              showToast('✓ Documento salvato con successo!');
            }}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xs focus:outline-none"
            title="Salva nel Browser"
          >
            <Save size={12} />
            <span>Salva</span>
          </button>

          <button
            id="btn-export-html-option"
            onClick={() => handleDownloadDoc('html')}
            className="p-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold focus:outline-none flex items-center gap-1"
            title="Esporta HTML"
          >
            <FileDown size={12} />
            <span>HTML</span>
          </button>
        </div>
      </div>

      {/* Editor Body Workspace */}
      <div id="editor-workspace" className="flex-1 flex overflow-hidden relative bg-stone-50">
        
        {/* Template Picker Overlay Sheet */}
        {showTemplatePicker && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs z-40 p-4 flex flex-col justify-end animate-fade-in">
            <div className="bg-white rounded-t-3xl p-4 shadow-2xl max-h-[85%] overflow-y-auto animate-slide-up text-stone-800">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3">
                <span className="font-extrabold text-xs tracking-wider uppercase text-amber-600 block">Scegli Modello Pages</span>
                <button 
                  onClick={() => setShowTemplatePicker(false)}
                  className="p-1 bg-stone-100 rounded-full hover:bg-stone-200 focus:outline-none"
                >
                  <X size={15} />
                </button>
              </div>

              <span className="text-[10px] text-neutral-400 uppercase tracking-widest pl-1 font-bold block mb-2">Modelli d'Autore</span>
              <div className="grid grid-cols-2 gap-3 pb-4">
                <button 
                  onClick={() => createDocumentFromTemplate('vuoto')}
                  className="bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 p-3 rounded-2xl text-left transition-all"
                >
                  <FileText className="text-amber-600 mb-1" size={18} />
                  <span className="block font-bold text-xs text-stone-900">Foglio Vuoto</span>
                  <span className="text-[9px] text-neutral-500">Documento semplice</span>
                </button>

                <button 
                  onClick={() => createDocumentFromTemplate('lettera')}
                  className="bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 p-3 rounded-2xl text-left transition-all"
                >
                  <Calendar className="text-blue-500 mb-1" size={18} />
                  <span className="block font-bold text-xs text-stone-900">Lettera Formale</span>
                  <span className="text-[9px] text-neutral-500">Bozza intestata</span>
                </button>

                <button 
                  onClick={() => createDocumentFromTemplate('ricetta')}
                  className="bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 p-3 rounded-2xl text-left transition-all"
                >
                  <FileSpreadsheet className="text-red-500 mb-1" size={18} />
                  <span className="block font-bold text-xs text-stone-900">Ricettario</span>
                  <span className="text-[9px] text-neutral-500">Pasta o sfiziosità</span>
                </button>

                <button 
                  onClick={() => createDocumentFromTemplate('diario')}
                  className="bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-400 p-3 rounded-2xl text-left transition-all"
                >
                  <BookOpen className="text-indigo-500 mb-1" size={18} />
                  <span className="block font-bold text-xs text-stone-900">Diario Pensieri</span>
                  <span className="text-[9px] text-neutral-500">Stile italico</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sliding Document List Drawer */}
        {sidebarOpen && (
          <div 
            id="editor-sidebar-docs"
            className="absolute inset-y-0 left-0 w-64 border-r border-stone-200 bg-white/95 backdrop-blur z-30 h-full overflow-hidden flex flex-col shadow-xl animate-slide-right text-stone-850"
          >
            {/* Header action inside drawer */}
            <div className="p-3 bg-stone-50 flex items-center justify-between border-b border-stone-200/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Documenti</span>
              <div className="flex gap-1 items-center">
                <button
                  id="btn-new-document"
                  onClick={() => setShowTemplatePicker(true)}
                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold px-2 py-1.5 rounded-full transition-all focus:outline-none"
                >
                  <Plus size={12} />
                  <span>Nuovo</span>
                </button>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Document Cards Scroll List */}
            <div id="documents-scroll-list" className="flex-1 overflow-y-auto p-2 space-y-1">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  onClick={() => {
                    setActiveDocId(doc.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all focus:outline-none border ${
                    activeDocId === doc.id
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs text-amber-950'
                      : 'hover:bg-neutral-50 border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${activeDocId === doc.id ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    <FileText size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs truncate text-stone-900">{doc.title}</span>
                    <span className="block text-[8px] uppercase font-semibold text-amber-700/80 mt-0.5">{doc.templateName || 'Pages'} • {doc.wordCount} parole</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Delete active doc option */}
            {activeDoc && (
              <div className="p-3 border-t border-neutral-150 bg-neutral-50">
                <button
                  id="btn-delete-current-doc"
                  onClick={() => {
                    handleDeleteActiveDoc();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-200 transition-all focus:outline-none"
                >
                  <Trash2 size={12} />
                  <span>Elimina Documento</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Canvas Workspace details */}
        <div id="editor-container-main" className="flex-1 flex flex-col bg-stone-100 overflow-hidden relative">
          
          {/* iOS Pages Rich Formatting Ribbon Toolbar inside mobile view */}
          <div 
            id="editor-formatting-toolbar" 
            className="flex flex-col p-2 bg-white border-b border-stone-200 shrink-0 select-none space-y-1.5 shadow-xs z-10"
          >
            {/* Row 1: Paragraph styles, Font weights and Search */}
            <div className="flex items-center justify-between gap-1 select-none overflow-x-auto scrollbar-none">
              
              {/* Bold Italic Underline Controls */}
              <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg shrink-0">
                <button
                  id="btn-style-bold"
                  onClick={() => formatText('bold')}
                  className="p-1 px-2 hover:bg-white rounded font-bold text-[11px] hover:text-neutral-950 text-neutral-600 shadow-xs"
                  title="Grassetto"
                >
                  B
                </button>
                <button
                  id="btn-style-italic"
                  onClick={() => formatText('italic')}
                  className="p-1 px-2 hover:bg-white rounded italic text-[11px] hover:text-neutral-950 text-neutral-600 shadow-xs"
                  title="Corsivo"
                >
                  I
                </button>
                <button
                  id="btn-style-underline"
                  onClick={() => formatText('underline')}
                  className="p-1 px-2 hover:bg-white rounded underline text-[11px] hover:text-neutral-950 text-neutral-600 shadow-xs"
                  title="Sottolineato"
                >
                  U
                </button>
                <button
                  id="btn-style-strikethrough"
                  onClick={() => formatText('strikeThrough')}
                  className="p-1 px-1.5 hover:bg-white rounded line-through text-[9px] hover:text-neutral-950 text-neutral-600 shadow-xs"
                  title="Sbarrato"
                >
                  S
                </button>
              </div>

              {/* Advanced Block Formatter options */}
              <select
                onChange={(e) => formatText('formatBlock', e.target.value)}
                className="bg-stone-100 border-none text-[10px] text-neutral-700 rounded-lg px-1.5 py-1 font-semibold focus:outline-none shrink-0"
                defaultValue="div"
              >
                <option value="div">Corpo Testo</option>
                <option value="h1">Titolo Grande</option>
                <option value="h2">Intestazione</option>
                <option value="h3">Sotto-sezione</option>
                <option value="blockquote">Citazione Mac</option>
              </select>

              {/* Font Sizer */}
              <select
                value={fontSize}
                onChange={(e) => {
                  setFontSize(e.target.value);
                  formatText('fontSize', e.target.value);
                }}
                className="bg-stone-100 border-none text-[10px] text-neutral-700 rounded-lg px-1.5 py-1 font-semibold focus:outline-none shrink-0"
              >
                <option value="1">Nano</option>
                <option value="2">Piccolo</option>
                <option value="3">Normale</option>
                <option value="4">Medio</option>
                <option value="5">Stile Lettera</option>
                <option value="6">Intestato</option>
                <option value="7">Enorme</option>
              </select>
            </div>

            {/* Row 2: Alignment, Color palette & Lists */}
            <div className="flex items-center justify-between gap-1 select-none overflow-x-auto scrollbar-none pt-0.5">
              
              {/* Text Align buttons */}
              <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg shrink-0">
                <button 
                  onClick={() => formatText('justifyLeft')} 
                  className="p-1 text-stone-600 hover:text-stone-900 focus:outline-none"
                  title="Allinea a Sinistra"
                >
                  <AlignLeft size={12} />
                </button>
                <button 
                  onClick={() => formatText('justifyCenter')} 
                  className="p-1 text-stone-600 hover:text-stone-900 focus:outline-none"
                  title="Allinea al Centro"
                >
                  <AlignCenter size={12} />
                </button>
                <button 
                  onClick={() => formatText('justifyRight')} 
                  className="p-1 text-stone-600 hover:text-stone-900 focus:outline-none"
                  title="Allinea a Destra"
                >
                  <AlignRight size={12} />
                </button>
                <button 
                  onClick={() => formatText('justifyFull')} 
                  className="p-1 text-stone-600 hover:text-stone-900 focus:outline-none"
                  title="Giustifica"
                >
                  <AlignJustify size={12} />
                </button>
              </div>

              {/* Bullet and checklist inserts */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg shrink-0 text-[10px] font-bold text-neutral-600">
                <button
                  onClick={() => formatText('insertUnorderedList')}
                  className="p-1 px-1.5 hover:bg-white rounded"
                  title="Lista Puntata"
                >
                  • Elenco
                </button>
                <button
                  onClick={() => formatText('insertOrderedList')}
                  className="p-1 px-1.5 hover:bg-white rounded"
                  title="Lista Numerata"
                >
                  1. Numeri
                </button>
              </div>

              {/* iOS Note colors palette */}
              <div className="flex items-center gap-1 shrink-0 bg-stone-100 p-1 rounded-lg">
                <Palette size={11} className="text-neutral-400" />
                <select
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    formatText('foreColor', e.target.value);
                  }}
                  className="bg-transparent border-none text-[8px] text-neutral-700 font-bold focus:outline-none"
                >
                  <option value="#111111">Apple Graphite</option>
                  <option value="#d97706">Amber Yellow</option>
                  <option value="#dc2626">Red Velvet</option>
                  <option value="#2563eb">Classic Ocean</option>
                  <option value="#16a34a">Pine Green</option>
                </select>
              </div>

              {/* Toggle Find panel */}
              <button
                id="btn-trigger-find-replace"
                onClick={() => setShowFindReplace(!showFindReplace)}
                className={`p-1.5 rounded-lg transition-all focus:outline-none shrink-0 ${
                  showFindReplace ? 'bg-amber-55 text-amber-600' : 'text-neutral-500 hover:bg-stone-100'
                }`}
              >
                <Search size={12} />
              </button>
            </div>
          </div>

          {/* Quick inline search panel */}
          {showFindReplace && (
            <div id="find-replace-panel" className="bg-white border-b border-stone-200 p-3.5 flex flex-col gap-2 animate-slide-down shrink-0 z-10 shadow-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cerca parola..."
                  className="flex-1 bg-stone-50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 border-none focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Sostituisci..."
                  className="flex-1 bg-stone-50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-800 border-none focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => executeFindReplace(false)}
                  className="bg-stone-100 hover:bg-stone-200 p-1.5 px-3 rounded-lg text-[10px] font-bold text-stone-700"
                >
                  Sostituisci
                </button>
                <button
                  onClick={() => executeFindReplace(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 px-3 rounded-lg text-[10px] font-bold shadow-xs"
                >
                  Sostituisci Tutto
                </button>
                <button
                  onClick={() => setShowFindReplace(false)}
                  className="text-stone-400 font-bold text-[10px] p-1.5 hover:text-stone-600"
                >
                  Esci
                </button>
              </div>
            </div>
          )}

          {/* Paper theme styling switcher */}
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-200 flex justify-between items-center shrink-0 select-none text-[10px]">
            <span className="font-bold text-stone-400">Layout Apple Pages</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setPaperTheme('white')} 
                className={`px-1.5 py-0.5 font-bold rounded-md ${paperTheme === 'white' ? 'bg-white text-amber-700 shadow-xs border border-stone-200' : 'text-neutral-500'}`}
              >
                Puro
              </button>
              <button 
                onClick={() => setPaperTheme('sepia')} 
                className={`px-1.5 py-0.5 font-bold rounded-md ${paperTheme === 'sepia' ? 'bg-[#FDF6E3] text-amber-850 shadow-xs' : 'text-neutral-500'}`}
              >
                Papiro
              </button>
              <button 
                onClick={() => setPaperTheme('noble')} 
                className={`px-1.5 py-0.5 font-bold rounded-md ${paperTheme === 'noble' ? 'bg-[#1E1E2F] text-[#F3E8FF] shadow-xs' : 'text-neutral-500'}`}
              >
                Noble
              </button>
              <button 
                onClick={() => setPaperTheme('dark')} 
                className={`px-1.5 py-0.5 font-bold rounded-md ${paperTheme === 'dark' ? 'bg-neutral-800 text-white shadow-xs' : 'text-neutral-500'}`}
              >
                Notte
              </button>
            </div>
          </div>

          {/* Main contentEditable paper canvas */}
          <div className={`flex-1 overflow-y-auto ${isEmbedded ? 'p-2' : 'p-4'} flex flex-col items-center`}>
            <div
              id="editor-paper-simulation"
              className={`w-full ${isEmbedded ? 'min-h-[250px]' : 'min-h-[380px]'} rounded-2xl ${isEmbedded ? 'p-3' : 'p-4 md:p-6'} shadow-md border transition-all duration-300 flex flex-col ${
                paperTheme === 'white' 
                  ? 'bg-white text-neutral-800 border-stone-200/55' 
                  : paperTheme === 'sepia'
                  ? 'bg-[#FDF6E3] text-[#586E75] border-[#EAE3CB]'
                  : paperTheme === 'noble'
                  ? 'bg-[#1E1E2F] text-indigo-100 border-[#3F3F5F]'
                  : 'bg-neutral-900 text-neutral-100 border-neutral-800'
              }`}
            >
              {/* Clean layout helper tip */}
              <div className="text-[9px] text-neutral-400 mb-2 select-none flex items-center gap-1 border-b border-stone-200/20 pb-1.5">
                <Sparkles size={11} className="text-amber-500" />
                <span>Trascina o premi il testo per caricarlo o modificarlo.</span>
              </div>

              <div
                id="document-rich-contenteditable"
                ref={editorRef}
                contentEditable={true}
                onInput={handleContentInput}
                onBlur={handleContentInput}
                className={`flex-1 bg-transparent min-h-[340px] border-none focus:outline-none resize-none leading-relaxed text-xs ${fontFamily}`}
                style={{ outline: 'none' }}
                placeholder="Inizia a impaginare qui..."
              />
            </div>
          </div>

          {/* Word metric count statistics bottom bar */}
          <div id="editor-stats-footer" className="flex justify-between items-center px-4 py-2 border-t border-stone-200 bg-white text-[10px] text-neutral-400 shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-600">{activeDoc.wordCount} parole</span>
              <span>•</span>
              <span>{activeDoc.charCount} caratteri</span>
            </div>
            <div className="flex items-center gap-1 text-[9px]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Salvataggio auto attivo</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
