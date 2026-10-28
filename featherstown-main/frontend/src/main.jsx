import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { enforceHttps } from "./utils/security";
import { initErrorMonitoring } from "./utils/errorMonitoring";

// 1. Force HTTPS in live environments
enforceHttps();

// 2. Initialize error monitoring
initErrorMonitoring();

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);