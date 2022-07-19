const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuessTheRandomNumberChallenge", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
  

    describe("Guessing", function () {
        it("Should Guess the random number", async function () {
            const instanceAddr = "0x0C68e4Ef0aD5fb5410A1b0E6241C4a116370Ec35";

            const instance = await ethers.getContractAt("IGuessTheRandomNumberChallenge", instanceAddr);
            const [owner] = await ethers.getSigners();
            
            // Checking that the contract has 1 ether balance on deployment.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("1"));

            const answer = parseInt(await ethers.provider.getStorageAt(instanceAddr, 0));

            console.log(`The answer is: ${answer}`);
           
            await instance.connect(owner).guess(answer, {value: ethers.utils.parseEther("1")});

            // Checking win condition.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("0"))

        });
    });


});
  