import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "REMOVED_API_KEY",
  authDomain: "workspaceapp-36f44.firebaseapp.com",
  projectId: "workspaceapp-36f44",
  storageBucket: "workspaceapp-36f44.firebasestorage.app",
  messagingSenderId: "383915722398",
  appId: "1:383915722398:web:486bd5d87052e449101d8f",
  measurementId: "G-9CMDL0X2DQ",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
