// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CarbonCredit
 * @dev ERC-1155 contract for tokenized carbon credits with role-based access control
 */
contract CarbonCredit is ERC1155, AccessControl, ERC1155Supply, ERC1155Burnable {
    using Strings for uint256;

    // Role definitions
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Carbon credit metadata structure
    struct CreditMetadata {
        string projectId;
        string vintage;
        string serialNumber;
        string registry;
        string metadataURI; // IPFS CID for detailed metadata
        address issuer;
        uint256 issuanceDate;
        bool isRetired;
    }

    // Retirement event structure
    struct RetirementEvent {
        uint256 tokenId;
        uint256 quantity;
        address retiree;
        string reason;
        uint256 timestamp;
    }

    // Storage
    mapping(uint256 => CreditMetadata) public creditMetadata;
    mapping(uint256 => RetirementEvent[]) public retirements;
    uint256 private _currentTokenId;

    // Events
    event CreditIssued(
        uint256 indexed tokenId,
        address indexed issuer,
        address indexed recipient,
        uint256 quantity,
        string projectId,
        string vintage
    );

    event CreditRetired(
        uint256 indexed tokenId,
        address indexed retiree,
        uint256 quantity,
        string reason
    );

    event MetadataUpdated(uint256 indexed tokenId, string newMetadataURI);

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Issue new carbon credits
     * @param to Recipient address
     * @param quantity Amount of credits to issue
     * @param projectId Project identifier
     * @param vintage Year of carbon reduction
     * @param serialNumber Unique serial number
     * @param registry Registry name (e.g., Verra, Gold Standard)
     * @param metadataURI IPFS CID for metadata
     */
    function issueCarbonCredit(
        address to,
        uint256 quantity,
        string memory projectId,
        string memory vintage,
        string memory serialNumber,
        string memory registry,
        string memory metadataURI
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot issue to zero address");
        require(quantity > 0, "Quantity must be greater than 0");
        require(bytes(projectId).length > 0, "Project ID required");
        require(bytes(vintage).length > 0, "Vintage required");

        uint256 tokenId = _currentTokenId++;

        // Store metadata
        creditMetadata[tokenId] = CreditMetadata({
            projectId: projectId,
            vintage: vintage,
            serialNumber: serialNumber,
            registry: registry,
            metadataURI: metadataURI,
            issuer: msg.sender,
            issuanceDate: block.timestamp,
            isRetired: false
        });

        // Mint tokens
        _mint(to, tokenId, quantity, "");

        emit CreditIssued(tokenId, msg.sender, to, quantity, projectId, vintage);

        return tokenId;
    }

    /**
     * @dev Retire carbon credits (burn with reason)
     * @param tokenId Token ID to retire
     * @param quantity Amount to retire
     * @param reason Reason for retirement
     */
    function retireCarbonCredit(
        uint256 tokenId,
        uint256 quantity,
        string memory reason
    ) external {
        require(balanceOf(msg.sender, tokenId) >= quantity, "Insufficient balance");
        require(quantity > 0, "Quantity must be greater than 0");
        require(!creditMetadata[tokenId].isRetired, "Credit already retired");

        // Burn the tokens
        _burn(msg.sender, tokenId, quantity);

        // Record retirement
        retirements[tokenId].push(RetirementEvent({
            tokenId: tokenId,
            quantity: quantity,
            retiree: msg.sender,
            reason: reason,
            timestamp: block.timestamp
        }));

        // Mark as retired if all tokens are burned
        if (totalSupply(tokenId) == 0) {
            creditMetadata[tokenId].isRetired = true;
        }

        emit CreditRetired(tokenId, msg.sender, quantity, reason);
    }

    /**
     * @dev Update metadata URI (only by verifier)
     * @param tokenId Token ID
     * @param newMetadataURI New IPFS CID
     */
    function updateMetadata(
        uint256 tokenId,
        string memory newMetadataURI
    ) external onlyRole(VERIFIER_ROLE) {
        require(exists(tokenId), "Token does not exist");
        creditMetadata[tokenId].metadataURI = newMetadataURI;
        emit MetadataUpdated(tokenId, newMetadataURI);
    }

    /**
     * @dev Get credit metadata
     * @param tokenId Token ID
     */
    function getCreditMetadata(uint256 tokenId) external view returns (CreditMetadata memory) {
        require(exists(tokenId), "Token does not exist");
        return creditMetadata[tokenId];
    }

    /**
     * @dev Get retirement history for a token
     * @param tokenId Token ID
     */
    function getRetirementHistory(uint256 tokenId) external view returns (RetirementEvent[] memory) {
        return retirements[tokenId];
    }

    /**
     * @dev Get token URI
     * @param tokenId Token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(exists(tokenId), "Token does not exist");
        
        string memory metadataURI = creditMetadata[tokenId].metadataURI;
        if (bytes(metadataURI).length > 0) {
            return string(abi.encodePacked("ipfs://", metadataURI));
        }
        
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }

    /**
     * @dev Batch transfer with verification
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override {
        require(to != address(0), "Cannot transfer to zero address");
        
        // Verify all tokens are not retired
        for (uint256 i = 0; i < ids.length; i++) {
            require(!creditMetadata[ids[i]].isRetired, "Cannot transfer retired credits");
        }
        
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    /**
     * @dev Single transfer with verification
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        require(to != address(0), "Cannot transfer to zero address");
        require(!creditMetadata[id].isRetired, "Cannot transfer retired credits");
        
        super.safeTransferFrom(from, to, id, amount, data);
    }

    // Required overrides
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}