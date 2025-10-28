// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IBioKey
 * @dev Simplified interface for BioKey module - Basic genomic data sharing
 */
interface IBioKey {
    
    /**
     * @dev Grant access to genomic data file (simplified - no complex workflow)
     * @param fileId File identifier
     * @param recipient Recipient address
     * @param encKeyForRecipient Encrypted file key for recipient
     */
    function grantAccess(
        bytes32 fileId,
        address recipient,
        bytes calldata encKeyForRecipient
    ) external;
    
    /**
     * @dev Revoke access to genomic data file
     * @param fileId File identifier
     * @param recipient Recipient address
     */
    function revokeAccess(
        bytes32 fileId,
        address recipient
    ) external;
    
    /**
     * @dev Check if user has access to file
     * @param fileId File identifier
     * @param user User address
     * @return hasFileAccess Whether user has access
     */
    function checkAccess(bytes32 fileId, address user) external view returns (bool);
    
    // Events
    event AccessGranted(
        bytes32 indexed fileId,
        address indexed recipient
    );
    
    event AccessRevoked(
        bytes32 indexed fileId,
        address indexed recipient
    );
}
