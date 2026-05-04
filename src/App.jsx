import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "dashboard"

  if (view === "dashboard") {
    return <Dashboard onBack={() => setView("landing")} />;
  }

  return <LandingPage onDemo={() => setView("dashboard")} />;
}
