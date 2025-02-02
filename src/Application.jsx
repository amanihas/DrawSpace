import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Verification from "./Verification"

export default function Application() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path = "/verification/:token" element={<Verification/>} />
    </Routes>
  );
}