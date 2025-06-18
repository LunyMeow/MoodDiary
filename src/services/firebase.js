import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

let app;
let auth;
let db;
let storage;
let aes_pass;
let firebaseReady = false;

// 💡 TRUE: localhost emülatör, FALSE: production
const USE_EMULATORS = true;

export async function initializeFirebase() {
  if (firebaseReady) return;

  if (USE_EMULATORS) {
    // 🔧 Lokal emülatör konfigürasyonu
    const config = {
      apiKey: "fake-api-key",
      authDomain: "localhost",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "fake-id",
      appId: "fake-app-id",
      aes_pass: "local-aes-password"
    };

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    aes_pass = config.aes_pass;

    // ⚙️ Emülatör bağlantıları
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);

    console.log("🧪 Firebase emulators connected.");
  } else {
    // 🌐 Production yapılandırması uzaktan çekilir
    const res = await fetch("https://example.com");
    let text = await res.text();
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    const config = JSON.parse(text);

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    aes_pass = config.aes_pass;

    console.log("✅ Firebase production initialized.");
  }

  firebaseReady = true;
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
