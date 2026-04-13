import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import Status from "./pages/Status";
import Voting from "./pages/Voting";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/status" element={<Status />} />
        <Route path="/voting" element={<Voting />} />
      </Routes>
    </Router>
  );
}

export default App;