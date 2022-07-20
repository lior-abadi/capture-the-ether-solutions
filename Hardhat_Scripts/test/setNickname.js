const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SetNicknameChallenge", function () {

    // async function deployFixture() {
    //   const [owner] = await ethers.getSigners();
    //   const instance = await ethers.getContractAt("NicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
 
    //   return { instance, owner };
    // }
  

    describe("Setting Nickname", function () {
        it("Should Set the nickname", async function () {
            const instance = await ethers.getContractAt("INicknameChallenge", "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee");
            const [owner] = await ethers.getSigners();
            
            const newName = ethers.utils.formatBytes32String("0xNineDecember");
            await instance.connect(owner).setNickname(newName);
        });
    });


});
  