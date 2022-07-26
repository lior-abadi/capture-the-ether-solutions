const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicKeyChallenge", function () {
    describe("Finding Key", function () {
        it("Exploiting...", async function () {
            const instanceAddr = "0x6754f7c8d539391C98C71b1b443DEE49Bf592b31"
            const instance = await ethers.getContractAt("IPublicKeyChallenge", instanceAddr);
            const [owner] = await ethers.getSigners();

            const outGoingTxHash = "0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb";
            const tx = await ethers.provider.getTransaction(outGoingTxHash);
            
            console.log(`Signature Values:`);
            console.log(`r: ${tx.r}`);
            console.log(`s: ${tx.s}`);
            console.log(`v: ${tx.v}`);

            const signature = {
                r: tx.r, 
                s: tx.s, 
                v: tx.v
            };

            const txData = {
                nonce: tx.nonce,
                gasPrice: tx.gasPrice, 
                gasLimit: tx.gasLimit,
                to: tx.to,
                value: tx.value,
                data: tx.data,
                chainId: tx.chainId
            };

            const signedData = ethers.utils.serializeTransaction(txData);
            const msgHash = ethers.utils.keccak256(signedData);

            // This will have a 04 after the 0x at the beginning. This indicates that it is a raw address.
            const rawPubKey = ethers.utils.recoverPublicKey(msgHash, signature);
            console.log(`Raw Key: ${rawPubKey}`); 

            let publicKey = `0x${rawPubKey.slice(4)}`

            await instance.authenticate(publicKey);
        });
    });
});