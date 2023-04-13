const bnChai = require("bn-chai");
const { expect, use } = require("chai");
const { expectRevert, expectEvent, BN } = require("openzeppelin-test-helpers");

use(bnChai(BN));

const SCTicket = artifacts.require("TickenEvent");

const NOT_CONTRACT_OWNER_ERROR = "Ownable: caller is not the owner";

contract("GIVEN there are tickets issued", ([, ticketOwnerA, ticketOwnerB]) => {
  before(async function () {
    this.scTicket = await SCTicket.deployed();

    this.info = [
      {
        section: "section-1",
        ticketsForOwnerA: 3,
        ticketsForOwnerB: 12,
      },
      {
        section: "section-2",
        ticketsForOwnerA: 4,
        ticketsForOwnerB: 1,
      },
      {
        section: "section-3",
        ticketsForOwnerA: 0,
        ticketsForOwnerB: 9,
      },
      {
        section: "section-4",
        ticketsForOwnerA: 5,
        ticketsForOwnerB: 0,
      },
    ];

    let ticketID = 0;

    for (let i = 0; i < this.info.length; i++) {
      for (let j = 0; j < this.info[i].ticketsForOwnerA; j++) {
        await this.scTicket.mintTicket(ticketOwnerA, BN(ticketID), this.info[i].section);
        ticketID++;
      }
      for (let j = 0; j < this.info[i].ticketsForOwnerB; j++) {
        await this.scTicket.mintTicket(ticketOwnerB, BN(ticketID), this.info[i].section);
        ticketID++;
      }
    }
  });

  describe("WHEN trying to get tickets of the section", function () {
    it("THEN it should returns all tickets correctly", async function () {
      for (let i = 0; i < this.info.length; i++) {
        const sectionInfo = this.info[i];

        const expectedSectionTickets = sectionInfo.ticketsForOwnerA + sectionInfo.ticketsForOwnerB;
        const obtainedSectionTickets = await this.scTicket.getSectionTickets(sectionInfo.section);

        expect(obtainedSectionTickets.length).to.be.equal(expectedSectionTickets);

        for (let j = 0; j < obtainedSectionTickets.length; j++) {
          expect(obtainedSectionTickets[i].section).to.be.equal(sectionInfo.section);
        }
      }
    });
  });

  describe("WHEN trying to get tickets of the owner", function () {
    it("THEN it should returns all tickets correctly", async function () {
      const obtainedOwnerATickets = await this.scTicket.getTicketsOwnedBy(ticketOwnerA);
      const obtainedOwnerBTickets = await this.scTicket.getTicketsOwnedBy(ticketOwnerB);

      const expectedTotalOwnerATickets = this.info.reduce((acc, x) => acc + x.ticketsForOwnerA, 0);
      const expectedTotalOwnerBTickets = this.info.reduce((acc, x) => acc + x.ticketsForOwnerB, 0);

      expect(obtainedOwnerATickets.length).to.be.equal(expectedTotalOwnerATickets);
      expect(obtainedOwnerBTickets.length).to.be.equal(expectedTotalOwnerBTickets);

      for (let i = 0; i < obtainedOwnerATickets.length; i++) {
        expect(obtainedOwnerATickets[i].owner).to.be.equal(ticketOwnerA);
      }
      for (let i = 0; i < obtainedOwnerBTickets.length; i++) {
        expect(obtainedOwnerBTickets[i].owner).to.be.equal(ticketOwnerB);
      }
    });
  });
});
