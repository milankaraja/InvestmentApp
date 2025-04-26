import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Prices() {
    const [companyPrices, setCompanyPrices] = useState([]);
    const [stats, setStats] = useState({});
    const [portfolio, setPortfolio] = useState({});
    const [portfolioValues, setPortfolioValues] = useState([]);

    useEffect(() => {
        // Fetch company prices for a sample company, e.g., company_id = 2
        axios.get('http://localhost:5000/api/company/prices/2')
            .then(response => setCompanyPrices(response.data))
            .catch(error => console.error('Error fetching prices:', error));

        // Fetch stats
        axios.get('http://localhost:5000/api/company/stats/2')
            .then(response => setStats(response.data))
            .catch(error => console.error('Error fetching stats:', error));

        // Fetch portfolio value if a portfolio exists
        axios.get('http://localhost:5000/api/portfolio/value/1') // Assuming portfolio_id 1
            .then(response => setPortfolioValues(response.data))
            .catch(error => console.error('Error fetching portfolio value:', error));
    }, []);

    // Function to add to portfolio
    const addToPortfolio = (companyId, quantity) => {
        axios.post('http://localhost:5000/api/portfolio/add', {
            portfolio_id: 1, // Hardcoded for simplicity
            company_id: companyId,
            quantity: quantity
        })
        .then(response => {
            console.log(response.data);
            // Update local state or refetch portfolio value
        })
        .catch(error => console.error('Error adding to portfolio:', error));
    };

    return (
        <div className="Prices">
            <h1>Company Price and Portfolio Data</h1>
            <div>
                <h2>Price Data</h2>
                <ul>
                    {companyPrices.map((price, index) => (
                        <li key={index}>{price.date}: {price.price}</li>
                    ))}
                </ul>
                <div>
                    <h2>Stats</h2>
                    <p>Mean: {stats.mean}</p>
                    <p>Variance: {stats.variance}</p>
                </div>
                <div>
                    <h2>Portfolio Management</h2>
                    <button onClick={() => addToPortfolio(2, 100)}>Add Company 2, Quantity 100</button>
                    <h2>Portfolio Value Over Time</h2>
                    <ul>
                        {portfolioValues.map((value, index) => (
                            <li key={index}>{value.date}: {value.value}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Prices;