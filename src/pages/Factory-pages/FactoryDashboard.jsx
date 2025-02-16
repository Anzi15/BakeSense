import React from 'react'
import ProductionChart from '../../components/charts/ProductionChart'
import RawIngredientsChart from '../../components/charts/RawIngredeintsChart'
import { Link } from 'react-router-dom';

const FactoryDashboard = () => {
  const vendors = [
    { name: "ABC Flour Mills", category: "Flour", deliveries: 50, lastDelivery: "Feb 12", status: "On Time", contact: "John Doe", phone: "123-456-7890", location: "Lahore", payment: "Paid" },
    { name: "XYZ Sugar Ltd.", category: "Sugar", deliveries: 30, lastDelivery: "Feb 10", status: "Delayed", contact: "Jane Smith", phone: "987-654-3210", location: "Karachi", payment: "Pending" },
  ];
  return (
    <div>
      <div className="flex gap-4 justify-between">
        <div className='w-1/2'>

      <ProductionChart />
        </div>

        <div className='w-[45%]'>
      <RawIngredientsChart />
        </div>

      </div>

      <div className="w-full flex flex-col text-left py-10 px-5">
        <div className='flex w-full justify-between flex items-center'>

      <h2 className="text-3xl font-black mb-6">📌 Vendor Information</h2>

      <Link to={"/vendors"}>
      View all
      </Link>
        </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md w-full">
        <h2 className="text-xl font-semibold mb-4">🚚 Vendor Details</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Vendor</th>
              <th className="p-3">Category</th>
              <th className="p-3">Total Deliveries</th>
              <th className="p-3">Last Delivery</th>
              <th className="p-3">Status</th>
              <th className="p-3">Contact Person</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Location</th>
              <th className="p-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{vendor.name}</td>
                <td className="p-3">{vendor.category}</td>
                <td className="p-3">{vendor.deliveries}</td>
                <td className="p-3">{vendor.lastDelivery}</td>
                <td className={`p-3 font-medium ${vendor.status === "Delayed" ? "text-red-500" : "text-green-500"}`}>
                  {vendor.status}
                </td>
                <td className="p-3">{vendor.contact}</td>
                <td className="p-3">{vendor.phone}</td>
                <td className="p-3">{vendor.location}</td>
                <td className={`p-3 font-medium ${vendor.payment === "Pending" ? "text-red-500" : "text-green-500"}`}>
                  {vendor.payment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}

export default FactoryDashboard
