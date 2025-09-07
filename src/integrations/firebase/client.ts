// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAI, getGoogleAIProvider } from "firebase/ai";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxCIkotXz8MIhOXrCR_qysYyVHY8qkuKQ",
  authDomain: "milo2-e7e31.firebaseapp.com",
  projectId: "milo2-e7e31",
  storageBucket: "milo2-e7e31.firebasestorage.app",
  messagingSenderId: "832725574932",
  appId: "1:832725574932:web:c728c41cf997254fb08e01",
  measurementId: "G-V9LCQ9S406"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Lazy-initialize the AI service to prevent startup crashes
let generativeAIInstance;
export const getGenerativeAIService = () => {
  if (!generativeAIInstance) {
    generativeAIInstance = getAI(app, { provider: getGoogleAIProvider() });
  }
  return generativeAIInstance;
};

// Connect to emulators in development, ensuring it only runs in the browser
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log("Connecting to Firebase emulators");
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, analytics, auth, db, functions };
