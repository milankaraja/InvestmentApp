
import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import Login from '../components/Login';
import Logout from '../components/Logout';
import Prices from '../components/Prices';
import Register from '../components/Register';
import CurrentUser from '../components/CurrentUser';
import Dashboard from './Dashboard';
import AddToPortfolio from '../components/AddToPortfolio';
import Portfolio from '../components/Portfolio';

import '../App.css';

function Home() {
  const [portfolio, setPortfolio] = useState([]); // Shared state for portfolio
  const [portfolioResults, setPortfolioResults] = useState([]); // Shared state for portfolio results

  return (
    <div className="home">
      <nav className="navbar">
        <div className="navbar-links">
          <Link to="/register" className="nav-link">Register</Link>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/logout" className="nav-link">Logout</Link>
          
        </div>
      </nav>
      
      <h1>Welcome to Investment App</h1>
      <CurrentUser/>
      

      <p>Start managing your investments today!</p>
      {/* Pass shared state and updater functions to AddToPortfolio */}
      <AddToPortfolio 
        portfolio={portfolio} 
        setPortfolio={setPortfolio} 
        portfolioResults={portfolioResults}
        setPortfolioResults={setPortfolioResults} 
      />

      
      {/* Pass shared state to Portfolio */}
      <Portfolio 
        portfolio={portfolio} 
        setPortfolio={setPortfolio}
        portfolioResults={portfolioResults} 
        setPortfolioResults={setPortfolioResults} 
      />
    </div>
  );
}

export default Home;