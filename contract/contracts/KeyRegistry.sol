// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title KeyRegistry
 * @dev Registry contract for encryption public keys with versioning support
 * @notice Manages encryption key storage, retrieval, and versioning for secure file sharing
 */
contract KeyRegistry is ReentrancyGuard {
    
    // Key information structure
    struct KeyInfo {
        bytes publicKey;
        uint256 version;
        uint256 createdAt;
        uint256 lastUpdated;
        bool isActive;
    }
    
    // Encryption key storage mapping
    mapping(address => KeyInfo) public encryptionKeys;
    
    // Events
    event EncryptionKeySet(address indexed user, bytes publicKey, uint256 version);
    event EncryptionKeyUpdated(address indexed user, bytes newPublicKey, uint256 newVersion);
    event EncryptionKeyDeactivated(address indexed user, uint256 version);
    event EncryptionKeyReactivated(address indexed user, uint256 version);
    
    constructor() ReentrancyGuard() {}
    
    /**
     * @dev Set encryption public key for a user
     * @param publicKey Encryption public key
     */
    function setEncryptionKey(bytes calldata publicKey) external nonReentrant {
        require(publicKey.length > 0, "KeyRegistry: Invalid public key");
        require(publicKey.length <= 128, "KeyRegistry: Public key too long");
        
        uint256 newVersion = encryptionKeys[msg.sender].version + 1;
        
        encryptionKeys[msg.sender] = KeyInfo({
            publicKey: publicKey,
            version: newVersion,
            createdAt: encryptionKeys[msg.sender].createdAt == 0 ? block.timestamp : encryptionKeys[msg.sender].createdAt,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        emit EncryptionKeySet(msg.sender, publicKey, newVersion);
    }
    
    /**
     * @dev Update encryption public key
     * @param newPublicKey New encryption public key
     */
    function updateEncryptionKey(bytes calldata newPublicKey) external nonReentrant {
        require(newPublicKey.length > 0, "KeyRegistry: Invalid public key");
        require(newPublicKey.length <= 128, "KeyRegistry: Public key too long");
        require(encryptionKeys[msg.sender].publicKey.length > 0, "KeyRegistry: No existing key");
        
        uint256 newVersion = encryptionKeys[msg.sender].version + 1;
        
        encryptionKeys[msg.sender] = KeyInfo({
            publicKey: newPublicKey,
            version: newVersion,
            createdAt: encryptionKeys[msg.sender].createdAt,
            lastUpdated: block.timestamp,
            isActive: true
        });
        
        emit EncryptionKeyUpdated(msg.sender, newPublicKey, newVersion);
    }
    
    /**
     * @dev Deactivate encryption key (for security)
     */
    function deactivateEncryptionKey() external nonReentrant {
        require(encryptionKeys[msg.sender].publicKey.length > 0, "KeyRegistry: No existing key");
        require(encryptionKeys[msg.sender].isActive, "KeyRegistry: Key already inactive");
        
        encryptionKeys[msg.sender].isActive = false;
        encryptionKeys[msg.sender].lastUpdated = block.timestamp;
        
        emit EncryptionKeyDeactivated(msg.sender, encryptionKeys[msg.sender].version);
    }
    
    /**
     * @dev Reactivate encryption key
     */
    function reactivateEncryptionKey() external nonReentrant {
        require(encryptionKeys[msg.sender].publicKey.length > 0, "KeyRegistry: No existing key");
        require(!encryptionKeys[msg.sender].isActive, "KeyRegistry: Key already active");
        
        encryptionKeys[msg.sender].isActive = true;
        encryptionKeys[msg.sender].lastUpdated = block.timestamp;
        
        emit EncryptionKeyReactivated(msg.sender, encryptionKeys[msg.sender].version);
    }
    
    /**
     * @dev Get encryption public key for a user
     * @param user User address
     * @return publicKey Encryption public key
     * @return version Key version
     * @return isActive Whether key is active
     */
    function getEncryptionKey(address user) external view returns (
        bytes memory publicKey,
        uint256 version,
        bool isActive
    ) {
        require(encryptionKeys[user].publicKey.length > 0, "KeyRegistry: No key found");
        return (
            encryptionKeys[user].publicKey,
            encryptionKeys[user].version,
            encryptionKeys[user].isActive
        );
    }
    
    /**
     * @dev Get full key information for a user
     * @param user User address
     * @return publicKey Encryption public key
     * @return version Key version
     * @return createdAt Creation timestamp
     * @return lastUpdated Last update timestamp
     * @return isActive Whether key is active
     */
    function getKeyInfo(address user) external view returns (
        bytes memory publicKey,
        uint256 version,
        uint256 createdAt,
        uint256 lastUpdated,
        bool isActive
    ) {
        require(encryptionKeys[user].publicKey.length > 0, "KeyRegistry: No key found");
        KeyInfo memory key = encryptionKeys[user];
        return (key.publicKey, key.version, key.createdAt, key.lastUpdated, key.isActive);
    }
    
    /**
     * @dev Check if user has an active encryption key
     * @param user User address
     * @return hasKey Whether user has an active key
     */
    function hasEncryptionKey(address user) external view returns (bool hasKey) {
        return encryptionKeys[user].publicKey.length > 0 && encryptionKeys[user].isActive;
    }
    
    /**
     * @dev Check if user has any encryption key (active or inactive)
     * @param user User address
     * @return hasAnyKey Whether user has any key
     */
    function hasAnyEncryptionKey(address user) external view returns (bool hasAnyKey) {
        return encryptionKeys[user].publicKey.length > 0;
    }
    
    /**
     * @dev Get key version for a user
     * @param user User address
     * @return version Key version
     */
    function getKeyVersion(address user) external view returns (uint256 version) {
        require(encryptionKeys[user].publicKey.length > 0, "KeyRegistry: No key found");
        return encryptionKeys[user].version;
    }
}
