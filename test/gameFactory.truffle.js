const assert = require("assert");
const GameFactory = artifacts.require("./GameFactory.sol");
const RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

const Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract("Game Factory", accounts => {
  let gameFactory;
  it("Deploys a game factory", async () => {
    gameFactory = await GameFactory.new({ from: accounts[0] });
    assert.ok(gameFactory.address);
  });
  it("Deploys a rock paper scissors game", async () => {
    deployTx = await gameFactory.createRPSGame("1000000", {
      from: accounts[0]
    });
    let rpsAddr = deployTx.logs[0].args.rpsAddr;
    let rockPaperScissors = RockPaperScissors.at(rpsAddr);
    let stakes = await rockPaperScissors.stakes.call({ from: accounts[0] });
    assert.equal("1000000", stakes);
  });
});
