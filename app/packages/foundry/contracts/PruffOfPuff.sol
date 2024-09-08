// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PruffOfPuff is ERC721, Ownable {
    uint256 private _tokenIds;

    // Mapping to keep track of pruffer addresses
    mapping(address => bool) public pruffers;

    // Event for adding a new pruffer
    event PrufferAdded(address indexed pruffer);
    // Event for minting a new token
    event TokenMinted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("PruffOfPuff", "POF") {
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

    // Function to mint a new token, can only be called by pruffers
    function mint(address to, string memory tokenURI) external {
        require(pruffers[msg.sender], "Not a pruffer, minting not allowed.");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit TokenMinted(to, newTokenId, tokenURI);
    }

    // Function to set the token URI (IPFS link)
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "Token ID does not exist.");
        // Optional: You can store the tokenURI using a mapping or another method.
    }

    function isPruffer(address _address) external view returns (bool) {
        return pruffers[_address];
    }

    // Optional: Override to return a token URI stored on IPFS
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        // Implement your logic to retrieve the IPFS link
        return super.tokenURI(tokenId);
    }
}
