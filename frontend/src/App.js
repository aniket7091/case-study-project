import React from "react";
import LandingPage from "./pages/LandingPage";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";




function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/workflow" element={<LandingPage />} />
        <Route path="/roles" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/contact" element={<LandingPage />} />

        {/* for the login page */}
        <Route path="/login" element={<LoginPage />}/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;