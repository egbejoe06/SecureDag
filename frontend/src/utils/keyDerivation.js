import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha256";
import nacl from "tweetnacl";

/**
 * Key derivation utilities for SecureDAG platform
 * Implements deterministic key derivation from wallet signatures using HKDF
 */

const KEY_DERIVATION_MESSAGE = "Derive SecureDAG encryption key v1";
const KEY_VERSION = 1;
const DEFAULT_ISSUED_AT = "2023-01-01T00:00:00.000Z";

/**
 * Derive encryption keypair from wallet signature using HKDF
 * @param {string} signature - Wallet signature (hex string)
 * @param {number} keyVersion - Key version for derivation (default: 1)
 * @returns {Object} Object containing Ed25519 and X25519 keypairs
 */
export function deriveKeyPairFromSignature(
  signature,
  keyVersion = KEY_VERSION
) {
  try {
    // Convert signature to bytes
    const signatureBytes = hexToUint8Array(signature);

    // Create HKDF input with version
    const versionedMessage = `${KEY_DERIVATION_MESSAGE} v${keyVersion}`;
    const info = new TextEncoder().encode(versionedMessage);

    // Derive seed using HKDF
    const seed = hkdf(sha256, signatureBytes, new Uint8Array(0), info, 32);

    // Generate Ed25519 keypair for signatures
    const ed25519KeyPair = nacl.sign.keyPair.fromSeed(seed);

    // Generate X25519 keypair for encryption (using same seed)
    // In tweetnacl 1.0.3, we need to use fromSecretKey instead of fromSeed
    // We'll use the first 32 bytes of the seed as the secret key
    const secretKey = seed.slice(0, 32);
    const x25519KeyPair = nacl.box.keyPair.fromSecretKey(secretKey);

    return {
      ed25519: {
        publicKey: ed25519KeyPair.publicKey,
        secretKey: ed25519KeyPair.secretKey,
      },
      x25519: {
        publicKey: x25519KeyPair.publicKey,
        secretKey: x25519KeyPair.secretKey,
      },
      seed,
      version: keyVersion,
    };
  } catch (error) {
    console.error("Error deriving keypair from signature:", error);
    throw new Error(`Failed to derive keypair: ${error.message}`);
  }
}

/**
 * Create EIP-712 style message for key derivation signing
 * @param {string} userAddress - User's wallet address
 * @param {number} chainId - Blockchain chain ID
 * @param {number} keyVersion - Key version
 * @returns {string} Message to sign
 */
export function createKeyDerivationMessage(
  userAddress,
  chainId,
  keyVersion = KEY_VERSION,
  options = {}
) {
  const domain = options.domain || window.location.host;
  const issuedAt = options.issuedAt || DEFAULT_ISSUED_AT;
  const nonce = options.nonce ?? "0";
  // Persist metadata so we can rebuild the same message later
  return {
    message: `${domain} wants you to derive encryption keys for SecureDAG:

Account: ${userAddress}
Key Version: ${keyVersion}
Purpose: File encryption and secure sharing

Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}

By signing this message, you are generating deterministic encryption keys that will be used to encrypt your files and enable secure sharing. These keys are derived from your signature and can be regenerated anytime with the same wallet.`,
    metadata: {
      domain,
      userAddress,
      chainId,
      keyVersion,
      nonce,
      issuedAt,
    },
  };
}

/**
 * Sign message for key derivation using wallet
 * @param {Object} signer - Ethers.js signer object
 * @param {string} userAddress - User's wallet address
 * @param {number} chainId - Blockchain chain ID
 * @param {number} keyVersion - Key version
 * @returns {Promise<string>} Signature hex string
 */
export async function signKeyDerivationMessage(
  signer,
  userAddress,
  chainId,
  keyVersion = KEY_VERSION,
  options = {}
) {
  try {
    const { message, metadata } = createKeyDerivationMessage(
      userAddress,
      chainId,
      keyVersion,
      options
    );
    const signature = await signer.signMessage(message);
    return { signature, metadata };
  } catch (error) {
    console.error("Error signing key derivation message:", error);
    throw new Error(`Failed to sign key derivation message: ${error.message}`);
  }
}

/**
 * Complete key derivation flow: sign message and derive keypair
 * @param {Object} signer - Ethers.js signer object
 * @param {string} userAddress - User's wallet address
 * @param {number} chainId - Blockchain chain ID
 * @param {number} keyVersion - Key version
 * @returns {Promise<Object>} Derived keypair with signature info
 */
export async function performKeyDerivation(
  signer,
  userAddress,
  chainId,
  keyVersion = KEY_VERSION,
  options = {}
) {
  try {
    const issuedAt = options.issuedAt || DEFAULT_ISSUED_AT;
    const nonce = options.nonce ?? "0";
    // Sign the derivation message
    const { signature, metadata } = await signKeyDerivationMessage(
      signer,
      userAddress,
      chainId,
      keyVersion,
      { ...options, issuedAt, nonce }
    );

    // Derive keypair from signature
    const keyPair = deriveKeyPairFromSignature(signature, keyVersion);

    return {
      ...keyPair,
      signature,
      metadata,
      userAddress,
      chainId,
      issuedAt,
      nonce,
      derivedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error performing key derivation:", error);
    throw new Error(`Failed to perform key derivation: ${error.message}`);
  }
}

/**
 * Verify that a signature can derive the expected public key
 * @param {string} signature - Signature hex string
 * @param {Uint8Array} expectedPublicKey - Expected public key
 * @param {number} keyVersion - Key version used
 * @returns {boolean} True if signature derives expected key
 */
export function verifyKeyDerivation(
  signature,
  expectedPublicKey,
  keyVersion = KEY_VERSION
) {
  try {
    const derivedKeyPair = deriveKeyPairFromSignature(signature, keyVersion);

    // Compare X25519 public keys (used for encryption)
    return arraysEqual(derivedKeyPair.x25519.publicKey, expectedPublicKey);
  } catch (error) {
    console.error("Error verifying key derivation:", error);
    return false;
  }
}

/**
 * Cache key derivation signature in session storage
 * @param {string} userAddress - User's wallet address
 * @param {string} signature - Signature hex string
 * @param {number} keyVersion - Key version
 */
export function cacheKeyDerivationSignature(
  userAddress,
  signature,
  keyVersion = KEY_VERSION,
  metadata
) {
  try {
    const cacheKey = `securedag_key_derivation_${userAddress}_v${keyVersion}`;
    const cacheData = {
      signature,
      keyVersion,
      cachedAt: new Date().toISOString(),
      userAddress,
      metadata,
      issuedAt: metadata?.issuedAt || DEFAULT_ISSUED_AT,
      nonce: metadata?.nonce ?? "0",
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching key derivation signature:", error);
  }
}

/**
 * Retrieve cached key derivation signature
 * @param {string} userAddress - User's wallet address
 * @param {number} keyVersion - Key version
 * @returns {Object|null} Cached signature data or null
 */
export function getCachedKeyDerivationSignature(
  userAddress,
  keyVersion = KEY_VERSION
) {
  try {
    const cacheKey = `securedag_key_derivation_${userAddress}_v${keyVersion}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    const cacheData = JSON.parse(cached);

    // Check if cache is still valid (24 hours)
    const cachedAt = new Date(cacheData.cachedAt);
    const now = new Date();
    const hoursDiff = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return cacheData;
  } catch (error) {
    console.error("Error retrieving cached key derivation signature:", error);
    return null;
  }
}

/**
 * Clear cached key derivation signature
 * @param {string} userAddress - User's wallet address
 * @param {number} keyVersion - Key version
 */
export function clearCachedKeyDerivationSignature(
  userAddress,
  keyVersion = KEY_VERSION
) {
  try {
    const cacheKey = `securedag_key_derivation_${userAddress}_v${keyVersion}`;
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.error("Error clearing cached key derivation signature:", error);
  }
}

/**
 * Convert hex string to Uint8Array
 * @param {string} hex - Hex string
 * @returns {Uint8Array} Binary data
 */
function hexToUint8Array(hex) {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;

  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

/**
 * Convert Uint8Array to hex string
 * @param {Uint8Array} data - Binary data
 * @returns {string} Hex string
 */
function uint8ArrayToHex(data) {
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compare two Uint8Arrays for equality
 * @param {Uint8Array} a - First array
 * @param {Uint8Array} b - Second array
 * @returns {boolean} True if arrays are equal
 */
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Restore keypair from cached signature without requiring new signature
 * @param {string} signature - Cached signature hex string
 * @param {number} keyVersion - Key version used
 * @returns {Object} Restored keypair
 */
export function restoreKeyPairFromSignature(
  signature,
  keyVersion = KEY_VERSION,
  metadata = {}
) {
  try {
    // Derive keypair from cached signature
    const keyPair = deriveKeyPairFromSignature(signature, keyVersion);

    return {
      ...keyPair,
      signature,
      metadata,
      issuedAt: metadata?.issuedAt || DEFAULT_ISSUED_AT,
      nonce: metadata?.nonce ?? "0",
      restoredAt: new Date().toISOString(),
      restored: true,
    };
  } catch (error) {
    console.error("Error restoring keypair from signature:", error);
    throw new Error(`Failed to restore keypair: ${error.message}`);
  }
}

/**
 * Get current key version
 * @returns {number} Current key version
 */
export function getCurrentKeyVersion() {
  return KEY_VERSION;
}

/**
 * Check if key version is supported
 * @param {number} version - Key version to check
 * @returns {boolean} True if version is supported
 */
export function isKeyVersionSupported(version) {
  return version >= 1 && version <= 10; // Support versions 1-10
}
