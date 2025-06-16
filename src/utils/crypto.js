import CryptoJS from "crypto-js";
import { getAESPass, isFirebaseReady } from "../services/firebase";






export function encrypt(text,key="default") {
  const SECRET_KEY = getAESPass(); // Bu anahtarı güvenli tutun!

  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext,key="default") {
  const SECRET_KEY = getAESPass(); // Bu anahtarı güvenli tutun!

  if (!ciphertext || typeof ciphertext !== "string") return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText || "";
  } catch (e) {
    return "";
  }
}
