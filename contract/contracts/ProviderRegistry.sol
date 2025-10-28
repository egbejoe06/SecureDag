// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProviderRegistry
 * @dev Registry contract for service providers
 * @notice Manages provider registration and verification for platform access
 */
contract ProviderRegistry is ReentrancyGuard {
    
    // Provider registration mapping
    mapping(address => bool) public isProvider;
    
    // Events
    event ProviderRegistered(address indexed provider);
    event ProviderRemoved(address indexed provider);
    
    constructor() ReentrancyGuard() {}
    
    /**
     * @dev Register as a provider
     */
    function registerProvider() external nonReentrant {
        require(!isProvider[msg.sender], "ProviderRegistry: Already registered");
        
        isProvider[msg.sender] = true;
        emit ProviderRegistered(msg.sender);
    }
    
    /**
     * @dev Remove provider registration
     */
    function removeProvider() external nonReentrant {
        require(isProvider[msg.sender], "ProviderRegistry: Not registered");
        
        isProvider[msg.sender] = false;
        emit ProviderRemoved(msg.sender);
    }
    
    /**
     * @dev Check if address is a registered provider
     * @param provider Provider address
     * @return isRegistered Whether provider is registered
     */
    function checkProvider(address provider) external view returns (bool isRegistered) {
        return isProvider[provider];
    }
}
