"use client";

import { useState, useEffect } from "react";
import { db } from "../../helpers/firebase/config"; // Ensure Firebase is configured correctly
import { collection, getDocs } from "firebase/firestore";
import { CSVLink } from "react-csv";

export default function RawGoodsInventory() {
  const [goods, setGoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRawItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "rawItems"));
        let itemsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const offlineItems =
          JSON.parse(localStorage.getItem("offlineRawItems")) || [];
        const offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];

        itemsList = itemsList.filter(
          (item) => !offlineDeletes.includes(item.id)
        );

        console.log("offlineItems", offlineItems);
        console.log("itemsList", itemsList);

        const mergedItems = [...itemsList, ...offlineItems].reduce(
          (acc, curr) => {
            acc.set(curr.itemCode, curr);
            return acc;
          },
          new Map()
        );

        console.log("mergedItems", mergedItems);

        setGoods(Array.from(mergedItems.values()));
      } catch (error) {
        console.error("Error fetching raw items:", error);
        const offlineItems =
          JSON.parse(localStorage.getItem("offlineRawItems")) || [];
        const offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];
        setGoods(
          offlineItems.filter((item) => !offlineDeletes.includes(item.id))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRawItems();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  const filteredGoods = goods.filter((good) =>
    good.itemName.toLowerCase().includes(search.toLowerCase())
  );

  const exportData = filteredGoods.map(({ id, last_updated, ...rest }) => ({
    last_updated: last_updated ? formatTimestamp(last_updated) : null,
    ...rest,
  }));
  

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "30%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <CSVLink data={exportData} filename="raw_goods_inventory.csv">
          <button
            style={{
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Export to CSV
          </button>
        </CSVLink>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f8f8f8", textAlign: "left" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Last Updated
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Minimum Stock
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Name</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>
              Stock Quantity
            </th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {loading ? "Loading..." : (
          <>
          {filteredGoods.map((good) => (
            <tr key={good.itemCode} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {good.last_updated ? good.last_updated : null}
              </td>

              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {good.minimumQuantity}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {good.itemName}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {good.quantity}
              </td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {good.itemUnit}
              </td>
            </tr>
          ))}
          </>
          )}
        </tbody>
      </table>
    </div>
  );
}
