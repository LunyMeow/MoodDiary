import CryptoJS from "crypto-js";
import { getAESPass, isFirebaseReady } from "../services/firebase";






export function encrypt(text,key="default") {


  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext,key="default") {

  if (!ciphertext || typeof ciphertext !== "string") return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText || "";
  } catch (e) {
    return "";
  }
}
