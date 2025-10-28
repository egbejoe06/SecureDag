export const MEDI_VAULT_MODULE_CONTRACT_ADDRESS =
  "0xDBb98E347C4413591e3dCA3c97aB9dD19E8BC7A2";

export const MEDI_VAULT_MODULE_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_dataVault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_keyRegistry",
        type: "address",
      },
      {
        internalType: "address",
        name: "_providerRegistry",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
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
        internalType: "bytes32",
        name: "fileId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "keyVersion",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "module",
        type: "uint8",
      },
    ],
    name: "FileUploaded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "fileId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newKeyVersion",
        type: "uint256",
      },
    ],
    name: "KeyRotated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "dataVault",
    outputs: [
      {
        internalType: "contract DataVault",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "generateFileId",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "fileId",
        type: "bytes32",
      },
    ],
    name: "getFileInfo",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "createdAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "keyVersion",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "module",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "fileName",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "keyRegistry",
    outputs: [
      {
        internalType: "contract KeyRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "providerRegistry",
    outputs: [
      {
        internalType: "contract ProviderRegistry",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "fileId",
        type: "bytes32",
      },
      {
        internalType: "bytes[]",
        name: "newEncryptedKeys",
        type: "bytes[]",
      },
      {
        internalType: "address[]",
        name: "recipients",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "newKeyVersion",
        type: "uint256",
      },
    ],
    name: "rotateFileKey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "fileId",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "encryptedRecipientKey",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "expiryTimestamp",
        type: "uint256",
      },
    ],
    name: "shareFile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dataVault",
        type: "address",
      },
    ],
    name: "updateDataVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_keyRegistry",
        type: "address",
      },
    ],
    name: "updateKeyRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_providerRegistry",
        type: "address",
      },
    ],
    name: "updateProviderRegistry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "encryptedOwnerKey",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "keyVersion",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "fileName",
        type: "string",
      },
    ],
    name: "uploadFile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
