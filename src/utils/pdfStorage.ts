// IndexedDB & In-Memory storage for local uploaded PDF files

const DB_NAME = 'scriba_books_pdf_db';
const STORE_NAME = 'pdf_files';
const DB_VERSION = 1;

// In-memory cache for ultra fast synchronous lookups and browser environments where IDB might fail
const memoryCache = new Map<string, Uint8Array | string>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePdfToStorage(id: string, data: Uint8Array | string): Promise<void> {
  memoryCache.set(id, data);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // If it's a Uint8Array, store the ArrayBuffer or Uint8Array
    store.put(data, id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IDB save fallback to memory:', err);
  }
}

export async function getPdfFromStorage(id: string): Promise<Uint8Array | string | null> {
  if (memoryCache.has(id)) {
    return memoryCache.get(id) || null;
  }
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          memoryCache.set(id, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('IDB read fallback to memory:', err);
    return null;
  }
}

export async function deletePdfFromStorage(id: string): Promise<void> {
  memoryCache.delete(id);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (err) {
    // ignore
  }
}
