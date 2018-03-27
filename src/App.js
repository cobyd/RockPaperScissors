import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import GameFactoryHome from "./components/gameFactoryHome";
import GameDetail from "./components/gameDetail";

import "./css/oswald.css";
import "./css/open-sans.css";
import "./css/pure-min.css";
import "./App.css";
import Switch from "react-router-dom/Switch";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Switch>
            <Route exact path="/" component={GameFactoryHome} />
            <Route path="/games/:gameId" component={GameDetail} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
