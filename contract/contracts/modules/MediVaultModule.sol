// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../DataVault.sol";
import "../KeyRegistry.sol";
import "../ProviderRegistry.sol";

/**
 * @title MediVaultModule
 * @dev Medical file sharing module for SecureDAG platform with emergency access
 * @notice Handles medical file access control, sharing, and emergency access for healthcare providers
 */
contract MediVaultModule is ReentrancyGuard, Ownable {
    
    // Core DataVault contract reference
    DataVault public dataVault;
    
    // KeyRegistry contract reference
    KeyRegistry public keyRegistry;
    
    // ProviderRegistry contract reference
    ProviderRegistry public providerRegistry;
    
    // Access control mapping for medical files
    mapping(bytes32 => mapping(address => bool)) public hasAccess;
    
    // Emergency access tracking
    mapping(bytes32 => mapping(address => uint256)) public emergencyAccessGranted;
    
    // Emergency access duration (24-48 hours in seconds)
    uint256 public constant EMERGENCY_ACCESS_DURATION = 48 hours;
    
    // Events
    event AccessGranted(
        bytes32 indexed fileId,
        address indexed recipient,
        uint256 expiry
    );
    
    event AccessRevoked(
        bytes32 indexed fileId,
        address indexed recipient
    );
    
    event EmergencyAccessGranted(
        bytes32 indexed fileId,
        address indexed provider,
        uint256 timestamp,
        uint256 expiry
    );
    
    event DataVaultUpdated(address indexed newDataVault);
    event KeyRegistryUpdated(address indexed newKeyRegistry);
    event ProviderRegistryUpdated(address indexed newProviderRegistry);
    
    // Modifiers
    modifier fileExists(bytes32 fileId) {
        (address owner,,,,,) = dataVault.getFileInfo(fileId);
        require(owner != address(0), "MediVaultModule: File does not exist");
        _;
    }
    
    modifier onlyFileOwner(bytes32 fileId) {
        (address owner,,,,,) = dataVault.getFileInfo(fileId);
        require(owner == msg.sender, "MediVaultModule: Not file owner");
        _;
    }
    
    modifier onlyVerifiedProvider() {
        require(providerRegistry.checkProvider(msg.sender), "MediVaultModule: Not a verified provider");
        _;
    }
    
    constructor(
        address _dataVault,
        address _keyRegistry,
        address _providerRegistry
    ) ReentrancyGuard() Ownable(msg.sender) {
        dataVault = DataVault(_dataVault);
        keyRegistry = KeyRegistry(_keyRegistry);
        providerRegistry = ProviderRegistry(_providerRegistry);
    }
    
    /**
     * @dev Grant access to medical file with encrypted key management
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
        require(recipient != address(0), "MediVaultModule: Invalid recipient");
        require(encryptedRecipientKey.length > 0, "MediVaultModule: Invalid encrypted key");
        require(expiryTimestamp == 0 || expiryTimestamp > block.timestamp, "MediVaultModule: Invalid expiry");
        
        // Check if recipient has encryption key registered
        require(keyRegistry.hasEncryptionKey(recipient), "MediVaultModule: Recipient has no encryption key");
        
        // Grant access through DataVault with encrypted key management
        dataVault.shareFileByModule(fileId, msg.sender, recipient, encryptedRecipientKey, expiryTimestamp);
        
        hasAccess[fileId][recipient] = true;
        emit AccessGranted(fileId, recipient, expiryTimestamp);
    }
    
    /**
     * @dev Grant emergency access to medical file for verified healthcare providers
     * @param fileId File identifier
     * @param encryptedProviderKey Encrypted file key for the provider
     */
    function grantEmergencyAccess(
        bytes32 fileId,
        bytes calldata encryptedProviderKey
    ) external nonReentrant onlyVerifiedProvider fileExists(fileId) {
        require(encryptedProviderKey.length > 0, "MediVaultModule: Invalid encrypted key");
        
        // Check if provider has encryption key registered
        require(keyRegistry.hasEncryptionKey(msg.sender), "MediVaultModule: Provider has no encryption key");
        
        uint256 expiryTimestamp = block.timestamp + EMERGENCY_ACCESS_DURATION;
        
        // Get file owner for emergency access
        (address fileOwner,,,,,) = dataVault.getFileInfo(fileId);
        
        // Grant emergency access through DataVault
        dataVault.shareFileByModule(fileId, fileOwner, msg.sender, encryptedProviderKey, expiryTimestamp);
        
        hasAccess[fileId][msg.sender] = true;
        emergencyAccessGranted[fileId][msg.sender] = block.timestamp;
        
        emit EmergencyAccessGranted(fileId, msg.sender, block.timestamp, expiryTimestamp);
    }
    
    /**
     * @dev Revoke access to medical file
     * @param fileId File identifier
     * @param recipient Recipient address
     */
    function revokeAccess(
        bytes32 fileId,
        address recipient
    ) external nonReentrant onlyFileOwner(fileId) fileExists(fileId) {
        require(hasAccess[fileId][recipient], "MediVaultModule: No access to revoke");
        
        dataVault.revokeAccessByModule(fileId, msg.sender, recipient);
        hasAccess[fileId][recipient] = false;
        delete emergencyAccessGranted[fileId][recipient];
        
        emit AccessRevoked(fileId, recipient);
    }
    
    /**
     * @dev Check if user has access to medical file
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     */
    function checkAccess(bytes32 fileId, address user) external view fileExists(fileId) returns (bool hasFileAccess) {
        return hasAccess[fileId][user] && dataVault.hasValidAccess(fileId, user);
    }
    
    /**
     * @dev Check if user has emergency access to medical file
     * @param fileId File identifier
     * @param user User address
     * @return hasEmergencyAccess Whether user has emergency access
     */
    function hasEmergencyAccess(bytes32 fileId, address user) external view fileExists(fileId) returns (bool) {
        if (emergencyAccessGranted[fileId][user] == 0) return false;
        
        uint256 accessTime = emergencyAccessGranted[fileId][user];
        return block.timestamp <= accessTime + EMERGENCY_ACCESS_DURATION;
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
        require(hasAccess[fileId][user], "MediVaultModule: No access");
        return dataVault.getEncryptedFileKey(fileId, user);
    }
    
    /**
     * @dev Get access information for a user
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     * @return expiryTimestamp Expiry timestamp
     * @return isEmergencyAccess Whether this is emergency access
     */
    function getAccessInfo(bytes32 fileId, address user) 
        external 
        view 
        fileExists(fileId) 
        returns (
            bool hasFileAccess,
            uint256 expiryTimestamp,
            bool isEmergencyAccess
        ) 
    {
        (hasFileAccess, expiryTimestamp) = dataVault.getAccessInfo(fileId, user);
        isEmergencyAccess = emergencyAccessGranted[fileId][user] > 0;
    }
    
    /**
     * @dev Update DataVault contract address
     * @param _dataVault New DataVault contract address
     */
    function updateDataVault(address _dataVault) external onlyOwner {
        require(_dataVault != address(0), "MediVaultModule: Invalid address");
        dataVault = DataVault(_dataVault);
        emit DataVaultUpdated(_dataVault);
    }
    
    /**
     * @dev Update KeyRegistry contract address
     * @param _keyRegistry New KeyRegistry contract address
     */
    function updateKeyRegistry(address _keyRegistry) external onlyOwner {
        require(_keyRegistry != address(0), "MediVaultModule: Invalid address");
        keyRegistry = KeyRegistry(_keyRegistry);
        emit KeyRegistryUpdated(_keyRegistry);
    }
    
    /**
     * @dev Update ProviderRegistry contract address
     * @param _providerRegistry New ProviderRegistry contract address
     */
    function updateProviderRegistry(address _providerRegistry) external onlyOwner {
        require(_providerRegistry != address(0), "MediVaultModule: Invalid address");
        providerRegistry = ProviderRegistry(_providerRegistry);
        emit ProviderRegistryUpdated(_providerRegistry);
    }
}
