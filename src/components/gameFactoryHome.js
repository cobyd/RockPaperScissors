import React, { Component } from "react";
import NewGame from "./newGame";
import GameFactoryContract from "../../build/contracts/GameFactory.json";
import getWeb3 from "../utils/getWeb3";
import { Link } from "react-router-dom";

class GameFactoryHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      netId: null,
      gameFactoryInstance: {},
      games: [],
      web3: null
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    const web3 = await getWeb3;
    console.log(web3.web3);
    this.setState({ web3: web3.web3 });
    this.instantiateContract();
  }

  async instantiateContract() {
    console.log("Starting contract init");
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const accounts = await this.state.web3.eth.getAccounts();
    const netId = await this.state.web3.eth.net.getId();
    const gameFactoryInstance = new this.state.web3.eth.Contract(
      GameFactoryContract.abi,
      GameFactoryContract.networks[netId].address
    );
    console.log(GameFactoryContract.networks[netId].address);
    gameFactoryInstance.setProvider(this.state.web3.currentProvider);
    console.log(netId);
    // await gameFactoryInstance.methods.createRPSGame("100000").send({
    //   from: accounts[0],
    //   gas: 2000000
    // });
    // await gameFactoryInstance.methods.createRPSGame("2000000").send({
    //   from: accounts[0],
    //   gas: 2000000
    // });
    // await gameFactoryInstance.methods.createRPSGame("20000000").send({
    //   from: accounts[0],
    //   gas: 2000000
    // });
    const games = await gameFactoryInstance.methods.getGames().call({
      from: accounts[0],
      gas: 2000000
    });
    console.log(games);
    this.setState({
      accounts: accounts,
      netId: netId,
      gameFactoryInstance: gameFactoryInstance,
      games: games
    });
  }

  async handleSubmit(stakes) {
    const deployTx = await this.state.gameFactoryInstance.methods
      .createRPSGame(stakes)
      .send({
        from: this.state.accounts[0],
        gas: 2000000
      });
    const deployedAddress = deployTx.events.LogNewRpsGame.returnValues.rpsAddr;
    console.log(deployedAddress);
    const games = this.state.games.concat(deployedAddress);
    console.log(games);
    this.setState({ games: games });
  }

  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <div>
              <h3>Network ID:</h3>
              <p>{this.state.netId}</p>
            </div>
            <NewGame onSubmit={this.handleSubmit} />
            <div>
              <h3>Deployed Games:</h3>
              <ul>
                {this.state.games.map(gameAddress => {
                  return (
                    <li key={gameAddress}>
                      <Link to={"/games/" + String(gameAddress)}>
                        {gameAddress}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default GameFactoryHome;
