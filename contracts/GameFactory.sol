pragma solidity ^0.4.19;

import "./Owned.sol";
import "./RockPaperScissors.sol";

contract GameFactory is Owned {
    address[] public games;

    function GameFactory() public {}

    event LogNewRpsGame(address rpsAddr);
    
    function createRPSGame(uint _stakes) public returns (address) {
        address rpsAddr = address(new RockPaperScissors(_stakes, msg.sender));
        LogNewRpsGame(rpsAddr);
        games.push(rpsAddr);
        return rpsAddr;
    }

    // temporary until we learn ipfs to watch logs instead
    function getGames() public view returns(address[]) {
        return games;
    }
}