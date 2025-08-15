import React, { useState } from 'react';
import axios from 'axios';

const AddToPortfolio = ({ portfolio, setPortfolio, portfolioResults, setPortfolioResults }) => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const stockSymbols = [
    'HDFCBANK.NS', 'HINDUNILVR.NS', 'ASIANPAINT.NS', 'RELIANCE.NS', 'TCS.NS',
    'AUROPHARMA.NS', 'BBTC.NS', 'BALKRISIND.NS', 'GARFIBRES.NS', 'COLPAL.NS',
    'NESTLEIND.NS', 'MARUTI.NS', 'BRITANNIA.NS', 'BOSCHLTD.NS', 'ONGC.NS',
    'ABBOTINDIA.NS', 'DIVISLAB.NS', 'BAJFINANCE.NS', 'RECLTD.NS', 'PFC.NS',
    'PIDILITIND.NS', 'ARE&M.NS'
  ];

  const handleAddToPortfolio = async (e) => {
    e.preventDefault();
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; 
      //const response = await axios.delete(`${backendUrl}/api/portfolio/delete/${portfolioStockId}`, { withCredentials: true });
      const response = await axios.post(`${backendUrl}/api/portfolio/add`, {
        stock_symbol: stockSymbol,
        quantity: parseInt(quantity),
        purchase_price: parseFloat(purchasePrice),
        date: date || new Date().toISOString()  // Add date to request
      }, { withCredentials: true });

      if (response.status === 201) {
        setMessage('Stock added to portfolio successfully');

        // Update the portfolio state with the new stock
        const newStock = response.data.new_stock; // Assuming the API returns the added stock
        console.log('New stock added:', newStock); // Debugging line

        if (newStock && newStock.symbol) {
          setPortfolio([...portfolio, newStock]);
        } else {
          console.error('Invalid stock data:', newStock);
          setMessage('Failed to add stock to portfolio: Invalid stock data');
        }

        // Optionally, fetch updated portfolio results
        const portfolioResponse = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        setPortfolioResults(portfolioResponse.data.portfolio_data);
        setPortfolio(portfolioResponse.data.stocks_list);


      } else {
        setMessage('Failed to add stock to portfolio');
      }
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      setMessage('Error adding stock to portfolio');
    }
  };

  return (
    <div className="add-to-portfolio-container">
  <h2>Add Stock to Portfolio</h2>
  <form onSubmit={handleAddToPortfolio} className="add-to-portfolio-form">
    <div className="form-group">
      <label className="form-label">Stock Symbol:</label>
      <select
        value={stockSymbol}
        onChange={(e) => setStockSymbol(e.target.value)}
        required
        className="form-input"
      >
        <option value="" disabled>Select a stock symbol</option>
        {stockSymbols.map((symbol) => (
          <option key={symbol} value={symbol}>{symbol}</option>
        ))}
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Quantity:</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        className="form-input"
      />
    </div>
    <div className="form-group">
      <label className="form-label">Purchase Price:</label>
      <input
        type="number"
        step="0.01"
        value={purchasePrice}
        onChange={(e) => setPurchasePrice(e.target.value)}
        required
        className="form-input"
      />
    </div>
    <div className="form-group">
      <label className="form-label">Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="form-input"
      />
    </div>
    <button type="submit" className="form-button">Add to Portfolio</button>
  </form>
  {message && <p className="form-message">{message}</p>}
</div>
  );
};

export default AddToPortfolio;