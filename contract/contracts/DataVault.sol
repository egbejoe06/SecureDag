// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KeyRegistry.sol";

/**
 * @title DataVault
 * @dev Core contract for SecureDAG platform - encrypted file storage and sharing
 * @notice Handles file uploads, access control, and sharing mechanisms with encrypted key management
 */
contract DataVault is ReentrancyGuard, Ownable {
    
    // File structure containing metadata
    struct FileInfo {
        address owner;
        string cid;           // IPFS CID
        uint256 createdAt;
        uint256 keyVersion;   // Version of encryption key
        uint8 module;        // Module type: 0=MediVault, 1=BioKey, 2=IPSeal
        string fileName;     // User-friendly file name
    }
    
    // Access control mapping for file permissions
    mapping(bytes32 => mapping(address => bool)) public hasAccess;
    
    // Encrypted file keys for each recipient
    mapping(bytes32 => mapping(address => bytes)) public encryptedFileKeys;
    
    // Access expiry timestamps (0 = no expiry)
    mapping(bytes32 => mapping(address => uint256)) public accessExpiry;
    
    // Access levels (0=read, 1=read+download, 2=full access)
    mapping(bytes32 => mapping(address => uint8)) public accessLevels;
    
    // State variables
    mapping(bytes32 => FileInfo) public files;
    
    // Track files owned by each user
    mapping(address => bytes32[]) public userFiles;
    
    // Track files shared with each user
    mapping(address => bytes32[]) public sharedFiles;
    
    // Track indices for efficient removal
    mapping(address => mapping(bytes32 => uint256)) public sharedFileIndex;
    
    // KeyRegistry contract reference
    KeyRegistry public keyRegistry;
    
    // Events
    event FileUploaded(
        bytes32 indexed fileId,
        address indexed owner,
        string cid,
        uint256 timestamp,
        uint256 keyVersion,
        uint8 module
    );
    
    event AccessGranted(
        bytes32 indexed fileId,
        address indexed recipient,
        uint256 expiry
    );
    
    event AccessRevoked(
        bytes32 indexed fileId,
        address indexed recipient
    );
    
    event KeyRotated(
        bytes32 indexed fileId,
        address indexed owner,
        uint256 newKeyVersion
    );
    
    // Modifiers
    modifier onlyFileOwner(bytes32 fileId) {
        require(files[fileId].owner == msg.sender, "DataVault: Not file owner");
        _;
    }
    
    modifier fileExists(bytes32 fileId) {
        require(files[fileId].owner != address(0), "DataVault: File does not exist");
        _;
    }
    
    constructor(address _keyRegistry) ReentrancyGuard() Ownable(msg.sender) {
        keyRegistry = KeyRegistry(_keyRegistry);
    }
    
    /**
     * @dev Helper function to remove a file from sharedFiles mapping efficiently
     * @param user User address
     * @param fileId File ID to remove
     */
    function _removeSharedFile(address user, bytes32 fileId) private {
        uint256 index = sharedFileIndex[user][fileId];
        uint256 lastIndex = sharedFiles[user].length - 1;
        
        if (index != lastIndex) {
            bytes32 lastFileId = sharedFiles[user][lastIndex];
            sharedFiles[user][index] = lastFileId;
            sharedFileIndex[user][lastFileId] = index;
        }
        
        sharedFiles[user].pop();
        delete sharedFileIndex[user][fileId];
    }
    
    /**
     * @dev Upload a file to the vault with encrypted key management
     * @param fileId Unique file identifier
     * @param cid IPFS content identifier
     * @param encryptedOwnerKey Encrypted file key for the owner
     * @param keyVersion Version of the encryption key
     * @param module Module type (0=MediVault, 1=BioKey, 2=IPSeal)
     * @param fileName User-friendly file name
     */
    function uploadFile(
        bytes32 fileId,
        string calldata cid,
        bytes calldata encryptedOwnerKey,
        uint256 keyVersion,
        uint8 module,
        string calldata fileName
    ) external nonReentrant {
        require(files[fileId].owner == address(0), "DataVault: File already exists");
        require(bytes(cid).length > 0, "DataVault: Invalid CID");
        require(encryptedOwnerKey.length > 0, "DataVault: Invalid encrypted key");
        require(module <= 2, "DataVault: Invalid module");
        
        files[fileId] = FileInfo({
            owner: msg.sender,
            cid: cid,
            createdAt: block.timestamp,
            keyVersion: keyVersion,
            module: module,
            fileName: fileName
        });
        
        // Owner automatically has access with full permissions
        hasAccess[fileId][msg.sender] = true;
        encryptedFileKeys[fileId][msg.sender] = encryptedOwnerKey;
        accessExpiry[fileId][msg.sender] = 0; // No expiry for owner
        accessLevels[fileId][msg.sender] = 2; // Full access
        
        // Add to user's file list
        userFiles[msg.sender].push(fileId);
        
        emit FileUploaded(fileId, msg.sender, cid, block.timestamp, keyVersion, module);
    }
    
    /**
     * @dev Share a file with another user with encrypted key management
     * @param fileId File identifier
     * @param recipient Recipient address
     * @param encryptedRecipientKey Encrypted file key for the recipient
     * @param expiryTimestamp Expiry timestamp (0 = no expiry)
     */
    function shareFile(
        bytes32 fileId,
        address recipient,
        bytes calldata encryptedRecipientKey,
        uint256 expiryTimestamp
    ) external nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(recipient != address(0), "DataVault: Invalid recipient");
        require(!hasAccess[fileId][recipient], "DataVault: Already has access");
        require(encryptedRecipientKey.length > 0, "DataVault: Invalid encrypted key");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "DataVault: Invalid expiry");
        
        // Check if recipient has encryption key registered
        require(keyRegistry.hasEncryptionKey(recipient), "DataVault: Recipient has no encryption key");
        
        hasAccess[fileId][recipient] = true;
        encryptedFileKeys[fileId][recipient] = encryptedRecipientKey;
        accessExpiry[fileId][recipient] = expiryTimestamp;
        
        // Add to recipient's shared files list
        sharedFileIndex[recipient][fileId] = sharedFiles[recipient].length;
        sharedFiles[recipient].push(fileId);
        
        emit AccessGranted(fileId, recipient, expiryTimestamp);
    }
    
    /**
     * @dev Share a file with another user (called by modules on behalf of file owners)
     * @param fileId File identifier
     * @param fileOwner Address of the file owner
     * @param recipient Recipient address
     * @param encryptedRecipientKey Encrypted file key for the recipient
     * @param expiryTimestamp Expiry timestamp (0 = no expiry)
     */
    function shareFileByModule(
        bytes32 fileId,
        address fileOwner,
        address recipient,
        bytes calldata encryptedRecipientKey,
        uint256 expiryTimestamp
    ) external nonReentrant fileExists(fileId) {
        require(files[fileId].owner == fileOwner, "DataVault: Not file owner");
        require(recipient != address(0), "DataVault: Invalid recipient");
        require(!hasAccess[fileId][recipient], "DataVault: Already has access");
        require(encryptedRecipientKey.length > 0, "DataVault: Invalid encrypted key");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "DataVault: Invalid expiry");
        
        // Check if recipient has encryption key registered
        require(keyRegistry.hasEncryptionKey(recipient), "DataVault: Recipient has no encryption key");
        
        hasAccess[fileId][recipient] = true;
        encryptedFileKeys[fileId][recipient] = encryptedRecipientKey;
        accessExpiry[fileId][recipient] = expiryTimestamp;
        
        // Add to recipient's shared files list
        sharedFileIndex[recipient][fileId] = sharedFiles[recipient].length;
        sharedFiles[recipient].push(fileId);
        
        emit AccessGranted(fileId, recipient, expiryTimestamp);
    }
    
    /**
     * @dev Revoke access to a file (called by modules on behalf of file owners)
     * @param fileId File identifier
     * @param fileOwner Address of the file owner
     * @param recipient Recipient address
     */
    function revokeAccessByModule(
        bytes32 fileId,
        address fileOwner,
        address recipient
    ) external nonReentrant fileExists(fileId) {
        require(files[fileId].owner == fileOwner, "DataVault: Not file owner");
        require(hasAccess[fileId][recipient], "DataVault: No access to revoke");
        
        hasAccess[fileId][recipient] = false;
        delete encryptedFileKeys[fileId][recipient];
        delete accessExpiry[fileId][recipient];
        delete accessLevels[fileId][recipient];
        
        // Remove from recipient's shared files list
        _removeSharedFile(recipient, fileId);
        
        emit AccessRevoked(fileId, recipient);
    }
    
    /**
     * @dev Revoke access to a file
     * @param fileId File identifier
     * @param recipient Recipient address
     */
    function revokeAccess(bytes32 fileId, address recipient) external nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(hasAccess[fileId][recipient], "DataVault: No access to revoke");
        
        hasAccess[fileId][recipient] = false;
        delete encryptedFileKeys[fileId][recipient];
        delete accessExpiry[fileId][recipient];
        delete accessLevels[fileId][recipient];
        
        // Remove from recipient's shared files list
        _removeSharedFile(recipient, fileId);
        
        emit AccessRevoked(fileId, recipient);
    }
    
    /**
     * @dev Rotate file encryption key (for security)
     * @param fileId File identifier
     * @param newEncryptedKeys Array of new encrypted keys for all current recipients
     * @param newKeyVersion New key version
     */
    function rotateFileKey(
        bytes32 fileId,
        bytes[] calldata newEncryptedKeys,
        address[] calldata recipients,
        uint256 newKeyVersion
    ) external nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(newEncryptedKeys.length == recipients.length, "DataVault: Array length mismatch");
        require(newKeyVersion > files[fileId].keyVersion, "DataVault: Invalid key version");
        
        // Update key version
        files[fileId].keyVersion = newKeyVersion;
        
        // Update encrypted keys for all recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            require(hasAccess[fileId][recipients[i]], "DataVault: Recipient has no access");
            require(newEncryptedKeys[i].length > 0, "DataVault: Invalid encrypted key");
            
            encryptedFileKeys[fileId][recipients[i]] = newEncryptedKeys[i];
        }
        
        emit KeyRotated(fileId, msg.sender, newKeyVersion);
    }
    
    /**
     * @dev Get encrypted file key for a user
     * @param fileId File identifier
     * @param user User address
     * @return encryptedKey Encrypted file key
     */
    function getEncryptedFileKey(bytes32 fileId, address user) external view fileExists(fileId) returns (bytes memory encryptedKey) {
        require(hasAccess[fileId][user], "DataVault: No access");
        require(accessExpiry[fileId][user] == 0 || accessExpiry[fileId][user] > block.timestamp, "DataVault: Access expired");
        
        return encryptedFileKeys[fileId][user];
    }
    
    /**
     * @dev Check if user has valid access (not expired)
     * @param fileId File identifier
     * @param user User address
     * @return hasValidAccess Whether user has valid access
     */
    function hasValidAccess(bytes32 fileId, address user) external view fileExists(fileId) returns (bool) {
        if (!hasAccess[fileId][user]) return false;
        if (accessExpiry[fileId][user] > 0 && accessExpiry[fileId][user] <= block.timestamp) return false;
        return true;
    }
    
    /**
     * @dev Get file information
     * @param fileId File identifier
     * @return owner File owner
     * @return cid IPFS CID
     * @return createdAt Creation timestamp
     * @return keyVersion Key version
     * @return module Module type
     * @return fileName User-friendly file name
     */
    function getFileInfo(bytes32 fileId) external view fileExists(fileId) returns (
        address owner,
        string memory cid,
        uint256 createdAt,
        uint256 keyVersion,
        uint8 module,
        string memory fileName
    ) {
        FileInfo memory file = files[fileId];
        return (file.owner, file.cid, file.createdAt, file.keyVersion, file.module, file.fileName);
    }
    
    /**
     * @dev Get access information for a user
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     * @return expiryTimestamp Expiry timestamp
     */
    function getAccessInfo(bytes32 fileId, address user) external view fileExists(fileId) returns (
        bool hasFileAccess,
        uint256 expiryTimestamp
    ) {
        return (hasAccess[fileId][user], accessExpiry[fileId][user]);
    }
    
    /**
     * @dev Update KeyRegistry contract address
     * @param _keyRegistry New KeyRegistry contract address
     */
    function updateKeyRegistry(address _keyRegistry) external onlyOwner {
        require(_keyRegistry != address(0), "DataVault: Invalid address");
        keyRegistry = KeyRegistry(_keyRegistry);
    }
    
    /**
     * @dev Get all file IDs owned by a user
     * @param user User address
     * @return Array of file IDs
     */
    function getUserFiles(address user) external view returns (bytes32[] memory) {
        return userFiles[user];
    }
    
    /**
     * @dev Get all file IDs shared with a user
     * @param user User address
     * @return Array of file IDs
     */
    function getSharedFiles(address user) external view returns (bytes32[] memory) {
        return sharedFiles[user];
    }
    
    /**
     * @dev Get count of files owned by a user
     * @param user User address
     * @return Count of files
     */
    function getUserFileCount(address user) external view returns (uint256) {
        return userFiles[user].length;
    }
    
    /**
     * @dev Get count of files shared with a user
     * @param user User address
     * @return Count of shared files
     */
    function getSharedFileCount(address user) external view returns (uint256) {
        return sharedFiles[user].length;
    }
    
    /**
     * @dev Generate file ID from owner and CID
     * @param owner File owner
     * @param cid IPFS CID
     * @return fileId Generated file ID
     */
    function generateFileId(address owner, string calldata cid) external pure returns (bytes32) {
        return keccak256(abi.encode(owner, cid));
    }
}

