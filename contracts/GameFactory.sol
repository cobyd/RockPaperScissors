pragma solidity ^0.4.19;

import "./Owned.sol";
import "./RockPaperScissors.sol";

contract GameFactory is Owned {
    
    function GameFactory() public {}

    event LogNewRpsGame(address rpsAddr);
    
    function createRPSGame(uint _stakes) public returns (address) {
        address rpsAddr = address(new RockPaperScissors(_stakes, msg.sender));
        LogNewRpsGame(rpsAddr);
        return rpsAddr;
    }
}