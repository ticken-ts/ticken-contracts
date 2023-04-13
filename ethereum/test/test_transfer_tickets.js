const bnChai = require("bn-chai");
const { expect, use } = require("chai");
const { expectRevert, expectEvent, BN } = require("openzeppelin-test-helpers");

use(bnChai(BN));

const SCTicket = artifacts.require("TickenEvent");

const NOT_CONTRACT_OWNER_ERROR = "Ownable: caller is not the owner";
const NOT_TOKEN_OWNER_ERROR = "ERC721: caller is not token owner or approved";

contract(
  "GIVEN there is an event that is anchored with one ticket issued",
  ([, ownerAddr, recepientAddr]) => {
    before(async function () {
      this.scTicket = await SCTicket.deployed();

      this.section = "VIP";
      this.tokenID = BN(1);
      this.tx = await this.scTicket.mintTicket(ownerAddr, this.tokenID, this.section);
    });

    describe("WHEN the ticket is transferred by someone that is not the contract owner", function () {
      before(function () {
        this.transferTxPromise = this.scTicket.transferTicket(
          ownerAddr,
          recepientAddr,
          this.tokenID,
          { from: ownerAddr }
        );
      });

      it("THEN it should revert the transaction", async function () {
        return expectRevert(this.transferTxPromise, NOT_CONTRACT_OWNER_ERROR);
      });

      it("THEN the ticket should not change the owner", async function () {
        const ticket = await this.scTicket.tickets(this.tokenID);
        expect(ticket.owner).to.be.equal(ownerAddr);
      });
    });

    describe("WHEN the ticket is transferred by the contract owner", function () {
      before(async function () {
        await this.scTicket.transferTicket(ownerAddr, recepientAddr, this.tokenID);
      });

      it("THEN the ticket change owner correctly", async function () {
        const ticket = await this.scTicket.tickets(this.tokenID);
        expect(ticket.owner).to.be.equal(recepientAddr);
      });

      it("THEN a new ticket was not issued", async function () {
        const totalTickets = await this.scTicket.totalTickets();
        expect(totalTickets).to.eq.BN(1);
      });

      it("THEN the previous doesnt have the ticket anymore", async function () {
        const prevOwnerTickets = await this.scTicket.getTicketsOwnedBy(ownerAddr);
        console.log(prevOwnerTickets);
        expect(prevOwnerTickets.length).to.be.equal(0);
      });

      it("THEN the recipient have the ticket", async function () {
        const recipientTickets = await this.scTicket.getTicketsOwnedBy(recepientAddr);
        expect(recipientTickets.length).to.be.equal(1);
        expect(recipientTickets[0].tokenID).to.eq.BN(this.tokenID);
        expect(recipientTickets[0].owner).to.be.equal(recepientAddr);
      });
    });
  }
);

contract(
  "GIVEN there is an event that raise anchors with one ticket issued",
  ([, ownerAddr, recepientAddr]) => {
    before(async function () {
      this.scTicket = await SCTicket.deployed();

      this.section = "VIP";
      this.tokenID = BN(1);
      this.tx = await this.scTicket.mintTicket(ownerAddr, this.tokenID, this.section);

      await this.scTicket.raiseAnchors();
    });

    describe("WHEN the ticket is transferred by the contract owner (who is not the ticket owner)", function () {
      before(function () {
        this.transferTxPromise = this.scTicket.transferTicket(
          ownerAddr,
          recepientAddr,
          this.tokenID
        );
      });

      it("THEN it should revert the tx because is not the ticket owner", async function () {
        return expectRevert(this.transferTxPromise, NOT_TOKEN_OWNER_ERROR);
      });

      it("THEN the ticket should not change the owner", async function () {
        const ticket = await this.scTicket.tickets(this.tokenID);
        expect(ticket.owner).to.be.equal(ownerAddr);
      });
    });

    describe("WHEN the ticket is transferred by the ticket owner", function () {
      before(async function () {
        await this.scTicket.transferTicket(ownerAddr, recepientAddr, this.tokenID, {
          from: ownerAddr,
        });
      });

      it("THEN the ticket change owner correctly", async function () {
        const ticket = await this.scTicket.tickets(this.tokenID);
        expect(ticket.owner).to.be.equal(recepientAddr);
      });

      it("THEN a new ticket was not issued", async function () {
        const totalTickets = await this.scTicket.totalTickets();
        expect(totalTickets).to.eq.BN(1);
      });

      it("THEN the previous doesnt have the ticket anymore", async function () {
        const prevOwnerTickets = await this.scTicket.getTicketsOwnedBy(ownerAddr);
        expect(prevOwnerTickets.length).to.be.equal(0);
      });

      it("THEN the recipient have the ticket", async function () {
        const recipientTickets = await this.scTicket.getTicketsOwnedBy(recepientAddr);
        expect(recipientTickets.length).to.be.equal(1);
        expect(recipientTickets[0].tokenID).to.eq.BN(this.tokenID);
        expect(recipientTickets[0].owner).to.be.equal(recepientAddr);
      });
    });
  }
);
