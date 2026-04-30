import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import LandingPage from "./LandingPage.jsx";
import AppDashboard from "./AppDashboard.jsx";

function App() {
  const [screen, setScreen] = useState("landing");

  if (screen === "dashboard") {
    return <AppDashboard onBack={() => setScreen("landing")} />;
  }

  return <LandingPage onDemo={() => setScreen("dashboard")} />;
}

createRoot(document.getElementById("root")).render(<App />);