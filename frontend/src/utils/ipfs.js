import axios from "axios";

/**
 * IPFS utilities for SecureDAG platform using Pinata
 * Handles file upload/download to IPFS via Pinata API
 */

const PINATA_API_KEY = import.meta.env.VITE_Pinata_api_key;
const PINATA_SECRET_KEY = import.meta.env.VITE_Pinata_api_secret;
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a file to IPFS via Pinata
 * @param {File|Uint8Array} fileData - File data to upload
 * @param {string} fileName - Name of the file
 * @param {Object} metadata - Optional metadata object
 * @returns {Promise<Object>} Pinata response with IPFS hash
 */
export async function uploadToIPFS(fileData, fileName, metadata = {}) {
  try {
    // Convert file data to FormData
    const formData = new FormData();

    if (fileData instanceof File) {
      formData.append("file", fileData);
    } else {
      // Convert Uint8Array to Blob
      const blob = new Blob([fileData], { type: "application/octet-stream" });
      formData.append("file", blob, fileName);
    }

    // Add metadata
    const pinataMetadata = {
      name: fileName,
      keyvalues: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        platform: "SecureDAG",
      },
    };

    formData.append("pinataMetadata", JSON.stringify(pinataMetadata));

    // Add pinata options
    const pinataOptions = {
      cidVersion: 1,
      wrapWithDirectory: false,
    };

    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp,
    };
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(
      `Failed to upload file to IPFS: ${
        error.response?.data?.error || error.message
      }`
    );
  }
}

/**
 * Download a file from IPFS via Pinata gateway
 * @param {string} ipfsHash - IPFS hash (CID) of the file
 * @returns {Promise<Uint8Array>} File data as Uint8Array
 */
export async function downloadFromIPFS(ipfsHash) {
  try {
    const url = `${PINATA_GATEWAY}${ipfsHash}`;
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 second timeout
    });

    return new Uint8Array(response.data);
  } catch (error) {
    console.error("Error downloading from IPFS:", error);
    throw new Error(`Failed to download file from IPFS: ${error.message}`);
  }
}

/**
 * Get file metadata from Pinata
 * @param {string} ipfsHash - IPFS hash (CID) of the file
 * @returns {Promise<Object>} File metadata
 */
export async function getFileMetadata(ipfsHash) {
  try {
    const response = await axios.get(
      `https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    if (response.data.rows && response.data.rows.length > 0) {
      return response.data.rows[0];
    }

    return null;
  } catch (error) {
    console.error("Error fetching file metadata:", error);
    return null;
  }
}

/**
 * Pin a file to Pinata (ensure it stays pinned)
 * @param {string} ipfsHash - IPFS hash (CID) of the file
 * @param {string} fileName - Name of the file
 * @returns {Promise<Object>} Pinata response
 */
export async function pinFile(ipfsHash, fileName) {
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinByHash",
      {
        hashToPin: ipfsHash,
        pinataMetadata: {
          name: fileName,
          keyvalues: {
            pinnedAt: new Date().toISOString(),
            platform: "SecureDAG",
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error pinning file:", error);
    throw new Error(
      `Failed to pin file: ${error.response?.data?.error || error.message}`
    );
  }
}

/**
 * Unpin a file from Pinata
 * @param {string} ipfsHash - IPFS hash (CID) of the file
 * @returns {Promise<Object>} Pinata response
 */
export async function unpinFile(ipfsHash) {
  try {
    const response = await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error unpinning file:", error);
    throw new Error(
      `Failed to unpin file: ${error.response?.data?.error || error.message}`
    );
  }
}

/**
 * Get Pinata account info
 * @returns {Promise<Object>} Account information
 */
export async function getAccountInfo() {
  try {
    const response = await axios.get(
      "https://api.pinata.cloud/data/userPinList",
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw new Error(`Failed to fetch account info: ${error.message}`);
  }
}

/**
 * Validate IPFS hash format
 * @param {string} hash - IPFS hash to validate
 * @returns {boolean} True if hash is valid
 */
export function isValidIPFSHash(hash) {
  // Basic validation for IPFS hashes
  // CID v0: Qm... (46 characters)
  // CID v1: bafy... (starts with bafy, bafk, etc.)
  const cidV0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidV1Pattern = /^bafy[a-z2-7]{52}$/;

  return cidV0Pattern.test(hash) || cidV1Pattern.test(hash);
}

/**
 * Get IPFS gateway URL for a hash
 * @param {string} ipfsHash - IPFS hash
 * @returns {string} Gateway URL
 */
export function getGatewayURL(ipfsHash) {
  return `${PINATA_GATEWAY}${ipfsHash}`;
}
