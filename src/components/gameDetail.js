import React, { Component } from "react";
import PlayerActions from "./playerActions.js";
import RockPaperScissorsContract from "../../build/contracts/RockPaperScissors.json";
import getWeb3 from "../utils/getWeb3";

class GameDetail extends Component {
  constructor(props) {
    super(props);

    console.log(props);
    console.log(props.match.params.gameId);

    this.state = {
      userAddress: "",
      address: props.match.params.gameId,
      stakes: null,
      player1: {
        addr: null,
        choice: "0",
        committed: false,
        entry:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        revealed: false
      },
      player2: {
        addr: null,
        choice: "0",
        committed: false,
        entry:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        revealed: false
      },
      accounts: [],
      instance: null
    };
    this.handleStateChange = this.handleStateChange.bind(this);
    this.refreshPlayers = this.refreshPlayers.bind(this);
  }

  async componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    const web3 = await getWeb3;
    console.log(web3.web3);
    this.setState({
      web3: web3.web3
    });
    const userAddress = (await this.state.web3.eth.getAccounts())[0];
    console.log(userAddress);
    this.setState({
      userAddress: userAddress
    });
    this.instantiateContract();
  }

  async instantiateContract() {
    console.log("Starting contract init");
    const accounts = await this.state.web3.eth.getAccounts();
    const netId = await this.state.web3.eth.net.getId();
    const rockPaperScissorsInstance = new this.state.web3.eth.Contract(
      RockPaperScissorsContract.abi,
      this.state.address
    );
    rockPaperScissorsInstance.setProvider(this.state.web3.currentProvider);
    const stakes = await rockPaperScissorsInstance.methods.stakes().call({
      from: accounts[0],
      gas: 2000000
    });
    const player1 = this.selectPropsFromPlayer(
      await rockPaperScissorsInstance.methods.player1().call({
        from: accounts[0],
        gas: 2000000
      })
    );
    const player2 = this.selectPropsFromPlayer(
      await rockPaperScissorsInstance.methods.player2().call({
        from: accounts[0],
        gas: 2000000
      })
    );
    this.setState({
      stakes: stakes,
      player1: player1,
      player2: player2,
      accounts: accounts,
      instance: rockPaperScissorsInstance,
      userIsPlayer:
        this.state.userAddress === player1.addr ||
        this.state.userAddress === player2.addr
    });
  }

  selectPropsFromPlayer(player) {
    return (({ addr, choice, committed, entry, revealed }) => ({
      addr,
      choice,
      committed,
      entry,
      revealed
    }))(player);
  }

  async refreshPlayers() {
    const player1 = this.selectPropsFromPlayer(
      await this.state.instance.methods.player1().call({
        from: this.state.accounts[0],
        gas: 2000000
      })
    );
    const player2 = this.selectPropsFromPlayer(
      await this.state.instance.methods.player2().call({
        from: this.state.accounts[0],
        gas: 2000000
      })
    );
    this.setState({
      player1: player1,
      player2: player2
    });
  }

  handleStateChange(newState) {
    this.refreshPlayers();
  }

  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h3>Game Info:</h3>
            <div>
              <p>Contract Address: {this.state.address}</p>
            </div>
            <div>
              <p>Stakes: {this.state.stakes}</p>
            </div>
            <div>
              <p>Player 1: </p>
              <p>{JSON.stringify(this.state.player1)}</p>
            </div>
            <div>
              <p>Player 2: </p>
              <p>{JSON.stringify(this.state.player2)}</p>
            </div>
            {this.state.userIsPlayer && (
              <PlayerActions
                web3={this.state.web3}
                accounts={this.state.accounts}
                instance={this.state.instance}
                stakes={this.state.stakes}
                handlerFunction={this.handleStateChange}
              />
            )}
          </div>
        </div>
      </main>
    );
  }
}

export default GameDetail;
