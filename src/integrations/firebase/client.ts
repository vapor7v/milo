import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDUN_k-GvV3LHWEXhWBTl-wBDUQxoEHuV0",
  authDomain: "milo-9c60c.firebaseapp.com",
  projectId: "milo-9c60c",
  storageBucket: "milo-9c60c.appspot.com",
  messagingSenderId: "876121735325",
  appId: "1:876121735325:web:b844c59b9feba70f2e1474",
  measurementId: "G-ZC5X96BT73"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
