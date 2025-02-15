import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext.js"; // Ensure correct path
import "./index.css";
import Root from "./Root"; // Move Root to a separate file if needed

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* Ensure AuthProvider is the highest wrapper */}
      <Router>
        <Root />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
