import React, { useEffect, useState } from 'react';
import axios from 'axios';

function StockList() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    async function fetchStocks() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/stocks');
        //http://127.0.0.1:5000/login
        setStocks(response.data);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
      }
    }
    fetchStocks();
  }, []);

  return (
    <div>
      <h2>Nifty Stocks</h2>
      <ul>
        {stocks.map((stock, index) => (
          <li key={index}>{stock}</li>
        ))}
      </ul>
    </div>
  );
}

export default StockList;