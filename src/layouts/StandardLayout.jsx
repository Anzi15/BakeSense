import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../helpers/firebase/config"; // Ensure Firebase is correctly initialized
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const StandardLayout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Use react-router's navigate

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login"); // Redirect if not authenticated
      } else {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const logOut = async () => {
    try {
      await auth.signOut();
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-gray-100 overflow-auto sm:pl-64">
        <Navbar logOut={logOut} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default StandardLayout;
