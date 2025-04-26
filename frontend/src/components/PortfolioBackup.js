import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';



const Portfolio = ({portfolio, setPortfolio, portfolioResults, setPortfolioResults}) => {
  // const [portfolio, setPortfolio] = useState([]);

  const [message, setMessage] = useState('');
  const [editStockId, setEditStockId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState('');
  const [editDate, setEditDate] = useState('');

  // const [portfolioResults, setPortfolioResults] = useState([]); // Initialize to empty array

  const [chartData, setChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);

  // Risk metric chart states
  const [pieChartData, setPieChartData] = useState(null); // Pie chart data
  const [portfolioValueData, setPortfolioValueData] = useState(null);
  const [monteCarloData, setMonteCarloData] = useState(null);
  const [varComparisonData, setVarComparisonData] = useState(null);
  const [riskRewardData, setRiskRewardData] = useState(null);
  const [rollingStdData, setRollingStdData] = useState(null);

  // Optimizations
  //const [optimizations, setOptimizations] = useState(null);
  

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        //https://c50d-117-206-252-168.ngrok-free.app/api/portfolio
        //http://127.0.0.1:5000/api/portfolio
        const backendUrl = process.env.REACT_APP_BACKEND_URL; 
        const response = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        let data = response.data;
        //if (typeof data === 'string') {
          //data = JSON.parse(data); // Parse the string into an object
        //}
        //console.log('Full response:', response);
        console.log('API Response:', data);
        console.log('portfolio data:', data.portfolio_data);
        console.log('portfolio_data exists:', response.data.hasOwnProperty('portfolio_data'));
        console.log('Type of portfolio_data:', typeof data);
        //console.log('portfolioResults after set:', response.data.portfolio_data);
        setPortfolio(response.data.stocks_list);
        setPortfolioResults(response.data.portfolio_data);
        console.log('portfolioResults after set:', response.data.portfolio_data);
        console.log('Portfolio data:', portfolioResults);
        console.log('Portfolio consolidated:', portfolioResults.portfolio_consolidated);
        console.log('Sharpe Ratio:', response.data.portfolio_data.optimizations.sharpe.current_weights);
        if (Array.isArray(portfolioResults["portfolio_consolidated"])) {
          console.log('Portfolio consolidated:', portfolioResults["portfolio_consolidated"]);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setMessage('Error fetching portfolio');
      }
    };

    fetchPortfolio();
  }, [setPortfolio,setPortfolioResults]);

  // Pie Chart Data (Recharts format)
  useEffect(() => {
    if (portfolioResults && Array.isArray(portfolioResults.portfolio_stock_names) && Array.isArray(portfolioResults.portfolio_current_value)) {
      setPieChartData(
        portfolioResults.portfolio_stock_names.map((name, idx) => ({
          name,
          value: portfolioResults.portfolio_current_value[idx],
        }))
      );
    } else {
      console.warn('Pie chart data is not in the expected format or is empty.');
      setPieChartData(null);
    }
  }, [portfolioResults]);

   // Portfolio Value Over Time (Line Chart Data for both Basic and Risk tabs)
  useEffect(() => {
    if (portfolioResults && Array.isArray(portfolioResults.dates) && Array.isArray(portfolioResults.prices)) {
      setPortfolioValueData(
        portfolioResults.dates.map((date, idx) => ({
          date,
          value: portfolioResults.prices[idx],
        }))
      );
    } else {
      console.warn('Line chart data is not in the expected format or is empty.');
      setPortfolioValueData(null);
    }
  }, [portfolioResults]);



  // Risk Metrics Charts
  useEffect(() => {
    if (portfolioResults && portfolioResults.risk_metrics) {
      const riskMetrics = portfolioResults.risk_metrics;

      // 2. Monte Carlo Simulated Returns
      if (Array.isArray(riskMetrics.monte_carlo_simulated_returns)) {
        setMonteCarloData(riskMetrics.monte_carlo_simulated_returns.map((value) => ({ return: value })));
      }

      // 3. VaR Comparison
      setVarComparisonData([
        { name: 'Historical VaR', value: -riskMetrics.value_at_risk_dollar },
        { name: 'Monte Carlo VaR', value: -riskMetrics.monte_carlo_var },
      ]);

      // 4. Risk-Reward Metrics
      setRiskRewardData([
        { name: 'Sharpe Ratio', value: riskMetrics.sharpe_ratio },
        { name: 'Sortino Ratio', value: riskMetrics.sortino_ratio },
      ]);

      // 5. Rolling Std Dev
      if (Array.isArray(riskMetrics.rolling_std_dev) && Array.isArray(portfolioResults.dates)) {
        setRollingStdData(portfolioResults.dates.slice(29).map((date, idx) => ({
          date,
          stdDev: riskMetrics.rolling_std_dev[idx],
        })));
      }
    }
  }, [portfolioResults]);


  // Optimizations
  





  const handleDelete = async (portfolioStockId) => {
    try {
      //https://c50d-117-206-252-168.ngrok-free.app/api/portfolio
      //http://127.0.0.1:5000/api/portfolio
      const backendUrl = process.env.REACT_APP_BACKEND_URL; 
      const response = await axios.delete(`${backendUrl}/api/portfolio/delete/${portfolioStockId}`, { withCredentials: true });
      
      if (response.status === 200) {
        setMessage('Stock removed from portfolio');
        setPortfolio(portfolio.filter(stock => stock.id !== portfolioStockId));
        const updatedResults = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        setPortfolioResults(updatedResults.data.portfolio_data);
      } else {
        setMessage('Failed to remove stock from portfolio');
      }
    } catch (error) {
      console.error('Error removing stock from portfolio:', error);
      setMessage('Error removing stock from portfolio');
    }
  };

  const handleUpdate = async (portfolioStockId) => {
    console.log('Updating stock with ID:', portfolioStockId);
    console.log('Updated quantity:', editQuantity);
    console.log('Updated purchase price:', editPurchasePrice);
    console.log('Updated date:', editDate);
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; // Get the backend URL from environment variables
      const response = await axios.put(`${backendUrl}/api/portfolio/update/${portfolioStockId}`, {
        quantity: editQuantity,
        purchase_price: editPurchasePrice,
        date: editDate
      }, { withCredentials: true });

      if (response.status === 200) {
        setMessage('Stock updated in portfolio');
        setPortfolio(portfolio.map(stock => stock.id === portfolioStockId ? { ...stock, quantity: editQuantity, purchase_price: editPurchasePrice, date: editDate } : stock));
        setEditStockId(null);
        const updatedResults = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        setPortfolioResults(updatedResults.data.portfolio_data);
      } else {
        setMessage('Failed to update stock in portfolio');
      }
    } catch (error) {
      console.error('Error updating stock in portfolio:', error);
      setMessage('Error updating stock in portfolio');
    }
  };

  const handleEdit = (stock) => {
    console.log('Editing stock:', stock);
    setEditStockId(stock.id);
    setEditQuantity(stock.quantity);
    setEditPurchasePrice(stock.purchase_price);
    setEditDate(new Date(stock.date).toISOString().split('T')[0]); // Format date for input field
  };

  // Colors for Pie Chart
  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    // Tab configuration for optimization methods
    const optimizationTabs = [
      { key: 'sharpe', label: '1. Sharpe Ratio' },
      { key: 'min_variance', label: '2. Mean Variance' },
      { key: 'max_return', label: '3. Max Return' },
      { key: 'sortino', label: '4. Sortino' },
      { key: 'information_ratio', label: '5. Information Ratio' },
      { key: 'max_drawdown', label: '6. Max Drawdown' },
      { key: 'target_return', label: '7. Target Return' },
      { key: 'utility', label: '8. Utility' },
      { key: 'cvar', label: '9. CVaR' },
      { key: 'diversification', label: '10. Diversification' },
    ];
  
    // Prepare pie chart data for optimizations
    const getPieChartData = (optimalWeights) => {
      return Object.entries(optimalWeights).map(([name, value]) => ({
        name,
        value: value * 100, // Convert to percentage
      }));
    };


  return (
    <div>
      <h2>My Portfolio</h2>
      {message && <p>{message}</p>}
    <Tabs>
      <TabList>
          <Tab>Basic</Tab>
          <Tab>Risk Management</Tab>
          <Tab>Portfolio Optimization</Tab>
      </TabList>

    {/* Basic Tab */}
    <TabPanel>
    <Tabs>
      <TabList>
          <Tab>Trades</Tab>
          <Tab>Pie Chart</Tab>
          <Tab>Line Chart</Tab>
          <Tab>Total Portfolio</Tab>
      </TabList>
      <TabPanel>
    <div>
          <h3>Trades</h3>
          <table>
            <thead>

              <tr>
                <th>Stock Symbol</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock) => (
                <tr key={stock.id}>
                  <td>{stock.symbol}</td>
                  <td>
                    {editStockId === stock.id ? (
                      <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                      />
                    ) : (
                      stock.quantity
                    )}
                  </td>
                  <td>
                    {editStockId === stock.id ? (
                      <input
                        type="number"
                        value={editPurchasePrice}
                        onChange={(e) => setEditPurchasePrice(e.target.value)}
                      />
                    ) : (
                      stock.purchase_price
                    )}
                  </td>
                  <td>
                    {editStockId === stock.id ? (
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                      />
                    ) : (
                      //Date(stock.date)
                      new Date(stock.date).toLocaleDateString()
                    )}
                  </td>
                  <td>
                    {editStockId === stock.id ? (
                      <>
                        <button onClick={() => handleUpdate(stock.id)}>Save</button>
                        <button onClick={() => setEditStockId(null)}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(stock)}>Edit</button>
                    )}
                    <button onClick={() => handleDelete(stock.id)}>Delete</button>
                  </td>


                </tr>
              ))}
            </tbody>
          </table>

        </div>

    </TabPanel>

      <TabPanel>
      <h3> Portfolio Composition </h3>
      
                {pieChartData && (
                  <PieChart width={600} height={300}>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="60%"
                      cy="55%"
                      outerRadius={130}
                      fill="#8884d8"
                      //label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`} // Custom label function
                      >
                    
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                    layout="vertical" // Positions the legend horizontally
                    align="right" // Aligns the legend to the center
                    verticalAlign="right" // Moves the legend to the bottom
                    formatter={(value) => (
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{value}</span> // Custom legend formatting
                    )}
                  />
                  </PieChart>
                )}
    
      </TabPanel>

      <TabPanel>
      {portfolioValueData && (
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <LineChart width={750} height={450} data={portfolioValueData}>
                    <XAxis dataKey="date" />
                    <YAxis
                      width={150} // Increase the width of the Y-axis to fit larger labels
                      tickFormatter={(value) => `₹${value.toLocaleString()}`} // Format Y-axis values
                      domain={['auto', 'auto']} // Automatically adjust the range
                    />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#36A2EB" name="Portfolio Value" />
                  </LineChart>
                </div>
        )}
      </TabPanel>


      <div className="tables-container">


      <TabPanel>

      <div className="tables-container">
      {portfolioResults && Array.isArray(portfolioResults.portfolio_consolidated) && portfolioResults.portfolio_consolidated.length > 0 ? (
        <table>
          <thead>
            <h3>Total Portfolio</h3>
            <tr>
              <th>Company</th>
              <th>Quantity</th>
              <th>Purchase Amount</th>
              <th>Current Price</th>
              <th>Current Amount</th>
            </tr>
          </thead>
          <tbody>
            {portfolioResults.portfolio_consolidated.map((item, index) => (
              <tr key={index}>
                <td>{item[0]}</td>
                <td>{item[1][0]}</td>
                <td>{item[1][1]}</td>
                <td>{item[1][2]}</td>
                <td>{item[1][3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No portfolio data available. Add trades to your portfolio to see data here.</p>
      )}
    </div>

    </TabPanel>
    </div>
    </Tabs>
    </TabPanel>
    
  

 

    {/* Risk Management Tab */}
    <TabPanel>
          <Tabs>
            <TabList>
              <Tab>VaR Comparison</Tab>
              <Tab>Monte Carlo Simulated Returns</Tab>
              <Tab>Risk-Reward Metrics</Tab>
              <Tab>Rolling Volatility</Tab>
            </TabList>

            <TabPanel>
              <h3> VaR Comparison </h3>
              
                  {/* 3. VaR Comparison */}
                  {varComparisonData && (
                  <>
                    <h4>VaR Comparison</h4>
                    <BarChart width={600} height={300} data={varComparisonData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </>
                )}
            </TabPanel>

            <TabPanel>
              <h3>Monte Carlo Simulated Returns</h3>
              
                {/* 2. Monte Carlo Simulated Returns */}
                  {monteCarloData && (
                  <>
                    <h4>Monte Carlo Simulated Returns</h4>
                    <BarChart width={600} height={300} data={monteCarloData}>
                      <XAxis dataKey="return" />
                      <YAxis />
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <Tooltip />
                      <Bar dataKey="return" fill="#82ca9d" />
                      <Line type="monotone" dataKey={() => portfolioResults.risk_metrics.monte_carlo_var / portfolioResults.portfolio_current_value.reduce((a, b) => a + b, 0)} stroke="red" name="VaR" />
                    </BarChart>
                  </>
                )}
            </TabPanel>

            <TabPanel>
              <h3>Risk-Reward Metrics</h3>
              
                {/* 4. Risk-Reward Metrics */}
                {riskRewardData && (
                  <>
                    <h4>Risk-Reward Metrics</h4>
                    <BarChart width={600} height={300} data={riskRewardData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </>
                )}

            </TabPanel>

            <TabPanel>
              <h3>Rolling Volatility</h3>
              
                {/* 5. Rolling Volatility */}
                {rollingStdData && (
                  <>
                    <h4>Rolling Volatility (30-Day Std Dev)</h4>
                    <LineChart width={600} height={300} data={rollingStdData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                      <Tooltip />
                      <Line type="monotone" dataKey="stdDev" stroke="#ff7300" />
                    </LineChart>
                  </>
                )}
            </TabPanel>

          </Tabs>
        </TabPanel>

        <TabPanel>
        
          <Tabs>
            <TabList>
              <Tab>1. Sharpe Ratio</Tab>
              <Tab>2. Mean Variance</Tab>
              <Tab>3. Max Return</Tab>
              <Tab>4. Sortino</Tab>
              <Tab>5. Information Ratio</Tab>
              <Tab>6. Max Drawdown</Tab>
              <Tab>7. Target Return</Tab>
              <Tab>8. Utility</Tab>
              <Tab>9. Cvar</Tab>
              <Tab>10. Diversification</Tab>
            </TabList>

            <TabPanel>
              <h3>Sharpe Ratio</h3>
              
                {/* 1. Sharpe Ratio */}
                {portfolioResults && portfolioResults.optimizations && portfolioResults.optimizations.sharpe && (
                  <div>
                    <h4>Sharpe Ratio</h4>
                    <p>{portfolioResults.optimizations.sharpe.current_weights}</p>
                  </div>
                )}
              
              
              
            </TabPanel>

          </Tabs>
        </TabPanel>
      </Tabs>



        
      </div>
    
  );
};

export default Portfolio;