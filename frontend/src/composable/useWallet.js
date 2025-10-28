import { ref } from "vue";
import { ethers } from "ethers";
import {
  DATA_VAULT_CONTRACT_ADDRESS,
  DATA_VAULT_CONTRACT_ABI,
} from "../constants/DataVaultContract";
import {
  KEY_REGISTRY_CONTRACT_ADDRESS,
  KEY_REGISTRY_CONTRACT_ABI,
} from "../constants/KeyRegistryContract";
import {
  PROVIDER_REGISTRY_CONTRACT_ADDRESS,
  PROVIDER_REGISTRY_CONTRACT_ABI,
} from "../constants/ProviderRegistryContract";
import {
  BIO_KEY_MODULE_CONTRACT_ADDRESS,
  BIO_KEY_MODULE_CONTRACT_ABI,
} from "../constants/BioKeyModuleContract";
import {
  IP_SEAL_MODULE_CONTRACT_ADDRESS,
  IP_SEAL_MODULE_CONTRACT_ABI,
} from "../constants/IPSealModuleContract";
import {
  MEDI_VAULT_MODULE_CONTRACT_ADDRESS,
  MEDI_VAULT_MODULE_CONTRACT_ABI,
} from "../constants/MediVaultModuleContract";
import { useWalletStore } from "../stores/wallet";
import { useKeyStore } from "../stores/key";
import {
  performKeyDerivation,
  restoreKeyPairFromSignature,
  getCachedKeyDerivationSignature,
  cacheKeyDerivationSignature,
  clearCachedKeyDerivationSignature,
} from "../utils/keyDerivation";
import {
  uint8ArrayToHex,
  decryptFileKey,
  encryptFileKey,
  hexToUint8Array,
} from "../utils/crypto";

// Network Configuration for electroneum
const ELECTRONEUM_CHAIN_ID = 296;
const ELECTRONEUM_RPC_URL = "https://testnet.hashio.io/api";
const BLOCK_EXPLORER_URL = "https://hashscan.io/testnet";

// Ethereum Objects
let provider = null;
let signer = null;

// Contract Instances
let DataVaultContractInstance = null;
let KeyRegistryContractInstance = null;
let ProviderRegistryContractInstance = null;
let BioKeyModuleContractInstance = null;
let IPSealModuleContractInstance = null;
let MediVaultModuleContractInstance = null;

// Reactive State
const connected = ref(false);
const userAccount = ref("");
const isAuthenticated = ref(false);

// Helper Functions
const initializeContracts = () => {
  DataVaultContractInstance = new ethers.Contract(
    DATA_VAULT_CONTRACT_ADDRESS,
    DATA_VAULT_CONTRACT_ABI,
    signer
  );
  KeyRegistryContractInstance = new ethers.Contract(
    KEY_REGISTRY_CONTRACT_ADDRESS,
    KEY_REGISTRY_CONTRACT_ABI,
    signer
  );
  ProviderRegistryContractInstance = new ethers.Contract(
    PROVIDER_REGISTRY_CONTRACT_ADDRESS,
    PROVIDER_REGISTRY_CONTRACT_ABI,
    signer
  );
  BioKeyModuleContractInstance = new ethers.Contract(
    BIO_KEY_MODULE_CONTRACT_ADDRESS,
    BIO_KEY_MODULE_CONTRACT_ABI,
    signer
  );
  IPSealModuleContractInstance = new ethers.Contract(
    IP_SEAL_MODULE_CONTRACT_ADDRESS,
    IP_SEAL_MODULE_CONTRACT_ABI,
    signer
  );
  MediVaultModuleContractInstance = new ethers.Contract(
    MEDI_VAULT_MODULE_CONTRACT_ADDRESS,
    MEDI_VAULT_MODULE_CONTRACT_ABI,
    signer
  );
};

const resetConnection = () => {
  provider = null;
  signer = null;
  connected.value = false;
  userAccount.value = "";
  DataVaultContractInstance = null;
  KeyRegistryContractInstance = null;
  ProviderRegistryContractInstance = null;
  BioKeyModuleContractInstance = null;
  IPSealModuleContractInstance = null;
  MediVaultModuleContractInstance = null;

  // Reset stores
  walletStore.resetWallet();
  keyStore.resetKeyStore();
};

export const useWallet = () => {
  // Initialize stores
  const walletStore = useWalletStore();
  const keyStore = useKeyStore();

  // Auto-reconnect on page load
  const autoReconnect = async () => {
    if (typeof window.ethereum === "undefined") {
      console.log("MetaMask not detected, skipping auto-reconnect");
      return;
    }

    try {
      // Check if MetaMask is already connected
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length === 0) {
        console.log("No accounts connected, skipping auto-reconnect");
        return;
      }

      console.log("Attempting auto-reconnect...");

      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const decimalChainId = parseInt(chainId, 16);

      if (decimalChainId !== ELECTRONEUM_CHAIN_ID) {
        console.log("Wrong network detected, switching to Hedera Testnet...");
        // Try to switch to correct network
        await switchToElectroneum();
      }

      // Restore connection
      await initializeProvider();

      // Try to restore keys from cache
      await restoreKeysFromCache();

      console.log("Wallet auto-reconnected successfully");
    } catch (error) {
      console.log("Auto-reconnect failed:", error.message);
      // Clear any partial state
      resetConnection();
      // Don't throw error - just log it, user can manually reconnect
    }
  };

  // Manual reconnection function (can be called from UI)
  const manualReconnect = async () => {
    try {
      walletStore.setLoading(true);
      walletStore.clearError();

      await autoReconnect();

      if (connected.value) {
        console.log("Manual reconnection successful");
      } else {
        throw new Error("Reconnection failed - wallet not connected");
      }
    } catch (error) {
      console.error("Manual reconnection failed:", error);
      walletStore.setError(`Reconnection failed: ${error.message}`);
      throw error;
    } finally {
      walletStore.setLoading(false);
    }
  };

  // Restore keys from cached signature
  const restoreKeysFromCache = async () => {
    try {
      const cached = getCachedKeyDerivationSignature(userAccount.value);
      if (!cached) return;

      const keyDerivationResult = restoreKeyPairFromSignature(
        cached.signature,
        cached.keyVersion,
        cached.metadata
      );

      keyStore.setUserKeyPair(keyDerivationResult);
      keyStore.setKeyDerivationSignature(cached.signature);
      keyStore.setKeyVersion(keyDerivationResult.version);

      await checkKeyRegistration();

      console.log("Keys restored from cache successfully");
    } catch (error) {
      console.log("Failed to restore keys from cache:", error.message);
      clearCachedKeyDerivationSignature(userAccount.value);
    }
  };

  // Initialize auto-reconnect on first load
  if (
    typeof window !== "undefined" &&
    !window.securedagAutoReconnectInitialized
  ) {
    window.securedagAutoReconnectInitialized = true;
    // Use setTimeout to ensure DOM is ready
    setTimeout(autoReconnect, 100);
  }

  const handleChainChanged = (chainId) => {
    const decimalChainId = parseInt(chainId, 16);
    if (decimalChainId !== ELECTRONEUM_CHAIN_ID) {
      resetConnection();
      window.location.reload();
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      resetConnection();
    } else {
      userAccount.value = accounts[0];
      walletStore.setUserAccount(accounts[0]);
    }
  };

  const addElectroneumNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${ELECTRONEUM_CHAIN_ID.toString(16)}`,
            chainName: "Hedera Testnet",
            nativeCurrency: {
              name: "Hedera Testnet",
              symbol: "HBAR",
              decimals: 18,
            },
            rpcUrls: [ELECTRONEUM_RPC_URL],
            blockExplorerUrls: [BLOCK_EXPLORER_URL],
          },
        ],
      });
    } catch (error) {
      console.error("Failed to add Electroneum network:", error);
      throw error;
    }
  };

  const switchToElectroneum = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${ELECTRONEUM_CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        await addElectroneumNetwork();
        await switchToElectroneum(); // Retry after adding
      } else {
        throw error;
      }
    }
  };

  const initializeProvider = async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    window.ethereum.on("chainChanged", handleChainChanged);
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    const address = await signer.getAddress();
    userAccount.value = address;
    connected.value = true;

    // Update wallet store
    walletStore.setConnectionStatus(true);
    walletStore.setUserAccount(address);
    walletStore.setChainId(ELECTRONEUM_CHAIN_ID);
    walletStore.setNetworkName("Hedera Testnet");

    initializeContracts();
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // First ensure we're on Electroneum network
        await switchToElectroneum();

        // Then request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Initialize provider after network is correct and accounts are accessible
        await initializeProvider();

        return { connected: connected.value, account: userAccount.value };
      } catch (error) {
        resetConnection();
        console.error("Wallet connection failed:", error);
        throw error;
      }
    } else {
      const currentUrl = encodeURIComponent(window.location.href);
      const metamaskAppDeepLink = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        ? `metamask://dapp/${window.location.host}?redirect=${currentUrl}`
        : `https://metamask.app.link/dapp/${window.location.host}?redirect=${currentUrl}`;

      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        window.location.href = metamaskAppDeepLink;
      } else {
        throw new Error("Please install MetaMask!");
      }
    }
  };

  const signInWithEthereum = async () => {
    if (!connected.value) throw new Error("Wallet not connected");

    const domain = window.location.host;
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const currentTime = new Date().toISOString();

    const message = `${domain} wants you to sign in with your Ethereum account:
${userAccount.value}

I accept the Terms of Service: https://${domain}/tos

URI: https://${domain}
Version: 1
Chain ID: ${ELECTRONEUM_CHAIN_ID}
Nonce: ${nonce}
Issued At: ${currentTime}`;

    try {
      const signature = await signer.signMessage(message);
      isAuthenticated.value = true;
      walletStore.setAuthenticationStatus(true);
      return signature;
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  };

  // Key derivation functions
  const deriveAndRegisterKeys = async () => {
    if (!connected.value) throw new Error("Wallet not connected");

    try {
      keyStore.setLoading(true);

      let cached = getCachedKeyDerivationSignature(userAccount.value);
      let keyDerivationResult;

      if (!cached) {
        keyDerivationResult = await performKeyDerivation(
          signer,
          userAccount.value,
          ELECTRONEUM_CHAIN_ID
        );
        cacheKeyDerivationSignature(
          userAccount.value,
          keyDerivationResult.signature,
          keyDerivationResult.version,
          keyDerivationResult.metadata
        );
        cached = {
          signature: keyDerivationResult.signature,
          keyVersion: keyDerivationResult.version,
          metadata: keyDerivationResult.metadata,
        };
      } else {
        keyDerivationResult = restoreKeyPairFromSignature(
          cached.signature,
          cached.keyVersion,
          cached.metadata
        );
      }

      keyStore.setUserKeyPair(keyDerivationResult);
      keyStore.setKeyDerivationSignature(cached.signature);
      keyStore.setKeyVersion(keyDerivationResult.version);

      const isRegistered = await checkKeyRegistration();
      if (!isRegistered) {
        await registerPublicKey(keyDerivationResult.x25519.publicKey);
        keyStore.setKeyRegistrationStatus(true);
      }

      return keyDerivationResult;
    } catch (error) {
      console.error("Key derivation failed:", error);
      keyStore.setError(`Key derivation failed: ${error.message}`);
      throw error;
    } finally {
      keyStore.setLoading(false);
    }
  };

  const registerPublicKey = async (publicKey) => {
    if (!KeyRegistryContractInstance)
      throw new Error("KeyRegistry contract not initialized");

    try {
      const publicKeyHex = "0x" + uint8ArrayToHex(publicKey);
      const tx = await KeyRegistryContractInstance.setEncryptionKey(
        publicKeyHex
      );

      // Add transaction to wallet store
      walletStore.addTransaction({
        hash: tx.hash,
        type: "key_registration",
        status: "pending",
        description: "Register encryption public key",
      });

      await tx.wait();

      // Update transaction status
      walletStore.addTransaction({
        hash: tx.hash,
        type: "key_registration",
        status: "confirmed",
        description: "Register encryption public key",
      });

      return tx.hash;
    } catch (error) {
      console.error("Public key registration failed:", error);
      throw error;
    }
  };

  const getPublicKey = async (address) => {
    if (!KeyRegistryContractInstance)
      throw new Error("KeyRegistry contract not initialized");

    try {
      // Check cache first
      const cached = keyStore.getCachedPublicKey(address);
      if (cached) return cached;

      // Fetch from blockchain
      const [publicKeyHex, version, isActive] =
        await KeyRegistryContractInstance.getEncryptionKey(address);

      if (publicKeyHex && publicKeyHex !== "0x" && isActive) {
        // Convert hex to Uint8Array
        const publicKeyBytes = new Uint8Array(
          publicKeyHex
            .slice(2)
            .match(/.{1,2}/g)
            .map((byte) => parseInt(byte, 16))
        );

        // Cache the public key
        keyStore.cachePublicKey(address, publicKeyBytes);

        return publicKeyBytes;
      }

      return null;
    } catch (error) {
      console.error("Failed to get public key:", error);
      return null;
    }
  };

  const checkKeyRegistration = async () => {
    if (!KeyRegistryContractInstance)
      throw new Error("KeyRegistry contract not initialized");

    try {
      const hasKey = await KeyRegistryContractInstance.hasEncryptionKey(
        userAccount.value
      );
      keyStore.setKeyRegistrationStatus(hasKey);
      return hasKey;
    } catch (error) {
      console.error("Failed to check key registration:", error);
      return false;
    }
  };

  // Load user files from mapping
  const loadUserFiles = async () => {
    if (!DataVaultContractInstance || !userAccount.value) {
      console.warn("Contract or user account not available");
      return [];
    }

    try {
      console.log("Loading files for user:", userAccount.value);

      // Directly get user's file IDs from the mapping
      const fileIds = await DataVaultContractInstance.getUserFiles(
        userAccount.value
      );
      console.log(`Found ${fileIds.length} files in mapping`);

      const files = [];

      for (const fileId of fileIds) {
        try {
          // Get detailed file info from the contract
          const fileInfo = await DataVaultContractInstance.getFileInfo(fileId);

          const file = {
            id: fileId,
            fileName: fileInfo.fileName,
            cid: fileInfo.cid,
            createdAt: new Date(
              Number(fileInfo.createdAt) * 1000
            ).toISOString(),
            keyVersion: Number(fileInfo.keyVersion),
            module: Number(fileInfo.module),
            moduleName: getModuleName(Number(fileInfo.module)),
            owner: fileInfo.owner,
            size: 0, // Size not available from contract, would need to fetch from IPFS
            type: "unknown", // Type not available from contract
            isEncrypted: true,
            accessCount: 0,
            lastAccessed: null,
          };

          files.push(file);
          console.log(
            "Loaded file:",
            file.fileName,
            "Module:",
            file.moduleName
          );
        } catch (error) {
          console.error("Error processing file:", error);
          // Continue with other files even if one fails
        }
      }

      console.log(`Successfully loaded ${files.length} files`);
      return files;
    } catch (error) {
      console.error("Error loading user files:", error);
      return [];
    }
  };

  // Load files shared with the current user from mapping
  const loadSharedFiles = async () => {
    if (!DataVaultContractInstance || !userAccount.value) {
      console.warn("Contract or user account not available");
      return [];
    }

    try {
      console.log("Loading shared files for user:", userAccount.value);

      // Directly get shared file IDs from the mapping
      const fileIds = await DataVaultContractInstance.getSharedFiles(
        userAccount.value
      );
      console.log(`Found ${fileIds.length} shared files in mapping`);

      const sharedFiles = [];

      for (const fileId of fileIds) {
        try {
          // Get detailed file info from the contract
          const fileInfo = await DataVaultContractInstance.getFileInfo(fileId);

          // Check if access is still valid (not expired)
          const [hasAccess, expiryTimestamp] =
            await DataVaultContractInstance.getAccessInfo(
              fileId,
              userAccount.value
            );

          if (!hasAccess) {
            console.log("Access no longer valid for file:", fileId);
            continue;
          }

          const now = Math.floor(Date.now() / 1000);
          if (expiryTimestamp > 0 && expiryTimestamp <= now) {
            console.log("Access expired for file:", fileId);
            continue;
          }

          const file = {
            id: fileId,
            fileName: fileInfo.fileName,
            cid: fileInfo.cid,
            createdAt: new Date(
              Number(fileInfo.createdAt) * 1000
            ).toISOString(),
            keyVersion: Number(fileInfo.keyVersion),
            module: Number(fileInfo.module),
            moduleName: getModuleName(Number(fileInfo.module)),
            owner: fileInfo.owner,
            sharedAt: new Date(Number(fileInfo.createdAt) * 1000).toISOString(),
            expiry:
              expiryTimestamp > 0
                ? new Date(Number(expiryTimestamp) * 1000).toISOString()
                : null,
            size: 0, // Size not available from contract
            type: "unknown", // Type not available from contract
            isEncrypted: true,
            canAccess: true,
            accessLevel: 1, // Default access level
            isActive: true,
          };

          sharedFiles.push(file);
          console.log(
            "Loaded shared file:",
            file.fileName,
            "from owner:",
            file.owner
          );
        } catch (error) {
          console.error("Error processing shared file:", error);
          // Continue with other files even if one fails
        }
      }

      console.log(`Successfully loaded ${sharedFiles.length} shared files`);
      return sharedFiles;
    } catch (error) {
      console.error("Error loading shared files:", error);
      return [];
    }
  };

  // Share a file with another user
  const shareFile = async (fileId, recipient, expiryTimestamp) => {
    if (!DataVaultContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    if (!KeyRegistryContractInstance) {
      throw new Error("KeyRegistry contract not available");
    }

    try {
      console.log("Sharing file:", { fileId, recipient, expiryTimestamp });

      // Check if recipient has encryption key registered
      const hasKey = await KeyRegistryContractInstance.hasEncryptionKey(
        recipient
      );
      if (!hasKey) {
        throw new Error(
          "Recipient has no encryption key registered. Please ask them to register their keys first."
        );
      }

      // Get recipient's public key
      const recipientPublicKey = await getPublicKey(recipient);
      if (!recipientPublicKey) {
        throw new Error("Failed to retrieve recipient's public key");
      }

      // Get user's encrypted file key from contract
      const encryptedFileKey =
        await DataVaultContractInstance.getEncryptedFileKey(
          fileId,
          userAccount.value
        );
      if (!encryptedFileKey || encryptedFileKey.length === 0) {
        throw new Error("File key not found or access denied");
      }

      // Convert encrypted file key to Uint8Array if needed
      let encryptedFileKeyBytes;
      if (encryptedFileKey instanceof Uint8Array) {
        encryptedFileKeyBytes = encryptedFileKey;
      } else if (typeof encryptedFileKey === "string") {
        encryptedFileKeyBytes = hexToUint8Array(encryptedFileKey);
      } else if (Array.isArray(encryptedFileKey)) {
        encryptedFileKeyBytes = new Uint8Array(encryptedFileKey);
      } else {
        throw new Error(
          `Unsupported encrypted file key format: ${typeof encryptedFileKey}`
        );
      }

      // Get user's private key for decryption
      const userKeyPair = keyStore.userKeyPair;
      if (!userKeyPair) {
        throw new Error("User encryption keys not available");
      }

      // Decrypt the file key with user's private key
      const fileKey = decryptFileKey(
        encryptedFileKeyBytes,
        userKeyPair.x25519.secretKey
      );

      // Re-encrypt the file key with recipient's public key
      const encryptedRecipientKey = encryptFileKey(
        fileKey,
        recipientPublicKey,
        userKeyPair.x25519.secretKey
      );

      // Share the file via contract (ethers handles Uint8Array for bytes parameters)
      const tx = await DataVaultContractInstance.shareFile(
        fileId,
        recipient,
        encryptedRecipientKey,
        expiryTimestamp
      );

      await tx.wait();

      console.log("File shared successfully");

      return tx;
    } catch (error) {
      console.error("Failed to share file:", error);
      throw error;
    }
  };

  // Revoke access to a file
  const revokeFileAccess = async (fileId, recipient) => {
    if (!DataVaultContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Revoking access:", { fileId, recipient });

      const tx = await DataVaultContractInstance.revokeAccess(
        fileId,
        recipient
      );

      await tx.wait();

      console.log("Access revoked successfully");

      // Update transaction in store
      walletStore.addTransaction({
        hash: tx.hash,
        type: "access_revoked",
        status: "confirmed",
        description: `Revoked access to file for ${recipient.slice(
          0,
          6
        )}...${recipient.slice(-4)}`,
      });

      return tx;
    } catch (error) {
      console.error("Failed to revoke access:", error);
      throw error;
    }
  };

  // Register as a provider
  const registerAsProvider = async () => {
    if (!ProviderRegistryContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Registering as provider");

      const tx = await ProviderRegistryContractInstance.registerProvider();

      await tx.wait();

      console.log("Successfully registered as provider");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "provider_registration",
        status: "confirmed",
        description: "Registered as healthcare provider",
      });

      return tx;
    } catch (error) {
      console.error("Failed to register as provider:", error);
      throw error;
    }
  };

  // Check if user is a registered provider
  const checkIfProvider = async () => {
    if (!ProviderRegistryContractInstance || !userAccount.value) {
      return false;
    }

    try {
      const isProvider = await ProviderRegistryContractInstance.checkProvider(
        userAccount.value
      );
      return isProvider;
    } catch (error) {
      console.error("Failed to check provider status:", error);
      return false;
    }
  };

  // Remove provider registration
  const removeProvider = async () => {
    if (!ProviderRegistryContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Removing provider registration");

      const tx = await ProviderRegistryContractInstance.removeProvider();

      await tx.wait();

      console.log("Successfully removed provider registration");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "provider_removal",
        status: "confirmed",
        description: "Removed provider registration",
      });

      return tx;
    } catch (error) {
      console.error("Failed to remove provider:", error);
      throw error;
    }
  };

  // IP Timestamping
  const timestampIP = async (fileId, documentHash, ipType, description) => {
    if (!IPSealModuleContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Timestamping IP:", { fileId, ipType, description });

      const tx = await IPSealModuleContractInstance.timestampIP(
        fileId,
        documentHash,
        ipType,
        description
      );

      await tx.wait();

      console.log("IP timestamped successfully");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "ip_timestamped",
        status: "confirmed",
        description: `Timestamped IP: ${ipType}`,
      });

      return tx;
    } catch (error) {
      console.error("Failed to timestamp IP:", error);
      throw error;
    }
  };

  // Get IP timestamp information
  const getIPTimestamp = async (fileId) => {
    if (!IPSealModuleContractInstance) {
      throw new Error("Contract not available");
    }

    try {
      const ipData = await IPSealModuleContractInstance.getIPTimestamp(fileId);
      return {
        documentHash: ipData[0],
        timestamp: Number(ipData[1]),
        ipType: ipData[2],
        description: ipData[3],
      };
    } catch (error) {
      console.error("Failed to get IP timestamp:", error);
      throw error;
    }
  };

  // Verify document integrity
  const verifyDocumentIntegrity = async (fileId, documentHash) => {
    if (!IPSealModuleContractInstance) {
      throw new Error("Contract not available");
    }

    try {
      const isValid =
        await IPSealModuleContractInstance.verifyDocumentIntegrity(
          fileId,
          documentHash
        );
      return isValid;
    } catch (error) {
      console.error("Failed to verify document integrity:", error);
      throw error;
    }
  };

  // Check if file has IP timestamp
  const hasIPTimestamp = async (fileId) => {
    if (!IPSealModuleContractInstance) {
      return false;
    }

    try {
      const hasTimestamp = await IPSealModuleContractInstance.hasIPTimestamp(
        fileId
      );
      return hasTimestamp;
    } catch (error) {
      console.error("Failed to check IP timestamp:", error);
      return false;
    }
  };

  // BioKey module access management
  const grantBioKeyAccess = async (
    fileId,
    recipient,
    encryptedKey,
    expiryTimestamp
  ) => {
    if (!BioKeyModuleContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Granting BioKey access:", { fileId, recipient });

      const tx = await BioKeyModuleContractInstance.grantAccess(
        fileId,
        recipient,
        encryptedKey,
        expiryTimestamp
      );

      await tx.wait();

      console.log("BioKey access granted successfully");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "biokey_access_granted",
        status: "confirmed",
        description: "Granted genomic data access",
      });

      return tx;
    } catch (error) {
      console.error("Failed to grant BioKey access:", error);
      throw error;
    }
  };

  // Revoke BioKey access
  const revokeBioKeyAccess = async (fileId, recipient) => {
    if (!BioKeyModuleContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Revoking BioKey access:", { fileId, recipient });

      const tx = await BioKeyModuleContractInstance.revokeAccess(
        fileId,
        recipient
      );

      await tx.wait();

      console.log("BioKey access revoked successfully");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "biokey_access_revoked",
        status: "confirmed",
        description: "Revoked genomic data access",
      });

      return tx;
    } catch (error) {
      console.error("Failed to revoke BioKey access:", error);
      throw error;
    }
  };

  // Check BioKey access
  const checkBioKeyAccess = async (fileId, user) => {
    if (!BioKeyModuleContractInstance) {
      return false;
    }

    try {
      const hasAccess = await BioKeyModuleContractInstance.checkAccess(
        fileId,
        user
      );
      return hasAccess;
    } catch (error) {
      console.error("Failed to check BioKey access:", error);
      return false;
    }
  };

  // MediVault emergency access
  const grantEmergencyAccess = async (fileId, encryptedProviderKey) => {
    if (!MediVaultModuleContractInstance || !userAccount.value) {
      throw new Error("Contract or user account not available");
    }

    try {
      console.log("Granting emergency access:", { fileId });

      const tx = await MediVaultModuleContractInstance.grantEmergencyAccess(
        fileId,
        encryptedProviderKey
      );

      await tx.wait();

      console.log("Emergency access granted successfully");

      walletStore.addTransaction({
        hash: tx.hash,
        type: "emergency_access_granted",
        status: "confirmed",
        description: "Granted emergency medical access",
      });

      return tx;
    } catch (error) {
      console.error("Failed to grant emergency access:", error);
      throw error;
    }
  };

  // Check emergency access status
  const hasEmergencyAccess = async (fileId, user) => {
    if (!MediVaultModuleContractInstance) {
      return false;
    }

    try {
      const hasEmergency =
        await MediVaultModuleContractInstance.hasEmergencyAccess(fileId, user);
      return hasEmergency;
    } catch (error) {
      console.error("Failed to check emergency access:", error);
      return false;
    }
  };

  // Helper function to get module name from module type
  const getModuleName = (moduleType) => {
    const moduleNames = {
      1: "BioKey",
      2: "MediVault",
      3: "IPSeal",
    };
    return moduleNames[moduleType] || "Unknown";
  };

  return {
    // Legacy reactive state (for backward compatibility)
    connected,
    userAccount,
    isAuthenticated,

    // Wallet connection functions
    connectWallet,
    signInWithEthereum,
    autoReconnect,
    manualReconnect,
    restoreKeysFromCache,

    // Key derivation functions
    deriveAndRegisterKeys,
    registerPublicKey,
    getPublicKey,
    checkKeyRegistration,

    // Contract getters
    getDataVaultContract: () => DataVaultContractInstance,
    getKeyRegistryContract: () => KeyRegistryContractInstance,
    getProviderRegistryContract: () => ProviderRegistryContractInstance,
    getBioKeyModuleContract: () => BioKeyModuleContractInstance,
    getIPSealModuleContract: () => IPSealModuleContractInstance,
    getMediVaultModuleContract: () => MediVaultModuleContractInstance,

    // File management functions
    loadUserFiles,
    loadSharedFiles,

    // File sharing function
    shareFile,

    // Access management functions
    revokeFileAccess,

    // Provider registration functions
    registerAsProvider,
    checkIfProvider,
    removeProvider,

    // IP timestamping functions
    timestampIP,
    getIPTimestamp,
    verifyDocumentIntegrity,
    hasIPTimestamp,

    // BioKey module functions
    grantBioKeyAccess,
    revokeBioKeyAccess,
    checkBioKeyAccess,

    // Emergency access functions
    grantEmergencyAccess,
    hasEmergencyAccess,

    // Store access
    walletStore,
    keyStore,
  };
};
