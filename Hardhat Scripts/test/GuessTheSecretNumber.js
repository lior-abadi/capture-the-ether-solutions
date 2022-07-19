const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GuessTheSecretNumberChallenge", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
  

    describe("Guessing", function () {
        it("Should Guess the secret number", async function () {
            const instanceAddr = "0xAaf26E43dd44cCBeD005c23B4d483bCa95448f5B";
            const nearlySecretHash = "0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365";

            const instance = await ethers.getContractAt("IGuessTheSecretNumberChallenge", instanceAddr);
            const [owner] = await ethers.getSigners();
            
            // Checking that the contract has 1 ether balance on deployment.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("1"));

            const maxUint8 = 255;
            for (let index = 0; index <= maxUint8; index++) {
                if(ethers.utils.keccak256(index) == nearlySecretHash){
                    console.log(`The secret number was ${index}`);
                    await instance.connect(owner).guess(index, {value: ethers.utils.parseEther("1")});
                }  
            }
            // Checking win condition.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.BigNumber.from("0"))

        });
    });


});
  