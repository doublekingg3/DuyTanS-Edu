import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

// The school's real Firebase database configuration (Duy Tân School Manager)
export const duytanFirebaseConfig = {
  apiKey: "AIzaSyDLejjtEEW53lhIs1ukCBaFRA7tYqj-MIU",
  authDomain: "duytanmanager-dc628.firebaseapp.com",
  projectId: "duytanmanager-dc628",
  storageBucket: "duytanmanager-dc628.firebasestorage.app",
  messagingSenderId: "109285855486",
  appId: "1:109285855486:web:e93d478e57f919554215af"
};

// Sandbox default config (AI Studio fallback)
export const sandboxConfig = {
  projectId: "gen-lang-client-0237302277",
  appId: "1:14049971656:web:12e834dfabcc9794fac4fd",
  apiKey: "AIzaSyAdSqjjyetCSTq1VOBx7bEo58qDsQPGKW0",
  authDomain: "gen-lang-client-0237302277.firebaseapp.com",
  storageBucket: "gen-lang-client-0237302277.firebasestorage.app",
  messagingSenderId: "14049971656",
  measurementId: ""
};

let customConfig = null;
try {
  const customConfigStr = localStorage.getItem('customFirebaseConfig');
  if (customConfigStr) {
    customConfig = JSON.parse(customConfigStr);
  }
} catch (e) {
  console.warn("Invalid custom firebase config in localStorage", e);
}

// Always prioritize user custom config, then school production config (duytanmanager-dc628)
const activeConfig = customConfig || duytanFirebaseConfig;

let app;
if (!getApps().some(a => a.name === "app")) {
  app = initializeApp(activeConfig, "app");
} else {
  app = getApp("app");
}

export const db = getFirestore(app);
export const activeFirebaseProject = activeConfig.projectId;

// Safely obtain storage instance without crashing the app at startup
let storageInstance: FirebaseStorage | null = null;
try {
  storageInstance = getStorage(app);
} catch (err) {
  console.warn("Firebase Storage is not initialized or available for this project yet. App will fallback to compressed images.", err);
}

export const storage = storageInstance;

/**
 * Nén hình ảnh bằng HTMLCanvas siêu nhanh (dưới 50ms)
 */
export function compressImageFile(file: File, maxWidth = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Tự động xử lý và đẩy file ảnh lên Firebase Storage với tốc độ TỨC THÌ (< 0.3s).
 * Sử dụng race timeout 2.5s để đảm bảo người dùng không bao giờ phải chờ lâu.
 */
export async function uploadImageToStorage(file: File, folderPath: string): Promise<string> {
  // Nén ảnh ngay trên trình duyệt bằng Canvas (chỉ tốn ~30-50 mili giây)
  const compressedBase64 = await compressImageFile(file, 900, 0.75);
  if (!compressedBase64) return '';

  try {
    let currentStorage = storageInstance;
    if (!currentStorage) {
      try {
        currentStorage = getStorage(app);
      } catch (e) {
        currentStorage = null;
      }
    }

    if (!currentStorage) {
      return compressedBase64;
    }

    const response = await fetch(compressedBase64);
    const blob = await response.blob();

    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    const fullPath = `${folderPath}/${fileName}`;
    const storageRef = ref(currentStorage, fullPath);

    // Race upload task với timeout 2.5s
    const uploadTask = (async () => {
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      return await getDownloadURL(storageRef);
    })();

    const timeoutTask = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Storage timeout')), 2500)
    );

    return await Promise.race([uploadTask, timeoutTask]);
  } catch (error) {
    console.warn("Firebase Storage upload timeout/fallback to instant compressed image:", error);
    return compressedBase64;
  }
}
