// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PruffOfPuff is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Mapping to keep track of pruffer addresses
    mapping(address => bool) public pruffers;

    // Event for adding a new pruffer
    event PrufferAdded(address indexed pruffer);
    // Event for minting a new token
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("PruffOfPuff", "POF") Ownable(msg.sender) {
        pruffers[msg.sender] = true; // Automatically add the contract owner as a pruffer
        emit PrufferAdded(msg.sender); // Emit an event indicating the owner was added as a pruffer
    }

    // Function to add an address as a pruffer, can only be called by owner
    function addPruffer(address _pruffer) external onlyOwner {
        require(!pruffers[_pruffer], "Pruffer already added.");
        pruffers[_pruffer] = true;
        emit PrufferAdded(_pruffer);
    }

    // Function to remove a pruffer, can only be called by the owner
    function removePruffer(address _pruffer) external onlyOwner {
        require(pruffers[_pruffer], "Address is not a pruffer.");
        pruffers[_pruffer] = false;
    }

    function isPruffer(address _address) public view returns (bool) {
        return pruffers[_address];
    }

    // Function to mint a new token, can only be called by pruffers, mints to msg.sender
    function mint(string memory tokenURI) external {
        require(pruffers[msg.sender], "Not a pruffer, minting not allowed.");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId); // Mint to the address of the caller (executor)
        _setTokenURI(newTokenId, tokenURI); // Set the token's IPFS link

        emit TokenMinted(msg.sender, newTokenId, tokenURI);
    }
}
