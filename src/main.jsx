import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

// Public business page data rendered by the server, reused so the page does not reload it.
const initialPublicPage = window.__VULA_PUBLIC_PAGE__ || null;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App initialPublicPage={initialPublicPage} />
  </React.StrictMode>
);
