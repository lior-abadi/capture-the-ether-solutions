const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FuzzyIdentityChallenge", function () {
    describe("Stealing identity", function () {
        it("Exploiting...", async function () {
            const [owner] = await ethers.getSigners();
            const instanceAddr = "0xc3ec0F493aF32Ea55a42cc9644104277Aba31e7C";

            // Deploying the Create2 contract.
            const Create2Contract = await ethers.getContractFactory("FuzzyIdentityDeployer");
            const create2Contract = await Create2Contract.deploy();
            await create2Contract.deployed();

            console.log(`"Deployed deployer at ${create2Contract.address}`);
            
            let result;
            let isValid = false;
            let index = 0;

            while(!isValid){
                result = await create2Contract.findSalt(index);
                result[1] = isValid;
                console.log(result[0], result[1], index);
                index += 1;
            } 

            console.log(`The calculated address is ${result[0]} with salt ${index-1}`);

            const attackerAddress = await create2Contract.deploy(index-1);
            const attacker = await ethers.getContractAt("IFuzzyIdentityAttacker", attackerAddress);
            
            await attacker.attack(instanceAddr);
        });
    });
});