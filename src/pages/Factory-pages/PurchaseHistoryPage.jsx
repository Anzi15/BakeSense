import React, { useEffect, useState } from "react";
import { db } from "../../helpers/firebase/config"; // Ensure this points to your Firebase config
import { collection, query, where, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

const PurchaseHistoryPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const startTimestamp = Timestamp.fromDate(new Date(startDate));
        const endTimestamp = Timestamp.fromDate(new Date(endDate));

        console.log("Querying between:", startTimestamp, endTimestamp);

        const purchasesRef = collection(db, "purchases");
        const q = query(
          purchasesRef,
          where("date", ">=", startTimestamp),
          where("date", "<=", endTimestamp)
        );

        const querySnapshot = await getDocs(q);
        const results = [];

        querySnapshot.forEach((doc) => {
          results.push(...(doc.data().purchases || []));
        });

        console.log("Fetched purchases:", results);
        setPurchases(results);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [startDate, endDate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Purchase History</h1>
      <div className="mb-4 flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2"
        />
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : purchases.length === 0 ? (
        <p>No purchases found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Item Name</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Price Per Unit</th>
              <th className="border border-gray-300 px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase, index) =>
              (purchase.items || []).map((item, i) => (
                <tr key={`${index}-${i}`} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">
                    {purchase.date}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.itemName}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.category}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.quantity} {item.itemUnit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.pricePerUnit}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {purchase.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
