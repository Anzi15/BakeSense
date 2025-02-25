'use client';

import { useState, useEffect } from 'react';
import { db } from '../../helpers/firebase/config'; // Ensure Firebase is configured correctly
import { collection, getDocs } from 'firebase/firestore';
import { CSVLink } from 'react-csv';

export default function RawGoodsInventory() {
  const [goods, setGoods] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGoods = async () => {
      const querySnapshot = await getDocs(collection(db, 'raw-goods'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGoods(data);
    };

    fetchGoods();
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
  };

  const filteredGoods = goods.filter(good =>
    good.name.toLowerCase().includes(search.toLowerCase())
  );

  const exportData = filteredGoods.map(({ id, last_updated, ...rest }) => ({
    last_updated: formatTimestamp(last_updated),
    ...rest
  }));

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '30%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <CSVLink data={exportData} filename="raw_goods_inventory.csv">
          <button style={{ padding: '8px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Export to CSV
          </button>
        </CSVLink>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f8f8', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Last Updated</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Minimum Stock</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Stock Quantity</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {filteredGoods.map(good => (
            <tr key={good.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{formatTimestamp(good.last_updated)}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{good.minimum_stock}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{good.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{good.stock_quantity}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{good.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}