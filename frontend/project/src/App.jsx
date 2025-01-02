import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import SeatArrangement from "./SeatArrangement"; // Existing component
import Allocate from "./Allocate"; // New component
import "./app.css";

const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav
          style={{
            backgroundColor: "#333",
            padding: "10px",
            color: "white",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <Link
            to="/"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Seat Arrangement
          </Link>
          <Link
            to="/allocate"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Allocate
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SeatArrangement />} />
          <Route path="/allocate" element={<Allocate />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
