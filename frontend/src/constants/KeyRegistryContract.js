export const KEY_REGISTRY_CONTRACT_ADDRESS =
  "0x459A204007F4ce833BbED148A9842214bf03E22F";

export const KEY_REGISTRY_CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "EncryptionKeyDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "EncryptionKeyReactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "EncryptionKeySet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "newPublicKey",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newVersion",
        type: "uint256",
      },
    ],
    name: "EncryptionKeyUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "deactivateEncryptionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "encryptionKeys",
    outputs: [
      {
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastUpdated",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getEncryptionKey",
    outputs: [
      {
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getKeyInfo",
    outputs: [
      {
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastUpdated",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getKeyVersion",
    outputs: [
      {
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasAnyEncryptionKey",
    outputs: [
      {
        internalType: "bool",
        name: "hasAnyKey",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasEncryptionKey",
    outputs: [
      {
        internalType: "bool",
        name: "hasKey",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reactivateEncryptionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
    ],
    name: "setEncryptionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "newPublicKey",
        type: "bytes",
      },
    ],
    name: "updateEncryptionKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
