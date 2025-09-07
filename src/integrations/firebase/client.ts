// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
let generativeAIInstance: GoogleGenerativeAI | null = null;
export const getGenerativeAIService = () => {
  if (!generativeAIInstance) {
    // Note: You need to set GOOGLE_AI_API_KEY in your environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY || firebaseConfig.apiKey;
    generativeAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return generativeAIInstance;
};

// Connect to emulators in development, ensuring it only runs in the browser
// if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
//   console.log("Connecting to Firebase emulators");
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export { app, analytics, auth, db, functions };
