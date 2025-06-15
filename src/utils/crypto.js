import CryptoJS from "crypto-js";

const SECRET_KEY =import.meta.env.VITE_AES_PASSWORD; // Bu anahtarı güvenli tutun!

export function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext) {
  if (!ciphertext || typeof ciphertext !== "string") return "";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedText || "";
  } catch (e) {
    return "";
  }
}
