import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Wallet Store - Manages wallet connection state and blockchain interactions
 */
export const useWalletStore = defineStore("wallet", () => {
  // State
  const connected = ref(false);
  const userAccount = ref("");
  const chainId = ref(null);
  const networkName = ref("");
  const isAuthenticated = ref(false);
  const transactionHistory = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Getters
  const isConnected = computed(
    () => connected.value && userAccount.value !== ""
  );
  const shortAddress = computed(() => {
    if (!userAccount.value) return "";
    return `${userAccount.value.slice(0, 6)}...${userAccount.value.slice(-4)}`;
  });
  const isOnCorrectNetwork = computed(() => chainId.value === 296); // Hedera Testnet

  // Actions
  function setConnectionStatus(status) {
    connected.value = status;
  }

  function setUserAccount(account) {
    userAccount.value = account;
  }

  function setChainId(id) {
    chainId.value = id;
  }

  function setNetworkName(name) {
    networkName.value = name;
  }

  function setAuthenticationStatus(status) {
    isAuthenticated.value = status;
  }

  function addTransaction(transaction) {
    transactionHistory.value.unshift({
      ...transaction,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(),
    });

    // Keep only last 50 transactions
    if (transactionHistory.value.length > 50) {
      transactionHistory.value = transactionHistory.value.slice(0, 50);
    }
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

  function resetWallet() {
    connected.value = false;
    userAccount.value = "";
    chainId.value = null;
    networkName.value = "";
    isAuthenticated.value = false;
    transactionHistory.value = [];
    isLoading.value = false;
    error.value = null;
  }

  return {
    // State
    connected,
    userAccount,
    chainId,
    networkName,
    isAuthenticated,
    transactionHistory,
    isLoading,
    error,

    // Getters
    isConnected,
    shortAddress,
    isOnCorrectNetwork,

    // Actions
    setConnectionStatus,
    setUserAccount,
    setChainId,
    setNetworkName,
    setAuthenticationStatus,
    addTransaction,
    setLoading,
    setError,
    clearError,
    resetWallet,
  };
});
