import { useState } from "react";

const PaymentVoucherTable = ({ allEntries=[], editEntry, deleteEntry }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Search by "payer" only
  const filteredEntries = allEntries?.filter((entry) =>
    entry.payer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      return sortOrder === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    }
  });

  return (
    <div className="p-6 mx-auto bg-white my-6 w-fit">
      {/* Search by Payer */}
      <input
        type="text"
        placeholder="Search by Payer code..."
        className="mb-4 p-2 border w-fit pr-40 border-gray-300 rounded"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Sorting Options */}
      <div className="mb-4 flex gap-2">
        <select
          className="p-2 border border-gray-300 rounded"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="">Sort By...</option>
          <option value="amount">Amount</option>
          <option value="cashier">Cashier</option>
          <option value="payer">Payer</option>
          <option value="paymentMethod">Payment Method</option>
          <option value="settlementAmount">Settlement Amount</option>
          <option value="timestamp">Timestamp</option>
        </select>
        <select
          className="p-2 border border-gray-300 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            {[
              "amount",
              "cashier",
              "payer",
              "paymentMethod",
              "remarks",
              "settlementAmount",
              "timestamp",
              "transactionId",
              "voucherNumber",
            ].map((field) => (
              <th key={field} className="border border-gray-300 px-4 py-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </th>
            ))}
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries?.map((entry, index) => (
            <tr key={index} className="border border-gray-300">
              <td className="border border-gray-300 px-4 py-2">{entry.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.cashier}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.payer}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.paymentMethod}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.remarks}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.settlementAmount}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.timestamp}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.transactionId || "N/A"}</td>
              <td className="border border-gray-300 px-4 py-2">{entry.voucherNumber}</td>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => editEntry(entry)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEntry(entry.voucherNumber)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentVoucherTable;
