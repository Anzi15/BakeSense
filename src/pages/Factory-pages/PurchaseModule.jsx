import React, { useState, useEffect } from "react";
import {
  getDocs,
  collection,
  getDoc,
  arrayUnion,
  setDoc,
  doc,
  updateDoc,
  where,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../helpers/firebase/config";
import ItemListModal from "../../components/ItemListModal";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { v4 } from "uuid";

const PurchaseModule = () => {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemList, setShowItemList] = useState(false);
  const [showSupplierList, setShowSupplierList] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [discounts, setDiscounts] = useState();
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  });

  const [tax, setTax] = useState();
  useEffect(() => {
    const fetchRawItems = async () => {
      toast.success(
        "You are online. Any offline transactions will be synced automatically."
      );
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

        setRawItems(Array.from(mergedItems.values()));
      } catch (error) {
        console.error("Error fetching raw items:", error);
        const offlineItems =
          JSON.parse(localStorage.getItem("offlineRawItems")) || [];
        const offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];
        setRawItems(
          offlineItems.filter((item) => !offlineDeletes.includes(item.id))
        );
      }
    };

    fetchRawItems();
  }, []);

  const handleItemSelect = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) return prev;
      return [...prev, { ...item, quantity: 1, pricePerUnit: 0 }];
    });
    setShowItemList(false);
  };

  const handleQuantityChange = (id, quantity) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  const handlePriceChange = (id, price) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pricePerUnit: Number(price) } : item
      )
    );
  };
  const handleRemoveItem = (id) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSupplierSelection = (supplier) => {
    setSupplier(supplier);
    setSelectedSupplier(supplier);
    setShowSupplierList(false);
  };

  const fetchAccounts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "accounts"));
      let accountsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const offlineAccounts =
        JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      const offlineDeletes =
        JSON.parse(localStorage.getItem("offlineDeletes")) || [];

      accountsList = accountsList?.filter(
        (acc) => !offlineDeletes.includes(acc.id)
      );

      const mergedAccounts = [...accountsList, ...offlineAccounts].reduce(
        (acc, curr) => {
          acc.set(curr.accountCode, curr);
          return acc;
        },
        new Map()
      );

      const uniqueAccounts = Array.from(mergedAccounts.values());

      setAccounts(uniqueAccounts?.filter((acc) => acc.category === "Account"));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      const offlineAccounts =
        JSON.parse(localStorage.getItem("offlineAccounts")) || [];
      const offlineDeletes =
        JSON.parse(localStorage.getItem("offlineDeletes")) || [];

      const filteredAccounts = offlineAccounts?.filter(
        (acc) => !offlineDeletes.includes(acc.id)
      );
      setAccounts(
        filteredAccounts?.filter((acc) => acc.category === "Account")
      );
    }
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedSupplier.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Supplier",
        text: "Please select a supplier before proceeding.",
      });
      return;
    } else if (selectedItems.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Items Added",
        text: "Please add items to the list before submitting.",
      });
      return;
    }
  
    setLoading(true);
  
    try {
      const taxVar = tax ? parseFloat(tax || 0) : 0
      const discountsVar = discounts ? parseFloat(discounts || 0) : 0
      const totalPurchaseAmount =
        selectedItems.reduce((acc, item) => acc + item.quantity * item.pricePerUnit, 0) + taxVar - discountsVar
        
  
      const newPurchase = {
        id: v4(),
        date,
        items: selectedItems,
        supplierId: supplier,
        discounts: discounts ? discounts : 0,
        tax: tax ? tax : 0,
        total: totalPurchaseAmount,
      };
  
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
  
      const docRef = doc(db, "purchases", formattedDate);
  
      // ✅ Fetch raw items from Firestore using itemCode
      for (const item of selectedItems) {
        const q = query(collection(db, "rawItems"), where("itemCode", "==", item.itemCode));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const rawItemDoc = querySnapshot.docs[0]; // First matching document
          const rawItem = rawItemDoc.data();
          const lastPurchasePrice = parseFloat(rawItem.lastPurchasePrice || 0);
          const lowestPurchasePrice = parseFloat(rawItem.lowestPurchasePrice || item.pricePerUnit);
  
          // ✅ Show Swal for price changes
          if (item.pricePerUnit > lastPurchasePrice && lastPurchasePrice > 0) {
            await Swal.fire({
              icon: "warning",
              title: "Price Increase Alert!",
              text: `The new price of ${item.itemName} is higher (${item.pricePerUnit}) than the last purchase price (${lastPurchasePrice}).`,
              confirmButtonText: "OK",
            });
          } else if (item.pricePerUnit < lowestPurchasePrice) {
            await Swal.fire({
              icon: "success",
              title: "Great Deal!",
              text: `You're purchasing ${item.itemName} at the lowest price so far (${item.pricePerUnit}), previous lowest was (${lowestPurchasePrice}).`,
              confirmButtonText: "Awesome!",
            });
          }
  
          // ✅ Update Firestore with new prices
          await updateDoc(doc(db, "rawItems", rawItemDoc.id), {
            lastPurchasePrice: item.pricePerUnit,
            lowestPurchasePrice: Math.min(lowestPurchasePrice, item.pricePerUnit),
          });
        }
      }

      const [day, month, year] = formattedDate.split("-").map(Number);
const dateObject = new Date(year, month - 1, day); // Month is 0-based in JS

// Convert to Firestore Timestamp
const timestamp = Timestamp.fromDate(dateObject);
  
      if (navigator.onLine) {
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            "purchases": arrayUnion(newPurchase),
          });
        } else {
          await setDoc(docRef, {
            purchases: [newPurchase],
            date: timestamp,
          });
        }
  
        await updateLedger(supplier, totalPurchaseAmount);
        syncOfflinePurchases();
      } else {
        // Handle offline storage
        const offlinePurchases = JSON.parse(localStorage.getItem("offlinePurchases")) || {};
        if (!offlinePurchases[formattedDate]) offlinePurchases[formattedDate] = [];
        offlinePurchases[formattedDate].push(newPurchase);
        localStorage.setItem("offlinePurchases", JSON.stringify(offlinePurchases));
  
        Swal.fire({
          icon: "info",
          title: "Offline Mode",
          text: "You are offline. The purchase is saved locally and will sync when online.",
          confirmButtonText: "OK",
        });
  
        saveOfflineTransaction(supplier, totalPurchaseAmount);
      }
  
      Swal.fire({
        icon: "success",
        title: "Purchase Added Successfully",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Add Another Purchase",
        denyButtonText: "Return to Home",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("Adding another purchase...");
        } else if (result.isDenied) {
          window.location.href = "/";
        }
      });
  
    } catch (error) {
      console.error("Error adding entry:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add entry. Please try again.",
      });
    } finally {
      setSelectedItems([]);
      setDiscounts("");
      setLoading(false);
      setTax("");
    }
  };
  
  // Update ledger (only adds to total_payable)
  const updateLedger = async (accountId, amount) => {
    if (amount <= 0) return; // Ignore invalid values

    const ledgerRef = doc(db, "ledgers", accountId);

    try {
      const ledgerSnap = await getDoc(ledgerRef);

      if (!ledgerSnap.exists()) {
        // Create ledger if missing
        const newLedger = {
          name: `Account ${accountId}`,
          total_payable: amount, // First payable amount
          total_receivables: 0, // Always 0 in purchases
        };
        await setDoc(ledgerRef, newLedger);
        return;
      }

      // Update existing ledger (only total_payable)
      const ledgerData = ledgerSnap.data();
      await updateDoc(ledgerRef, {
        total_payable: (ledgerData.total_payable || 0) + amount,
      });
    } catch (error) {
      console.error("Failed to update ledger:", error);
      saveOfflineTransaction(accountId, amount); // Save if offline
    }
  };

  // Save offline transaction if Firestore update fails
  const saveOfflineTransaction = (accountId, amount) => {
    const offlineTxns =
      JSON.parse(localStorage.getItem("offlineLedgers")) || [];
    offlineTxns.push({ accountId, amount });
    localStorage.setItem("offlineLedgers", JSON.stringify(offlineTxns));
  };

  // Sync function to push offline transactions when online
  const syncOfflineTransactions = async () => {
    const offlineTxns =
      JSON.parse(localStorage.getItem("offlineLedgers")) || [];

    if (offlineTxns.length === 0) return;

    for (const { accountId, amount } of offlineTxns) {
      try {
        await updateLedger(accountId, amount);
      } catch (error) {
        console.error("Failed to sync transaction:", error);
        return;
      }
    }

    // Clear offline transactions once synced
    localStorage.removeItem("offlineLedgers");
  };

  // Listen for internet connection

  const syncOfflinePurchases = async () => {
    if (!navigator.onLine) return;

    const offlinePurchases =
      JSON.parse(localStorage.getItem("offlinePurchases")) || {};

    for (const date in offlinePurchases) {
      const docRef = doc(db, "purchases", date);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          purchases: arrayUnion(...offlinePurchases[date]),
        });
      } else {
        await setDoc(docRef, {
          purchases: offlinePurchases[date],
        });
      }
    }

    // Clear local storage after syncing
    localStorage.removeItem("offlinePurchases");

    console.log("Offline purchases synced!");
  };

  useEffect(() => {
    window.addEventListener("online", syncOfflinePurchases);

    return () => {
      window.removeEventListener("online", syncOfflinePurchases);
    };
  }, []);
  useEffect(() => {
    window.addEventListener("online", syncOfflineTransactions);

    return () => {
      window.addEventListener("online", syncOfflineTransactions);
    };
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Purchase Module</h1>

      <div className="mb-4">
        <label className="font-semibold">Select Date:</label>
        <input
          type="date"
          value={date}
          required
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <label className="font-semibold">Select Supplier:</label>
        <button
          onClick={() => setShowSupplierList(true)}
          className="border p-2 w-full mb-2"
        >
          {selectedSupplier || "Choose an Account"}
        </button>
      </div>
      {showSupplierList && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-2">Select a Supplier</h3>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />

            <ul>
              {accounts
                .filter((account) =>
                  `${account.accountCode} ${account.accountName}`
                    .toLowerCase()
                    .includes(supplierSearch.toLowerCase())
                )
                .map((account) => (
                  <div
                    key={account.id}
                    className="p-2 border-b hover:bg-gray-200 cursor-pointer flex justify-between gap-6"
                    onClick={() => handleSupplierSelection(account.accountCode)}
                  >
                    <p>{account.accountCode}</p>
                    <p>{account.accountName}</p>
                  </div>
                ))}
            </ul>

            <button
              onClick={() => setShowSupplierList(false)}
              className="mt-4 p-2 bg-red-500 text-white rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {showItemList && (
            <ItemListModal
              items={rawItems}
              onSelect={handleItemSelect}
              onClose={() => setShowItemList(false)}
            />
          )}
          <ul>
            <h3 className="font-bold text-2xl mb-4">Selected Items</h3>
            {selectedItems.map((item) => (
              <li
                key={item.id}
                className="p-2 border-b flex justify-between items-center"
              >
                <span className="font-semibold">Item:</span>{" "}
                <span>{item.itemName}</span>
                <label
                  htmlFor={`quantity-${item.id}`}
                  className="font-semibold"
                >
                  Quantity (in {item.itemUnit}):
                </label>
                <input
                  id={`quantity-${item.id}`}
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                  className="w-16 p-1 border"
                  min="1"
                />
                <label htmlFor={`price-${item.id}`} className="font-semibold">
                  Price per Unit:
                </label>
                <input
                  id={`price-${item.id}`}
                  type="number"
                  value={item.pricePerUnit}
                  onChange={(e) => handlePriceChange(item.id, e.target.value)}
                  className="w-16 p-1 border"
                  min="0"
                />
                <label className="font-semibold">Total:</label>
                <input
                  type="number"
                  value={item.pricePerUnit * item.quantity}
                  className="w-32 p-1 border bg-gray-100"
                  readOnly
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {selectedItems.length > 0 && (
            <div className="flex gap-4 my-8">
              <input
                type="number"
                placeholder="Any discounts"
                value={discounts}
                onChange={(e) => setDiscounts(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="number"
                placeholder="Any taxes"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
            </div>
          )}

          {selectedItems.length > 0 && (
            <div className="w-full font-bold text-lg mt-4">
              <div>Taxes: {tax || 0}</div>
              <div>Discounts: {discounts || 0}</div>
              <div>
                Grand Total:{" "}
                {(
                  selectedItems.reduce(
                    (acc, item) => acc + item.quantity * item.pricePerUnit,
                    0
                  ) +
                  parseFloat(tax || 0) -
                  parseFloat(discounts || 0)
                ).toFixed(2)}
              </div>
            </div>
          )}

          <button
            type="button"
            className="bg-blue-700 text-white px-4 my-7 py-3 rounded hover:bg-blue-800 "
            onClick={() => setShowItemList(true)}
          >
            Add An Item
          </button>

          <button
            className="w-full bg-blue-500 text-white text-lg py-2 mt-6"
            type="submit"
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
      </div>

      <a href="/purchase-module/history">
        <button className="px-3 bg-blue-500 text-white text-lg py-2 mt-6">
          View Purchase History
        </button>
      </a>
    </div>
  );
};

export default PurchaseModule;
