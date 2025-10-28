import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

/**
 * Crypto utilities for SecureDAG platform
 * Handles file encryption/decryption and key encryption
 */

// For SHA-256 hashing
import CryptoJS from "crypto-js";

/**
 * Generate a random 32-byte key for file encryption
 * @returns {Uint8Array} Random encryption key
 */
export function generateFileKey() {
  return nacl.randomBytes(32);
}

/**
 * Generate SHA-256 hash of document content for IP timestamping
 * @param {Uint8Array} fileData - File data to hash
 * @returns {string} Hex-encoded hash
 */
export function generateDocumentHash(fileData) {
  // Convert Uint8Array to WordArray for CryptoJS
  const wordArray = CryptoJS.lib.WordArray.create(fileData);
  const hash = CryptoJS.SHA256(wordArray);
  return hash.toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt a file with a given key using TweetNaCl
 * @param {Uint8Array} fileData - Raw file data
 * @param {Uint8Array} key - 32-byte encryption key
 * @returns {Uint8Array} Encrypted file data
 */
export function encryptFile(fileData, key) {
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.secretbox(fileData, nonce, key);

  // Prepend nonce to encrypted data
  const result = new Uint8Array(nonce.length + encrypted.length);
  result.set(nonce, 0);
  result.set(encrypted, nonce.length);

  return result;
}

/**
 * Decrypt a file with a given key using TweetNaCl
 * @param {Uint8Array} encryptedData - Encrypted file data with nonce
 * @param {Uint8Array} key - 32-byte decryption key
 * @returns {Uint8Array} Decrypted file data
 */
export function decryptFile(encryptedData, key) {
  const nonce = encryptedData.slice(0, 24);
  const ciphertext = encryptedData.slice(24);

  const decrypted = nacl.secretbox.open(ciphertext, nonce, key);
  if (!decrypted) {
    throw new Error("Failed to decrypt file - invalid key or corrupted data");
  }

  return decrypted;
}

/**
 * Encrypt a file key with recipient's public key using X25519
 * @param {Uint8Array} fileKey - 32-byte file encryption key
 * @param {Uint8Array} recipientPublicKey - Recipient's X25519 public key
 * @param {Uint8Array} senderPrivateKey - Sender's X25519 private key
 * @returns {Uint8Array} Encrypted file key
 */
export function encryptFileKey(fileKey, recipientPublicKey, senderPrivateKey) {
  // Generate ephemeral keypair for this encryption
  const ephemeralKeyPair = nacl.box.keyPair();

  // Encrypt the file key
  const nonce = nacl.randomBytes(24);
  const encrypted = nacl.box(
    fileKey,
    nonce,
    recipientPublicKey,
    ephemeralKeyPair.secretKey
  );

  // Prepend ephemeral public key and nonce
  const result = new Uint8Array(32 + 24 + encrypted.length);
  result.set(ephemeralKeyPair.publicKey, 0);
  result.set(nonce, 32);
  result.set(encrypted, 32 + 24);

  return result;
}

/**
 * Decrypt a file key with recipient's private key using X25519
 * @param {Uint8Array} encryptedFileKey - Encrypted file key
 * @param {Uint8Array} recipientPrivateKey - Recipient's X25519 private key
 * @returns {Uint8Array} Decrypted file key
 */
export function decryptFileKey(encryptedFileKey, recipientPrivateKey) {
  const ephemeralPublicKey = encryptedFileKey.slice(0, 32);
  const nonce = encryptedFileKey.slice(32, 56);
  const ciphertext = encryptedFileKey.slice(56);

  const decrypted = nacl.box.open(
    ciphertext,
    nonce,
    ephemeralPublicKey,
    recipientPrivateKey
  );
  if (!decrypted) {
    throw new Error(
      "Failed to decrypt file key - invalid private key or corrupted data"
    );
  }

  return decrypted;
}

/**
 * Convert Uint8Array to base64 string
 * @param {Uint8Array} data - Binary data
 * @returns {string} Base64 encoded string
 */
export function uint8ArrayToBase64(data) {
  return naclUtil.encodeBase64(data);
}

/**
 * Convert base64 string to Uint8Array
 * @param {string} base64 - Base64 encoded string
 * @returns {Uint8Array} Binary data
 */
export function base64ToUint8Array(base64) {
  return naclUtil.decodeBase64(base64);
}

/**
 * Convert Uint8Array to hex string
 * @param {Uint8Array} data - Binary data
 * @returns {string} Hex encoded string
 */
export function uint8ArrayToHex(data) {
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to Uint8Array
 * @param {string} hex - Hex encoded string
 * @returns {Uint8Array} Binary data
 */
export function hexToUint8Array(hex) {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

/**
 * Generate a file hash for integrity verification
 * @param {Uint8Array} fileData - File data
 * @returns {string} SHA-256 hash as hex string
 */
export async function generateFileHash(fileData) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileData);
  const hashArray = new Uint8Array(hashBuffer);
  return uint8ArrayToHex(hashArray);
}

/**
 * Verify file integrity using hash
 * @param {Uint8Array} fileData - File data to verify
 * @param {string} expectedHash - Expected hash as hex string
 * @returns {boolean} True if hash matches
 */
export async function verifyFileHash(fileData, expectedHash) {
  const actualHash = await generateFileHash(fileData);
  return actualHash === expectedHash;
}

/**
 * Trigger browser download of a file
 * @param {Uint8Array} fileData - File data as Uint8Array
 * @param {string} fileName - Name for the downloaded file
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(
  fileData,
  fileName,
  mimeType = "application/octet-stream"
) {
  const blob = new Blob([fileData], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}
