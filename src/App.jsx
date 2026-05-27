import React, { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import PublicBusinessPage from "./pages/PublicBusinessPage";
import ReviewSubmissionPage from "./pages/ReviewSubmissionPage";
import SolutionPage, { solutionRoutes } from "./pages/SolutionPage";
import VulaAcademyPage from "./pages/VulaAcademyPage";

function routeFromPath(pathname) {
  if (pathname === "/login") return { view: "dashboard", authMode: "signin", initialTab: "Dashboard" };
  if (pathname === "/signup") return { view: "dashboard", authMode: "signup", initialTab: "Setup" };
  if (pathname === "/dashboard") return { view: "dashboard", authMode: "signin", initialTab: "Dashboard" };
  if (pathname === "/onboarding") return { view: "dashboard", authMode: "signup", initialTab: "Setup" };
  if (pathname === "/setup") return { view: "dashboard", authMode: "signin", initialTab: "Setup" };
  if (pathname === "/location") return { view: "dashboard", authMode: "signin", initialTab: "Location" };
  if (pathname === "/public-page") return { view: "dashboard", authMode: "signin", initialTab: "Page" };
  if (pathname === "/products") return { view: "dashboard", authMode: "signin", initialTab: "Products" };
  if (pathname === "/customers") return { view: "dashboard", authMode: "signin", initialTab: "Customers" };
  if (pathname === "/bookings") return { view: "dashboard", authMode: "signin", initialTab: "Bookings" };
  if (pathname === "/sales") return { view: "dashboard", authMode: "signin", initialTab: "Sales" };
  if (pathname === "/expenses") return { view: "dashboard", authMode: "signin", initialTab: "Expenses" };
  if (pathname === "/reviews") return { view: "dashboard", authMode: "signin", initialTab: "Reviews" };
  if (pathname === "/business-file") return { view: "dashboard", authMode: "signin", initialTab: "BusinessFile" };
  if (pathname === "/dashboard/business-file") return { view: "dashboard", authMode: "signin", initialTab: "BusinessFile" };
  if (pathname === "/vuke") return { view: "dashboard", authMode: "signin", initialTab: "Vuke" };
  if (pathname === "/plans") return { view: "dashboard", authMode: "signin", initialTab: "Plans" };
  if (pathname === "/settings") return { view: "dashboard", authMode: "signin", initialTab: "Settings" };
  if (pathname === "/money") return { view: "dashboard", authMode: "signin", initialTab: "Sales" };
  if (pathname === "/growth") return { view: "dashboard", authMode: "signin", initialTab: "BusinessFile" };
  if (pathname === "/messages") return { view: "dashboard", authMode: "signin", initialTab: "Messages" };
  if (pathname === "/learn" || pathname === "/learn/academy" || pathname === "/learn/academy/start-with-r20") return { view: "academy" };
  if (solutionRoutes[pathname]) return { view: "solution", solutionKey: solutionRoutes[pathname], authMode: "signin", initialTab: "Dashboard" };
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
  const reviewMatch = window.location.pathname.match(/^\/review\/([^\/]+)\/?$/);

  if (publicBusinessMatch) {
    return <PublicBusinessPage slug={decodeURIComponent(publicBusinessMatch[1])} />;
  }

  if (reviewMatch) {
    return <ReviewSubmissionPage slug={decodeURIComponent(reviewMatch[1])} />;
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

  if (route.view === "academy") {
    return <VulaAcademyPage />;
  }

  return (
    <LandingPage
      onSignup={() => openAuth("signup")}
      onSignin={() => openAuth("signin")}
    />
  );
}