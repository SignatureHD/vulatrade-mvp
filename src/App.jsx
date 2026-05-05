import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PublicBusinessPage from "./pages/PublicBusinessPage";

export default function App() {
  const [view, setView] = useState("landing"); // "landing" | "dashboard"
  const publicBusinessMatch = window.location.pathname.match(/^\/b\/([^/]+)\/?$/);

  if (publicBusinessMatch) {
    return <PublicBusinessPage slug={decodeURIComponent(publicBusinessMatch[1])} />;
  }

  if (view === "dashboard") {
    return <Dashboard onBack={() => setView("landing")} />;
  }

  return <LandingPage onDemo={() => setView("dashboard")} />;
}
