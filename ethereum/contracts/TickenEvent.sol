// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/security/Pausable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TickenEvent is ERC721Enumerable, Pausable, Ownable {
    /************************* Ticket ************************/
    struct Ticket {
        address owner;
        Status status;
        string section;
        uint256 tokenID;
    }

    enum Status {
        // Issues represents the state of the  ticket right
        // after it is "issued". Tickets in this state can
        // be scanned
        ISSUED,

        // TicketStatusScanned represents the state of the
        // ticket after it is "scanned". Important that this
        // is not  done in the same moment the scanning occurs,
        // this state is done on batch
        SCANNED
    }
    /*********************************************************/

    /******************** Event State ************************/
    // this variable indicates if the event is currently with
    // tickets on sale ("anchored") or not. While the event is
    // anchored, all tickets can only be traded by Ticken
    // (contract owner) or using the sell/buy ticket methods.
    // When the event becomes not anchored, all tickets are
    // free to be traded as NFT's
    bool private _anchored;
    /*********************************************************/

    /********************* Chain Events **********************/
    event TicketMinted(address owner, string section, uint256 indexed tokenID);
    event TicketTransferred(address from, address to, uint256 indexed tokenID);
    /*********************************************************/

    /**************** Mappings & Counters ********************/
    using Counters for Counters.Counter;

    // Mapping from token ID to tickets
    mapping(uint256 => Ticket) public tickets;

    // Mapping from section to tokenIDs
    mapping(string => uint256[]) private _ticketsBySection;

    // Count the number of tickets issued
    Counters.Counter private _ticketsCounter;
    /*********************************************************/


    constructor() ERC721("TickenEvent", "TCK") {
        _anchored = true;
    }

    /*********************************************************
     * mintTicket mint a ticket for the event in the section
     * passed by parameters. It fails if there is a ticket
     * already minted with this tokenID
     *
     * @params:
     * - address to      -> address of the ticket owner
     * - uint256 tokenID -> ticket ID in the blockchain
     * - string  section -> section of thw event where the ticket
     *                      is valid
     *
     * return: none
     *********************************************************/
    function raiseAnchors() public whenNotPaused onlyOwner {
        _anchored = false;
    }

    /*********************************************************
     * totalTickets returns the amount of tickets emitted
     * for the event up to the moment of the call
     *
     * params: none
     * return: uint
     *********************************************************/
    function totalTickets() public view returns (uint count) {
        return _ticketsCounter.current();
    }


    /*********************************************************
     * mintTicket mint a ticket for the event in the section
     * passed by parameters. It fails if there is a ticket
     * already minted with this tokenID
     *
     * @params:
     * - address to      -> address of the ticket owner
     * - uint256 tokenID -> ticket ID in the blockchain
     * - string  section -> section of thw event where the ticket
     *                      is valid
     *
     * return: none
     *********************************************************/
    function mintTicket(address to, uint256 tokenID, string calldata section) public whenNotPaused onlyOwner {
        require(!_exists(tokenID), "Token ID already exists");

        // links the token ID (ticket ID)
        // to owner address
        _safeMint(to, tokenID);

        tickets[tokenID] = Ticket({
            owner: to,
            section: section,
            tokenID: tokenID,
            status: Status.ISSUED
        });

        _ticketsCounter.increment();
        _ticketsBySection[section].push(tokenID);

        emit TicketMinted(to, section, tokenID);
    }


    /*********************************************************
     * mintTicket mint a ticket for the event in the section
     * passed by parameters. It fails if there is a ticket
     * already minted with this tokenID
     *
     * @params:
     * - address to      -> address of the ticket owner
     * - uint256 tokenID -> ticket ID in the blockchain
     * - string  section -> section of thw event where the ticket
     *                      is valid
     *
     * return: none
     *********************************************************/
    function transferTicket(address from, address to, uint256 tokenID) public whenNotPaused {
        // we are going to restric this method only
        // for the contract owners (Ticken) while the
        // tickets are avaiable to buy. After that, this
        // method becomes free to every user to tranfer
        // their tickets as NFTs
        if (_anchored) {
            _checkOwner();
            _safeTransfer(from, to, tokenID, "");
        } else {
            safeTransferFrom(from, to, tokenID);
        }

        tickets[tokenID].owner = to;

        emit TicketTransferred(from, to, tokenID);
    }


    /*********************************************************
     * scanBatch mark as scaneed all tickets passed by parameter.
     * It failes if one of the tokens is not is "issued" state.
     *
     * @params:
     * - uint256[] tokenIDs -> list of all tokens to be scanned
     *
     * return: none
     *********************************************************/
    function scanBatch(uint256[] calldata tokenIDs) public whenNotPaused onlyOwner {        
        for (uint256 i = 0; i < tokenIDs.length; i++) {
            require(
                tickets[tokenIDs[i]].status == Status.ISSUED, 
                "Ticken: Ticket already scanned or expired"
            );
            
            tickets[tokenIDs[i]].status = Status.SCANNED;
        }
    }
    

    /*********************************************************
     * getSectionTickets returns all tickets of the section
     * passed by parameters. It will return empty list if there
     * is no tickets for this section
     *
     * @params:
     * - string  section -> section of the event
     *
     * return: TicketDTO array
     *********************************************************/
    function getSectionTickets(string calldata section) public view returns (Ticket[] memory) {
        uint256[] memory sectionTokenIDs = _ticketsBySection[section];
        Ticket[] memory _tickets = new Ticket[](sectionTokenIDs.length);

        for (uint256 i = 0; i < sectionTokenIDs.length; i++) {
            _tickets[i] = tickets[sectionTokenIDs[i]];
        }

        return _tickets;
    }


    /*********************************************************
     * getTicketsOwnedBy returns all tickets owned by the owner
     * passed by parameters. It will return empty list if there
     * is no tickets for this owner
     *
     * @params:
     * - address owner -> ticket owner
     *
     * return: TicketDTO array
     *********************************************************/
    function getTicketsOwnedBy(address owner) public view returns (Ticket[] memory) {
        uint256 ownerTokenCount = balanceOf(owner);
        Ticket[] memory _tickets = new Ticket[](ownerTokenCount);

        for (uint256 i; i < ownerTokenCount; i++) {
            _tickets[i] = tickets[tokenOfOwnerByIndex(owner, i)];
        }

        return _tickets;
    }
}
