import { useState } from "react";

const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <input
      type="text"
      placeholder="Search items..."
      value={searchTerm}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full p-2 border rounded mb-2"
    />
  );
};

const ItemListModal = ({ items, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-2">Select an Item</h3>
        <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />
        <ul>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2 border-b hover:bg-gray-200 cursor-pointer flex justify-between gap-6"
              onClick={() => onSelect(item)}
            >
              <p>{item.itemName}</p>
              <p>{item.itemUnit}</p>
              <p>{item.quantity}</p>
            </div>
          ))}
        </ul>
        <button type="button" onClick={onClose} className="mt-4 p-2 bg-red-500 text-white rounded w-full">
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemListModal;
