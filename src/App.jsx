import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "dashboard"
  const [authMode, setAuthMode] = useState("signin");

  function openAuth(mode) {
    setAuthMode(mode);
    setView("dashboard");
  }

  if (view === "dashboard") {
    return <Dashboard authMode={authMode} onBack={() => setView("landing")} />;
  }

  return (
    <LandingPage
      onSignup={() => openAuth("signup")}
      onSignin={() => openAuth("signin")}
    />
  );
}
