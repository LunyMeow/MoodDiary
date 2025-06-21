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





const db = admin.firestore();

export const followUser = onCall(async (req) => {
  const currentUserId = req.auth?.uid;
  const targetUserId = req.data.targetUserId;

  if (!currentUserId) throw new Error("User not authenticated");
  if (!targetUserId) throw new Error("targetUserId required");

  const targetUserRef = db.collection("users").doc(targetUserId);
  const targetUserSnap = await targetUserRef.get();

  if (!targetUserSnap.exists) throw new Error("Target user not found");

  const targetData = targetUserSnap.data();
  const profilePublic = targetData.profilePublic === true;

  if (profilePublic) {
    // Doğrudan takip et
    await targetUserRef.update({
      followers: admin.firestore.FieldValue.arrayUnion(currentUserId)
    });
    await db.collection("users").doc(currentUserId).update({
      following: admin.firestore.FieldValue.arrayUnion(targetUserId)
    });

    // Bildirim gönder
    const notification = {
      type: "follow",
      from: currentUserId,
      timestamp: admin.firestore.Timestamp.now(),
      read: false
    };

    await targetUserRef.update({
      notifications: admin.firestore.FieldValue.arrayUnion(notification)
    });

  } else {

    const notification = {
      type: "followRequest",
      from: currentUserId,
      timestamp: admin.firestore.Timestamp.now(),
      read: false
    };

    await targetUserRef.update({
      notifications: admin.firestore.FieldValue.arrayUnion(notification)
    });
    // Takip isteği gönder
    await targetUserRef.update({
      followRequests: admin.firestore.FieldValue.arrayUnion(currentUserId)
    });
  }

  return { success: true };
});



// Firebase functions dosyana ekle
export const acceptFollowRequest = onCall(async (req) => {
  const currentUserId = req.auth?.uid;
  const requesterId = req.data.requesterId;

  if (!currentUserId) throw new Error("User not authenticated");
  if (!requesterId) throw new Error("requesterId is required");

  const db = admin.firestore();

  const currentUserRef = db.collection("users").doc(currentUserId);
  const requesterRef = db.collection("users").doc(requesterId);

  // Kullanıcıları güncelle
  await currentUserRef.update({
    followers: admin.firestore.FieldValue.arrayUnion(requesterId),
    followRequests: admin.firestore.FieldValue.arrayRemove(requesterId),
  });

  await requesterRef.update({
    following: admin.firestore.FieldValue.arrayUnion(currentUserId),
  });

  // Bildirim gönder
  const notification = {
    type: "follow_accepted",
    from: currentUserId,
    timestamp: admin.firestore.Timestamp.now(),
    read: false,
  };

  await requesterRef.update({
    notifications: admin.firestore.FieldValue.arrayUnion(notification),
  });

  return { success: true };
});




let unFollowNotification = true;


export const unfollowUser = onCall(async (req) => {
  const currentUserId = req.auth?.uid;
  const targetUserId = req.data.targetUserId;

  if (!currentUserId) throw new Error("User not authenticated");
  if (!targetUserId) throw new Error("targetUserId required");

  await db.collection("users").doc(targetUserId).update({
    followers: admin.firestore.FieldValue.arrayRemove(currentUserId)
  });
  await db.collection("users").doc(currentUserId).update({
    following: admin.firestore.FieldValue.arrayRemove(targetUserId)
  });



  // 🔵 Opsiyonel bildirim
  if (unFollowNotification) {
    const notification = {
      type: "unfollow",
      from: currentUserId,
      timestamp: admin.firestore.Timestamp.now(), // ✅ Burada değiştiriyoruz
      read: false
    };

    await db.collection("users").doc(targetUserId).update({
      notifications: admin.firestore.FieldValue.arrayUnion(notification)
    });
  }




  return { success: true };
});

export const blockUser = onCall(async (req) => {
  const currentUserId = req.auth?.uid;
  const targetUserId = req.data.targetUserId;

  if (!currentUserId) throw new Error("User not authenticated");
  if (!targetUserId) throw new Error("targetUserId required");

  await db.collection("users").doc(currentUserId).update({
    blocked: admin.firestore.FieldValue.arrayUnion(targetUserId)
  });

  return { success: true };
});

export const unblockUser = onCall(async (req) => {
  const currentUserId = req.auth?.uid;
  const targetUserId = req.data.targetUserId;

  if (!currentUserId) throw new Error("User not authenticated");
  if (!targetUserId) throw new Error("targetUserId required");

  await db.collection("users").doc(currentUserId).update({
    blocked: admin.firestore.FieldValue.arrayRemove(targetUserId)
  });

  return { success: true };
});


export const getNotifications = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Giriş gerekli.");

  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new HttpsError("not-found", "Kullanıcı bulunamadı.");

  const data = userSnap.data();
  let notifications = data?.notifications || [];

  const unread = notifications.filter(n => !n.read).slice(-10);

  // Tüm 'from' UID'lerini topla
  const fromUids = unread.map(n => n.from).filter(Boolean);

  // UID → username mapini oluştur
  const usernameMap = {};
  const userDocs = await Promise.all(fromUids.map(uid =>
    db.collection("users").doc(uid).get()
  ));
  userDocs.forEach(doc => {
    if (doc.exists) {
      usernameMap[doc.id] = doc.data().username || "Bilinmeyen";
    }
  });

  // fromUsername'ı her bildirime ekle
  const enriched = unread.map(n => ({
    ...n,
    fromUsername: usernameMap[n.from] || "Bilinmeyen"
  }));

  // Bildirimleri okundu yap
  const updated = notifications.map(n =>
    unread.includes(n) ? { ...n, read: true } : n
  );
  if (updated.length > 50) {
    updated.splice(0, 10);
  }

  await userRef.update({ notifications: updated });

  return { notifications: enriched };
});

