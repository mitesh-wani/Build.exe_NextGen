// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
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

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Initialize Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase Auth initialized');
} catch (error) {
  // If already initialized, get the existing instance
  console.log('ℹ️ Auth already initialized, getting existing instance');
  auth = getAuth(app);
}

// Initialize Storage
const storage = getStorage(app);
console.log('✅ Firebase Storage initialized');

export { app, auth, storage };