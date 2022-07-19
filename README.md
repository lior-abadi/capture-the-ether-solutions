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


