// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IFuzzyIdentityAttacker{
    function name() external pure returns(bytes32);
    function attack(address _destination) external returns(bool success);
}

contract FuzzyIdentityAttacker {

    function name() external pure returns(bytes32){
        return bytes32("smarx");
    }

    function attack(address _destination) external returns(bool success){
        bytes memory payload = abi.encodeWithSignature("authenticate()");
        (success, ) = _destination.call(payload);
        require(success, "!success");      
    }

}

contract FuzzyIdentityDeployer {

    event DeployedAt(address addr);

    function deploy(uint256 _salt) external returns(address deployedAt){
        FuzzyIdentityAttacker _contract = new FuzzyIdentityAttacker{
            salt: bytes32(_salt)
        }();
        deployedAt = address(_contract);
        emit DeployedAt(address(_contract));
    }

    function precalculateAddr(bytes memory bytecode, uint256 _salt)
        public 
        view
        returns(address)
    {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff), address(this), _salt, keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    function getBytecode() public pure returns(bytes memory){
        return type(FuzzyIdentityAttacker).creationCode;
    }

    function findSalt(uint256 _i) external view returns(address newAddress, bool isValid){
        bytes20 id = hex"000000000000000000000000000000000badc0de";
        bytes20 mask = hex"000000000000000000000000000000000fffffff";

        address tempAddr = precalculateAddr(getBytecode(), _i);
        bytes20 addr = bytes20(tempAddr);

        for (uint256 j = 0; j < 34; j++) {
            if (addr & mask == id) {
                return (tempAddr, true);
            }
            mask <<= 4;
            id <<= 4;
        } 
        return (tempAddr, false);   
    }
}