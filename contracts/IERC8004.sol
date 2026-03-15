// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004
 * @dev Mock interface representing the ERC-8004 standard for Autonomous On-Chain Agent Identity.
 * Provides functions for an agent to sign payloads, manage its own treasury, and verify its autonomy.
 */
interface IERC8004 {
    // Agent identity status
    function isAutonomous() external view returns (bool);
    function getAgentID() external view returns (bytes32);

    // Operational logic
    function executePayment(address payable recipient, uint256 amount) external;
    function signMessage(bytes32 payloadHash) external view returns (bytes memory);
}
