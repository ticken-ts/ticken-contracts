const bnChai = require("bn-chai");
const { expect, use } = require("chai");
const { expectRevert, expectEvent, BN } = require("openzeppelin-test-helpers");

use(bnChai(BN));

const SCTicket = artifacts.require("TickenEvent");

const STATUS_SCANNED = 1;

contract("GIVEN there is an event that contains tickets", ([, ownerAddr, recepientAddr]) => {
  before(async function () {
    this.scTicket = await SCTicket.deployed();

    this.section = "VIP";
    this.tokenIDs = [...Array(30).keys()].map((v, _) => BN(v));

    for (const tokenID in this.tokenIDs) {
      await this.scTicket.mintTicket(ownerAddr, tokenID, this.section);
    }
  });

  describe("WHEN scanning the tickets in batch", function () {
    before(async function () {
      await this.scTicket.scanBatch(this.tokenIDs);
    });

    it("THEN all tickets are scanned", async function () {
      for (const tokenID in this.tokenIDs) {
        let ticket = await this.scTicket.tickets(tokenID);
        expect(ticket.status).to.eq.BN(STATUS_SCANNED);
      }
    });
  });
});
