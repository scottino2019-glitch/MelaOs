import React, { useState, useEffect } from 'react';
import { FolderOpen, Image, Trash2, Download, Wallpaper, Check, Upload, HelpCircle, Sparkles } from 'lucide-react';
import { 
  PhotoItem, 
  loadGalleryFromStorage, 
  saveGalleryToStorage, 
  generatePhotoId, 
  DEFAULT_GALLERY_PHOTOS, 
  compressImageDataUrl 
} from '../utils/photoStorage';

interface CartellaImmaginiProps {
  onNotification: (title: string, desc: string) => void;
  onSetWallpaper?: (imageUrl: string) => void;
}

export default function AppCartellaImmagini({ onNotification, onSetWallpaper }: CartellaImmaginiProps) {
  const [gallery, setGallery] = useState<PhotoItem[]>(() => loadGalleryFromStorage());

  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(() => {
    const list = loadGalleryFromStorage();
    return list.length > 0 ? list[0] : null;
  });

  // Sync across tabs or between PhotoEditor & CartellaImmagini
  useEffect(() => {
    const handleSync = () => {
      const freshList = loadGalleryFromStorage();
      setGallery(freshList);
      if (selectedPhoto && !freshList.some(p => p.id === selectedPhoto.id)) {
        setSelectedPhoto(freshList[0] || null);
      }
    };
    window.addEventListener('scriba_gallery_changed', handleSync);
    return () => window.removeEventListener('scriba_gallery_changed', handleSync);
  }, [selectedPhoto]);

  // Upload custom new image
  const handleUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const rawDataUrl = event.target.result as string;
        const compressedUrl = await compressImageDataUrl(rawDataUrl, 1200, 0.82);

        const newItem: PhotoItem = {
          id: generatePhotoId(),
          name: file.name.substring(0, 20) || 'Caricata',
          url: compressedUrl,
          date: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
          isUserSaved: true
        };

        const updated = saveGalleryToStorage([newItem, ...gallery]);
        setGallery(updated);
        setSelectedPhoto(newItem);
        onNotification("Cartella Immagini", "Immagine caricata e salvata nella galleria!");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete picture (ANY picture, including sample/default)
  const handleDelete = (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = saveGalleryToStorage(gallery.filter(item => item.id !== id));
    setGallery(updated);
    onNotification("Cartella Immagini", `"${name}" rimossa dalla cartella.`);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(updated[0] || null);
    }
  };

  // Clear entire gallery
  const handleClearAll = () => {
    saveGalleryToStorage([]);
    setGallery([]);
    setSelectedPhoto(null);
    onNotification("Cartella Immagini", "Cartella svuotata completamente.");
  };

  // Restore sample pictures
  const handleRestoreDefaults = () => {
    const restored = saveGalleryToStorage(DEFAULT_GALLERY_PHOTOS);
    setGallery(restored);
    setSelectedPhoto(restored[0] || null);
    onNotification("Cartella Immagini", "Foto predefinite ripristinate.");
  };

  // Set selected as wallpaper of iPad
  const handleApplyWallpaper = (url: string) => {
    if (onSetWallpaper) {
      onSetWallpaper(url);
      onNotification("Sfondo iPad", "Nuovo sfondo applicato con successo!");
    }
  };

  return (
    <div id="app-cartella-immagini" className="h-full w-full bg-zinc-950 text-white rounded-3xl p-4 lg:p-6 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top action bar */}
      <div className="flex justify-between items-center pb-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center space-x-2">
          <FolderOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Cartella Immagini</h2>
        </div>
        <div className="flex items-center space-x-2">
          {gallery.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="bg-zinc-800/80 hover:bg-red-900/40 text-zinc-400 hover:text-red-300 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition active:scale-95"
              title="Elimina tutte le foto"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Svuota</span>
            </button>
          ) : (
            <button
              onClick={handleRestoreDefaults}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center space-x-1 transition active:scale-95"
            >
              <span>+ Esempi</span>
            </button>
          )}

          <label className="bg-blue-600 hover:bg-blue-500 text-xs px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1 hover:scale-103 active:scale-97 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Nuovo File</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleUploadClick} 
            />
          </label>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 mt-4 min-h-0">
        
        {/* Left Column: Photo list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[220px] lg:max-h-none">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">Tutti i file ({gallery.length})</span>
          
          {gallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-center">
              <Image className="w-8 h-8 text-zinc-650 mb-2" />
              <p className="text-xs text-zinc-500 font-bold">Nessun file presente</p>
              <p id="label-upload-desc" className="text-[9px] text-zinc-650 mt-1">Trascina o carica immagini per popolare la cartella.</p>
              <button
                onClick={handleRestoreDefaults}
                className="mt-3 text-[10px] text-amber-400 font-bold underline hover:text-amber-300"
              >
                Ripristina immagini di esempio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pb-4">
              {gallery.map((item, idx) => {
                const isSelected = selectedPhoto?.id === item.id;
                const safeKey = `${item.id || 'cartella_img'}_${idx}`;
                return (
                  <div 
                    key={safeKey}
                    onClick={() => setSelectedPhoto(item)}
                    className={`relative rounded-xl overflow-hidden aspect-video bg-zinc-900 border transition cursor-pointer group ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-white/5 hover:border-zinc-700'
                    }`}
                  >
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="w-full h-full object-cover select-none" 
                      draggable={false}
                    />

                    {/* Touch & click friendly trash button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, item.name, e)}
                      className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-red-600 active:scale-90 text-white p-1 rounded-full z-10 transition shadow-sm"
                      title="Elimina foto"
                    >
                      <Trash2 className="w-3 h-3 text-red-400 group-hover:text-white" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[9px] font-semibold text-zinc-200 truncate pr-6">{item.name}</span>
                      <span className="text-[7px] text-zinc-400 font-medium">{item.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active preview and meta actions */}
        {selectedPhoto && (
          <div className="w-full lg:w-[240px] bg-zinc-900 border border-white/5 rounded-2.5xl p-4 flex flex-col text-center shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2 text-left">Dettagli File</span>
            
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-white/5 mx-auto">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.name} 
                className="absolute inset-0 w-full h-full object-contain" 
              />
            </div>

            <div className="mt-3 text-left space-y-1">
              <span className="text-xs font-bold text-zinc-100 truncate block">{selectedPhoto.name}</span>
              <span className="text-[9px] text-zinc-400 block font-semibold uppercase">{selectedPhoto.isUserSaved ? 'Sorgente: Utente' : 'Sorgente: Predefinita'} • {selectedPhoto.date}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {onSetWallpaper && (
                <button
                  onClick={() => handleApplyWallpaper(selectedPhoto.url)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-[10px] py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1 border border-white/5 hover:border-zinc-700 transition"
                >
                  <Wallpaper className="w-3 h-3 text-emerald-400" />
                  <span>Usa Sfondo</span>
                </button>
              )}

              <a
                href={selectedPhoto.url}
                download={selectedPhoto.name + '.png'}
                className="bg-zinc-800 hover:bg-zinc-700 text-[10px] py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1 border border-white/5 hover:border-zinc-700 transition text-white decoration-none text-center"
              >
                <Download className="w-3 h-3 text-blue-400" />
                <span>Scarica</span>
              </a>
            </div>

            <button
              onClick={(e) => handleDelete(selectedPhoto.id, selectedPhoto.name, e)}
              className="mt-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-[10px] py-1.5 rounded-xl font-bold flex items-center justify-center space-x-1 border border-red-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Rimuovi File</span>
            </button>
          </div>
        )}

      </div>

      <div className="mt-4 pt-3 border-t border-zinc-900 text-center text-[9px] font-bold text-zinc-650 uppercase tracking-widest flex items-center justify-center space-x-1">
        <span>Scriba iPad Filesystem • Sincronizzato con Foto Studio</span>
      </div>

    </div>
  );
}
