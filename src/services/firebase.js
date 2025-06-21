import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";


let app;
let auth;
let db;
let storage;
let aes_pass;
let firebaseReady = false;
let functions;

// 💡 TRUE: localhost emülatör, FALSE: production
const USE_EMULATORS = true;

export async function initializeFirebase() {
  if (firebaseReady) return;

  if (USE_EMULATORS) {
    // 🔧 Lokal emülatör konfigürasyonu
    const config = {
      apiKey: "fake-api-key",
      authDomain: "localhost",
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: "fake-id",
      appId: "fake-app-id",
    };

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    aes_pass = config.aes_pass;

    functions = getFunctions(app);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);

    // ⚙️ Emülatör bağlantıları
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);

    console.log("🧪 Firebase emulators connected.");
  } else {
    // 🌐 Production yapılandırması doğrudan .env üzerinden alınır
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };


    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    aes_pass = config.aes_pass;

    console.log("✅ Firebase production initialized.");
  }

  firebaseReady = true;
}


export function getFirebaseFunctions() {
  if (!firebaseReady || !functions) throw new Error("Firebase Functions not initialized");
  return functions;
}


export function getFirebaseApp() {
  if (!firebaseReady || !app) throw new Error("Firebase App not initialized");
  return app;
}

// Getter fonksiyonlar
export function getFirebaseAuth() {
  if (!firebaseReady || !auth) throw new Error("Firebase Auth not initialized");
  return auth;
}

export function getFirebaseDB() {
  if (!firebaseReady || !db) throw new Error("Firebase DB not initialized");
  return db;
}

export function getFirebaseStorage() {
  if (!firebaseReady || !storage) throw new Error("Firebase Storage not initialized");
  return storage;
}

export function getAESPass() {
  if (!firebaseReady) throw new Error("Firebase not initialized");
  return aes_pass;
}

export function isFirebaseReady() {
  return firebaseReady;
}
