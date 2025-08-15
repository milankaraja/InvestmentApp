import React, { useState, useEffect } from 'react';
import Portfolio from '../components/Portfolio';
import StockList from '../components/StockList';
import AddToPortfolio from '../components/AddToPortfolio';

function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioResults, setPortfolioResults] = useState(null);
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    // Fetch market data from backend
    fetchMarketData().then(data => setMarketData(data));
  }, []);

  const fetchMarketData = async () => {
    // Implement API call to get current market data
    return [{ symbol: 'NIFTY', value: 18300 }, { symbol: 'BANKNIFTY', value: 43500 }]; // Example data
  };

  return (
    <div className="dashboard">
      <h1>Your Investment Dashboard</h1>
      <AddToPortfolio 
        portfolio={portfolio} 
        setPortfolio={setPortfolio} 
        portfolioResults={portfolioResults}
        setPortfolioResults={setPortfolioResults} 
      />
      <Portfolio 
        portfolio={portfolio} 
        setPortfolio={setPortfolio}
        portfolioResults={portfolioResults} 
        setPortfolioResults={setPortfolioResults} 
      />
      <StockList stocks={marketData} />
    </div>
  );
}

export default Dashboard;