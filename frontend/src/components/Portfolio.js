import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Portfolio = ({ portfolio, setPortfolio, portfolioResults, setPortfolioResults }) => {
  const [message, setMessage] = useState('');
  const [editStockId, setEditStockId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editPurchasePrice, setEditPurchasePrice] = useState('');
  const [editDate, setEditDate] = useState('');

  // Chart states from your original code
  const [pieChartData, setPieChartData] = useState(null);
  const [portfolioValueData, setPortfolioValueData] = useState(null);
  const [monteCarloData, setMonteCarloData] = useState(null);
  const [varComparisonData, setVarComparisonData] = useState(null);
  const [riskRewardData, setRiskRewardData] = useState(null);
  const [rollingStdData, setRollingStdData] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        const data = response.data;
        console.log('API Response:', data);
        
        // Add null checks before setting state
        if (data && data.stocks_list) {
          setPortfolio(data.stocks_list);
        } else {
          setPortfolio([]);
        }
        
        if (data && data.portfolio_data) {
          setPortfolioResults(data.portfolio_data);
        } else {
          setPortfolioResults(null);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setMessage('Error fetching portfolio');
        setPortfolio([]);
        setPortfolioResults(null);
      }
    };

    fetchPortfolio();
  }, [setPortfolio, setPortfolioResults]);

  // Pie Chart Data for Basic Tab
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

  // Portfolio Value Over Time
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
      if (Array.isArray(riskMetrics.monte_carlo_simulated_returns)) {
        setMonteCarloData(riskMetrics.monte_carlo_simulated_returns.map((value) => ({ return: value })));
      }
      setVarComparisonData([
        { name: 'Historical VaR', value: -riskMetrics.value_at_risk_dollar },
        { name: 'Monte Carlo VaR', value: -riskMetrics.monte_carlo_var },
      ]);
      setRiskRewardData([
        { name: 'Sharpe Ratio', value: riskMetrics.sharpe_ratio },
        { name: 'Sortino Ratio', value: riskMetrics.sortino_ratio },
      ]);
      if (Array.isArray(riskMetrics.rolling_std_dev) && Array.isArray(portfolioResults.dates)) {
        setRollingStdData(portfolioResults.dates.slice(29).map((date, idx) => ({
          date,
          stdDev: riskMetrics.rolling_std_dev[idx],
        })));
      }
    }
  }, [portfolioResults]);

  // Handle Delete and Update (unchanged)
  const handleDelete = async (portfolioStockId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.delete(`${backendUrl}/api/portfolio/delete/${portfolioStockId}`, { withCredentials: true });
      if (response.status === 200) {
        setMessage('Stock removed from portfolio');
        if (portfolio && Array.isArray(portfolio)) {
          setPortfolio(portfolio.filter(stock => stock.id !== portfolioStockId));
        }
        const updatedResults = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        if (updatedResults.data && updatedResults.data.portfolio_data) {
          setPortfolioResults(updatedResults.data.portfolio_data);
        }
      } else {
        setMessage('Failed to remove stock from portfolio');
      }
    } catch (error) {
      console.error('Error removing stock from portfolio:', error);
      setMessage('Error removing stock from portfolio');
    }
  };

  const handleUpdate = async (portfolioStockId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await axios.put(`${backendUrl}/api/portfolio/update/${portfolioStockId}`, {
        quantity: editQuantity,
        purchase_price: editPurchasePrice,
        date: editDate,
      }, { withCredentials: true });
      if (response.status === 200) {
        setMessage('Stock updated in portfolio');
        if (portfolio && Array.isArray(portfolio)) {
          setPortfolio(portfolio.map(stock =>
            stock.id === portfolioStockId
              ? { ...stock, quantity: editQuantity, purchase_price: editPurchasePrice, date: editDate }
              : stock
          ));
        }
        setEditStockId(null);
        const updatedResults = await axios.get(`${backendUrl}/api/portfolio`, { withCredentials: true });
        if (updatedResults.data && updatedResults.data.portfolio_data) {
          setPortfolioResults(updatedResults.data.portfolio_data);
        }
      } else {
        setMessage('Failed to update stock in portfolio');
      }
    } catch (error) {
      console.error('Error updating stock in portfolio:', error);
      setMessage('Error updating stock in portfolio');
    }
  };

  const handleEdit = (stock) => {
    setEditStockId(stock.id);
    setEditQuantity(stock.quantity);
    setEditPurchasePrice(stock.purchase_price);
    setEditDate(new Date(stock.date).toISOString().split('T')[0]);
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
    if (!optimalWeights || typeof optimalWeights !== 'object') {
      return [];
    }
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
                    {portfolio && Array.isArray(portfolio) ? portfolio.map((stock) => (
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
                    )) : (
                      <tr>
                        <td colSpan="5">No stocks in portfolio</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabPanel>
            <TabPanel>
              <h3>Portfolio Composition</h3>
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
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="vertical" align="right" verticalAlign="right" />
                </PieChart>
              )}
            </TabPanel>
            <TabPanel>
              {portfolioValueData && (
                <div className="chart-container" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <LineChart width={750} height={450} data={portfolioValueData}>
                    <XAxis dataKey="date" />
                    <YAxis
                      width={150}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      domain={['auto', 'auto']}
                    />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#36A2EB" name="Portfolio Value" />
                  </LineChart>
                </div>
              )}
            </TabPanel>
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
              <h3>VaR Comparison</h3>
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
              {monteCarloData && (
                <>
                  <h4>Monte Carlo Simulated Returns</h4>
                  <BarChart width={600} height={300} data={monteCarloData}>
                    <XAxis dataKey="return" />
                    <YAxis />
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                    <Tooltip />
                    <Bar dataKey="return" fill="#82ca9d" />
                  </BarChart>
                </>
              )}
            </TabPanel>
            <TabPanel>
              <h3>Risk-Reward Metrics</h3>
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

        {/* Portfolio Optimization Tab */}
        <TabPanel>
          <Tabs>
            <TabList>
              {optimizationTabs.map(tab => (
                <Tab key={tab.key}>{tab.label}</Tab>
              ))}
            </TabList>
            {optimizationTabs.map(tab => (
              <TabPanel key={tab.key}>
                <div className="optimization-section">
                  <h3>{tab.label}</h3>
                  {portfolioResults && portfolioResults.optimizations && portfolioResults.optimizations[tab.key] && portfolioResults.optimizations[tab.key].optimal_weights ? (
                    <div className="chart-container">
                      {/* Pie Chart */}
                      <div>
                        <h4>Optimal Allocation</h4>
                        <PieChart width={600} height={300}>
                          <Pie
                            data={getPieChartData(portfolioResults.optimizations[tab.key].optimal_weights)}
                            cx="60%"
                            cy="50%"
                            labelLine={false}
                            //label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getPieChartData(portfolioResults.optimizations[tab.key].optimal_weights).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                          <Legend layout="vertical" align="right" verticalAlign="right" />
                        </PieChart>
                      </div>

                      {/* Metrics Table */}
                      <div>
                        <h4>Portfolio Metrics</h4>
                        <table className="metrics-table">
                          <thead>
                            <tr>
                              <th>Metric</th>
                              <th>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Expected Return</td>
                              <td>{((portfolioResults.optimizations[tab.key].expected_return || 0) * 100).toFixed(2)}%</td>
                            </tr>
                            <tr>
                              <td>Risk (Std Dev)</td>
                              <td>{((portfolioResults.optimizations[tab.key].risk || 0) * 100).toFixed(2)}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Efficient Frontier */}
                      {portfolioResults.optimizations[tab.key].visualizations && portfolioResults.optimizations[tab.key].visualizations.efficient_frontier && (
                        <div>
                          <h4>Efficient Frontier</h4>
                          <img
                            src={portfolioResults.optimizations[tab.key].visualizations.efficient_frontier}
                            alt={`${tab.label} Efficient Frontier`}
                            className="chart-image"
                          />
                        </div>
                      )}

                      {/* Downside Histogram (Sortino) */}
                      {portfolioResults.optimizations[tab.key].visualizations && portfolioResults.optimizations[tab.key].visualizations.downside_histogram && (
                        <div>
                          <h4>Downside Returns</h4>
                          <img
                            src={portfolioResults.optimizations[tab.key].visualizations.downside_histogram}
                            alt="Downside Histogram"
                            className="chart-image"
                          />
                        </div>
                      )}

                      {/* Drawdown Chart (Max Drawdown) */}
                      {portfolioResults.optimizations[tab.key].visualizations && portfolioResults.optimizations[tab.key].visualizations.drawdown_chart && (
                        <div>
                          <h4>Drawdown</h4>
                          <img
                            src={portfolioResults.optimizations[tab.key].visualizations.drawdown_chart}
                            alt="Drawdown Chart"
                            className="chart-image"
                          />
                        </div>
                      )}

                      {/* CVaR Histogram */}
                      {portfolioResults.optimizations[tab.key].visualizations && portfolioResults.optimizations[tab.key].visualizations.cvar_histogram && (
                        <div>
                          <h4>CVaR Histogram</h4>
                          <img
                            src={portfolioResults.optimizations[tab.key].visualizations.cvar_histogram}
                            alt="CVaR Histogram"
                            className="chart-image"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No optimization data available for {tab.label}.</p>
                  )}
                </div>
              </TabPanel>
            ))}
          </Tabs>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Portfolio;