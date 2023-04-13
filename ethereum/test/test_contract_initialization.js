const bnChai = require("bn-chai");
const { expect, use } = require("chai");
const { expectRevert, expectEvent, BN } = require("openzeppelin-test-helpers");

use(bnChai(BN));

const SCTicket = artifacts.require("TickenEvent");

const STATUS_ISSUED = 0;
const NOT_CONTRACT_OWNER_ERROR = "Ownable: caller is not the owner";

contract("GIVEN there is not tickets issues", ([, ticketOwner]) => {
  before(async function () {
    this.scTicket = await SCTicket.deployed();
  });

  describe("WHEN the ticket is issued by the contract owner", function () {
    before(async function () {
      this.section = "VIP";
      this.tokenID = BN(1);

      this.tx = await this.scTicket.mintTicket(ticketOwner, this.tokenID, this.section);
    });

    it("THEN should increse tickets emitted", async function () {
      const totalTickets = await this.scTicket.totalTickets();
      expect(totalTickets).to.eq.BN(1);
    });

    it("THEN the ticket is created with status issued (0)", async function () {
      const ticket = await this.scTicket.tickets(this.tokenID);
      return expect(ticket.status).to.eq.BN(STATUS_ISSUED);
    });

    it("THEN the ticket is created with the correct owner", async function () {
      const ticket = await this.scTicket.tickets(this.tokenID);
      return expect(ticket.owner).to.equal(ticketOwner);
    });

    it("THEN the ticket is created with the correct section", async function () {
      const ticket = await this.scTicket.tickets(this.tokenID);
      return expect(ticket.section).to.equal(this.section);
    });
  });

  describe("WHEN the ticket is minted by someone who is not the contract owner", function () {
    before(function () {
      this.section = "VIP";
      this.tokenID = BN(1);

      // ticket owner tryies to mint its own ticket
      this.txPromisse = this.scTicket.mintTicket(ticketOwner, this.tokenID, this.section, {
        from: ticketOwner,
      });
    });

    it("THEN should revert the tx", function () {
      return expectRevert(this.txPromisse, NOT_CONTRACT_OWNER_ERROR);
    });

    it("THEN should not increse tickets emitted", async function () {
      const totalTickets = await this.scTicket.totalTickets();
      expect(totalTickets).to.eq.BN(1);
    });
  });
});
