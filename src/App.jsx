import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PublicBusinessPage from "./pages/PublicBusinessPage";

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "dashboard"
  const publicBusinessMatch = window.location.pathname.match(/^\/b\/([^\/]+)\/?$/);

  if (publicBusinessMatch) {
    return <PublicBusinessPage slug={decodeURIComponent(publicBusinessMatch[1])} />;
  }

  const [authMode, setAuthMode] = useState("signin");

  function openAuth(mode) {
    setAuthMode(mode);
    setView("dashboard");
  }
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
