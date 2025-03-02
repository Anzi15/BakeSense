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

import { useNavigate } from "react-router-dom";
import ItemListModal from "../../components/ItemListModal";
const AddNewRecipeBook = () => {
    let navigate = useNavigate();
  const [readyProducts, setRecipeBook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rawItems, setRawItems] = useState([]);
  const [selectedRawItem, setSelectedRawItem] = useState("");
  const [showRawItemList, setShowRawItemList] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editReadyProduct, setEditReadyProduct] = useState(null);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rawItem, setRawItem] = useState("");
  const [bardCode, setBarCode] = useState("")

  const [newReadyProduct, setNewReadyProduct] = useState({
    productCode: uuidv4(),
    productName: "",
    quantity: 0,
    pricePerUnit: 0, // Optional
    minimumQuantity: 0, // Optional
    lastUpdated: new Date().toISOString(),
    ingredients: [],
    barCode: null
  });
  
  const editReadyProductHandler = (readyProduct) => {
    setEditReadyProduct(readyProduct);
    setNewReadyProduct({
      productCode: readyProduct.productCode, // Use existing or generate new one
      productName: readyProduct.productName || "",
      productUnit: readyProduct.productUnit || "kg",
      quantity: readyProduct.quantity ?? 0,
      pricePerUnit: readyProduct.pricePerUnit ?? 0,
      minimumQuantity: readyProduct.minimumQuantity ?? 0,
      lastUpdated: readyProduct.lastUpdated || new Date().toISOString(),
      ingredients: readyProduct.ingredients || [],
    });
  };

  const generateRandomBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString();
  };
  

  const handleRawItemSelection = (rawItem) => {
    setSelectedRawItem(rawItem);
    setRawItem(rawItem);
    setIngredientName(rawItem);
    setShowRawItemList(false);
  };


  const addIngredient = () => {
    if (selectedRawItem.itemName && quantity) {
      const newIngredient = {
        itemName: selectedRawItem.itemName,
        quantity: parseFloat(quantity),
        itemUnit: selectedRawItem.itemUnit,
      };
  
      setNewReadyProduct((prev) => {
        const updatedIngredients = prev.ingredients.map((ingredient) =>
          ingredient.itemName === newIngredient.itemName
            ? { ...ingredient, quantity: newIngredient.quantity } // Update quantity
            : ingredient
        );
  
        // Check if ingredient exists in the list
        const ingredientExists = prev.ingredients.some(
          (ingredient) => ingredient.itemName === newIngredient.itemName
        );
  
        return {
          ...prev,
          ingredients: ingredientExists
            ? updatedIngredients // Update existing ingredient's quantity
            : [...prev.ingredients, newIngredient], // Add new ingredient
        };
      });
  
      // Reset input fields
      setIngredientName("");
      setSelectedRawItem("");
      setQuantity("");
    }
  };
  

  const removeIngredient = (index) => {
    setNewReadyProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };
  

  useEffect(() => {
    const syncOfflineData = async () => {
      if (navigator.onLine) {
        const offlineData =
          JSON.parse(localStorage.getItem("offlineRecipeBook")) || [];
        if (offlineData.length > 0) {
          try {
            for (const product of offlineData) {
              const docRef = await addDoc(collection(db, "readyProducts"), product);
              setRecipeBook((prevProducts) => [
                ...prevProducts,
                { id: docRef.id, ...product },
              ]);
            }
            localStorage.removeItem("offlineRecipeBook");
          } catch (error) {
            console.error("Error syncing offline raw products:", error);
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
    const fetchRecipeBook = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "readyProducts"));
        let productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const offlineProducts =
          JSON.parse(localStorage.getItem("offlineRecipeBook")) || [];
        const offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];

        productsList = productsList.filter(
          (product) => !offlineDeletes.includes(product.id)
        );

        console.log("offlineProducts", offlineProducts);
        console.log("productsList", productsList);
      
        const mergedProducts = [...productsList, ...offlineProducts].reduce(
          (acc, curr) => {
            acc.set(curr.productCode, curr);
            return acc;
          },
          new Map()
        );

        console.log("mergedProducts", mergedProducts);

        setRecipeBook(Array.from(mergedProducts.values()));
      } catch (error) {
        console.error("Error fetching raw products:", error);
        const offlineProducts =
          JSON.parse(localStorage.getItem("offlineRecipeBook")) || [];
        const offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];
        setRecipeBook(
          offlineProducts.filter((product) => !offlineDeletes.includes(product.id))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeBook();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    setAddingProduct(true);

    if (!navigator.onLine) {
      Swal.fire({
        icon: "warning",
        title: "Offline Mode",
        text: "You are offline. Your changes will be saved locally and synced when you are back online.",
      });
      const offlineData =
        JSON.parse(localStorage.getItem("offlineRecipeBook")) || [];
      offlineData.push(newReadyProduct);
      localStorage.setItem("offlineRecipeBook", JSON.stringify(offlineData));
      setRecipeBook((prevProducts) => [
        ...prevProducts,
        { id: `offline-${Date.now()}`, ...newReadyProduct },
      ]);
      resetForm();
      setAddingProduct(false);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "readyProducts"), newReadyProduct);
      setRecipeBook((prevProducts) => [
        ...prevProducts,
        { id: docRef.id, ...newReadyProduct },
      ]);
      resetForm();
      navigate("/recipe-book/")
    } catch (error) {
      console.error("Error adding raw product:", error);
    } finally {
      setNewReadyProduct({
        productCode: uuidv4(),
        productName: "",
        productUnit: "kg",
        quantity: 0,
        pricePerUnit: 0, // Optional
        supplierName: "", // Optional
        category: "Raw Material",
        description: "", // Optional
        minimumQuantity: 0
      })
      
      setAddingProduct(false);
    }
  };

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

  const deleteReadyProduct = async (readyProductId) => {
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
        // Load offline readyProducts
        let offlineRecipeBook =
          JSON.parse(localStorage.getItem("offlineRecipeBook")) || [];
        let offlineDeletes =
          JSON.parse(localStorage.getItem("offlineDeletes")) || [];

        // Check if the readyProduct exists in localStorage (offline)
        const isOfflineReadyProduct = offlineRecipeBook.some(
          (acc) => acc.id === readyProductId
        );

        if (isOfflineReadyProduct) {
          // Remove from localStorage (offline readyProducts)
          offlineRecipeBook = offlineRecipeBook.filter(
            (acc) => acc.id !== readyProductId
          );
          localStorage.setItem(
            "offlineRecipeBook",
            JSON.stringify(offlineRecipeBook)
          );

          // Remove from state
          setRecipeBook((prevRecipeBook) =>
            prevRecipeBook.filter((acc) => acc.id !== readyProductId)
          );

          Swal.fire(
            "Deleted!",
            "The offline readyProduct has been deleted.",
            "success"
          );
        } else if (!navigator.onLine) {
          // If offline, mark for later deletion
          offlineDeletes.push(readyProductId);
          localStorage.setItem(
            "offlineDeletes",
            JSON.stringify(offlineDeletes)
          );

          // Remove from state immediately
          setRecipeBook((prevRecipeBook) =>
            prevRecipeBook.filter((acc) => acc.id !== readyProductId)
          );

          Swal.fire(
            "Deleted!",
            "The readyProduct will be removed from Firestore when online.",
            "success"
          );
        } else {
          // If online, delete from Firestore immediately
          await deleteDoc(doc(db, "readyProducts", readyProductId));
          setRecipeBook((prevRecipeBook) =>
            prevRecipeBook.filter((acc) => acc.id !== readyProductId)
          );
          Swal.fire(
            "Deleted!",
            "The readyProduct has been deleted from Firestore.",
            "success"
          );
        }
      } catch (error) {
        console.error("Error deleting readyProduct:", error);
        Swal.fire("Error", "There was an issue deleting the readyProduct.", "error");
      }
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const readyProductRef = doc(db, "readyProducts", editProduct.id);
      await updateDoc(readyProductRef, newReadyProduct);

      setRecipeBook((prevRecipeBook) =>
        prevRecipeBook.map((product) =>
          product.productCode === editProduct.productCode ? { ...product, ...newReadyProduct } : product
        )
      );

      setEditProduct(null);
      window.location.reload();
     //how to fetch the updated data from firestore
    } catch (error) {
      console.error("Error updating raw product:", error);
    }
  };

  const resetForm = () => {
    setNewReadyProduct({
      productCode: "",
      productName: "",
      unit: "kg",
      quantity: 0,
      category: "Raw Material",
      productType: "",
      vendorsType: "",
      openingBalance: 0,
      currentBalance: 0,
    });
  };


  // productCode: uuidv4(),
  //   productName: "",
  //   quantity: 0,
  //   pricePerUnit: 0, // Optional
  //   minimumQuantity: 0, // Optional
  //   lastUpdated: new Date().toISOString(),
  //   ingredients: [],

  return (
    <div className="p-6 max-w-6xl mx-auto">
         <button onClick={() => navigate("/recipe-book/")}>⟵ Back to Recipe Book</button>
      <h1 className="text-2xl font-bold mb-6">Ready Products List</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editProduct ? "Edit Product" : "Add Product"}
        </h2>
        <form
          onSubmit={editProduct ? updateProduct : addProduct}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <label
              htmlFor="rawItemCode"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              id="productName"
              type="text"
              placeholder="Product Name"
              value={newReadyProduct.productName}
              onChange={(e) =>
                setNewReadyProduct({ ...newReadyProduct, productName: e.target.value })
              }
              required
              className="border border-gray-300 p-2 mt-1 w-full"
            />
          </div>


          <div>
            <label
              htmlFor="pricePerUnit"
              className="block text-sm font-medium text-gray-700"
            >
              Current Stock Quantity
            </label>
            <div className="">
              <input
                id="productPricePerUnit"
                type="number"
                placeholder="Current Stock Quantity"
                value={newReadyProduct.quantity}
                onChange={(e) =>
                  setNewReadyProduct({ ...newReadyProduct, quantity: e.target.value })
                }
                required
                className="border border-gray-300 p-2  mt-1 w-full"
              />
            </div>
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
                id="productPricePerUnit"
                type="number"
                placeholder="Product Price Per Unit"
                value={newReadyProduct.pricePerUnit}
                onChange={(e) =>
                  setNewReadyProduct({ ...newReadyProduct, pricePerUnit: e.target.value })
                }
                required
                className="border border-gray-300 p-2 pl-10 mt-1 w-full"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="rawItemCode"
              className="block text-sm font-medium text-gray-700"
            >
              Minimum Quantity Before Warning (Optional)
            </label>
            <input
              id="minimumQuantity"
              placeholder="Minimum quantity before warning"
              value={newReadyProduct.minimumQuantity}
              onChange={(e) =>
                setNewReadyProduct({ ...newReadyProduct, minimumQuantity: e.target.value })
              }
              className="border border-gray-300 p-2 mt-1 w-full"
            />
          </div>

          {showRawItemList && (
            <ItemListModal 
  items={rawItems} 
  onSelect={handleRawItemSelection} 
  onClose={() => setShowRawItemList(false)} 
/>

        )}



      <div>
      <label className="block text-sm font-medium text-gray-700">Ingredients</label>
      <div className=" gap-2 mt-1">
        <div className="flex">
          <div>
      <label className="font-semibold">Select RawItem:</label>
        <button type="button" onClick={() => setShowRawItemList(true)} className="border p-2 w-full mb-2">
          {selectedRawItem.itemName  || "Choose an RawItem"}
        </button>
        <br />
          </div>
          <div>

        <label htmlFor="">
        {selectedRawItem.itemUnit ? `Add Quantity in ${selectedRawItem.itemUnit}` :  "Add Quantity"}
        </label>
        <input
          type="number"
          placeholder="Quantity n"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border border-gray-300 p-2 w-24"
        />
          </div>
        </div>
<button 
  type="button" 
  onClick={addIngredient} 
  className="w-full bg-blue-500 text-white px-3 py-2 rounded"
>
  Add
</button>

      </div>

      {/* Display selected ingredients */}
      <ul className="mt-3">
        {newReadyProduct.ingredients.map((ingredient, index) => (
          <li key={index} className="border p-2 flex justify-between items-center">
            {ingredient.itemName} - {ingredient.quantity} {ingredient.itemUnit}
            <button type="button" onClick={() => removeIngredient(index)} className="text-red-500 ml-2">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>

    <div>
  <div>
    <label
      htmlFor="barCode"
      className="block text-sm font-medium text-gray-700"
    >
      Barcode
    </label>
    <div className="flex gap-2">
      <input
        id="barCode"
        placeholder="Add Barcode"
        value={newReadyProduct.barCode}
        type="number"
        onChange={(e) =>
          setNewReadyProduct({ ...newReadyProduct, barCode: e.target.value })
        }
        className="border border-gray-300 p-2 mt-1 w-full"
      />
      <button
        type="button"
        onClick={() =>
          setNewReadyProduct({
            ...newReadyProduct,
            barCode: generateRandomBarcode(),
          })
        }
        className="bg-blue-500 text-white px-4 py-2 mt-1 rounded hover:bg-blue-600"
      >
        Generate
      </button>
    </div>
  </div>
</div>


          <button
            type="submit"
            className="col-span-3 bg-blue-500 text-white p-2 rounded"
          >
            {addingProduct ? "Loading..." : editProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewRecipeBook;
