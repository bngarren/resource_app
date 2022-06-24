import { createRoot } from "react-dom/client";
import "./styles//index.css";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { AuthProvider } from "./global/auth";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
