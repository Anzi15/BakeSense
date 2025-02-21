import React, { useState } from "react";
import { MdAttachMoney, MdDashboard, MdInventory, MdOutlineAttachMoney } from "react-icons/md";
import { FaGetPocket, FaThList } from "react-icons/fa";
import { BsCashStack } from "react-icons/bs";

const Sidebar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar options based on role
  const sidebarOptionsFactory = [
    {
      label: "Dashboard",
      link: "/",
      icon: MdDashboard,
    },
    {
      label: "Chart of Accounts",
      link: "/chart-of-accounts",
      icon: FaThList,
    },
    {
      label: "Inventory",
      link: "/inventory",
      icon: MdInventory,
    },
    {
      label: "Payment Voucher",
      link: "/payment-voucher",
      icon: MdOutlineAttachMoney,
    },
    {
      label: "Receive Voucher",
      link: "/receive-voucher",
      icon: FaGetPocket,
    },
  ];

  const sidebarOptionsBakery = [
    {
      label: "Dashboard",
      link: "/",
      icon: MdDashboard,
    },
    
  ];

  // Select the appropriate sidebar options
  const sidebarOptions = userRole === "factory" ? sidebarOptionsFactory : sidebarOptionsBakery;

  return (
    <>
      {/* Toggle Button for Small Screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="sm:hidden p-2 mt-2 ml-3 text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <span className="sr-only">Open sidebar</span>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-50 dark:bg-gray-800 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {sidebarOptions.map((option, index) => (
              <li key={index}>
                <a
                  href={option.link}
                  className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <option.icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400" />
                  <span className="ml-3">{option.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
