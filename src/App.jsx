import React, { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PublicBusinessPage from "./pages/PublicBusinessPage";
import SolutionPage, { solutionRoutes } from "./pages/SolutionPage";

function routeFromPath(pathname) {
  if (solutionRoutes[pathname]) return { view: "solution", solutionKey: solutionRoutes[pathname], authMode: "signin", initialTab: "Dashboard" };
  if (pathname === "/login") return { view: "dashboard", authMode: "signin", initialTab: "Dashboard" };
  if (pathname === "/signup") return { view: "dashboard", authMode: "signup", initialTab: "Setup" };
  if (pathname === "/dashboard") return { view: "dashboard", authMode: "signin", initialTab: "Dashboard" };
  if (pathname === "/onboarding") return { view: "dashboard", authMode: "signup", initialTab: "Setup" };
  return { view: "landing", authMode: "signin", initialTab: "Dashboard" };
}

export default function App() {
  const [route, setRoute] = useState(() => routeFromPath(window.location.pathname));

  useEffect(() => {
    function handlePopState() {
      setRoute(routeFromPath(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, "", path);
    setRoute(routeFromPath(path));
  }

  const publicBusinessMatch = window.location.pathname.match(/^\/b\/([^\/]+)\/?$/);

  if (publicBusinessMatch) {
    return <PublicBusinessPage slug={decodeURIComponent(publicBusinessMatch[1])} />;
  }

  function openAuth(mode) {
    navigate(mode === "signup" ? "/signup" : "/login");
  }

  if (route.view === "dashboard") {
    return (
      <Dashboard
        authMode={route.authMode}
        initialTab={route.initialTab}
        onBack={() => navigate("/")}
      />
    );
  }

  if (route.view === "solution") {
    return <SolutionPage pageKey={route.solutionKey} />;
  }

  return (
    <LandingPage
      onSignup={() => openAuth("signup")}
      onSignin={() => openAuth("signin")}
    />
  );
}
