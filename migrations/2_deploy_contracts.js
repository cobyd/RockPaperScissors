var GameFactory = artifacts.require("./GameFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(GameFactory);
};
