import { ref } from "vue";
import { ethers } from "ethers";
import {
  Research_CONTRACT_ADDRESS,
  Research_CONTRACT_ABI,
} from "../constants/ResearchContract";
import {
  Question_CONTRACT_ADDRESS,
  Question_CONTRACT_ABI,
} from "../constants/QuestionContract";
import {
  Proposal_CONTRACT_ADDRESS,
  Proposal_CONTRACT_ABI,
} from "../constants/ProposalContract";
import {
  ICO_CONTRACT_ADDRESS,
  ICO_CONTRACT_ABI,
} from "../constants/ICOContract";
import {
  ResearchGroup_CONTRACT_ADDRESS,
  ResearchGroup_CONTRACT_ABI,
} from "../constants/ResearchGroupContract";

// Network Configuration for electroneum
const ELECTRONEUM_CHAIN_ID = 296;
const ELECTRONEUM_RPC_URL = "https://testnet.hashio.io/api";
const BLOCK_EXPLORER_URL = "https://hashscan.io/testnet";

// Ethereum Objects
let provider = null;
let signer = null;

// Contract Instances
let ResearchContractInstance = null;
let QuestionContractInstance = null;
let ProposalContractInstance = null;
let ICOContractInstance = null;
let ResearchGroupContractInstance = null;

// Reactive State
const connected = ref(false);
const userAccount = ref("");
const isAuthenticated = ref(false);

// Helper Functions
const initializeContracts = () => {
  ResearchContractInstance = new ethers.Contract(
    Research_CONTRACT_ADDRESS,
    Research_CONTRACT_ABI,
    signer
  );
  QuestionContractInstance = new ethers.Contract(
    Question_CONTRACT_ADDRESS,
    Question_CONTRACT_ABI,
    signer
  );
  ProposalContractInstance = new ethers.Contract(
    Proposal_CONTRACT_ADDRESS,
    Proposal_CONTRACT_ABI,
    signer
  );
  ICOContractInstance = new ethers.Contract(
    ICO_CONTRACT_ADDRESS,
    ICO_CONTRACT_ABI,
    signer
  );
  ResearchGroupContractInstance = new ethers.Contract(
    ResearchGroup_CONTRACT_ADDRESS,
    ResearchGroup_CONTRACT_ABI,
    signer
  );
};

const resetConnection = () => {
  provider = null;
  signer = null;
  connected.value = false;
  userAccount.value = "";
  ResearchContractInstance = null;
  QuestionContractInstance = null;
  ProposalContractInstance = null;
  ICOContractInstance = null;
  ResearchGroupContractInstance = null;
};

export const useWallet = () => {
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

    userAccount.value = await signer.getAddress();
    connected.value = true;
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
      return signature;
    } catch (error) {
      console.error("Sign-in failed:", error);
      throw error;
    }
  };

  return {
    connected,
    userAccount,
    isAuthenticated,
    connectWallet,
    signInWithEthereum,
    getResearchContract: () => ResearchContractInstance,
    getQuestionContract: () => QuestionContractInstance,
    getProposalContract: () => ProposalContractInstance,
    getICOContract: () => ICOContractInstance,
    getResearchGroupContract: () => ResearchGroupContractInstance,
  };
};
