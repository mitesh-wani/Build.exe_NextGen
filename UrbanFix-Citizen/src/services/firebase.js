import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Added Firestore
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCF-cINpRVNbhMG51EBmJaobCxJZkdJSWg",
  authDomain: "urbanfix-c9524.firebaseapp.com",
  projectId: "urbanfix-c9524",
  storageBucket: "urbanfix-c9524.firebasestorage.app",
  messagingSenderId: "524005116119",
  appId: "1:524005116119:web:d8f1d9252cfe5afceb0892",
};

// Initialize Firebase (Prevents re-initialization during Hot Reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  auth = getAuth(app); // Fallback if already initialized
}

// Initialize Firestore (The "db" your HomeScreen is looking for)
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Export all services
export { app, auth, db, storage };