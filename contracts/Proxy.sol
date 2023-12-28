// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

import "hardhat/StorageSlot.sol";

// EOA -> Proxy -> Logic1 but can change to Logic2

contract Proxy {
    function changeImplementation(address _implementation) external {
        StorageSlot.getAddressSlot(keccak256("imp")).value = _implementation;
    }

    fallback() external {
        (bool success, ) = StorageSlot
            .getAddressSlot(keccak256("imp"))
            .delegatecall(msg.data);

        require(success);
    }
}

contract Logic1 {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }
}

contract Logic2 {
    uint x = 0;

    function changeX(uint _x) external {
        x = _x;
    }

    function tripleX() external {
        x *= 3;
    }
}
