import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const defaultConfig = {
  projectId: "gen-lang-client-0237302277",
  appId: "1:14049971656:web:12e834dfabcc9794fac4fd",
  apiKey: "AIzaSyAdSqjjyetCSTq1VOBx7bEo58qDsQPGKW0",
  authDomain: "gen-lang-client-0237302277.firebaseapp.com",
  storageBucket: "gen-lang-client-0237302277.firebasestorage.app",
  messagingSenderId: "14049971656",
  measurementId: ""
};

let customConfigStr = localStorage.getItem('customFirebaseConfig');
let customConfig = null;
if (customConfigStr) {
  try {
    customConfig = JSON.parse(customConfigStr);
  } catch (e) {
    console.error("Invalid custom firebase config");
  }
}

let app;
if (customConfig) {
  app = !getApps().some(a => a.name === "custom") ? initializeApp(customConfig, "custom") : getApp("custom");
} else {
  app = !getApps().some(a => a.name === "default") ? initializeApp(defaultConfig, "default") : getApp("default");
}

export const db = customConfig ? getFirestore(app) : getFirestore(app, "ai-studio-edumanagepro-3db4613f-477a-4cf6-a5e6-2823c184867b");
