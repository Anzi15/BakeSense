import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login.jsx";
import ChartOfAccounts from "./pages/Factory-pages/ChartOfAccounts.jsx";
import NoAccessPage from "./pages/NoAccessPage.jsx";
import StandardLayout from "./layouts/StandardLayout";
import { AuthContext } from "./hooks/AuthContext.js"; // Ensure correct import

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const noLayoutPages = ["/login"];
  return noLayoutPages.includes(location.pathname) ? children : <StandardLayout>{children}</StandardLayout>;
};

const Root = () => {
  const { user, loading } = useContext(AuthContext); // Now this won't be undefined

  if (loading) {
    return <div>Loading...</div>; // Prevent rendering before context is ready
  }

  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chart-of-accounts" element={user?.role === "factory" ? <ChartOfAccounts /> : <NoAccessPage />} />
      </Routes>
    </LayoutWrapper>
  );
};

export default Root;
