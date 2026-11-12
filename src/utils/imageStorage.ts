/**
 * IndexedDB Image Storage Helper for Avatar Meatshop
 * Persists locally uploaded product photos as Blobs in the browser
 */

const DB_NAME = 'avatar_meatshop_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'product_images';

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open image database'));
    };
  });
}

/**
 * Validates file type and size (Max 3MB, JPG/PNG/WEBP)
 */
export function validateImage(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'File gambar tidak ditemukan.' };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Format tidak didukung. Harap gunakan file JPG, PNG, atau WEBP.',
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Ukuran file melebihi batas 3 MB.',
    };
  }
  return { isValid: true };
}

/**
 * Creates temporary preview object URL
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Saves an uploaded image file into IndexedDB and returns imageId
 */
export async function saveImage(file: File): Promise<string> {
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Validasi gambar gagal');
  }

  const db = await openDB();
  const imageId = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      id: imageId,
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
      createdAt: new Date().toISOString(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      resolve(imageId);
    };

    request.onerror = () => {
      reject(request.error || new Error('Gagal menyimpan gambar ke penyimpanan lokal'));
    };
  });
}

/**
 * Cache for active blob URLs so we can revoke and reuse
 */
const activeBlobUrls = new Map<string, string>();

/**
 * Retrieves image Blob from IndexedDB and creates an Object URL
 */
export async function getImage(imageId: string): Promise<string | null> {
  if (!imageId) return null;

  if (activeBlobUrls.has(imageId)) {
    return activeBlobUrls.get(imageId)!;
  }

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(imageId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          const url = URL.createObjectURL(result.blob);
          activeBlobUrls.set(imageId, url);
          resolve(url);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    console.error('Error reading image from IndexedDB:', e);
    return null;
  }
}

/**
 * Deletes an image from IndexedDB and revokes its Object URL
 */
export async function deleteImage(imageId: string): Promise<void> {
  if (!imageId) return;

  if (activeBlobUrls.has(imageId)) {
    URL.revokeObjectURL(activeBlobUrls.get(imageId)!);
    activeBlobUrls.delete(imageId);
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(imageId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Error deleting image from IndexedDB:', e);
  }
}

/**
 * Clears all stored images (used on Reset Demo Data)
 */
export async function clearAllImages(): Promise<void> {
  // Revoke all active URLs
  activeBlobUrls.forEach((url) => URL.revokeObjectURL(url));
  activeBlobUrls.clear();

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('Error clearing images from IndexedDB:', e);
  }
}
