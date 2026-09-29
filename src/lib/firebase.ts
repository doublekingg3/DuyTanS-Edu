import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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
