const bnChai = require("bn-chai");
const { expect, use } = require("chai");
const { expectRevert, expectEvent, BN } = require("openzeppelin-test-helpers");

use(bnChai(BN));

const SCTicket = artifacts.require("TickenEvent");

const STATUS_ISSUED = 0;
const NOT_CONTRACT_OWNER_ERROR = "Ownable: caller is not the owner";

contract("GIVEN that the contract just deployed", ([, ticketOwner]) => {
  before(async function () {
    this.scTicket = await SCTicket.deployed();
  });

  it("THEN should deploy contract properly", function () {
    expect(this.scTicket.address).to.not.be.NaN;
  });

  it("THEN should have 0 tickets emmited", async function () {
    const totalTickets = await this.scTicket.totalTickets();
    expect(totalTickets).to.eq.BN(0);
  });
});
