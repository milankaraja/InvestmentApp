import React, { useState, useEffect } from 'react';
import Portfolio from '../components/Portfolio';
import StockList from '../components/StockList';

function Dashboard() {
  const [userStocks, setUserStocks] = useState([]);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // Fetch user's stocks and market data from backend
    // This is a placeholder for an API call
    fetchUserStocks().then(data => setUserStocks(data));
    fetchMarketData().then(data => setMarketData(data));
  }, []);

  const fetchUserStocks = async () => {
    // Implement API call to get user's stocks
    return [{ symbol: 'INFY' }, { symbol: 'TCS' }]; // Example data
  };

  const fetchMarketData = async () => {
    // Implement API call to get current market data
    return [{ symbol: 'NIFTY', value: 18300 }, { symbol: 'BANKNIFTY', value: 43500 }]; // Example data
  };

  return (
    <div className="dashboard">
      <h1>Your Investment Dashboard</h1>
      <Portfolio stocks={userStocks} />
      <StockList stocks={marketData} />
    </div>
  );
}

export default Dashboard;