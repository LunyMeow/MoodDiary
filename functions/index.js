import { onCall } from "firebase-functions/v2/https";
import CryptoJS from "crypto-js";
import admin from "firebase-admin";

admin.initializeApp();

// GÜNLÜK ŞİFRE ÇÖZME
export const decryptDiary = onCall(async (req) => {
  const { diaryId } = req.data;
  const uid = req.auth?.uid;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Giriş yapmalısınız.");
  }

  const diaryRef = admin.firestore().collection("diaries").doc(diaryId);
  const diarySnap = await diaryRef.get();

  if (!diarySnap.exists) {
    throw new HttpsError("not-found", "Günlük bulunamadı.");
  }

  const diary = diarySnap.data();

  if (diary.userId !== uid && diary.status !== "public") {
    throw new HttpsError("permission-denied", "Bu günlüğe erişiminiz yok.");
  }

  const decrypted = CryptoJS.AES.decrypt(diary.content, diary.aesPass || "default").toString(CryptoJS.enc.Utf8);

  return { decrypted };
});


// 🟢 createDiary fonksiyonu
export const createDiary = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Giriş gerekli.");

  const { content, status } = req.data;

  const aesPass = generateKey();
  const encrypted = CryptoJS.AES.encrypt(content, aesPass).toString();

  await admin.firestore().collection("diaries").add({
    userId: uid,
    content: encrypted,
    aesPass,
    status,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});


function generateKey(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let key = "";
  for (let i = 0; i < length; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}


export const editDiary = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new Error("Giriş yapmalısınız.");

  const { diaryId, newContent, status } = req.data;
  const diaryRef = admin.firestore().collection("diaries").doc(diaryId);
  const diarySnap = await diaryRef.get();

  if (!diarySnap.exists) {
    throw new Error("Günlük bulunamadı.");
  }

  const diary = diarySnap.data();

  if (diary.userId !== uid) {
    throw new Error("Bu günlüğü düzenleme yetkiniz yok.");
  }

  const encrypted = CryptoJS.AES.encrypt(newContent, diary.aesPass).toString();

  await diaryRef.update({
    content: encrypted,
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});