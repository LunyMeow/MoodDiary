import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import admin from "firebase-admin";

admin.initializeApp();

// Secret'ları tanımla
const apiKey = defineSecret("API_KEY");
const authDomain = defineSecret("AUTH_DOMAIN");
const projectId = defineSecret("PROJECT_ID");
const storageBucket = defineSecret("STORAGE_BUCKET");
const messagingSenderId = defineSecret("MESSAGING_SENDER_ID");
const appId = defineSecret("APP_ID");
const aes_pass = defineSecret("AES_PASS");

export const getFirebaseConfig = onRequest(
  {
    secrets: [
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      aes_pass,
    ],
  },
  (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.json({
      apiKey: apiKey.value(),
      authDomain: authDomain.value(),
      projectId: projectId.value(),
      storageBucket: storageBucket.value(),
      messagingSenderId: messagingSenderId.value(),
      appId: appId.value(),
      aes_pass: aes_pass.value(),
    });
  }
);
