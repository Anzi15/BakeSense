import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const StandardLayout = ({ children }) => {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1  bg-gray-100 overflow-auto sm:pl-64">
            <Navbar/>
            <div className="p-4">

          {children}
            </div>
        </div>
      </div>
    );
  };
  

export default StandardLayout;
