import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCF-cINpRVNbhMG51EBmJaobCxJZkdJSWg",
  authDomain: "urbanfix-c9524.firebaseapp.com",
  projectId: "urbanfix-c9524",
  storageBucket: "urbanfix-c9524.firebasestorage.app",
  messagingSenderId: "524005116119",
  appId: "1:524005116119:web:d8f1d9252cfe5afceb0892",
  measurementId: "G-BFRNKZE1KS"
};

const app = initializeApp(firebaseConfig);

// ✅ Simple Auth (Expo Go compatible)
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
