// Centralized, rock-solid photo storage and deduplication utility

export interface PhotoItem {
  id: string;
  name: string;
  url: string;
  date: string;
  isUserSaved?: boolean;
}

export const DEFAULT_GALLERY_PHOTOS: PhotoItem[] = [
  {
    id: 'sample_sunset_1',
    name: 'Tramonto Appennino',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  },
  {
    id: 'sample_mountains_2',
    name: 'Dolomiti d\'Autunno',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  },
  {
    id: 'sample_sea_3',
    name: 'Spiaggia d\'Amalfi',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  },
  {
    id: 'sample_sunset_sea_4',
    name: 'Tramonto sul Mare',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  },
  {
    id: 'sample_city_5',
    name: 'Città Notturna',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  },
  {
    id: 'sample_flowers_6',
    name: 'Fiori & Natura',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80',
    date: 'Predefinito',
    isUserSaved: false
  }
];

let photoIdCounter = 0;

/**
 * Generates a strictly guaranteed unique key for each photo item.
 * Combines timestamp, process counter, and two random tokens.
 */
export function generatePhotoId(): string {
  photoIdCounter += 1;
  const ts = Date.now();
  const r1 = Math.random().toString(36).substring(2, 9);
  const r2 = Math.random().toString(36).substring(2, 6);
  return `gallery_${ts}_${photoIdCounter}_${r1}_${r2}`;
}

/**
 * Ensures that every photo item in an array has a strictly unique, valid id.
 * Eliminates duplicate keys like 'gallery_1791729156106'.
 */
export function sanitizeAndDeduplicatePhotos(items: any[]): PhotoItem[] {
  if (!Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  const sanitized: PhotoItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    if (!raw || typeof raw !== 'object' || !raw.url) continue;

    let id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : '';
    // If ID is already taken or invalid, allocate a guaranteed unique one
    if (!id || seenIds.has(id)) {
      id = generatePhotoId();
    }
    seenIds.add(id);

    sanitized.push({
      id,
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name : `Foto ${i + 1}`,
      url: String(raw.url),
      date: typeof raw.date === 'string' && raw.date.trim() ? raw.date : 'Recente',
      isUserSaved: Boolean(raw.isUserSaved),
    });
  }

  return sanitized;
}

/**
 * Load gallery from localStorage, with automatic deduplication and seeding.
 */
export function loadGalleryFromStorage(): PhotoItem[] {
  if (typeof window === 'undefined') return DEFAULT_GALLERY_PHOTOS;

  const isInitialized = localStorage.getItem('scriba_gallery_initialized_v2');
  const saved = localStorage.getItem('scriba_gallery_v2');

  if (isInitialized) {
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const deduplicated = sanitizeAndDeduplicatePhotos(parsed);
          // If deduplication changed anything, quietly clean up the stored copy
          if (JSON.stringify(parsed) !== JSON.stringify(deduplicated)) {
            localStorage.setItem('scriba_gallery_v2', JSON.stringify(deduplicated));
          }
          return deduplicated;
        }
      } catch (e) {
        console.warn('Error reading scriba_gallery_v2:', e);
      }
    }
    return [];
  }

  // First initialization
  if (!isInitialized) {
    const legacy = localStorage.getItem('scriba_gallery');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = sanitizeAndDeduplicatePhotos(parsed);
          localStorage.setItem('scriba_gallery_initialized_v2', 'true');
          localStorage.setItem('scriba_gallery_v2', JSON.stringify(migrated));
          return migrated;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  const initial = sanitizeAndDeduplicatePhotos(DEFAULT_GALLERY_PHOTOS);
  try {
    localStorage.setItem('scriba_gallery_initialized_v2', 'true');
    localStorage.setItem('scriba_gallery_v2', JSON.stringify(initial));
  } catch (e) {
    console.warn('Could not seed initial gallery:', e);
  }
  return initial;
}

/**
 * Persist gallery to localStorage, preventing duplicate keys and handling quota limits.
 */
export function saveGalleryToStorage(items: PhotoItem[]): PhotoItem[] {
  if (typeof window === 'undefined') return items;

  const cleanItems = sanitizeAndDeduplicatePhotos(items);

  try {
    localStorage.setItem('scriba_gallery_initialized_v2', 'true');
    localStorage.setItem('scriba_gallery_v2', JSON.stringify(cleanItems));
  } catch (quotaError) {
    console.warn('Storage quota exceeded, pruning oldest saved images to fit...', quotaError);
    // If quota exceeded, preserve the user's newest items (first 10 items)
    try {
      const reduced = cleanItems.slice(0, 10);
      localStorage.setItem('scriba_gallery_v2', JSON.stringify(reduced));
    } catch (e) {
      console.error('Fatal storage quota error:', e);
    }
  }

  // Broadcast sync event to all components
  try {
    window.dispatchEvent(new CustomEvent('scriba_gallery_changed', { detail: { count: cleanItems.length } }));
  } catch (e) {
    window.dispatchEvent(new Event('scriba_gallery_changed'));
  }

  return cleanItems;
}

/**
 * Compresses an image data URL to a safe resolution and quality for fast storage
 */
export function compressImageDataUrl(dataUrl: string, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width || 800;
      let height = img.naturalHeight || img.height || 600;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        try {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
          return;
        } catch (e) {
          // If canvas is tainted or toDataURL fails, fallback to original
        }
      }
      resolve(dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
