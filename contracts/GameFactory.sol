pragma solidity ^0.4.19;

import "./Owned.sol";

contract GameFactory is Owned {
    
    function GameFactory() public {}

    event LogNewRpsGame(address rpsAddr);
    
    function createRPSGame(uint _stakes) public returns (address) {
        address rpsAddr = address(new RockPaperScissors(_stakes, msg.sender));
        LogNewRpsGame(rpsAddr);
        return rpsAddr;
    }
}

contract RockPaperScissors {
    function RockPaperScissors(uint _stakes, address _player1) public {}
}