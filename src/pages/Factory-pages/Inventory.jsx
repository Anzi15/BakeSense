import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Inventory = () => {
  return (
    <main>
      <section className="flex w-full justify-between items-center gap-4">
        <Link
          className="w-1/3 flex items-start justify-center p-4 aspect-video rounded-lg bg-[#FAFBFC] group border-2 transition-all duration-200 shadow-md border-[#BDC3c7] hover:scale-[1.01] flex-col"
          to={"/inventory/raw-goods"}
        >
          <h2 className="text-4xl text-gray-900 font-extrabold">Raw Goods</h2>
          <p>Audit the inventory reports of all of your raw items</p>
          <div className="flex gap-2 items-center group-hover:gap-4 text-blue-600 py-6 font-bold">
            Go to raw goods
            <FaArrowRight />
          </div>
        </Link>
        <Link
          className="w-1/3 flex items-start justify-center p-4 aspect-video rounded-lg bg-[#FAFBFC] group border-2 transition-all duration-200 shadow-md border-[#BDC3c7] hover:scale-[1.01] flex-col"
          to={"/inventory/ready-products"}
        >
          <h2 className="text-4xl text-gray-900 font-extrabold">Ready Products</h2>
          <p>Audit the inventory reports of all of your ready products</p>
          <div className="flex gap-2 items-center group-hover:gap-4 text-blue-600 py-6 font-bold">
            Go to ready products
            <FaArrowRight />
          </div>
        </Link>
        <Link
          className="w-1/3 flex items-start justify-center p-4 aspect-video rounded-lg bg-[#FAFBFC] group border-2 transition-all duration-200 shadow-md border-[#BDC3c7] hover:scale-[1.01] flex-col"
          to={"/inventory/waste-management"}
        >
          <h2 className="text-4xl text-gray-900 font-extrabold">Wasted Goods
          </h2>
          <p>Manage and track waste disposal efficiently</p>
          <div className="flex gap-2 items-center group-hover:gap-4 text-blue-600 py-6 font-bold">
            Go to waste management
            <FaArrowRight />
          </div>
        </Link>
      </section>

      <section className="py-4">
        <h2 className="text-2xl font-bold mb-4">Raw Goods</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Flour</td>
                <td className="border border-gray-300 px-4 py-2">100 kg</td>
                <td className="border border-gray-300 px-4 py-2">$2/kg</td>
                <td className="border border-gray-300 px-4 py-2">$200</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Sugar</td>
                <td className="border border-gray-300 px-4 py-2">50 kg</td>
                <td className="border border-gray-300 px-4 py-2">$1.5/kg</td>
                <td className="border border-gray-300 px-4 py-2">$75</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <Link to="/inventory/raw-goods" className="text-blue-600 font-medium hover:underline">View All →</Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-6 mb-4">Ready Products</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Stock</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Selling Price</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Total Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Chocolate Cake</td>
                <td className="border border-gray-300 px-4 py-2">20 pcs</td>
                <td className="border border-gray-300 px-4 py-2">$10/pc</td>
                <td className="border border-gray-300 px-4 py-2">$200</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Cookies</td>
                <td className="border border-gray-300 px-4 py-2">50 pcs</td>
                <td className="border border-gray-300 px-4 py-2">$2/pc</td>
                <td className="border border-gray-300 px-4 py-2">$100</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <Link to="/inventory/ready-products" className="text-blue-600 font-medium hover:underline">View All →</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Inventory;
