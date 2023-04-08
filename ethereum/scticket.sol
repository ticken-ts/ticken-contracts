// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

    struct Ticket {
        address owner;
        string  section;
    }

    struct TicketDTO {
        uint256 tokenID;
        string  section;
        address ownerAddr;
    }


contract TickenEvent is ERC721, Pausable, Ownable {
    event TicketCreated(address ownerAddress, uint256 indexed tokenID, string section);

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to ticket
    mapping(uint256 => Ticket) private _tickets;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    // Mapping from section to tokenIDs
    mapping(string => uint256[]) private _sectionTokens;

    // List of all minted tokenIDs
    uint256[] private _allTokens;

    constructor() ERC721("TickenEvent", "TE") {}

    function toDTO(Ticket memory ticket, uint256 tokenID) private pure returns (TicketDTO memory) {
        return TicketDTO(tokenID, ticket.section, ticket.owner);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, string memory section, uint256 tokenId) public whenNotPaused onlyOwner {
        // Check if tokenID already exists
        require(!_exists(tokenId), "Token ID already exists");

        _safeMint(to, tokenId);

        _tokenIdCounter.increment();

        _tickets[tokenId] = Ticket(to, section);

        _ownedTokens[to].push(tokenId);

        _sectionTokens[section].push(tokenId);

        _allTokens.push(tokenId);

        emit TicketCreated(to, tokenId, section);
    }

    // Get all tickets from an owner address
    function getTicketsByOwner(address owner) public view returns (TicketDTO[] memory) {
        uint256[] memory tokenIds = _ownedTokens[owner];
        TicketDTO[] memory tickets = new TicketDTO[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            Ticket memory ticket = _tickets[tokenId];
            tickets[i] = toDTO(ticket, tokenId);
        }
        return tickets;
    }

    function getTicket(uint256 tokenId) public view returns (TicketDTO memory) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        Ticket memory ticket = _tickets[tokenId];
        return toDTO(ticket, tokenId);
    }

    function getAllTickets() public view onlyOwner returns (TicketDTO[] memory) {
        uint256 totalSupply = _tokenIdCounter.current();
        TicketDTO[] memory tickets = new TicketDTO[](totalSupply);
        for (uint256 i = 0; i < totalSupply; i++) {
            uint256 tokenId = _allTokens[i];
            Ticket memory ticket = _tickets[tokenId];
            tickets[i] = toDTO(ticket, tokenId);
        }
        return tickets;
    }

    function getTicketsBySection(string memory section) public view onlyOwner returns (TicketDTO[] memory) {
        uint256[] memory tokenIds = _sectionTokens[section];
        TicketDTO[] memory tickets = new TicketDTO[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            Ticket memory ticket = _tickets[tokenId];
            tickets[i] = toDTO(ticket, tokenId);
        }
        return tickets;
    }

    function transferTicket(address from, address to, uint256 tokenId) public onlyOwner {
        super._transfer(from, to, tokenId);

        // remove from old owner
        uint256 indexOfToken;
        bool found = false;
        for (uint256 i = 0; i < _ownedTokens[from].length; i++) {
            if (_ownedTokens[from][i] == tokenId) {
                indexOfToken = i;
                found = true;
                break;
            }
        }

        if (!found) revert("Token not found");

        delete _ownedTokens[from][indexOfToken];

        // add to new owner
        _ownedTokens[to].push(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
    internal
    whenNotPaused
    override
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}
