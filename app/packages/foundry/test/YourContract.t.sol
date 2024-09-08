// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/.sol";

contract Test is Test {
   public ;

  function setUp() public {
     = new (vm.addr(1));
  }

  function testMessageOnDeployment() public view {
    require(
      keccak256(bytes(.greeting()))
        == keccak256("Building Unstoppable Apps!!!")
    );
  }

  function testSetNewMessage() public {
    .setGreeting("Learn Scaffold-ETH 2! :)");
    require(
      keccak256(bytes(.greeting()))
        == keccak256("Learn Scaffold-ETH 2! :)")
    );
  }
}
