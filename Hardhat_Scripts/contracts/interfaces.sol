pragma solidity ^0.4.21;

// Relevant part of the CaptureTheEther contract.
interface INicknameChallenge {

    function setNickname(bytes32 nickname) external;
}

interface IGuessTheNumber {
    
    function guess(uint8 n) external payable;

}

interface IGuessTheSecretNumberChallenge {
    
    function guess(uint8 n) external payable;
}

interface IGuessTheRandomNumberChallenge {
    
    function guess(uint8 n) external payable;
}

interface ITokenWhaleChallenge{

    function approve(address spender, uint256 value) external;
    function transferFrom(address from, address to, uint256 value) external;
    function transfer(address to, uint256 value) external;
    function isComplete() external view returns (bool);
    function balanceOf(address from) external view returns(uint256);
}