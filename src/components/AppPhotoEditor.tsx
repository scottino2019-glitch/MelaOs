import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, RotateCw, RefreshCw, Sliders, 
  Palette, Grid, Image as ImageIcon, Smile, Check, Trash, Undo,
  Camera, Plus, Minus, Trash2, RotateCcw, Save, Sparkles
} from 'lucide-react';

interface AppPhotoEditorProps {
  onNotification: (title: string, msg: string) => void;
}

// Built-in sample photos with high-definition real photography for vibrant filter previewing
const SAMPLE_PHOTOS = [
  {
    id: 'sample1',
    name: 'Valle & Montagna 🏔️',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample2',
    name: 'Tramonto sul Mare 🌅',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample3',
    name: 'Città di Notte 🌆',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample4',
    name: 'Fiori & Natura 🌸',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample5',
    name: 'Ritratto Studio 📸',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sample6',
    name: 'Arte Astratta 🎨',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'
  }
];

interface FilterPreset {
  name: string;
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  filterString: string;
}

// Presets for filter algorithms (using clean, standard CSS & canvas filters)
const FILTER_PRESETS: FilterPreset[] = [
  { name: 'Originale', brightness: 1, contrast: 1, saturate: 1, grayscale: 0, sepia: 0, hueRotate: 0, filterString: '' },
  { name: 'Vivido (Chrome)', brightness: 1.05, contrast: 1.15, saturate: 1.8, grayscale: 0, sepia: 0, hueRotate: 0, filterString: 'saturate(1.8) contrast(1.15) brightness(1.05)' },
  { name: 'Noir (Contrasto)', brightness: 0.95, contrast: 1.6, saturate: 0, grayscale: 1, sepia: 0, hueRotate: 0, filterString: 'grayscale(1) contrast(1.6) brightness(0.95)' },
  { name: 'Drammatico', brightness: 0.9, contrast: 1.2, saturate: 1.3, grayscale: 0, sepia: 0, hueRotate: 15, filterString: 'hue-rotate(15deg) saturate(1.3) brightness(0.9) contrast(1.2)' },
  { name: 'Vintage (Sepia)', brightness: 1.02, contrast: 0.95, saturate: 1.2, grayscale: 0, sepia: 0.85, hueRotate: 0, filterString: 'sepia(0.85) contrast(0.95) saturate(1.2) brightness(1.02)' },
  { name: 'Bianco e Nero', brightness: 1.1, contrast: 1, saturate: 0, grayscale: 1, sepia: 0, hueRotate: 0, filterString: 'grayscale(1) brightness(1.1)' },
  { name: 'Caldo Sottile', brightness: 1.05, contrast: 1, saturate: 1.4, grayscale: 0, sepia: 0.3, hueRotate: -10, filterString: 'sepia(0.3) saturate(1.4) hue-rotate(-10deg) brightness(1.05)' },
  { name: 'Freddo Glaciale', brightness: 1.05, contrast: 1.05, saturate: 0.9, grayscale: 0, sepia: 0, hueRotate: 25, filterString: 'saturate(0.9) hue-rotate(25deg) brightness(1.05) contrast(1.05)' },
  { name: 'Smeraldo', brightness: 1, contrast: 1.1, saturate: 1.3, grayscale: 0, sepia: 0, hueRotate: 80, filterString: 'hue-rotate(80deg) saturate(1.3) contrast(1.1)' },
  { name: 'Sogno Rosa', brightness: 1.1, contrast: 1, saturate: 1.4, grayscale: 0, sepia: 0, hueRotate: -40, filterString: 'hue-rotate(-40deg) saturate(1.4) brightness(1.1)' }
];

const EMOJI_STICKERS = ['😀', '🔥', '⭐️', '🎨', '🎉', '💡', '❤️', '💼', '🚀', '🎯', '🍕', '🇮🇹', '🌸', '😎', '👑', '🌈'];

interface OverlayItem {
  id: string;
  type: 'sticker' | 'text';
  content: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // px size
  color?: string; // text color
}

// Compress data URL helper so images save safely in memory and localStorage without quota errors
const compressImageDataUrl = (dataUrl: string, maxWidth = 1000, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width || 800;
      let height = img.naturalHeight || img.height || 600;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
          return;
        } catch (e) {}
      }
      resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export default function AppPhotoEditor({ onNotification }: AppPhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'presets' | 'sliders' | 'draw' | 'stickers'>('gallery');
  
  // Local gallery list
  const [gallery, setGallery] = useState<{ id: string; name: string; url: string; date: string; isUserSaved?: boolean }[]>(() => {
    const defaultList = SAMPLE_PHOTOS.map(p => ({
      id: p.id,
      name: p.name,
      url: p.url,
      date: 'Esempio',
      isUserSaved: false
    }));
    const saved = localStorage.getItem('scriba_gallery_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...defaultList];
        }
      } catch (e) {}
    }
    return defaultList;
  });

  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(gallery[0]?.url || SAMPLE_PHOTOS[0].url);

  // Basic filter slider variables
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  // Active Filter Preset Index
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  // Rotation and flips
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Draw Mode variables
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const photoContainerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const [mobileView, setMobileView] = useState<'photo' | 'tools'>('photo');
  const [brushColor, setBrushColor] = useState<string>('#E11D48'); // rose-600
  const [brushSize, setBrushSize] = useState<number>(6);
  const [drawHistory, setDrawHistory] = useState<string[]>([]); // image state histories for undo

  // Combined Overlays (Stickers and Text)
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Dragging state for smooth pointer movement
  const [draggingState, setDraggingState] = useState<{
    id: string;
    startPointerX: number;
    startPointerY: number;
    startXPercent: number;
    startYPercent: number;
    rectWidth: number;
    rectHeight: number;
  } | null>(null);

  // Text inputs
  const [typingText, setTypingText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');

  // Trigger loading photo onto drawing/composite editor
  useEffect(() => {
    setOverlays([]);
    setSelectedOverlayId(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    resetSliders();
    setActivePresetIndex(0);
    clearCanvasDrawing();
  }, [selectedPhotoUrl]);

  const resetSliders = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setSepia(0);
    setBlur(0);
    setActivePresetIndex(0);
  };

  const saveGalleryToStorage = (items: { id: string; name: string; url: string; date: string; isUserSaved?: boolean }[]) => {
    try {
      const userItems = items.filter(i => i.isUserSaved);
      localStorage.setItem('scriba_gallery_v1', JSON.stringify(userItems));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const rawDataUrl = event.target.result as string;
          // Compress dataUrl so gallery and localStorage operate smoothly
          const compressedUrl = await compressImageDataUrl(rawDataUrl, 1000, 0.85);

          setSelectedPhotoUrl(compressedUrl);

          const newUploadedItem = {
            id: 'gallery_' + Date.now(),
            name: file.name.substring(0, 18) || `Foto Caricata`,
            url: compressedUrl,
            date: new Date().toLocaleDateString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            isUserSaved: true
          };

          setGallery(prev => {
            const updated = [newUploadedItem, ...prev];
            saveGalleryToStorage(updated);
            return updated;
          });

          onNotification("Foto Studio", "Foto importata e aggiunta alla galleria!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvasDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
  };

  // Helper to translate event coordinates cleanly for mouse or touch on canvas
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        return null;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Canvas drawings handlers
  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    // Save history prior to new stroke
    setDrawHistory(prev => [...prev, canvas.toDataURL()]);

    const coords = getCoordinates(e, canvas);
    if (!coords) return;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    isDrawingRef.current = true;
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    const coords = getCoordinates(e, canvas);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleEndDraw = () => {
    isDrawingRef.current = false;
  };

  const handleUndoDraw = () => {
    if (drawHistory.length === 0) return;
    const previousStateString = drawHistory[drawHistory.length - 1];
    setDrawHistory(prev => prev.slice(0, prev.length - 1));

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = previousStateString;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    onNotification("Disegno", "Tratto annullato");
  };

  // Adding sticker overlay positioned centered
  const addSticker = (emoji: string) => {
    const offset = (overlays.length % 5) * 4;
    const newOverlay: OverlayItem = {
      id: 'overlay_' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'sticker',
      content: emoji,
      x: Math.min(80, 50 + offset),
      y: Math.min(80, 50 + offset),
      size: 42
    };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    setActiveTab('stickers');
    onNotification("Foto Studio", "Sticker aggiunto! Trascinalo sulla foto.");
  };

  // Adding text overlay positioned centered
  const addTextOverlay = () => {
    if (!typingText.trim()) return;
    const offset = (overlays.length % 5) * 4;
    const newOverlay: OverlayItem = {
      id: 'overlay_' + Date.now() + Math.random().toString(36).substring(2, 5),
      type: 'text',
      content: typingText.trim(),
      x: Math.min(80, 50 + offset),
      y: Math.min(80, 50 + offset),
      size: 26,
      color: textColor
    };
    setOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    setTypingText('');
    onNotification("Foto Studio", "Testo inserito! Trascinalo sulla foto.");
  };

  // Overlay delete / undo handlers
  const removeOverlay = (id: string) => {
    setOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
    onNotification("Foto Studio", "Elemento rimosso");
  };

  const removeLastOverlay = () => {
    if (overlays.length === 0) return;
    const last = overlays[overlays.length - 1];
    setOverlays(prev => prev.slice(0, prev.length - 1));
    if (selectedOverlayId === last.id) setSelectedOverlayId(null);
    onNotification("Foto Studio", `Annullato l'ultimo ${last.type === 'sticker' ? 'sticker' : 'testo'}`);
  };

  const clearAllOverlays = () => {
    setOverlays([]);
    setSelectedOverlayId(null);
    onNotification("Foto Studio", "Tutti gli elementi rimossi");
  };

  // Pointer drag event handlers for elements
  const handlePointerDownOverlay = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedOverlayId(id);

    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch (err) {}

    const container = photoContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const targetOverlay = overlays.find(o => o.id === id);
    if (!targetOverlay) return;

    setDraggingState({
      id,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startXPercent: targetOverlay.x,
      startYPercent: targetOverlay.y,
      rectWidth: rect.width || 400,
      rectHeight: rect.height || 300
    });
  };

  const handlePointerMoveOverlay = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingState) return;
    e.preventDefault();

    const deltaX = e.clientX - draggingState.startPointerX;
    const deltaY = e.clientY - draggingState.startPointerY;

    const deltaXPercent = (deltaX / draggingState.rectWidth) * 100;
    const deltaYPercent = (deltaY / draggingState.rectHeight) * 100;

    const newX = Math.max(5, Math.min(95, draggingState.startXPercent + deltaXPercent));
    const newY = Math.max(5, Math.min(95, draggingState.startYPercent + deltaYPercent));

    setOverlays(prev => prev.map(o => o.id === draggingState.id ? { ...o, x: newX, y: newY } : o));
  };

  const handlePointerUpOverlay = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingState) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
      setDraggingState(null);
    }
  };

  // Resize selected overlay
  const updateOverlaySize = (id: string, delta: number) => {
    setOverlays(prev => prev.map(o => {
      if (o.id === id) {
        const newSize = Math.max(14, Math.min(100, o.size + delta));
        return { ...o, size: newSize };
      }
      return o;
    }));
  };

  // Standard CSS Filter string combining preset multipliers and manual adjustments
  const getFilterCSS = () => {
    const preset = FILTER_PRESETS[activePresetIndex] || FILTER_PRESETS[0];
    const b = (preset.brightness * (brightness / 100)).toFixed(2);
    const c = (preset.contrast * (contrast / 100)).toFixed(2);
    const s = (preset.saturate * (saturation / 100)).toFixed(2);
    const g = Math.max(preset.grayscale, grayscale / 100).toFixed(2);
    const sep = Math.max(preset.sepia, sepia / 100).toFixed(2);
    const h = preset.hueRotate;

    let filterStr = `brightness(${b}) contrast(${c}) saturate(${s})`;
    if (parseFloat(g) > 0) filterStr += ` grayscale(${g})`;
    if (parseFloat(sep) > 0) filterStr += ` sepia(${sep})`;
    if (h !== 0) filterStr += ` hue-rotate(${h}deg)`;
    if (blur > 0) filterStr += ` blur(${blur}px)`;

    return filterStr;
  };

  const generateCompositeDataUrl = async (): Promise<string> => {
    const outputCanvas = document.createElement('canvas');
    const image = imageRef.current;
    if (!image) return selectedPhotoUrl;

    const nativeWidth = image.naturalWidth || image.width || 800;
    const nativeHeight = image.naturalHeight || image.height || 600;

    const isRotatedOrtho = rotation % 180 !== 0;
    outputCanvas.width = isRotatedOrtho ? nativeHeight : nativeWidth;
    outputCanvas.height = isRotatedOrtho ? nativeWidth : nativeHeight;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return selectedPhotoUrl;

    ctx.translate(outputCanvas.width / 2, outputCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const filterString = getFilterCSS();
    try {
      ctx.filter = filterString;
    } catch (e) {
      ctx.filter = 'none';
    }

    try {
      ctx.drawImage(
        image,
        -nativeWidth / 2,
        -nativeHeight / 2,
        nativeWidth,
        nativeHeight
      );
    } catch (err) {
      console.error("Canvas draw image error:", err);
    }

    ctx.filter = 'none';

    // Draw sketch drawings layer on top
    const drawCanvas = canvasRef.current;
    if (drawCanvas) {
      try {
        ctx.drawImage(
          drawCanvas,
          -nativeWidth / 2,
          -nativeHeight / 2,
          nativeWidth,
          nativeHeight
        );
      } catch (err) {}
    }

    // Draw overlays (stickers and text)
    overlays.forEach(item => {
      const drawX = (item.x / 100) * nativeWidth - nativeWidth / 2;
      const drawY = (item.y / 100) * nativeHeight - nativeHeight / 2;

      if (item.type === 'sticker') {
        ctx.font = `${item.size * (nativeWidth / 400)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.content, drawX, drawY);
      } else {
        ctx.font = `bold ${item.size * (nativeWidth / 400)}px sans-serif`;
        ctx.fillStyle = item.color || '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(item.content, drawX, drawY);
        ctx.shadowBlur = 0;
      }
    });

    try {
      const rawResult = outputCanvas.toDataURL('image/jpeg', 0.9);
      return await compressImageDataUrl(rawResult, 1000, 0.85);
    } catch (e) {
      console.warn("Canvas export fallback", e);
      return selectedPhotoUrl;
    }
  };

  const handleSaveToGallery = async () => {
    const resultDataUrl = await generateCompositeDataUrl();
    const newCompositeItem = {
      id: 'gallery_' + Date.now(),
      name: `Modificata ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
      url: resultDataUrl,
      date: new Date().toLocaleDateString('it-IT'),
      isUserSaved: true
    };

    setGallery(prev => {
      const updated = [newCompositeItem, ...prev];
      saveGalleryToStorage(updated);
      return updated;
    });

    setSelectedPhotoUrl(resultDataUrl);
    onNotification("Foto Studio", "Foto con modifiche salvata nella galleria!");
  };

  const handleExportResult = async () => {
    const resultDataUrl = await generateCompositeDataUrl();
    
    // Save to gallery state
    const newCompositeItem = {
      id: 'gallery_' + Date.now(),
      name: `Modificata ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
      url: resultDataUrl,
      date: new Date().toLocaleDateString('it-IT'),
      isUserSaved: true
    };

    setGallery(prev => {
      const updated = [newCompositeItem, ...prev];
      saveGalleryToStorage(updated);
      return updated;
    });

    // Download file
    const link = document.createElement('a');
    link.download = `foto_studio_edited_${Date.now()}.jpg`;
    link.href = resultDataUrl;
    link.click();
    onNotification("Foto Studio", "Immagine salvata ed esportata!");
  };

  return (
    <div id="app-photo-editor" className="flex flex-col lg:flex-row h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans rounded-3xl select-none">
      
      {/* Mobile view sub-tab navigation bar */}
      <div className="flex lg:hidden bg-zinc-900 border-b border-zinc-800 p-1.5 shrink-0 z-10 w-full justify-around space-x-1.5">
        <button
          onClick={() => setMobileView('photo')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
            mobileView === 'photo' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Tela Foto</span>
        </button>
        <button
          onClick={() => setMobileView('tools')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] sm:text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
            mobileView === 'tools' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Strumenti & Filtri</span>
        </button>
      </div>

      {/* Workspace Panel - left main view */}
      <div className={`flex-[5] flex flex-col justify-between p-2 lg:p-5 min-h-0 relative ${
        mobileView === 'photo' ? 'flex h-full' : 'hidden lg:flex'
      }`}>
        
        {/* Load Actions header */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/5">
          <div className="flex items-center space-x-2">
            <label className="bg-zinc-800 hover:bg-zinc-700 font-semibold text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center space-x-1.5 transition">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Carica Foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* Photo Selector Dropdown (Includes both built-in sample photos and user imported/saved photos) */}
            <select
              onChange={(e) => setSelectedPhotoUrl(e.target.value)}
              value={selectedPhotoUrl}
              className="bg-zinc-800 border-none text-zinc-200 text-xs py-1.5 px-2 rounded-xl cursor-pointer outline-none max-w-[150px] sm:max-w-none truncate"
            >
              {gallery.map(p => (
                <option key={p.id} value={p.url}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition"
              title="Ruota 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFlipH(prev => !prev)}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition"
              title="Rifletti Orizzontale"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetSliders}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 rounded-lg transition flex items-center space-x-1 text-xs"
              title="Ripristina Filtri"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Prominent Save to Gallery Button */}
            <button
              onClick={handleSaveToGallery}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1 transition shadow-md"
              title="Salva la foto modificata nella Galleria"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salva Modifiche</span>
            </button>

            {/* Export Download Button */}
            <button
              onClick={handleExportResult}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1 transition shadow-md"
              title="Esporta e scarica file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta</span>
            </button>
          </div>
        </div>

        {/* Central Display Editor Arena */}
        <div 
          className="flex-1 flex items-center justify-center relative my-2 overflow-hidden bg-black/60 rounded-3xl border border-zinc-900 max-h-[300px] lg:max-h-[480px] min-h-0"
          onClick={() => setSelectedOverlayId(null)}
        >
          <div 
            ref={photoContainerRef}
            className="relative transform transition-transform duration-200 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ 
              transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
            }}
          >
            {/* Native target image loaded */}
            <img
              ref={imageRef}
              src={selectedPhotoUrl}
              alt="Workspace Foto"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="max-h-[240px] lg:max-h-[420px] object-contain transition-all rounded-lg select-none"
              style={{ filter: getFilterCSS() }}
            />

            {/* Drawing overlays canvas centered over image */}
            <canvas
              ref={canvasRef}
              width={500}
              height={380}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleEndDraw}
              onMouseLeave={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDraw}
              onTouchEnd={handleEndDraw}
              className={`absolute inset-0 w-full h-full touch-none ${activeTab === 'draw' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            />

            {/* Render placed stickers & text overlays */}
            {overlays.map(item => {
              const isSelected = selectedOverlayId === item.id;
              return (
                <div
                  key={item.id}
                  style={{ 
                    left: `${item.x}%`, 
                    top: `${item.y}%`
                  }}
                  onPointerDown={(e) => handlePointerDownOverlay(e, item.id)}
                  onPointerMove={handlePointerMoveOverlay}
                  onPointerUp={handlePointerUpOverlay}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-auto cursor-grab active:cursor-grabbing touch-none ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-black/50 bg-black/30 backdrop-blur-xs p-1 rounded-xl z-20' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Item Content */}
                  {item.type === 'sticker' ? (
                    <span style={{ fontSize: `${item.size}px` }} className="leading-none block">
                      {item.content}
                    </span>
                  ) : (
                    <span 
                      style={{ 
                        color: item.color || '#FFFFFF', 
                        fontSize: `${item.size}px`,
                        textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                      }} 
                      className="font-bold leading-none whitespace-nowrap block px-1"
                    >
                      {item.content}
                    </span>
                  )}

                  {/* Selected overlay controls popover */}
                  {isSelected && (
                    <div 
                      className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-zinc-700 shadow-xl rounded-xl p-1 flex items-center space-x-1 z-30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => updateOverlaySize(item.id, -4)}
                        className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 transition"
                        title="Riduci"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[10px] font-mono px-1 text-zinc-300">{item.size}px</span>
                      <button
                        onClick={() => updateOverlaySize(item.id, 4)}
                        className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-200 transition"
                        title="Ingrandisci"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <div className="w-px h-4 bg-zinc-700 my-auto" />
                      <button
                        onClick={() => removeOverlay(item.id)}
                        className="w-6 h-6 bg-rose-600/80 hover:bg-rose-600 rounded-lg flex items-center justify-center text-white transition"
                        title="Elimina"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Small tips footer */}
        <div className="text-[10px] text-zinc-500 font-medium text-center italic flex items-center justify-center space-x-2">
          <span>👆 Tocca o trascina qualsiasi sticker/testo per spostarlo sulla foto</span>
        </div>
      </div>

      {/* Editor Control Tool Box Sidebar - right view */}
      <div className={`flex-[4] lg:flex-none w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-zinc-900 bg-zinc-900/50 backdrop-blur-xl p-3 lg:p-5 flex flex-col justify-between min-h-0 ${
        mobileView === 'tools' ? 'flex flex-1 h-full' : 'hidden lg:flex'
      }`}>
        <div className="flex-1 flex flex-col min-h-0 space-y-3 lg:space-y-4">
          
          {/* Section Toolbar tab button row */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-900/80 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-1.5 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Galleria</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-1.5 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                activeTab === 'presets' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Presets</span>
            </button>
            <button
              onClick={() => setActiveTab('sliders')}
              className={`py-1.5 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                activeTab === 'sliders' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Filtri</span>
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`py-1.5 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                activeTab === 'draw' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Disegna</span>
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`py-1.5 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition ${
                activeTab === 'stickers' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Elementi</span>
            </button>
          </div>

          {/* Dynamic Tab Body container */}
          <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 pr-1 min-h-[120px] max-h-[380px] lg:max-h-none">
            
            {/* Tab: Gallery */}
            {activeTab === 'gallery' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Galleria Immagini</span>
                  <button 
                    onClick={() => {
                      if (confirm("Svuotare le foto caricate e salvate?")) {
                        const resetList = SAMPLE_PHOTOS.map(p => ({ ...p, date: 'Predefinito', isUserSaved: false }));
                        setGallery(resetList);
                        setSelectedPhotoUrl(resetList[0].url);
                        localStorage.removeItem('scriba_gallery_v1');
                        onNotification("Galleria", "Galleria ripristinata");
                      }
                    }} 
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {gallery.map((item) => {
                    const isSelected = item.url === selectedPhotoUrl;
                    return (
                      <div key={item.id} className="relative group rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex flex-col justify-between">
                        <button
                          onClick={() => setSelectedPhotoUrl(item.url)}
                          className={`relative aspect-video w-full overflow-hidden transition ${
                            isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:opacity-85'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </button>
                        <div className="p-1.5 flex justify-between items-center text-[10px] bg-zinc-900/90">
                          <div className="flex flex-col truncate">
                            <span className="font-semibold text-zinc-300 truncate" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-[8px] text-zinc-500">{item.date}</span>
                          </div>
                          {item.isUserSaved && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setGallery(prev => {
                                  const next = prev.filter(p => p.id !== item.id);
                                  saveGalleryToStorage(next);
                                  if (item.url === selectedPhotoUrl && next.length > 0) {
                                    setSelectedPhotoUrl(next[0].url);
                                  }
                                  return next;
                                });
                                onNotification("Galleria", "Immagine eliminata");
                              }}
                              className="text-rose-400 hover:text-rose-300 font-bold text-[10px] p-1"
                              title="Elimina Foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Presets Filtri Cromatici</span>
                  <button onClick={resetSliders} className="text-[10px] text-amber-400 hover:underline">Ripristina</button>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {FILTER_PRESETS.map((filter, index) => {
                    const isActive = index === activePresetIndex;
                    return (
                      <button
                        key={filter.name}
                        onClick={() => setActivePresetIndex(index)}
                        className={`relative aspect-video rounded-xl overflow-hidden group transition ${
                          isActive ? 'ring-2 ring-blue-500 scale-[1.02]' : 'ring-1 ring-white/10 hover:ring-white/30'
                        }`}
                      >
                        <img
                          src={selectedPhotoUrl}
                          alt="Preset Mini"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover transition-all"
                          style={{ filter: filter.filterString || 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-white drop-shadow-sm truncate">{filter.name}</span>
                        </div>
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-0.5 shadow-md">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Sliders */}
            {activeTab === 'sliders' && (
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Regolazioni Manuali</span>
                  <button onClick={resetSliders} className="text-[10px] text-amber-400 hover:underline">Azzera tutto</button>
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Luminosità</span>
                    <span className="font-mono text-zinc-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Contrasto</span>
                    <span className="font-mono text-zinc-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="170"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Saturazione</span>
                    <span className="font-mono text-zinc-400">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sepia */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Sepia / Vintage</span>
                    <span className="font-mono text-zinc-400">{sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sepia}
                    onChange={(e) => setSepia(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Grayscale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Bianco e Nero</span>
                    <span className="font-mono text-zinc-400">{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={grayscale}
                    onChange={(e) => setGrayscale(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Sfocatura (Blur)</span>
                    <span className="font-mono text-zinc-400">{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab: Drawing Brush */}
            {activeTab === 'draw' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Pennello Disegno</span>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={handleUndoDraw}
                      disabled={drawHistory.length === 0}
                      className="p-1 px-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-zinc-300 flex items-center space-x-1 transition"
                      title="Annulla Ultimo Tratto"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Annulla Tratto</span>
                    </button>
                    <button
                      onClick={clearCanvasDrawing}
                      className="p-1 px-2 text-[10px] bg-rose-500/20 hover:bg-rose-500/35 rounded-lg text-rose-300 flex items-center space-x-1 transition"
                    >
                      <Trash className="w-3 h-3" />
                      <span>Cancella</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-zinc-300">Colore del tratto</span>
                  <div className="grid grid-cols-6 gap-2">
                    {['#E11D48', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#8B5CF6', '#FFFFFF', '#000000', '#F3F4F6', '#FCD34D'].map(clr => (
                      <button
                        key={clr}
                        onClick={() => setBrushColor(clr)}
                        className={`aspect-square rounded-full flex items-center justify-center border transition-all ${
                          clr === brushColor ? 'scale-110 border-white ring-2 ring-blue-500/50' : 'border-black/50 hover:scale-105'
                        }`}
                        style={{ backgroundColor: clr }}
                      >
                        {clr === brushColor && (
                          <div className={`w-1.5 h-1.5 rounded-full ${clr === '#FFFFFF' ? 'bg-black' : 'bg-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Spessore Pennello</span>
                    <span className="font-mono text-zinc-400">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="22"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab: Sticker & Text Overlays */}
            {activeTab === 'stickers' && (
              <div className="space-y-4 pt-1">
                
                {/* Actions Toolbar: Undo / Delete Buttons */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Gestione Elementi</span>
                  <div className="flex space-x-1.5">
                    <button
                      onClick={removeLastOverlay}
                      disabled={overlays.length === 0}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-[10px] text-amber-300 font-semibold flex items-center space-x-1 transition"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Annulla Ultimo</span>
                    </button>
                    <button
                      onClick={clearAllOverlays}
                      disabled={overlays.length === 0}
                      className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/35 disabled:opacity-30 rounded-lg text-[10px] text-rose-300 font-semibold flex items-center space-x-1 transition"
                    >
                      <Trash className="w-3 h-3" />
                      <span>Cancella Tutti</span>
                    </button>
                  </div>
                </div>

                {/* Text Adder */}
                <div className="space-y-2.5 bg-zinc-900/90 p-3 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-zinc-300 block">Scrivi Testo Sulla Foto</span>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Esempio: Saluti da Roma! 🇮🇹"
                      value={typingText}
                      onChange={(e) => setTypingText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTextOverlay()}
                      className="flex-1 bg-zinc-800 text-xs px-3 py-2 rounded-xl border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={addTextOverlay}
                      className="bg-blue-600 hover:bg-blue-500 font-bold text-xs px-3.5 rounded-xl text-white transition active:scale-95"
                    >
                      Aggiungi
                    </button>
                  </div>
                  
                  {/* Text Color picker */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400 font-medium">Colore testo:</span>
                    <div className="flex space-x-1.5">
                      {['#FFFFFF', '#FFD700', '#FF3B30', '#34C759', '#007AFF', '#AF52DE', '#000000'].map(txtClr => (
                        <button
                          key={txtClr}
                          onClick={() => setTextColor(txtClr)}
                          className={`w-4 h-4 rounded-full border border-black/50 ${
                            textColor === txtClr ? 'scale-125 ring-2 ring-white/80' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: txtClr }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Stickers Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">Emoji & Stickers</span>
                  <div className="grid grid-cols-4 gap-2">
                    {EMOJI_STICKERS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="py-2 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-xl text-2xl flex items-center justify-center cursor-pointer transition active:scale-90 duration-100"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layers list */}
                {overlays.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-400 block">Livelli Inseriti ({overlays.length})</span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {overlays.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedOverlayId(item.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                            selectedOverlayId === item.id ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-sm">{item.type === 'sticker' ? item.content : '💬'}</span>
                            <span className="truncate max-w-[150px] font-medium">{item.content}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOverlay(item.id);
                              }}
                              className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition"
                              title="Elimina"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Footer info indicating layout state */}
        <div className="pt-3 border-t border-zinc-900 mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
          <span>Stato: Pronto</span>
          <span className="text-[9px] px-2 py-0.5 bg-zinc-900 rounded-md">Foto Studio</span>
        </div>
      </div>

      {/* Floating Save Modifications Banner when filters/overlays applied */}
      {(activePresetIndex !== 0 || brightness !== 100 || contrast !== 100 || saturation !== 100 || grayscale !== 0 || sepia !== 0 || blur !== 0 || overlays.length > 0 || drawHistory.length > 0) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-blue-600/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center space-x-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-xs font-bold">Hai modifiche non salvate!</span>
          <button
            onClick={handleSaveToGallery}
            className="bg-white text-blue-700 hover:bg-zinc-100 font-bold text-xs px-3 py-1 rounded-xl transition shadow-md"
          >
            Salva ORA in Galleria
          </button>
        </div>
      )}

    </div>
  );
}
