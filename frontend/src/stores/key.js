import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Key Store - Manages encryption keys, key derivation, and key caching
 */
export const useKeyStore = defineStore("key", () => {
  // State
  const userKeyPair = ref(null);
  const cachedPublicKeys = ref(new Map());
  const keyDerivationSignature = ref(null);
  const keyVersion = ref(1);
  const isKeyRegistered = ref(false);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const hasUserKeyPair = computed(() => userKeyPair.value !== null);
  const hasDerivationSignature = computed(
    () => keyDerivationSignature.value !== null
  );
  const userPublicKey = computed(
    () => userKeyPair.value?.x25519?.publicKey || null
  );
  const userPrivateKey = computed(
    () => userKeyPair.value?.x25519?.secretKey || null
  );

  // Actions
  function setUserKeyPair(keyPair) {
    userKeyPair.value = keyPair;
  }

  function setKeyDerivationSignature(signature) {
    keyDerivationSignature.value = signature;
  }

  function setKeyVersion(version) {
    keyVersion.value = version;
  }

  function setKeyRegistrationStatus(status) {
    isKeyRegistered.value = status;
  }

  function cachePublicKey(address, publicKey) {
    cachedPublicKeys.value.set(address.toLowerCase(), {
      publicKey,
      cachedAt: new Date().toISOString(),
    });
  }

  function getCachedPublicKey(address) {
    const cached = cachedPublicKeys.value.get(address.toLowerCase());

    if (!cached) return null;

    // Check if cache is still valid (24 hours)
    const cachedAt = new Date(cached.cachedAt);
    const now = new Date();
    const hoursDiff = (now - cachedAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      cachedPublicKeys.value.delete(address.toLowerCase());
      return null;
    }

    return cached.publicKey;
  }

  function removeCachedPublicKey(address) {
    cachedPublicKeys.value.delete(address.toLowerCase());
  }

  function setLoading(status) {
    isLoading.value = status;
  }

  function setError(errorMessage) {
    error.value = errorMessage;
  }

  function clearError() {
    error.value = null;
  }

  function clearUserKeys() {
    userKeyPair.value = null;
    keyDerivationSignature.value = null;
    isKeyRegistered.value = false;
  }

  function clearAllCachedKeys() {
    cachedPublicKeys.value.clear();
  }

  function resetKeyStore() {
    userKeyPair.value = null;
    cachedPublicKeys.value.clear();
    keyDerivationSignature.value = null;
    keyVersion.value = 1;
    isKeyRegistered.value = false;
    isLoading.value = false;
    error.value = null;
  }

  // Key derivation helpers
  function deriveKeyPairFromSignature(signature, version = keyVersion.value) {
    // This would import and use the keyDerivation utility
    // For now, we'll just store the signature and let the composable handle derivation
    setKeyDerivationSignature(signature);
    setKeyVersion(version);
  }

  function validateKeyPair(keyPair) {
    if (!keyPair || !keyPair.x25519 || !keyPair.ed25519) {
      return false;
    }

    // Basic validation - check if keys have correct length
    return (
      keyPair.x25519.publicKey.length === 32 &&
      keyPair.x25519.secretKey.length === 32 &&
      keyPair.ed25519.publicKey.length === 32 &&
      keyPair.ed25519.secretKey.length === 64
    );
  }

  function getKeyInfo() {
    return {
      hasKeyPair: hasUserKeyPair.value,
      hasSignature: hasDerivationSignature.value,
      keyVersion: keyVersion.value,
      isRegistered: isKeyRegistered.value,
      cachedKeysCount: cachedPublicKeys.value.size,
    };
  }

  function exportKeyInfo() {
    // Only export non-sensitive information
    return {
      keyVersion: keyVersion.value,
      isRegistered: isKeyRegistered.value,
      cachedKeysCount: cachedPublicKeys.value.size,
      hasKeyPair: hasUserKeyPair.value,
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    // State
    userKeyPair,
    cachedPublicKeys,
    keyDerivationSignature,
    keyVersion,
    isKeyRegistered,
    isLoading,
    error,

    // Getters
    hasUserKeyPair,
    hasDerivationSignature,
    userPublicKey,
    userPrivateKey,

    // Actions
    setUserKeyPair,
    setKeyDerivationSignature,
    setKeyVersion,
    setKeyRegistrationStatus,
    cachePublicKey,
    getCachedPublicKey,
    removeCachedPublicKey,
    setLoading,
    setError,
    clearError,
    clearUserKeys,
    clearAllCachedKeys,
    resetKeyStore,
    deriveKeyPairFromSignature,
    validateKeyPair,
    getKeyInfo,
    exportKeyInfo,
  };
});
