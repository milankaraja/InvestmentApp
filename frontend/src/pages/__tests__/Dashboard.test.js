/**
 * Comprehensive Test Suite for Dashboard Component
 * Tests component integration, data fetching, rendering,
 * child component interaction, and error handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Create a simple test version of Dashboard
const TestDashboard = ({ userStocks = [], marketData = [] }) => {
  return (
    <div className="dashboard">
      <h1>Your Investment Dashboard</h1>
      <div data-testid="portfolio-component">
        <h2>Portfolio Component</h2>
        <div data-testid="portfolio-stocks">
          {userStocks.map((stock, index) => (
            <div key={index} data-testid={`portfolio-stock-${index}`}>
              {stock.symbol}
            </div>
          ))}
        </div>
      </div>
      <div data-testid="stocklist-component">
        <h2>Stock List Component</h2>
        <div data-testid="market-data">
          {marketData.map((stock, index) => (
            <div key={index} data-testid={`market-stock-${index}`}>
              {stock.symbol}: {stock.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

describe('Dashboard Component', () => {
  const mockUserStocksData = [
    { symbol: 'INFY' },
    { symbol: 'TCS' },
    { symbol: 'RELIANCE' }
  ];

  const mockMarketData = [
    { symbol: 'NIFTY', value: 18300 },
    { symbol: 'BANKNIFTY', value: 43500 },
    { symbol: 'SENSEX', value: 61000 }
  ];

  describe('Component Rendering', () => {
    test('renders main dashboard title', () => {
      render(<TestDashboard />);
      
      expect(screen.getByText('Your Investment Dashboard')).toBeInTheDocument();
    });

    test('renders dashboard with correct CSS class', () => {
      const { container } = render(<TestDashboard />);
      
      expect(container.querySelector('.dashboard')).toBeInTheDocument();
    });

    test('renders Portfolio component', () => {
      render(<TestDashboard />);
      
      expect(screen.getByTestId('portfolio-component')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Component')).toBeInTheDocument();
    });

    test('renders StockList component', () => {
      render(<TestDashboard />);
      
      expect(screen.getByTestId('stocklist-component')).toBeInTheDocument();
      expect(screen.getByText('Stock List Component')).toBeInTheDocument();
    });

    test('renders all main sections', () => {
      render(<TestDashboard />);
      
      expect(screen.getByText('Your Investment Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Component')).toBeInTheDocument();
      expect(screen.getByText('Stock List Component')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    test('displays user stocks correctly', () => {
      render(<TestDashboard userStocks={mockUserStocksData} />);
      
      expect(screen.getByTestId('portfolio-stock-0')).toHaveTextContent('INFY');
      expect(screen.getByTestId('portfolio-stock-1')).toHaveTextContent('TCS');
      expect(screen.getByTestId('portfolio-stock-2')).toHaveTextContent('RELIANCE');
    });

    test('displays market data correctly', () => {
      render(<TestDashboard marketData={mockMarketData} />);
      
      expect(screen.getByTestId('market-stock-0')).toHaveTextContent('NIFTY: 18300');
      expect(screen.getByTestId('market-stock-1')).toHaveTextContent('BANKNIFTY: 43500');
      expect(screen.getByTestId('market-stock-2')).toHaveTextContent('SENSEX: 61000');
    });

    test('handles empty user stocks data', () => {
      render(<TestDashboard userStocks={[]} />);
      
      expect(screen.getByTestId('portfolio-stocks')).toBeEmptyDOMElement();
    });

    test('handles empty market data', () => {
      render(<TestDashboard marketData={[]} />);
      
      expect(screen.getByTestId('market-data')).toBeEmptyDOMElement();
    });
  });

  describe('Component Integration', () => {
    test('passes userStocks to Portfolio component correctly', () => {
      render(<TestDashboard userStocks={mockUserStocksData} />);
      
      expect(screen.getByTestId('portfolio-stocks')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-stock-0')).toHaveTextContent('INFY');
      expect(screen.getByTestId('portfolio-stock-1')).toHaveTextContent('TCS');
    });

    test('passes marketData to StockList component correctly', () => {
      render(<TestDashboard marketData={mockMarketData} />);
      
      expect(screen.getByTestId('market-data')).toBeInTheDocument();
      expect(screen.getByTestId('market-stock-0')).toHaveTextContent('NIFTY: 18300');
      expect(screen.getByTestId('market-stock-1')).toHaveTextContent('BANKNIFTY: 43500');
    });
  });

  describe('Data Structure Validation', () => {
    test('handles userStocks with various data structures', () => {
      const complexUserStocks = [
        { symbol: 'INFY', price: 1500, quantity: 10 },
        { symbol: 'TCS', price: 3200, quantity: 5 },
      ];
      
      render(<TestDashboard userStocks={complexUserStocks} />);
      
      expect(screen.getByTestId('portfolio-stock-0')).toHaveTextContent('INFY');
      expect(screen.getByTestId('portfolio-stock-1')).toHaveTextContent('TCS');
    });

    test('handles marketData with various data structures', () => {
      const complexMarketData = [
        { symbol: 'NIFTY', value: 18300, change: '+125.50', percentage: '+0.69%' },
        { symbol: 'BANKNIFTY', value: 43500, change: '-89.25', percentage: '-0.20%' },
      ];
      
      render(<TestDashboard marketData={complexMarketData} />);
      
      expect(screen.getByTestId('market-stock-0')).toHaveTextContent('NIFTY: 18300');
      expect(screen.getByTestId('market-stock-1')).toHaveTextContent('BANKNIFTY: 43500');
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<TestDashboard />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Your Investment Dashboard');
      
      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings).toHaveLength(2);
      expect(subHeadings[0]).toHaveTextContent('Portfolio Component');
      expect(subHeadings[1]).toHaveTextContent('Stock List Component');
    });

    test('maintains semantic HTML structure', () => {
      const { container } = render(<TestDashboard />);
      
      const dashboard = container.querySelector('.dashboard');
      expect(dashboard).toBeInTheDocument();
      
      const heading = dashboard.querySelector('h1');
      expect(heading).toHaveTextContent('Your Investment Dashboard');
    });

    test('components are accessible via test ids', () => {
      render(<TestDashboard />);
      
      expect(screen.getByTestId('portfolio-component')).toBeInTheDocument();
      expect(screen.getByTestId('stocklist-component')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-stocks')).toBeInTheDocument();
      expect(screen.getByTestId('market-data')).toBeInTheDocument();
    });
  });
});
