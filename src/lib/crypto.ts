import CryptoJS from "crypto-js";

// A secret key for AES encryption (normally this would be in an environment variable, but for a frontend prototype we use a constant).
const SECRET_KEY = "orion_store_lgpd_super_secret_key";

export function encryptData(data: unknown): string {
  try {
    const jsonStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed", error);
    return "";
  }
}

export function decryptData<T>(ciphertext: string): T | null {
  if (!ciphertext) return null;
  try {
    // Basic check for unencrypted JSON (migration path)
    if (ciphertext.trim().startsWith("{") || ciphertext.trim().startsWith("[")) {
      return JSON.parse(ciphertext) as T;
    }
    
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData) as T;
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
}

export function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}
