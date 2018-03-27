import React, { Component } from "react";
import RockPaperScissorsContract from "../../build/contracts/RockPaperScissors.json";
import getWeb3 from "../utils/getWeb3";

class PlayerActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: props.web3,
      accounts: props.accounts,
      instance: props.instance,
      stakes: props.stakes,
      choice: 1,
      handlerFunction: props.handlerFunction
    };
    this.handleChange = this.handleChange.bind(this);
    this.commitChoice = this.commitChoice.bind(this);
  }

  async hash(choice, salt) {
    const hash = await this.state.instance.methods
      .keccakHash(choice, salt)
      .call({
        from: this.state.accounts[0]
      });
    console.log(hash);
    if (!hash) {
      return "Error";
    }
    return hash;
  }

  async handleChange(event) {
    let stateObject = function() {
      let returnObj = {};
      returnObj[this.target.id] = this.target.value;
      console.log(returnObj);
      return returnObj;
    }.bind(event)();

    this.setState(stateObject);
    console.log(this.state);
  }

  async commitChoice() {
    const hashedChoice = await this.hash(this.state.choice, this.state.salt);
    await this.state.instance.methods.commit(hashedChoice).send({
      from: this.state.accounts[0],
      value: this.state.stakes
    });
    this.setState({
      committed: true
    });
    this.state.handlerFunction(true);
  }

  async reveal() {
    await this.state.instance.methods
      .reveal(this.state.salt, this.state.choice)
      .send({
        from: this.state.accounts[0]
      });
  }

  async engGame() {
    await this.state.instance.methods
      .evaluateGame(this.state.salt, this.state.choice)
      .send({
        from: this.state.accounts[0]
      });
  }

  render() {
    return (
      <div>
        <h2>Game Actions</h2>
        <div>
          <p>Commit your choice</p>
          <div>
            <label className="header" htmlFor="salt">
              Salt for hashing:
            </label>
            <input
              id="salt"
              placeholder="e.g. nf39hxx898"
              type="text"
              value={this.state.salt}
              autoComplete="off"
              disabled={this.state.committed}
              onChange={this.handleChange}
            />
            <label className="header" htmlFor="choice">
              Choice:
            </label>
            <select
              id="choice"
              value={this.state.choice}
              onChange={this.handleChange}
              disabled={this.state.committed}
            >
              <option value="1">Rock</option>
              <option value="2">Paper</option>
              <option value="3">Scissors</option>
            </select>
            <button
              onClick={this.commitChoice}
              className="button"
              disabled={!this.state.salt || !this.state.choice}
            >
              Commit!
            </button>
          </div>
        </div>
        <div>
          <h2>Reveal your choice</h2>
          <div>
            <button onClick={this.reveal}>Reveal!</button>
          </div>
        </div>
        <div>
          <h2>End the game</h2>
          <div>
            <button onClick={this.engGame}>End!</button>
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerActions;
