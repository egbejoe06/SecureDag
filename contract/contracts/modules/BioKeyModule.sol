// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IBioKey.sol";
import "../DataVault.sol";
import "../KeyRegistry.sol";

/**
 * @title BioKeyModule
 * @dev Genomic data sharing module for SecureDAG platform
 * @notice Handles file sharing for genomic data with access control and encrypted key management
 */
contract BioKeyModule is ReentrancyGuard, Ownable, IBioKey {
    
    // Core DataVault contract reference
    DataVault public dataVault;
    
    // KeyRegistry contract reference
    KeyRegistry public keyRegistry;
    
    // Access control mapping for genomic files
    mapping(bytes32 => mapping(address => bool)) public hasAccess;
    
    // Events
    event DataVaultUpdated(address indexed newDataVault);
    event KeyRegistryUpdated(address indexed newKeyRegistry);
    
    // Modifiers
    modifier fileExists(bytes32 fileId) {
        (address owner,,,,,) = dataVault.getFileInfo(fileId);
        require(owner != address(0), "BioKeyModule: File does not exist");
        _;
    }
    
    modifier onlyFileOwner(bytes32 fileId) {
        (address owner,,,,,) = dataVault.getFileInfo(fileId);
        require(owner == msg.sender, "BioKeyModule: Not file owner");
        _;
    }
    
    constructor(address _dataVault, address _keyRegistry) ReentrancyGuard() Ownable(msg.sender) {
        dataVault = DataVault(_dataVault);
        keyRegistry = KeyRegistry(_keyRegistry);
    }
    
    /**
     * @dev Grant access to genomic data file with encrypted key management
     * @param fileId File identifier
     * @param recipient Recipient address
     * @param encryptedRecipientKey Encrypted file key for recipient
     * @param expiryTimestamp Expiry timestamp (0 = no expiry)
     */
    function grantAccess(
        bytes32 fileId,
        address recipient,
        bytes calldata encryptedRecipientKey,
        uint256 expiryTimestamp
    ) external nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(recipient != address(0), "BioKeyModule: Invalid recipient");
        require(encryptedRecipientKey.length > 0, "BioKeyModule: Invalid encrypted key");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "BioKeyModule: Invalid expiry");
        
        // Check if recipient has encryption key registered
        require(keyRegistry.hasEncryptionKey(recipient), "BioKeyModule: Recipient has no encryption key");
        
        // Grant access through DataVault with encrypted key management
        dataVault.shareFileByModule(fileId, msg.sender, recipient, encryptedRecipientKey, expiryTimestamp);
        
        hasAccess[fileId][recipient] = true;
        emit AccessGranted(fileId, recipient);
    }
    
    /**
     * @dev Grant access to genomic data file (simplified interface for backward compatibility)
     * @param fileId File identifier
     * @param recipient Recipient address
     * @param encKeyForRecipient Encrypted file key for recipient
     */
    function grantAccess(
        bytes32 fileId,
        address recipient,
        bytes calldata encKeyForRecipient
    ) external override nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(recipient != address(0), "BioKeyModule: Invalid recipient");
        require(encKeyForRecipient.length > 0, "BioKeyModule: Invalid encrypted key");
        
        // Check if recipient has encryption key registered
        require(keyRegistry.hasEncryptionKey(recipient), "BioKeyModule: Recipient has no encryption key");
        
        // Grant access through DataVault with encrypted key management
        dataVault.shareFileByModule(fileId, msg.sender, recipient, encKeyForRecipient, 0);
        
        hasAccess[fileId][recipient] = true;
        emit AccessGranted(fileId, recipient);
    }
    
    /**
     * @dev Revoke access to genomic data file
     * @param fileId File identifier
     * @param recipient Recipient address
     */
    function revokeAccess(
        bytes32 fileId,
        address recipient
    ) external override nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(hasAccess[fileId][recipient], "BioKeyModule: Access not granted");
        
        dataVault.revokeAccessByModule(fileId, msg.sender, recipient);
        hasAccess[fileId][recipient] = false;
        emit AccessRevoked(fileId, recipient);
    }
    
    /**
     * @dev Check if user has access to file
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     */
    function checkAccess(bytes32 fileId, address user) 
        external 
        view 
        override
        fileExists(fileId) 
        returns (bool hasFileAccess) 
    {
        return hasAccess[fileId][user] && dataVault.hasValidAccess(fileId, user);
    }
    
    /**
     * @dev Get encrypted file key for a user
     * @param fileId File identifier
     * @param user User address
     * @return encryptedKey Encrypted file key
     */
    function getEncryptedFileKey(bytes32 fileId, address user) 
        external 
        view 
        fileExists(fileId) 
        returns (bytes memory encryptedKey) 
    {
        require(hasAccess[fileId][user], "BioKeyModule: No access");
        return dataVault.getEncryptedFileKey(fileId, user);
    }
    
    /**
     * @dev Get access information for a user
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     * @return expiryTimestamp Expiry timestamp
     */
    function getAccessInfo(bytes32 fileId, address user) 
        external 
        view 
        fileExists(fileId) 
        returns (
            bool hasFileAccess,
            uint256 expiryTimestamp
        ) 
    {
        return dataVault.getAccessInfo(fileId, user);
    }
    
    /**
     * @dev Update DataVault contract address
     * @param _dataVault New DataVault contract address
     */
    function updateDataVault(address _dataVault) external onlyOwner {
        require(_dataVault != address(0), "BioKeyModule: Invalid address");
        dataVault = DataVault(_dataVault);
        emit DataVaultUpdated(_dataVault);
    }
    
    /**
     * @dev Update KeyRegistry contract address
     * @param _keyRegistry New KeyRegistry contract address
     */
    function updateKeyRegistry(address _keyRegistry) external onlyOwner {
        require(_keyRegistry != address(0), "BioKeyModule: Invalid address");
        keyRegistry = KeyRegistry(_keyRegistry);
        emit KeyRegistryUpdated(_keyRegistry);
    }
}