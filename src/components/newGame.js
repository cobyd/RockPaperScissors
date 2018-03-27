import React, { Component } from "react";

class NewGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stakes: ""
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    var value = event.target.value;

    this.setState(() => {
      return {
        stakes: value
      };
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.onSubmit(this.state.stakes);
  }

  render() {
    return (
      <form className="column" onSubmit={this.handleSubmit}>
        <label className="header" htmlFor="username">
          {this.props.label}
        </label>
        <input
          id="username"
          placeholder="Stakes in wei..."
          type="text"
          value={this.state.username}
          autoComplete="off"
          onChange={this.handleChange}
        />
        <button className="button" type="submit" disabled={!this.state.stakes}>
          Create Game
        </button>
      </form>
    );
  }
}

export default NewGame;
