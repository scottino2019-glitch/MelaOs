import React, { useState } from 'react';
import { 
  Plus, Trash2, Search, FileText, Calendar, Edit3, Share2, 
  Copy, FolderPlus, Sparkles, CheckCircle2, Bookmark, Star, ArrowLeft
} from 'lucide-react';
import { Note } from '../types';

interface AppTextEditorProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onNotification: (title: string, msg: string) => void;
}

export default function AppTextEditor({ notes, onSaveNote, onDeleteNote, onNotification }: AppTextEditorProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes.length > 0 ? notes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tutte');
  const [mobileActiveView, setMobileActiveView] = useState<'list' | 'editor'>('list');

  // Fields for currently active note or a placeholder if editing new
  const activeNote = notes.find(n => n.id === selectedNoteId);

  // States for new / temporary editing values
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<'Lavoro' | 'Personale' | 'Idee' | 'Altro'>('Lavoro');

  // Trigger loading details of the note being selected
  React.useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditCategory(activeNote.category);
    } else {
      setEditTitle('');
      setEditContent('');
      setEditCategory('Lavoro');
    }
  }, [selectedNoteId, activeNote]);

  const handleCreateNew = () => {
    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: 'Nuova Nota',
      content: 'Inizia a scrivere la tua nota qui...',
      date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      category: 'Lavoro',
      isFavorite: false
    };
    onSaveNote(newNote);
    setSelectedNoteId(newNote.id);
    setMobileActiveView('editor');
    onNotification("Note", "Nuova nota creata con successo");
  };

  const handleSaveActiveChanges = (updatedFields: Partial<Note>) => {
    if (!selectedNoteId) return;
    const current = notes.find(n => n.id === selectedNoteId);
    if (!current) return;

    const modified: Note = {
      ...current,
      ...updatedFields,
      // Update date format on change
      date: new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    onSaveNote(modified);
  };

  const handleToggleFavorite = () => {
    if (!activeNote) return;
    handleSaveActiveChanges({ isFavorite: !activeNote.isFavorite });
    onNotification("Note", activeNote.isFavorite ? "Rimossa dai preferiti" : "Aggiunta ai preferiti Star");
  };

  const handleCopyClipboard = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    onNotification("Note", "Copiata negli appunti!");
  };

  const handleExportTxt = () => {
    if (!activeNote) return;
    const element = document.createElement("a");
    const file = new Blob([`${activeNote.title}\n\n${activeNote.content}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${activeNote.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
    onNotification("Note", "Nota scaricata come file di testo");
  };

  const handleDelete = () => {
    if (!selectedNoteId) return;
    onDeleteNote(selectedNoteId);
    
    // Choose next or null
    const remaining = notes.filter(n => n.id !== selectedNoteId);
    if (remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    } else {
      setSelectedNoteId(null);
    }
    setMobileActiveView('list');
    
    onNotification("Note", "Nota eliminata correttamente");
  };

  // Filtering Notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'Tutte' || note.category === activeCategory || (activeCategory === 'Preferiti' && note.isFavorite);
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="app-notes" className="flex flex-col md:flex-row h-full w-full bg-[#FAF9F5] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans rounded-3xl select-none">
      {/* Sidebar - list of notes */}
      <div className={`w-full md:w-80 flex-col border-r border-[#EBE6DA] dark:border-zinc-850 bg-[#F3EFE6] dark:bg-zinc-900 h-full md:h-full ${
        mobileActiveView === 'list' ? 'flex h-full' : 'hidden md:flex'
      }`}>
        {/* Yellow top panel styled like iOS default Notes */}
        <div className="p-4 flex flex-col space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-[#D49826] dark:text-amber-500">Scriba Note</h1>
            <button
              onClick={handleCreateNew}
              className="bg-[#D49826] hover:bg-[#B57C17] dark:bg-amber-500 dark:hover:bg-amber-600 active:scale-95 text-white p-2 rounded-full flex items-center justify-center transition shadow-md"
              title="Crea nuova nota"
              id="btn-new-note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search text input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca tra le note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#E9E3D6] dark:bg-zinc-950 border border-[#DDD5C5] dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D49826] dark:focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600"
            />
          </div>
        </div>

        {/* Categories Tab buttons */}
        <div className="flex space-x-1 px-3 pb-3 overflow-x-auto scrollbar-none text-[11px] font-semibold border-b border-[#EBE6DA] dark:border-zinc-800">
          {['Tutte', 'Preferiti', 'Lavoro', 'Personale', 'Idee', 'Altro'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-[#D49826] dark:bg-amber-500 text-white' 
                  : 'bg-[#E5DDCF] dark:bg-[#1c1917] text-zinc-700 dark:text-zinc-300 hover:bg-[#DDD5C5] dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => {
              const isActive = note.id === selectedNoteId;
              const cleanSnippet = note.content.replace(/<[^>]*>/g, '').substring(0, 50);

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNoteId(note.id);
                    setMobileActiveView('editor');
                  }}
                  id={`note-item-${note.id}`}
                  className={`p-3.5 rounded-2xl cursor-pointer transition border flex flex-col justify-between ${
                    isActive 
                      ? 'bg-amber-100/70 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30' 
                      : 'hover:bg-[#EBE6DA]/50 dark:hover:bg-zinc-800/40 border-transparent text-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold truncate leading-tight flex-1 text-zinc-800 dark:text-zinc-200 pr-2">
                      {note.title || 'Senza titolo'}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {note.isFavorite && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                      )}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        note.category === 'Lavoro' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' :
                        note.category === 'Personale' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' :
                        note.category === 'Idee' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' :
                        'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {note.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
                    {cleanSnippet || 'Nessun testo aggiuntivo'}
                  </p>
                  
                  <div className="flex items-center mt-2.5 justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium flex items-center space-x-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{note.date}</span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-zinc-400 dark:text-zinc-600 text-xs text-ellipsis">
              Nessuna nota trovata
            </div>
          )}
        </div>
      </div>

      {/* Editor Panel - Reading and Editing Note */}
      <div className={`flex-1 flex-col h-full bg-white dark:bg-zinc-950 relative ${
        mobileActiveView === 'editor' ? 'flex h-full' : 'hidden md:flex'
      }`}>
        {activeNote ? (
          <div className="flex-1 flex flex-col h-full">
            {/* Top Toolbar */}
            <div className="px-3.5 py-2.5 lg:px-5 lg:py-3.5 border-b border-zinc-105 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center space-x-1.5 lg:space-x-2">
                <button
                  onClick={() => setMobileActiveView('list')}
                  className="md:hidden p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 shrink-0"
                  title="Torna alla lista"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                </button>

                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition ${
                    activeNote.isFavorite ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-500' : 'hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}
                  title="Aggiungi a preferiti"
                >
                  <Star className={`w-4 h-4 ${activeNote.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                <select
                  value={editCategory}
                  onChange={(e) => {
                    const nextVal = e.target.value as 'Lavoro' | 'Personale' | 'Idee' | 'Altro';
                    setEditCategory(nextVal);
                    handleSaveActiveChanges({ category: nextVal });
                  }}
                  className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Lavoro">💼 Lavoro</option>
                  <option value="Personale">🏠 Personale</option>
                  <option value="Idee">💡 Idee</option>
                  <option value="Altro">🏷️ Altro</option>
                </select>
              </div>

              {/* Utility buttons */}
              <div className="flex items-center space-x-1.5 text-zinc-500 dark:text-zinc-400">
                <button
                  onClick={handleCopyClipboard}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Copia negli appunti"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportTxt}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Esporta nota (.txt)"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-500 transition-colors"
                  title="Elimina nota"
                  id="btn-delete-note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Fields */}
            <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
              <input
                type="text"
                placeholder="Titolo"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  handleSaveActiveChanges({ title: e.target.value });
                }}
                className="w-full text-xl font-bold border-none outline-none text-zinc-800 dark:text-zinc-100 bg-transparent placeholder-zinc-300 dark:placeholder-zinc-650"
              />

              {/* Textured paper backing like true classic iOS Notes */}
              <textarea
                placeholder="Inizia a scrivere qui..."
                value={editContent}
                onChange={(e) => {
                  setEditContent(e.target.value);
                  handleSaveActiveChanges({ content: e.target.value });
                }}
                className="flex-1 w-full resize-none border-none outline-none text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 placeholder-zinc-300 dark:placeholder-zinc-650 bg-transparent"
              />
            </div>
            
            {/* Status bar */}
            <div className="px-6 py-2 bg-zinc-50/50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 font-mono text-right">
              {editContent.length} caratteri | {editContent.split(/\s+/).filter(Boolean).length} parole
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400 dark:text-zinc-550 bg-white dark:bg-[#111]">
            <FileText className="w-12 h-12 mb-3 opacity-35 text-[#D49826] dark:text-amber-500" />
            <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300">Nessuna nota selezionata</h3>
            <p className="text-xs max-w-xs mt-1 leading-relaxed text-zinc-500 dark:text-zinc-450">
              Clicca su una nota a sinistra per visualizzarla, oppure creane una nuova.
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-4 bg-[#D49826] dark:bg-amber-500 hover:bg-[#B57C17] dark:hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Crea nuova nota
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
