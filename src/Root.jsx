import React, { useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login.jsx";
import ChartOfAccounts from "./pages/Factory-pages/ChartOfAccounts.jsx";
import NoAccessPage from "./pages/NoAccessPage.jsx";
import StandardLayout from "./layouts/StandardLayout";
import { AuthContext } from "./hooks/AuthContext.js"; // Ensure correct import
import Inventory from "./pages/Factory-pages/Inventory.jsx";
import PaymentVoucher from "./pages/Factory-pages/Payment-voucher.jsx";
import DayEntries from "./pages/Factory-pages/DayEntries.jsx";
import ReceiveVoucher from "./pages/Factory-pages/Recive-voucher.jsx";
import ReceiveDayEntriesPage from "./pages/Factory-pages/ReciveDayEntries.jsx";
import RawGoodsInventory from "./pages/Factory-pages/RawGoodsInventory.jsx";
import RawItems from "./pages/Factory-pages/RawItems.jsx";
import RecipeBook from "./pages/Factory-pages/RecipeBook.jsx";
import AddNewRecipeBook from "./pages/Factory-pages/AddNewRecipe.jsx";

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
        <Route path="/inventory" element={user?.role === "factory" ? <Inventory /> : <NoAccessPage />} />
        <Route path="/inventory/raw-goods" element={user?.role === "factory" ? <RawGoodsInventory /> : <NoAccessPage />} />
        <Route path="/payment-voucher" element={user?.role === "factory" ? <PaymentVoucher /> : <NoAccessPage />} />
        <Route path="/payment-voucher/day/:date" element={user?.role === "factory" ? <DayEntries /> : <NoAccessPage />} />
        <Route path="/receive-voucher" element={user?.role === "factory" ? <ReceiveVoucher /> : <NoAccessPage />} />
        <Route path="/receive-voucher/day/:date" element={user?.role === "factory" ? <ReceiveDayEntriesPage /> : <NoAccessPage />} />
        <Route path="/items-list" element={user?.role === "factory" ? <RawItems /> : <NoAccessPage />} />
        <Route path="/recipe-book" element={user?.role === "factory" ? <RecipeBook /> : <NoAccessPage />} />
        <Route path="/recipe-book/new" element={user?.role === "factory" ? <AddNewRecipeBook /> : <NoAccessPage />} />
      </Routes>
    </LayoutWrapper>
  );
};

export default Root;
