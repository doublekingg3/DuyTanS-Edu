import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { defaultDb } from './lib/firebase_default';
import { Loader2 } from 'lucide-react';

const App = React.lazy(() => import('./App'));

export default function Bootloader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchGlobalConfig = async () => {
      try {
        const configRef = doc(defaultDb, 'system', 'firebaseConfig');
        const configSnap = await getDoc(configRef);
        
        if (configSnap.exists()) {
          const data = configSnap.data();
          if (data && data.configStr) {
            localStorage.setItem('customFirebaseConfig', data.configStr);
          } else {
            localStorage.removeItem('customFirebaseConfig');
          }
        } else {
          localStorage.removeItem('customFirebaseConfig');
        }
      } catch (error) {
        console.error("Failed to load global config:", error);
      } finally {
        setReady(true);
      }
    };
    
    fetchGlobalConfig();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang khởi tạo hệ thống...</h2>
      </div>
    );
  }

  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-800">Đang tải ứng dụng...</h2>
      </div>
    }>
      <App />
    </React.Suspense>
  );
}
