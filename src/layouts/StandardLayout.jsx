import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../helpers/firebase/config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../hooks/AuthContext";

const StandardLayout = ({ children }) => {
  const { user, loading, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  if (loading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const logOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("savedUsers"); // Clear offline data
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar userRole={user?.role === "factory" ?"factory": "branch"} />
      <div className="flex-1 bg-gray-100 overflow-auto sm:pl-64">
        <Navbar logOut={logOut} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default StandardLayout;
