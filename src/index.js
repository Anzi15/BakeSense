import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./pages/Login.jsx"; // Assuming Login page exists
import StandardLayout from "./layouts/StandardLayout";
import { AuthProvider } from "./hooks/AuthContext.js";

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const noLayoutPages = ["/login"];

  return noLayoutPages.includes(location.pathname) ? (
    children
  ) : (
    <StandardLayout>{children}</StandardLayout>
  );
};

const Root = () => {
  return (
    <Router>
      <AuthProvider>

      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </LayoutWrapper>
      </AuthProvider>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
