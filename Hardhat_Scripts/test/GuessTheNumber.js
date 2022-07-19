const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuessTheNumber", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
  

    describe("Guessing", function () {
        it("Should Guess the number", async function () {
            const instanceAddr = "0x89E0aE27eA9874aDD6ff5923B520D88C41f6B80e"
            const instance = await ethers.getContractAt("IGuessTheNumber", instanceAddr);
            const [owner] = await ethers.getSigners();
            
            // Checking that the contract has 1 ether balance on deployment.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("1"))

            await instance.connect(owner).guess(42, {value: ethers.utils.parseEther("1")});
            
            // Checking win condition.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("0"))

        });
    });


});
  