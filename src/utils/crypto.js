// src/utils/crypto.js
import CryptoJS from 'crypto-js';

const secretKey = 'your-secret-key'; // Debe ser mantenida en secreto

// Encriptar función
export function encrypt(data) {
  return CryptoJS.AES.encrypt(`${data}`, secretKey).toString();
}

// Desencriptar función
export function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
}
