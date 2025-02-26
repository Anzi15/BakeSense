import { useState, useEffect } from "react";
import { db } from "../../helpers/firebase/config"; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid'
import Swal from "sweetalert2";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const RawItems = () => {
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editRawItem, setEditRawItem] = useState(null);

  const [newRawItem, setNewRawItem] = useState({
    itemCode: uuidv4(),
    itemName: "",
    itemUnit: "kg",
    quantity: 0,
    pricePerUnit: 0, // Optional
    supplierName: "",
    minimumQuantity: 0, // Optional
    category: "Raw Material",
    description: "", // Optional
  });

  const editRawItemHandler = (rawItems) => {
    setEditRawItem(rawItems);
    setNewRawItem({
      rawItemCode: rawItems.rawItemCode,
      rawItemName: rawItems.rawItemName,
      rawItemType: rawItems.rawItemType,
      rawItemsType: rawItems.rawItemsType,
      openingBalance: rawItems.openingBalance,
      currentBalance: rawItems.currentBalance,
    });
  };

  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine) {
        const offlineData =
          JSON.parse(localStorage.getItem("offlineRawItems")) || [];
        if (offlineData.length > 0) {
          try {
            for (const item of offlineData) {
              const docRef = await addDoc(collection(db, "rawItems"), item);
              setRawItems((prevItems) => [
                ...prevItems,
                { id: docRef.id, ...item },
              ]);
            }
            localStorage.removeItem("offlineRawItems");
          } catch (error) {
            console.error("Error syncing offline raw items:", error);
          }
        }
      }
    };

    window.addEventListener("online", syncOfflineData);
    return () => {
      window.removeEventListener("online", syncOfflineData);
    };
  }, []);

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
      } finally {
        setLoading(false);
      }
    };

    fetchRawItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    setAddingItem(true);

    if (!navigator.onLine) {
      Swal.fire({
        icon: "warning",
        title: "Offline Mode",
        text: "You are offline. Your changes will be saved locally and synced when you are back online.",
      });
      const offlineData =
        JSON.parse(localStorage.getItem("offlineRawItems")) || [];
      offlineData.push(newRawItem);
      localStorage.setItem("offlineRawItems", JSON.stringify(offlineData));
      setRawItems((prevItems) => [
        ...prevItems,
        { id: `offline-${Date.now()}`, ...newRawItem },
      ]);
      resetForm();
      setAddingItem(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "rawItems"), newRawItem);
      setRawItems((prevItems) => [
        ...prevItems,
        { id: docRef.id, ...newRawItem },
      ]);
      resetForm();
    } catch (error) {
      console.error("Error adding raw item:", error);
    } finally {
      setNewRawItem({
        itemCode: uuidv4(),
        itemName: "",
        itemUnit: "kg",
        quantity: 0,
        pricePerUnit: 0, // Optional
        supplierName: "", // Optional
        category: "Raw Material",
        description: "", // Optional
        minimumQuantity: 0
      })
      setAddingItem(false);
    }
  };

  const deleteRawItem = async (rawItemId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        // Load offline rawItems
        let offlineRawItems =
          JSON.parse(localStorage.getItem("offlineRawItems")) || [];
        let offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];

        // Check if the rawItem exists in localStorage (offline)
        const isOfflineRawItem = offlineRawItems.some(
          (acc) => acc.id === rawItemId
        );

        if (isOfflineRawItem) {
          // Remove from localStorage (offline rawItems)
          offlineRawItems = offlineRawItems.filter(
            (acc) => acc.id !== rawItemId
          );
          localStorage.setItem(
            "offlineRawItems",
            JSON.stringify(offlineRawItems)
          );

          // Remove from state
          setRawItems((prevRawItems) =>
            prevRawItems.filter((acc) => acc.id !== rawItemId)
          );

          Swal.fire(
            "Deleted!",
            "The offline rawItem has been deleted.",
            "success"
          );
        } else if (!navigator.onLine) {
          // If offline, mark for later deletion
          offlineDeletes.push(rawItemId);
          localStorage.setItem(
            "offlineDeletes",
            JSON.stringify(offlineDeletes)
          );

          // Remove from state immediately
          setRawItems((prevRawItems) =>
            prevRawItems.filter((acc) => acc.id !== rawItemId)
          );

          Swal.fire(
            "Deleted!",
            "The rawItem will be removed from Firestore when online.",
            "success"
          );
        } else {
          // If online, delete from Firestore immediately
          await deleteDoc(doc(db, "rawItems", rawItemId));
          setRawItems((prevRawItems) =>
            prevRawItems.filter((acc) => acc.id !== rawItemId)
          );
          Swal.fire(
            "Deleted!",
            "The rawItem has been deleted from Firestore.",
            "success"
          );
        }
      } catch (error) {
        console.error("Error deleting rawItem:", error);
        Swal.fire("Error", "There was an issue deleting the rawItem.", "error");
      }
    }
  };

  const updateItem = async (e) => {
    e.preventDefault();
    try {
      const rawItemRef = doc(db, "rawItems", editItem.id);
      await updateDoc(rawItemRef, newRawItem);

      setRawItems((prevRawItems) =>
        prevRawItems.map((item) =>
          item.id === editItem.id ? { ...item, ...newRawItem } : item
        )
      );

      setEditItem(null);
      resetForm();
    } catch (error) {
      console.error("Error updating raw item:", error);
    }
  };

  const resetForm = () => {
    setNewRawItem({
      itemCode: "",
      itemName: "",
      unit: "kg",
      quantity: 0,
      category: "Raw Material",
      itemType: "",
      vendorsType: "",
      openingBalance: 0,
      currentBalance: 0,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Raw Items List</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editItem ? "Edit Item" : "Add Item"}
        </h2>
        <form
          onSubmit={editItem ? updateItem : addItem}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <label
              htmlFor="accountCode"
              className="block text-sm font-medium text-gray-700"
            >
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              placeholder="Item Name"
              value={newRawItem.itemName}
              onChange={(e) =>
                setNewRawItem({ ...newRawItem, itemName: e.target.value })
              }
              required
              className="border border-gray-300 p-2 mt-1 w-full"
            />
          </div>

          <div>
  <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
    Account Type
  </label>
  <select
    id="itemUnit"
    value={newRawItem.itemUnit}
    onChange={(e) => setNewRawItem({ ...newRawItem, itemUnit: e.target.value })}
    className="border border-gray-300 p-2 mt-1 w-full bg-white"
  >
    <option value="" disabled>Select Unit Type</option>
    <option value="KG">Kilogram (kg)</option>
    <option value="L">Liter (L)</option>
    <option value="DZ">Dozen (dz)</option>
  </select>
</div>

          <div>
            <label
              htmlFor="pricePerUnit"
              className="block text-sm font-medium text-gray-700"
            >
              Price Per Unit (in Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                Rs.
              </span>
              <input
                id="itemPricePerUnit"
                type="number"
                placeholder="Item Price Per Unit"
                value={newRawItem.pricePerUnit}
                onChange={(e) =>
                  setNewRawItem({ ...newRawItem, pricePerUnit: e.target.value })
                }
                required
                className="border border-gray-300 p-2 pl-10 mt-1 w-full"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="accountCode"
              className="block text-sm font-medium text-gray-700"
            >
              Minimum Quantity Before Warning (Optional)
            </label>
            <input
              id="minimumQuantity"
              placeholder="Minimum quantity before warning"
              value={newRawItem.minimumQuantity}
              onChange={(e) =>
                setNewRawItem({ ...newRawItem, minimumQuantity: e.target.value })
              }
              className="border border-gray-300 p-2 mt-1 w-full"
            />
          </div>

          <button
            type="submit"
            className="col-span-3 bg-blue-500 text-white p-2 rounded"
          >
            {addingItem ? "Loading..." : editItem ? "Update Item" : "Add Item"}
          </button>
        </form>
      </div>

      <div className="pb-8">
        <h2 className="text-xl font-semibold mb-4">Raw Items</h2>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Item Name</th>
              <th className="border p-2">Item Unit</th>
              <th className="border p-2">Price Per Unit (in Rs.)</th>
              <th className="border p-2">Minimum Quantity Before Warning</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <div className="w-full py-3 text-center flex justify-center">
                Loading...
              </div>
            ) : (
              <>
                {rawItems.map((rawItems) => (
                  <tr key={rawItems.id}>
                    <td className="border p-2">{rawItems.itemName}</td>
                    <td className="border p-2">{rawItems.itemUnit}</td>
                    <td className="border p-2">{rawItems.pricePerUnit}</td>
                    <td className="border p-2">{rawItems.minimumQuantity}</td>

                    <td className="border p-2">
                      <button
                        onClick={() => editRawItemHandler(rawItems)}
                        className="bg-yellow-500 text-white p-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteRawItem(rawItems.id)}
                        className="bg-red-500 text-white p-1 rounded ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawItems;
