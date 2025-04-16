import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Verification from "./Verification";
import SignIn from "./SignIn";
import UserDashboard from "./UserDashboard";
import Brainstormer from "./Brainstormer";
import Canvas from "./Canvas";
import Gallery from "./Gallery";

// Defines all the Routes of DrawSpace

export default function Application() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signin" element={<SignIn />} /> 
      <Route path="/verification/:token" element={<Verification />} />
      <Route path="/canvas" element={<Canvas />} />
      <Route path="/brainstormer"  element={<Brainstormer />} />
      <Route path="/canvas" element={<Canvas />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
}