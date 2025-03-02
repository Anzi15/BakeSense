import { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../helpers/firebase/config"; // Ensure correct Firebase config import
import { CSVLink } from "react-csv";
import { Link, redirect } from "react-router-dom";

const ProductTable = ({ readyProducts, onAddNew, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [minQuantityFilter, setMinQuantityFilter] = useState("");

  const filteredProducts = readyProducts.filter((product) => {
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barCode.toString().includes(searchTerm);
    const matchesMinQuantity =
      minQuantityFilter === "" || product.minimumQuantity >= Number(minQuantityFilter);
    return matchesSearch && matchesMinQuantity;
  });

  const csvHeaders = [
    { label: "Product Code", key: "productCode" },
    { label: "Product Name", key: "productName" },
    { label: "Quantity", key: "quantity" },
    { label: "Price Per Unit", key: "pricePerUnit" },
    { label: "Minimum Quantity", key: "minimumQuantity" },
    { label: "Last Updated", key: "lastUpdated" },
    { label: "Ingredients", key: "ingredients" },
    { label: "Bar Code", key: "barCode" },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Link
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          onClick={onAddNew}
          to={"/recipe-book/new"}
        >
          Add New Recipe
        </Link>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name or barcode..."
            className="border rounded-lg px-3 py-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2 focus:outline-none"
            value={minQuantityFilter}
            onChange={(e) => setMinQuantityFilter(e.target.value)}
          >
            <option value="">Filter by Min Quantity</option>
            <option value="5">≥ 5</option>
            <option value="10">≥ 10</option>
            <option value="20">≥ 20</option>
          </select>

          <CSVLink
            data={filteredProducts}
            headers={csvHeaders}
            filename="products.csv"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Export CSV
          </CSVLink>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-6 text-lg font-semibold text-gray-500">Loading products...</div>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Product Code</th>
                <th className="p-2 border">Product Name</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Price Per Unit</th>
                <th className="p-2 border">Minimum Quantity</th>
                <th className="p-2 border">Last Updated</th>
                <th className="p-2 border">Ingredients</th>
                <th className="p-2 border">Bar Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.productCode} className="hover:bg-gray-100">
                    <td className="p-2 border">{product.productCode}</td>
                    <td className="p-2 border">{product.productName || "N/A"}</td>
                    <td className="p-2 border">{product.quantity}</td>
                    <td className="p-2 border">{product.pricePerUnit || "-"}</td>
                    <td className="p-2 border">{product.minimumQuantity || "-"}</td>
                    <td className="p-2 border">
                      {product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-2 border">
  {product.ingredients && Array.isArray(product.ingredients)
    ? product.ingredients.map((ingredient) =>
        `${ingredient.itemName} (${ingredient.quantity} ${ingredient.itemUnit})`
      ).join(", ")
    : "N/A"}
</td>

                    <td className="p-2 border">{product.barCode}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [readyProducts, setReadyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "readyProducts"));
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReadyProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddNew = () => {
    redirect(""); // Replace with actual logic
  };

  return <ProductTable readyProducts={readyProducts} onAddNew={handleAddNew} loading={loading} />;
};

export default App;
