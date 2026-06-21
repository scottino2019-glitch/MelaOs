import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Download, RotateCw, RefreshCw, Eye, Sparkles, Sliders, 
  Palette, Grid, Image as ImageIcon, Smile, Type, Check, Trash, Undo,
  Camera
} from 'lucide-react';

interface AppPhotoEditorProps {
  onNotification: (title: string, msg: string) => void;
}

// Built-in cool sample photos for immediate use
const SAMPLE_PHOTOS = [
  {
    id: 'sample1',
    name: 'Astrazione Geometrica 🎨',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjM2NmYxIi8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNhODU1ZjciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlYzQ4OTkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iMTAwIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjE1Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iMTUwIiByPSI1MCIgZmlsbD0iI2ZmZDcwMCIgb3BhY2l0eT0iMC4yNSIvPjxyZWN0IHg9IjQwMCIgeT0iODAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiMwZWE1ZTkiIHRyYW5zZm9ybT0icm90YXRlKDQ1LCA0NTAsIDEzMCkiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg=='
  },
  {
    id: 'sample2',
    name: 'Tramonto Minimalista 🌅',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJza3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmRiYTc0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjQzZjVlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjc2t5KSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjI0MCIgcj0iOTAiIGZpbGw9IiNmZWYwOGEiLz48cGF0aCBkPSJNIDAgMzAwIFEgMTUwIDI1MCAzMDAgMzAwIFQgNjAwIDMwMCBMIDYwMCA0MDAgTCAwIDQwMCBaIiBmaWxsPSIjMWUxYjRiIi8+PC9zdmc+'
  },
  {
    id: 'sample3',
    name: 'Valle di Montagna 🏔️',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJza3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzhiZGY4Ii8+PHN0b3Agb2Zmc2V0PSI2MCUiIHN0b3AtY29sb3I9IiNiYWU2ZmQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmMGY5ZmYiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibTEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2NDc0OGIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMzMzQxNTUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0ibTIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0NzU1NjkiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTI5M2IiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNza3kpIi8+PGNpcmNsZSBjeD0iNDUwIiBjeT0iMTEwIiByPSI0MCIgZmlsbD0iI2ZlZjA4YSIgb3BhY2l0eT0iMC45Ii8+PHBhdGggZD0iTSAxMDAgNDAwIEwgMjUwIDIwMCBMIDQwMCA0MDAgWiIgZmlsbD0idXJsKCNtMSkiLz48cG9seWdvbiBwb2ludHM9IjI1MCwyMDAgMjIwLDI0MCAyNTAsMjUwIDI4MCwyNDAiIGZpbGw9IiNmOGZhZmMiLz48cGF0aCBkPSJNIDI1MCA0MDAgTCA0NTAgMTUwIEwgNjUwIDQwMCBaIiBmaWxsPSJ1cmwoI20yKSIvPjxwb2x5Z29uIHBvaW50cz0iNDUwLDE1MCA0MTAsMjAwIDQ1MCwyMTUgNDkwLDIwMCIgZmlsbD0iI2Y4ZmFmYyIvPjxyZWN0IHk9IjMzMCIgd2lkdGg9IjYwMCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzE1ODAzZCIvPjwvc3ZnPg=='
  },
  {
    id: 'sample4',
    name: 'Onda Oceanica 🌊',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJza3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMWUxYjRiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzExMDQyIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9IndhdmUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMDZiNmQ0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDg5MWIyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjc2t5KSIvPjxjaXJjbGUgY3g9IjMwMCIgY3k9IjE4MCIgcj0iNzAiIGZpbGw9IiNmOTczMTYiIG9wYWNpdHk9IjAuOCIvPjxwYXRoIGQ9Ik0gMCAzMjAgUSAxNTAgMjIwIDMwMCAzMjAgVCA2MDAgMzIwIEwgNjAwIDQwMCBMIDAgNDAwIFoiIGZpbGw9IiMwZTc0OTAiLz48cGF0aCBkPSJNIDAgMzUwIFEgMTAwIDI5MCAyNTAgMzUwIFQgNjAwIDM1MCBMIDYwMCA0MDAgTCAwIDQwMCBaIiBmaWxsPSJ1cmwoI3dhdmUpIiBvcGFjaXR5PSIwLjkiLz48cGF0aCBkPSJNIDAgMzcwIFEgMjAwIDMzMCA0MDAgMzcwIFQgNjAwIDM3MCBMIDYwMCA0MDAgTCAwIDQwMCBaIiBmaWxsPSIjMjJkM2VlIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4='
  },
  {
    id: 'sample5',
    name: 'Luci al Neon 🌆',
    url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNjAwIDQwMCI+PHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiMwOTA5MGIiLz48ZyBvcGFjaXR5PSIwLjMiPjxsaW5lIHgxPSI1MCIgeTE9IjAiIHgyPSI1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjYTIxY2FmIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMTUwIiB5MT0iMCIgeDI9IjE1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjYTIxY2FmIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMjUwIiB5MT0iMCIgeDI9IjI1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjYTIxY2FmIiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iMzUwIiB5MT0iMCIgeDI9IjM1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iNDUwIiB5MT0iMCIgeDI9IjQ1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjEiLz48bGluZSB4MT0iNTUwIiB5MT0iMCIgeDI9IjU1MCIgeTI9IjQwMCIgc3Ryb2tlPSIjMGVhNWU5IiBzdHJva2Utd2lkdGg9IjEiLz4vZz4<rect x="100" y="150" width="80" height="250" fill="#18181b" stroke="#f43f5e" stroke-width="2"/><rect x="220" y="80" width="120" height="320" fill="#18181b" stroke="#3b82f6" stroke-width="2"/><rect x="380" y="200" width="90" height="200" fill="#18181b" stroke="#10b981" stroke-width="2"/><circle cx="300" cy="180" r="120" stroke="#ec4899" stroke-width="1" fill="none" opacity="0.1"/></svg>'
  }
];

// Presets for filter algorithms (using standard CSS filters)
const FILTER_PRESETS = [
  { name: 'Original', class: '', filterString: '' },
  { name: 'Vivido (Chrome)', class: 'saturate-[1.6] contrast-[1.1]', filterString: 'saturate(1.6) contrast(1.1)' },
  { name: 'Noir (High Contrast)', class: 'grayscale contrast-[1.5]', filterString: 'grayscale(1) contrast(1.5)' },
  { name: 'Drammatico (Cool)', class: 'hue-rotate-[15deg] saturate-[1.2] brightness-[0.95]', filterString: 'hue-rotate(15deg) saturate(1.2) brightness(0.95)' },
  { name: 'Vintage (Sepia)', class: 'sepia contrast-[0.95] saturate-[1.1]', filterString: 'sepia(1) contrast(0.95) saturate(1.1)' },
  { name: 'Bianco e Nero (Mono)', class: 'grayscale brightness-[1.1]', filterString: 'grayscale(1) brightness(1.1)' },
  { name: 'Caldo', class: 'sepia-[0.25] saturate-[1.35] hue-rotate-[-10deg]', filterString: 'sepia(0.25) saturate(1.35) hue-rotate(-10deg)' },
  { name: 'Freddo', class: 'saturate-[0.9] hue-rotate-[20deg] brightness-[1.05]', filterString: 'saturate(0.9) hue-rotate(20deg) brightness(1.05)' }
];

const EMOJI_STICKERS = ['😀', '🔥', '⭐️', '🎨', '🎉', '💡', '❤️', '💼', '🚀', '🎯', '🍕', '🇮🇹'];

export default function AppPhotoEditor({ onNotification }: AppPhotoEditorProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'presets' | 'sliders' | 'draw' | 'stickers'>('gallery');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>(SAMPLE_PHOTOS[0].url);

  // Local first gallery list
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
        if (Array.isArray(parsed)) {
          return [...parsed, ...defaultList];
        }
      } catch (e) {}
    }
    return defaultList;
  });
  
  // Basic slider variables
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  // Filter Presets active selection
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  // Rotation and flips
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Draw Mode variables
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const [mobileView, setMobileView] = useState<'photo' | 'tools'>('photo');
  const [brushColor, setBrushColor] = useState<string>('#E11D48'); // rose-600
  const [brushSize, setBrushSize] = useState<number>(6);
  const [drawHistory, setDrawHistory] = useState<string[]>([]); // image state histories for undo

  // Sticker overlays
  const [placedStickers, setPlacedStickers] = useState<{ id: string; emoji: string; x: number; y: number; size: number }[]>([]);

  // Text inputs
  const [placedTexts, setPlacedTexts] = useState<{ id: string; text: string; x: number; y: number; color: string; size: number }[]>([]);
  const [typingText, setTypingText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#FFFFFF');

  // Trigger loading photo onto drawing/composite editor can
  useEffect(() => {
    // Whenever image changes, wipe history/extras
    setPlacedStickers([]);
    setPlacedTexts([]);
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
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setSelectedPhotoUrl(dataUrl);

          // Add to gallery state
          const newUploadedItem = {
            id: 'gallery_' + Date.now(),
            name: file.name.substring(0, 15) || `Caricata`,
            url: dataUrl,
            date: new Date().toLocaleDateString('it-IT', {hour: '2-digit', minute: '2-digit'}),
            isUserSaved: true
          };

          setGallery(prev => {
            const updated = [newUploadedItem, ...prev];
            localStorage.setItem('scriba_gallery_v1', JSON.stringify(updated.filter(item => item.isUserSaved)));
            return updated;
          });

          onNotification("Foto Studio", "Foto aggiunta alla cartella immagini!");
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

  // Helper to translate event coordinates cleanly for mouse or touch
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

    // Prevent default scroll actions on mobile
    if (e.cancelable) {
      e.preventDefault();
    }

    // Save history prior to new line
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
  };

  // Adding text or sticker overlays
  const addSticker = (emoji: string) => {
    const newSticker = {
      id: 'sticker_' + Date.now(),
      emoji,
      x: 10 + Math.random() * 50,
      y: 15 + Math.random() * 50,
      size: 40
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    onNotification("Foto", "Sticker aggiunto! Trascinalo o ridimensionalo");
  };

  const addTextOverlay = () => {
    if (!typingText.trim()) return;
    const newText = {
      id: 'text_' + Date.now(),
      text: typingText,
      x: 20 + Math.random() * 40,
      y: 40 + Math.random() * 20,
      color: textColor,
      size: 24
    };
    setPlacedTexts(prev => [...prev, newText]);
    setTypingText('');
    onNotification("Foto", "Testo inserito con successo!");
  };

  // CSS Filter string concatenation
  const getFilterCSS = () => {
    let presetString = FILTER_PRESETS[activePresetIndex].filterString;
    let customString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px)`;
    return `${presetString} ${customString}`.trim();
  };

  const handleExportResult = () => {
    // Generate high resolution image
    const outputCanvas = document.createElement('canvas');
    const image = imageRef.current;
    if (!image) return;

    // Maintain native ratios
    const nativeWidth = image.naturalWidth || 800;
    const nativeHeight = image.naturalHeight || 600;

    // Handle rotation aspect swap
    const isRotatedOrtho = rotation % 180 !== 0;
    outputCanvas.width = isRotatedOrtho ? nativeHeight : nativeWidth;
    outputCanvas.height = isRotatedOrtho ? nativeWidth : nativeHeight;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Apply rotation and flip transform logic prior to rendering pixels
    ctx.translate(outputCanvas.width / 2, outputCanvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Apply filters directly to canvas context 2D! (Extremely reliable and high precision!)
    ctx.filter = getFilterCSS();

    // Draw native image centered
    ctx.drawImage(
      image,
      -nativeWidth / 2,
      -nativeHeight / 2,
      nativeWidth,
      nativeHeight
    );

    // Turn off filters for the user drawing overlays
    ctx.filter = 'none';
    
    // Draw sketch drawings layer on top, resized cleanly to native resolutions
    const drawCanvas = canvasRef.current;
    if (drawCanvas) {
      ctx.drawImage(
        drawCanvas,
        -nativeWidth / 2,
        -nativeHeight / 2,
        nativeWidth,
        nativeHeight
      );
    }

    // Draw stickers
    placedStickers.forEach(sticker => {
      // Calculate coordinates respecting rotations/scaled positions on original
      ctx.font = `${sticker.size * (nativeWidth / 400)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const drawX = (sticker.x / 100) * nativeWidth - nativeWidth / 2;
      const drawY = (sticker.y / 100) * nativeHeight - nativeHeight / 2;
      ctx.fillText(sticker.emoji, drawX, drawY);
    });

    // Draw texts
    placedTexts.forEach(item => {
      ctx.font = `bold ${item.size * (nativeWidth / 400)}px sans-serif`;
      ctx.fillStyle = item.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const drawX = (item.x / 100) * nativeWidth - nativeWidth / 2;
      const drawY = (item.y / 100) * nativeHeight - nativeHeight / 2;
      ctx.fillText(item.text, drawX, drawY);
    });

    // Download triggered
    const dataUrl = outputCanvas.toDataURL('image/png');

    // Add processed image to gallery state
    const newCompositeItem = {
      id: 'gallery_' + Date.now(),
      name: `Modificato - ${new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}`,
      url: dataUrl,
      date: new Date().toLocaleDateString('it-IT'),
      isUserSaved: true
    };

    setGallery(prev => {
      const updated = [newCompositeItem, ...prev];
      localStorage.setItem('scriba_gallery_v1', JSON.stringify(updated.filter(item => item.isUserSaved)));
      return updated;
    });

    const link = document.createElement('a');
    link.download = `foto_ios_edited_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    onNotification("Foto Studio", "Salvata ed esportata in Cartella Immagini!");
  };

  return (
    <div id="app-photo-editor" className="flex flex-col lg:flex-row h-full w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans rounded-3xl select-none">
      
      {/* Mobile view sub-tab navigation bar */}
      <div className="flex lg:hidden bg-zinc-900 border-b border-zinc-800 p-1.5 shrink-0 z-10 w-full justify-around space-x-1.5 shrink-0">
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
      <div className={`flex-[5] flex flex-col justify-between p-2 lg:p-6 min-h-0 relative ${
        mobileView === 'photo' ? 'flex h-full' : 'hidden lg:flex'
      }`}>
        
        {/* Load Actions header */}
        <div className="flex items-center justify-between bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5">
          <div className="flex items-center space-x-2.5">
            <label className="bg-zinc-800 hover:bg-zinc-700 hover:scale-102 font-semibold text-xs py-1.5 px-3 rounded-xl cursor-pointer flex items-center space-x-1.5 transition-all">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Sfoglia</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* Quick pre-sets dropdown */}
            <select
              onChange={(e) => setSelectedPhotoUrl(e.target.value)}
              value={selectedPhotoUrl}
              className="bg-zinc-800 border-none text-zinc-200 text-xs py-1.5 px-2.5 rounded-xl cursor-pointer"
            >
              {SAMPLE_PHOTOS.map(p => (
                <option key={p.id} value={p.url}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Quick transforms buttons */}
          <div className="flex items-center space-x-2">
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
              onClick={handleExportResult}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs py-1.5 px-3 rounded-xl flex items-center space-x-1 transition shadow-lg shadow-emerald-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Esporta</span>
            </button>
          </div>
        </div>

        {/* Central Display Editor Arena */}
        <div className="flex-1 flex items-center justify-center relative my-2 lg:my-4 overflow-hidden bg-black/40 rounded-3xl border border-zinc-900 max-h-[280px] lg:max-h-[460px] min-h-0">
          <div 
            className="relative transform transition-all duration-300 ease-out"
            style={{ 
              transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
              maxWidth: '100%',
              maxHeight: '100%',
              aspectRatio: 'unset'
            }}
          >
            {/* Native target image loaded */}
            <img
              ref={imageRef}
              src={selectedPhotoUrl}
              alt="iOS Editor Workspace"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              className="max-h-[220px] lg:max-h-[400px] object-contain transition-all"
              style={{ filter: getFilterCSS() }}
            />

            {/* Drawing overlays canvas perfectly centered over image */}
            <canvas
              ref={canvasRef}
              width={400} // fixed internal logical scale
              height={300}
              onMouseDown={handleStartDraw}
              onMouseMove={handleDraw}
              onMouseUp={handleEndDraw}
              onMouseLeave={handleEndDraw}
              onTouchStart={handleStartDraw}
              onTouchMove={handleDraw}
              onTouchEnd={handleEndDraw}
              className={`absolute inset-0 w-full h-full touch-none ${activeTab === 'draw' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'}`}
            />

            {/* Render placed stickers & labels interactively */}
            {placedStickers.map(sticker => (
              <div
                key={sticker.id}
                style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, fontSize: `${sticker.size}px` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-auto cursor-move active:opacity-60"
                onMouseDown={(e) => {
                  // Enable quick drag or double click removal
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (!rect) return;
                  const moveHandler = (moveEvent: MouseEvent) => {
                    const newX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                    const newY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                    setPlacedStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } : s));
                  };
                  const upHandler = () => {
                    window.removeEventListener('mousemove', moveHandler);
                    window.removeEventListener('mouseup', upHandler);
                  };
                  window.addEventListener('mousemove', moveHandler);
                  window.addEventListener('mouseup', upHandler);
                }}
                onDoubleClick={() => {
                  setPlacedStickers(prev => prev.filter(s => s.id !== sticker.id));
                  onNotification("Foto", "Sticker rimosso");
                }}
                title="Trascina. Doppio click per rimuovere"
              >
                {sticker.emoji}
              </div>
            ))}

            {placedTexts.map(textItem => (
              <div
                key={textItem.id}
                style={{ 
                  left: `${textItem.x}%`, 
                  top: `${textItem.y}%`, 
                  color: textItem.color, 
                  fontSize: `${textItem.size}px`,
                  fontFamily: 'sans-serif',
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 select-none pointer-events-auto cursor-move whitespace-nowrap active:opacity-60"
                onMouseDown={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (!rect) return;
                  const moveHandler = (moveEvent: MouseEvent) => {
                    const newX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                    const newY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
                    setPlacedTexts(prev => prev.map(t => t.id === textItem.id ? { ...t, x: Math.max(0, Math.min(100, newX)), y: Math.max(0, Math.min(100, newY)) } : t));
                  };
                  const upHandler = () => {
                    window.removeEventListener('mousemove', moveHandler);
                    window.removeEventListener('mouseup', upHandler);
                  };
                  window.addEventListener('mousemove', moveHandler);
                  window.addEventListener('mouseup', upHandler);
                }}
                onDoubleClick={() => {
                  setPlacedTexts(prev => prev.filter(t => t.id !== textItem.id));
                  onNotification("Foto", "Testo rimosso");
                }}
                title="Trascina. Doppio click per rimuovere"
              >
                {textItem.text}
              </div>
            ))}
          </div>
        </div>

        {/* Small tips footer */}
        <div className="text-[10px] text-zinc-500 font-medium text-center italic">
          Tip: Puoi trascinare gli sticker della foto, o fare doppio click per eliminarli!
        </div>
      </div>

      {/* Editor Control Tool Box Sidebar - right view */}
      <div className={`flex-[4] lg:flex-none w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-zinc-900 bg-zinc-900/40 backdrop-blur-xl p-3 lg:p-5 flex flex-col justify-between min-h-0 ${
        mobileView === 'tools' ? 'flex flex-1 h-full' : 'hidden lg:flex'
      }`}>
        <div className="flex-1 flex flex-col min-h-0 space-y-3 lg:space-y-4">
          
          {/* Section Toolbar tab button row */}
          <div className="grid grid-cols-5 gap-0.5 lg:gap-1.5 p-1 bg-zinc-900 rounded-xl">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-1.5 lg:py-2 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 lg:space-y-1 transition ${
                activeTab === 'gallery' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Cartella</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-1.5 lg:py-2 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 lg:space-y-1 transition ${
                activeTab === 'presets' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Presets</span>
            </button>
            <button
              onClick={() => setActiveTab('sliders')}
              className={`py-1.5 lg:py-2 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 lg:space-y-1 transition ${
                activeTab === 'sliders' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Regola</span>
            </button>
            <button
              onClick={() => setActiveTab('draw')}
              className={`py-1.5 lg:py-2 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 lg:space-y-1 transition ${
                activeTab === 'draw' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Disegna</span>
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`py-1.5 lg:py-2 px-0.5 text-center rounded-lg text-[9px] lg:text-xs font-semibold flex flex-col items-center justify-center space-y-0.5 lg:space-y-1 transition ${
                activeTab === 'stickers' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smile className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span>Elementi</span>
            </button>
          </div>

          {/* Dynamic Tab Body container */}
          <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 pr-1 min-h-[100px] lg:min-h-[140px] max-h-[300px] lg:max-h-none">
            
            {/* Tab: Gallery */}
            {activeTab === 'gallery' && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-zinc-400">Cartella Immagini</span>
                  <button 
                    onClick={() => {
                      if (confirm("Svuotare la galleria delle immagini caricate/modificate?")) {
                        setGallery(SAMPLE_PHOTOS.map(p => ({ ...p, date: 'Predefinito', isUserSaved: false })));
                        localStorage.removeItem('scriba_gallery_v1');
                        onNotification("Galleria", "Galleria ripulita");
                      }
                    }} 
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Svuota
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {gallery.map((item) => {
                    const isSelected = item.url === selectedPhotoUrl;
                    return (
                      <div key={item.id} className="relative group rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex flex-col justify-between">
                        <button
                          onClick={() => {
                            setSelectedPhotoUrl(item.url);
                          }}
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
                        <div className="p-1 px-1.5 flex flex-col justify-between text-[10px] bg-zinc-900/90">
                          <span className="font-semibold text-zinc-300 truncate" title={item.name}>
                            {item.name}
                          </span>
                          <div className="flex justify-between items-center text-[8px] text-zinc-500 mt-0.5">
                            <span>{item.date}</span>
                            {item.isUserSaved && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setGallery(prev => {
                                    const next = prev.filter(p => p.id !== item.id);
                                    localStorage.setItem('scriba_gallery_v1', JSON.stringify(next.filter(i => i.isUserSaved)));
                                    return next;
                                  });
                                  onNotification("Galleria", "Immagine rimossa");
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold px-1"
                              >
                                Cancella
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab: Presets */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                {FILTER_PRESETS.map((filter, index) => {
                  const isActive = index === activePresetIndex;
                  return (
                    <button
                      key={filter.name}
                      onClick={() => setActivePresetIndex(index)}
                      className={`relative aspect-video rounded-xl overflow-hidden group transition ${
                        isActive ? 'ring-2 ring-blue-500 scale-[1.02]' : 'ring-1 ring-white/10 hover:ring-white/20'
                      }`}
                    >
                      {/* Presets miniature */}
                      <img
                        src={selectedPhotoUrl}
                        alt="Preset Mini"
                        referrerPolicy="no-referrer"
                        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all ${filter.class}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                        <span className="text-[10px] font-bold text-white drop-shadow-sm truncate">{filter.name}</span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab: Sliders */}
            {activeTab === 'sliders' && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                  <span className="text-xs font-bold text-zinc-400">Parametri Regolazione</span>
                  <button onClick={resetSliders} className="text-[10px] text-blue-400 hover:underline">Svuota tutto</button>
                </div>

                {/* Brightness slider */}
                <div className="space-y-1.5">
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
                    className="w-full h-1.5 bg-zinc-805 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Contrast slider */}
                <div className="space-y-1.5">
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
                    className="w-full h-1.5 bg-zinc-805 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Saturation slider */}
                <div className="space-y-1.5">
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
                    className="w-full h-1.5 bg-zinc-805 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Sepia slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Invecchiamento (Sepia)</span>
                    <span className="font-mono text-zinc-400">{sepia}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sepia}
                    onChange={(e) => setSepia(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-805 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Grayscale slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-zinc-300">Bianco e Nero (Grayscale)</span>
                    <span className="font-mono text-zinc-400">{grayscale}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={grayscale}
                    onChange={(e) => setGrayscale(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-805 accent-blue-500 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Blur slider */}
                <div className="space-y-1.5">
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
                    className="w-full h-1.5 bg-zinc-850 accent-blue-500 rounded-lg cursor-pointer"
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
                      className="p-1 px-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-zinc-300 flex items-center space-x-1"
                      title="Annulla"
                    >
                      <Undo className="w-3 h-3" />
                      <span>Undo</span>
                    </button>
                    <button
                      onClick={clearCanvasDrawing}
                      className="p-1 px-2 text-[10px] bg-rose-500/20 hover:bg-rose-500/35 rounded-lg text-rose-300 flex items-center space-x-1"
                    >
                      <Trash className="w-3 h-3" />
                      <span>Cancella</span>
                    </button>
                  </div>
                </div>

                {/* Color swatches */}
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

                {/* Brush sizing */}
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

            {/* Tab: Sticker Overlays */}
            {activeTab === 'stickers' && (
              <div className="space-y-5 pt-1">
                {/* Text Adder */}
                <div className="space-y-3 bg-zinc-900 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-zinc-300 block">Aggiungi Testo</span>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Scrivi qui il testo..."
                      value={typingText}
                      onChange={(e) => setTypingText(e.target.value)}
                      className="flex-1 bg-zinc-800 text-xs px-3 py-2 rounded-xl border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={addTextOverlay}
                      className="bg-blue-600 hover:bg-blue-500 font-bold text-xs px-3.5 rounded-xl text-white transitionactive:scale-95"
                    >
                      Aggiungi
                    </button>
                  </div>
                  
                  {/* Text Color picker */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-medium">Colore testo</span>
                    <div className="flex space-x-1.5">
                      {['#FFFFFF', '#FFD700', '#FF3B30', '#34C759', '#007AFF'].map(txtClr => (
                        <button
                          key={txtClr}
                          onClick={() => setTextColor(txtClr)}
                          className={`w-4 h-4 rounded-full border border-black/50 ${
                            textColor === txtClr ? 'scale-115 ring-2 ring-white/60' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: txtClr }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Stickers Grid */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-300 block">Stickers iOS</span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {EMOJI_STICKERS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addSticker(emoji)}
                        className="py-2 px-1 bg-zinc-900 border border-white/5 hover:bg-zinc-800 rounded-xl text-2xl flex items-center justify-center cursor-pointer transition active:scale-95 duration-100"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer info indicating layout state */}
        <div className="pt-4 border-t border-zinc-900 mt-4 flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
          <span>Stato: Pronto</span>
          <span className="text-[9px] px-2 py-0.5 bg-zinc-900 rounded-md">Foto Studio</span>
        </div>
      </div>

    </div>
  );
}
