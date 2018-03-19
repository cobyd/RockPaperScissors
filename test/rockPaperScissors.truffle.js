const assert = require("assert");
const RockPaperScissors = artifacts.require("./RockPaperScissors.sol");

const Promise = require("bluebird");
Promise.promisifyAll(web3.eth, { suffix: "Promise" });

contract("Rock, paper, scissors", accounts => {
  let oneFinney;

  beforeEach(async () => {
    oneFinney = web3.toWei("1", "finney");
  });

  describe("Deployment...", () => {
    before(async () => {
      rockPaperScissors = await RockPaperScissors.new(oneFinney, accounts[1], {
        from: accounts[0]
      });
    });
    it("deploys an rps contract", async () => {
      assert.ok(rockPaperScissors.address);
    });
    it("Does not deploy an rps contract with bad inputs", async () => {
      try {
        _rockPaperScissors = await RockPaperScissors.new(accounts[1], {
          from: accounts[0]
        });
        assert(false, "Should throw in transaction");
      } catch (e) {
        assert(
          String(e).indexOf(
            "Error: RockPaperScissors contract constructor expected 2 arguments, received 1"
          ) >= 0,
          "Wrong error returned"
        );
      }
      try {
        _rockPaperScissors = await RockPaperScissors.new(oneFinney, {
          from: accounts[0]
        });
        assert(false, "Should throw in transaction");
      } catch (e) {
        assert(
          String(e).indexOf(
            "Error: RockPaperScissors contract constructor expected 2 arguments, received 1"
          ) >= 0,
          "Wrong error returned"
        );
      }
    });
  });
  describe("Player 2 Joining...", () => {
    before(async () => {
      rockPaperScissors = await RockPaperScissors.new(oneFinney, accounts[1], {
        from: accounts[0]
      });
    });
    it("Allows player2 to join", async () => {
      let player2 = await rockPaperScissors.player2.call({ from: accounts[0] });
      assert.equal(0, player2[0]);
      await rockPaperScissors.joinGame({ from: accounts[2] });
      player2 = await rockPaperScissors.player2.call({ from: accounts[0] });
      assert.equal(accounts[2], player2[0]);
    });
    it("Updates game state", async () => {
      let gameState = await rockPaperScissors.state.call({ from: accounts[0] });
      assert.equal(1, gameState);
    });
    it("Cannot join game after 2 players have joined", async () => {
      try {
        await rockPaperScissors.joinGame({ from: accounts[2] });
        assert(false, "Should throw in transaction");
      } catch (e) {
        assert(
          String(e).indexOf(
            "Error: VM Exception while processing transaction: revert"
          ) >= 0,
          "Wrong error returned"
        );
      }
    });
  });
  describe("Committing and Revealing...", () => {
    before(async () => {
      rockPaperScissors = await RockPaperScissors.new(oneFinney, accounts[1], {
        from: accounts[0]
      });
      await rockPaperScissors.joinGame({ from: accounts[2] });
    });
    it("Does not allow player1 to commit without the proper value", async () => {
      let salt = "192837465";
      let player1Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      try {
        await rockPaperScissors.commit(player1Hash, {
          from: accounts[1],
          value: "100"
        });
      } catch (e) {
        assert(
          String(e).indexOf(
            "Error: VM Exception while processing transaction: revert"
          ) >= 0,
          "Wrong error returned"
        );
      }
    });
    it("Allows player1 to commit their choice", async () => {
      let salt = "192837465";
      let player1Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      await rockPaperScissors.commit(player1Hash, {
        from: accounts[1],
        value: oneFinney
      });
      let returnedHash = (await rockPaperScissors.player1.call({
        from: accounts[0]
      }))[1];
      assert.equal(player1Hash, returnedHash);
    });
    it("Does not allow player1 to reveal before player2 commits", async () => {
      let salt = "192837465";
      try {
        await rockPaperScissors.reveal(1, salt, {
          from: accounts[1]
        });
      } catch (e) {
        assert(
          String(e).indexOf(
            "Error: VM Exception while processing transaction: revert"
          ) >= 0,
          "Wrong error returned"
        );
      }
    });
    it("Allows player2 to commit", async () => {
      let salt = "192837465";
      let player2Hash = await rockPaperScissors.keccakHash.call(2, salt, {
        from: accounts[0]
      });
      await rockPaperScissors.commit(player2Hash, {
        from: accounts[2],
        value: oneFinney
      });
      let returnedHash = (await rockPaperScissors.player2.call({
        from: accounts[0]
      }))[1];
      assert.equal(player2Hash, returnedHash);
    });
    it("Allows both players to reveal", async () => {
      let salt = "192837465";
      await rockPaperScissors.reveal(1, salt, {
        from: accounts[1]
      });
      await rockPaperScissors.reveal(2, salt, {
        from: accounts[2]
      });
      let player1Choice = (await rockPaperScissors.player1.call({
        from: accounts[0]
      }))[2];
      let player2Choice = (await rockPaperScissors.player2.call({
        from: accounts[0]
      }))[2];
      assert.equal(1, player1Choice);
      assert.equal(2, player2Choice);
    });
  });
  describe("Ending the Game...", () => {
    before(async () => {
      rockPaperScissors = await RockPaperScissors.new(oneFinney, accounts[1], {
        from: accounts[0]
      });
      await rockPaperScissors.joinGame({ from: accounts[2] });
    });
    it("Player 2 wins the game", async () => {
      let salt = "192837465";
      let player1Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      let player2Hash = await rockPaperScissors.keccakHash.call(2, salt, {
        from: accounts[0]
      });
      await rockPaperScissors.commit(player1Hash, {
        from: accounts[1],
        value: oneFinney
      });
      await rockPaperScissors.commit(player2Hash, {
        from: accounts[2],
        value: oneFinney
      });
      await rockPaperScissors.reveal(1, salt, {
        from: accounts[1]
      });
      await rockPaperScissors.reveal(2, salt, {
        from: accounts[2]
      });
      let player2StartingBalance = await web3.eth.getBalancePromise(
        accounts[2]
      );
      await rockPaperScissors.evaluateGame({ from: accounts[0] });
      let player2EndingBalance = await web3.eth.getBalancePromise(accounts[2]);
      assert.equal(
        2 * oneFinney,
        (player2EndingBalance - player2StartingBalance).toString()
      );
    });
    it("resets the game", async () => {
      let player1 = await rockPaperScissors.player1.call({
        from: accounts[0]
      });
      let player2 = await rockPaperScissors.player2.call({
        from: accounts[0]
      });
      assert.equal(player1[0], accounts[1]);
      assert.equal(player1[1], 0);
      assert.equal(player1[2], 0);
      assert.equal(player1[3], false);
      assert.equal(player1[4], false);
      assert.equal(player2[0], accounts[2]);
      assert.equal(player2[1], 0);
      assert.equal(player2[2], 0);
      assert.equal(player2[3], false);
      assert.equal(player2[4], false);
    });
    it("Is a tie", async () => {
      let salt = "192837465";
      let player1Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      let player2Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      await rockPaperScissors.commit(player1Hash, {
        from: accounts[1],
        value: oneFinney
      });
      await rockPaperScissors.commit(player2Hash, {
        from: accounts[2],
        value: oneFinney
      });
      await rockPaperScissors.reveal(1, salt, {
        from: accounts[1]
      });
      await rockPaperScissors.reveal(1, salt, {
        from: accounts[2]
      });
      let contractStartingBalance = await web3.eth.getBalancePromise(
        rockPaperScissors.address
      );
      await rockPaperScissors.evaluateGame({ from: accounts[0] });
      let contractEndingBalance = await web3.eth.getBalancePromise(
        rockPaperScissors.address
      );
      assert.equal(
        contractStartingBalance.toString(),
        contractEndingBalance.toString()
      );
    });
    it("Player1 wins after tie", async () => {
      let salt = "192837465";
      let player1Hash = await rockPaperScissors.keccakHash.call(1, salt, {
        from: accounts[0]
      });
      let player2Hash = await rockPaperScissors.keccakHash.call(3, salt, {
        from: accounts[0]
      });
      await rockPaperScissors.breakTie(player1Hash, {
        from: accounts[1]
      });
      await rockPaperScissors.breakTie(player2Hash, {
        from: accounts[2]
      });
      await rockPaperScissors.reveal(1, salt, {
        from: accounts[1]
      });
      await rockPaperScissors.reveal(3, salt, {
        from: accounts[2]
      });
      let player1StartingBalance = await web3.eth.getBalancePromise(
        accounts[1]
      );
      await rockPaperScissors.evaluateGame({ from: accounts[0] });
      let player1EndingBalance = await web3.eth.getBalancePromise(accounts[1]);
      assert.equal(
        2 * oneFinney,
        (player1EndingBalance - player1StartingBalance).toString()
      );
    });
  });
});
