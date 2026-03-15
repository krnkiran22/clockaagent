// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IERC8004.sol";

contract ClokaAgentIdentity is IERC8004, Ownable {
    bytes32 public immutable AGENT_ID;
    
    // Vendor Registry for storing payout methods
    enum PayoutMethod { FIAT_CARD, CRYPTO_CARD, WALLET }
    
    struct Vendor {
        string name;
        PayoutMethod preferredMethod;
        address payable wallet;
    }
    
    mapping(address => Vendor) public vendors;
    address[] public registeredVendors;

    event EventAnnounced(string eventName, uint256 timestamp, string conditions);
    event VendorPaid(address indexed vendor, uint256 amount, string method);
    
    constructor() Ownable(msg.sender) {
        AGENT_ID = keccak256(abi.encodePacked("CLOKA_PROTOCOL_MAIN_AGENT", block.timestamp));
    }

    // ERC-8004 Compliance
    function isAutonomous() external pure returns (bool) {
        return true;
    }

    function getAgentID() external view returns (bytes32) {
        return AGENT_ID;
    }

    function executePayment(address payable recipient, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Cloka Treasury: Insufficient funds");
        recipient.transfer(amount);
    }
    
    function signMessage(bytes32) external pure returns (bytes memory) {
        // Mock method for returning an Agent's on-chain verifiable signature
        return bytes("");
    }

    // Agent specific protocol methods
    function announceEvent(string memory eventName, string memory conditions) external onlyOwner {
        emit EventAnnounced(eventName, block.timestamp, conditions);
    }

    function registerVendor(string memory _name, PayoutMethod _method, address payable _wallet) external onlyOwner {
        vendors[_wallet] = Vendor(_name, _method, _wallet);
        registeredVendors.push(_wallet);
    }

    function payVendor(address payable _vendorWallet, uint256 _amount) external onlyOwner {
        Vendor memory vendor = vendors[_vendorWallet];
        require(vendor.wallet != address(0), "Vendor not registered");
        require(address(this).balance >= _amount, "Treasury empty");
        
        vendor.wallet.transfer(_amount);
        
        string memory payoutMethodStr = "";
        if (vendor.preferredMethod == PayoutMethod.FIAT_CARD) payoutMethodStr = "FIAT_CARD_BRIDGE";
        else if (vendor.preferredMethod == PayoutMethod.CRYPTO_CARD) payoutMethodStr = "CRYPTO_CARD_BRIDGE";
        else payoutMethodStr = "DIRECT_WALLET_X402";

        emit VendorPaid(_vendorWallet, _amount, payoutMethodStr);
    }

    receive() external payable {}
}
