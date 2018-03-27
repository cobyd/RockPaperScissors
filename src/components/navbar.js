import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar pure-menu pure-menu-horizontal">
      <Link to="/">Home</Link>
    </nav>
  );
}

export default Navbar;
