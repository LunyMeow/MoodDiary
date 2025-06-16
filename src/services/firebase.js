// services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app;
let auth;
let db;
let storage;
let aes_pass;
let firebaseReady = false;

export async function initializeFirebase() {

  if (firebaseReady) return;

  const res = await fetch("https://example.com");
  let text = await res.text();
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // görünmeyen karakterleri temizle
  const config = JSON.parse(text);


  app = initializeApp(config);
  auth = getAuth(app); // BURADA Auth başlatılıyor
  db = getFirestore(app);
  storage = getStorage(app);
  aes_pass = config.aes_pass;

  firebaseReady = true;
}

export function getFirebaseAuth() {
  if (!firebaseReady || !auth) {
    throw new Error("Firebase Auth is not initialized yet. Call initializeFirebase first.");
  }
  return auth;
}

export function getFirebaseDB() {
  if (!firebaseReady || !db) {
    throw new Error("Firebase DB is not initialized yet. Call initializeFirebase first.");
  }
  return db;
}

export function getFirebaseStorage() {
  if (!firebaseReady || !storage) {
    throw new Error("Firebase Storage is not initialized yet. Call initializeFirebase first.");
  }
  return storage;
}

export function getAESPass() {
  if (!firebaseReady) {
    throw new Error("Firebase is not initialized yet.");
  }
  return aes_pass;
}

export function isFirebaseReady() {
  return firebaseReady;
}
