import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Register from "./Register";
import Verification from "./Verification";
import SignIn from "./SignIn";

export default function Application() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signin" element={<SignIn />} /> {/* Add the SignIn route */}
      <Route path="/verification/:token" element={<Verification />} />
    </Routes>
  );
}