// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IPSealModule
 * @dev Intellectual property timestamping module for SecureDAG platform
 * @notice Handles IP document timestamping and verification
 */
contract IPSealModule is ReentrancyGuard {
    
    // IP timestamping data structure
    struct IPTimestamp {
        bytes32 documentHash;
        uint256 timestamp;
        string ipType;
        string description;
    }
    
    // IP timestamping mapping
    mapping(bytes32 => IPTimestamp) public ipTimestamps;
    
    // Events
    event IPTimestamped(
        bytes32 indexed fileId,
        bytes32 documentHash,
        string ipType,
        string description,
        uint256 timestamp
    );
    
    constructor() ReentrancyGuard() {}
    
    /**
     * @dev Timestamp intellectual property document
     * @param fileId File identifier
     * @param documentHash Hash of the document content
     * @param ipType Type of IP ("patent", "copyright", "trademark", "trade_secret")
     * @param description Description of the IP
     */
    function timestampIP(
        bytes32 fileId,
        bytes32 documentHash,
        string calldata ipType,
        string calldata description
    ) external nonReentrant {
        require(bytes(ipType).length > 0, "IPSealModule: Invalid IP type");
        require(bytes(description).length > 0, "IPSealModule: Invalid description");
        require(ipTimestamps[fileId].timestamp == 0, "IPSealModule: Already timestamped");
        
        ipTimestamps[fileId] = IPTimestamp({
            documentHash: documentHash,
            timestamp: block.timestamp,
            ipType: ipType,
            description: description
        });
        
        emit IPTimestamped(fileId, documentHash, ipType, description, block.timestamp);
    }
    
    /**
     * @dev Get IP timestamp information
     * @param fileId File identifier
     * @return documentHash Hash of the document
     * @return timestamp Timestamp when IP was sealed
     * @return ipType Type of IP
     * @return description Description of the IP
     */
    function getIPTimestamp(bytes32 fileId) 
        external 
        view 
        returns (
            bytes32 documentHash,
            uint256 timestamp,
            string memory ipType,
            string memory description
        ) 
    {
        IPTimestamp memory ipTimestamp = ipTimestamps[fileId];
        require(ipTimestamp.timestamp > 0, "IPSealModule: No timestamp found");
        
        return (
            ipTimestamp.documentHash,
            ipTimestamp.timestamp,
            ipTimestamp.ipType,
            ipTimestamp.description
        );
    }
    
    /**
     * @dev Verify document integrity against IP timestamp
     * @param fileId File identifier
     * @param documentHash Hash of document to verify
     * @return isValid Whether document hash matches timestamp
     */
    function verifyDocumentIntegrity(bytes32 fileId, bytes32 documentHash) 
        external 
        view 
        returns (bool isValid) 
    {
        IPTimestamp memory ipTimestamp = ipTimestamps[fileId];
        require(ipTimestamp.timestamp > 0, "IPSealModule: No timestamp found");
        
        return ipTimestamp.documentHash == documentHash;
    }
    
    /**
     * @dev Check if file has IP timestamp
     * @param fileId File identifier
     * @return hasIPTimestamp Whether file has IP timestamp
     */
    function hasIPTimestamp(bytes32 fileId) external view returns (bool) {
        return ipTimestamps[fileId].timestamp > 0;
    }
}
